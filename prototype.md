# Unified Campus ERP (Smart Campus Operating System)
## System Prototype Specification, Architecture, Features & Operational Workflows

**Document Version**: 1.0.0 · Final Production Release  
**Target Event**: BPUT Hackathon 2026 · Problem Statement 07 (Fretbox)  
**Theme**: *"Attendance, Mess, Hostel, Repeat: Campus Life, Debugged"*  
**Golden Rule**: *"Fill Once, Use Everywhere"* — Zero redundant paperwork, zero WhatsApp broadcast chaos.  
**Design Standard**: Institutional Light Heritage Palette (`#1B4332` Heritage Emerald, `#9A3412` Warm Terracotta, `#FAF9F6` Paper Canvas), Zero Emoji Rule, High Data Density, Production-Ready RBAC.

---

## 1. Executive Summary & Problem Context

Colleges and technical universities across India (especially under state technical bodies like BPUT) operate on a fragmented patchwork of registers, notice boards, WhatsApp groups, printed paper forms, and disconnected spreadsheets. Students lose hours standing in queues across administrative blocks, and administrators lack real-time visibility into pending tasks, curfew status, mess procurement, and statutory compliance.

### The Ground Reality Friction (Tuesday Story)
A student who needs a Bonafide Certificate, wants to report a leaking hostel tap, needs to check if tomorrow's 9:00 AM lecture is cancelled, and wants to verify the mess menu has to visit **one office counter**, **one hostel warden**, **one physical notice board**, and consult **one senior who usually knows**. Total elapsed time: **half a day**. Total tasks genuinely needing manual paperwork: **zero**.

### The Unified Campus ERP Solution
Unified Campus ERP replaces this chaos with a single, role-aware, enterprise-grade operating system. Built around the foundational philosophy of **"Fill Once, Use Everywhere"**, every student has a single verified identity record that automatically powers every form, gatepass, certificate request, exam hall ticket, and mess reservation without retyping a single line of personal data.

---

## 2. Technology Stack & System Architecture

The system is architected as a decoupled, high-performance web application engineered to operate seamlessly on high-end desktop workstations down to 2G cellular connections and low-cost Android devices.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER                                          │
│  React 19 SPA (Vite 8) · Vanilla CSS Design System · Lucide Icons · Multilingual (EN/HI/OR) │
│  Responsive Viewports: Desktop Admin, Tablet Counter, Mobile Gate Terminal, USSD Sim    │
└─────────────────────────────────────────▲──────────────────────────────────────────────┘
                                          │ RESTful JSON APIs (CORS Enabled)
┌─────────────────────────────────────────▼──────────────────────────────────────────────┐
│                                   API GATEWAY                                          │
│  PHP 8.2 Modular Router (`/backend/api/index.php`) · Token Auth · Strict Type Safety    │
│  Central Exception Handling · Response Formatter · Action Auditing Hook                │
└─────────────────────────────────────────▲──────────────────────────────────────────────┘
                                          │ Internal Controllers
┌─────────────────────────────────────────▼──────────────────────────────────────────────┐
│                               BUSINESS LOGIC LAYER                                     │
│  AuthController           ProfileController         RbacController                     │
│  SmartFormController      ServiceRequestController  NoticeController                   │
│  GrievanceController      ExamController            CampusLifeController               │
│  ChatbotController (Groq / xAI Grok Self-Learning Engine)                              │
└─────────────────────────────────────────▲──────────────────────────────────────────────┘
                                          │ PDO Prepared Statements
┌─────────────────────────────────────────▼──────────────────────────────────────────────┐
│                                   DATABASE LAYER                                       │
│  MySQL 8.0+ (InnoDB, UTF-8 MB4) · Relational Constraints · Referential Integrity       │
│  Physical File Storage: `/backend/uploads/notices/` (Authenticated Downloads)          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Frontend Stack
- **Framework**: React 19 (`react` 19.2.8, `react-dom` 19.2.8)
- **Build Tool & Dev Server**: Vite 8 (`vite` 8.3.0, `@vitejs/plugin-react` 6.1.1)
- **Routing**: React Router v7 (`react-router-dom` 7.18.4)
- **Iconography**: Lucide React (`lucide-react` 1.52.0)
- **Linter & Code Quality**: Oxlint (`oxlint` 1.81.0)
- **Styling Architecture**: Custom Vanilla CSS (`index.css` ~45 KB)
  - Modular CSS variables and design tokens
  - Zero heavy CSS runtime overhead (no Tailwind or styled-components footprint)
  - Client-side **2G Low-Bandwidth Mode** stylesheet toggle (drops heavy assets, reduces UI payload to 14.2 KB)
