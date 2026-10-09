<?php
// Unified Campus ERP - Smart Forms Engine Controller
// "Fill Once, Use Everywhere"
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/audit.php';

class SmartFormController {

    // ERP Field Dictionary with Institutional Display Labels
    public static array $erpFieldDictionary = [
        'full_name'           => 'Full Name',
        'roll_number'         => 'Roll Number',
        'registration_number' => 'Registration Number',
        'admission_number'    => 'Admission Number',
        'department_name'     => 'Department',
        'program_name'        => 'Program / Degree',
        'current_semester'    => 'Current Semester',
        'current_year'        => 'Academic Year',
        'section'             => 'Section',
        'college_email'       => 'Institutional Email',
        'personal_email'      => 'Personal Email',
        'phone_number'        => 'Student Mobile',
        'father_name'         => "Father's Name",
        'mother_name'         => "Mother's Name",
        'guardian_name'       => 'Guardian Name',
        'parent_phone'        => 'Parent / Guardian Phone',
        'permanent_address'   => 'Permanent Residential Address',
        'hostel_resident'     => 'Hostel Resident Status',
        'hostel_name'         => 'Hostel Block',
        'room_number'         => 'Room Number',
        'blood_group'         => 'Blood Group',
        'academic_status'     => 'Academic Standing',
    ];

    /**
     * GET /forms - List smart forms
     */
    public static function listForms(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $category = $_GET['category'] ?? null;
        if ($category === 'undefined' || $category === 'all' || $category === '') {
            $category = null;
        }

        $search = trim($_GET['search'] ?? '');
        if ($search === 'undefined') {
            $search = '';
        }

        $status = $_GET['status'] ?? null;
        if ($status === 'undefined' || $status === 'all' || $status === '') {
            $status = null;
        }

        $query = "
            SELECT sf.*,
                   u.username AS creator_username,
                   COALESCE(sp.full_name, stp.full_name, u.username) AS creator_name,
                   r.display_name AS creator_role,
                   (SELECT COUNT(*) FROM smart_form_submissions sfs WHERE sfs.form_id = sf.id) AS submission_count,
                   (SELECT COUNT(*) FROM smart_form_submissions sfs WHERE sfs.form_id = sf.id AND sfs.user_id = :current_user_id) AS has_submitted
            FROM smart_forms sf
            JOIN users u ON sf.creator_id = u.id
            JOIN roles r ON u.primary_role_id = r.id
            LEFT JOIN staff_profiles sp ON u.id = sp.user_id
            LEFT JOIN student_profiles stp ON u.id = stp.user_id
            WHERE 1=1
        ";

        $params = [':current_user_id' => $user['id']];

        // If regular student, show published forms that match target scope
        $isStaff = $user['profile_type'] === 'staff' || in_array($user['role_name'], ['system_admin', 'admin_staff', 'exam_admin', 'director', 'hod', 'teacher']);
        $hasCreatePerm = in_array('create_form', $user['permissions'] ?? []) || in_array('view_form_submissions', $user['permissions'] ?? []);

        if (!$isStaff && !$hasCreatePerm) {
            $query .= " AND sf.status = 'published'";
        } elseif ($status) {
            $query .= " AND sf.status = :status";
            $params[':status'] = $status;
        }

        if ($category && $category !== 'all') {
            $query .= " AND sf.category = :category";
            $params[':category'] = $category;
        }

        if ($search !== '') {
            $query .= " AND (sf.title LIKE :search OR sf.description LIKE :search)";
            $params[':search'] = "%{$search}%";
        }

        $query .= " ORDER BY sf.created_at DESC";

        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $forms = $stmt->fetchAll();

        foreach ($forms as &$f) {
            $f['erp_fields'] = json_decode($f['erp_fields'] ?? '[]', true);
            $f['has_submitted'] = (int)$f['has_submitted'] > 0;
            $f['submission_count'] = (int)$f['submission_count'];
        }

        // Except standard student, everyone can make forms (or if student has special tag like CR)
        $canCreate = ($user['role_name'] !== 'student') || in_array('create_form', $user['permissions'] ?? []);

        Response::json([
            'forms' => $forms,
            'can_create' => $canCreate,
            'erp_dictionary' => self::$erpFieldDictionary
        ]);
    }

