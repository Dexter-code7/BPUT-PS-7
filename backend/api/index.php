<?php
// Unified Campus ERP - Main API Gateway
declare(strict_types=1);

// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Auth-Token, Origin, Accept");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/ProfileController.php';
require_once __DIR__ . '/../controllers/RbacController.php';
require_once __DIR__ . '/../controllers/AcademicMasterController.php';
require_once __DIR__ . '/../controllers/SmartFormController.php';
require_once __DIR__ . '/../controllers/ServiceRequestController.php';
require_once __DIR__ . '/../controllers/NoticeController.php';
require_once __DIR__ . '/../controllers/GrievanceController.php';
require_once __DIR__ . '/../controllers/ExamController.php';
require_once __DIR__ . '/../controllers/CampusLifeController.php';
require_once __DIR__ . '/../controllers/ChatbotController.php';

// Route discovery
$route = $_GET['r'] ?? $_GET['route'] ?? '';

if (empty($route)) {
    // Try PATH_INFO or parse REQUEST_URI
    $pathInfo = $_SERVER['PATH_INFO'] ?? '';
    if (!empty($pathInfo)) {
        $route = trim($pathInfo, '/');
    } else {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        // Find portion after /api/ or /index.php/
        if (preg_match('#(?:/api/index\.php/|/api/)(.+)$#i', $uri, $matches)) {
            $route = trim($matches[1], '/');
        }
    }
}

