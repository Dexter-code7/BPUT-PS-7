<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/auth.php';

$db = Database::getConnection();
$studentUser = $db->query("SELECT id FROM users WHERE username = 'ashish'")->fetch(PDO::FETCH_ASSOC);
$wardenUser = $db->query("SELECT id FROM users WHERE username = 'warden_singh'")->fetch(PDO::FETCH_ASSOC);

$studentToken = AuthHelper::createToken((int)$studentUser['id']);
$wardenToken = AuthHelper::createToken((int)$wardenUser['id']);

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

echo "=== PHASE 5 GRIEVANCE & MAINTENANCE TEST CYCLE ===\n\n";

// 1. Fetch categories
echo "1. Fetching Categories...\n";
$catRes = callApi('grievances/categories', 'GET');
echo "Categories status: {$catRes['code']}, found: " . count($catRes['body']['data']['categories'] ?? []) . "\n";

// 2. Student lists current tickets
echo "\n2. Student 'ashish' listing tickets...\n";
$listRes = callApi('grievances', 'GET', null, $studentToken);
echo "Tickets found for ashish: " . count($listRes['body']['data']['grievances'] ?? []) . "\n";
foreach ($listRes['body']['data']['grievances'] ?? [] as $t) {
    echo "  - [{$t['ticket_number']}] {$t['title']} | Status: {$t['status']} | Priority: {$t['priority']} | SLA Breached: " . ($t['is_overdue'] ? 'YES' : 'NO') . " | OTP: {$t['resolution_otp']}\n";
}

// 3. Create a new grievance ticket
echo "\n3. Creating new grievance for Room 204 Fan Repair...\n";
$createRes = callApi('grievances/create', 'POST', [
    'category_id' => 2, // Electrical
    'title' => 'Ceiling Fan Regulator Sparking and High Noise',
    'description' => 'The ceiling fan speed regulator in Room 204 B-Block is throwing visible sparks whenever switched from speed 2 to 3. Needs immediate replacement before short circuit occurs.',
    'priority' => 'high',
    'location_type' => 'hostel_room',
    'location_details' => 'Boys Hostel Block B - Room 204'
], $studentToken);

echo "Create Status: {$createRes['code']}\n";
$newTicketData = $createRes['body']['data'] ?? null;
if ($newTicketData && !empty($newTicketData['grievance_id'])) {
    $newTicketId = $newTicketData['grievance_id'];
    $ticketNum = $newTicketData['ticket_number'];
    $otp = $newTicketData['resolution_otp'];
    echo "Created Ticket: {$ticketNum} (ID: {$newTicketId})\n";
    echo "Calculated SLA Hours: {$newTicketData['sla_hours']} hrs | Target: {$newTicketData['sla_deadline']}\n";
    echo "Physical Verification OTP: {$otp}\n";

    // 4. Warden assigns technician
    echo "\n4. Warden assigning technician to ticket...\n";
    $assignRes = callApi('grievances/assign', 'POST', [
        'ticket_id' => $newTicketId,
        'technician_name' => 'Rajesh Sharma',
        'technician_contact' => '+91 98110 44219',
        'notes' => 'Technician instructed to carry replacement anchor regulator and safety test kit.'
    ], $wardenToken);
    echo "Assign Status: {$assignRes['code']} | Message: " . ($assignRes['body']['message'] ?? '') . "\n";

    // 5. Test wrong OTP resolution
    echo "\n5. Testing resolution with WRONG OTP (0000)...\n";
    $wrongOtpRes = callApi('grievances/resolve', 'POST', [
        'ticket_id' => $newTicketId,
        'otp' => '0000',
        'resolution_notes' => 'Completed work.'
    ], $wardenToken);
    echo "Wrong OTP Status: {$wrongOtpRes['code']} | Error: " . ($wrongOtpRes['body']['message'] ?? '') . "\n";

    // 6. Test correct OTP resolution
    echo "\n6. Testing resolution with CORRECT OTP ({$otp})...\n";
    $correctOtpRes = callApi('grievances/resolve', 'POST', [
        'ticket_id' => $newTicketId,
        'otp' => $otp,
        'resolution_notes' => 'Replaced burnt regulator with new Cona 5-step modular regulator. Tested and grounded properly.'
    ], $wardenToken);
    echo "Correct OTP Status: {$correctOtpRes['code']} | Message: " . ($correctOtpRes['body']['message'] ?? '') . "\n";

    // 7. Student rates resolution
    echo "\n7. Student submitting 5-star rating...\n";
    $rateRes = callApi('grievances/rate', 'POST', [
        'ticket_id' => $newTicketId,
        'rating' => 5,
        'feedback' => 'Electrician arrived within 2 hours, wore safety gear and fixed it quickly. Very satisfied.'
    ], $studentToken);
    echo "Rate Status: {$rateRes['code']} | Message: " . ($rateRes['body']['message'] ?? '') . "\n";

    // 8. Fetch updated detail
    echo "\n8. Fetching updated ticket details...\n";
    $detailRes = callApi("grievances/detail&id={$newTicketId}", 'GET', null, $studentToken);
    echo "Detail Response Status: {$detailRes['code']}\n";
    echo "Detail Response Body: " . json_encode($detailRes['body']) . "\n";
    $detail = $detailRes['body']['data']['grievance'] ?? [];
    echo "Ticket Status: {$detail['status']}\n";
    echo "Technician: {$detail['assigned_technician_name']} ({$detail['assigned_technician_contact']})\n";
    echo "Rating: {$detail['student_rating']} / 5\n";
    echo "Feedback: {$detail['student_feedback']}\n";
    echo "Timeline Events Count: " . count($detailRes['body']['data']['timeline'] ?? []) . "\n";
} else {
    echo "Failed to create ticket: " . json_encode($createRes['body']) . "\n";
}

echo "\n=== COMPLETED CYCLE VALIDATION ===\n";
