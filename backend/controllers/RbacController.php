<?php
// Unified Campus ERP - RBAC & Tags Controller
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/audit.php';

class RbacController {
    public static function getRoles(): void {
        $db = Database::getConnection();
        $roles = $db->query("
            SELECT r.*, COUNT(u.id) as user_count
            FROM roles r
            LEFT JOIN users u ON r.id = u.primary_role_id
            GROUP BY r.id
            ORDER BY r.id ASC
        ")->fetchAll();
        Response::json(['roles' => $roles]);
    }

    public static function getTags(): void {
        $db = Database::getConnection();
        $tags = $db->query("
            SELECT t.*, COUNT(ut.id) as assigned_count
            FROM tags t
            LEFT JOIN user_tags ut ON t.id = ut.tag_id AND (ut.expires_at IS NULL OR ut.expires_at > NOW())
            GROUP BY t.id
            ORDER BY t.id ASC
        ")->fetchAll();
        Response::json(['tags' => $tags]);
    }

    public static function getUserTags(): void {
        $userId = !empty($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
        if ($userId <= 0) {
            Response::error('User ID required.');
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT ut.*, t.name as tag_name, t.display_name, d.name as department_name
            FROM user_tags ut
            JOIN tags t ON ut.tag_id = t.id
            LEFT JOIN departments d ON ut.department_id = d.id
            WHERE ut.user_id = :user_id
            ORDER BY ut.created_at DESC
        ");
        $stmt->execute([':user_id' => $userId]);
        Response::json(['user_tags' => $stmt->fetchAll()]);
    }

    public static function assignTag(): void {
        $currentUser = AuthHelper::authenticate();
        AuthHelper::checkPermission($currentUser, 'manage_roles_tags');

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $userId = (int)($body['user_id'] ?? 0);
        $tagId = (int)($body['tag_id'] ?? 0);
        $departmentId = !empty($body['department_id']) ? (int)$body['department_id'] : null;
        $scopeDetails = trim($body['scope_details'] ?? '');
        $expiresAt = !empty($body['expires_at']) ? $body['expires_at'] : null;

        if ($userId <= 0 || $tagId <= 0) {
            Response::error('Valid user_id and tag_id are required.');
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO user_tags (user_id, tag_id, department_id, scope_details, expires_at)
            VALUES (:user_id, :tag_id, :department_id, :scope_details, :expires_at)
        ");
        $stmt->execute([
            ':user_id'       => $userId,
            ':tag_id'        => $tagId,
            ':department_id' => $departmentId,
            ':scope_details' => $scopeDetails,
            ':expires_at'    => $expiresAt,
        ]);

        AuditLogger::log($currentUser['id'], 'assign_tag', 'user_tags', (string)$db->lastInsertId(), [
            'target_user_id' => $userId,
            'tag_id'         => $tagId,
            'scope'          => $scopeDetails,
            'expires_at'     => $expiresAt,
        ]);

        Response::json(null, 201, 'Designation / Tag assigned successfully.');
    }

    public static function revokeTag(): void {
        $currentUser = AuthHelper::authenticate();
        AuthHelper::checkPermission($currentUser, 'manage_roles_tags');

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $userTagId = (int)($body['user_tag_id'] ?? 0);

        if ($userTagId <= 0) {
            Response::error('User Tag ID required.');
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM user_tags WHERE id = :id");
        $stmt->execute([':id' => $userTagId]);

        AuditLogger::log($currentUser['id'], 'revoke_tag', 'user_tags', (string)$userTagId);

        Response::json(null, 200, 'Tag revoked successfully.');
    }
}
