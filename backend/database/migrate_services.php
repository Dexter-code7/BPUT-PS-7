<?php
// Phase 3: Digital Service Request Center Migration & Seed
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

try {
    $pdo = Database::getConnection();
    echo "Connected to database collegelife_db.\n";

    // 1. Run Schema
    $sql = file_get_contents(__DIR__ . '/phase3_services.sql');
    $pdo->exec($sql);
    echo "Phase 3 tables created successfully.\n";

    // 2. Seed Service Catalog
    $check = $pdo->query("SELECT COUNT(*) FROM service_types")->fetchColumn();
    if ($check == 0) {
        echo "Seeding service catalog...\n";
        $stmt = $pdo->prepare("
            INSERT INTO service_types (code, title, description, category, sla_hours, fee_amount, requires_purpose, requires_supporting_doc)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $services = [
            [
                'bonafide',
                'Bonafide Student Certificate',
                'Official institutional certificate confirming current enrollment, academic term, program of study, and valid student status for banks, visas, or travel concessions.',
                'Academic',
                24,
                0.00,
                1,
                0
            ],
            [
                'fee_structure',
                'Official Fee Structure Certificate',
                'Certified breakdown of academic tuition, laboratory, examination, and hostel fees required for bank education loan disbursements or corporate sponsorships.',
                'Financial',
                24,
                0.00,
                1,
                0
            ],
            [
                'character_cert',
                'Conduct & Character Certificate',
                'Attestation of good moral character, disciplinary standing, and campus conduct issued by the Office of the Dean of Student Welfare.',
                'Conduct',
                48,
                0.00,
                1,
                0
            ],
            [
                'noc_internship',
                'No Objection Certificate (NOC) for Internship / Industrial Training',
                'Formal institutional authorization permitting the student to participate in external corporate internships or academic research during vacation or off-campus terms.',
                'Academic',
                48,
                0.00,
                1,
                0
            ],
            [
                'duplicate_id',
                'Duplicate Student Identity Card & Smart Pass',
                'Replacement of lost, damaged, or stolen physical institutional smart card pass. Requires declaration of loss and processing fee.',
                'Identity',
                72,
                100.00,
                1,
                1
            ],
            [
                'course_completion',
                'Provisional Course Completion & Medium of Instruction Attestation',
                'Official letter certifying English medium of instruction, completion of credit requirements, and expected convocation standing for higher education admissions.',
                'Academic',
                72,
                0.00,
                1,
                0
            ]
        ];

        foreach ($services as $s) {
            $stmt->execute($s);
        }
        echo "Seeded " . count($services) . " service types.\n";
    }

    // 3. Ensure permissions exist
    $permissions = [
        ['apply_service_request', 'Apply for official student certificates and service requests', 'services'],
        ['view_service_requests', 'View institutional service requests desk', 'services'],
        ['manage_service_requests', 'Review, approve, and issue official certificates', 'services'],
    ];

    $permStmt = $pdo->prepare("
        INSERT INTO permissions (name, description, module)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE description = VALUES(description), module = VALUES(module)
    ");

    foreach ($permissions as $p) {
        $permStmt->execute($p);
    }
    echo "Permissions registered.\n";

    // Grant apply to students and CRs
    $grantStmt = $pdo->prepare("
        INSERT IGNORE INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE p.name = 'apply_service_request' AND r.name IN ('student', 'class_representative')
    ");
    $grantStmt->execute();

    // Grant review/manage to administrative and faculty roles
    $grantStaffStmt = $pdo->prepare("
        INSERT IGNORE INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE p.name IN ('view_service_requests', 'manage_service_requests')
          AND r.name IN ('system_admin', 'admin_staff', 'exam_admin', 'director', 'hod')
    ");
    $grantStaffStmt->execute();
    echo "Role permissions mapped.\n";

    // 4. Seed sample requests for Ashish (User ID 8)
    $reqCheck = $pdo->query("SELECT COUNT(*) FROM service_requests")->fetchColumn();
    if ($reqCheck == 0) {
        echo "Seeding initial service requests for demo...\n";

        // Fetch Ashish student profile
        $ashishProfile = $pdo->query("
            SELECT sp.*, d.name as department_name, p.name as program_name
            FROM student_profiles sp
            LEFT JOIN departments d ON sp.department_id = d.id
            LEFT JOIN programs p ON sp.program_id = p.id
            WHERE sp.user_id = 8
            LIMIT 1
        ")->fetch();

        if ($ashishProfile) {
            $erpSnapshot = [
                'full_name'           => ['label' => 'Full Name', 'value' => $ashishProfile['full_name']],
                'roll_number'         => ['label' => 'Roll Number', 'value' => $ashishProfile['roll_number']],
                'registration_number' => ['label' => 'Registration Number', 'value' => $ashishProfile['registration_number']],
                'program_name'        => ['label' => 'Program / Degree', 'value' => $ashishProfile['program_name']],
                'department_name'     => ['label' => 'Department', 'value' => $ashishProfile['department_name']],
                'current_semester'    => ['label' => 'Current Semester', 'value' => 'Semester ' . $ashishProfile['current_semester']],
                'college_email'       => ['label' => 'Official Email', 'value' => $ashishProfile['college_email']],
                'phone_number'        => ['label' => 'Contact Number', 'value' => $ashishProfile['phone_number']],
            ];

            // Request 1: Bonafide Certificate - Ready for Download
            $req1Stmt = $pdo->prepare("
                INSERT INTO service_requests (
                    request_number, service_type_id, user_id, student_profile_id, erp_snapshot,
                    purpose, status, assigned_staff_id, sla_deadline, certificate_number, issued_at, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR), ?, NOW(), DATE_SUB(NOW(), INTERVAL 6 HOUR))
            ");
            $req1Stmt->execute([
                'REQ-2026-0814',
                1, // Bonafide
                8, // Ashish
                $ashishProfile['id'],
                json_encode($erpSnapshot),
                'State Bank of India — Application for National Education Loan Scheme (Ref: SBI-EDU-88219)',
                'ready',
                3, // Admin staff
                'CUT/CERT/2026/0814',
            ]);
            $req1Id = $pdo->lastInsertId();

            // Timeline for Request 1
            $tStmt = $pdo->prepare("
                INSERT INTO service_request_timeline (request_id, actor_user_id, action, previous_status, new_status, comment, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $tStmt->execute([$req1Id, 8, 'Request Submitted', null, 'submitted', 'Application submitted with verified ERP profile snapshot.', date('Y-m-d H:i:s', strtotime('-6 hours'))]);
            $tStmt->execute([$req1Id, 3, 'Under Review', 'submitted', 'under_review', 'Verified student enrollment with Department of Computer Science & Engineering records.', date('Y-m-d H:i:s', strtotime('-3 hours'))]);
            $tStmt->execute([$req1Id, 3, 'Certificate Issued', 'under_review', 'ready', 'Digital Bonafide Certificate generated and digitally signed by Central Registrar.', date('Y-m-d H:i:s', strtotime('-1 hour'))]);

            // Request 2: NOC for Summer Internship - Under Review
            $req2Stmt = $pdo->prepare("
                INSERT INTO service_requests (
                    request_number, service_type_id, user_id, student_profile_id, erp_snapshot,
                    purpose, additional_details, status, assigned_staff_id, sla_deadline, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 42 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR))
            ");
            $req2Stmt->execute([
                'REQ-2026-0815',
                4, // NOC
                8, // Ashish
                $ashishProfile['id'],
                json_encode($erpSnapshot),
                'Summer Industrial Training at Tata Consultancy Services (TCS Innovation Labs, Bhubaneswar)',
                json_encode(['company' => 'Tata Consultancy Services', 'duration' => '8 Weeks (May-July 2026)', 'mode' => 'Hybrid']),
                'under_review',
                3, // Admin staff
            ]);
            $req2Id = $pdo->lastInsertId();

            $tStmt->execute([$req2Id, 8, 'Request Submitted', null, 'submitted', 'NOC application submitted for summer internship.', date('Y-m-d H:i:s', strtotime('-4 hours'))]);
            $tStmt->execute([$req2Id, 3, 'Faculty Endorsement Pending', 'submitted', 'under_review', 'Forwarded to HOD CSE for department attendance clearance.', date('Y-m-d H:i:s', strtotime('-2 hours'))]);

            echo "Initial service requests seeded successfully.\n";
        }
    }

    echo "Migration completed successfully!\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
