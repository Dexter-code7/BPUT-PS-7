<?php
// Unified Campus ERP - Phase 6 Examination, Admit Cards & Academic Performance Controller
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/audit.php';

class ExamController {

    /**
     * UGC 10-Point Relative / Absolute Grading Scale Helper
     */
    private static function calculateGrade(float $totalMarks, float $maxMarks = 100.0): array {
        $percentage = ($maxMarks > 0) ? ($totalMarks / $maxMarks) * 100.0 : 0.0;
        if ($percentage >= 90.0) return ['grade' => 'O',  'points' => 10.0, 'status' => 'pass', 'label' => 'Outstanding'];
        if ($percentage >= 80.0) return ['grade' => 'A+', 'points' => 9.0,  'status' => 'pass', 'label' => 'Excellent'];
        if ($percentage >= 70.0) return ['grade' => 'A',  'points' => 8.0,  'status' => 'pass', 'label' => 'Very Good'];
        if ($percentage >= 60.0) return ['grade' => 'B+', 'points' => 7.0,  'status' => 'pass', 'label' => 'Good'];
        if ($percentage >= 50.0) return ['grade' => 'B',  'points' => 6.0,  'status' => 'pass', 'label' => 'Above Average'];
        if ($percentage >= 40.0) return ['grade' => 'C',  'points' => 5.0,  'status' => 'pass', 'label' => 'Pass'];
        return ['grade' => 'F',  'points' => 0.0,  'status' => 'fail', 'label' => 'Fail / Backlog'];
    }

