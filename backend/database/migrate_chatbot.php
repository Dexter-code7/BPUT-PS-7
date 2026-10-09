<?php
// Migration for Self-Learning Grok-Powered CampusDesk Chatbot & Support Desk
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

$db = Database::getConnection();

echo "Running Chatbot & Support Desk schema migration...\n";

// 1. Learned Q&A Knowledge Base
$db->exec("
    CREATE TABLE IF NOT EXISTS chatbot_learned_qa (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_pattern VARCHAR(255) NOT NULL,
        keywords VARCHAR(500) NOT NULL,
        answer_text TEXT NOT NULL,
        answer_hi TEXT NULL,
        answer_or TEXT NULL,
        category VARCHAR(64) DEFAULT 'general',
        action_route VARCHAR(128) NULL,
        taught_by_user_id INT NULL,
        times_used INT DEFAULT 0,
        is_verified TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_keywords (keywords(255)),
        INDEX idx_verified (is_verified)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// 2. Chatbot Support Sessions
$db->exec("
    CREATE TABLE IF NOT EXISTS chatbot_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        session_token VARCHAR(64) NOT NULL,
        status ENUM('bot', 'escalated_pending', 'human_active', 'resolved', 'closed') DEFAULT 'bot',
        human_request_count INT DEFAULT 0,
        unresolved_question TEXT NULL,
        escalated_at DATETIME NULL,
        assigned_staff_id INT NULL,
        resolved_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// 3. Chatbot Messages
$db->exec("
    CREATE TABLE IF NOT EXISTS chatbot_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        sender_type ENUM('student', 'bot', 'human_staff') NOT NULL,
        sender_user_id INT NULL,
        message_text TEXT NOT NULL,
        is_learned TINYINT(1) DEFAULT 0,
        action_route VARCHAR(128) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_session (session_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// 4. Chatbot Config / System Settings
$db->exec("
    CREATE TABLE IF NOT EXISTS chatbot_settings (
        setting_key VARCHAR(64) PRIMARY KEY,
        setting_value TEXT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// Seed initial settings (e.g. Grok API model, handover threshold)
$db->exec("
    INSERT IGNORE INTO chatbot_settings (setting_key, setting_value) VALUES
    ('grok_api_key', ''),
    ('grok_model', 'grok-beta'),
    ('human_escalation_threshold', '2'),
    ('campus_office_hours', 'Monday to Friday, 09:30 AM to 05:00 PM');
");

// Seed initial baseline learned questions
$seedQA = [
    [
        'question' => 'What time does the administrative office start and close?',
        'keywords' => 'office time, opening time, office starts, working hours, timings, timing, open, close, hours',
        'answer' => 'The Central University Administrative Offices open at 09:30 AM and close at 05:00 PM (Monday through Friday). Counter clearances operate from 10:00 AM to 03:00 PM.',
        'answer_hi' => 'केंद्रीय विश्वविद्यालय प्रशासनिक कार्यालय सोमवार से शुक्रवार प्रातः 09:30 बजे से सायं 05:00 बजे तक खुलते हैं। छात्र काउंटर 10:00 AM से 03:00 PM तक संचालित होते हैं।',
        'answer_or' => 'କେନ୍ଦ୍ରୀୟ ବିଶ୍ୱବିଦ୍ୟାଳୟ ପ୍ରଶାସନିକ କାର୍ଯ୍ୟାଳୟ ସୋମବାରରୁ ଶୁକ୍ରବାର ସକାଳ ୦୯:୩୦ ରୁ ଅପରାହ୍ନ ୦୫:୦୦ ପର୍ଯ୍ୟନ୍ତ ଖୋଲା ରହିଥାଏ। ଛାତ୍ର କାଉଣ୍ଟର ସକାଳ ୧୦:୦୦ ରୁ ୩:୦୦ ପର୍ଯ୍ୟନ୍ତ ଚାଲେ।',
        'category' => 'administration',
        'route' => '/profile'
    ],
    [
        'question' => 'How can I apply for a duplicate student ID card?',
        'keywords' => 'duplicate id, lost id, id card, new id card, lost id card, missing id',
        'answer' => 'To obtain a Duplicate Identity Card, submit an application via the Digital Services desk with an affidavit/loss declaration. Standard processing fee is ₹150 with a 48-hour issue SLA.',
        'answer_hi' => 'डुप्लिकेट आईडी कार्ड प्राप्त करने के लिए डिजिटल सेवा डेस्क पर शपथ पत्र के साथ आवेदन प्रस्तुत करें। ₹150 शुल्क के साथ 48 घंटे में काउंटर से प्राप्त करें।',
        'answer_or' => 'ଡୁପ୍ଲିକେଟ୍ ଆଇଡି କାର୍ଡ ପାଇଁ ଡିଜିଟାଲ୍ ସେବା କେନ୍ଦ୍ରରେ ଆବେଦନ କରନ୍ତୁ। ₹୧୫୦ ଫିସ୍ ସହ ୪୮ ଘଣ୍ଟା ମଧ୍ୟରେ ନୂତନ କାର୍ଡ ମିଳିବ।',
        'category' => 'services',
        'route' => '/services'
    ],
    [
        'question' => 'What is the mess rebate rule when skipping dinners?',
        'keywords' => 'mess rebate, dinner skip, rebate rule, food credit, skip dinner, mess refund',
        'answer' => 'Hostel residents must toggle "Skip Dinner" before 05:00 PM daily. Each skipped meal awards a ₹25 institutional dining rebate credit adjusted in the next monthly ledger.',
        'answer_hi' => 'छात्र प्रतिदिन सायं 05:00 बजे से पूर्व "Skip Dinner" चुनें। प्रत्येक रद्द भोजन पर ₹25 का मेस रिबेट क्रेडिट अगले बिल में स्वतः समायोजित होता है।',
        'answer_or' => 'ପ୍ରତିଦିନ ସନ୍ଧ୍ୟା ୦୫:୦୦ ପୂର୍ବରୁ "Skip Dinner" କରନ୍ତୁ। ପ୍ରତ୍ୟେକ ବାତିଲ ଡିନର ପାଇଁ ₹୨୫ ରିବେଟ୍ ଆପଣଙ୍କ ମାସିକ ବିଲରେ ଯୋଗ ହେବ।',
        'category' => 'mess',
        'route' => '/mess'
    ],
    [
        'question' => 'What is the 75% attendance rule for semester exams?',
        'keywords' => '75% attendance, attendance rule, exam eligibility, debarment, attendance threshold, bput rule',
        'answer' => 'Under BPUT Academic Regulation 14.2, students must maintain 75.00% aggregate attendance across theory and labs to remain eligible for examination hall ticket release.',
        'answer_hi' => 'बीपीयूटी विनियम 14.2 के तहत परीक्षा हॉल टिकट प्राप्त करने हेतु 75.00% उपस्थिति अनिवार्य है। 75% से कम पर परीक्षा बहिष्कार का नियम लागू होता है।',
        'answer_or' => 'BPUT ଶିକ୍ଷାଗତ ନିୟମାବଳୀ ୧୪.୨ ଅନୁଯାୟୀ ପରୀକ୍ଷା ହଲ୍ ଟିକେଟ୍ ପାଇବା ପାଇଁ ୭୫% ଉପସ୍ଥିତି ବାଧ୍ୟତାମୂଳକ।',
        'category' => 'academics',
        'route' => '/academics'
    ]
];

$insertStmt = $db->prepare("
    INSERT INTO chatbot_learned_qa (question_pattern, keywords, answer_text, answer_hi, answer_or, category, action_route, is_verified, times_used)
    VALUES (:q, :k, :a, :ahi, :aor, :cat, :rt, 1, 5)
");

$existingCount = (int)$db->query("SELECT COUNT(*) FROM chatbot_learned_qa")->fetchColumn();
if ($existingCount === 0) {
    foreach ($seedQA as $item) {
        $insertStmt->execute([
            ':q' => $item['question'],
            ':k' => $item['keywords'],
            ':a' => $item['answer'],
            ':ahi' => $item['answer_hi'],
            ':aor' => $item['answer_or'],
            ':cat' => $item['category'],
            ':rt' => $item['route']
        ]);
    }
    echo "Seeded default learned QA entries.\n";
} else {
    echo "Chatbot learned QA table already has {$existingCount} entries.\n";
}

echo "Migration completed successfully.\n";
