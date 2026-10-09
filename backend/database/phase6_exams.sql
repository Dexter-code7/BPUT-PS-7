-- Phase 6: Institutional Examination & Academic Performance System
USE collegelife_db;

-- 1. Courses / Subjects Master
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    department_id INT NOT NULL,
    program_id INT NOT NULL,
    semester INT NOT NULL DEFAULT 1,
    credits INT NOT NULL DEFAULT 4,
    max_internal_marks INT NOT NULL DEFAULT 40,
    max_external_marks INT NOT NULL DEFAULT 60,
    pass_percentage DECIMAL(5,2) DEFAULT 40.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 2. Examination Sessions (Terms)
CREATE TABLE IF NOT EXISTS exam_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_code VARCHAR(60) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    academic_year VARCHAR(20) NOT NULL DEFAULT '2026-2027',
    term_type ENUM('end_sem', 'mid_sem', 'supplementary', 'practical') DEFAULT 'end_sem',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    admit_cards_published TINYINT(1) DEFAULT 1,
    results_published TINYINT(1) DEFAULT 1,
    status ENUM('draft', 'scheduled', 'ongoing', 'evaluating', 'results_declared') DEFAULT 'results_declared',
    exam_center_name VARCHAR(150) DEFAULT 'Main Academic Block - Examination Center',
    chief_invigilator_name VARCHAR(150) DEFAULT 'Dr. Vandana Saxena',
    instructions TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Examination Schedule (Timetable Slots)
CREATE TABLE IF NOT EXISTS exam_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_session_id INT NOT NULL,
    course_id INT NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL DEFAULT '10:00:00',
    end_time TIME NOT NULL DEFAULT '13:00:00',
    shift_name VARCHAR(60) DEFAULT 'Morning Session (10:00 AM - 01:00 PM)',
    hall_name VARCHAR(100) NOT NULL DEFAULT 'LH-101 (Lecture Hall Complex)',
    seating_plan VARCHAR(255) DEFAULT 'Rows 1-6 (All Enrolled Candidates)',
    invigilator_name VARCHAR(150) DEFAULT 'Prof. Ashok Sharma',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_session_id) REFERENCES exam_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Admit Cards (Hall Tickets / Roll Slips)
CREATE TABLE IF NOT EXISTS admit_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admit_card_number VARCHAR(80) UNIQUE NOT NULL,
    student_profile_id INT NOT NULL,
    exam_session_id INT NOT NULL,
    attendance_percentage DECIMAL(5,2) NOT NULL DEFAULT 85.00,
    fee_clearance_status ENUM('cleared', 'pending', 'waived') DEFAULT 'cleared',
    eligibility_status ENUM('eligible', 'detained', 'provisional') DEFAULT 'eligible',
    status ENUM('issued', 'withheld', 'collected') DEFAULT 'issued',
    issued_at DATETIME NULL,
    qr_security_hash VARCHAR(128) NOT NULL,
    seating_hall_allotment VARCHAR(150) DEFAULT 'Hall A-102, Desk #14',
    remarks VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_session_id) REFERENCES exam_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Individual Course Examination Marks & Grades
CREATE TABLE IF NOT EXISTS exam_marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_session_id INT NOT NULL,
    course_id INT NOT NULL,
    student_profile_id INT NOT NULL,
    internal_marks DECIMAL(5,2) DEFAULT 0.00,
    external_marks DECIMAL(5,2) DEFAULT 0.00,
    total_marks DECIMAL(5,2) DEFAULT 0.00,
    grade_letter VARCHAR(5) DEFAULT 'F',
    grade_points DECIMAL(4,2) DEFAULT 0.00,
    result_status ENUM('pass', 'fail', 'absent', 'malpractice') DEFAULT 'pass',
    credits INT NOT NULL DEFAULT 4,
    evaluated_by_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_session_id) REFERENCES exam_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Student Semester Results Summary (SGPA / CGPA Ledger)
CREATE TABLE IF NOT EXISTS student_semester_summaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id INT NOT NULL,
    exam_session_id INT NOT NULL,
    semester INT NOT NULL,
    total_credits_registered INT NOT NULL DEFAULT 20,
    total_credits_earned INT NOT NULL DEFAULT 20,
    sgpa DECIMAL(4,2) NOT NULL DEFAULT 8.00,
    cgpa DECIMAL(4,2) NOT NULL DEFAULT 8.00,
    classification VARCHAR(60) DEFAULT 'First Class with Distinction',
    backlog_count INT DEFAULT 0,
    is_published TINYINT(1) DEFAULT 1,
    published_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_session_id) REFERENCES exam_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB;
