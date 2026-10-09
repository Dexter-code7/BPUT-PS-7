<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = Database::getConnection();

    // 1. Create notice_automation_settings table
    $db->exec("
        CREATE TABLE IF NOT EXISTS notice_automation_settings (
            id INT PRIMARY KEY AUTO_INCREMENT,
            is_enabled TINYINT(1) DEFAULT 1,
            interval_hours INT DEFAULT 1,
            quiet_hours_enabled TINYINT(1) DEFAULT 1,
            quiet_hours_start TIME DEFAULT '00:00:00',
            quiet_hours_end TIME DEFAULT '05:00:00',
            max_reminders_per_student INT DEFAULT 5,
            initial_delay_hours INT DEFAULT 1,
            warning_tone VARCHAR(50) DEFAULT 'statutory',
            custom_directive_note TEXT NULL,
            last_run_at DATETIME NULL,
            last_run_status VARCHAR(50) DEFAULT 'idle',
            last_run_summary JSON NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    ");

    // 2. Check if row exists, insert default if missing
    $stmt = $db->query("SELECT COUNT(*) FROM notice_automation_settings WHERE id = 1");
    if ($stmt->fetchColumn() == 0) {
        $db->exec("
            INSERT INTO notice_automation_settings (
                id, is_enabled, interval_hours, quiet_hours_enabled, quiet_hours_start, quiet_hours_end,
                max_reminders_per_student, initial_delay_hours, warning_tone, custom_directive_note
            ) VALUES (
                1, 1, 1, 1, '00:00:00', '05:00:00',
                5, 1, 'statutory', 'Urgent Notice: This is an automated periodic reminder. You are mandated to submit your formal acknowledgment immediately.'
            )
        ");
        echo "Inserted default automation settings.\n";
    } else {
        echo "Automation settings row already exists.\n";
    }

    // 3. Alter notice_reminders table columns safely
    $cols = $db->query("SHOW COLUMNS FROM notice_reminders LIKE 'is_automated'")->fetch();
    if (!$cols) {
        $db->exec("ALTER TABLE notice_reminders ADD COLUMN is_automated TINYINT(1) DEFAULT 0 AFTER is_read");
        echo "Added column is_automated to notice_reminders.\n";
    }

    $cols2 = $db->query("SHOW COLUMNS FROM notice_reminders LIKE 'reminder_sequence'")->fetch();
    if (!$cols2) {
        $db->exec("ALTER TABLE notice_reminders ADD COLUMN reminder_sequence INT DEFAULT 1 AFTER is_automated");
        echo "Added column reminder_sequence to notice_reminders.\n";
    }

    $cols3 = $db->query("SHOW COLUMNS FROM notice_reminders LIKE 'trigger_reason'")->fetch();
    if (!$cols3) {
        $db->exec("ALTER TABLE notice_reminders ADD COLUMN trigger_reason VARCHAR(100) DEFAULT 'manual' AFTER reminder_sequence");
        echo "Added column trigger_reason to notice_reminders.\n";
    }

    echo "Migration phase 4 automation completed successfully!\n";
} catch (\Throwable $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