- **State Management**: React Context API (`AuthContext` for user session & personas, `AccessibilityContext` for language and bandwidth modes)

### 2.2 Backend Stack
- **Runtime**: PHP 8.2 (Windows XAMPP environment)
- **Architecture**: Modular RESTful API Gateway pattern with strict typing (`declare(strict_types=1);`)
- **API Dispatcher**: Single entry point `backend/api/index.php` with regex URI routing and query routing (`?r=...`)
- **Database Access**: Native PHP Data Objects (PDO) with prepared statements, error mode exceptions, and connection pooling
- **Security & RBAC**:
  - Token-based bearer authentication (`X-Auth-Token` / `Authorization`)
  - Role-Based and Tag-Based Access Control matrix
  - Parameter sanitation, strictly typed inputs, and audit trail logging
- **AI Integration**:
  - cURL-based REST integration with Groq API / xAI Grok (`openai/gpt-oss-20b` or `grok-beta`)
  - Automated local university handbook fallback engine
  - Self-learning knowledge indexing loop (`chatbot_learned_qa`)

### 2.3 Database & Storage
- **RDBMS**: MySQL 8+ (`collegelife_db`)
- **Engine**: InnoDB with foreign key referential integrity and cascading rules
- **Tables Across 7 Functional Phases**:
  1. `departments`, `programs`, `roles`, `permissions`, `role_permissions`, `tags`, `tag_permissions`, `users`, `user_tags`, `student_profiles`, `audit_logs`
  2. `smart_forms`, `smart_form_fields`, `smart_form_submissions`, `smart_form_submission_answers`
  3. `service_types`, `service_requests`, `service_request_logs`
  4. `notices`, `notice_acknowledgments`, `notice_reminders`, `notice_automation_settings`, `notice_automated_logs`
  5. `grievance_categories`, `grievance_subcategories`, `grievances`, `grievance_logs`, `grievance_ratings`
  6. `academic_sessions`, `courses`, `student_course_enrollments`, `exam_schedules`, `admit_cards`, `exam_results`
  7. `hostel_blocks`, `hostel_rooms`, `hostel_allocations`, `gatepass_requests`, `gatepass_punches`, `mess_menus`, `mess_rsvps`, `mess_feedback`, `faculty_subject_allocations`, `academic_timetables`, `academic_calendar_events`, `duty_leaves`, `subject_attendance`, `subject_attendance_records`
  8. `chatbot_sessions`, `chatbot_messages`, `chatbot_learned_qa`, `chatbot_settings`
- **File Storage**: Authenticated physical file directory (`backend/uploads/notices/`) with validation, size bounds, and extension whitelisting.

---

## 3. Evaluation Personas (1-Click Demo Ready)

The prototype includes 8 pre-seeded institutional personas enabling evaluators to inspect every angle of campus operations instantly from the top-right header menu or login screen:

