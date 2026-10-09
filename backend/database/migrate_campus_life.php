<?php
// Unified Campus ERP - Phase 7 Migration & Seeder Script
// Campus Life, Gatepass, Mess Operations, and Academic Attendance Health
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

try {
    $db = Database::getConnection();
    echo "Beginning Phase 7 Campus Life Migration...\n";

    // 1. Run Schema
    $sql = file_get_contents(__DIR__ . '/phase7_campus_life.sql');
    $db->exec($sql);
    echo "[OK] Campus Life tables verified & created.\n";

    // 2. Fetch Ashish and Priya student profiles
    $studentStmt = $db->query("SELECT id, user_id, roll_number FROM student_profiles");
    $students = $studentStmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($students)) {
        echo "[WARN] No student profiles found to seed attendance/gatepasses.\n";
    }

    $ashishId = null;
    $priyaId = null;
    foreach ($students as $st) {
        if ($st['roll_number'] === '2101289045') $ashishId = (int)$st['id'];
        if ($st['roll_number'] === '2101289012') $priyaId = (int)$st['id'];
    }

    if (!$ashishId && !empty($students)) {
        $ashishId = (int)$students[0]['id'];
    }
    if (!$priyaId && count($students) > 1) {
        $priyaId = (int)$students[1]['id'];
    }

    // 3. Seed Mess Menu (7 days revolving)
    $menuItems = [
        ['day_of_week' => 'monday', 'meal_type' => 'breakfast', 'items' => 'Idli, Sambhar, Coconut Chutney, Boiled Eggs / Banana, Tea/Coffee', 'tags' => 'South Indian Breakfast', 'special' => 0, 'cutoff' => '07:00:00'],
        ['day_of_week' => 'monday', 'meal_type' => 'lunch', 'items' => 'Steamed Rice, Yellow Dal Tadka, Seasonal Mix Veg, Paneer Bhurji / Egg Curry, Curd, Papad', 'tags' => 'Balanced Thali', 'special' => 0, 'cutoff' => '11:00:00'],
        ['day_of_week' => 'monday', 'meal_type' => 'snacks', 'items' => 'Veg Cutlet, Mint Chutney, Hot Masala Tea', 'tags' => 'Evening Snacks', 'special' => 0, 'cutoff' => '16:00:00'],
        ['day_of_week' => 'monday', 'meal_type' => 'dinner', 'items' => 'Tawa Roti, Jeera Rice, Dal Makhani, Aloo Gobhi Adraki, Gulab Jamun', 'tags' => 'North Indian Dinner', 'special' => 0, 'cutoff' => '17:00:00'],

        ['day_of_week' => 'tuesday', 'meal_type' => 'breakfast', 'items' => 'Aloo Paratha with White Butter, Pickle, Dahi, Tea/Coffee', 'tags' => 'Punjabi Breakfast', 'special' => 0, 'cutoff' => '07:00:00'],
        ['day_of_week' => 'tuesday', 'meal_type' => 'lunch', 'items' => 'Jeera Rice, Chana Dal, Bhindi Masala, Kadhi Pakoda, Boondi Raita', 'tags' => 'Regional Thali', 'special' => 0, 'cutoff' => '11:00:00'],
        ['day_of_week' => 'tuesday', 'meal_type' => 'snacks', 'items' => 'Samosa, Tamarind Chutney, Ginger Tea', 'tags' => 'Evening Snacks', 'special' => 0, 'cutoff' => '16:00:00'],
        ['day_of_week' => 'tuesday', 'meal_type' => 'dinner', 'items' => 'Butter Roti, Peas Pulao, Rajma Masala, Baingan Bharta, Moong Dal Halwa', 'tags' => 'Chef Special Dinner', 'special' => 1, 'cutoff' => '17:00:00'],

        ['day_of_week' => 'wednesday', 'meal_type' => 'breakfast', 'items' => 'Poha with Peanuts, Sev, Boiled Sprouts, Jalebi, Tea/Coffee', 'tags' => 'Light Breakfast', 'special' => 0, 'cutoff' => '07:00:00'],
        ['day_of_week' => 'wednesday', 'meal_type' => 'lunch', 'items' => 'Steamed Rice, Moong Dal, Lauki Kofta, Chicken Curry / Shahi Paneer, Green Salad', 'tags' => 'Non-Veg Option Day', 'special' => 1, 'cutoff' => '11:00:00'],
        ['day_of_week' => 'wednesday', 'meal_type' => 'snacks', 'items' => 'Upma, Coconut Chutney, Filter Coffee', 'tags' => 'Evening Snacks', 'special' => 0, 'cutoff' => '16:00:00'],
        ['day_of_week' => 'wednesday', 'meal_type' => 'dinner', 'items' => 'Phulka, Dal Fry, Kashmiri Dum Aloo, Jeera Pulao, Fruit Custard', 'tags' => 'Homestyle Dinner', 'special' => 0, 'cutoff' => '17:00:00'],

        ['day_of_week' => 'thursday', 'meal_type' => 'breakfast', 'items' => 'Masala Dosa, Sambhar, Tomato Chutney, Tea/Coffee', 'tags' => 'South Indian Breakfast', 'special' => 0, 'cutoff' => '07:00:00'],
        ['day_of_week' => 'thursday', 'meal_type' => 'lunch', 'items' => 'Rice, Dal Palak, Soya Chunk Curry, Aloo Beans, Curd, Roasted Papad', 'tags' => 'Nutritious Thali', 'special' => 0, 'cutoff' => '11:00:00'],
        ['day_of_week' => 'thursday', 'meal_type' => 'snacks', 'items' => 'Dhokla, Green Chilli, Masala Chai', 'tags' => 'Evening Snacks', 'special' => 0, 'cutoff' => '16:00:00'],
        ['day_of_week' => 'thursday', 'meal_type' => 'dinner', 'items' => 'Missi Roti, Dal Tadka, Mix Veg Kadai, Vegetable Khichdi, Kheer', 'tags' => 'Traditional Dinner', 'special' => 0, 'cutoff' => '17:00:00'],

        ['day_of_week' => 'friday', 'meal_type' => 'breakfast', 'items' => 'Methi Puri, Aloo Tamatar Sabzi, Curd, Tea/Coffee', 'tags' => 'Traditional Breakfast', 'special' => 0, 'cutoff' => '07:00:00'],
        ['day_of_week' => 'friday', 'meal_type' => 'lunch', 'items' => 'Veg Biryani, Mirchi Ka Salan, Dal Maharani, Boondi Raita, Onion Rings', 'tags' => 'Biryani Day', 'special' => 1, 'cutoff' => '11:00:00'],
        ['day_of_week' => 'friday', 'meal_type' => 'snacks', 'items' => 'Bread Pakoda, Sauce, Masala Tea', 'tags' => 'Evening Snacks', 'special' => 0, 'cutoff' => '16:00:00'],
        ['day_of_week' => 'friday', 'meal_type' => 'dinner', 'items' => 'Tandoori Roti, Dal Makhani, Paneer Butter Masala / Fish Curry, Rasgulla', 'tags' => 'Weekend Feast', 'special' => 1, 'cutoff' => '17:00:00'],

        ['day_of_week' => 'saturday', 'meal_type' => 'breakfast', 'items' => 'Pav Bhaji / Bread Butter Jam, Boiled Eggs, Tea/Coffee', 'tags' => 'Continental/Street Style', 'special' => 0, 'cutoff' => '07:00:00'],
        ['day_of_week' => 'saturday', 'meal_type' => 'lunch', 'items' => 'Steamed Rice, Arhar Dal, Chole Bhature, Cucumber Salad, Pickle', 'tags' => 'Weekend Special', 'special' => 1, 'cutoff' => '11:00:00'],
        ['day_of_week' => 'saturday', 'meal_type' => 'snacks', 'items' => 'Bhel Puri, Nimbu Pani / Tea', 'tags' => 'Evening Snacks', 'special' => 0, 'cutoff' => '16:00:00'],
        ['day_of_week' => 'saturday', 'meal_type' => 'dinner', 'items' => 'Tawa Roti, Dal Fry, Gatta Curry, Khichdi, Fruit Salad', 'tags' => 'Comfort Dinner', 'special' => 0, 'cutoff' => '17:00:00'],

        ['day_of_week' => 'sunday', 'meal_type' => 'breakfast', 'items' => 'Chole Kulche, Sweet Lassi, Fresh Fruits, Tea/Coffee', 'tags' => 'Sunday Brunch Special', 'special' => 1, 'cutoff' => '08:00:00'],
        ['day_of_week' => 'sunday', 'meal_type' => 'lunch', 'items' => 'Fried Rice, Veg Manchurian / Chilli Chicken, Hakka Noodles, Hot & Sour Soup', 'tags' => 'Oriental Sunday Special', 'special' => 1, 'cutoff' => '11:30:00'],
        ['day_of_week' => 'sunday', 'meal_type' => 'snacks', 'items' => 'Biscuits & Cookies, Hot Masala Tea', 'tags' => 'Evening Snacks', 'special' => 0, 'cutoff' => '16:00:00'],
        ['day_of_week' => 'sunday', 'meal_type' => 'dinner', 'items' => 'Phulka Roti, Dal Tadka, Aloo Shimlamirch, Jeera Rice, Ice Cream', 'tags' => 'Light Sunday Dinner', 'special' => 1, 'cutoff' => '17:00:00'],
    ];

    $menuStmt = $db->prepare("
        INSERT INTO mess_menu (day_of_week, meal_type, items, nutritional_tags, is_special, cutoff_time)
        VALUES (:dow, :meal, :items, :tags, :special, :cutoff)
        ON DUPLICATE KEY UPDATE items = VALUES(items), nutritional_tags = VALUES(nutritional_tags), is_special = VALUES(is_special), cutoff_time = VALUES(cutoff_time)
    ");

    foreach ($menuItems as $m) {
        $menuStmt->execute([
            ':dow' => $m['day_of_week'],
            ':meal' => $m['meal_type'],
            ':items' => $m['items'],
            ':tags' => $m['tags'],
            ':special' => $m['special'],
            ':cutoff' => $m['cutoff']
        ]);
    }
    echo "[OK] 7-Day Revolving Mess Menu seeded.\n";

    // 4. Seed Attendance Records for Ashish (With authentic statutory compliance margins)
    if ($ashishId) {
        $db->exec("DELETE FROM attendance_records WHERE student_id = {$ashishId}");
        $attStmt = $db->prepare("
            INSERT INTO attendance_records (student_id, subject_code, subject_name, faculty_name, total_classes, attended_classes, percentage)
            VALUES (:sid, :code, :name, :fac, :tot, :att, :pct)
        ");

        $attendanceList = [
            // Compliant subject (well above 75%)
            ['code' => 'CS-601', 'name' => 'Advanced Algorithms & Complexity', 'fac' => 'Prof. Ashok Sharma', 'tot' => 38, 'att' => 33, 'pct' => 86.84],
            // Critical warning (below 75% statutory requirement)
            ['code' => 'CS-602', 'name' => 'Distributed Systems & Cloud Computing', 'fac' => 'Dr. Meenakshi Sundaram', 'tot' => 40, 'att' => 28, 'pct' => 70.00],
            // Borderline compliance (just above 75%)
            ['code' => 'CS-603', 'name' => 'Database Internals & Storage Engines', 'fac' => 'Prof. Rajesh Mohapatra', 'tot' => 36, 'att' => 28, 'pct' => 77.78],
            // Safe compliance
            ['code' => 'CS-604', 'name' => 'Compiler Design & Formal Grammars', 'fac' => 'Dr. Vandana Saxena', 'tot' => 34, 'att' => 31, 'pct' => 91.18],
            // Lab practicals
            ['code' => 'CS-605L', 'name' => 'Advanced Computing Laboratory II', 'fac' => 'Er. Subrat Das', 'tot' => 16, 'att' => 15, 'pct' => 93.75],
        ];

        foreach ($attendanceList as $a) {
            $attStmt->execute([
                ':sid' => $ashishId,
                ':code' => $a['code'],
                ':name' => $a['name'],
                ':fac' => $a['fac'],
                ':tot' => $a['tot'],
                ':att' => $a['att'],
                ':pct' => $a['pct']
            ]);
        }
        echo "[OK] Academic Attendance Records seeded for Ashish Toppo.\n";
    }

    // 5. Seed Timetable Slots for Dept 1 (CSE), Sem 6, Section A
    $db->exec("DELETE FROM timetable_slots WHERE department_id = 1 AND semester = 6");
    $ttStmt = $db->prepare("
        INSERT INTO timetable_slots (department_id, semester, section, day_of_week, start_time, end_time, subject_code, subject_name, faculty_name, room_number, status, notice_note)
        VALUES (:dept, :sem, :sec, :dow, :start, :end, :code, :name, :fac, :room, :status, :note)
    ");

    $slots = [
        // Monday
        ['dow' => 'monday', 'start' => '09:00:00', 'end' => '10:00:00', 'code' => 'CS-601', 'name' => 'Advanced Algorithms', 'fac' => 'Prof. Ashok Sharma', 'room' => 'LH-302', 'status' => 'scheduled', 'note' => null],
        ['dow' => 'monday', 'start' => '10:00:00', 'end' => '11:00:00', 'code' => 'CS-602', 'name' => 'Distributed Systems', 'fac' => 'Dr. Meenakshi Sundaram', 'room' => 'LH-302', 'status' => 'scheduled', 'note' => null],
        ['dow' => 'monday', 'start' => '11:15:00', 'end' => '12:15:00', 'code' => 'CS-603', 'name' => 'Database Internals', 'fac' => 'Prof. Rajesh Mohapatra', 'room' => 'LH-302', 'status' => 'scheduled', 'note' => null],
        ['dow' => 'monday', 'start' => '13:30:00', 'end' => '16:30:00', 'code' => 'CS-605L', 'name' => 'Cloud Systems Laboratory', 'fac' => 'Er. Subrat Das', 'room' => 'Computing Lab 4', 'status' => 'scheduled', 'note' => null],

        // Tuesday
        ['dow' => 'tuesday', 'start' => '09:00:00', 'end' => '10:00:00', 'code' => 'CS-604', 'name' => 'Compiler Design', 'fac' => 'Dr. Vandana Saxena', 'room' => 'LH-302', 'status' => 'scheduled', 'note' => null],
        ['dow' => 'tuesday', 'start' => '10:00:00', 'end' => '11:00:00', 'code' => 'CS-601', 'name' => 'Advanced Algorithms', 'fac' => 'Prof. Ashok Sharma', 'room' => 'LH-302', 'status' => 'scheduled', 'note' => null],
        ['dow' => 'tuesday', 'start' => '11:15:00', 'end' => '12:15:00', 'code' => 'CS-602', 'name' => 'Distributed Systems', 'fac' => 'Dr. Meenakshi Sundaram', 'room' => 'LH-302', 'status' => 'scheduled', 'note' => null],

        // Wednesday
        ['dow' => 'wednesday', 'start' => '09:00:00', 'end' => '10:00:00', 'code' => 'CS-603', 'name' => 'Database Internals', 'fac' => 'Prof. Rajesh Mohapatra', 'room' => 'LH-302', 'status' => 'scheduled', 'note' => null],
        ['dow' => 'wednesday', 'start' => '10:00:00', 'end' => '11:00:00', 'code' => 'CS-604', 'name' => 'Compiler Design', 'fac' => 'Dr. Vandana Saxena', 'room' => 'LH-302', 'status' => 'scheduled', 'note' => null],
        ['dow' => 'wednesday', 'start' => '11:15:00', 'end' => '12:15:00', 'code' => 'CS-601', 'name' => 'Advanced Algorithms', 'fac' => 'Prof. Ashok Sharma', 'room' => 'LH-302', 'status' => 'scheduled', 'note' => null],

        // Thursday
        ['dow' => 'thursday', 'start' => '09:00:00', 'end' => '10:00:00', 'code' => 'CS-602', 'name' => 'Distributed Systems', 'fac' => 'Dr. Meenakshi Sundaram', 'room' => 'LH-302', 'status' => 'scheduled', 'note' => null],
        ['dow' => 'thursday', 'start' => '10:00:00', 'end' => '11:00:00', 'code' => 'CS-603', 'name' => 'Database Internals', 'fac' => 'Prof. Rajesh Mohapatra', 'room' => 'LH-302', 'status' => 'scheduled', 'note' => null],

        // Friday
        ['dow' => 'friday', 'start' => '09:00:00', 'end' => '10:00:00', 'code' => 'CS-604', 'name' => 'Compiler Design', 'fac' => 'Dr. Vandana Saxena', 'room' => 'LH-302', 'status' => 'scheduled', 'note' => null],
        ['dow' => 'friday', 'start' => '10:00:00', 'end' => '11:00:00', 'code' => 'CS-601', 'name' => 'Advanced Algorithms', 'fac' => 'Prof. Ashok Sharma', 'room' => 'LH-302', 'status' => 'scheduled', 'note' => null],
        ['dow' => 'friday', 'start' => '11:15:00', 'end' => '12:15:00', 'code' => 'CS-602', 'name' => 'Distributed Systems', 'fac' => 'Dr. Meenakshi Sundaram', 'room' => 'LH-302', 'status' => 'scheduled', 'note' => null],
    ];

    foreach ($slots as $s) {
        $ttStmt->execute([
            ':dept' => 1,
            ':sem' => 6,
            ':sec' => 'A',
            ':dow' => $s['dow'],
            ':start' => $s['start'],
            ':end' => $s['end'],
            ':code' => $s['code'],
            ':name' => $s['name'],
            ':fac' => $s['fac'],
            ':room' => $s['room'],
            ':status' => $s['status'],
            ':note' => $s['note']
        ]);
    }
    echo "[OK] Weekly Timetable Schedule seeded.\n";

    // 6. Seed Sample Gatepasses
    if ($ashishId) {
        $db->exec("DELETE FROM gatepasses WHERE student_id = {$ashishId}");
        $gpStmt = $db->prepare("
            INSERT INTO gatepasses (pass_number, student_id, pass_type, destination, reason, out_time_expected, in_time_expected, actual_out_time, actual_in_time, status, qr_token, security_code, curfew_breach_minutes, warden_remarks)
            VALUES (:pnum, :sid, :ptype, :dest, :rsn, :out_exp, :in_exp, :act_out, :act_in, :st, :qr, :scode, :cbm, :wrem)
        ");

        $today = date('Y-m-d');
        $gpList = [
            [
                'pnum' => 'GP-2026-0041',
                'ptype' => 'day_outpass',
                'dest' => 'Civil Town Market & Book Depo',
                'rsn' => 'Purchase reference textbooks for Compiler Design and lab components',
                'out_exp' => $today . ' 16:30:00',
                'in_exp' => $today . ' 20:00:00',
                'act_out' => null,
                'act_in' => null,
                'st' => 'approved',
                'qr' => 'GP-TOKEN-41-' . bin2hex(random_bytes(8)),
                'scode' => '4921',
                'cbm' => 0,
                'wrem' => 'Approved by Chief Warden Col. Mahendra Singh. Strictly return before 20:00 hrs.'
            ],
            [
                'pnum' => 'GP-2026-0038',
                'ptype' => 'night_outpass',
                'dest' => 'Home Visit (Rourkela Sector 4)',
                'rsn' => 'Family function over the weekend, parent consent verified via registered phone',
                'out_exp' => date('Y-m-d', strtotime('-5 days')) . ' 17:00:00',
                'in_exp' => date('Y-m-d', strtotime('-3 days')) . ' 19:30:00',
                'act_out' => date('Y-m-d', strtotime('-5 days')) . ' 17:12:00',
                'act_in' => date('Y-m-d', strtotime('-3 days')) . ' 19:15:00',
                'st' => 'returned',
                'qr' => 'GP-TOKEN-38-' . bin2hex(random_bytes(8)),
                'scode' => '1183',
                'cbm' => 0,
                'wrem' => 'Return verified at Security Gate Main Terminal.'
            ]
        ];

        foreach ($gpList as $gp) {
            $gpStmt->execute([
                ':pnum' => $gp['pnum'],
                ':sid' => $ashishId,
                ':ptype' => $gp['ptype'],
                ':dest' => $gp['dest'],
                ':rsn' => $gp['rsn'],
                ':out_exp' => $gp['out_exp'],
                ':in_exp' => $gp['in_exp'],
                ':act_out' => $gp['act_out'],
                ':act_in' => $gp['act_in'],
                ':st' => $gp['st'],
                ':qr' => $gp['qr'],
                ':scode' => $gp['scode'],
                ':cbm' => $gp['cbm'],
                ':wrem' => $gp['wrem']
            ]);
        }
        echo "[OK] Demo Gatepasses seeded for Ashish Toppo.\n";
    }

    echo "\n=== Phase 7 Campus Life Migration Finished Successfully ===\n";

} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
