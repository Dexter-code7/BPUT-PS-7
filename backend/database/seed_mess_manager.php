<?php
require 'd:/xammp/htdocs/collegelife/backend/config/database.php';
$db = Database::getConnection();

// 1. Ensure mess_manager role exists
$role = $db->query("SELECT id FROM roles WHERE name = 'mess_manager'")->fetch();
if (!$role) {
    $stmt = $db->prepare("INSERT INTO roles (name, display_name, description) VALUES ('mess_manager', 'Mess Manager', 'Dining Contractor & Kitchen Operations Supervisor')");
    $stmt->execute();
    $roleId = (int)$db->lastInsertId();
    echo "Created role mess_manager with ID {$roleId}\n";
} else {
    $roleId = (int)$role['id'];
    echo "Found existing role mess_manager with ID {$roleId}\n";
}

// 2. Ensure password hash for 'password'
$passwordHash = password_hash('password', PASSWORD_DEFAULT);

// 3. Ensure user mess_manager exists
$user = $db->query("SELECT id FROM users WHERE username = 'mess_manager'")->fetch();
if (!$user) {
    $stmt = $db->prepare("INSERT INTO users (username, email, password_hash, primary_role_id) VALUES ('mess_manager', 'mess.manager@campus.edu', :pwd, :rid)");
    $stmt->execute([':pwd' => $passwordHash, ':rid' => $roleId]);
    $userId = (int)$db->lastInsertId();
    echo "Created user mess_manager with ID {$userId}\n";
} else {
    $userId = (int)$user['id'];
    // Update role just in case
    $db->prepare("UPDATE users SET primary_role_id = :rid WHERE id = :uid")->execute([':rid' => $roleId, ':uid' => $userId]);
    echo "Found existing user mess_manager with ID {$userId}\n";
}

// 4. Ensure staff profile exists
$staff = $db->query("SELECT id FROM staff_profiles WHERE user_id = {$userId}")->fetch();
if (!$staff) {
    $stmt = $db->prepare("
        INSERT INTO staff_profiles (user_id, employee_code, full_name, designation, department_id, qualification, official_email, phone_number, cabin_location, joining_date)
        VALUES (:uid, 'STAFF-MESS-01', 'Ramesh Pradhan', 'Mess Manager & Dining Contractor', 1, 'Hotel Management & Food Safety', 'mess.manager@campus.edu', '+91 98765 43299', 'Central Mess Complex', '2022-07-01')
    ");
    $stmt->execute([':uid' => $userId]);
    echo "Created staff profile for Ramesh Pradhan\n";
} else {
    echo "Staff profile already exists\n";
}

// 5. Grant basic permissions to mess_manager role
$permIds = $db->query("SELECT id FROM permissions WHERE name IN ('view_student_profile', 'manage_notices', 'view_all_grievances')")->fetchAll(PDO::FETCH_COLUMN);
foreach ($permIds as $pid) {
    $db->prepare("INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (:rid, :pid)")->execute([':rid' => $roleId, ':pid' => $pid]);
}
echo "Assigned permissions to mess_manager\n";

echo "MIGRATION COMPLETE.\n";