| Persona Key | Full Name | Primary Role & Badges | Primary Responsibilities & Test Scope |
|---|---|---|---|
| `ashish` | Ashish Kumar Sahoo | Student (B.Tech CSE 6th Sem) | Applies for Bonafide, checks 75% attendance, skips dinner RSVP, generates outpass QR, takes exams. |
| `priya_cr` | Priya Sharma | Student & Class Representative (CR) | Has elevated rights: creates class smart forms, drafts class notices, tracks peer attendance. |
| `prof_sharma` | Prof. R. K. Sharma | Faculty Member (Assistant Professor) | Marks attendance roster, reviews duty leave requests, cancels/substitutes classes, enters marks. |
| `hod_cse` | Dr. S. K. Mohapatra | Head of Department (HOD - CSE) | Approves academic leaves, condones 75% attendance debarments, reviews department grievances. |
| `warden_singh` | Balwinder Singh | Hostel Warden (Block B Boys) | Approves night outpasses, views live hostel census gauge, reviews curfew defaulters, monitors mess feedback. |
| `admin_staff` | Manoranjan Jena | Administrative Officer (Counter 3) | Processes Bonafide & NOC applications, assigns physical counter slots, logs wet-seal collections in ledger. |
| `exam_admin` | Dr. P. C. Tripathy | Controller of Examinations | Publishes exam dates, manages seating, enforces 75% hall ticket debarment rule, publishes final SGPA results. |
| `admin` | Super Administrator | System & Network Administrator | Manages RBAC matrix, executes 1-click 2,000-student legacy CSV migration, inspects immutable audit logs. |

---

## 4. Comprehensive Feature Inventory (All 15 Implemented Modules)

### Module 1: Enterprise RBAC & Security Matrix (`/rbac`, `/audit`)
- **Dual-Layer Access Control**: Primary institutional roles (Student, Faculty, HOD, Warden, Admin Staff, Exam Admin, Super Admin) plus dynamic contextual tags (`class_representative`, `hostel_prefect`, `placement_coordinator`).
- **Granular Permissions**: 38+ fine-grained capabilities mapped dynamically per role and tag.
- **Tamper-Evident Audit Ledger**: Every login, profile edit, status change, grade modification, and gatepunch writes an immutable row with user ID, IP address, timestamp, and metadata payload.

### Module 2: Verified Identity & Digital ID Card (`/profile`, `/students`)
- **"Fill Once, Use Everywhere" Source of Truth**: Master record contains verified Roll Number, Registration Number, Branch, Semester, Section, Blood Group, Guardian Details, Hostel Block, and Room Number.
- **University Digital Credential**: Printable digital card with university crest, cryptographic holographic verification badge, and dynamic SVG barcode.
- **Directory & Quick Search**: Student roster with instant search, branch filtering, slide-over detail drawer, and CSV export.

### Module 3: Smart Forms Engine (`/forms`)
- **Google Forms Replacement**: Eliminates students retyping demographic information.
- **22 Auto-Locked ERP Identity Fields**: Form creators select which ERP fields are required; when opened by a student, fields are pre-populated and permanently read-only.
- **Dynamic Field Designer**: Supports Short Text, Multi-line Paragraph, Dropdown Select, Checkboxes, Radio Buttons, and File Uploads.
- **Audit-Ready Submissions & Export**: Real-time answer inspection drawer with 1-click structured CSV export merging student master data with form responses.
- **Permission Guardrail**: Faculty, HODs, Admin Staff, Wardens, and Class Representatives (`priya_cr`) can publish forms; general students answer them.

### Module 4: Hybrid Digital-to-Physical Service Center (`/services`)
- **Comprehensive Certificate Catalog**: Bonafide Certificate, Character Certificate, NOC for Internship, Duplicate ID Card, Fee Structure Certificate, Course Attestation.
- **Multi-Stage Approval Lifecycle**: `Submitted` -> `Under Review` -> `Action Required` -> `Ready for Physical Pickup` -> `Physically Delivered` / `Rejected`.
- **Physical Pick-Up Pass Slip**: Generates an official printable appointment dossier featuring the university seal, token barcode, scheduled collection window (e.g., *Counter 3, Central Administrative Block*), and physical verification checklist.
- **Central Dispatch Ledger**: Counter officer verifies original physical student ID card, stamps document with official university wet seal & wet ink registrar signature, and records collection in the central ledger.

### Module 5: Targeted Notices & Statutory Read Compliance Ledger (`/notices`)
- **Multi-Level Precision Scoping**: Publish notices scoped to College-wide, Department, Semester, Section, Hostel Block, or Dynamic Tag (e.g., Placement Eligible).
- **Zero WhatsApp Broadcast Chaos**: High-priority alert banner for emergency notifications (e.g., storm closures, curfew changes).
- **Statutory Read Compliance Audit Ledger**: Logs exact timestamp when each student reads and acknowledges circulars. Real-time compliance percentage meter (e.g., *94.2% CSE 6th Sem Acknowledged*) with 1-click UGC/AICTE compliance report export.
- **Automated Reminder Scheduler**: Automated background notification cycle that identifies unacknowledged students and triggers email reminders before deadlines.

