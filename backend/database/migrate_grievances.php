<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = Database::getConnection();

    // 1. Create tables
    $sql = file_get_contents(__DIR__ . '/phase5_grievances.sql');
    $db->exec($sql);
    echo "Grievances schema created successfully.\n";

    // 2. Seed default categories if empty
    $count = $db->query("SELECT COUNT(*) FROM grievance_categories")->fetchColumn();
    if ($count == 0) {
        $categories = [
            [
                'code' => 'hostel_maintenance',
                'name' => 'Hostel & Residential Maintenance',
                'department_name' => 'Hostel Administration & Caretaker Division',
                'description' => 'Room furniture, carpentry, door locks, window glass, cupboard fixtures, and hostel civil repairs.',
                'default_sla_hours' => 24,
                'priority_default' => 'medium',
                'icon_name' => 'Home'
            ],
            [
                'code' => 'electrical_power',
                'name' => 'Electrical & Power Infrastructure',
                'department_name' => 'Estate Electrical Engineering Unit',
                'description' => 'Ceiling fans, lighting fixtures, power sockets, switchboards, geysers, and emergency corridor power backup.',
                'default_sla_hours' => 12,
                'priority_default' => 'high',
                'icon_name' => 'Zap'
            ],
            [
                'code' => 'it_network',
                'name' => 'Campus Wi-Fi & IT Infrastructure',
                'department_name' => 'Central Computer & Network Center',
                'description' => 'Hostel Wi-Fi access points, LAN Ethernet ports, ERP student portal bugs, and smart classroom digital boards.',
                'default_sla_hours' => 24,
                'priority_default' => 'medium',
                'icon_name' => 'Wifi'
            ],
            [
                'code' => 'academic_course',
                'name' => 'Academic & Departmental Evaluation',
                'department_name' => 'Department Academic Grievance Cell',
                'description' => 'Timetable collisions, lab computer workstation issues, continuous evaluation record discrepancies, and syllabus grievances.',
                'default_sla_hours' => 48,
                'priority_default' => 'medium',
                'icon_name' => 'GraduationCap'
            ],
            [
                'code' => 'mess_food',
                'name' => 'Hostel Mess & Dining Hygiene',
                'department_name' => 'Central Mess Advisory & Food Safety Committee',
                'description' => 'Meal quality, drinking water RO purifiers, dining hall sanitation, and special dietary adherence.',
                'default_sla_hours' => 12,
                'priority_default' => 'high',
                'icon_name' => 'UtensilsCrossed'
            ],
            [
                'code' => 'sanitation_cleaning',
                'name' => 'Campus Housekeeping & Sanitation',
                'department_name' => 'Estate Sanitation & Housekeeping Unit',
                'description' => 'Washroom deep cleaning, plumbing drainage, garbage clearance, and academic corridor housekeeping.',
                'default_sla_hours' => 12,
                'priority_default' => 'medium',
                'icon_name' => 'Droplets'
            ],
            [
                'code' => 'admin_finance',
                'name' => 'Administrative & Accounts Counter',
                'department_name' => 'Office of the Registrar & Finance Division',
                'description' => 'Fee receipt reconciliation, scholarship verification issues, security deposit refund, and administrative desk delays.',
                'default_sla_hours' => 72,
                'priority_default' => 'low',
                'icon_name' => 'FileText'
            ]
        ];

        $insCat = $db->prepare("
            INSERT INTO grievance_categories (code, name, department_name, description, default_sla_hours, priority_default, icon_name, is_active)
            VALUES (:code, :name, :dept, :desc, :sla, :pri, :icon, 1)
        ");

        foreach ($categories as $cat) {
            $insCat->execute([
                ':code' => $cat['code'],
                ':name' => $cat['name'],
                ':dept' => $cat['department_name'],
                ':desc' => $cat['description'],
                ':sla' => $cat['default_sla_hours'],
                ':pri' => $cat['priority_default'],
                ':icon' => $cat['icon_name']
            ]);
        }
        echo "Seeded 7 official grievance categories.\n";
    }

    // 3. Seed sample realistic tickets
    $ticketCount = $db->query("SELECT COUNT(*) FROM grievances")->fetchColumn();
    if ($ticketCount == 0) {
        // Find users
        $ashishId = $db->query("SELECT id FROM users WHERE username = 'ashish'")->fetchColumn();
        $priyaId = $db->query("SELECT id FROM users WHERE username = 'priya_cr'")->fetchColumn();
        $wardenId = $db->query("SELECT id FROM users WHERE username = 'warden_singh'")->fetchColumn();
        $hodId = $db->query("SELECT id FROM users WHERE username = 'hod_cse'")->fetchColumn();
        $adminStaffId = $db->query("SELECT id FROM users WHERE username = 'admin_staff'")->fetchColumn();

        $catElectrical = $db->query("SELECT id FROM grievance_categories WHERE code = 'electrical_power'")->fetchColumn();
        $catWifi = $db->query("SELECT id FROM grievance_categories WHERE code = 'it_network'")->fetchColumn();
        $catAcademic = $db->query("SELECT id FROM grievance_categories WHERE code = 'academic_course'")->fetchColumn();
        $catSanitation = $db->query("SELECT id FROM grievance_categories WHERE code = 'sanitation_cleaning'")->fetchColumn();

        if ($ashishId && $catElectrical) {
            // Ticket 1: In Progress with OTP for Ashish (Electrical)
            $deadline1 = date('Y-m-d H:i:s', time() + (8 * 3600)); // 8 hours remaining
            $insTicket = $db->prepare("
                INSERT INTO grievances (
                    ticket_number, user_id, category_id, title, description,
                    location_type, location_details, priority, status,
                    sla_hours, sla_deadline, assigned_department, assigned_staff_id,
                    assigned_technician_name, assigned_technician_contact, assigned_at,
                    resolution_otp, created_at
                ) VALUES (
                    'CUT/GRV/2026/001', :uid, :cat, :title, :desc,
                    'hostel_room', 'Boys Hostel Block B, Room B-204', 'high', 'in_progress',
                    12, :deadline, 'Estate Electrical Engineering Unit', :staff_id,
                    'Ramesh Kumar (Senior Electrical Technician)', '+91 98765-43210', NOW(),
                    '7421', DATE_SUB(NOW(), INTERVAL 4 HOUR)
                )
            ");
            $insTicket->execute([
                ':uid' => $ashishId,
                ':cat' => $catElectrical,
                ':title' => 'Ceiling fan capacitor failure and sparking charging point',
                ':desc' => 'The ceiling fan in Room B-204 turns at very low RPM even on regulator level 5. Also, the secondary 3-pin laptop socket shows intermittent sparking and smell of overheated plastic.',
                ':deadline' => $deadline1,
                ':staff_id' => $wardenId ?: $adminStaffId
            ]);
            $grv1Id = $db->lastInsertId();

            // Timeline for Ticket 1
            $db->exec("INSERT INTO grievance_timeline (grievance_id, actor_user_id, action, notes, created_at) VALUES 
                ({$grv1Id}, {$ashishId}, 'TICKET_LOGGED', 'Maintenance request logged by student Ashish Toppo via Campus Hub.', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
                ({$grv1Id}, NULL, 'AUTO_ROUTED', 'Auto-routing engine routed ticket to Estate Electrical Unit based on residential location Boys Hostel Block B.', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
                ({$grv1Id}, " . ($wardenId ?: $ashishId) . ", 'TECHNICIAN_ASSIGNED', 'Assigned to duty electrician Ramesh Kumar (+91 98765-43210). Physical verification OTP generated: 7421.', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
                ({$grv1Id}, " . ($wardenId ?: $ashishId) . ", 'WORK_IN_PROGRESS', 'Technician on site in Block B inspecting ceiling fan regulator and socket contacts.', DATE_SUB(NOW(), INTERVAL 1 HOUR))
            ");

            // Ticket 2: Resolved & Rated (Wi-Fi)
            $deadline2 = date('Y-m-d H:i:s', time() - (48 * 3600));
            $resolved2 = date('Y-m-d H:i:s', time() - (36 * 3600));
            $insTicket2 = $db->prepare("
                INSERT INTO grievances (
                    ticket_number, user_id, category_id, title, description,
                    location_type, location_details, priority, status,
                    sla_hours, sla_deadline, assigned_department, assigned_staff_id,
                    assigned_technician_name, assigned_technician_contact, assigned_at,
                    resolution_notes, resolution_otp, resolved_at,
                    student_rating, student_feedback, rated_at, created_at
                ) VALUES (
                    'CUT/GRV/2026/002', :uid, :cat, :title, :desc,
                    'hostel_room', 'Boys Hostel Block B, 2nd Floor Corridor', 'medium', 'resolved',
                    24, :deadline, 'Central Computer & Network Center', :staff_id,
                    'V. K. Sharma (Network Systems Engineer)', '+91 98112-33445', DATE_SUB(NOW(), INTERVAL 40 HOUR),
                    'Replaced crimped RJ45 patch connector on PoE switch port 14 and upgraded access point firmware to v4.8. Signal strength verified at -52 dBm across rooms B-201 to B-208.',
                    '3918', :resolved_at,
                    5, 'Wi-Fi connection is rock solid now. Speed tested at 115 Mbps. Thank you!', NOW(), DATE_SUB(NOW(), INTERVAL 52 HOUR)
                )
            ");
            $insTicket2->execute([
                ':uid' => $ashishId,
                ':cat' => $catWifi,
                ':title' => 'Wi-Fi Access Point CUT-HOSTEL-B2 dropping connections intermittently',
                ':desc' => 'High packet loss and random disconnection from campus intranet during peak evening study hours (8 PM - 11 PM).',
                ':deadline' => $deadline2,
                ':staff_id' => $adminStaffId,
                ':resolved_at' => $resolved2
            ]);
            $grv2Id = $db->lastInsertId();

            $db->exec("INSERT INTO grievance_timeline (grievance_id, actor_user_id, action, notes, created_at) VALUES 
                ({$grv2Id}, {$ashishId}, 'TICKET_LOGGED', 'Logged via Campus Hub.', DATE_SUB(NOW(), INTERVAL 52 HOUR)),
                ({$grv2Id}, NULL, 'AUTO_ROUTED', 'Routed to Computer Center.', DATE_SUB(NOW(), INTERVAL 50 HOUR)),
                ({$grv2Id}, " . ($adminStaffId ?: $ashishId) . ", 'PHYSICALLY_RESOLVED', 'PoE switch connector replaced. Speed verified at 115 Mbps.', DATE_SUB(NOW(), INTERVAL 36 HOUR)),
                ({$grv2Id}, {$ashishId}, 'STUDENT_RATED', 'Student confirmed OTP 3918 and rated service 5 stars.', NOW())
            ");
        }

        if ($priyaId && $catAcademic) {
            // Ticket 3: Academic issue filed by Priya (CR)
            $deadline3 = date('Y-m-d H:i:s', time() + (36 * 3600));
            $insTicket3 = $db->prepare("
                INSERT INTO grievances (
                    ticket_number, user_id, category_id, title, description,
                    location_type, location_details, priority, status,
                    sla_hours, sla_deadline, assigned_department, assigned_staff_id,
                    assigned_technician_name, resolution_otp, created_at
                ) VALUES (
                    'CUT/GRV/2026/003', :uid, :cat, :title, :desc,
                    'academic_block', 'Lecture Hall C-201', 'medium', 'assigned',
                    48, :deadline, 'Department Academic Grievance Cell', :staff_id,
                    'Lab Incharge - Multimedia Systems', '6245', DATE_SUB(NOW(), INTERVAL 6 HOUR)
                )
            ");
            $insTicket3->execute([
                ':uid' => $priyaId,
                ':cat' => $catAcademic,
                ':title' => 'Overhead ceiling projector HDMI color tint in Lecture Hall C-201',
                ':desc' => 'The digital ceiling projector in Hall C-201 exhibits severe pink tint and drops HDMI video input every 15 minutes during MCA Section A lectures.',
                ':deadline' => $deadline3,
                ':staff_id' => $hodId
            ]);
            $grv3Id = $db->lastInsertId();

            $db->exec("INSERT INTO grievance_timeline (grievance_id, actor_user_id, action, notes, created_at) VALUES 
                ({$grv3Id}, {$priyaId}, 'TICKET_LOGGED', 'Logged by Class Representative Priya Sharma.', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
                ({$grv3Id}, NULL, 'AUTO_ROUTED', 'Auto-routed to Department of Computer Science & Engineering (HOD: Dr. Aris Thorne).', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
                ({$grv3Id}, " . ($hodId ?: $priyaId) . ", 'TECHNICIAN_ASSIGNED', 'Assigned to Lab Incharge for HDMI optical converter replacement.', DATE_SUB(NOW(), INTERVAL 2 HOUR))
            ");
        }

        if ($ashishId && $catSanitation) {
            // Ticket 4: Overdue / Escalated Ticket (Sanitation)
            $deadline4 = date('Y-m-d H:i:s', time() - (5 * 3600)); // Overdue by 5 hours
            $insTicket4 = $db->prepare("
                INSERT INTO grievances (
                    ticket_number, user_id, category_id, title, description,
                    location_type, location_details, priority, status,
                    sla_hours, sla_deadline, assigned_department, assigned_staff_id,
                    is_escalated, escalated_at, escalated_to, escalation_reason,
                    resolution_otp, created_at
                ) VALUES (
                    'CUT/GRV/2026/004', :uid, :cat, :title, :desc,
                    'hostel_room', 'Hostel Block B, 1st Floor East Washroom', 'high', 'escalated',
                    12, :deadline, 'Estate Sanitation & Housekeeping Unit', :staff_id,
                    1, DATE_SUB(NOW(), INTERVAL 2 HOUR), 'Chief Hostel Warden & Estate Officer',
                    'SLA breached by 5 hours without technician dispatch. Automatically escalated to executive leadership tier.',
                    '9154', DATE_SUB(NOW(), INTERVAL 17 HOUR)
                )
            ");
            $insTicket4->execute([
                ':uid' => $ashishId,
                ':cat' => $catSanitation,
                ':title' => 'Main plumbing pipe leakage causing floor flooding',
                ':desc' => 'Continuous water leakage from main flush inlet pipe near stall 3 causing water accumulation in common passage.',
                ':deadline' => $deadline4,
                ':staff_id' => $wardenId ?: $adminStaffId
            ]);
            $grv4Id = $db->lastInsertId();

            $db->exec("INSERT INTO grievance_timeline (grievance_id, actor_user_id, action, notes, created_at) VALUES 
                ({$grv4Id}, {$ashishId}, 'TICKET_LOGGED', 'Logged by resident Ashish Toppo.', DATE_SUB(NOW(), INTERVAL 17 HOUR)),
                ({$grv4Id}, NULL, 'AUTO_ROUTED', 'Auto-routed to Sanitation Unit.', DATE_SUB(NOW(), INTERVAL 16 HOUR)),
                ({$grv4Id}, NULL, 'SLA_BREACHED', 'SLA limit of 12 hours elapsed without resolution.', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
                ({$grv4Id}, NULL, 'ESCALATED', 'System daemon escalated ticket to Chief Hostel Warden & Estate Officer.', DATE_SUB(NOW(), INTERVAL 2 HOUR))
            ");
        }

        echo "Seeded 4 realistic maintenance & grievance tickets with timeline history.\n";
    }

    echo "Phase 5 Grievances migration completed successfully!\n";
} catch (\Throwable $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
