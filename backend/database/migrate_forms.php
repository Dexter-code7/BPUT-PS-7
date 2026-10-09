<?php
// Phase 2: Smart Forms Engine Migration & Seed Script
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

try {
    $pdo = Database::getConnection();
    echo "Connected to database collegelife_db.\n";

    // 1. Run Schema
    $sql = file_get_contents(__DIR__ . '/phase2_forms.sql');
    $pdo->exec($sql);
    echo "Smart Forms tables created successfully.\n";

    // 2. Check if default forms already exist
    $check = $pdo->query("SELECT COUNT(*) FROM smart_forms")->fetchColumn();
    if ($check == 0) {
        echo "Seeding initial smart forms...\n";

        // Form 1: Merit Scholarship (by Prof. Sharma - User ID 4)
        $stmt = $pdo->prepare("
            INSERT INTO smart_forms (id, creator_id, title, description, category, status, target_scope, erp_fields, allow_multiple_submissions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            1,
            4,
            'Autumn 2026 Merit Scholarship & Tuition Assistance Application',
            'Official institutional scholarship application for eligible students in Autumn Term. Verified student identity fields are automatically locked from your university profile.',
            'Scholarship',
            'published',
            'all',
            json_encode([
                'full_name',
                'roll_number',
                'registration_number',
                'program_name',
                'current_semester',
                'college_email',
                'phone_number',
                'father_name',
                'parent_phone'
            ]),
            0
        ]);

        // Fields for Form 1
        $fieldStmt = $pdo->prepare("
            INSERT INTO smart_form_fields (form_id, field_key, label, field_type, help_text, options, is_required, order_index)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $fieldStmt->execute([1, 'annual_income', 'Gross Family Annual Income (in INR)', 'number', 'Combined annual income of parents/guardians from all sources', null, 1, 1]);
        $fieldStmt->execute([1, 'cgpa_last_sem', 'Previous Qualifying Examination CGPA or Percentage', 'text', 'e.g., 8.75 CGPA or 84.5%', null, 1, 2]);
        $fieldStmt->execute([1, 'category_quota', 'Social Category / Admission Quota', 'select', 'Select your verified category', json_encode(['General', 'OBC-NCL', 'SC', 'ST', 'EWS']), 1, 3]);
        $fieldStmt->execute([1, 'financial_need_statement', 'Statement of Need & Extenuating Financial Background', 'textarea', 'Explain briefly why you are applying for institutional tuition fee assistance', null, 1, 4]);
        $fieldStmt->execute([1, 'income_cert_no', 'Revenue Office Income Certificate Number', 'text', 'Certificate serial number as issued by Tehsildar / District Magistrate', null, 0, 5]);
        $fieldStmt->execute([1, 'accuracy_declaration', 'I confirm that all financial particulars submitted above are true and complete under penalty of disciplinary action.', 'consent', null, null, 1, 6]);

        // Form 2: MCA Elective Preference (by Priya Patel, CR - User ID 9)
        $stmt->execute([
            2,
            9,
            'MCA Section 1A Elective Course Preference & Lab Infrastructure Feedback',
            'Class Representative batch consultation for Section 1A ahead of the upcoming Department Academic Committee review meeting.',
            'Academic',
            'published',
            'program',
            json_encode([
                'full_name',
                'roll_number',
                'college_email',
                'current_semester',
                'section'
            ]),
            0
        ]);

        $fieldStmt->execute([2, 'elective_preference', 'Preferred Specialization Elective for Semester 2', 'radio', 'Select your highest priority specialization track', json_encode(['Cloud Architecture & Kubernetes Orchestration', 'Deep Learning & Natural Language Processing', 'Cyber Forensics & Zero-Trust Defense']), 1, 1]);
        $fieldStmt->execute([2, 'lab_infrastructure_feedback', 'Systems & Database Lab Hardware Performance Rating', 'select', 'Evaluate current terminal capabilities in Lab Block A-104', json_encode(['Excellent (Zero Latency & Updated Toolchains)', 'Adequate (Meets Curriculum Requirements)', 'Needs RAM & Linux GPU Upgrade']), 1, 2]);
        $fieldStmt->execute([2, 'cr_batch_suggestions', 'Additional Class Suggestions for Faculty Coordinator', 'textarea', 'Enter any scheduling or laboratory accessibility feedback for the HOD', null, 0, 3]);

        // Form 3: Hostel Winter Break Outstation Declaration (by Col. Singh, Warden - User ID 7)
        $stmt->execute([
            3,
            7,
            'Hostel Resident Winter Break Outstation Departure Declaration',
            'Mandatory institutional declaration for all hostel boarders proceeding on vacation during winter break. Gate passes will be issued against verified submissions.',
            'Hostel',
            'published',
            'all',
            json_encode([
                'full_name',
                'roll_number',
                'hostel_name',
                'room_number',
                'phone_number',
                'parent_phone'
            ]),
            0
        ]);

        $fieldStmt->execute([3, 'departure_date', 'Scheduled Date of Campus Departure', 'date', 'Date on which you will exit hostel gate', null, 1, 1]);
        $fieldStmt->execute([3, 'expected_return_date', 'Anticipated Date of Return to Campus', 'date', 'Must be before Autumn term recommencement', null, 1, 2]);
        $fieldStmt->execute([3, 'vacation_contact_address', 'Emergency Contact Person Name & Contact Number during Leave', 'text', 'Parent/Guardian details at home location', null, 1, 3]);
        $fieldStmt->execute([3, 'key_handover_consent', 'I undertake to lock all personal lockers and deposit room keys with the hostel caretaker prior to departure.', 'consent', null, null, 1, 4]);

        echo "Seeded 3 master smart forms with custom fields successfully.\n";
    } else {
        echo "Smart forms already seeded ({$check} forms present).\n";
    }

    echo "Migration completed successfully!\n";
} catch (\Throwable $e) {
    echo "Migration error: " . $e->getMessage() . "\n";
    exit(1);
}
