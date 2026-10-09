<?php
// Phase 4 Migration & Seed Script: Targeted Announcements & Notification System
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

try {
    $db = Database::getConnection();
    echo "Connecting to collegelife_db for Phase 4 migration...\n";

    // 1. Run DDL
    $sql = file_get_contents(__DIR__ . '/phase4_notices.sql');
    $db->exec($sql);
    echo "Tables 'notices' and 'notice_reads' created successfully.\n";

    // 2. Fetch User IDs for Seeding
    $userStmt = $db->query("SELECT id, username FROM users");
    $users = $userStmt->fetchAll(PDO::FETCH_KEY_PAIR); // [username => id]

    $directorId = $users['director'] ?? 2;
    $hodCseId = $users['hod_cse'] ?? 3;
    $wardenId = $users['warden_singh'] ?? 7;
    $examAdminId = $users['exam_admin'] ?? 6;
    $adminStaffId = $users['admin_staff'] ?? 5;
    $priyaCrId = $users['priya_cr'] ?? 9;
    $ashishId = $users['ashish'] ?? 8;
    $aaravId = $users['aarav_club'] ?? 10;

    // 3. Clear existing notices to allow clean re-runs
    $db->exec("DELETE FROM notice_reads");
    $db->exec("DELETE FROM notices");

    // 4. Seed Realistic Targeted Institutional Notices
    $insertNotice = $db->prepare("
        INSERT INTO notices (
            notice_number, title, content, category, priority, is_pinned,
            requires_acknowledgment, target_scope, department_id, program_id,
            semester, section, hostel_name, target_tag_id, author_user_id,
            reference_circular_no, attachment_name, attachment_url, attachment_size,
            expires_at, status, created_at
        ) VALUES (
            :notice_number, :title, :content, :category, :priority, :is_pinned,
            :requires_acknowledgment, :target_scope, :department_id, :program_id,
            :semester, :section, :hostel_name, :target_tag_id, :author_user_id,
            :reference_circular_no, :attachment_name, :attachment_url, :attachment_size,
            :expires_at, 'published', :created_at
        )
    ");

    $notices = [
        [
            'notice_number' => 'CUT/NOT/2026/001',
            'title' => 'Mandatory Anti-Ragging Institutional Undertaking & Supreme Court Compliance Guidelines (2026-27)',
            'content' => "In accordance with the directives of the Hon'ble Supreme Court of India and UGC Regulations on Curbing the Menace of Ragging in Higher Educational Institutions, all enrolled students across undergraduate and postgraduate programmes are hereby mandated to submit their annual Anti-Ragging Affidavit.\n\nFailure to record your institutional acknowledgment and verify your online submission reference before the stipulated deadline shall attract formal administrative inquiry and potential debarment from hostel amenities and semester examinations.\n\nAll students must read the attached statutory circular and formally record their acknowledgment on this ERP portal.",
            'category' => 'administrative',
            'priority' => 'urgent',
            'is_pinned' => 1,
            'requires_acknowledgment' => 1,
            'target_scope' => 'all',
            'department_id' => null,
            'program_id' => null,
            'semester' => null,
            'section' => null,
            'hostel_name' => null,
            'target_tag_id' => null,
            'author_user_id' => $directorId,
            'reference_circular_no' => 'CUT/DIR/CIR/2026/041',
            'attachment_name' => 'UGC_Anti_Ragging_Statutory_Compliance_Directive.pdf',
            'attachment_url' => '/documents/statutory/UGC_Anti_Ragging_2026.pdf',
            'attachment_size' => '1.8 MB',
            'expires_at' => '2026-11-30',
            'created_at' => '2026-10-01 09:30:00'
        ],
        [
            'notice_number' => 'CUT/NOT/2026/002',
            'title' => 'Autumn End-Semester 2026 Examination Registration Deadline & Hall Ticket Window',
            'content' => "The Controller of Examinations announces that the online examination form verification and clearance window for the Autumn End-Semester 2026 session will close strictly at 05:00 PM IST on October 25, 2026.\n\nKey Directives:\n1. Minimum 75% aggregate lecture attendance across registered theory courses is non-negotiable for admit card issuance.\n2. Fee clearance receipt must reflect verified zero outstanding in the Finance Module.\n3. Physical Hall Tickets / Admit Cards will be distributed via designated department counters beginning October 28, 2026 upon physical presentation of the Student ID Card.\n\nAll eligible candidates must acknowledge this circular.",
            'category' => 'examination',
            'priority' => 'circular',
            'is_pinned' => 1,
            'requires_acknowledgment' => 1,
            'target_scope' => 'all',
            'department_id' => null,
            'program_id' => null,
            'semester' => null,
            'section' => null,
            'hostel_name' => null,
            'target_tag_id' => null,
            'author_user_id' => $examAdminId,
            'reference_circular_no' => 'CUT/COE/EXAM/2026/088',
            'attachment_name' => 'EndSem_Autumn2026_Exam_Instructions_Rulebook.pdf',
            'attachment_url' => '/documents/exams/EndSem_Autumn2026_Instructions.pdf',
            'attachment_size' => '2.4 MB',
            'expires_at' => '2026-10-25',
            'created_at' => '2026-10-03 11:15:00'
        ],
        [
            'notice_number' => 'CUT/NOT/2026/003',
            'title' => 'Department of CSE: Mid-Term Laboratory Practical Assessment & Code Audit Schedule',
            'content' => "Attention: Students of Computer Science & Engineering (All Semesters).\n\nThe Departmental Academic Committee will conduct the Mid-Term Practical Evaluation and Code Audit from October 18 to October 21, 2026 in Computing Labs 102 & 204.\n\nAll students must bring:\n1. Physical Practical Record File signed by respective lab mentors.\n2. GitHub repository access for all lab submissions.\n3. Verified student ID card.",
            'category' => 'academic',
            'priority' => 'important',
            'is_pinned' => 0,
            'requires_acknowledgment' => 0,
            'target_scope' => 'department',
            'department_id' => 1, // CSE
            'program_id' => null,
            'semester' => null, // All semesters of CSE
            'section' => null,
            'hostel_name' => null,
            'target_tag_id' => null,
            'author_user_id' => $hodCseId,
            'reference_circular_no' => 'CUT/CSE/HOD/2026/119',
            'attachment_name' => 'CSE_MidTerm_Lab_Evaluation_Roster.pdf',
            'attachment_url' => '/documents/cse/CSE_Lab_Schedule.pdf',
            'attachment_size' => '1.4 MB',
            'expires_at' => '2026-10-22',
            'created_at' => '2026-10-05 14:00:00'
        ],
        [
            'notice_number' => 'CUT/NOT/2026/004',
            'title' => 'Hostel Inspection & Electrical Safety Compliance — Boys Hostel Block B',
            'content' => "This notice is strictly directed to all residents of Boys Hostel Block B.\n\nA joint inspection team led by the Chief Hostel Warden and Campus Electrical Engineer will conduct room checks on Saturday, October 14, 2026 starting at 10:00 AM.\n\nAll residents are instructed to be present with their room keys and institutional identity cards. High-power heating appliances are strictly prohibited under hostel bylaws.",
            'category' => 'hostel_mess',
            'priority' => 'important',
            'is_pinned' => 0,
            'requires_acknowledgment' => 1,
            'target_scope' => 'hostel',
            'department_id' => null,
            'program_id' => null,
            'semester' => null,
            'section' => null,
            'hostel_name' => 'Boys Hostel Block B',
            'target_tag_id' => null,
            'author_user_id' => $wardenId,
            'reference_circular_no' => 'CUT/HW/BHB/2026/054',
            'attachment_name' => 'Hostel_Safety_Bylaws_2026.pdf',
            'attachment_url' => '/documents/hostel/BoysHostel_B_Bylaws.pdf',
            'attachment_size' => '890 KB',
            'expires_at' => '2026-10-15',
            'created_at' => '2026-10-06 16:45:00'
        ],
        [
            'notice_number' => 'CUT/NOT/2026/005',
            'title' => 'Distinguished Guest Lecture on Cloud Computing Systems — Venue Update (Section A)',
            'content' => "Dear Classmates (Department of CSE, Semester 1, Section A),\n\nPlease note that tomorrow's distinguished guest lecture by Dr. Arindam Mitra (Principal Systems Architect) has been shifted to Seminar Hall 2 (Aryabhatta Complex) due to audiovisual setup.\n\nReporting time is 02:15 PM sharp. Attendance is compulsory and will count towards formal course credits.",
            'category' => 'academic',
            'priority' => 'normal',
            'is_pinned' => 0,
            'requires_acknowledgment' => 0,
            'target_scope' => 'section',
            'department_id' => 1, // CSE
            'program_id' => null,
            'semester' => 1,
            'section' => 'A',
            'hostel_name' => null,
            'target_tag_id' => null,
            'author_user_id' => $priyaCrId, // CR Priya Patel
            'reference_circular_no' => 'CUT/CSE/CR/2026/007',
            'attachment_name' => null,
            'attachment_url' => null,
            'attachment_size' => null,
            'expires_at' => '2026-10-10',
            'created_at' => '2026-10-07 10:20:00'
        ],
        [
            'notice_number' => 'CUT/NOT/2026/006',
            'title' => 'Campus Placement & Industry Internship Registration Sprint 2026',
            'content' => "The Central Training & Placement Cell invites eligible students across all engineering branches to register on the National Career Portal.\n\nKey Dates:\n- Registration Window Opens: October 10, 2026\n- Resume Verification Counter: Administrative Block, Desk 4\n- Mandatory Pre-Placement Talk: Central Auditorium, October 16 at 11:00 AM.\n\nPlease verify that your verified ERP profile snapshot reflects updated contact info.",
            'category' => 'placement',
            'priority' => 'important',
            'is_pinned' => 0,
            'requires_acknowledgment' => 0,
            'target_scope' => 'department',
            'department_id' => 1, // CSE
            'program_id' => null,
            'semester' => null,
            'section' => null,
            'hostel_name' => null,
            'target_tag_id' => null,
            'author_user_id' => $adminStaffId,
            'reference_circular_no' => 'CUT/TPO/2026/302',
            'attachment_name' => 'Campus_Placement_Roadmap_2026.pdf',
            'attachment_url' => '/documents/placement/TPO_Roadmap_2026.pdf',
            'attachment_size' => '3.1 MB',
            'expires_at' => '2026-10-16',
            'created_at' => '2026-10-07 15:30:00'
        ],
        [
            'notice_number' => 'CUT/NOT/2026/007',
            'title' => 'Academic Senate Consultation Meeting with All Elected Class Representatives (CRs)',
            'content' => "This directive is exclusively addressed to all officially recognized Class Representatives (CRs).\n\nThe Director will chair a special consultative session with student representatives on Friday, October 17, 2026 at 04:00 PM in the Senate Council Chamber.\n\nAgenda:\n1. Feedback on lecture delivery and laboratory equipment adequacy.\n2. Winter festival planning committee nominations.\n3. Student grievance redressal turnaround times.",
            'category' => 'administrative',
            'priority' => 'urgent',
            'is_pinned' => 1,
            'requires_acknowledgment' => 1,
            'target_scope' => 'tag',
            'department_id' => null,
            'program_id' => null,
            'semester' => null,
            'section' => null,
            'hostel_name' => null,
            'target_tag_id' => 1, // Class Representative tag
            'author_user_id' => $directorId,
            'reference_circular_no' => 'CUT/DIR/SENATE/2026/012',
            'attachment_name' => 'Senate_Consultation_Agenda_October2026.pdf',
            'attachment_url' => '/documents/senate/CR_Meeting_Agenda.pdf',
            'attachment_size' => '650 KB',
            'expires_at' => '2026-10-18',
            'created_at' => '2026-10-08 08:00:00'
        ]
    ];

    foreach ($notices as $n) {
        $insertNotice->execute([
            ':notice_number' => $n['notice_number'],
            ':title' => $n['title'],
            ':content' => $n['content'],
            ':category' => $n['category'],
            ':priority' => $n['priority'],
            ':is_pinned' => $n['is_pinned'],
            ':requires_acknowledgment' => $n['requires_acknowledgment'],
            ':target_scope' => $n['target_scope'],
            ':department_id' => $n['department_id'],
            ':program_id' => $n['program_id'],
            ':semester' => $n['semester'],
            ':section' => $n['section'],
            ':hostel_name' => $n['hostel_name'],
            ':target_tag_id' => $n['target_tag_id'],
            ':author_user_id' => $n['author_user_id'],
            ':reference_circular_no' => $n['reference_circular_no'],
            ':attachment_name' => $n['attachment_name'],
            ':attachment_url' => $n['attachment_url'],
            ':attachment_size' => $n['attachment_size'],
            ':expires_at' => $n['expires_at'],
            ':created_at' => $n['created_at']
        ]);
    }
    echo "Seeded " . count($notices) . " official notices across multiple audience scopes.\n";

    // 5. Seed Read & Acknowledgment Audit Records
    $stmtN1 = $db->query("SELECT id FROM notices WHERE notice_number = 'CUT/NOT/2026/001'");
    $n1Id = (int)$stmtN1->fetchColumn();

    $stmtN2 = $db->query("SELECT id FROM notices WHERE notice_number = 'CUT/NOT/2026/002'");
    $n2Id = (int)$stmtN2->fetchColumn();

    $stmtN7 = $db->query("SELECT id FROM notices WHERE notice_number = 'CUT/NOT/2026/007'");
    $n7Id = (int)$stmtN7->fetchColumn();

    $insertRead = $db->prepare("
        INSERT INTO notice_reads (notice_id, user_id, first_read_at, acknowledged_at, acknowledgment_note, ip_address)
        VALUES (:notice_id, :user_id, :first_read_at, :acknowledged_at, :note, '127.0.0.1')
    ");

    // Priya acknowledged Notice 1 (Anti-Ragging) and Notice 7 (CR meeting)
    $insertRead->execute([
        ':notice_id' => $n1Id,
        ':user_id' => $priyaCrId,
        ':first_read_at' => '2026-10-02 10:14:22',
        ':acknowledged_at' => '2026-10-02 10:15:05',
        ':note' => 'Understood and UGC portal reference recorded'
    ]);

    $insertRead->execute([
        ':notice_id' => $n7Id,
        ':user_id' => $priyaCrId,
        ':first_read_at' => '2026-10-08 09:30:00',
        ':acknowledged_at' => '2026-10-08 09:32:15',
        ':note' => 'Will attend with Section A agenda points'
    ]);

    // Priya also read Notice 2
    $insertRead->execute([
        ':notice_id' => $n2Id,
        ':user_id' => $priyaCrId,
        ':first_read_at' => '2026-10-04 14:20:00',
        ':acknowledged_at' => '2026-10-04 14:22:10',
        ':note' => 'Cleared exam rules'
    ]);

    // Ashish has read Notice 2 but NOT acknowledged yet; Notice 1 is unread/unacknowledged for Ashish
    $insertRead->execute([
        ':notice_id' => $n2Id,
        ':user_id' => $ashishId,
        ':first_read_at' => '2026-10-05 08:30:00',
        ':acknowledged_at' => null, // Read but not acknowledged
        ':note' => null
    ]);

    echo "Seeded initial read and acknowledgment receipts for audit testing.\n";
    echo "Phase 4 migration completed successfully!\n";

} catch (\Throwable $e) {
    echo "Migration Error: " . $e->getMessage() . "\n";
    exit(1);
}