### Module 6: Grievance Desk & Autonomous Root-Cause Pattern Radar (`/grievances`)
- **Structured Categorization**: Hostel & Maintenance, Academic Concerns, Mess & Food Quality, Administrative/Fee Queries, Infrastructure.
- **SLA Countdown Timers**: Strict time-to-resolution timers (<24h Normal, 12h Urgent) with color-coded status badges and automated escalation.
- **Executive Directorate / Principal Oversight Scope**: The Principal / Director is shielded from micro-managing routine on-track complaints. The Principal ONLY sees complaints when the SLA is breached/overdue, or when the complaint is directly related / escalated to the Principal & Directorate.
- **Secured Physical Completion OTP**: Completion OTP is rendered exclusively for the student who filed the complaint. Mess managers, technicians, and wardens receive `NULL` in APIs and a "Secured with Student" badge in the UI, preventing fraudulent ticket closures without physical inspection.
- **Autonomous Root-Cause Pattern Radar (Heatmap)**: Spatial clustering by Location + Asset + Time Window (e.g., *Block B 2nd Floor Riser Pipe Leaking — 5 Tickets in 48 Hours*), revealing institutional maintenance trends before they become emergencies.
- **Resolution Verification & Feedback**: Staff uploads proof of completion; students rate the resolution (1-5 stars) to close the ticket.

### Module 7: Examination Cell, Admit Cards & Results (`/exams`)
- **Examination Schedules & Course Mapping**: Mid-semester and end-semester timetables, room assignments, and invigilator rosters.
- **75% Statutory Attendance Guardrail**: Real-time integration with academic attendance records. If student attendance is <75%, the Admit Card is withheld with a high-visibility BPUT Regulation 14.2 debarment warning.
- **HOD Condonation Override**: HOD can formally condone attendance deficits (65%–74%) with documented medical or duty leave grounds.
- **Marks Entry & Grade Sheets**: Faculty enter internal/practical marks; controller publishes semester results with automatic SGPA and grade credit calculation.

### Module 8: Digital Gatepass & Security Guard Punch Terminal (`/gatepass`)
- **Day Pass & Night Outpass Lifecycle**: Auto-locks student room number and parent phone; auto-approves compliant day passes and routes night leaves to the warden.
- **Anti-Screenshot Time-Expiring QR Code**: Live rotating holographic countdown ticker and 4-digit numeric fallback code.
- **Security Guard Gate Terminal Mode (`/gatepass`)**: High-contrast, large-button interface designed for guards on standard mobile devices or desktop terminals.
- **1-Click Exit & Entry Punch**: Instantly updates student status to `OFF_CAMPUS` or `IN_HOSTEL`.
- **Curfew Defaulter Warning**: Automatically flags late entries (e.g., *CURFEW BREACH — 45 MINS LATE*) and triggers alerts to the Chief Warden.
- **Live Warden Campus Census**: Real-time gauge tracking: Total in Hostel, Out on Day Pass, On Approved Leave, and Overdue Defaulters.

### Module 9: Smart Mess Operations & Food Waste Prevention (`/mess`, `/mess-manager`)
- **7-Day Revolving Nutritional Menu Board**: Breakfast, Lunch, High Tea, Dinner with Veg/Non-Veg/Special tags and live active meal indicator.
- **"Skip Meal / RSVP" Waste Prevention Engine**: Students toggle "Skipping Tonight's Dinner" before cutoff time (5:00 PM) to earn **Mess Rebate Credits** towards hostel dues.
- **Head Chef Headcount Kiosk (`/mess-manager`)**:
  - Live projection calculator: Total Boarders - Opted Out - On Leave = **Net Plates to Cook (±15 buffer)**.
  - Institutional savings widget: Displays cumulative kg of food saved and rupees saved in raw procurement.
