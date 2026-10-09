<?php
// Unified Campus ERP - Auth Controller
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/audit.php';

class AuthController {
    public static function login(): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $username = trim($body['username'] ?? '');
        $password = (string)($body['password'] ?? '');

        if ($username === '' || $password === '') {
            Response::error('Username/Email and password are required.');
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT u.*, r.name AS role_name, r.display_name AS role_display_name
            FROM users u
            JOIN roles r ON u.primary_role_id = r.id
            WHERE u.username = :login_user OR u.email = :login_email
            LIMIT 1
        ");
        $stmt->execute([
            ':login_user'  => $username,
            ':login_email' => $username,
        ]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            Response::error('Invalid login credentials.', 401);
        }

        if ($user['status'] !== 'active') {
            Response::error('Your account is currently disabled. Contact system administration.', 403);
        }

        // Update last login
        $db->prepare("UPDATE users SET last_login_at = NOW() WHERE id = :id")->execute([':id' => $user['id']]);

        // Generate token
        $token = AuthHelper::createToken((int)$user['id']);

        // Enrich user details
        $userData = AuthHelper::enrichUserData((int)$user['id'], $user);

        // Audit log
        AuditLogger::log((int)$user['id'], 'login_success', 'users', (string)$user['id'], ['username' => $user['username']]);

        Response::json([
            'token' => $token,
            'user'  => $userData,
        ], 200, 'Login successful.');
    }

    public static function me(): void {
        $user = AuthHelper::authenticate();
        Response::json(['user' => $user]);
    }

    public static function logout(): void {
        $token = AuthHelper::getBearerToken();
        if ($token) {
            $db = Database::getConnection();
            $db->prepare("DELETE FROM auth_tokens WHERE token = :token")->execute([':token' => $token]);
        }
        Response::json(null, 200, 'Logged out successfully.');
    }

    // Persona Quick Switch (Allows switching demo users without re-typing passwords in development)
    public static function demoSwitch(): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $targetUserId = (int)($body['user_id'] ?? 0);
        $targetUsername = trim($body['username'] ?? '');

        $db = Database::getConnection();
        if ($targetUserId > 0) {
            $stmt = $db->prepare("
                SELECT u.*, r.name AS role_name, r.display_name AS role_display_name
                FROM users u
                JOIN roles r ON u.primary_role_id = r.id
                WHERE u.id = :id LIMIT 1
            ");
            $stmt->execute([':id' => $targetUserId]);
        } else if ($targetUsername !== '') {
            $stmt = $db->prepare("
                SELECT u.*, r.name AS role_name, r.display_name AS role_display_name
                FROM users u
                JOIN roles r ON u.primary_role_id = r.id
                WHERE u.username = :uname LIMIT 1
            ");
            $stmt->execute([':uname' => $targetUsername]);
        } else {
            Response::error('Target user required.');
            return;
        }

        $user = $stmt->fetch();
        if (!$user) {
            Response::error('Target demo user not found.', 404);
        }

        $token = AuthHelper::createToken((int)$user['id']);
        $userData = AuthHelper::enrichUserData((int)$user['id'], $user);

        AuditLogger::log((int)$user['id'], 'demo_persona_switch', 'users', (string)$user['id'], ['username' => $user['username']]);

        Response::json([
            'token' => $token,
            'user'  => $userData,
        ], 200, "Switched persona to {$user['username']} ({$user['role_display_name']}).");
    }

    public static function listDemoAccounts(): void {
        $db = Database::getConnection();
        $stmt = $db->query("
            SELECT u.id, u.id AS user_id, u.username, u.email, r.name as role_name, r.display_name as role_label,
                   COALESCE(sp.full_name, sf.full_name, u.username) AS full_name,
                   (SELECT GROUP_CONCAT(t.display_name SEPARATOR ', ')
                    FROM user_tags ut
                    JOIN tags t ON ut.tag_id = t.id
                    WHERE ut.user_id = u.id AND (ut.expires_at IS NULL OR ut.expires_at > NOW())
                   ) AS active_tags
            FROM users u
            JOIN roles r ON u.primary_role_id = r.id
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            LEFT JOIN staff_profiles sf ON u.id = sf.user_id
            ORDER BY u.id ASC
        ");
        $accounts = $stmt->fetchAll();
        Response::json(['accounts' => $accounts]);
    }
}
