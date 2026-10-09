-- Master Seed Data for Unified Campus ERP
USE collegelife_db;

-- 1. Departments
INSERT INTO departments (id, code, name, description) VALUES
(1, 'CSE', 'Computer Science and Engineering', 'Department of Computer Science & Information Technology'),
(2, 'ECE', 'Electronics and Communication Engineering', 'Department of Electronics and Communication'),
(3, 'MECH', 'Mechanical Engineering', 'Department of Mechanical Engineering'),
(4, 'CIVIL', 'Civil Engineering', 'Department of Civil Engineering'),
(5, 'ADMIN', 'General Administration', 'Central University Administrative Services')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Programs
INSERT INTO programs (id, department_id, code, name, degree_level, duration_years) VALUES
(1, 1, 'MCA', 'Master of Computer Applications', 'PG', 2),
(2, 1, 'BTECH-CSE', 'B.Tech in Computer Science and Engineering', 'UG', 4),
(3, 2, 'BTECH-ECE', 'B.Tech in Electronics and Communication', 'UG', 4),
(4, 3, 'BTECH-ME', 'B.Tech in Mechanical Engineering', 'UG', 4)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Roles
INSERT INTO roles (id, name, display_name, description) VALUES
(1, 'system_admin', 'System Administrator', 'Full system technical access, role & configuration management'),
(2, 'director', 'Director / Principal', 'Institutional analytics, high-level approvals, campus visibility'),
(3, 'hod', 'Head of Department (HOD)', 'Departmental oversight, approvals, teachers and students view'),
(4, 'teacher', 'Faculty Member / Teacher', 'Class attendance, course materials, smart forms, student grading'),
(5, 'admin_staff', 'Administrative Staff', 'Student service center, certificate processing, official letters'),
(6, 'exam_admin', 'Examination Administrator', 'Admit cards, exam scheduling, marks moderation, result publishing'),
(7, 'admission_staff', 'Admission Officer', 'Student admission intake, document verification, enrollment'),
(8, 'warden', 'Hostel Warden', 'Hostel rooms, gate passes, hostel complaints, mess oversight'),
(9, 'student', 'Student', 'Student self-service portal, forms, requests, attendance, results'),
(10, 'club_coordinator', 'Club Coordinator', 'Club member roster, campus events, registrations')
ON DUPLICATE KEY UPDATE display_name=VALUES(display_name);

-- 4. Permissions
INSERT INTO permissions (id, code, name, module, description) VALUES
(1, 'view_own_profile', 'View Own Profile', 'profile', 'View verified student or staff profile'),
(2, 'edit_own_profile', 'Edit Own Profile Details', 'profile', 'Request or update permitted profile items'),
(3, 'view_student_profile', 'View Student Profiles', 'student', 'View full student ERP profiles within scope'),
(4, 'manage_users', 'Manage Users & Credentials', 'admin', 'Create, update, deactivate user accounts'),
(5, 'manage_roles_tags', 'Manage Roles and Tags', 'admin', 'Configure RBAC roles, tags and permissions'),
(6, 'create_form', 'Create Smart Forms', 'forms', 'Design and publish dynamic ERP-linked forms'),
(7, 'view_form_submissions', 'View Form Submissions', 'forms', 'View, search and export collected form data'),
(8, 'publish_notice', 'Publish Campus Notices', 'notices', 'Create targeted campus announcements'),
(9, 'view_notices', 'View Notices', 'notices', 'Read notices targeted to user role/group'),
(10, 'create_service_request', 'Submit Service Requests', 'services', 'Apply for bonafide, fee structure, certificates'),
(11, 'process_service_request', 'Process Service Requests', 'services', 'Approve, prepare and deliver student certificates'),
(12, 'submit_complaint', 'Submit Grievance Complaint', 'complaints', 'Log maintenance or campus grievances'),
(13, 'manage_complaints', 'Manage & Resolve Complaints', 'complaints', 'Assign, update SLA and resolve grievances'),
(14, 'manage_attendance', 'Take & Edit Attendance', 'academics', 'Log lecture attendance for assigned batches'),
(15, 'view_attendance', 'View Attendance Records', 'academics', 'View subject-wise attendance percentages'),
(16, 'manage_exams', 'Manage Examinations', 'exams', 'Manage exam schedules, seating, hall tickets, marks'),
(17, 'manage_hostel', 'Manage Hostel & Gate Passes', 'hostel', 'Approve leave, room allocation, mess toggle'),
(18, 'manage_clubs', 'Manage Clubs & Events', 'clubs', 'Organize events, recruit members, publish club notices'),
(19, 'view_command_center', 'View Command Center Analytics', 'analytics', 'Access high-level institutional overview')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. Role Permissions Mapping
-- Sys Admin has all
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Director
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 3), (2, 8), (2, 9), (2, 11), (2, 13), (2, 15), (2, 19);