- **Strict Role-Scoped Data Access**:
  - **Mess Manager Only**: Views total diners present, plates to cook, and food waste kg/₹ saved.
  - **Students**: View personal dining status (Attending/Skipped), personal mess rebate credits (125 Credits), active meal hours, and cutoff reminders. Kitchen contractor headcount and wastage data are hidden from students.
- **3-Second Meal Rating**: Instant post-meal ratings for Taste, Hygiene, and Freshness, alerting the mess committee if ratings drop below threshold.

### Module 10: Academic Timetable & 75% Attendance Compliance (`/academics`)
- **Proactive Attendance Compliance Meter**: Visual gauge showing current percentage, classes attended vs. conducted, and exact buffer or deficit classes needed to remain compliant (strictly no encouragement of absenteeism).
- **Daily Attendance Roster Marking**: Faculty select course, semester, and section to mark attendance with 1-click "Mark All Present" and individual absence toggles.
- **1-Click Class Cancellation / Substitution Broadcast**: Faculty broadcast immediate room change or cancellation alerts, instantly notifying affected students.
- **Duty Leave Application & Tracking**: Students apply for formal duty leaves (sports, hackathons, technical symposiums) with document proof, which automatically credits back attendance once approved by HOD.

### Module 11: Zero-Hardware Non-Smartphone USSD Engine (`/feature-phone`)
- **100% Software-Based Simulation**: Interactive mobile phone simulator demonstrating USSD codes (`*141#` / `*789#`) with zero dependency on specialized hardware or paid telecom gateways.
- **Full Operational Reach**: Feature phone users can:
  - Check current attendance percentage
  - View gatepass token & status
  - View today's mess menu
  - Submit Skip Meal RSVP
  - Check latest urgent campus circulars

### Module 12: Trilingual Regional Support (English, Hindi, Odia)
- **Header Language Switcher**: Instant switching between English (`en`), Hindi (`hi`), and native Odia (`or` - ଓଡ଼ିଆ).
- **Inclusive Accessibility**: Designed specifically for regional students, hostel security guards, and mess staff across Odisha technical colleges who are less comfortable with English.

### Module 13: 2G Low-Bandwidth Mode
- **Patchy Wi-Fi & Data-Saver Toggle**: Accessible in the header bar.
- **Client-Side Asset Optimization**: Strips background blur, heavy cards, and decorative styles, throttling network transfers to simulated 64 kbps.
- **Payload Reduction**: Achieves **99.2% payload compression (14.2 KB)** for lightning-fast loading on congested hostel networks.

### Module 14: 1-Click Legacy CSV Migration Wizard (`/adoption-migration`)
- **Campus Rollout Solution**: Solves Deliverable 5 of Problem Statement 07.
- **Automated 2,000-Student Onboarding**: Drag-and-drop CSV parser with automatic column reconciliation, preview table, validation error detection, and transaction-safe database seeding.
- **4-Week Zero-Downtime Adoption Playbook**: Step-by-step phased roadmap detailing legacy data migration, staff training, parallel running period, and full paperless cutoff.

### Module 15: CampusDesk AI Assistant & Self-Learning Support Desk (`/support-desk`)
- **Floating 24/7 CampusDesk Assistant**: Pre-trained on BPUT academic regulations, hostel curfew rules, and certificate procedures, offering quick-pill questions and deep links.
- **Autonomous Learning Feedback Loop**:
  1. Student asks an unindexed question.
  2. Bot attempts answer; if student requests human help (or repeats twice), query is escalated to staff queue.
  3. Support staff answers via the live support console (`/support-desk`).
  4. The system automatically indexes the approved question and answer into `chatbot_learned_qa`.
  5. The bot autonomously answers all subsequent students with identical questions.
- **Configurable LLM Provider**: Supports Groq / xAI Grok API (`openai/gpt-oss-20b` or `grok-beta`) with offline handbook fallback.

---

## 5. End-to-End Operational Workflows

