<?php
// Unified Campus ERP - Phase 6 Migration & Seeder Script
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

try {
    $db = Database::getConnection();
    echo "Beginning Phase 6 Exam System Migration...\n";

    // 1. Run Schema
    $sql = file_get_contents(__DIR__ . '/phase6_exams.sql');
    $db->exec($sql);
    try {
        $db->exec("ALTER TABLE exam_marks ADD UNIQUE KEY uq_exam_course_student (exam_session_id, course_id, student_profile_id)");
    } catch (\Throwable $e) {}
    try {
        $db->exec("ALTER TABLE student_semester_summaries ADD UNIQUE KEY uq_exam_student (exam_session_id, student_profile_id)");
    } catch (\Throwable $e) {}
    echo "[OK] Exam tables verified & created.\n";

    // 2. Seed Master Courses for MCA (Prog ID: 1) and B.Tech CSE (Prog ID: 2)
    $courses = [
        // MCA Sem 1 (Prog 1, Dept 1)
        ['code' => 'MCA101', 'name' => 'Advanced Data Structures & Algorithms', 'dept' => 1, 'prog' => 1, 'sem' => 1, 'cr' => 4, 'int' => 40, 'ext' => 60],
        ['code' => 'MCA102', 'name' => 'Relational Database Management Systems', 'dept' => 1, 'prog' => 1, 'sem' => 1, 'cr' => 4, 'int' => 40, 'ext' => 60],
        ['code' => 'MCA103', 'name' => 'Computer Networks & TCP/IP Protocols', 'dept' => 1, 'prog' => 1, 'sem' => 1, 'cr' => 4, 'int' => 40, 'ext' => 60],
        ['code' => 'MCA104', 'name' => 'Software Engineering & Agile Lifecycle', 'dept' => 1, 'prog' => 1, 'sem' => 1, 'cr' => 4, 'int' => 40, 'ext' => 60],
        ['code' => 'MCA105', 'name' => 'Advanced Web Technologies & Cloud Stacks', 'dept' => 1, 'prog' => 1, 'sem' => 1, 'cr' => 4, 'int' => 40, 'ext' => 60],
        // B.Tech CSE Sem 3 (Prog 2, Dept 1)
        ['code' => 'CSE301', 'name' => 'Discrete Mathematics & Graph Theory', 'dept' => 1, 'prog' => 2, 'sem' => 3, 'cr' => 4, 'int' => 40, 'ext' => 60],
        ['code' => 'CSE302', 'name' => 'Digital Logic & Computer Organization', 'dept' => 1, 'prog' => 2, 'sem' => 3, 'cr' => 4, 'int' => 40, 'ext' => 60],
        ['code' => 'CSE303', 'name' => 'Object Oriented Programming with Java', 'dept' => 1, 'prog' => 2, 'sem' => 3, 'cr' => 4, 'int' => 40, 'ext' => 60],
        ['code' => 'CSE304', 'name' => 'Operating System Principles & Unix', 'dept' => 1, 'prog' => 2, 'sem' => 3, 'cr' => 4, 'int' => 40, 'ext' => 60],
        ['code' => 'CSE305', 'name' => 'Analog & Digital Data Communications', 'dept' => 1, 'prog' => 2, 'sem' => 3, 'cr' => 4, 'int' => 40, 'ext' => 60]
    ];

    $courseStmt = $db->prepare("
        INSERT INTO courses (code, name, department_id, program_id, semester, credits, max_internal_marks, max_external_marks)
        VALUES (:code, :name, :dept, :prog, :sem, :cr, :int, :ext)
        ON DUPLICATE KEY UPDATE name = VALUES(name), credits = VALUES(credits), max_internal_marks = VALUES(max_internal_marks), max_external_marks = VALUES(max_external_marks)
    ");

    foreach ($courses as $c) {
        $courseStmt->execute([
            ':code' => $c['code'],
            ':name' => $c['name'],
            ':dept' => $c['dept'],
            ':prog' => $c['prog'],
            ':sem' => $c['sem'],
            ':cr' => $c['cr'],
            ':int' => $c['int'],
            ':ext' => $c['ext']
        ]);
    }
    echo "[OK] Master Courses seeded.\n";

    // 3. Seed Exam Sessions
    $sessions = [
        [
            'code' => 'AUTUMN-2026-ENDSEM',
            'title' => 'Autumn End-Semester Regular & Backlog Examinations 2026',
            'year' => '2026-2027',
            'type' => 'end_sem',
            'start' => '2026-11-16',
            'end' => '2026-11-28',
            'cards_pub' => 1,
            'res_pub' => 1,
            'status' => 'results_declared',
            'center' => 'Examination Center Complex - Academic Block C',
            'invig' => 'Dr. Vandana Saxena (Controller of Examinations)',
            'inst' => "1. Candidates must arrive at the examination venue 30 minutes before the commencement of the exam.\n2. Valid printed Admit Card along with University Identity Card is strictly mandatory for hall entry.\n3. Electronic devices, smartwatches, and programmable calculators are strictly prohibited inside the hall.\n4. Candidates will not be permitted to leave the examination hall before the first 60 minutes have elapsed.\n5. Maintain silence and strictly observe all institutional examination codes of conduct."
        ],
        [
            'code' => 'SPRING-2027-MIDSEM',
            'title' => 'Spring Mid-Semester Institutional Sessional Examinations 2027',
            'year' => '2026-2027',
            'type' => 'mid_sem',
            'start' => '2027-02-15',
            'end' => '2027-02-22',
            'cards_pub' => 1,
            'res_pub' => 0,
            'status' => 'scheduled',
            'center' => 'Main Academic Block - Lecture Hall Complex',
            'invig' => 'Prof. Ashok Sharma',
            'inst' => "Mid-term evaluation carrying 40% weightage toward continuous internal assessment. Bring scientific calculator and drawing stationery."
        ]
    ];

    $sessStmt = $db->prepare("
        INSERT INTO exam_sessions (session_code, title, academic_year, term_type, start_date, end_date, admit_cards_published, results_published, status, exam_center_name, chief_invigilator_name, instructions)
        VALUES (:code, :title, :year, :type, :start, :end, :cards_pub, :res_pub, :status, :center, :invig, :inst)
        ON DUPLICATE KEY UPDATE title = VALUES(title), admit_cards_published = VALUES(admit_cards_published), results_published = VALUES(results_published), status = VALUES(status)
    ");

    foreach ($sessions as $s) {
        $sessStmt->execute([
            ':code' => $s['code'],
            ':title' => $s['title'],
            ':year' => $s['year'],
            ':type' => $s['type'],
            ':start' => $s['start'],
            ':end' => $s['end'],
            ':cards_pub' => $s['cards_pub'],
            ':res_pub' => $s['res_pub'],
            ':status' => $s['status'],
            ':center' => $s['center'],
            ':invig' => $s['invig'],
            ':inst' => $s['inst']
        ]);
    }
    echo "[OK] Exam Sessions seeded.\n";

    // Grab session ID for AUTUMN-2026-ENDSEM
    $autumnSessId = (int)$db->query("SELECT id FROM exam_sessions WHERE session_code = 'AUTUMN-2026-ENDSEM'")->fetchColumn();

    // 4. Seed Examination Schedules for Autumn 2026
    $schedules = [
        // MCA Sem 1
        ['code' => 'MCA101', 'date' => '2026-11-16', 'shift' => 'Morning Session (10:00 AM - 01:00 PM)', 'start' => '10:00:00', 'end' => '13:00:00', 'hall' => 'LH-101 (Lecture Hall Complex)', 'seat' => 'Hall 101: Rows A-F', 'invig' => 'Prof. Ashok Sharma'],
        ['code' => 'MCA102', 'date' => '2026-11-18', 'shift' => 'Morning Session (10:00 AM - 01:00 PM)', 'start' => '10:00:00', 'end' => '13:00:00', 'hall' => 'LH-101 (Lecture Hall Complex)', 'seat' => 'Hall 101: Rows A-F', 'invig' => 'Dr. Meenakshi Sundaram'],
        ['code' => 'MCA103', 'date' => '2026-11-20', 'shift' => 'Morning Session (10:00 AM - 01:00 PM)', 'start' => '10:00:00', 'end' => '13:00:00', 'hall' => 'LH-102 (Lecture Hall Complex)', 'seat' => 'Hall 102: Rows A-D', 'invig' => 'Prof. Sunil Narang'],
        ['code' => 'MCA104', 'date' => '2026-11-23', 'shift' => 'Morning Session (10:00 AM - 01:00 PM)', 'start' => '10:00:00', 'end' => '13:00:00', 'hall' => 'LH-101 (Lecture Hall Complex)', 'seat' => 'Hall 101: Rows A-F', 'invig' => 'Prof. Ashok Sharma'],
        ['code' => 'MCA105', 'date' => '2026-11-25', 'shift' => 'Morning Session (10:00 AM - 01:00 PM)', 'start' => '10:00:00', 'end' => '13:00:00', 'hall' => 'Computer Lab 3 (Systems Wing)', 'seat' => 'Terminals T01 - T60', 'invig' => 'Dr. Vandana Saxena'],
        // B.Tech CSE Sem 3
        ['code' => 'CSE301', 'date' => '2026-11-17', 'shift' => 'Morning Session (10:00 AM - 01:00 PM)', 'start' => '10:00:00', 'end' => '13:00:00', 'hall' => 'LH-201 (Second Floor Wing)', 'seat' => 'Hall 201: Desk 1-80', 'invig' => 'Prof. Ashok Sharma'],
        ['code' => 'CSE302', 'date' => '2026-11-19', 'shift' => 'Morning Session (10:00 AM - 01:00 PM)', 'start' => '10:00:00', 'end' => '13:00:00', 'hall' => 'LH-201 (Second Floor Wing)', 'seat' => 'Hall 201: Desk 1-80', 'invig' => 'Dr. Meenakshi Sundaram'],
        ['code' => 'CSE303', 'date' => '2026-11-21', 'shift' => 'Morning Session (10:00 AM - 01:00 PM)', 'start' => '10:00:00', 'end' => '13:00:00', 'hall' => 'LH-201 (Second Floor Wing)', 'seat' => 'Hall 201: Desk 1-80', 'invig' => 'Prof. Sunil Narang'],
        ['code' => 'CSE304', 'date' => '2026-11-24', 'shift' => 'Morning Session (10:00 AM - 01:00 PM)', 'start' => '10:00:00', 'end' => '13:00:00', 'hall' => 'LH-202 (Second Floor Wing)', 'seat' => 'Hall 202: Desk 1-80', 'invig' => 'Prof. Ashok Sharma'],
        ['code' => 'CSE305', 'date' => '2026-11-26', 'shift' => 'Morning Session (10:00 AM - 01:00 PM)', 'start' => '10:00:00', 'end' => '13:00:00', 'hall' => 'LH-201 (Second Floor Wing)', 'seat' => 'Hall 201: Desk 1-80', 'invig' => 'Dr. Vandana Saxena']
    ];

    $db->prepare("DELETE FROM exam_schedules WHERE exam_session_id = :sid")->execute([':sid' => $autumnSessId]);

    $schedStmt = $db->prepare("
        INSERT INTO exam_schedules (exam_session_id, course_id, exam_date, start_time, end_time, shift_name, hall_name, seating_plan, invigilator_name)
        SELECT :sid, c.id, :date, :start, :end, :shift, :hall, :seat, :invig
        FROM courses c WHERE c.code = :code
    ");

    foreach ($schedules as $sc) {
        $schedStmt->execute([
            ':sid' => $autumnSessId,
            ':date' => $sc['date'],
            ':start' => $sc['start'],
            ':end' => $sc['end'],
            ':shift' => $sc['shift'],
            ':hall' => $sc['hall'],
            ':seat' => $sc['seat'],
            ':invig' => $sc['invig'],
            ':code' => $sc['code']
        ]);
    }
    echo "[OK] Examination Schedules seeded.\n";

    // 5. Seed Admit Cards for Demo Students
    // Student 1: Ashish Toppo (profile id 1)
    // Student 2: Priya Patel (profile id 2)
    // Student 3: Aarav Verma (profile id 3)
    $admitCards = [
        [
            'num' => 'CUT/AC/2026/00142',
            'pid' => 1,
            'sid' => $autumnSessId,
            'att' => 88.50,
            'fee' => 'cleared',
            'elig' => 'eligible',
            'stat' => 'issued',
            'hash' => 'CUT-VERIF-AC-24050101-7F89B2',
            'hall' => 'Lecture Hall LH-101, Desk #24 (Row C)',
            'rem' => 'All institutional prerequisites fulfilled. Verified by CoE.'
        ],
        [
            'num' => 'CUT/AC/2026/00143',
            'pid' => 2,
            'sid' => $autumnSessId,
            'att' => 94.20,
            'fee' => 'cleared',
            'elig' => 'eligible',
            'stat' => 'issued',
            'hash' => 'CUT-VERIF-AC-24050102-3A11C9',
            'hall' => 'Lecture Hall LH-101, Desk #25 (Row C)',
            'rem' => 'Exemplary attendance record. Verified by CoE.'
        ],
        [
            'num' => 'CUT/AC/2026/00144',
            'pid' => 3,
            'sid' => $autumnSessId,
            'att' => 78.40,
            'fee' => 'cleared',
            'elig' => 'eligible',
            'stat' => 'issued',
            'hash' => 'CUT-VERIF-AC-23010145-9D42E1',
            'hall' => 'Lecture Hall LH-201, Desk #42 (Row E)',
            'rem' => 'Attendance above 75% threshold. Cleared by Dean Academics.'
        ]
    ];

    $acStmt = $db->prepare("
        INSERT INTO admit_cards (admit_card_number, student_profile_id, exam_session_id, attendance_percentage, fee_clearance_status, eligibility_status, status, issued_at, qr_security_hash, seating_hall_allotment, remarks)
        VALUES (:num, :pid, :sid, :att, :fee, :elig, :stat, NOW(), :hash, :hall, :rem)
        ON DUPLICATE KEY UPDATE attendance_percentage = VALUES(attendance_percentage), eligibility_status = VALUES(eligibility_status), status = VALUES(status), seating_hall_allotment = VALUES(seating_hall_allotment)
    ");

    foreach ($admitCards as $ac) {
        $acStmt->execute([
            ':num' => $ac['num'],
            ':pid' => $ac['pid'],
            ':sid' => $ac['sid'],
            ':att' => $ac['att'],
            ':fee' => $ac['fee'],
            ':elig' => $ac['elig'],
            ':stat' => $ac['stat'],
            ':hash' => $ac['hash'],
            ':hall' => $ac['hall'],
            ':rem' => $ac['rem']
        ]);
    }
    echo "[OK] Admit Cards seeded.\n";

    // 6. Seed Marks for Ashish Toppo (profile id 1, MCA Sem 1)
    // Internal (max 40) + External (max 60)
    $ashishMarks = [
        ['code' => 'MCA101', 'int' => 36.0, 'ext' => 52.0, 'grade' => 'A+', 'gp' => 9.0], // 88% -> A+
        ['code' => 'MCA102', 'int' => 38.0, 'ext' => 54.0, 'grade' => 'O',  'gp' => 10.0], // 92% -> O
        ['code' => 'MCA103', 'int' => 33.0, 'ext' => 48.0, 'grade' => 'A',  'gp' => 8.0], // 81% -> A+
        ['code' => 'MCA104', 'int' => 35.0, 'ext' => 51.0, 'grade' => 'A+', 'gp' => 9.0], // 86% -> A+
        ['code' => 'MCA105', 'int' => 37.0, 'ext' => 55.0, 'grade' => 'O',  'gp' => 10.0]  // 92% -> O
    ];

    $db->prepare("DELETE FROM exam_marks WHERE exam_session_id = :sid AND student_profile_id = 1")->execute([':sid' => $autumnSessId]);

    $marksStmt = $db->prepare("
        INSERT INTO exam_marks (exam_session_id, course_id, student_profile_id, internal_marks, external_marks, total_marks, grade_letter, grade_points, result_status, credits, evaluated_by_user_id)
        SELECT :sid, c.id, :pid, :internal_marks, :external_marks, :total_marks, :grade, :gp, 'pass', c.credits, 6
        FROM courses c WHERE c.code = :code
    ");

    foreach ($ashishMarks as $m) {
        $tot = $m['int'] + $m['ext'];
        $marksStmt->execute([
            ':sid' => $autumnSessId,
            ':pid' => 1,
            ':internal_marks' => $m['int'],
            ':external_marks' => $m['ext'],
            ':total_marks' => $tot,
            ':grade' => $m['grade'],
            ':gp' => $m['gp'],
            ':code' => $m['code']
        ]);
    }

    // Seed Priya Patel marks (profile id 2, MCA Sem 1)
    $priyaMarks = [
        ['code' => 'MCA101', 'int' => 38.0, 'ext' => 56.0, 'grade' => 'O',  'gp' => 10.0],
        ['code' => 'MCA102', 'int' => 39.0, 'ext' => 57.0, 'grade' => 'O',  'gp' => 10.0],
        ['code' => 'MCA103', 'int' => 36.0, 'ext' => 53.0, 'grade' => 'A+', 'gp' => 9.0],
        ['code' => 'MCA104', 'int' => 37.0, 'ext' => 54.0, 'grade' => 'O',  'gp' => 10.0],
        ['code' => 'MCA105', 'int' => 39.0, 'ext' => 58.0, 'grade' => 'O',  'gp' => 10.0]
    ];

    $db->prepare("DELETE FROM exam_marks WHERE exam_session_id = :sid AND student_profile_id = 2")->execute([':sid' => $autumnSessId]);
    foreach ($priyaMarks as $m) {
        $tot = $m['int'] + $m['ext'];
        $marksStmt->execute([
            ':sid' => $autumnSessId,
            ':pid' => 2,
            ':internal_marks' => $m['int'],
            ':external_marks' => $m['ext'],
            ':total_marks' => $tot,
            ':grade' => $m['grade'],
            ':gp' => $m['gp'],
            ':code' => $m['code']
        ]);
    }
    echo "[OK] Exam Marks seeded.\n";

    // 7. Seed Student Semester Summary (SGPA / CGPA)
    // Ashish: (9*4 + 10*4 + 8*4 + 9*4 + 10*4) / 20 = (36 + 40 + 32 + 36 + 40) / 20 = 184 / 20 = 9.20
    $sumStmt = $db->prepare("
        INSERT INTO student_semester_summaries (student_profile_id, exam_session_id, semester, total_credits_registered, total_credits_earned, sgpa, cgpa, classification, backlog_count, is_published, published_at)
        VALUES (:pid, :sid, :sem, :tot_cr, :earn_cr, :sgpa, :cgpa, :class, :back, 1, NOW())
        ON DUPLICATE KEY UPDATE sgpa = VALUES(sgpa), cgpa = VALUES(cgpa), is_published = VALUES(is_published)
    ");

    $sumStmt->execute([
        ':pid' => 1,
        ':sid' => $autumnSessId,
        ':sem' => 1,
        ':tot_cr' => 20,
        ':earn_cr' => 20,
        ':sgpa' => 9.20,
        ':cgpa' => 9.20,
        ':class' => 'First Class with Distinction',
        ':back' => 0
    ]);

    $sumStmt->execute([
        ':pid' => 2,
        ':sid' => $autumnSessId,
        ':sem' => 1,
        ':tot_cr' => 20,
        ':earn_cr' => 20,
        ':sgpa' => 9.80,
        ':cgpa' => 9.80,
        ':class' => 'First Class with Exemplary Honors',
        ':back' => 0
    ]);
    echo "[OK] Semester Summaries seeded.\n";

    echo "=== PHASE 6 MIGRATION COMPLETED SUCCESSFULLY ===\n";

} catch (\Throwable $e) {
    echo "ERROR during Phase 6 migration: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}
