<?php
// Unified Campus ERP - Audit Logger
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

class AuditLogger {
    public static function log(mixed $userId, string $action, string $entityType, ?string $entityId = null, mixed $payload = null): void {
        try {
            $db = Database::getConnection();
            $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
            $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

            $intUserId = null;
            if (is_numeric($userId)) {
                $intUserId = (int)$userId;
            }

            $payloadJson = null;
            if (is_array($payload)) {
                $payloadJson = json_encode($payload, JSON_UNESCAPED_UNICODE);
            } elseif (is_string($payload) && !empty($payload)) {
                $payloadJson = json_encode(['description' => $payload], JSON_UNESCAPED_UNICODE);
            }

            $stmt = $db->prepare("
                INSERT INTO audit_logs (user_id, action, entity_type, entity_id, payload, ip_address, user_agent, created_at)
                VALUES (:user_id, :action, :entity_type, :entity_id, :payload, :ip, :ua, NOW())
            ");
            $stmt->execute([
                ':user_id'     => $intUserId,
                ':action'      => $action,
                ':entity_type' => $entityType,
                ':entity_id'   => $entityId !== null ? (string)$entityId : null,
                ':payload'     => $payloadJson,
                ':ip'          => $ip,
                ':ua'          => substr($ua, 0, 255),
            ]);
        } catch (\Throwable $e) {
            // Fail silently so logging never breaks core workflow execution
            error_log("Audit log failed: " . $e->getMessage());
        }
    }
}

class AuditHelper {
    public static function log(mixed $arg1 = null, mixed $arg2 = null, mixed $arg3 = null, mixed $arg4 = null, mixed $arg5 = null): void {
        try {
            // Support calling without userId: AuditHelper::log(string $action, string $entityType, mixed $entityId, mixed $payload)
            if (is_string($arg1) && !is_numeric($arg1) && is_string($arg2)) {
                $userId = null;
                if (isset($_SESSION['user']['id']) && is_numeric($_SESSION['user']['id'])) {
                    $userId = (int)$_SESSION['user']['id'];
                }
                AuditLogger::log($userId, $arg1, $arg2, $arg3 !== null ? (string)$arg3 : null, $arg4);
                return;
            }

            // Standard signature: (?int $userId, string $action, string $entityType, mixed $entityId, mixed $payload)
            $userId = is_numeric($arg1) ? (int)$arg1 : null;
            $action = is_string($arg2) ? $arg2 : 'SYSTEM_ACTION';
            $entityType = is_string($arg3) ? $arg3 : 'GENERAL';
            $entityId = $arg4 !== null ? (string)$arg4 : null;
            $payload = $arg5;

            AuditLogger::log($userId, $action, $entityType, $entityId, $payload);
        } catch (\Throwable $e) {
            error_log("AuditHelper log error: " . $e->getMessage());
        }
    }
}