```
WORKFLOW OVERVIEW
══════════════════════════════════════════════════════════════════════════════════════
1. Certificate Desk:    [Student Applies] ──> [Admin Review] ──> [Pick-Up Pass] ──> [Physical Seal & Delivery]
2. Smart Forms:         [CR/Staff Builds]  ──> [Locked Auto-Fill] ──> [Student Answers] ──> [Merged CSV Export]
3. Gatepass & Curfew:   [Student Request] ──> [Auto/Warden Consent] ──> [QR Code] ──> [Guard Punch] ──> [Census Ledger]
4. Mess Food Waste:     [7-Day Menu] ──> [Student Skips Dinner] ──> [Chef Headcount] ──> [Savings Calculated]
5. Grievances:          [Complaint Logged] ──> [SLA Timer & Routing] ──> [Tech Assigned] ──> [Pattern Radar Clustering]
6. Academic Attendance: [Faculty Marks Class] ──> [75% Meter Updated] ──> [Admit Card Checked] ──> [Debarment / Condonation]
7. Feature Phone:       [Student Dials *141#] ──> [USSD Menu] ──> [Token Generated] ──> [Guard Verifies]
8. Self-Learning AI:    [Query Asked] ──> [Bot Escalates] ──> [Staff Answers] ──> [System Indexes Q&A for Future]
══════════════════════════════════════════════════════════════════════════════════════
```

### Workflow 1: Certificate Request to Physical Wet-Seal Pickup
1. **Student Initiation**: Student logs in as `ashish`, navigates to `/services`, selects *Bonafide Certificate*, and enters the purpose (*Passport Application*). Verified name, roll number, department, semester, and guardian details are automatically locked from the ERP profile.
2. **Administrative Queue**: Admin staff logs in as `admin_staff`, sees the pending request in the service queue, verifies fee dues, and clicks **"Approve & Schedule Physical Pickup"**.
3. **Appointment Scheduling**: Staff assigns collection window: *Counter 3, Central Administrative Block* on *12 Oct 2026, 11:30 AM*.
4. **Physical Pickup Pass Generation**: Student receives an alert and prints the **Official Physical Pickup Pass & Token Dossier**, featuring the university crest, appointment barcode, and verification checklist.
5. **Counter Fulfillment**: Student presents the pass and physical ID card at Counter 3. The officer stamps the printed certificate with the university embossed wet seal and registrar's signature, clicks **"Mark Physically Delivered"**, and the transaction is permanently archived in the Central Dispatch Ledger.

### Workflow 2: Smart Form Creation, Auto-Locked Answering & Audit Export
1. **Form Creation**: Class Representative `priya_cr` or Faculty `prof_sharma` opens `/forms` and clicks **"Create Smart Form"**. They enter title (*CSE 6th Sem Industrial Visit Consent*), check 8 pre-configured ERP identity fields (Roll No, Reg No, Name, Phone, Parent Phone, Hostel Room), and add 2 custom questions (*Dietary Preference*, *Emergency Contact Relation*).
2. **Student Completion**: Student `ashish` opens the form. All 8 ERP identity fields are auto-populated and permanently locked with padlock indicators. Ashish answers only the 2 custom questions and submits in under 30 seconds.
3. **Data Reconciliation & CSV Export**: Form author opens submissions, reviews live charts, and clicks **"Export Audit CSV"**. The backend produces a consolidated CSV merging official student master data with the custom answers, eliminating all transcription errors.

### Workflow 3: Hostel Gatepass & Security Guard Punch Lifecycle
1. **Student Outpass Request**: Ashish requests a *Day Outpass* for *Market Visit (17:00 to 20:00)*. System validates time against curfew rules (< 20:30 PM) and issues a live, time-expiring **Gatepass QR Code** with a 4-digit token code (`4821`).
2. **Security Guard Checkpoint**: Guard operates `/gatepass` on a mobile browser at the gate terminal. Guard scans the QR code or inputs `4821`, sees Ashish's verified photo, room number, and exit window, and clicks **"Punch Exit"**.
3. **Campus Census Update**: Ashish's status changes to `OFF_CAMPUS`. Warden `warden_singh` views the live hostel census meter (*Total in Hostel: 841 | Out on Pass: 35 | Defaulters: 0*).
4. **Return & Curfew Verification**: Ashish returns at 20:15. Guard clicks **"Punch Entry"**. If Ashish had returned at 21:05 (past curfew), the screen flashes red **"CURFEW BREACH — 35 MINS OVERDUE"**, and an incident log is flagged to the Warden.

