<?php
require_once __DIR__ . '/../config/database.php';
try {
    $db = Database::getConnection();

    // Fetch notice 1 (Anti-ragging)
    $stmt = $db->query("SELECT id, notice_number, title, author_user_id FROM notices WHERE notice_number = 'CUT/NOT/2026/001' LIMIT 1");
    $notice = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($notice) {
        $ashishUserStmt = $db->query("SELECT u.id, u.email, sp.full_name, sp.roll_number, sp.college_email FROM users u JOIN student_profiles sp ON u.id = sp.user_id WHERE u.username = 'ashish' LIMIT 1");
        $ashish = $ashishUserStmt->fetch(PDO::FETCH_ASSOC);

        if ($ashish) {
            $directorStmt = $db->query("SELECT sp.full_name, sp.designation FROM staff_profiles sp JOIN users u ON sp.user_id = u.id WHERE u.username = 'director' LIMIT 1");
            $dir = $directorStmt->fetch(PDO::FETCH_ASSOC);

            $subject = "[URGENT STATUTORY REMINDER] Mandatory Anti-Ragging Undertaking Acknowledgment Required";
            $customNote = "Final reminder before semester registration debarment. Please record your acknowledgment immediately.";
            $emailBody = "Dear {$ashish['full_name']} (Roll No: {$ashish['roll_number']}),\n\n"
                       . "Our central institutional records indicate that you have NOT yet submitted your formal acknowledgment for the following statutory university directive:\n\n"
                       . "--------------------------------------------------------------------------------\n"
                       . "Circular Reference: {$notice['notice_number']}\n"
                       . "Directive Subject:  {$notice['title']}\n"
                       . "Issuing Authority:  {$dir['full_name']} ({$dir['designation']})\n"
                       . "--------------------------------------------------------------------------------\n\n"
                       . "URGENT INSTRUCTION FROM DIRECTORATE:\n"
                       . "{$customNote}\n\n"
                       . "As per the directives of the Hon'ble Supreme Court of India and university bylaws, you are required to log into the Central ERP portal (http://localhost:5173/notices) immediately, review the circular text, and click the 'I Acknowledge & Understand' button.\n\n"
                       . "Failure to record your institutional acknowledgment may lead to suspension of hostel amenities and semester examination debarment.\n\n"
                       . "Regards,\n"
                       . "Central Governance & Compliance Registry\n"
                       . "Central University of Technology";

            $ins = $db->prepare("
                INSERT INTO notice_reminders (
                    notice_id, sender_user_id, recipient_user_id,
                    recipient_email, recipient_name, recipient_roll,
                    email_subject, email_body, custom_note, is_read, dispatched_at
                ) VALUES (
                    :nid, :sender, :recipient,
                    :email, :name, :roll,
                    :subj, :body, :note, 0, NOW()
                )
            ");
            $ins->execute([
                ':nid' => $notice['id'],
                ':sender' => $notice['author_user_id'],
                ':recipient' => $ashish['id'],
                ':email' => $ashish['college_email'],
                ':name' => $ashish['full_name'],
                ':roll' => $ashish['roll_number'],
                ':subj' => $subject,
                ':body' => $emailBody,
                ':note' => $customNote
            ]);
            echo "Seeded initial reminder email to Ashish for notice {$notice['notice_number']}.\n";
        }
    }
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
