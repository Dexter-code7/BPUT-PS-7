<?php
// Unified Campus ERP - Profile Controller (Single Institutional Truth)
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/audit.php';

class ProfileController {
    public static function getOwnProfile(): void {
        $currentUser = AuthHelper::authenticate();
        $db = Database::getConnection();

        if ($currentUser['profile_type'] === 'student') {
            $stmt = $db->prepare("
                SELECT sp.*, d.name AS department_name, d.code AS department_code,
                       p.name AS program_name, p.code AS program_code, p.degree_level
                FROM student_profiles sp
                LEFT JOIN departments d ON sp.department_id = d.id
                LEFT JOIN programs p ON sp.program_id = p.id
                WHERE sp.user_id = :user_id
            ");
            $stmt->execute([':user_id' => $currentUser['id']]);
            $profile = $stmt->fetch();
        } else {
            $stmt = $db->prepare("
                SELECT sf.*, d.name AS department_name, d.code AS department_code
                FROM staff_profiles sf
                LEFT JOIN departments d ON sf.department_id = d.id
                WHERE sf.user_id = :user_id
            ");
            $stmt->execute([':user_id' => $currentUser['id']]);
            $profile = $stmt->fetch();
        }

        Response::json([
            'profile_type' => $currentUser['profile_type'],
            'profile'      => $profile,
            'user'         => [
                'id'       => $currentUser['id'],
                'username' => $currentUser['username'],
                'email'    => $currentUser['email'],
                'role'     => $currentUser['role_label'],
                'tags'     => $currentUser['tags'],
            ]
        ]);
    }

    public static function listStudents(): void {
        $currentUser = AuthHelper::authenticate();
        AuthHelper::checkPermission($currentUser, 'view_student_profile');

        $db = Database::getConnection();
        $deptId   = !empty($_GET['department_id']) ? (int)$_GET['department_id'] : null;
        $semester = !empty($_GET['semester']) ? (int)$_GET['semester'] : null;
        $search   = trim($_GET['search'] ?? '');

        $sql = "
            SELECT sp.id, sp.user_id, sp.roll_number, sp.registration_number, sp.admission_number,
                   sp.full_name, sp.college_email, sp.phone_number, sp.current_semester, sp.section,
                   sp.hostel_resident, sp.hostel_name, sp.room_number, sp.academic_status,
                   d.name AS department_name, d.code AS department_code,
                   p.name AS program_name, p.code AS program_code,
                   (SELECT GROUP_CONCAT(t.display_name SEPARATOR ', ')
                    FROM user_tags ut
                    JOIN tags t ON ut.tag_id = t.id
                    WHERE ut.user_id = sp.user_id AND (ut.expires_at IS NULL OR ut.expires_at > NOW())
                   ) AS active_tags
            FROM student_profiles sp
            LEFT JOIN departments d ON sp.department_id = d.id
            LEFT JOIN programs p ON sp.program_id = p.id
            WHERE 1=1
        ";
        $params = [];

        if ($deptId) {
            $sql .= " AND sp.department_id = :dept_id";
            $params[':dept_id'] = $deptId;
        }
        if ($semester) {
            $sql .= " AND sp.current_semester = :semester";
            $params[':semester'] = $semester;
        }
        if ($search !== '') {
            $sql .= " AND (sp.full_name LIKE :search OR sp.roll_number LIKE :search OR sp.registration_number LIKE :search)";
            $params[':search'] = "%{$search}%";
        }

        $sql .= " ORDER BY sp.roll_number ASC LIMIT 100";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $students = $stmt->fetchAll();

        Response::json(['students' => $students]);
    }

    public static function updateOwnContact(): void {
        $currentUser = AuthHelper::authenticate();
        $db = Database::getConnection();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        if ($currentUser['profile_type'] === 'student') {
            $phone = trim($body['phone_number'] ?? '');
            $personalEmail = trim($body['personal_email'] ?? '');
            $bloodGroup = trim($body['blood_group'] ?? '');
            $parentPhone = trim($body['parent_phone'] ?? '');

            $stmt = $db->prepare("
                UPDATE student_profiles
                SET phone_number = COALESCE(NULLIF(:phone, ''), phone_number),
                    personal_email = COALESCE(NULLIF(:email, ''), personal_email),
                    blood_group = COALESCE(NULLIF(:blood, ''), blood_group),
                    parent_phone = COALESCE(NULLIF(:parent_phone, ''), parent_phone),
                    updated_at = NOW()
                WHERE user_id = :user_id
            ");
            $stmt->execute([
                ':phone'        => $phone,
                ':email'        => $personalEmail,
                ':blood'        => $bloodGroup,
                ':parent_phone' => $parentPhone,
                ':user_id'      => $currentUser['id'],
            ]);

            AuditLogger::log($currentUser['id'], 'update_contact_profile', 'student_profiles', (string)$currentUser['id'], [
                'phone' => $phone,
                'email' => $personalEmail,
            ]);

            Response::json(null, 200, 'Student contact details updated successfully.');
        } else {
            $phone = trim($body['phone_number'] ?? '');
            $cabin = trim($body['cabin_location'] ?? '');

            $stmt = $db->prepare("
                UPDATE staff_profiles
                SET phone_number = COALESCE(NULLIF(:phone, ''), phone_number),
                    cabin_location = COALESCE(NULLIF(:cabin, ''), cabin_location),
                    updated_at = NOW()
                WHERE user_id = :user_id
            ");
            $stmt->execute([
                ':phone'   => $phone,
                ':cabin'   => $cabin,
                ':user_id' => $currentUser['id'],
            ]);

            AuditLogger::log($currentUser['id'], 'update_staff_profile', 'staff_profiles', (string)$currentUser['id']);

            Response::json(null, 200, 'Staff profile updated successfully.');
        }
    }
}