### Workflow 4: Smart Mess Food Waste Prevention
1. **Revolving Menu Inspection**: Student checks `/mess` to see tonight's dinner (*Paneer Butter Masala, Dal Makhani, Phulka, Gulab Jamun*).
2. **Student Skip RSVP**: Ashish is eating out with friends; at 15:45 (before the 16:30 cutoff), he toggles **"Skipping Tonight's Dinner"**. System logs the RSVP and credits 25 Mess Rebate points to his account.
3. **Mess Contractor Analytics**: The head chef opens `/mess-manager`. Out of 950 registered hostel boarders, 184 students have toggled off and 42 are on approved leave. Net plates to prepare: **724 plates**.
4. **Procurement Impact**: The system displays: *52 kg raw materials saved (~₹7,800 procurement savings tonight)*, eliminating massive weekend food dumpsters.

### Workflow 5: Grievance Escalation & Root-Cause Pattern Radar
1. **Ticket Logging**: Student reports *Leaking Pipe in 2nd Floor Washroom, Hostel Block B*. SLA timer starts (24-hour resolution window).
2. **Auto-Routing & Assignment**: System categorizes issue as *Plumbing - Hostel*, routes to Estate Maintenance, and assigns duty technician *Santosh Naik*.
3. **Pattern Radar Aggregation**: If 4 other students in Block B log similar leaks within 48 hours, the **Root-Cause Pattern Radar** clusters these tickets into a critical infrastructure warning: *Possible Main Riser Pressure Failure — Block B*.
4. **Resolution Verification**: Technician completes repairs, submits completion notes; student receives a prompt to rate the resolution (1-5 stars) to close the ticket.

### Workflow 6: Attendance Tracking & Exam Admit Card Debarment
1. **Roster Marking**: Prof. Sharma opens `/academics`, selects *Design & Analysis of Algorithms (CSE 6th Sem)*, and marks today's attendance roster with 1-click presets.
2. **Compliance Meter Calculation**: Ashish's attendance updates dynamically: 46 attended out of 64 classes (71.8% — Below 75% Statutory Rule).
3. **Admit Card Guardrail**: Ashish opens `/exams` to download his End-Semester Admit Card. The system withholds the hall ticket, displaying **"Debarred under BPUT Regulation 14.2 (Attendance: 71.8%)"**.
4. **HOD Review & Condonation**: Ashish submits approved duty leave slips from the Hackathon. HOD `hod_cse` reviews the slips, enters formal condonation, and the Admit Card is instantly unlocked with an official QR verification token.

---

## 6. Verification & Demonstration Guide

To evaluate the prototype locally, follow this operational checklist:

1. **Verify Backend API**:
   - Ensure Apache and MySQL are running in XAMPP.
   - Endpoint: `http://localhost/collegelife/backend/api/index.php?r=health`
   - Returns: `{"status": "online", "name": "Unified Campus ERP API", "version": "1.0.0"}`
2. **Verify Frontend Application**:
   - Run Vite dev server: `npm run dev` in `collegelife/frontend`
   - Access: `http://localhost:5173`
3. **Evaluate Primary Modules**:
   - Log in as `ashish` to review Student Hub, Digital ID Card, Mess Menu, and 75% Attendance Meter.
   - Switch to `warden_singh` via top-right persona switcher to inspect Gatepass Punch Terminal and Live Campus Census.
   - Switch to `admin_staff` to review Certificate Service Desk and Physical Pickup Passes.
   - Switch to `prof_sharma` to review Attendance Roster Marking and Class Cancellation Broadcast.
   - Click the header **"2G Mode"** button to observe lightweight client-side rendering.
   - Click the header language switcher (**EN / HI / OR**) to verify regional language accessibility.
   - Open `/feature-phone` to interact with the USSD non-smartphone keypad simulator.
   - Open `/adoption-migration` to inspect the 2,000-student legacy CSV migration wizard.
   - Click the bottom-right floating icon to chat with the **CampusDesk AI Assistant**.

