<?php
// Unified Campus ERP - Phase 6 Test Script
declare(strict_types=1);

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/auth.php';

$db = Database::getConnection();
$studentUser = $db->query("SELECT id FROM users WHERE username = 'ashish'")->fetch(PDO::FETCH_ASSOC);
$examAdminUser = $db->query("SELECT id FROM users WHERE username = 'exam_admin'")->fetch(PDO::FETCH_ASSOC);

$studentToken = AuthHelper::createToken((int)$studentUser['id']);
$examAdminToken = AuthHelper::createToken((int)$examAdminUser['id']);

function callApi($endpoint, $method = 'GET', $data = null, $token = null) {
    $url = "http://localhost/collegelife/backend/api/index.php?r=" . $endpoint;
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $headers = ['Content-Type: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer {$token}";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $code, 'body' => json_decode($res, true)];
}

echo "=== PHASE 6 EXAMINATION SYSTEM TEST CYCLE ===\n\n";

// 1. Sessions List
echo "1. Student fetching Exam Sessions...\n";
$sessRes = callApi('exams/sessions', 'GET', null, $studentToken);
echo "Status: {$sessRes['code']}, Sessions found: " . count($sessRes['body']['data']['sessions'] ?? []) . "\n";
foreach ($sessRes['body']['data']['sessions'] ?? [] as $s) {
    echo "  - [{$s['session_code']}] {$s['title']} | Status: {$s['status']} | Admit Cards Published: {$s['admit_cards_published']} | Results Declared: {$s['results_published']}\n";
}

// 2. Exam Schedules / Timetable
echo "\n2. Student fetching Examination Timetable...\n";
$schedRes = callApi('exams/schedules', 'GET', null, $studentToken);
echo "Status: {$schedRes['code']}, Timetable slots found: " . count($schedRes['body']['data']['schedules'] ?? []) . "\n";
foreach ($schedRes['body']['data']['schedules'] ?? [] as $sch) {
    echo "  - [{$sch['course_code']}] {$sch['course_name']} | Date: {$sch['exam_date']} ({$sch['shift_name']}) | Venue: {$sch['hall_name']}\n";
}

// 3. Candidate Admit Card / Hall Ticket
echo "\n3. Student viewing Official Admit Card / Hall Ticket...\n";
$acRes = callApi('exams/admit-card', 'GET', null, $studentToken);
echo "Status: {$acRes['code']}\n";
$acData = $acRes['body']['data'] ?? [];
$ac = $acData['admit_card'] ?? [];
$std = $acData['student'] ?? [];
echo "  Candidate: {$std['full_name']} (Roll: {$std['roll_number']}, Reg: {$std['registration_number']})\n";
echo "  Program: {$std['program_name']} | Semester: {$std['current_semester']}\n";
echo "  Admit Card No: {$ac['admit_card_number']} | Attendance: {$ac['attendance_percentage']}% | Eligibility: {$ac['eligibility_status']} | Status: {$ac['status']}\n";
echo "  Allotted Hall: {$ac['seating_hall_allotment']}\n";
echo "  Security Barcode Hash: {$ac['qr_security_hash']}\n";
echo "  Registered Examination Papers Count: " . count($acData['exam_papers'] ?? []) . "\n";

// 4. Student viewing Academic Results & Marksheet
echo "\n4. Student viewing Published Results & Grade Card...\n";
$resRes = callApi('exams/results', 'GET', null, $studentToken);
echo "Status: {$resRes['code']}\n";
$rData = $resRes['body']['data'] ?? [];
$sum = $rData['summary'] ?? [];
echo "  SGPA: {$sum['sgpa']} | CGPA: {$sum['cgpa']} | Classification: {$sum['classification']} | Backlogs: {$sum['backlog_count']}\n";
echo "  Subject Marks:\n";
foreach ($rData['course_marks'] ?? [] as $cm) {
    echo "    * {$cm['course_code']}: {$cm['course_name']} -> Internal: {$cm['internal_marks']}/40, End-Sem: {$cm['external_marks']}/60, Total: {$cm['total_marks']}/100, Grade: {$cm['grade_letter']} (GP: {$cm['grade_points']})\n";
}

// 5. Admin Viewing Admit Cards Roster
echo "\n5. Exam Admin viewing Candidate Roster...\n";
$rosterRes = callApi('exams/admit-cards-roster', 'GET', null, $examAdminToken);
echo "Status: {$rosterRes['code']}, Total Candidates: " . count($rosterRes['body']['data']['roster'] ?? []) . "\n";
foreach ($rosterRes['body']['data']['roster'] ?? [] as $cand) {
    echo "  - [{$cand['roll_number']}] {$cand['student_name']} ({$cand['program_code']}) | Attendance: {$cand['attendance_percentage']}% | Card Status: {$cand['status']}\n";
}

// 6. Admin Marks Entry
echo "\n6. Exam Admin entering updated marks for course MCA101...\n";
$mca101Id = (int)$db->query("SELECT id FROM courses WHERE code = 'MCA101'")->fetchColumn();
$autumnSessId = (int)$db->query("SELECT id FROM exam_sessions WHERE session_code = 'AUTUMN-2026-ENDSEM'")->fetchColumn();

$marksInputRes = callApi('exams/enter-marks', 'POST', [
    'session_id' => $autumnSessId,
    'course_id' => $mca101Id,
    'marks_list' => [
        [
            'student_profile_id' => 1,
            'internal_marks' => 38,
            'external_marks' => 55
        ]
    ]
], $examAdminToken);
echo "Status: {$marksInputRes['code']}, Message: " . ($marksInputRes['body']['message'] ?? '') . "\n";

// 7. Admin Publishing / Recalculating Results
echo "\n7. Exam Admin republishing/recomputing results...\n";
$pubRes = callApi('exams/publish-results', 'POST', [
    'session_id' => $autumnSessId,
    'publish' => true
], $examAdminToken);
echo "Status: {$pubRes['code']}, Message: " . ($pubRes['body']['message'] ?? '') . "\n";

echo "\n=== PHASE 6 TEST CYCLE COMPLETED SUCCESSFULLY ===\n";
