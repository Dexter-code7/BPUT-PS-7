<?php
require_once 'd:/xammp/htdocs/collegelife/backend/config/Database.php';
$db = Database::getConnection();

echo "=== TABLES WITH ATTENDANCE OR SUBJECT OR TIMETABLE ===\n";
$tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
$attTables = array_filter($tables, fn($t) => preg_match('/(att|course|subject|timetable|lecture)/i', $t));
print_r($attTables);

foreach ($attTables as $t) {
    echo "\n=== $t ===\n";
    $cols = $db->query("DESCRIBE $t")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $c) {
        echo $c['Field'] . ' (' . $c['Type'] . ")\n";
    }
}