---

## 7. Project File Manifest

| File / Directory Path | Purpose & Scope |
|---|---|
| `backend/api/index.php` | Main RESTful API gateway and router dispatching 60+ endpoints |
| `backend/config/database.php` | MySQL PDO connection manager with error handling |
| `backend/controllers/AuthController.php` | Authentication, persona switching, and session management |
| `backend/controllers/ProfileController.php` | Student and staff master profiles ("Fill Once, Use Everywhere") |
| `backend/controllers/RbacController.php` | Role and dynamic tag permission management |
| `backend/controllers/AcademicMasterController.php` | Departments, programs, academic sessions, and audit logging |
| `backend/controllers/SmartFormController.php` | Form builder, pre-locked field answering, and CSV export |
| `backend/controllers/ServiceRequestController.php` | Certificate requests, physical pickup passes, and dispatch ledger |
| `backend/controllers/NoticeController.php` | Scoped circulars, statutory read tracking, and automated reminders |
| `backend/controllers/GrievanceController.php` | Complaint ticketing, SLA timers, and pattern radar engine |
| `backend/controllers/ExamController.php` | Exam sessions, admit cards, 75% debarment, marks, and results |
| `backend/controllers/CampusLifeController.php` | Gatepass punches, mess menus, meal RSVPs, and attendance rosters |
| `backend/controllers/ChatbotController.php` | Groq / xAI Grok AI assistant, support desk, and self-learning Q&A |
| `backend/database/schema.sql` | Base relational database schema (RBAC, users, profiles) |
| `backend/database/seed.sql` | Default seed data for evaluation personas and academic structures |
| `frontend/src/App.jsx` | Main application shell, routing table, and accessibility wrappers |
| `frontend/src/index.css` | Comprehensive institutional design system (~45 KB vanilla CSS) |
| `frontend/src/pages/DashboardPage.jsx` | Role-adaptive dashboard for all 8 evaluation personas |
| `frontend/src/pages/ProfilePage.jsx` | Tabbed master profile and printable holographic Digital ID Card |
| `frontend/src/pages/FormsPage.jsx` | Smart Forms Engine with 22 ERP identity locks and builder |
| `frontend/src/pages/ServicesPage.jsx` | Hybrid digital-to-physical certificate service desk |
| `frontend/src/pages/NoticesPage.jsx` | Scoped circulars, statutory compliance ledger, and reminders |
| `frontend/src/pages/GrievancesPage.jsx` | Complaint desk, SLA countdowns, and Root-Cause Pattern Radar |
| `frontend/src/pages/ExamsPage.jsx` | Examination schedules, admit cards, 75% debarment, and grades |
| `frontend/src/pages/GatepassPage.jsx` | Gatepass requests, Live Security Guard Punch Terminal, and Census |
| `frontend/src/pages/MessPage.jsx` | 7-Day revolving menu, Skip Meal RSVP, and rebate credits |
| `frontend/src/pages/MessManagerPage.jsx` | Mess contractor kiosk, headcount calculation, and food savings |
| `frontend/src/pages/AcademicsPage.jsx` | 75% attendance meter, daily roster marking, and class broadcast |
| `frontend/src/pages/FeaturePhonePage.jsx` | Zero-hardware interactive USSD feature phone telecom simulator |
| `frontend/src/pages/AdoptionMigrationPage.jsx` | 1-Click legacy CSV migration wizard and 4-week rollout playbook |
| `frontend/src/pages/SupportDeskPage.jsx` | Support staff console and self-learning Q&A knowledge manager |
| `frontend/src/components/CampusDeskBot.jsx` | Floating 24/7 campus handbook AI assistant |
| `frontend/src/context/AccessibilityContext.jsx`| Trilingual translation engine (EN/HI/OR) and 2G mode manager |
| `frontend/src/context/AuthContext.jsx` | Session authentication and 1-click persona switching state |