    /**
     * GET /forms/detail&id={id} - Get form details and locked ERP profile values
     */
    public static function getFormDetail(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $formId = (int)($_GET['id'] ?? 0);
        if ($formId <= 0) {
            Response::error('Invalid or missing form ID.', 400);
        }

        $stmt = $db->prepare("
            SELECT sf.*,
                   u.username AS creator_username,
                   COALESCE(sp.full_name, stp.full_name, u.username) AS creator_name,
                   r.display_name AS creator_role
            FROM smart_forms sf
            JOIN users u ON sf.creator_id = u.id
            JOIN roles r ON u.primary_role_id = r.id
            LEFT JOIN staff_profiles sp ON u.id = sp.user_id
            LEFT JOIN student_profiles stp ON u.id = stp.user_id
            WHERE sf.id = :id
            LIMIT 1
        ");
        $stmt->execute([':id' => $formId]);
        $form = $stmt->fetch();

        if (!$form) {
            Response::error('Form not found.', 404);
        }

        $form['erp_fields'] = json_decode($form['erp_fields'] ?? '[]', true);
        if (!is_array($form['erp_fields']) || empty($form['erp_fields'])) {
            $form['erp_fields'] = ['full_name', 'roll_number', 'program_name', 'current_semester', 'college_email', 'phone_number'];
        }

        // Fetch custom questions
        $fieldStmt = $db->prepare("
            SELECT * FROM smart_form_fields
            WHERE form_id = :form_id
            ORDER BY order_index ASC, id ASC
        ");
        $fieldStmt->execute([':form_id' => $formId]);
        $fields = $fieldStmt->fetchAll();

        foreach ($fields as &$fld) {
            $fld['options'] = json_decode($fld['options'] ?? '[]', true);
            $fld['is_required'] = (bool)$fld['is_required'];
        }

        // Build locked ERP profile values for the authenticated user ("Fill Once")
        $lockedErpValues = [];
        if ($user['profile_type'] === 'student') {
            $studentProfileStmt = $db->prepare("
                SELECT sp.*, d.name AS department_name, p.name AS program_name
                FROM student_profiles sp
                LEFT JOIN departments d ON sp.department_id = d.id
                LEFT JOIN programs p ON sp.program_id = p.id
                WHERE sp.user_id = :user_id
                LIMIT 1
            ");
            $studentProfileStmt->execute([':user_id' => $user['id']]);
            $rawStudent = $studentProfileStmt->fetch();

            if ($rawStudent) {
                foreach ($form['erp_fields'] as $erpKey) {
                    $val = $rawStudent[$erpKey] ?? '';
                    if ($erpKey === 'hostel_resident') {
                        $val = !empty($rawStudent['hostel_resident']) ? 'Hostel Resident' : 'Day Scholar';
                    }
                    if (empty($val)) {
                        if ($erpKey === 'college_email') $val = $user['email'];
                        elseif ($erpKey === 'full_name') $val = $user['username'];
                    }
                    $lockedErpValues[$erpKey] = [
                        'key'   => $erpKey,
                        'label' => self::$erpFieldDictionary[$erpKey] ?? ucfirst(str_replace('_', ' ', $erpKey)),
                        'value' => (string)$val,
                        'locked'=> true,
                    ];
                }
            } else {
                // Student user without profile row yet - fallback to user data
                foreach ($form['erp_fields'] as $erpKey) {
                    $val = '';
                    if ($erpKey === 'full_name') $val = $user['username'];
                    elseif ($erpKey === 'college_email') $val = $user['email'];
                    elseif ($erpKey === 'roll_number') $val = 'STU-' . str_pad((string)$user['id'], 6, '0', STR_PAD_LEFT);
                    else $val = 'Enrolled Student';

                    $lockedErpValues[$erpKey] = [
                        'key'   => $erpKey,
                        'label' => self::$erpFieldDictionary[$erpKey] ?? ucfirst(str_replace('_', ' ', $erpKey)),
                        'value' => (string)$val,
                        'locked'=> true,
                    ];
                }
            }
        } else {
            // Staff / Faculty / Director preview & fill mode
            $staffProfileStmt = $db->prepare("
                SELECT sp.*, d.name AS department_name
                FROM staff_profiles sp
                LEFT JOIN departments d ON sp.department_id = d.id
                WHERE sp.user_id = :user_id
                LIMIT 1
            ");
            $staffProfileStmt->execute([':user_id' => $user['id']]);
            $rawStaff = $staffProfileStmt->fetch() ?: [];

            foreach ($form['erp_fields'] as $erpKey) {
                $val = '';
                if ($erpKey === 'full_name') $val = $rawStaff['full_name'] ?? $user['username'];
                elseif ($erpKey === 'college_email') $val = $rawStaff['official_email'] ?? $user['email'];
                elseif ($erpKey === 'phone_number') $val = $rawStaff['phone_number'] ?? '+91 98765 43200';
                elseif ($erpKey === 'department_name') $val = $rawStaff['department_name'] ?? 'General Administration';
                elseif ($erpKey === 'roll_number' || $erpKey === 'admission_number') $val = $rawStaff['employee_code'] ?? 'EMP-STAFF-001';
                elseif ($erpKey === 'registration_number') $val = 'REG-' . ($rawStaff['employee_code'] ?? 'STAFF');
                elseif ($erpKey === 'program_name') $val = 'Executive Directorate';
                elseif ($erpKey === 'current_semester') $val = 'Term 1';
                elseif ($erpKey === 'section') $val = 'Officer Wing';
                elseif ($erpKey === 'blood_group') $val = 'O+ (Verified)';
                elseif ($erpKey === 'room_number' || $erpKey === 'hostel_name') $val = $rawStaff['cabin_location'] ?? 'Room 1 Directorate Wing';
                elseif ($erpKey === 'academic_status') $val = 'Regular / Permanent Staff';
                elseif ($erpKey === 'father_name') $val = 'Official Record on File';
                elseif ($erpKey === 'parent_phone') $val = $rawStaff['phone_number'] ?? '+91 98765 43200';
                else $val = 'Institutional Record';

                $lockedErpValues[$erpKey] = [
                    'key'   => $erpKey,
                    'label' => self::$erpFieldDictionary[$erpKey] ?? ucfirst(str_replace('_', ' ', $erpKey)),
                    'value' => (string)$val,
                    'locked'=> true,
                ];
            }
        }


        // Check if user has already submitted
        $subStmt = $db->prepare("
            SELECT * FROM smart_form_submissions
            WHERE form_id = :form_id AND user_id = :user_id
            ORDER BY id DESC
            LIMIT 1
        ");
        $subStmt->execute([
            ':form_id' => $formId,
            ':user_id' => $user['id']
        ]);
        $existingSub = $subStmt->fetch();

        if ($existingSub) {
            $existingSub['erp_snapshot'] = json_decode($existingSub['erp_snapshot'] ?? '{}', true);
            $existingSub['answers'] = json_decode($existingSub['answers'] ?? '{}', true);
        }

        Response::json([
            'form'               => $form,
            'fields'             => $fields,
            'locked_erp_values'  => $lockedErpValues,
            'existing_submission'=> $existingSub,
            'is_creator'         => (int)$form['creator_id'] === (int)$user['id'],
            'can_manage'         => (int)$form['creator_id'] === (int)$user['id'] || $user['role_name'] === 'system_admin'
        ]);
    }

    /**
     * POST /forms/submit - Submit responses with automatic locked ERP snapshot
     */
    public static function submitForm(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $formId = (int)($body['form_id'] ?? 0);
        $answers = $body['answers'] ?? [];

        if ($formId <= 0) {
            Response::error('Form ID is required.', 400);
        }

        // 1. Verify form exists and is published
        $stmt = $db->prepare("SELECT * FROM smart_forms WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $formId]);
        $form = $stmt->fetch();

        if (!$form) {
            Response::error('Form not found.', 404);
        }

        if ($form['status'] !== 'published') {
            Response::error('This form is not currently accepting submissions (Status: ' . $form['status'] . ').', 400);
        }

        // 2. Enforce one-submission rule if applicable
        if (empty($form['allow_multiple_submissions'])) {
            $checkStmt = $db->prepare("SELECT COUNT(*) FROM smart_form_submissions WHERE form_id = :form_id AND user_id = :user_id");
            $checkStmt->execute([':form_id' => $formId, ':user_id' => $user['id']]);
            if ((int)$checkStmt->fetchColumn() > 0) {
                Response::error('You have already submitted this form. Multiple submissions are not permitted.', 400);
            }
        }

        // 3. Automatically construct immutable ERP Snapshot directly from database ("Fill Once, Use Everywhere")
        $erpSnapshot = [];
        $erpKeys = json_decode($form['erp_fields'] ?? '[]', true);
        if (empty($erpKeys)) {
            $erpKeys = ['full_name', 'roll_number', 'program_name', 'current_semester', 'college_email', 'phone_number'];
        }

        if (!empty($erpKeys)) {
            $studentStmt = $db->prepare("
                SELECT sp.*, d.name AS department_name, p.name AS program_name
                FROM student_profiles sp
                LEFT JOIN departments d ON sp.department_id = d.id
                LEFT JOIN programs p ON sp.program_id = p.id
                WHERE sp.user_id = :user_id
                LIMIT 1
            ");
            $studentStmt->execute([':user_id' => $user['id']]);
            $student = $studentStmt->fetch();

            if ($student) {
                foreach ($erpKeys as $k) {
                    $val = $student[$k] ?? '';
                    if ($k === 'hostel_resident') {
                        $val = !empty($student['hostel_resident']) ? 'Hostel Resident' : 'Day Scholar';
                    }
                    $erpSnapshot[$k] = [
                        'label' => self::$erpFieldDictionary[$k] ?? ucfirst(str_replace('_', ' ', $k)),
                        'value' => (string)$val
                    ];
                }
            } else {
                // For non-student or staff testing, snapshot user username/email
                $erpSnapshot['full_name'] = ['label' => 'Full Name', 'value' => $user['username']];
                $erpSnapshot['college_email'] = ['label' => 'Institutional Email', 'value' => $user['email']];
            }
        }

        // 4. Validate required custom fields
        $fieldStmt = $db->prepare("SELECT * FROM smart_form_fields WHERE form_id = :form_id");
        $fieldStmt->execute([':form_id' => $formId]);
        $customFields = $fieldStmt->fetchAll();

        foreach ($customFields as $cf) {
            $key = $cf['field_key'];
            if ($cf['is_required']) {
                $val = $answers[$key] ?? null;
                if ($val === null || $val === '' || (is_array($val) && empty($val))) {
                    Response::error("Required field '{$cf['label']}' cannot be empty.", 400);
                }
            }
        }

        // 5. Insert Submission
        $insertStmt = $db->prepare("
            INSERT INTO smart_form_submissions (form_id, user_id, erp_snapshot, answers, status, submitted_at)
            VALUES (:form_id, :user_id, :erp_snapshot, :answers, 'submitted', NOW())
        ");
        $insertStmt->execute([
            ':form_id'      => $formId,
            ':user_id'      => $user['id'],
            ':erp_snapshot' => json_encode($erpSnapshot),
            ':answers'      => json_encode($answers),
        ]);

        $submissionId = (int)$db->lastInsertId();

        // Audit log
        AuditLogger::log((int)$user['id'], 'submit_smart_form', 'smart_forms', (string)$formId, [
            'submission_id' => $submissionId,
            'form_title'    => $form['title'],
        ]);

        Response::json([
            'submission_id' => $submissionId,
            'form_id'       => $formId,
            'erp_snapshot'  => $erpSnapshot,
            'submitted_at'  => date('c')
        ], 201, 'Form response successfully recorded. Verified identity fields were auto-locked.');
    }

    /**
     * POST /forms/create - Create a new smart form with ERP field selector and custom questions
     */
    public static function createForm(): void {
        $user = AuthHelper::authenticate();

        // RBAC check: except student, everyone can make forms (or if student has tag like CR)
        $canCreate = ($user['role_name'] !== 'student') || in_array('create_form', $user['permissions'] ?? []);
        if (!$canCreate) {
            Response::error('Students are not permitted to create official Smart Forms. Only faculty, administration, and authorized coordinators can design forms.', 403);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $title = trim($body['title'] ?? '');
        $description = trim($body['description'] ?? '');
        $category = trim($body['category'] ?? 'General');
        $targetScope = trim($body['target_scope'] ?? 'all');
        $erpFields = $body['erp_fields'] ?? [];
        $fields = $body['fields'] ?? [];

        if ($title === '') {
            Response::error('Form title is required.', 400);
        }

        if (empty($erpFields) && empty($fields)) {
            Response::error('Form must include at least one ERP profile field or custom question.', 400);
        }

        $db = Database::getConnection();

        // 1. Create Smart Form
        $stmt = $db->prepare("
            INSERT INTO smart_forms (creator_id, title, description, category, status, target_scope, erp_fields, allow_multiple_submissions)
            VALUES (:creator_id, :title, :description, :category, 'published', :target_scope, :erp_fields, :allow_multiple_submissions)
        ");
        $stmt->execute([
            ':creator_id'                 => $user['id'],
            ':title'                      => $title,
            ':description'                => $description,
            ':category'                   => $category,
            ':target_scope'               => $targetScope,
            ':erp_fields'                 => json_encode($erpFields),
            ':allow_multiple_submissions' => !empty($body['allow_multiple_submissions']) ? 1 : 0
        ]);

        $formId = (int)$db->lastInsertId();

        // 2. Insert Custom Questions
        $fieldStmt = $db->prepare("
            INSERT INTO smart_form_fields (form_id, field_key, label, field_type, help_text, options, is_required, order_index)
            VALUES (:form_id, :field_key, :label, :field_type, :help_text, :options, :is_required, :order_index)
        ");

        foreach ($fields as $idx => $f) {
            $label = trim($f['label'] ?? '');
            if ($label === '') continue;

            $key = preg_replace('/[^a-z0-9_]/', '', strtolower(str_replace(' ', '_', $label)));
            if (empty($key)) $key = 'question_' . ($idx + 1);

            $fieldStmt->execute([
                ':form_id'     => $formId,
                ':field_key'   => $key,
                ':label'       => $label,
                ':field_type'  => $f['field_type'] ?? 'text',
                ':help_text'   => $f['help_text'] ?? null,
                ':options'     => !empty($f['options']) ? json_encode($f['options']) : null,
                ':is_required' => !empty($f['is_required']) ? 1 : 0,
                ':order_index' => $idx + 1
            ]);
        }

        // Audit log
        AuditLogger::log((int)$user['id'], 'create_smart_form', 'smart_forms', (string)$formId, ['title' => $title]);

        Response::json([
            'form_id' => $formId,
            'title'   => $title,
            'message' => 'Smart Form successfully published.'
        ], 201);
    }

    /**
     * GET /forms/submissions&form_id={id} - View all submissions for a form
     */
    public static function getSubmissions(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $formId = (int)($_GET['form_id'] ?? 0);
        if ($formId <= 0) {
            Response::error('Form ID is required.', 400);
        }

        // Check ownership or permission
        $formStmt = $db->prepare("SELECT * FROM smart_forms WHERE id = :id LIMIT 1");
        $formStmt->execute([':id' => $formId]);
        $form = $formStmt->fetch();

        if (!$form) {
            Response::error('Form not found.', 404);
        }

        $canView = (int)$form['creator_id'] === (int)$user['id']
            || in_array('view_form_submissions', $user['permissions'] ?? [])
            || $user['role_name'] === 'system_admin';

        if (!$canView) {
            Response::error('You do not have permission to view submissions for this form.', 403);
        }

        // Fetch custom field definitions to know column headers
        $fStmt = $db->prepare("SELECT * FROM smart_form_fields WHERE form_id = :form_id ORDER BY order_index ASC");
        $fStmt->execute([':form_id' => $formId]);
        $fields = $fStmt->fetchAll();

        // Fetch submissions
        $subStmt = $db->prepare("
            SELECT sfs.*, u.username, u.email,
                   COALESCE(sp.full_name, stp.full_name, u.username) AS submitter_name,
                   stp.roll_number, stp.registration_number, stp.section,
                   d.name AS department_name, p.name AS program_name
            FROM smart_form_submissions sfs
            JOIN users u ON sfs.user_id = u.id
            LEFT JOIN student_profiles stp ON u.id = stp.user_id
            LEFT JOIN staff_profiles sp ON u.id = sp.user_id
            LEFT JOIN departments d ON stp.department_id = d.id
            LEFT JOIN programs p ON stp.program_id = p.id
            WHERE sfs.form_id = :form_id
            ORDER BY sfs.submitted_at DESC
        ");
        $subStmt->execute([':form_id' => $formId]);
        $submissions = $subStmt->fetchAll();

        foreach ($submissions as &$s) {
            $s['erp_snapshot'] = json_decode($s['erp_snapshot'] ?? '{}', true);
            $s['answers'] = json_decode($s['answers'] ?? '{}', true);
        }

        Response::json([
            'form'        => $form,
            'fields'      => $fields,
            'submissions' => $submissions,
            'total_count' => count($submissions)
        ]);
    }

    /**
     * GET /forms/export-csv&form_id={id} - Download submissions as CSV
     */
    public static function exportCsv(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $formId = (int)($_GET['form_id'] ?? 0);
        if ($formId <= 0) {
            Response::error('Form ID is required.', 400);
        }

        $formStmt = $db->prepare("SELECT * FROM smart_forms WHERE id = :id LIMIT 1");
        $formStmt->execute([':id' => $formId]);
        $form = $formStmt->fetch();

        if (!$form) {
            Response::error('Form not found.', 404);
        }

        $canView = (int)$form['creator_id'] === (int)$user['id']
            || in_array('view_form_submissions', $user['permissions'] ?? [])
            || $user['role_name'] === 'system_admin';

        if (!$canView) {
            Response::error('Unauthorized to export submissions.', 403);
        }

        $erpKeys = json_decode($form['erp_fields'] ?? '[]', true);

        $fStmt = $db->prepare("SELECT * FROM smart_form_fields WHERE form_id = :form_id ORDER BY order_index ASC");
        $fStmt->execute([':form_id' => $formId]);
        $customFields = $fStmt->fetchAll();

        $subStmt = $db->prepare("
            SELECT * FROM smart_form_submissions
            WHERE form_id = :form_id
            ORDER BY submitted_at ASC
        ");
        $subStmt->execute([':form_id' => $formId]);
        $submissions = $subStmt->fetchAll();

        // Output CSV
        $filename = 'form_' . $formId . '_responses_' . date('Ymd_His') . '.csv';
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');

        $output = fopen('php://output', 'w');

        // CSV Header Row
        $header = ['Submission ID', 'Submitted Date'];
        foreach ($erpKeys as $ek) {
            $header[] = '[V] ' . (self::$erpFieldDictionary[$ek] ?? ucfirst(str_replace('_', ' ', $ek)));
        }
        foreach ($customFields as $cf) {
            $header[] = $cf['label'];
        }
        fputcsv($output, $header);

        // Rows
        foreach ($submissions as $sub) {
            $erp = json_decode($sub['erp_snapshot'] ?? '{}', true);
            $ans = json_decode($sub['answers'] ?? '{}', true);

            $row = [
                $sub['id'],
                $sub['submitted_at'],
            ];

            foreach ($erpKeys as $ek) {
                $row[] = $erp[$ek]['value'] ?? '';
            }

            foreach ($customFields as $cf) {
                $val = $ans[$cf['field_key']] ?? '';
                if (is_array($val)) $val = implode(', ', $val);
                $row[] = (string)$val;
            }

            fputcsv($output, $row);
        }

        fclose($output);
        exit;
    }
}