$route = trim($route, '/');
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($route) {
        // System Health
        case 'health':
        case '':
            Response::json([
                'status'  => 'online',
                'name'    => 'Unified Campus ERP API',
                'version' => '1.0.0',
                'php'     => PHP_VERSION,
                'time'    => date('c')
            ]);
            break;

        // Auth routes
        case 'auth/login':
            if ($method === 'POST') AuthController::login();
            break;

        case 'auth/me':
            if ($method === 'GET') AuthController::me();
            break;

        case 'auth/logout':
            if ($method === 'POST') AuthController::logout();
            break;

        case 'auth/demo-switch':
            if ($method === 'POST') AuthController::demoSwitch();
            break;

        case 'auth/demo-accounts':
            if ($method === 'GET') AuthController::listDemoAccounts();
            break;

        // Profile routes ("Fill Once, Use Everywhere")
        case 'profile/me':
            if ($method === 'GET') ProfileController::getOwnProfile();
            break;

        case 'profile/update-contact':
            if ($method === 'POST' || $method === 'PATCH') ProfileController::updateOwnContact();
            break;

        case 'students':
            if ($method === 'GET') ProfileController::listStudents();
            break;

        // RBAC routes
        case 'rbac/roles':
            if ($method === 'GET') RbacController::getRoles();
            break;

        case 'rbac/tags':
            if ($method === 'GET') RbacController::getTags();
            break;

        case 'rbac/user-tags':
            if ($method === 'GET') RbacController::getUserTags();
            break;

        case 'rbac/assign-tag':
            if ($method === 'POST') RbacController::assignTag();
            break;

        case 'rbac/revoke-tag':
            if ($method === 'POST') RbacController::revokeTag();
            break;

        // Master data
        case 'master/departments':
            if ($method === 'GET') AcademicMasterController::getDepartments();
            break;

        case 'master/programs':
            if ($method === 'GET') AcademicMasterController::getPrograms();
            break;

        case 'master/audit-logs':
            if ($method === 'GET') AcademicMasterController::getAuditLogs();
            break;

        // Phase 2: Smart Forms Engine ("Fill Once, Use Everywhere")
        case 'forms':
            if ($method === 'GET') SmartFormController::listForms();
            break;

        case 'forms/detail':
            if ($method === 'GET') SmartFormController::getFormDetail();
            break;

        case 'forms/submit':
            if ($method === 'POST') SmartFormController::submitForm();
            break;

        case 'forms/create':
            if ($method === 'POST') SmartFormController::createForm();
            break;

        case 'forms/submissions':
            if ($method === 'GET') SmartFormController::getSubmissions();
            break;

        case 'forms/export-csv':
            if ($method === 'GET') SmartFormController::exportCsv();
            break;

        // Phase 3: Digital Service Request Center (Certificates & Applications)
        case 'services/catalog':
            if ($method === 'GET') ServiceRequestController::getCatalog();
            break;

        case 'services/my-requests':
            if ($method === 'GET') ServiceRequestController::getMyRequests();
            break;

        case 'services/apply':
            if ($method === 'POST') ServiceRequestController::apply();
            break;

        case 'services/requests':
            if ($method === 'GET') ServiceRequestController::getRequests();
            break;

        case 'services/detail':
            if ($method === 'GET') ServiceRequestController::getRequestDetail();
            break;

        case 'services/update-status':
            if ($method === 'POST') ServiceRequestController::updateStatus();
            break;

        case 'services/certificate':
            if ($method === 'GET') ServiceRequestController::getCertificate();
            break;

        case 'services/pickup-pass':
            if ($method === 'GET') ServiceRequestController::getPickupPass();
            break;

        case 'services/respond-action':
            if ($method === 'POST') ServiceRequestController::respondAction();
            break;

        // Phase 4: Targeted Announcements & Notification System
        case 'notices':
            if ($method === 'GET') NoticeController::listNotices();
            break;

        case 'notices/detail':
            if ($method === 'GET') NoticeController::getNoticeDetail();
            break;

        case 'notices/create':
            if ($method === 'POST') NoticeController::createNotice();
            break;

        case 'notices/acknowledge':
            if ($method === 'POST') NoticeController::acknowledgeNotice();
            break;

        case 'notices/compliance-export':
            if ($method === 'GET') NoticeController::exportCompliance();
            break;

        case 'notices/upload':
            if ($method === 'POST') NoticeController::uploadAttachment();
            break;

        case 'notices/download':
            if ($method === 'GET') NoticeController::downloadAttachment();
            break;

        case 'notices/send-reminder':
            if ($method === 'POST') NoticeController::sendReminder();
            break;

        case 'notices/my-email-reminders':
            if ($method === 'GET') NoticeController::getMyEmailReminders();
            break;

        case 'notices/reminder-history':
            if ($method === 'GET') NoticeController::getReminderHistory();
            break;

        case 'notices/mark-reminder-read':
            if ($method === 'POST') NoticeController::markReminderRead();
            break;

        case 'notices/automation-settings':
            if ($method === 'GET') NoticeController::getAutomationSettings();
            if ($method === 'POST') NoticeController::updateAutomationSettings();
            break;

        case 'notices/run-automation':
            if ($method === 'POST') NoticeController::runAutomatedCycle();
            break;

        case 'notices/automated-logs':
            if ($method === 'GET') NoticeController::getAutomatedReminderLogs();
            break;

        case 'notices/toggle-auto-reminder':
            if ($method === 'POST') NoticeController::toggleAutoReminder();
            break;

        // Phase 5: Grievances & Maintenance Desk
        case 'grievances':
            if ($method === 'GET') GrievanceController::listGrievances();
            break;

        case 'grievances/detail':
            if ($method === 'GET') GrievanceController::getGrievanceDetail();
            break;

        case 'grievances/categories':
            if ($method === 'GET') GrievanceController::getCategories();
            break;

        case 'grievances/pattern-radar':
            if ($method === 'GET') GrievanceController::getPatternRadar();
            break;

        case 'grievances/create':
            if ($method === 'POST') GrievanceController::createGrievance();
            break;

        case 'grievances/assign':
            if ($method === 'POST') GrievanceController::assignTechnician();
            break;

        case 'grievances/resolve':
            if ($method === 'POST') GrievanceController::resolveGrievance();
            break;

        case 'grievances/rate':
            if ($method === 'POST') GrievanceController::rateGrievance();
            break;

        case 'grievances/escalate':
            if ($method === 'POST') GrievanceController::escalateTicket();
            break;

        // Phase 6: Institutional Examinations, Admit Cards & Academic Results
        case 'exams/sessions':
            if ($method === 'GET') ExamController::listSessions();
            break;

        case 'exams/courses':
            if ($method === 'GET') ExamController::listCourses();
            break;

        case 'exams/schedules':
            if ($method === 'GET') ExamController::listSchedules();
            break;

        case 'exams/create-schedule':
            if ($method === 'POST') ExamController::createSchedule();
            break;

        case 'exams/admit-card':
            if ($method === 'GET') ExamController::getAdmitCard();
            break;

        case 'exams/admit-cards-roster':
            if ($method === 'GET') ExamController::listAdmitCardsRoster();
            break;

        case 'exams/toggle-admit-card':
            if ($method === 'POST') ExamController::toggleAdmitCard();
            break;

        case 'exams/bulk-release-admit-cards':
            if ($method === 'POST') ExamController::bulkReleaseAdmitCards();
            break;

        case 'exams/results':
            if ($method === 'GET') ExamController::getResults();
            break;

        case 'exams/enter-marks':
            if ($method === 'POST') ExamController::enterMarks();
            break;

        case 'exams/publish-results':
            if ($method === 'POST') ExamController::publishResults();
            break;

        // Phase 7: Campus Life, Gatepass, Mess Operations & Academic Attendance
        case 'campus/attendance':
            if ($method === 'GET') CampusLifeController::getAttendance();
            break;

        case 'campus/attendance/roster':
            if ($method === 'GET') CampusLifeController::getAttendanceRoster();
            break;

        case 'campus/attendance/submit':
            if ($method === 'POST') CampusLifeController::submitAttendanceRoster();
            break;

        case 'campus/attendance/history':
            if ($method === 'GET') CampusLifeController::getAttendanceHistory();
            break;

        case 'campus/faculty-subject/allocations':
            if ($method === 'GET') CampusLifeController::getSubjectAllocations();
            break;

        case 'campus/faculty-subject/assign':
            if ($method === 'POST') CampusLifeController::assignFacultySubject();
            break;

        case 'campus/timetable':
            if ($method === 'GET') CampusLifeController::getTimetable();
            break;

        case 'campus/timetable/update-slot':
            if ($method === 'POST') CampusLifeController::updateTimetableSlot();
            break;

        case 'campus/academic-calendar':
            if ($method === 'GET') CampusLifeController::getAcademicCalendar();
            break;

        case 'campus/calendar-events/create':
            if ($method === 'POST') CampusLifeController::createCalendarEvent();
            break;

        case 'campus/duty-leaves':
            if ($method === 'GET') CampusLifeController::getDutyLeaves();
            break;

        case 'campus/duty-leaves/apply':
            if ($method === 'POST') CampusLifeController::applyDutyLeave();
            break;

        case 'campus/duty-leaves/review':
            if ($method === 'POST') CampusLifeController::reviewDutyLeave();
            break;

        case 'campus/gatepasses':
            if ($method === 'GET') CampusLifeController::getGatepasses();
            break;

        case 'campus/gatepasses/apply':
            if ($method === 'POST') CampusLifeController::applyGatepass();
            break;

        case 'campus/gatepasses/review':
            if ($method === 'POST') CampusLifeController::reviewGatepass();
            break;

        case 'campus/gatepasses/punch':
            if ($method === 'POST') CampusLifeController::punchGatepass();
            break;

        case 'campus/gatepasses/census':
            if ($method === 'GET') CampusLifeController::getCampusCensus();
            break;

        case 'campus/hostel-leaves':
            if ($method === 'GET') CampusLifeController::getHostelLeaves();
            break;

        case 'campus/hostel-leaves/apply':
            if ($method === 'POST') CampusLifeController::applyHostelLeave();
            break;

        case 'campus/hostel-leaves/review':
            if ($method === 'POST') CampusLifeController::reviewHostelLeave();
            break;

        case 'campus/hostel-leaves/cancel':
            if ($method === 'POST') CampusLifeController::cancelHostelLeave();
            break;

        case 'campus/mess/menu':
            if ($method === 'GET') CampusLifeController::getMessMenu();
            break;

        case 'campus/mess/rsvps':
            if ($method === 'GET') CampusLifeController::getMessRsvps();
            break;

        case 'campus/mess/rsvp':
            if ($method === 'POST') CampusLifeController::toggleMessRsvp();
            break;

        case 'campus/mess/bulk-rsvp':
            if ($method === 'POST') CampusLifeController::bulkMessRsvp();
            break;

        case 'campus/mess/analytics':
            if ($method === 'GET') CampusLifeController::getMessAnalytics();
            break;

        case 'campus/mess/feedback':
            if ($method === 'POST') CampusLifeController::submitMessFeedback();
            break;

        case 'campus/mess/update-menu':
            if ($method === 'POST') CampusLifeController::updateMessMenu();
            break;

        case 'campus/mess/feedback-ledger':
            if ($method === 'GET') CampusLifeController::getMessFeedbackLedger();
            break;

        case 'campus/mess/roster':
            if ($method === 'GET') CampusLifeController::getMessRoster();
            break;

        case 'campus/feature-phone/ussd':
            if ($method === 'POST') CampusLifeController::processUssd();
            break;

        case 'campus/migration/import-csv':
            if ($method === 'POST') CampusLifeController::processMigrationImport();
            break;

        // Phase 7.8: Self-Learning Grok-Powered CampusDesk Chatbot & Support Desk
        case 'chatbot/ask':
            if ($method === 'POST') ChatbotController::ask();
            break;

        case 'chatbot/messages':
            if ($method === 'GET') ChatbotController::getMessages();
            break;

        case 'chatbot/escalate':
            if ($method === 'POST') ChatbotController::escalate();
            break;

        case 'support/sessions':
            if ($method === 'GET') ChatbotController::listSupportSessions();
            break;

        case 'support/session-detail':
            if ($method === 'GET') ChatbotController::getSessionDetail();
            break;

        case 'support/send-reply':
            if ($method === 'POST') ChatbotController::sendStaffReply();
            break;

        case 'support/resolve-session':
            if ($method === 'POST') ChatbotController::resolveSession();
            break;

        case 'support/learned-qa':
            if ($method === 'GET') ChatbotController::listLearnedQA();
            break;

        case 'support/teach-qa':
            if ($method === 'POST') ChatbotController::teachQA();
            break;

        case 'support/delete-qa':
            if ($method === 'POST') ChatbotController::deleteQA();
            break;

        case 'support/settings':
            if ($method === 'GET') ChatbotController::getSettings();
            if ($method === 'POST') ChatbotController::updateSettings();
            break;

        default:
            Response::error("Endpoint '{$route}' not found.", 404);
            break;
    }

    Response::error("Method {$method} not allowed for endpoint '{$route}'.", 405);

} catch (\Throwable $e) {
    Response::error('Server Exception: ' . $e->getMessage(), 500, [
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
