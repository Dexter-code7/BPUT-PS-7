-- Phase 5: Institutional Grievance & Maintenance Ticketing (SLA & Auto-Routing Engine)
USE collegelife_db;

-- 1. Grievance Categories Table
CREATE TABLE IF NOT EXISTS grievance_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    department_name VARCHAR(150) NOT NULL,
    description TEXT,
    default_sla_hours INT NOT NULL DEFAULT 24,
    priority_default ENUM('low', 'medium', 'high', 'emergency') DEFAULT 'medium',
    icon_name VARCHAR(50) DEFAULT 'Wrench',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Grievance Tickets Table
CREATE TABLE IF NOT EXISTS grievances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(60) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location_type VARCHAR(60) NOT NULL,
    location_details VARCHAR(255) NOT NULL,
    priority ENUM('low', 'medium', 'high', 'emergency') DEFAULT 'medium',
    status ENUM('submitted', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'escalated', 'closed', 'rejected') DEFAULT 'submitted',
    sla_hours INT NOT NULL DEFAULT 24,
    sla_deadline DATETIME NOT NULL,
    assigned_department VARCHAR(150) NOT NULL,
    assigned_staff_id INT NULL,
    assigned_technician_name VARCHAR(150) NULL,
    assigned_technician_contact VARCHAR(50) NULL,
    assigned_at DATETIME NULL,
    attachment_name VARCHAR(255) NULL,
    attachment_url VARCHAR(255) NULL,
    resolution_notes TEXT NULL,
    resolution_otp VARCHAR(10) NULL,
    resolved_at DATETIME NULL,
    is_escalated TINYINT(1) DEFAULT 0,
    escalated_at DATETIME NULL,
    escalated_to VARCHAR(150) NULL,
    escalation_reason TEXT NULL,
    student_rating INT NULL,
    student_feedback TEXT NULL,
    rated_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES grievance_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_staff_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_grv_user (user_id),
    INDEX idx_grv_cat (category_id),
    INDEX idx_grv_status (status),
    INDEX idx_grv_deadline (sla_deadline)
) ENGINE=InnoDB;

-- 3. Grievance Timeline & Audit Tracking Table
CREATE TABLE IF NOT EXISTS grievance_timeline (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grievance_id INT NOT NULL,
    actor_user_id INT NULL,
    action VARCHAR(80) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grievance_id) REFERENCES grievances(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_timeline_grv (grievance_id)
) ENGINE=InnoDB;