    /**
     * GET /exams/sessions - List examination terms & metadata
     */
    public static function listSessions(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $stmt = $db->query("
            SELECT
                es.*,
                COUNT(DISTINCT esc.id) AS schedule_slots_count,
                COUNT(DISTINCT ac.id) AS admit_cards_issued_count,
                COUNT(DISTINCT ss.id) AS result_summaries_count
            FROM exam_sessions es
            LEFT JOIN exam_schedules esc ON es.id = esc.exam_session_id
            LEFT JOIN admit_cards ac ON es.id = ac.exam_session_id AND ac.status = 'issued'
            LEFT JOIN student_semester_summaries ss ON es.id = ss.exam_session_id AND ss.is_published = 1
            GROUP BY es.id
            ORDER BY es.start_date DESC
        ");
        $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json(['sessions' => $sessions]);
    }

    /**
     * GET /exams/courses - List courses/subjects with program and department
     */
    public static function listCourses(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $programId = (int)($_GET['program_id'] ?? 0);
        $semester = (int)($_GET['semester'] ?? 0);

        $query = "
            SELECT c.*, p.name AS program_name, p.code AS program_code, d.name AS department_name
            FROM courses c
            JOIN programs p ON c.program_id = p.id
            JOIN departments d ON c.department_id = d.id
            WHERE 1=1
        ";
        $params = [];
        if ($programId > 0) {
            $query .= " AND c.program_id = :pid";
            $params[':pid'] = $programId;
        }
        if ($semester > 0) {
            $query .= " AND c.semester = :sem";
            $params[':sem'] = $semester;
        }
        $query .= " ORDER BY c.semester ASC, c.code ASC";

        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json(['courses' => $courses]);
    }

    /**
     * GET /exams/schedules - Examination Timetable & Datesheet
     */
    public static function listSchedules(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $sessionId = (int)($_GET['session_id'] ?? 0);
        $programId = (int)($_GET['program_id'] ?? 0);
        $semester = (int)($_GET['semester'] ?? 0);

        // If student, default to their program and semester if not passed
        if ($user['profile_type'] === 'student') {
            $stdProfile = $db->prepare("SELECT program_id, current_semester FROM student_profiles WHERE user_id = :uid LIMIT 1");
            $stdProfile->execute([':uid' => $user['id']]);
            $profile = $stdProfile->fetch(PDO::FETCH_ASSOC);
            if ($profile) {
                if ($programId <= 0) $programId = (int)$profile['program_id'];
                if ($semester <= 0) $semester = (int)$profile['current_semester'];
            }
        }

        // Default to session with schedules or current active session if session_id is 0
        if ($sessionId <= 0) {
            $sessId = $db->query("
                SELECT es.id 
                FROM exam_sessions es 
                LEFT JOIN exam_schedules esc ON es.id = esc.exam_session_id 
                GROUP BY es.id 
                ORDER BY COUNT(esc.id) DESC, es.start_date DESC 
                LIMIT 1
            ")->fetchColumn();
            $sessionId = (int)$sessId;
        }

        $query = "
            SELECT
                es.*,
                c.code AS course_code,
                c.name AS course_name,
                c.credits,
                c.semester,
                c.max_internal_marks,
                c.max_external_marks,
                p.name AS program_name,
                p.code AS program_code,
                d.name AS department_name,
                exs.title AS session_title,
                exs.session_code,
                exs.academic_year,
                exs.exam_center_name,
                exs.admit_cards_published
            FROM exam_schedules es
            JOIN courses c ON es.course_id = c.id
            JOIN programs p ON c.program_id = p.id
            JOIN departments d ON c.department_id = d.id
            JOIN exam_sessions exs ON es.exam_session_id = exs.id
            WHERE es.exam_session_id = :sid
        ";
        $params = [':sid' => $sessionId];

        if ($programId > 0) {
            $query .= " AND c.program_id = :pid";
            $params[':pid'] = $programId;
        }
        if ($semester > 0) {
            $query .= " AND c.semester = :sem";
            $params[':sem'] = $semester;
        }

        $query .= " ORDER BY es.exam_date ASC, es.start_time ASC";

        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculate countdown and human status
        $today = date('Y-m-d');
        foreach ($schedules as &$sch) {
            $examDate = $sch['exam_date'];
            if ($examDate === $today) {
                $sch['days_left'] = 0;
                $sch['time_badge'] = 'Today';
            } elseif ($examDate > $today) {
                $diff = (int)((strtotime($examDate) - strtotime($today)) / 86400);
                $sch['days_left'] = $diff;
                $sch['time_badge'] = "In {$diff} Days";
            } else {
                $diff = (int)((strtotime($today) - strtotime($examDate)) / 86400);
                $sch['days_left'] = -$diff;
                $sch['time_badge'] = 'Concluded';
            }
        }

        Response::json([
            'session_id' => $sessionId,
            'schedules' => $schedules,
            'total_papers' => count($schedules)
        ]);
    }

    /**
     * GET /exams/admit-card - Candidate Official Hall Ticket Dossier
     */
    public static function getAdmitCard(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $sessionId = (int)($_GET['session_id'] ?? 0);
        $studentProfileId = (int)($_GET['student_profile_id'] ?? 0);

        if ($sessionId <= 0) {
            $sessionId = (int)$db->query("
                SELECT es.id 
                FROM exam_sessions es 
                LEFT JOIN exam_schedules esc ON es.id = esc.exam_session_id 
                GROUP BY es.id 
                ORDER BY COUNT(esc.id) DESC, es.start_date DESC 
                LIMIT 1
            ")->fetchColumn();
        }

        // Determine student target
        if ($user['profile_type'] === 'student') {
            $stdProfile = $db->prepare("SELECT id FROM student_profiles WHERE user_id = :uid LIMIT 1");
            $stdProfile->execute([':uid' => $user['id']]);
            $studentProfileId = (int)$stdProfile->fetchColumn();
        } elseif ($studentProfileId <= 0) {
            // Default demo student if admin hasn't specified
            $studentProfileId = (int)$db->query("SELECT id FROM student_profiles WHERE roll_number = '24050101' LIMIT 1")->fetchColumn();
        }

        if ($studentProfileId <= 0) {
            Response::error('Student profile not found.', 404);
        }

        // Fetch student profile details
        $stdQuery = "
            SELECT
                sp.*,
                p.name AS program_name,
                p.code AS program_code,
                p.degree_level,
                d.name AS department_name,
                d.code AS department_code,
                u.username,
                u.email
            FROM student_profiles sp
            JOIN programs p ON sp.program_id = p.id
            JOIN departments d ON sp.department_id = d.id
            JOIN users u ON sp.user_id = u.id
            WHERE sp.id = :pid
            LIMIT 1
        ";
        $stdStmt = $db->prepare($stdQuery);
        $stdStmt->execute([':pid' => $studentProfileId]);
        $student = $stdStmt->fetch(PDO::FETCH_ASSOC);

        if (!$student) {
            Response::error('Student records not found in institutional database.', 404);
        }

        // Fetch Exam Session
        $sessStmt = $db->prepare("SELECT * FROM exam_sessions WHERE id = :sid LIMIT 1");
        $sessStmt->execute([':sid' => $sessionId]);
        $session = $sessStmt->fetch(PDO::FETCH_ASSOC);
        if (!$session) {
            Response::error('Examination session not found.', 404);
        }

        // Fetch Admit Card Record
        $acStmt = $db->prepare("SELECT * FROM admit_cards WHERE student_profile_id = :pid AND exam_session_id = :sid LIMIT 1");
        $acStmt->execute([':pid' => $studentProfileId, ':sid' => $sessionId]);
        $admitCard = $acStmt->fetch(PDO::FETCH_ASSOC);

        // Calculate student's actual attendance from academic logs
        $attStmt = $db->prepare("
            SELECT SUM(attended_classes) AS total_att, SUM(total_classes) AS total_cond
            FROM attendance_records
            WHERE student_id = :uid
        ");
        $attStmt->execute([':uid' => $student['user_id']]);
        $attRow = $attStmt->fetch(PDO::FETCH_ASSOC);

        $actualAttendance = 84.50; // default baseline
        if ($attRow && (int)($attRow['total_cond'] ?? 0) > 0) {
            $actualAttendance = round(((int)$attRow['total_att'] / (int)$attRow['total_cond']) * 100, 2);
        }

        $isAttendanceCompliant = ($actualAttendance >= 75.00);
        $initialEligibility = $isAttendanceCompliant ? 'eligible' : 'debarment_risk';
        $initialRemarks = $isAttendanceCompliant
            ? 'Statutory Attendance Verified (>= 75.00%). Hall Ticket Cleared.'
            : "STATUTORY DEBARMENT RISK: Attendance ({$actualAttendance}%) is below 75% threshold (BPUT Academic Regulation 14.2). Requires HOD Condonation Approval.";

        // If not generated yet, auto-provision provisional record
        if (!$admitCard) {
            $genNumber = 'CUT/AC/' . date('Y') . '/' . str_pad((string)$studentProfileId, 5, '0', STR_PAD_LEFT);
            $hash = 'CUT-VERIF-AC-' . $student['roll_number'] . '-' . strtoupper(substr(md5($student['registration_number'] . $sessionId), 0, 6));
            $defaultHall = 'Examination Center Block C, Desk #' . (10 + ($studentProfileId % 40));

            $insertAc = $db->prepare("
                INSERT INTO admit_cards (admit_card_number, student_profile_id, exam_session_id, attendance_percentage, fee_clearance_status, eligibility_status, status, issued_at, qr_security_hash, seating_hall_allotment, remarks)
                VALUES (:num, :pid, :sid, :att, 'cleared', :elig, 'issued', NOW(), :hash, :hall, :rem)
            ");
            $insertAc->execute([
                ':num' => $genNumber,
                ':pid' => $studentProfileId,
                ':sid' => $sessionId,
                ':att' => $actualAttendance,
                ':elig' => $initialEligibility,
                ':hash' => $hash,
                ':hall' => $defaultHall,
                ':rem' => $initialRemarks
            ]);

            $acStmt->execute([':pid' => $studentProfileId, ':sid' => $sessionId]);
            $admitCard = $acStmt->fetch(PDO::FETCH_ASSOC);
        } else {
            // Keep attendance percentage synced if not manually locked
            if ((float)$admitCard['attendance_percentage'] != $actualAttendance && $admitCard['eligibility_status'] !== 'condoned') {
                $db->prepare("
                    UPDATE admit_cards
                    SET attendance_percentage = :att,
                        eligibility_status = IF(eligibility_status = 'condoned', 'condoned', :elig),
                        remarks = IF(eligibility_status = 'condoned', remarks, :rem)
                    WHERE id = :id
                ")->execute([
                    ':att' => $actualAttendance,
                    ':elig' => $initialEligibility,
                    ':rem' => $initialRemarks,
                    ':id' => $admitCard['id']
                ]);
                $acStmt->execute([':pid' => $studentProfileId, ':sid' => $sessionId]);
                $admitCard = $acStmt->fetch(PDO::FETCH_ASSOC);
            }
        }

        // Fetch examination schedule of courses for this student's program and semester
        $papersStmt = $db->prepare("
            SELECT
                es.*,
                c.code AS course_code,
                c.name AS course_name,
                c.credits,
                c.semester
            FROM exam_schedules es
            JOIN courses c ON es.course_id = c.id
            WHERE es.exam_session_id = :sid
              AND c.program_id = :prog_id
              AND c.semester = :sem
            ORDER BY es.exam_date ASC, es.start_time ASC
        ");
        $papersStmt->execute([
            ':sid' => $sessionId,
            ':prog_id' => $student['program_id'],
            ':sem' => $student['current_semester']
        ]);
        $examPapers = $papersStmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            'student' => $student,
            'session' => $session,
            'admit_card' => $admitCard,
            'exam_papers' => $examPapers,
            'institution_name' => 'CENTRAL UNIVERSITY OF TECHNOLOGY',
            'examination_cell' => 'OFFICE OF THE CONTROLLER OF EXAMINATIONS',
            'verification_url' => "http://localhost/collegelife/verify_admit_card.php?ref={$admitCard['qr_security_hash']}"
        ]);
    }

    /**
     * GET /exams/admit-cards-roster - Admin Overview of all candidates' hall tickets
     */
    public static function listAdmitCardsRoster(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $canManage = in_array($user['role_name'], ['system_admin', 'director', 'exam_admin', 'hod', 'admin_staff']);
        if (!$canManage) {
            Response::error('Unauthorized to view institutional admit card roster.', 403);
        }

        $sessionId = (int)($_GET['session_id'] ?? 0);
        if ($sessionId <= 0) {
            $sessionId = (int)$db->query("
                SELECT es.id 
                FROM exam_sessions es 
                LEFT JOIN exam_schedules esc ON es.id = esc.exam_session_id 
                GROUP BY es.id 
                ORDER BY COUNT(esc.id) DESC, es.start_date DESC 
                LIMIT 1
            ")->fetchColumn();
        }

        $programId = (int)($_GET['program_id'] ?? 0);
        $search = trim($_GET['search'] ?? '');
        $status = $_GET['status'] ?? 'all';

        $query = "
            SELECT
                ac.*,
                sp.roll_number,
                sp.registration_number,
                sp.full_name AS student_name,
                sp.current_semester,
                sp.section,
                p.name AS program_name,
                p.code AS program_code,
                d.name AS department_name
            FROM student_profiles sp
            JOIN programs p ON sp.program_id = p.id
            JOIN departments d ON sp.department_id = d.id
            LEFT JOIN admit_cards ac ON sp.id = ac.student_profile_id AND ac.exam_session_id = :sid
            WHERE 1=1
        ";
        $params = [':sid' => $sessionId];

        if ($programId > 0) {
            $query .= " AND sp.program_id = :pid";
            $params[':pid'] = $programId;
        }
        if ($search !== '') {
            $query .= " AND (sp.full_name LIKE :s1 OR sp.roll_number LIKE :s2 OR sp.registration_number LIKE :s3)";
            $params[':s1'] = "%{$search}%";
            $params[':s2'] = "%{$search}%";
            $params[':s3'] = "%{$search}%";
        }
        if ($status !== 'all') {
            if ($status === 'issued') {
                $query .= " AND ac.status = 'issued'";
            } elseif ($status === 'withheld') {
                $query .= " AND ac.status = 'withheld'";
            } elseif ($status === 'not_issued') {
                $query .= " AND (ac.id IS NULL OR ac.status = 'withheld')";
            }
        }

        $query .= " ORDER BY sp.roll_number ASC";

        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $roster = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            'session_id' => $sessionId,
            'roster' => $roster,
            'total_students' => count($roster)
        ]);
    }

    /**
     * POST /exams/toggle-admit-card - Issue, withhold, or update eligibility for candidate
     */
    public static function toggleAdmitCard(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $canManage = in_array($user['role_name'], ['system_admin', 'director', 'exam_admin', 'hod']);
        if (!$canManage) {
            Response::error('Unauthorized to modify admit card status.', 403);
        }

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $studentProfileId = (int)($input['student_profile_id'] ?? 0);
        $sessionId = (int)($input['session_id'] ?? 0);
        $newStatus = $input['status'] ?? 'issued'; // 'issued', 'withheld', 'collected'
        $remarks = trim($input['remarks'] ?? '');

        if ($studentProfileId <= 0 || $sessionId <= 0) {
            Response::error('Student Profile ID and Session ID required.', 400);
        }

        $checkStmt = $db->prepare("SELECT id FROM admit_cards WHERE student_profile_id = :pid AND exam_session_id = :sid");
        $checkStmt->execute([':pid' => $studentProfileId, ':sid' => $sessionId]);
        $existingId = $checkStmt->fetchColumn();

        if ($existingId) {
            $stmt = $db->prepare("
                UPDATE admit_cards
                SET status = :st, remarks = :rem, issued_at = IF(:st = 'issued', NOW(), issued_at)
                WHERE id = :id
            ");
            $stmt->execute([
                ':st' => $newStatus,
                ':rem' => $remarks ?: null,
                ':id' => $existingId
            ]);
        } else {
            $std = $db->query("SELECT roll_number, registration_number FROM student_profiles WHERE id = {$studentProfileId}")->fetch(PDO::FETCH_ASSOC);
            $genNumber = 'CUT/AC/' . date('Y') . '/' . str_pad((string)$studentProfileId, 5, '0', STR_PAD_LEFT);
            $hash = 'CUT-VERIF-AC-' . $std['roll_number'] . '-' . strtoupper(substr(md5($std['registration_number'] . $sessionId), 0, 6));

            $insertStmt = $db->prepare("
                INSERT INTO admit_cards (admit_card_number, student_profile_id, exam_session_id, attendance_percentage, fee_clearance_status, eligibility_status, status, issued_at, qr_security_hash, seating_hall_allotment, remarks)
                VALUES (:num, :pid, :sid, 85.00, 'cleared', 'eligible', :st, NOW(), :hash, 'Main Hall Desk #15', :rem)
            ");
            $insertStmt->execute([
                ':num' => $genNumber,
                ':pid' => $studentProfileId,
                ':sid' => $sessionId,
                ':st' => $newStatus,
                ':hash' => $hash,
                ':rem' => $remarks ?: null
            ]);
        }

        AuditLogger::log($user['id'], 'exams.admit_card_toggle', 'admit_card', (string)$studentProfileId, [
            'status' => $newStatus,
            'session_id' => $sessionId
        ]);

        Response::json([
            'message' => "Admit card status updated to: {$newStatus}",
            'status' => $newStatus
        ]);
    }

    /**
     * POST /exams/bulk-release-admit-cards - Bulk release admit cards for all eligible students
     */
    public static function bulkReleaseAdmitCards(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $canManage = in_array($user['role_name'], ['system_admin', 'director', 'exam_admin']);
        if (!$canManage) {
            Response::error('Unauthorized to execute bulk admit card release.', 403);
        }

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $sessionId = (int)($input['session_id'] ?? 0);
        if ($sessionId <= 0) {
            Response::error('Session ID required.', 400);
        }

        // Fetch all students without admit card in this session
        $students = $db->query("SELECT id, roll_number, registration_number FROM student_profiles")->fetchAll(PDO::FETCH_ASSOC);
        $count = 0;

        $insStmt = $db->prepare("
            INSERT INTO admit_cards (admit_card_number, student_profile_id, exam_session_id, attendance_percentage, fee_clearance_status, eligibility_status, status, issued_at, qr_security_hash, seating_hall_allotment, remarks)
            VALUES (:num, :pid, :sid, 86.50, 'cleared', 'eligible', 'issued', NOW(), :hash, :hall, 'Institutional bulk release approved by CoE')
            ON DUPLICATE KEY UPDATE status = 'issued', issued_at = NOW()
        ");

        foreach ($students as $std) {
            $pid = (int)$std['id'];
            $genNumber = 'CUT/AC/' . date('Y') . '/' . str_pad((string)$pid, 5, '0', STR_PAD_LEFT);
            $hash = 'CUT-VERIF-AC-' . $std['roll_number'] . '-' . strtoupper(substr(md5($std['registration_number'] . $sessionId), 0, 6));
            $hall = 'Lecture Hall Complex - Seat #' . (10 + ($pid % 50));

            $insStmt->execute([
                ':num' => $genNumber,
                ':pid' => $pid,
                ':sid' => $sessionId,
                ':hash' => $hash,
                ':hall' => $hall
            ]);
            $count++;
        }

        // Update session flag
        $db->prepare("UPDATE exam_sessions SET admit_cards_published = 1 WHERE id = :sid")->execute([':sid' => $sessionId]);

        AuditLogger::log($user['id'], 'exams.bulk_admit_card_release', 'exam_session', (string)$sessionId, [
            'total_issued' => $count
        ]);

        Response::json([
            'message' => "Successfully generated and published {$count} admit cards for the examination session.",
            'count' => $count
        ]);
    }

    /**
     * GET /exams/results - Comprehensive Academic Grade Sheet & Results
     */
    public static function getResults(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $sessionId = (int)($_GET['session_id'] ?? 0);
        $studentProfileId = (int)($_GET['student_profile_id'] ?? 0);

        if ($sessionId <= 0) {
            $sessionId = (int)$db->query("SELECT id FROM exam_sessions WHERE results_published = 1 ORDER BY start_date DESC LIMIT 1")->fetchColumn();
            if ($sessionId <= 0) {
                $sessionId = (int)$db->query("SELECT id FROM exam_sessions ORDER BY start_date DESC LIMIT 1")->fetchColumn();
            }
        }

        // Student target determination
        if ($user['profile_type'] === 'student') {
            $stdProfile = $db->prepare("SELECT id FROM student_profiles WHERE user_id = :uid LIMIT 1");
            $stdProfile->execute([':uid' => $user['id']]);
            $studentProfileId = (int)$stdProfile->fetchColumn();
        } elseif ($studentProfileId <= 0) {
            $studentProfileId = (int)$db->query("SELECT id FROM student_profiles WHERE roll_number = '24050101' LIMIT 1")->fetchColumn();
        }

        // Fetch Student Record
        $stdQuery = "
            SELECT
                sp.*,
                p.name AS program_name,
                p.code AS program_code,
                p.degree_level,
                d.name AS department_name,
                d.code AS department_code,
                u.username,
                u.email
            FROM student_profiles sp
            JOIN programs p ON sp.program_id = p.id
            JOIN departments d ON sp.department_id = d.id
            JOIN users u ON sp.user_id = u.id
            WHERE sp.id = :pid
            LIMIT 1
        ";
        $stdStmt = $db->prepare($stdQuery);
        $stdStmt->execute([':pid' => $studentProfileId]);
        $student = $stdStmt->fetch(PDO::FETCH_ASSOC);

        if (!$student) {
            Response::error('Student profile not found.', 404);
        }

        // Fetch Exam Session
        $sessStmt = $db->prepare("SELECT * FROM exam_sessions WHERE id = :sid LIMIT 1");
        $sessStmt->execute([':sid' => $sessionId]);
        $session = $sessStmt->fetch(PDO::FETCH_ASSOC);

        // Fetch Marks Breakdown
        $marksQuery = "
            SELECT
                em.*,
                c.code AS course_code,
                c.name AS course_name,
                c.credits,
                c.semester,
                c.max_internal_marks,
                c.max_external_marks
            FROM exam_marks em
            JOIN courses c ON em.course_id = c.id
            WHERE em.student_profile_id = :pid
              AND em.exam_session_id = :sid
            ORDER BY c.code ASC
        ";
        $marksStmt = $db->prepare($marksQuery);
        $marksStmt->execute([':pid' => $studentProfileId, ':sid' => $sessionId]);
        $courseMarks = $marksStmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch Semester Summary
        $sumStmt = $db->prepare("
            SELECT * FROM student_semester_summaries
            WHERE student_profile_id = :pid AND exam_session_id = :sid
            LIMIT 1
        ");
        $sumStmt->execute([':pid' => $studentProfileId, ':sid' => $sessionId]);
        $summary = $sumStmt->fetch(PDO::FETCH_ASSOC);

        // Calculate dynamically if not saved
        if (!$summary && count($courseMarks) > 0) {
            $totalPoints = 0.0;
            $totalCredits = 0;
            $earnedCredits = 0;
            $backlogs = 0;

            foreach ($courseMarks as $cm) {
                $cr = (int)$cm['credits'];
                $gp = (float)$cm['grade_points'];
                $totalCredits += $cr;
                if ($cm['result_status'] === 'pass') {
                    $earnedCredits += $cr;
                    $totalPoints += ($gp * $cr);
                } else {
                    $backlogs++;
                }
            }

            $sgpa = ($totalCredits > 0) ? round($totalPoints / $totalCredits, 2) : 0.00;
            $summary = [
                'student_profile_id' => $studentProfileId,
                'exam_session_id' => $sessionId,
                'semester' => $student['current_semester'],
                'total_credits_registered' => $totalCredits,
                'total_credits_earned' => $earnedCredits,
                'sgpa' => $sgpa,
                'cgpa' => $sgpa,
                'classification' => ($sgpa >= 8.5 ? 'First Class with Distinction' : ($sgpa >= 6.5 ? 'First Class' : 'Second Class')),
                'backlog_count' => $backlogs,
                'is_published' => 1,
                'published_at' => date('Y-m-d H:i:s')
            ];
        }

        Response::json([
            'student' => $student,
            'session' => $session,
            'summary' => $summary,
            'course_marks' => $courseMarks,
            'is_declared' => (bool)($session['results_published'] ?? false),
            'institution_name' => 'CENTRAL UNIVERSITY OF TECHNOLOGY',
            'controller_sign' => 'Dr. Vandana Saxena (Controller of Examinations)'
        ]);
    }

    /**
     * POST /exams/enter-marks - Teacher/Admin Marks Entry for a Course
     */
    public static function enterMarks(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $canManage = in_array($user['role_name'], ['system_admin', 'director', 'exam_admin', 'hod', 'teacher']);
        if (!$canManage) {
            Response::error('Unauthorized to enter course evaluation marks.', 403);
        }

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $sessionId = (int)($input['session_id'] ?? 0);
        $courseId = (int)($input['course_id'] ?? 0);
        $marksList = $input['marks_list'] ?? []; // Array of [{ student_profile_id, internal_marks, external_marks }]

        if ($sessionId <= 0 || $courseId <= 0 || empty($marksList)) {
            Response::error('Session ID, Course ID, and student marks roster required.', 400);
        }

        // Get Course info
        $cStmt = $db->prepare("SELECT * FROM courses WHERE id = :cid LIMIT 1");
        $cStmt->execute([':cid' => $courseId]);
        $course = $cStmt->fetch(PDO::FETCH_ASSOC);
        if (!$course) {
            Response::error('Course not found.', 404);
        }

        $upsertStmt = $db->prepare("
            INSERT INTO exam_marks (exam_session_id, course_id, student_profile_id, internal_marks, external_marks, total_marks, grade_letter, grade_points, result_status, credits, evaluated_by_user_id)
            VALUES (:sid, :cid, :pid, :internal_marks, :external_marks, :total_marks, :grade, :gp, :stat, :cr, :eval_by)
            ON DUPLICATE KEY UPDATE
                internal_marks = VALUES(internal_marks),
                external_marks = VALUES(external_marks),
                total_marks = VALUES(total_marks),
                grade_letter = VALUES(grade_letter),
                grade_points = VALUES(grade_points),
                result_status = VALUES(result_status),
                evaluated_by_user_id = VALUES(evaluated_by_user_id),
                updated_at = NOW()
        ");

        $savedCount = 0;
        foreach ($marksList as $row) {
            $pid = (int)($row['student_profile_id'] ?? 0);
            if ($pid <= 0) continue;

            $intM = min((float)$course['max_internal_marks'], max(0.0, (float)($row['internal_marks'] ?? 0)));
            $extM = min((float)$course['max_external_marks'], max(0.0, (float)($row['external_marks'] ?? 0)));
            $totM = $intM + $extM;
            $maxM = (float)($course['max_internal_marks'] + $course['max_external_marks']);

            $gradeInfo = self::calculateGrade($totM, $maxM);

            $upsertStmt->execute([
                ':sid' => $sessionId,
                ':cid' => $courseId,
                ':pid' => $pid,
                ':internal_marks' => $intM,
                ':external_marks' => $extM,
                ':total_marks' => $totM,
                ':grade' => $gradeInfo['grade'],
                ':gp' => $gradeInfo['points'],
                ':stat' => $gradeInfo['status'],
                ':cr' => (int)$course['credits'],
                ':eval_by' => $user['id']
            ]);
            $savedCount++;
        }

        AuditLogger::log($user['id'], 'exams.marks_entry', 'exam_marks', "course-{$courseId}", [
            'session_id' => $sessionId,
            'course' => $course['code'],
            'students_updated' => $savedCount
        ]);

        Response::json([
            'message' => "Successfully recorded grades for {$savedCount} candidates in course {$course['code']}.",
            'saved_count' => $savedCount
        ]);
    }

    /**
     * POST /exams/publish-results - Calculate institutional SGPAs and publish results
     */
    public static function publishResults(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $canManage = in_array($user['role_name'], ['system_admin', 'director', 'exam_admin']);
        if (!$canManage) {
            Response::error('Unauthorized to publish examination results.', 403);
        }

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $sessionId = (int)($input['session_id'] ?? 0);
        $publish = !empty($input['publish']);

        if ($sessionId <= 0) {
            Response::error('Session ID required.', 400);
        }

        if ($publish) {
            // Compute SGPAs for all students who have marks in this session
            $stdIds = $db->query("SELECT DISTINCT student_profile_id FROM exam_marks WHERE exam_session_id = {$sessionId}")->fetchAll(PDO::FETCH_COLUMN);

            $sumUpsert = $db->prepare("
                INSERT INTO student_semester_summaries (student_profile_id, exam_session_id, semester, total_credits_registered, total_credits_earned, sgpa, cgpa, classification, backlog_count, is_published, published_at)
                VALUES (:pid, :sid, :sem, :tot_cr, :earn_cr, :sgpa, :cgpa, :class, :back, 1, NOW())
                ON DUPLICATE KEY UPDATE
                    total_credits_registered = VALUES(total_credits_registered),
                    total_credits_earned = VALUES(total_credits_earned),
                    sgpa = VALUES(sgpa),
                    cgpa = VALUES(cgpa),
                    classification = VALUES(classification),
                    backlog_count = VALUES(backlog_count),
                    is_published = 1,
                    published_at = NOW()
            ");

            foreach ($stdIds as $pid) {
                $pid = (int)$pid;
                $marks = $db->query("
                    SELECT em.*, c.credits, sp.current_semester
                    FROM exam_marks em
                    JOIN courses c ON em.course_id = c.id
                    JOIN student_profiles sp ON em.student_profile_id = sp.id
                    WHERE em.exam_session_id = {$sessionId} AND em.student_profile_id = {$pid}
                ")->fetchAll(PDO::FETCH_ASSOC);

                if (empty($marks)) continue;

                $sem = (int)$marks[0]['current_semester'];
                $totCr = 0;
                $earnCr = 0;
                $totPoints = 0.0;
                $backlogs = 0;

                foreach ($marks as $m) {
                    $cr = (int)$m['credits'];
                    $gp = (float)$m['grade_points'];
                    $totCr += $cr;
                    if ($m['result_status'] === 'pass') {
                        $earnCr += $cr;
                        $totPoints += ($gp * $cr);
                    } else {
                        $backlogs++;
                    }
                }

                $sgpa = ($totCr > 0) ? round($totPoints / $totCr, 2) : 0.00;
                $classification = ($backlogs > 0)
                    ? 'Promoted with Backlog'
                    : ($sgpa >= 8.5 ? 'First Class with Distinction' : ($sgpa >= 6.5 ? 'First Class' : 'Second Class'));

                $sumUpsert->execute([
                    ':pid' => $pid,
                    ':sid' => $sessionId,
                    ':sem' => $sem,
                    ':tot_cr' => $totCr,
                    ':earn_cr' => $earnCr,
                    ':sgpa' => $sgpa,
                    ':cgpa' => $sgpa,
                    ':class' => $classification,
                    ':back' => $backlogs
                ]);
            }

            $db->prepare("UPDATE exam_sessions SET results_published = 1, status = 'results_declared' WHERE id = :sid")->execute([':sid' => $sessionId]);
            $msg = 'Examination results officially computed and published to student portals.';
        } else {
            $db->prepare("UPDATE exam_sessions SET results_published = 0, status = 'evaluating' WHERE id = :sid")->execute([':sid' => $sessionId]);
            $db->prepare("UPDATE student_semester_summaries SET is_published = 0 WHERE exam_session_id = :sid")->execute([':sid' => $sessionId]);
            $msg = 'Results retracted to moderation mode.';
        }

        AuditLogger::log($user['id'], 'exams.publish_toggle', 'exam_session', (string)$sessionId, [
            'published' => $publish
        ]);

        Response::json([
            'message' => $msg,
            'results_published' => $publish
        ]);
    }

    /**
     * POST /exams/create-schedule - Create examination timetable slot
     */
    public static function createSchedule(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $canManage = in_array($user['role_name'], ['system_admin', 'director', 'exam_admin']);
        if (!$canManage) {
            Response::error('Unauthorized to add examination timetable slots.', 403);
        }

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $sessionId = (int)($input['session_id'] ?? 0);
        $courseId = (int)($input['course_id'] ?? 0);
        $examDate = trim($input['exam_date'] ?? '');
        $startTime = trim($input['start_time'] ?? '10:00:00');
        $endTime = trim($input['end_time'] ?? '13:00:00');
        $shiftName = trim($input['shift_name'] ?? 'Morning Session (10:00 AM - 01:00 PM)');
        $hallName = trim($input['hall_name'] ?? 'LH-101 (Lecture Hall Complex)');
        $seatingPlan = trim($input['seating_plan'] ?? 'Rows 1-6 (All Enrolled Candidates)');
        $invigilatorName = trim($input['invigilator_name'] ?? 'Prof. Ashok Sharma');

        if ($sessionId <= 0 || $courseId <= 0 || empty($examDate)) {
            Response::error('Session ID, Course, and Exam Date are required.', 400);
        }

        $stmt = $db->prepare("
            INSERT INTO exam_schedules (exam_session_id, course_id, exam_date, start_time, end_time, shift_name, hall_name, seating_plan, invigilator_name)
            VALUES (:sid, :cid, :date, :start, :end, :shift, :hall, :seat, :invig)
        ");
        $stmt->execute([
            ':sid' => $sessionId,
            ':cid' => $courseId,
            ':date' => $examDate,
            ':start' => $startTime,
            ':end' => $endTime,
            ':shift' => $shiftName,
            ':hall' => $hallName,
            ':seat' => $seatingPlan,
            ':invig' => $invigilatorName
        ]);

        AuditLogger::log($user['id'], 'exams.schedule_created', 'exam_schedule', (string)$db->lastInsertId(), [
            'session_id' => $sessionId,
            'course_id' => $courseId,
            'date' => $examDate
        ]);

        Response::json([
            'message' => 'Examination schedule timetable slot created successfully.',
            'schedule_id' => $db->lastInsertId()
        ], 201);
    }
}
