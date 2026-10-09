-- Phase 4 Extension: Notice Reminders and Institutional Email Notifications
USE collegelife_db;

CREATE TABLE IF NOT EXISTS notice_reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notice_id INT NOT NULL,
    sender_user_id INT NOT NULL,
    recipient_user_id INT NOT NULL,
    recipient_email VARCHAR(150) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    recipient_roll VARCHAR(50) NOT NULL,
    email_subject VARCHAR(255) NOT NULL,
    email_body TEXT NOT NULL,
    custom_note VARCHAR(255) NULL,
    is_read TINYINT(1) DEFAULT 0,
    dispatched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rem_recipient (recipient_user_id, is_read),
    INDEX idx_rem_notice (notice_id, dispatched_at),
    FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
