-- Phase 4: Targeted Announcements & Notification System Schema
USE collegelife_db;

-- 1. Notices Table
CREATE TABLE IF NOT EXISTS notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notice_number VARCHAR(60) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('academic', 'administrative', 'examination', 'hostel_mess', 'cultural_sports', 'placement', 'general') DEFAULT 'general',
    priority ENUM('normal', 'important', 'urgent', 'circular') DEFAULT 'normal',
    is_pinned TINYINT(1) DEFAULT 0,
    requires_acknowledgment TINYINT(1) DEFAULT 0,
    target_scope ENUM('all', 'department', 'semester', 'section', 'hostel', 'tag') DEFAULT 'all',
    department_id INT NULL,
    program_id INT NULL,
    semester INT NULL,
    section VARCHAR(10) NULL,
    hostel_name VARCHAR(100) NULL,
    target_tag_id INT NULL,
    author_user_id INT NOT NULL,
    reference_circular_no VARCHAR(100) NULL,
    attachment_name VARCHAR(255) NULL,
    attachment_url VARCHAR(255) NULL,
    attachment_size VARCHAR(50) NULL,
    expires_at DATE NULL,
    status ENUM('published', 'archived', 'draft') DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL,
    FOREIGN KEY (target_tag_id) REFERENCES tags(id) ON DELETE SET NULL,
    FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notice_scope (target_scope, department_id, semester, section),
    INDEX idx_notice_created (created_at, is_pinned)
) ENGINE=InnoDB;

-- 2. Notice Reads & Acknowledgment Audit Tracking Table
CREATE TABLE IF NOT EXISTS notice_reads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notice_id INT NOT NULL,
    user_id INT NOT NULL,
    first_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP NULL,
    acknowledgment_note VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    UNIQUE KEY unique_user_notice (notice_id, user_id),
    INDEX idx_notice_reads_audit (notice_id, acknowledged_at),
    FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
