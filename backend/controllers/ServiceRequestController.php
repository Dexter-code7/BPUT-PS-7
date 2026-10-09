<?php
// Phase 3: Digital Service Request Center Controller
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/audit.php';

class ServiceRequestController {

    /**
     * GET /services/catalog - List all active service types
     */
    public static function getCatalog(): void {
        AuthHelper::authenticate();
        $db = Database::getConnection();

        $stmt = $db->query("
            SELECT id, code, title, description, category, sla_hours, fee_amount, requires_purpose, requires_supporting_doc
            FROM service_types
            WHERE is_active = 1
            ORDER BY id ASC
        ");
        $services = $stmt->fetchAll();

        foreach ($services as &$s) {
            $s['fee_amount'] = (float)$s['fee_amount'];
            $s['sla_hours'] = (int)$s['sla_hours'];
            $s['requires_purpose'] = (bool)$s['requires_purpose'];
            $s['requires_supporting_doc'] = (bool)$s['requires_supporting_doc'];
        }

        Response::json([
            'services' => $services
        ]);
    }

    /**
     * GET /services/my-requests - Get current student's submitted requests
     */
    public static function getMyRequests(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $stmt = $db->prepare("
            SELECT sr.*,
                   st.title AS service_title,
                   st.code AS service_code,
                   st.category AS service_category,
                   st.sla_hours,
                   TIMESTAMPDIFF(HOUR, NOW(), sr.sla_deadline) AS hours_remaining,
                   TIMESTAMPDIFF(MINUTE, NOW(), sr.sla_deadline) AS minutes_remaining
            FROM service_requests sr
            JOIN service_types st ON sr.service_type_id = st.id
            WHERE sr.user_id = :user_id
            ORDER BY sr.created_at DESC
        ");
        $stmt->execute([':user_id' => $user['id']]);
        $requests = $stmt->fetchAll();

        foreach ($requests as &$r) {
            $r['erp_snapshot'] = json_decode($r['erp_snapshot'] ?? '{}', true);
            $r['additional_details'] = json_decode($r['additional_details'] ?? '{}', true);
            $r['hours_remaining'] = (int)$r['hours_remaining'];
            $r['is_overdue'] = $r['hours_remaining'] < 0 && in_array($r['status'], ['submitted', 'under_review']);
        }

        Response::json([
            'requests' => $requests
        ]);
    }

    /**
     * POST /services/apply - Submit a new service request with auto-locked ERP snapshot
     */
    public static function apply(): void {
        $user = AuthHelper::authenticate();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $serviceTypeId = (int)($body['service_type_id'] ?? 0);
        $purpose = trim($body['purpose'] ?? '');
        $additionalDetails = $body['additional_details'] ?? [];

        if ($serviceTypeId <= 0) {
            Response::error('Service type ID is required.', 400);
        }

        $db = Database::getConnection();

        // 1. Fetch Service Type
        $stStmt = $db->prepare("SELECT * FROM service_types WHERE id = :id AND is_active = 1 LIMIT 1");
        $stStmt->execute([':id' => $serviceTypeId]);
        $service = $stStmt->fetch();

        if (!$service) {
            Response::error('Invalid or inactive service type.', 404);
        }

        if ($service['requires_purpose'] && $purpose === '') {
            Response::error('Purpose of request is required for institutional record.', 400);
        }

        // 2. Build verified immutable ERP profile snapshot ("Fill Once, Use Everywhere")
        $erpSnapshot = [];
        $studentProfileId = null;

        if ($user['profile_type'] === 'student') {
            $spStmt = $db->prepare("
                SELECT sp.*, d.name AS department_name, p.name AS program_name
                FROM student_profiles sp
                LEFT JOIN departments d ON sp.department_id = d.id
                LEFT JOIN programs p ON sp.program_id = p.id
                WHERE sp.user_id = :user_id
                LIMIT 1
            ");
            $spStmt->execute([':user_id' => $user['id']]);
            $student = $spStmt->fetch();

            if ($student) {
                $studentProfileId = (int)$student['id'];
                $erpSnapshot = [
                    'full_name'           => ['label' => 'Full Name', 'value' => $student['full_name']],
                    'roll_number'         => ['label' => 'Roll Number', 'value' => $student['roll_number']],
                    'registration_number' => ['label' => 'Registration Number', 'value' => $student['registration_number']],
                    'program_name'        => ['label' => 'Program / Degree', 'value' => $student['program_name'] ?? 'Degree Program'],
                    'department_name'     => ['label' => 'Department', 'value' => $student['department_name'] ?? 'Academic Department'],
                    'current_semester'    => ['label' => 'Current Semester', 'value' => 'Semester ' . $student['current_semester']],
                    'section'             => ['label' => 'Section', 'value' => $student['section']],
                    'college_email'       => ['label' => 'Official Email', 'value' => $student['college_email']],
                    'phone_number'        => ['label' => 'Contact Number', 'value' => $student['phone_number']],
                    'father_name'         => ['label' => 'Father / Guardian', 'value' => $student['father_name']],
                    'hostel_resident'     => ['label' => 'Campus Residence', 'value' => !empty($student['hostel_resident']) ? ($student['hostel_name'] . ' ' . $student['room_number']) : 'Day Scholar']
                ];
            }
        } else {
            // Staff / Admin applicant or tester
            $erpSnapshot = [
                'full_name'           => ['label' => 'Full Name', 'value' => $user['username']],
                'roll_number'         => ['label' => 'Institutional ID', 'value' => 'EMP-' . str_pad((string)$user['id'], 4, '0', STR_PAD_LEFT)],
                'registration_number' => ['label' => 'Registry Code', 'value' => 'STAFF-' . strtoupper($user['role_name'])],
                'program_name'        => ['label' => 'Affiliation', 'value' => 'Campus Administration'],
                'department_name'     => ['label' => 'Department', 'value' => 'General Administration'],
                'current_semester'    => ['label' => 'Term', 'value' => 'Academic Term 2026-27'],
                'college_email'       => ['label' => 'Official Email', 'value' => $user['email']],
                'phone_number'        => ['label' => 'Contact Number', 'value' => '+91 98765 43200']
            ];
        }

        // 3. Generate Unique Request Number
        $year = date('Y');
        $random = strtoupper(bin2hex(random_bytes(2)));
        $reqNumber = "REQ-{$year}-{$random}";

        // 4. Calculate SLA Deadline
        $slaHours = (int)$service['sla_hours'];
        $slaDeadline = date('Y-m-d H:i:s', strtotime("+{$slaHours} hours"));

        // 5. Insert Request
        $insertStmt = $db->prepare("
            INSERT INTO service_requests (
                request_number, service_type_id, user_id, student_profile_id, erp_snapshot,
                purpose, additional_details, status, sla_deadline, created_at
            ) VALUES (
                :req_num, :service_id, :user_id, :student_id, :erp,
                :purpose, :details, 'submitted', :sla_deadline, NOW()
            )
        ");
        $insertStmt->execute([
            ':req_num'      => $reqNumber,
            ':service_id'   => $serviceTypeId,
            ':user_id'      => $user['id'],
            ':student_id'   => $studentProfileId,
            ':erp'          => json_encode($erpSnapshot),
            ':purpose'      => $purpose,
            ':details'      => json_encode($additionalDetails),
            ':sla_deadline' => $slaDeadline
        ]);

        $requestId = (int)$db->lastInsertId();

        // 6. Log Initial Timeline Entry
        $tlStmt = $db->prepare("
            INSERT INTO service_request_timeline (request_id, actor_user_id, action, previous_status, new_status, comment, created_at)
            VALUES (:req_id, :actor_id, 'Request Submitted', NULL, 'submitted', 'Application submitted with auto-verified ERP profile snapshot.', NOW())
        ");
        $tlStmt->execute([
            ':req_id'   => $requestId,
            ':actor_id' => $user['id']
        ]);

        // Audit Log
        AuditLogger::log((int)$user['id'], 'apply_service_request', 'service_requests', (string)$requestId, [
            'request_number' => $reqNumber,
            'service_title'  => $service['title']
        ]);

        Response::json([
            'request_id'     => $requestId,
            'request_number' => $reqNumber,
            'sla_deadline'   => $slaDeadline,
            'sla_hours'      => $slaHours,
            'service_title'  => $service['title']
        ], 201, 'Service application successfully lodged. Your verified credentials were sealed.');
    }

    /**
     * GET /services/requests - Admin & Faculty Service Desk Queue
     */
    public static function getRequests(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        // Check if user has permission or is staff/admin
        $isStaff = $user['profile_type'] === 'staff' || in_array($user['role_name'], ['system_admin', 'admin_staff', 'exam_admin', 'director', 'hod']);
        if (!$isStaff && !in_array('view_service_requests', $user['permissions'] ?? [])) {
            Response::error('Unauthorized to access institutional service desk queue.', 403);
        }

        $status = trim($_GET['status'] ?? 'all');
        $serviceTypeId = (int)($_GET['service_type_id'] ?? 0);
        $search = trim($_GET['search'] ?? '');

        $query = "
            SELECT sr.*,
                   st.title AS service_title,
                   st.code AS service_code,
                   st.category AS service_category,
                   st.sla_hours,
                   u.username, u.email AS user_email,
                   COALESCE(sp.full_name, u.username) AS submitter_name,
                   sp.roll_number, sp.registration_number,
                   d.name AS department_name, p.name AS program_name,
                   TIMESTAMPDIFF(HOUR, NOW(), sr.sla_deadline) AS hours_remaining
            FROM service_requests sr
            JOIN service_types st ON sr.service_type_id = st.id
            JOIN users u ON sr.user_id = u.id
            LEFT JOIN student_profiles sp ON sr.user_id = sp.user_id
            LEFT JOIN departments d ON sp.department_id = d.id
            LEFT JOIN programs p ON sp.program_id = p.id
            WHERE 1=1
        ";

        $params = [];

        if ($status !== '' && $status !== 'all') {
            $query .= " AND sr.status = :status";
            $params[':status'] = $status;
        }

        if ($serviceTypeId > 0) {
            $query .= " AND sr.service_type_id = :service_type_id";
            $params[':service_type_id'] = $serviceTypeId;
        }

        if ($search !== '') {
            $query .= " AND (sr.request_number LIKE :search OR sp.full_name LIKE :search OR sp.roll_number LIKE :search OR sr.purpose LIKE :search)";
            $params[':search'] = "%{$search}%";
        }

        $query .= " ORDER BY CASE sr.status WHEN 'submitted' THEN 1 WHEN 'under_review' THEN 2 WHEN 'ready' THEN 3 ELSE 4 END, sr.sla_deadline ASC";

        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $requests = $stmt->fetchAll();

        foreach ($requests as &$r) {
            $r['erp_snapshot'] = json_decode($r['erp_snapshot'] ?? '{}', true);
            $r['additional_details'] = json_decode($r['additional_details'] ?? '{}', true);
            $r['hours_remaining'] = (int)$r['hours_remaining'];
            $r['is_overdue'] = $r['hours_remaining'] < 0 && in_array($r['status'], ['submitted', 'under_review']);
        }

        // Summary Statistics for Administrative Dashboard
        $statStmt = $db->query("
            SELECT
                COUNT(*) AS total_count,
                SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) AS submitted_count,
                SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) AS under_review_count,
                SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) AS ready_count,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered_count,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count,
                SUM(CASE WHEN sla_deadline < NOW() AND status IN ('submitted', 'under_review') THEN 1 ELSE 0 END) AS overdue_count
            FROM service_requests
        ");
        $stats = $statStmt->fetch();

        Response::json([
            'requests' => $requests,
            'stats'    => [
                'total'        => (int)($stats['total_count'] ?? 0),
                'submitted'    => (int)($stats['submitted_count'] ?? 0),
                'under_review' => (int)($stats['under_review_count'] ?? 0),
                'ready'        => (int)($stats['ready_count'] ?? 0),
                'delivered'    => (int)($stats['delivered_count'] ?? 0),
                'rejected'     => (int)($stats['rejected_count'] ?? 0),
                'overdue'      => (int)($stats['overdue_count'] ?? 0),
            ]
        ]);
    }

    /**
     * GET /services/detail&id={id} - Complete Request Dossier with Timeline History
     */
    public static function getRequestDetail(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $requestId = (int)($_GET['id'] ?? 0);
        if ($requestId <= 0) {
            Response::error('Invalid request ID.', 400);
        }

        $stmt = $db->prepare("
            SELECT sr.*,
                   st.title AS service_title,
                   st.code AS service_code,
                   st.category AS service_category,
                   st.sla_hours,
                   u.username, u.email AS user_email,
                   COALESCE(sp.full_name, u.username) AS submitter_name,
                   sp.roll_number, sp.registration_number,
                   d.name AS department_name, p.name AS program_name,
                   staff_u.username AS assigned_staff_username,
                   TIMESTAMPDIFF(HOUR, NOW(), sr.sla_deadline) AS hours_remaining
            FROM service_requests sr
            JOIN service_types st ON sr.service_type_id = st.id
            JOIN users u ON sr.user_id = u.id
            LEFT JOIN student_profiles sp ON sr.user_id = sp.user_id
            LEFT JOIN departments d ON sp.department_id = d.id
            LEFT JOIN programs p ON sp.program_id = p.id
            LEFT JOIN users staff_u ON sr.assigned_staff_id = staff_u.id
            WHERE sr.id = :id
            LIMIT 1
        ");
        $stmt->execute([':id' => $requestId]);
        $request = $stmt->fetch();

        if (!$request) {
            Response::error('Service request not found.', 404);
        }

        // Authorization check: owner or staff/admin
        $isOwner = (int)$request['user_id'] === (int)$user['id'];
        $isStaff = $user['profile_type'] === 'staff' || in_array($user['role_name'], ['system_admin', 'admin_staff', 'exam_admin', 'director', 'hod']);

        if (!$isOwner && !$isStaff) {
            Response::error('Unauthorized to view this request.', 403);
        }

        $request['erp_snapshot'] = json_decode($request['erp_snapshot'] ?? '{}', true);
        $request['additional_details'] = json_decode($request['additional_details'] ?? '{}', true);
        $request['hours_remaining'] = (int)$request['hours_remaining'];
        $request['is_overdue'] = $request['hours_remaining'] < 0 && in_array($request['status'], ['submitted', 'under_review']);

        // Timeline History
        $tlStmt = $db->prepare("
            SELECT srt.*, u.username AS actor_username, r.display_name AS actor_role
            FROM service_request_timeline srt
            JOIN users u ON srt.actor_user_id = u.id
            JOIN roles r ON u.primary_role_id = r.id
            WHERE srt.request_id = :req_id
            ORDER BY srt.created_at ASC
        ");
        $tlStmt->execute([':req_id' => $requestId]);
        $timeline = $tlStmt->fetchAll();

        Response::json([
            'request'  => $request,
            'timeline' => $timeline
        ]);
    }

    /**
     * POST /services/update-status - Move Request through Lifecycle
     */
    public static function updateStatus(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        // RBAC check: staff / admin only
        $isStaff = $user['profile_type'] === 'staff' || in_array($user['role_name'], ['system_admin', 'admin_staff', 'exam_admin', 'director', 'hod']);
        if (!$isStaff && !in_array('manage_service_requests', $user['permissions'] ?? [])) {
            Response::error('Unauthorized to process institutional service requests.', 403);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $requestId = (int)($body['request_id'] ?? 0);
        $newStatus = trim($body['status'] ?? '');
        $comment = trim($body['comment'] ?? '');
        $rejectionReason = trim($body['rejection_reason'] ?? '');

        if ($requestId <= 0) {
            Response::error('Request ID is required.', 400);
        }

        $allowedStatuses = ['submitted', 'under_review', 'action_required', 'ready_for_pickup', 'ready', 'delivered', 'rejected'];
        if (!in_array($newStatus, $allowedStatuses)) {
            Response::error('Invalid lifecycle status.', 400);
        }

        // Map 'ready' to 'ready_for_pickup' for physical collection workflow
        if ($newStatus === 'ready') {
            $newStatus = 'ready_for_pickup';
        }

        $stmt = $db->prepare("SELECT * FROM service_requests WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $requestId]);
        $req = $stmt->fetch();

        if (!$req) {
            Response::error('Service request not found.', 404);
        }

        $prevStatus = $req['status'];
        $certNum = $req['certificate_number'];
        $issuedAt = $req['issued_at'];
        $deliveredAt = $req['delivered_at'];

        // Physical collection fields
        $pickupDate = !empty($body['pickup_date']) ? trim($body['pickup_date']) : $req['pickup_date'];
        $pickupSlot = !empty($body['pickup_slot']) ? trim($body['pickup_slot']) : ($req['pickup_slot'] ?: '10:00 AM – 01:00 PM (Counter Session)');
        $pickupLocation = !empty($body['pickup_location']) ? trim($body['pickup_location']) : ($req['pickup_location'] ?: 'Administrative Block — Counter Window 3 (Academic & Certificates Desk)');
        $pickupSlipToken = $req['pickup_slip_token'];

        // Missing data fields
        $missingInfo = !empty($body['missing_info_requested']) ? trim($body['missing_info_requested']) : $req['missing_info_requested'];
        $visitDate = !empty($body['verification_visit_date']) ? trim($body['verification_visit_date']) : $req['verification_visit_date'];
        $visitVenue = !empty($body['verification_venue']) ? trim($body['verification_venue']) : ($req['verification_venue'] ?: 'Administrative Block — Verification Counter 1');

        // Handover fields
        $handoverOfficerId = $req['handover_officer_id'];
        $handoverNotes = $req['handover_notes'];

        // When scheduled for physical pickup: issue certificate number and pass token
        if ($newStatus === 'ready_for_pickup') {
            if (empty($certNum)) {
                $year = date('Y');
                $randNum = str_pad((string)random_int(100, 9999), 4, '0', STR_PAD_LEFT);
                $certNum = "CUT/CERT/{$year}/{$randNum}";
                $issuedAt = date('Y-m-d H:i:s');
            }
            if (empty($pickupSlipToken)) {
                $pickupSlipToken = 'PASS-' . date('Y') . '-CUT-' . str_pad((string)$requestId, 4, '0', STR_PAD_LEFT);
            }
            if (empty($pickupDate)) {
                $pickupDate = date('Y-m-d', strtotime('+2 days'));
            }
        }

        if ($newStatus === 'delivered') {
            $deliveredAt = date('Y-m-d H:i:s');
            $handoverOfficerId = (int)$user['id'];
            $handoverNotes = $comment ?: 'Document physically verified, stamped with official university seal, and handed over to candidate.';
        }

        $updateStmt = $db->prepare("
            UPDATE service_requests
            SET status = :status,
                assigned_staff_id = :staff_id,
                admin_notes = :notes,
                rejection_reason = :rejection,
                certificate_number = :cert_num,
                issued_at = :issued_at,
                delivered_at = :delivered_at,
                pickup_date = :pickup_date,
                pickup_slot = :pickup_slot,
                pickup_location = :pickup_location,
                pickup_slip_token = :pickup_token,
                missing_info_requested = :missing_info,
                verification_visit_date = :visit_date,
                verification_venue = :visit_venue,
                handover_officer_id = :handover_officer,
                handover_notes = :handover_notes,
                updated_at = NOW()
            WHERE id = :id
        ");
        $updateStmt->execute([
            ':status'           => $newStatus,
            ':staff_id'         => $user['id'],
            ':notes'            => $comment ?: $req['admin_notes'],
            ':rejection'        => $newStatus === 'rejected' ? ($rejectionReason ?: 'Application criteria not met.') : null,
            ':cert_num'         => $certNum,
            ':issued_at'        => $issuedAt,
            ':delivered_at'     => $deliveredAt,
            ':pickup_date'      => $pickupDate,
            ':pickup_slot'      => $pickupSlot,
            ':pickup_location'  => $pickupLocation,
            ':pickup_token'     => $pickupSlipToken,
            ':missing_info'     => $missingInfo,
            ':visit_date'       => $visitDate,
            ':visit_venue'      => $visitVenue,
            ':handover_officer' => $handoverOfficerId,
            ':handover_notes'   => $handoverNotes,
            ':id'               => $requestId
        ]);

        // Append to Timeline
        $actionName = match ($newStatus) {
            'under_review'     => 'Marked Under Review',
            'action_required'  => 'Extra Data / In-Person Visit Requested',
            'ready_for_pickup' => 'Approved & Scheduled for Physical Collection',
            'delivered'        => 'Physical Stamp & Signature Handed Over',
            'rejected'         => 'Application Rejected',
            default            => 'Status Updated'
        };

        $timelineComment = $comment;
        if ($newStatus === 'ready_for_pickup') {
            $timelineComment = "Scheduled for physical pickup on {$pickupDate} ({$pickupSlot}) at {$pickupLocation}. Pass: {$pickupSlipToken}";
        } elseif ($newStatus === 'action_required') {
            $timelineComment = "Action needed: {$missingInfo}. Report in person on {$visitDate} at {$visitVenue}.";
        } elseif ($newStatus === 'delivered') {
            $timelineComment = $handoverNotes;
        }

        $tStmt = $db->prepare("
            INSERT INTO service_request_timeline (request_id, actor_user_id, action, previous_status, new_status, comment, created_at)
            VALUES (:req_id, :actor_id, :action, :prev_status, :new_status, :comment, NOW())
        ");
        $tStmt->execute([
            ':req_id'      => $requestId,
            ':actor_id'    => $user['id'],
            ':action'      => $actionName,
            ':prev_status' => $prevStatus,
            ':new_status'  => $newStatus,
            ':comment'     => $timelineComment
        ]);

        // Audit Log
        AuditLogger::log((int)$user['id'], 'update_service_status', 'service_requests', (string)$requestId, [
            'previous_status' => $prevStatus,
            'new_status'      => $newStatus,
            'certificate_no'  => $certNum,
            'pickup_date'     => $pickupDate
        ]);

        Response::json([
            'request_id'         => $requestId,
            'previous_status'    => $prevStatus,
            'new_status'         => $newStatus,
            'certificate_number' => $certNum,
            'pickup_date'        => $pickupDate,
            'pickup_slot'        => $pickupSlot,
            'pickup_location'    => $pickupLocation,
            'pickup_slip_token'  => $pickupSlipToken
        ], 200, "Request moved to {$newStatus}. Physical pickup details updated.");
    }

    /**
     * POST /services/respond-action - Student submits response / acknowledges visit for missing info
     */
    public static function respondAction(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $requestId = (int)($body['request_id'] ?? 0);
        $responseText = trim($body['response'] ?? '');

        if ($requestId <= 0 || $responseText === '') {
            Response::error('Request ID and response text are required.', 400);
        }

        $stmt = $db->prepare("SELECT * FROM service_requests WHERE id = :id AND user_id = :user_id LIMIT 1");
        $stmt->execute([':id' => $requestId, ':user_id' => $user['id']]);
        $req = $stmt->fetch();

        if (!$req) {
            Response::error('Service request not found or unauthorized.', 404);
        }

        // Update response and move back to under_review
        $upStmt = $db->prepare("
            UPDATE service_requests
            SET student_response_data = :resp,
                status = 'under_review',
                updated_at = NOW()
            WHERE id = :id
        ");
        $upStmt->execute([
            ':resp' => $responseText,
            ':id'   => $requestId
        ]);

        // Timeline entry
        $tStmt = $db->prepare("
            INSERT INTO service_request_timeline (request_id, actor_user_id, action, previous_status, new_status, comment, created_at)
            VALUES (:req_id, :actor_id, 'Student Submitted Additional Context', 'action_required', 'under_review', :comment, NOW())
        ");
        $tStmt->execute([
            ':req_id'  => $requestId,
            ':actor_id'=> $user['id'],
            ':comment' => $responseText
        ]);

        Response::json([
            'request_id' => $requestId,
            'status'     => 'under_review'
        ], 200, 'Additional information recorded. Application returned to review queue.');
    }

    /**
     * GET /services/pickup-pass&id={id} - Physical Collection Pass & Token
     */
    public static function getPickupPass(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $requestId = (int)($_GET['id'] ?? 0);
        if ($requestId <= 0) {
            Response::error('Invalid request ID.', 400);
        }

        $stmt = $db->prepare("
            SELECT sr.*,
                   st.title AS service_title,
                   st.category AS service_category,
                   u.username, u.email AS user_email
            FROM service_requests sr
            JOIN service_types st ON sr.service_type_id = st.id
            JOIN users u ON sr.user_id = u.id
            WHERE sr.id = :id
            LIMIT 1
        ");
        $stmt->execute([':id' => $requestId]);
        $req = $stmt->fetch();

        if (!$req) {
            Response::error('Service request record not found.', 404);
        }

        $isOwner = (int)$req['user_id'] === (int)$user['id'];
        $isStaff = $user['profile_type'] === 'staff' || in_array($user['role_name'], ['system_admin', 'admin_staff', 'exam_admin', 'director', 'hod']);

        if (!$isOwner && !$isStaff) {
            Response::error('Unauthorized to view this collection pass.', 403);
        }

        $erp = json_decode($req['erp_snapshot'] ?? '{}', true);

        Response::json([
            'pass' => [
                'institution'       => 'CENTRAL UNIVERSITY OF TECHNOLOGY',
                'sub_header'        => 'Central Dispatch & Physical Verification Counter',
                'slip_token'        => $req['pickup_slip_token'] ?: ('PASS-' . date('Y') . '-CUT-' . str_pad((string)$req['id'], 4, '0', STR_PAD_LEFT)),
                'request_number'    => $req['request_number'],
                'certificate_number'=> $req['certificate_number'],
                'service_title'     => $req['service_title'],
                'student_name'      => $erp['full_name']['value'] ?? $req['username'],
                'roll_number'       => $erp['roll_number']['value'] ?? '—',
                'program_name'      => $erp['program_name']['value'] ?? 'Degree Program',
                'department_name'   => $erp['department_name']['value'] ?? 'Academic Department',
                'pickup_date'       => $req['pickup_date'] ?: date('Y-m-d', strtotime('+1 day')),
                'pickup_slot'       => $req['pickup_slot'] ?: '10:00 AM – 01:00 PM',
                'pickup_location'   => $req['pickup_location'] ?: 'Administrative Block — Counter Window 3',
                'purpose'           => $req['purpose'],
                'status'            => $req['status'],
                'issued_at'         => $req['issued_at'] ?? $req['created_at'],
                'instructions'      => [
                    'Bring your physical Institutional Student ID card for identity verification.',
                    'Original hard copy will be stamped with the official University Wet Seal and Registrar Signature.',
                    'Sign the dispatch register at the counter upon receiving the physical document.'
                ]
            ]
        ]);
    }

    /**
     * GET /services/certificate&id={id} - Official Certificate Data Payload
     */
    public static function getCertificate(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $requestId = (int)($_GET['id'] ?? 0);
        if ($requestId <= 0) {
            Response::error('Invalid request ID.', 400);
        }

        $stmt = $db->prepare("
            SELECT sr.*,
                   st.title AS service_title,
                   st.code AS service_code,
                   st.category AS service_category,
                   u.username, u.email AS user_email
            FROM service_requests sr
            JOIN service_types st ON sr.service_type_id = st.id
            JOIN users u ON sr.user_id = u.id
            WHERE sr.id = :id
            LIMIT 1
        ");
        $stmt->execute([':id' => $requestId]);
        $req = $stmt->fetch();

        if (!$req) {
            Response::error('Certificate record not found.', 404);
        }

        if (!in_array($req['status'], ['ready_for_pickup', 'ready', 'delivered'])) {
            Response::error('Certificate has not been approved or issued yet.', 400);
        }

        $isOwner = (int)$req['user_id'] === (int)$user['id'];
        $isStaff = $user['profile_type'] === 'staff' || in_array($user['role_name'], ['system_admin', 'admin_staff', 'exam_admin', 'director', 'hod']);

        if (!$isOwner && !$isStaff) {
            Response::error('Unauthorized to view this certificate.', 403);
        }

        $erp = json_decode($req['erp_snapshot'] ?? '{}', true);

        Response::json([
            'certificate' => [
                'institution'       => 'CENTRAL UNIVERSITY OF TECHNOLOGY',
                'sub_header'        => 'Office of the Central Registrar & Academic Affairs',
                'campus_location'   => 'Bhubaneswar, Odisha — 751024, India',
                'certificate_number'=> $req['certificate_number'],
                'service_code'      => $req['service_code'],
                'service_title'     => $req['service_title'],
                'issued_at'         => $req['issued_at'] ?? $req['created_at'],
                'student_name'      => $erp['full_name']['value'] ?? $req['username'],
                'roll_number'       => $erp['roll_number']['value'] ?? '—',
                'registration_no'   => $erp['registration_number']['value'] ?? '—',
                'program_name'      => $erp['program_name']['value'] ?? 'Degree Program',
                'department_name'   => $erp['department_name']['value'] ?? 'Academic Department',
                'current_semester'  => $erp['current_semester']['value'] ?? 'Active Term',
                'purpose'           => $req['purpose'],
                'verification_hash' => hash('sha256', ($req['certificate_number'] ?? '') . ($req['id'] ?? '') . 'CUT_SEAL_2026'),
                'signatory_title'   => 'Registrar / Controller of Examinations',
                'signatory_name'    => 'Dr. Radhakrishnan Pillai',
            ]
        ]);
    }
}
