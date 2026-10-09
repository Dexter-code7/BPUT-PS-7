-- Phase 2: Smart Forms Engine Schema & Initial Master Data
USE collegelife_db;

-- 1. Smart Forms Master Table
CREATE TABLE IF NOT EXISTS smart_forms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    category VARCHAR(80) DEFAULT 'General',
    status ENUM('draft', 'published', 'closed', 'archived') DEFAULT 'published',
    target_scope VARCHAR(80) DEFAULT 'all',
    target_department_id INT NULL,
    target_program_id INT NULL,
    target_semester INT NULL,
    target_section VARCHAR(10) NULL,
    erp_fields JSON NOT NULL,
    allow_multiple_submissions TINYINT(1) DEFAULT 0,
    expires_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (target_program_id) REFERENCES programs(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 2. Custom Questions / Form Fields Table
CREATE TABLE IF NOT EXISTS smart_form_fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_id INT NOT NULL,
    field_key VARCHAR(80) NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_type ENUM('text', 'textarea', 'number', 'select', 'radio', 'checkbox', 'date', 'file', 'consent') DEFAULT 'text',
    help_text VARCHAR(255) NULL,
    options JSON NULL,
    is_required TINYINT(1) DEFAULT 1,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES smart_forms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Form Submissions Table
CREATE TABLE IF NOT EXISTS smart_form_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_id INT NOT NULL,
    user_id INT NOT NULL,
    erp_snapshot JSON NOT NULL,
    answers JSON NOT NULL,
    status ENUM('submitted', 'under_review', 'approved', 'rejected') DEFAULT 'submitted',
    reviewed_by INT NULL,
    reviewer_notes TEXT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES smart_forms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forms_status ON smart_forms(status, target_scope);
CREATE INDEX IF NOT EXISTS idx_submissions_form ON smart_form_submissions(form_id, user_id);