-- HOD
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(3, 1), (3, 3), (3, 6), (3, 7), (3, 8), (3, 9), (3, 11), (3, 14), (3, 15), (3, 19);

-- Teacher
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(4, 1), (4, 3), (4, 6), (4, 7), (4, 8), (4, 9), (4, 14), (4, 15);

-- Admin Staff
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(5, 1), (5, 3), (5, 8), (5, 9), (5, 11), (5, 13), (5, 19);

-- Exam Admin
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(6, 1), (6, 3), (6, 8), (6, 9), (6, 16);

-- Warden
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(8, 1), (8, 3), (8, 8), (8, 9), (8, 13), (8, 17);

-- Student
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(9, 1), (9, 2), (9, 9), (9, 10), (9, 12), (9, 15);

-- Club Coordinator
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(10, 1), (10, 8), (10, 9), (10, 18);

-- 6. Configurable Tags (Designations)
INSERT INTO tags (id, name, display_name, description, is_active) VALUES
(1, 'class_representative', 'Class Representative (CR)', 'Elected student representative for class coordination', 1),
(2, 'deputy_cr', 'Deputy Class Representative', 'Assistant student representative', 1),
(3, 'club_president', 'Club President', 'Head of recognized campus club', 1),
(4, 'event_volunteer', 'Event Volunteer', 'Assigned helper for academic/cultural fest', 1),
(5, 'hostel_representative', 'Hostel Wing Representative', 'Student liaison for hostel wing issues', 1)
ON DUPLICATE KEY UPDATE display_name=VALUES(display_name);

-- Tag specific extra permissions: CR gets extra class-level permissions!
-- For instance: can publish class notice and create class-level smart form
INSERT IGNORE INTO tag_permissions (tag_id, permission_id) VALUES
(1, 6), -- CR can create form for class
(1, 7), -- CR can view form submissions
(1, 8); -- CR can publish class announcement

-- 7. Demo Users (Password: password123 for all demo users)
-- Hash: $2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG
INSERT INTO users (id, username, email, password_hash, primary_role_id, status) VALUES
(1, 'admin', 'admin@campus.edu', '$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG', 1, 'active'),
(2, 'director', 'director@campus.edu', '$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG', 2, 'active'),
(3, 'hod_cse', 'hod.cse@campus.edu', '$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG', 3, 'active'),
(4, 'prof_sharma', 'ashok.sharma@campus.edu', '$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG', 4, 'active'),
(5, 'admin_staff', 'records@campus.edu', '$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG', 5, 'active'),
(6, 'exam_admin', 'controller.exams@campus.edu', '$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG', 6, 'active'),
(7, 'warden_singh', 'warden.bh1@campus.edu', '$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG', 8, 'active'),
(8, 'ashish', 'ashish.toppo@student.campus.edu', '$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG', 9, 'active'),
(9, 'priya_cr', 'priya.patel@student.campus.edu', '$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG', 9, 'active'),
(10, 'aarav_club', 'aarav.robotics@student.campus.edu', '$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG', 10, 'active')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- Assign Priya Patel as CR Tag
INSERT IGNORE INTO user_tags (user_id, tag_id, department_id, scope_details, expires_at) VALUES
(9, 1, 1, 'MCA Section A - Academic Year 2026-27', '2027-06-30 23:59:59');

