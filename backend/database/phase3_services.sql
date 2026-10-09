-- Phase 3: Digital Service Request Center (Certificates & Applications)
-- Schema for Service Catalog, Student Requests, SLA Tracking & Digital Certificates

CREATE TABLE IF NOT EXISTS service_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('Academic', 'Financial', 'Conduct', 'Identity', 'General') NOT NULL DEFAULT 'Academic',
    sla_hours INT NOT NULL DEFAULT 48,
    fee_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    requires_purpose TINYINT(1) NOT NULL DEFAULT 1,
    requires_supporting_doc TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(50) NOT NULL UNIQUE,
    service_type_id INT NOT NULL,
    user_id INT NOT NULL,
    student_profile_id INT NULL,
    erp_snapshot JSON NOT NULL,
    purpose TEXT NOT NULL,
    additional_details JSON NULL,
    status ENUM('submitted', 'under_review', 'ready', 'delivered', 'rejected') NOT NULL DEFAULT 'submitted',
    assigned_staff_id INT NULL,
    sla_deadline DATETIME NOT NULL,
    admin_notes TEXT NULL,
    rejection_reason TEXT NULL,
    certificate_number VARCHAR(80) NULL UNIQUE,
    issued_at DATETIME NULL,
    delivered_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_service_type (service_type_id),
    INDEX idx_sla (sla_deadline),
    CONSTRAINT fk_sr_service_type FOREIGN KEY (service_type_id) REFERENCES service_types (id) ON DELETE RESTRICT,
    CONSTRAINT fk_sr_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_request_timeline (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    actor_user_id INT NOT NULL,
    action VARCHAR(80) NOT NULL,
    previous_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NOT NULL,
    comment TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_request (request_id),
    CONSTRAINT fk_timeline_request FOREIGN KEY (request_id) REFERENCES service_requests (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
