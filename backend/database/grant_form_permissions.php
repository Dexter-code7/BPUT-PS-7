<?php
// Grant create_form (6) and view_form_submissions (7) to all roles except student (9)
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

try {
    $pdo = Database::getConnection();

    // Insert permissions 6 and 7 for all roles except student (id 9)
    $stmt = $pdo->exec("
        INSERT IGNORE INTO role_permissions (role_id, permission_id)
        SELECT id, 6 FROM roles WHERE id != 9
        UNION
        SELECT id, 7 FROM roles WHERE id != 9;
    ");

    echo "Assigned create_form and view_form_submissions permissions to all non-student roles.\n";

    // Verify
    $rolesWithCreate = $pdo->query("
        SELECT r.name, r.display_name
        FROM roles r
        JOIN role_permissions rp ON r.id = rp.role_id
        WHERE rp.permission_id = 6
    ")->fetchAll(PDO::FETCH_ASSOC);

    echo "Roles that can now create forms:\n";
    foreach ($rolesWithCreate as $r) {
        echo "- {$r['name']} ({$r['display_name']})\n";
    }

} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