-- 8. Staff Profiles
INSERT INTO staff_profiles (id, user_id, employee_code, full_name, designation, department_id, qualification, official_email, phone_number, cabin_location, joining_date) VALUES
(1, 1, 'EMP-ADM-001', 'Sunil Narang', 'Chief IT Administrator', 5, 'M.Tech CSE', 'admin@campus.edu', '+91 98765 43210', 'Admin Block A-102', '2020-07-01'),
(2, 2, 'EMP-DIR-001', 'Dr. Radhakrishnan Pillai', 'Director / Principal', 5, 'Ph.D. IIT Delhi', 'director@campus.edu', '+91 98765 43200', 'Directorate Wing Room 1', '2018-01-15'),
(3, 3, 'EMP-CSE-HOD', 'Dr. Meenakshi Sundaram', 'Professor & HOD (CSE)', 1, 'Ph.D. IISc', 'hod.cse@campus.edu', '+91 98765 43201', 'Department Block C-201', '2019-06-10'),
(4, 4, 'EMP-CSE-FAC01', 'Prof. Ashok Sharma', 'Associate Professor', 1, 'M.Tech CSE', 'ashok.sharma@campus.edu', '+91 98765 43202', 'Faculty Cabin C-104', '2021-08-01'),
(5, 5, 'EMP-ADM-STAFF', 'Rajesh Kulkarni', 'Senior Administrative Officer', 5, 'M.A., PGDCA', 'records@campus.edu', '+91 98765 43203', 'Student Service Counter 2', '2017-04-12'),
(6, 6, 'EMP-EXAM-COE', 'Dr. Vandana Saxena', 'Controller of Examinations', 5, 'Ph.D. Mathematics', 'controller.exams@campus.edu', '+91 98765 43204', 'Examination Cell E-01', '2019-11-01'),
(7, 7, 'EMP-HOSTEL-01', 'Col. Mahendra Singh (Retd)', 'Chief Hostel Warden', 5, 'M.Sc. Defence Studies', 'warden.bh1@campus.edu', '+91 98765 43205', 'Boys Hostel 1 Office', '2022-03-01')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 9. Student Profiles (Single Institutional Truth - "Fill Once")
INSERT INTO student_profiles (
    id, user_id, roll_number, registration_number, admission_number,
    full_name, date_of_birth, gender, college_email, personal_email,
    phone_number, department_id, program_id, current_semester, current_year, section,
    father_name, mother_name, guardian_name, parent_phone,
    permanent_address, hostel_resident, hostel_name, room_number,
    academic_status, blood_group
) VALUES
(
    1, 8, '24050101', 'REG2024MCA088', 'ADM-2024-4102',
    'Ashish Toppo', '2002-05-14', 'Male', 'ashish.toppo@student.campus.edu', 'ashish.personal@gmail.com',
    '+91 98765 11223', 1, 1, 1, 1, 'A',
    'Samuel Toppo', 'Anjali Toppo', 'Samuel Toppo', '+91 94371 88990',
    'Plot 142, Kalinga Vihar, Sector 4, Rourkela, Odisha - 769015',
    1, 'Boys Hostel Block B', 'B-204', 'regular', 'B+'
),
(
    2, 9, '24050102', 'REG2024MCA089', 'ADM-2024-4103',
    'Priya Patel', '2002-08-22', 'Female', 'priya.patel@student.campus.edu', 'priya.patel@gmail.com',
    '+91 98765 11224', 1, 1, 1, 1, 'A',
    'Dinesh Patel', 'Hansaben Patel', 'Dinesh Patel', '+91 94371 88991',
    'Flat 302, Green Park Enclave, Cuttack, Odisha - 753001',
    1, 'Girls Hostel Block A', 'GH-112', 'regular', 'O+'
),
(
    3, 10, '23010145', 'REG2023CSE045', 'ADM-2023-3045',
    'Aarav Verma', '2003-11-05', 'Male', 'aarav.robotics@student.campus.edu', 'aarav.v@gmail.com',
    '+91 98765 11225', 1, 2, 3, 2, 'B',
    'Ramesh Verma', 'Sunita Verma', 'Ramesh Verma', '+91 94371 88992',
    'Sector 7, CDA Colony, Bhubaneswar, Odisha - 751010',
    0, NULL, NULL, 'regular', 'A+'
)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);
