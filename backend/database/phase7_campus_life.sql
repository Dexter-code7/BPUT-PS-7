-- Phase 7: Campus Life, Gatepass, Mess Operations, and Academic Attendance Health
-- Strict Institutional Light Schema

CREATE TABLE IF NOT EXISTS `gatepasses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pass_number` VARCHAR(32) NOT NULL UNIQUE,
  `student_id` INT NOT NULL,
  `pass_type` ENUM('day_outpass', 'night_outpass', 'emergency', 'vacation') NOT NULL DEFAULT 'day_outpass',
  `destination` VARCHAR(255) NOT NULL,
  `reason` TEXT NOT NULL,
  `out_time_expected` DATETIME NOT NULL,
  `in_time_expected` DATETIME NOT NULL,
  `actual_out_time` DATETIME NULL,
  `actual_in_time` DATETIME NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'departed', 'returned', 'overdue') DEFAULT 'pending',
  `qr_token` VARCHAR(64) NOT NULL,
  `security_code` VARCHAR(8) NOT NULL,
  `warden_action_by` INT NULL,
  `warden_remarks` VARCHAR(255) NULL,
  `curfew_breach_minutes` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_gp_student` (`student_id`),
  INDEX `idx_gp_status` (`status`),
  INDEX `idx_gp_sec_code` (`security_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `mess_menu` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `day_of_week` ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
  `meal_type` ENUM('breakfast', 'lunch', 'snacks', 'dinner') NOT NULL,
  `items` TEXT NOT NULL,
  `nutritional_tags` VARCHAR(100) DEFAULT 'Pure Vegetarian',
  `is_special` TINYINT(1) DEFAULT 0,
  `cutoff_time` TIME NOT NULL DEFAULT '17:00:00',
  UNIQUE KEY `uq_mess_day_meal` (`day_of_week`, `meal_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `mess_rsvps` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `meal_type` ENUM('breakfast', 'lunch', 'snacks', 'dinner') NOT NULL,
  `status` ENUM('attending', 'skipping') DEFAULT 'attending',
  `rebate_credits` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_mess_student_date_meal` (`student_id`, `date`, `meal_type`),
  INDEX `idx_mess_date_meal` (`date`, `meal_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `mess_feedback` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `meal_type` ENUM('breakfast', 'lunch', 'snacks', 'dinner') NOT NULL,
  `rating_taste` TINYINT NOT NULL DEFAULT 4,
  `rating_hygiene` TINYINT NOT NULL DEFAULT 4,
  `comment` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_feedback_date` (`date`, `meal_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `timetable_slots` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `department_id` INT NOT NULL DEFAULT 1,
  `semester` INT NOT NULL DEFAULT 6,
  `section` VARCHAR(10) NOT NULL DEFAULT 'A',
  `day_of_week` ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday') NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `subject_code` VARCHAR(20) NOT NULL,
  `subject_name` VARCHAR(100) NOT NULL,
  `faculty_name` VARCHAR(100) NOT NULL,
  `room_number` VARCHAR(50) NOT NULL,
  `status` ENUM('scheduled', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
  `notice_note` VARCHAR(255) NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tt_lookup` (`department_id`, `semester`, `section`, `day_of_week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `attendance_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `subject_code` VARCHAR(20) NOT NULL,
  `subject_name` VARCHAR(100) NOT NULL,
  `faculty_name` VARCHAR(100) NOT NULL,
  `total_classes` INT DEFAULT 0,
  `attended_classes` INT DEFAULT 0,
  `percentage` DECIMAL(5,2) DEFAULT 100.00,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_att_student_subject` (`student_id`, `subject_code`),
  INDEX `idx_att_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
