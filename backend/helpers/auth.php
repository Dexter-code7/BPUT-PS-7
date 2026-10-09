<?php
// Unified Campus ERP - Authentication & RBAC Helper
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/audit.php';

class AuthHelper {
    public static function createToken(int $userId): string {
        $db = Database::getConnection();
        $token = bin2hex(random_bytes(32)); // 64 hex characters
        $expiresAt = date('Y-m-d H:i:s', time() + (86400 * 30)); // 30 days session

        $stmt = $db->prepare("
            INSERT INTO auth_tokens (user_id, token, expires_at)
            VALUES (:user_id, :token, :expires_at)
        ");
        $stmt->execute([
            ':user_id'    => $userId,
            ':token'      => $token,
            ':expires_at' => $expiresAt,
        ]);

        return $token;
    }

    public static function getBearerToken(): ?string {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        
        if (empty($header) && function_exists('getallheaders')) {
            $headers = getallheaders();
            foreach ($headers as $key => $val) {
                if (strcasecmp($key, 'Authorization') === 0) {
                    $header = $val;
                    break;
                }
            }
        }

        if (preg_match('/Bearer\s+(\S+)/i', $header, $matches)) {
            return $matches[1];
        }

        if (!empty($_SERVER['HTTP_X_AUTH_TOKEN'])) {
            return trim($_SERVER['HTTP_X_AUTH_TOKEN']);
        }

        // Fallback for query param token if needed during preview
        if (!empty($_GET['token'])) {
            return (string)$_GET['token'];
        }
        return null;
    }

    public static function authenticate(): array {
        $token = self::getBearerToken();
        if (!$token) {
            Response::error('Authentication required. Missing token.', 401);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT t.user_id, t.expires_at, u.username, u.email, u.primary_role_id, u.status,
                   r.name AS role_name, r.display_name AS role_display_name
            FROM auth_tokens t
            JOIN users u ON t.user_id = u.id
            JOIN roles r ON u.primary_role_id = r.id
            WHERE t.token = :token AND t.expires_at > NOW()
            LIMIT 1
        ");
        $stmt->execute([':token' => $token]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error('Invalid or expired authentication token.', 401);
        }

        if ($user['status'] !== 'active') {
            Response::error('Account is inactive or suspended.', 403);
        }

        return self::enrichUserData((int)$user['user_id'], $user);
    }

    public static function enrichUserData(int $userId, array $baseUser): array {
        $db = Database::getConnection();

        // 1. Fetch direct role permissions
        $permStmt = $db->prepare("
            SELECT DISTINCT p.code
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role_id = :role_id
        ");
        $permStmt->execute([':role_id' => $baseUser['primary_role_id']]);
        $permissions = $permStmt->fetchAll(PDO::FETCH_COLUMN);

        // 2. Fetch active tags for this user
        $tagStmt = $db->prepare("
            SELECT ut.id as user_tag_id, t.id as tag_id, t.name, t.display_name,
                   ut.department_id, ut.scope_details, ut.expires_at
            FROM user_tags ut
            JOIN tags t ON ut.tag_id = t.id
            WHERE ut.user_id = :user_id
              AND (ut.expires_at IS NULL OR ut.expires_at > NOW())
        ");
        $tagStmt->execute([':user_id' => $userId]);
        $tags = $tagStmt->fetchAll();

        // 3. Add tag-derived permissions
        if (!empty($tags)) {
            $tagIds = array_column($tags, 'tag_id');
            $inClause = implode(',', array_map('intval', $tagIds));
            $tagPermStmt = $db->query("
                SELECT DISTINCT p.code
                FROM tag_permissions tp
                JOIN permissions p ON tp.permission_id = p.id
                WHERE tp.tag_id IN ($inClause)
            ");
            $tagPermissions = $tagPermStmt->fetchAll(PDO::FETCH_COLUMN);
            $permissions = array_values(array_unique(array_merge($permissions, $tagPermissions)));
        }

        // 4. Fetch associated profile (Student or Staff)
        $profile = null;
        $profileType = null;

        if ($baseUser['role_name'] === 'student') {
            $profileType = 'student';
            $stuStmt = $db->prepare("
                SELECT sp.*, d.name AS department_name, d.code AS department_code,
                       p.name AS program_name, p.code AS program_code
                FROM student_profiles sp
                LEFT JOIN departments d ON sp.department_id = d.id
                LEFT JOIN programs p ON sp.program_id = p.id
                WHERE sp.user_id = :user_id
                LIMIT 1
            ");
            $stuStmt->execute([':user_id' => $userId]);
            $profile = $stuStmt->fetch();
        } else {
            $profileType = 'staff';
            $staffStmt = $db->prepare("
                SELECT sf.*, d.name AS department_name, d.code AS department_code
                FROM staff_profiles sf
                LEFT JOIN departments d ON sf.department_id = d.id
                WHERE sf.user_id = :user_id
                LIMIT 1
            ");
            $staffStmt->execute([':user_id' => $userId]);
            $profile = $staffStmt->fetch();
        }

        return [
            'id'           => (int)$userId,
            'username'     => $baseUser['username'],
            'email'        => $baseUser['email'],
            'role_id'      => (int)$baseUser['primary_role_id'],
            'role_name'    => $baseUser['role_name'],
            'role_label'   => $baseUser['role_display_name'],
            'profile_type' => $profileType,
            'profile'      => $profile ?: null,
            'tags'         => $tags,
            'permissions'  => $permissions,
        ];
    }

    public static function checkPermission(array $user, string $permissionCode): void {
        if (!in_array($permissionCode, $user['permissions'], true) && $user['role_name'] !== 'system_admin') {
            Response::error("Forbidden: You do not possess the required permission '{$permissionCode}'.", 403);
        }
    }
}
