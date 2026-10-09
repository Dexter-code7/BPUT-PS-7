<?php
// Unified Campus ERP - Self-Learning Grok-Powered CampusDesk Chatbot & Support Controller
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/audit.php';

class ChatbotController {

    /**
     * Helper to get active session or initialize a new one
     */
    private static function getOrCreateSession(PDO $db, int $userId): array {
        $stmt = $db->prepare("
            SELECT * FROM chatbot_sessions
            WHERE user_id = :uid AND status IN ('bot', 'escalated_pending', 'human_active')
            ORDER BY created_at DESC LIMIT 1
        ");
        $stmt->execute([':uid' => $userId]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$session) {
            $token = 'SESS-' . strtoupper(bin2hex(random_bytes(12)));
            $ins = $db->prepare("
                INSERT INTO chatbot_sessions (user_id, session_token, status, human_request_count, created_at)
                VALUES (:uid, :tok, 'bot', 0, NOW())
            ");
            $ins->execute([':uid' => $userId, ':tok' => $token]);
            $sessionId = (int)$db->lastInsertId();

            $stmt->execute([':uid' => $userId]);
            $session = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        return $session;
    }

    /**
     * Helper to detect human escalation intent in text
     */
    private static function isHumanEscalationRequest(string $text): bool {
        $lower = strtolower($text);
        $triggers = [
            'connect me to human',
            'connect to human',
            'talk to human',
            'speak to human',
            'human please',
            'support staff',
            'live agent',
            'talk to staff',
            'contact human',
            'human support',
            'transfer to human',
            'human representative',
            'connect with person',
            'talk to a person',
            'talk to someone',
            'call staff',
            'agent',
            'insan se baat'
        ];

        foreach ($triggers as $t) {
            if (strpos($lower, $t) !== false) {
                return true;
            }
        }
        return false;
    }

    /**
     * Query Grok / Groq AI API
     */
    private static function queryGrokAi(string $userPrompt, string $apiKey, string $model): ?string {
        if (empty($apiKey)) return null;

        $isGroq = (strpos($apiKey, 'gsk_') === 0);
        $endpoint = $isGroq
            ? 'https://api.groq.com/openai/v1/chat/completions'
            : 'https://api.x.ai/v1/chat/completions';

        // Choose normal model for fast, reliable chat
        $targetModel = $model;
        if (empty($targetModel) || $targetModel === 'grok-beta') {
            $targetModel = $isGroq ? 'openai/gpt-oss-20b' : 'grok-beta';
        }

        $ch = curl_init($endpoint);
        $payload = [
            'model' => $targetModel,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are the official Central University of Technology AI Campus Assistant (CampusDesk). Provide helpful, clear, and institutional answers. Strictly follow university guidelines. Avoid emojis. Keep answers concise (2-4 sentences).'
                ],
                [
                    'role' => 'user',
                    'content' => $userPrompt
                ]
            ],
            'temperature' => 0.3,
            'max_tokens' => 300
        ];

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 8);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            $data = json_decode($response, true);
            $content = $data['choices'][0]['message']['content'] ?? '';
            if (!empty($content)) {
                $cleaned = preg_replace('/<think>.*?<\/think>/is', '', $content);
                return trim($cleaned);
            }
        }
        return null;
    }

    /**
     * POST /chatbot/ask - Main conversation endpoint
     */
    public static function ask(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $queryText = trim($input['query'] ?? '');
        $lang = $input['language'] ?? 'en';

        if (empty($queryText)) {
            Response::error('Query text cannot be empty.', 400);
        }

        $session = self::getOrCreateSession($db, $user['id']);
        $sessionId = (int)$session['id'];

        // 1. Log student message
        $db->prepare("
            INSERT INTO chatbot_messages (session_id, sender_type, sender_user_id, message_text, created_at)
            VALUES (:sid, 'student', :uid, :msg, NOW())
        ")->execute([
            ':sid' => $sessionId,
            ':uid' => $user['id'],
            ':msg' => $queryText
        ]);

        // 2. Check if the session is currently in Human Active or Escalated Pending mode
        if (in_array($session['status'], ['human_active', 'escalated_pending'])) {
            // Human staff is already connected or student is in queue
            Response::json([
                'session_id' => $sessionId,
                'status' => $session['status'],
                'sender' => 'system',
                'message' => ($session['status'] === 'human_active')
                    ? 'Your message has been sent to the on-call support officer.'
                    : 'Your message has been added to your active support queue. An officer will reply shortly.',
                'action_route' => null
            ]);
            return;
        }

        // 3. Check for Human Handover Intent
        $isHumanRequest = self::isHumanEscalationRequest($queryText);
        $humanCount = (int)$session['human_request_count'];

        if ($isHumanRequest) {
            $humanCount++;
            $db->prepare("UPDATE chatbot_sessions SET human_request_count = :cnt WHERE id = :id")
               ->execute([':cnt' => $humanCount, ':id' => $sessionId]);

            if ($humanCount >= 2) {
                // Elevate to human support queue!
                $db->prepare("
                    UPDATE chatbot_sessions
                    SET status = 'escalated_pending',
                        escalated_at = NOW(),
                        unresolved_question = :q
                    WHERE id = :id
                ")->execute([':q' => $queryText, ':id' => $sessionId]);

                $escalationMsg = ($lang === 'hi')
                    ? 'आपकी चैट केंद्रीय विश्वविद्यालय सहायता डेस्क (Support Staff) को स्थानांतरित कर दी गई है। उपलब्ध अधिकारी शीघ्र ही आपसे जुड़ेंगे।'
                    : (($lang === 'or')
                    ? 'ଆପଣଙ୍କ ଚାଟ୍ କେନ୍ଦ୍ରୀୟ ବିଶ୍ୱବିଦ୍ୟାଳୟ ସହାୟତା ଡେସ୍କକୁ ପଠାଗଲା। ଅଧିକାରୀ ଖୁବ୍ ଶୀଘ୍ର ଉତ୍ତର ଦେବେ।'
                    : 'You have been connected to the Central University Support Desk queue. A human support officer will assist you shortly. You may leave your specific question here.');

                $db->prepare("
                    INSERT INTO chatbot_messages (session_id, sender_type, sender_user_id, message_text, created_at)
                    VALUES (:sid, 'bot', NULL, :msg, NOW())
                ")->execute([':sid' => $sessionId, ':msg' => $escalationMsg]);

                Response::json([
                    'session_id' => $sessionId,
                    'status' => 'escalated_pending',
                    'sender' => 'bot',
                    'message' => $escalationMsg,
                    'action_route' => null,
                    'is_escalated' => true
                ]);
                return;
            } else {
                // First request: Bot politely confirms handover
                $confirmMsg = ($lang === 'hi')
                    ? 'मैं आपको मानव सहायता अधिकारी (Support Staff) से जोड़ सकता हूँ। यदि आप आगे बढ़ना चाहते हैं, तो कृपया दोबारा "Connect me to human" लिखें।'
                    : (($lang === 'or')
                    ? 'ମୁଁ ଆପଣଙ୍କୁ ସହାୟତା ଅଧିକାରୀଙ୍କ ସହ ସଂଯୋଗ କରିପାରିବି। ନିଶ୍ଚିତ କରିବା ପାଇଁ ପୁଣି ଥରେ ଲେଖନ୍ତୁ।'
                    : 'I can connect you directly with our on-call Support Staff. Please repeat "Connect me to human" once more to immediately hand over your chat.');

                $db->prepare("
                    INSERT INTO chatbot_messages (session_id, sender_type, sender_user_id, message_text, created_at)
                    VALUES (:sid, 'bot', NULL, :msg, NOW())
                ")->execute([':sid' => $sessionId, ':msg' => $confirmMsg]);

                Response::json([
                    'session_id' => $sessionId,
                    'status' => 'bot',
                    'sender' => 'bot',
                    'message' => $confirmMsg,
                    'action_route' => null,
                    'human_request_count' => $humanCount
                ]);
                return;
            }
        }

        // 4. Check Self-Learned Knowledge Base (`chatbot_learned_qa`)
        $tokens = preg_split('/\s+/', strtolower($queryText));
        $keywordsFilter = array_filter($tokens, fn($t) => strlen($t) > 2);

        $learnedStmt = $db->query("
            SELECT * FROM chatbot_learned_qa
            WHERE is_verified = 1
            ORDER BY times_used DESC, id DESC
        ");
        $allLearned = $learnedStmt->fetchAll(PDO::FETCH_ASSOC);

        $bestMatch = null;
        $highestScore = 0;

        foreach ($allLearned as $entry) {
            $score = 0;
            $entryKeywords = strtolower($entry['keywords'] . ' ' . $entry['question_pattern']);

            foreach ($keywordsFilter as $word) {
                if (strpos($entryKeywords, $word) !== false) {
                    $score += 2;
                }
            }

            // Exact phrase match check
            if (strpos($entryKeywords, strtolower($queryText)) !== false) {
                $score += 5;
            }

            if ($score > $highestScore && $score >= 2) {
                $highestScore = $score;
                $bestMatch = $entry;
            }
        }

        if ($bestMatch) {
            // Found in learned repository!
            $db->prepare("UPDATE chatbot_learned_qa SET times_used = times_used + 1 WHERE id = :id")
               ->execute([':id' => $bestMatch['id']]);

            $ans = $bestMatch['answer_text'];
            if ($lang === 'hi' && !empty($bestMatch['answer_hi'])) {
                $ans = $bestMatch['answer_hi'];
            } elseif ($lang === 'or' && !empty($bestMatch['answer_or'])) {
                $ans = $bestMatch['answer_or'];
            }

            $db->prepare("
                INSERT INTO chatbot_messages (session_id, sender_type, sender_user_id, message_text, is_learned, action_route, created_at)
                VALUES (:sid, 'bot', NULL, :msg, 1, :rt, NOW())
            ")->execute([
                ':sid' => $sessionId,
                ':msg' => $ans,
                ':rt' => $bestMatch['action_route']
            ]);

            Response::json([
                'session_id' => $sessionId,
                'status' => 'bot',
                'sender' => 'bot',
                'message' => $ans,
                'is_learned' => true,
                'source' => 'learned_knowledge_base',
                'category' => $bestMatch['category'],
                'action_route' => $bestMatch['action_route']
            ]);
            return;
        }

        // 5. Check Grok / Groq AI API
        $grokApiKey = (string)$db->query("SELECT setting_value FROM chatbot_settings WHERE setting_key = 'grok_api_key'")->fetchColumn();
        if (empty($grokApiKey) && file_exists(__DIR__ . '/../../grok.txt')) {
            $grokApiKey = trim(file_get_contents(__DIR__ . '/../../grok.txt'));
        }
        $grokModel = (string)$db->query("SELECT setting_value FROM chatbot_settings WHERE setting_key = 'grok_model'")->fetchColumn();
        if (empty($grokModel) || $grokModel === 'grok-beta') {
            $grokModel = (strpos($grokApiKey, 'gsk_') === 0) ? 'openai/gpt-oss-20b' : 'grok-beta';
        }

        if (!empty($grokApiKey)) {
            $grokReply = self::queryGrokAi($queryText, $grokApiKey, $grokModel);
            if (!empty($grokReply)) {
                $db->prepare("
                    INSERT INTO chatbot_messages (session_id, sender_type, sender_user_id, message_text, is_learned, created_at)
                    VALUES (:sid, 'bot', NULL, :msg, 0, NOW())
                ")->execute([
                    ':sid' => $sessionId,
                    ':msg' => $grokReply
                ]);

                Response::json([
                    'session_id' => $sessionId,
                    'status' => 'bot',
                    'sender' => 'bot',
                    'message' => $grokReply,
                    'is_learned' => false,
                    'source' => 'campus_ai_engine'
                ]);
                return;
            }
        }

        // 6. Unknown Query -> Flag for Support Staff Learning!
        $db->prepare("
            UPDATE chatbot_sessions
            SET unresolved_question = :q
            WHERE id = :id
        ")->execute([':q' => $queryText, ':id' => $sessionId]);

        $defaultReply = ($lang === 'hi')
            ? "मुझे अभी इस विशिष्ट प्रश्न का आधिकारिक उत्तर उपलब्ध नहीं है। मैंने इसे सहायता कर्मचारियों (Support Staff) के समाधान हेतु दर्ज कर लिया है।"
            : (($lang === 'or')
            ? "ମୋ ପାଖରେ ଏହି ପ୍ରଶ୍ନର ଅନୁମୋଦିତ ଉତ୍ତର ବର୍ତ୍ତମାନ ନାହିଁ। ଏହାକୁ ସହାୟତା ଡେସ୍କରେ ତାଲିକାଭୁକ୍ତ କରାଗଲା।"
            : "I do not currently have the verified official answer for this query in the university handbook. I have flagged this for the Support Staff Desk to review. Once answered by staff, I will remember it permanently.");

        $db->prepare("
            INSERT INTO chatbot_messages (session_id, sender_type, sender_user_id, message_text, is_learned, created_at)
            VALUES (:sid, 'bot', NULL, :msg, 0, NOW())
        ")->execute([
            ':sid' => $sessionId,
            ':msg' => $defaultReply
        ]);

        Response::json([
            'session_id' => $sessionId,
            'status' => 'bot',
            'sender' => 'bot',
            'message' => $defaultReply,
            'is_learned' => false,
            'source' => 'unresolved_flagged'
        ]);
    }

    /**
     * GET /chatbot/messages - Get recent messages for current user's session
     */
    public static function getMessages(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $session = self::getOrCreateSession($db, $user['id']);
        $sessionId = (int)$session['id'];

        $stmt = $db->prepare("
            SELECT cm.*, u.username AS sender_username, stp.full_name AS staff_name
            FROM chatbot_messages cm
            LEFT JOIN users u ON cm.sender_user_id = u.id
            LEFT JOIN staff_profiles stp ON u.id = stp.user_id
            WHERE cm.session_id = :sid
            ORDER BY cm.created_at ASC
        ");
        $stmt->execute([':sid' => $sessionId]);
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            'session' => $session,
            'messages' => $messages
        ]);
    }

    /**
     * POST /chatbot/escalate - Explicitly connect to human
     */
    public static function escalate(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $session = self::getOrCreateSession($db, $user['id']);
        $sessionId = (int)$session['id'];

        $db->prepare("
            UPDATE chatbot_sessions
            SET status = 'escalated_pending',
                escalated_at = NOW()
            WHERE id = :id
        ")->execute([':id' => $sessionId]);

        $notice = "Session escalated to Human Support Desk. You are now placed in the on-call staff queue.";
        $db->prepare("
            INSERT INTO chatbot_messages (session_id, sender_type, message_text, created_at)
            VALUES (:sid, 'bot', :msg, NOW())
        ")->execute([':sid' => $sessionId, ':msg' => $notice]);

        Response::json([
            'message' => 'Escalated to human support queue.',
            'status' => 'escalated_pending'
        ]);
    }

    // ==========================================
    // SUPPORT STAFF & ADMIN MANAGEMENT ENDPOINTS
    // ==========================================

    /**
     * GET /support/sessions - List escalated and active support sessions
     */
    public static function listSupportSessions(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $statusFilter = $_GET['status'] ?? 'all';

        $query = "
            SELECT
                cs.*,
                u.username AS student_username,
                sp.full_name AS student_name,
                sp.roll_number,
                sp.hostel_name,
                sp.room_number,
                d.name AS department_name,
                staff_u.username AS assigned_staff_username,
                stp.full_name AS assigned_staff_name,
                (SELECT COUNT(*) FROM chatbot_messages WHERE session_id = cs.id) AS message_count,
                (SELECT message_text FROM chatbot_messages WHERE session_id = cs.id ORDER BY id DESC LIMIT 1) AS last_message,
                (SELECT created_at FROM chatbot_messages WHERE session_id = cs.id ORDER BY id DESC LIMIT 1) AS last_message_at
            FROM chatbot_sessions cs
            JOIN users u ON cs.user_id = u.id
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            LEFT JOIN departments d ON sp.department_id = d.id
            LEFT JOIN users staff_u ON cs.assigned_staff_id = staff_u.id
            LEFT JOIN staff_profiles stp ON staff_u.id = stp.user_id
            WHERE 1=1
        ";

        if ($statusFilter !== 'all') {
            $query .= " AND cs.status = :st";
            $stmt = $db->prepare($query . " ORDER BY cs.escalated_at DESC, cs.updated_at DESC");
            $stmt->execute([':st' => $statusFilter]);
        } else {
            $stmt = $db->prepare($query . " ORDER BY FIELD(cs.status, 'escalated_pending', 'human_active', 'bot', 'resolved', 'closed'), cs.updated_at DESC");
            $stmt->execute();
        }

        $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Stats counts
        $counts = [
            'pending' => (int)$db->query("SELECT COUNT(*) FROM chatbot_sessions WHERE status = 'escalated_pending'")->fetchColumn(),
            'active' => (int)$db->query("SELECT COUNT(*) FROM chatbot_sessions WHERE status = 'human_active'")->fetchColumn(),
            'resolved' => (int)$db->query("SELECT COUNT(*) FROM chatbot_sessions WHERE status = 'resolved'")->fetchColumn(),
            'learned_total' => (int)$db->query("SELECT COUNT(*) FROM chatbot_learned_qa")->fetchColumn()
        ];

        Response::json([
            'sessions' => $sessions,
            'counts' => $counts
        ]);
    }

    /**
     * GET /support/session-detail - Get full message history for a specific session
     */
    public static function getSessionDetail(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $sessionId = (int)($_GET['session_id'] ?? 0);
        if ($sessionId <= 0) {
            Response::error('Session ID required.', 400);
        }

        $stmt = $db->prepare("
            SELECT
                cs.*,
                u.username AS student_username,
                sp.full_name AS student_name,
                sp.roll_number,
                sp.registration_number,
                sp.hostel_name,
                sp.room_number,
                d.name AS department_name
            FROM chatbot_sessions cs
            JOIN users u ON cs.user_id = u.id
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            LEFT JOIN departments d ON sp.department_id = d.id
            WHERE cs.id = :id
        ");
        $stmt->execute([':id' => $sessionId]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$session) {
            Response::error('Session not found.', 404);
        }

        $msgStmt = $db->prepare("
            SELECT cm.*, u.username AS sender_username, stp.full_name AS staff_name
            FROM chatbot_messages cm
            LEFT JOIN users u ON cm.sender_user_id = u.id
            LEFT JOIN staff_profiles stp ON u.id = stp.user_id
            WHERE cm.session_id = :sid
            ORDER BY cm.created_at ASC
        ");
        $msgStmt->execute([':sid' => $sessionId]);
        $messages = $msgStmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            'session' => $session,
            'messages' => $messages
        ]);
    }

    /**
     * POST /support/send-reply - Support staff answers the student
     */
    public static function sendStaffReply(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $sessionId = (int)($input['session_id'] ?? 0);
        $messageText = trim($input['message'] ?? '');
        $autoTeach = !empty($input['auto_teach']);
        $questionPattern = trim($input['question_pattern'] ?? '');
        $keywords = trim($input['keywords'] ?? '');

        if ($sessionId <= 0 || empty($messageText)) {
            Response::error('Session ID and message text are required.', 400);
        }

        // Update session to human_active and assign staff
        $db->prepare("
            UPDATE chatbot_sessions
            SET status = 'human_active',
                assigned_staff_id = :uid,
                updated_at = NOW()
            WHERE id = :id
        ")->execute([':uid' => $user['id'], ':id' => $sessionId]);

        // Insert staff message
        $db->prepare("
            INSERT INTO chatbot_messages (session_id, sender_type, sender_user_id, message_text, created_at)
            VALUES (:sid, 'human_staff', :uid, :msg, NOW())
        ")->execute([
            ':sid' => $sessionId,
            ':uid' => $user['id'],
            ':msg' => $messageText
        ]);

        // If autoTeach is checked, permanently teach this Q&A pair to the chatbot!
        $taughtRecordId = null;
        if ($autoTeach && !empty($questionPattern)) {
            $kw = $keywords ?: strtolower($questionPattern);
            $ins = $db->prepare("
                INSERT INTO chatbot_learned_qa (question_pattern, keywords, answer_text, category, taught_by_user_id, is_verified, times_used)
                VALUES (:q, :k, :a, 'staff_taught', :uid, 1, 1)
            ");
            $ins->execute([
                ':q' => $questionPattern,
                ':k' => $kw,
                ':a' => $messageText,
                ':uid' => $user['id']
            ]);
            $taughtRecordId = (int)$db->lastInsertId();
        }

        Response::json([
            'message' => 'Reply delivered to student successfully.',
            'is_taught' => (bool)$taughtRecordId,
            'taught_id' => $taughtRecordId
        ]);
    }

    /**
     * POST /support/resolve-session - Mark session resolved
     */
    public static function resolveSession(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $sessionId = (int)($input['session_id'] ?? 0);

        if ($sessionId <= 0) {
            Response::error('Session ID required.', 400);
        }

        $db->prepare("
            UPDATE chatbot_sessions
            SET status = 'resolved',
                resolved_at = NOW()
            WHERE id = :id
        ")->execute([':id' => $sessionId]);

        // Post resolution closing note
        $closing = "Session marked resolved by Support Officer. If you have any further questions, you can continue chatting at any time.";
        $db->prepare("
            INSERT INTO chatbot_messages (session_id, sender_type, message_text, created_at)
            VALUES (:sid, 'bot', :msg, NOW())
        ")->execute([':sid' => $sessionId, ':msg' => $closing]);

        Response::json(['message' => 'Session resolved successfully.']);
    }

    /**
     * GET /support/learned-qa - List all learned Q&A knowledge entries
     */
    public static function listLearnedQA(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $stmt = $db->query("
            SELECT qa.*, u.username AS taught_by_username, stp.full_name AS taught_by_name
            FROM chatbot_learned_qa qa
            LEFT JOIN users u ON qa.taught_by_user_id = u.id
            LEFT JOIN staff_profiles stp ON u.id = stp.user_id
            ORDER BY qa.times_used DESC, qa.id DESC
        ");
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json(['qa_items' => $items]);
    }

    /**
     * POST /support/teach-qa - Directly add or edit learned knowledge entry
     */
    public static function teachQA(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $question = trim($input['question'] ?? '');
        $keywords = trim($input['keywords'] ?? '');
        $answer = trim($input['answer'] ?? '');
        $answerHi = trim($input['answer_hi'] ?? '');
        $answerOr = trim($input['answer_or'] ?? '');
        $category = trim($input['category'] ?? 'general');
        $actionRoute = trim($input['action_route'] ?? '');

        if (empty($question) || empty($answer)) {
            Response::error('Question pattern and answer text are mandatory.', 400);
        }

        $kw = $keywords ?: strtolower($question);

        $stmt = $db->prepare("
            INSERT INTO chatbot_learned_qa (question_pattern, keywords, answer_text, answer_hi, answer_or, category, action_route, taught_by_user_id, is_verified, times_used)
            VALUES (:q, :k, :a, :ahi, :aor, :cat, :rt, :uid, 1, 1)
        ");
        $stmt->execute([
            ':q' => $question,
            ':k' => $kw,
            ':a' => $answer,
            ':ahi' => $answerHi ?: null,
            ':aor' => $answerOr ?: null,
            ':cat' => $category,
            ':rt' => $actionRoute ?: null,
            ':uid' => $user['id']
        ]);

        Response::json([
            'message' => 'Question & answer successfully taught to CampusDesk knowledge engine.',
            'id' => (int)$db->lastInsertId()
        ]);
    }

    /**
     * POST /support/delete-qa - Delete a learned Q&A entry
     */
    public static function deleteQA(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $id = (int)($input['id'] ?? 0);

        if ($id <= 0) {
            Response::error('ID required.', 400);
        }

        $db->prepare("DELETE FROM chatbot_learned_qa WHERE id = :id")->execute([':id' => $id]);
        Response::json(['message' => 'Knowledge base entry removed.']);
    }

    /**
     * GET /support/settings - Get Grok API and chatbot configuration
     */
    public static function getSettings(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $rows = $db->query("SELECT setting_key, setting_value FROM chatbot_settings")->fetchAll(PDO::FETCH_KEY_PAIR);
        Response::json(['settings' => $rows]);
    }

    /**
     * POST /support/settings - Update Grok API key or chatbot configuration
     */
    public static function updateSettings(): void {
        $user = AuthHelper::authenticate();
        $db = Database::getConnection();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $stmt = $db->prepare("
            INSERT INTO chatbot_settings (setting_key, setting_value)
            VALUES (:k, :v)
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        ");

        foreach ($input as $k => $v) {
            $stmt->execute([':k' => (string)$k, ':v' => (string)$v]);
        }

        Response::json(['message' => 'Settings updated successfully.']);
    }
}
