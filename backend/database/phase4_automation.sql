-- Phase 4 Extension: Automated Notice Reminder SLA Engine & Quiet Hours Settings
USE collegelife_db;

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

-- Insert default row if not exists
INSERT INTO notice_automation_settings (
    id, is_enabled, interval_hours, quiet_hours_enabled, quiet_hours_start, quiet_hours_end,
    max_reminders_per_student, initial_delay_hours, warning_tone, custom_directive_note
) VALUES (
    1, 1, 1, 1, '00:00:00', '05:00:00',
    5, 1, 'statutory', 'Urgent Notice: This is an automated periodic reminder. You are mandated to submit your formal acknowledgment immediately.'
) ON DUPLICATE KEY UPDATE id=1;

-- Add automated flags to notice_reminders if not existing
ALTER TABLE notice_reminders 
    ADD COLUMN IF NOT EXISTS is_automated TINYINT(1) DEFAULT 0 AFTER is_read,
    ADD COLUMN IF NOT EXISTS reminder_sequence INT DEFAULT 1 AFTER is_automated,
    ADD COLUMN IF NOT EXISTS trigger_reason VARCHAR(100) DEFAULT 'manual' AFTER reminder_sequence;
