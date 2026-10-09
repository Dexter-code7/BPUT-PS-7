<?php
// Unified Campus ERP - Academic Master Controller
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

class AcademicMasterController {
    public static function getDepartments(): void {
        $db = Database::getConnection();
        $departments = $db->query("
            SELECT d.*, COUNT(p.id) as program_count
            FROM departments d
            LEFT JOIN programs p ON d.id = p.department_id
            GROUP BY d.id
            ORDER BY d.id ASC
        ")->fetchAll();
        Response::json(['departments' => $departments]);
    }

    public static function getPrograms(): void {
        $db = Database::getConnection();
        $deptId = !empty($_GET['department_id']) ? (int)$_GET['department_id'] : null;

        if ($deptId) {
            $stmt = $db->prepare("
                SELECT p.*, d.name as department_name, d.code as department_code
                FROM programs p
                JOIN departments d ON p.department_id = d.id
                WHERE p.department_id = :dept_id
                ORDER BY p.name ASC
            ");
            $stmt->execute([':dept_id' => $deptId]);
            $programs = $stmt->fetchAll();
        } else {
            $programs = $db->query("
                SELECT p.*, d.name as department_name, d.code as department_code
                FROM programs p
                JOIN departments d ON p.department_id = d.id
                ORDER BY p.id ASC
            ")->fetchAll();
        }

        Response::json(['programs' => $programs]);
    }

    public static function getAuditLogs(): void {
        $currentUser = AuthHelper::authenticate();
        AuthHelper::checkPermission($currentUser, 'manage_users');

        $db = Database::getConnection();
        $limit = min(100, max(10, (int)($_GET['limit'] ?? 50)));

        $stmt = $db->prepare("
            SELECT a.*, u.username, r.display_name as user_role
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN roles r ON u.primary_role_id = r.id
            ORDER BY a.created_at DESC
            LIMIT :lim
        ");
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->execute();

        Response::json(['logs' => $stmt->fetchAll()]);
    }
}
