# Unified Campus ERP — Smart Campus Operating System

<div align="center">

![Campus OS Banner](https://img.shields.io/badge/Campus%20OS-BPUT%20Hackathon%202026-1B4332?style=for-the-badge&logo=mortarboard&logoColor=white)
![Build Status](https://img.shields.io/badge/Build-Passing-2E7D32?style=for-the-badge)
![React Version](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite Version](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PHP Version](https://img.shields.io/badge/PHP-8.2%20REST%20Gateway-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0%20InnoDB-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Zero Tailwind](https://img.shields.io/badge/Styling-Custom%20Vanilla%20CSS-FAF9F6?style=for-the-badge&color=9A3412)
![Trilingual](https://img.shields.io/badge/Languages-EN%20%7C%20HI%20%7C%20OR%20(ଓଡ଼ିଆ)-blue?style=for-the-badge)

<br/>

### *"Attendance, Mess, Hostel, Repeat: Campus Life, Debugged"*
**Problem Statement 07 (Fretbox) · BPUT Hackathon 2026**

<p align="center">
  <b>Golden Rule:</b> <i>"Fill Once, Use Everywhere"</i> — Zero redundant paperwork, zero WhatsApp broadcast chaos.
</p>

</div>

---

## 📌 Table of Contents
1. [Executive Summary & The "Tuesday Dilemma"](#-executive-summary--the-tuesday-dilemma)
2. [Core Architecture & Technology Stack](#-core-architecture--technology-stack)
3. [Comprehensive Feature Matrix (15 Production Modules)](#-comprehensive-feature-matrix-15-production-modules)
4. [Instant 1-Click Evaluation Personas](#-instant-1-click-evaluation-personas)
5. [End-to-End Operational Workflows](#-end-to-end-operational-workflows)
6. [Resilient Computing & Accessibility (2G + USSD)](#-resilient-computing--accessibility-2g--ussd)
7. [Repository Structure](#-repository-structure)
8. [Installation & Local Setup Guide](#-installation--local-setup-guide)
9. [Institutional Design System & Palette](#-institutional-design-system--palette)
10. [Statutory Compliance & Standards](#-statutory-compliance--standards)

---

## 🏛️ Executive Summary & The "Tuesday Dilemma"

Technical colleges and universities frequently operate on a fragmented patchwork of manual registers, overcrowded admin counters, chaotic WhatsApp groups, printed paper applications, and disconnected spreadsheets. Students lose hours standing in physical lines, while administrators lack real-time visibility into pending tasks, curfew status, mess procurement, and statutory compliance.

### The Real-World Friction ("The Tuesday Dilemma")
A student who needs a **Bonafide Certificate**, wants to report a **leaking hostel tap**, needs to check if tomorrow's **9:00 AM lecture is cancelled**, and wants to verify the **mess dinner menu** previously had to visit:
1. **Administrative Block Counter Window 3** *(Queue starts 11:00 AM)*
2. **Hostel Warden’s Diary** *(Wait until evening inspection)*
3. **Department Notice Board** *(Search through paper circulars)*
4. **Consult a Senior** *(“Who usually knows what’s cooking”)*

**Total Elapsed Time:** Half a day.  
**Total tasks genuinely requiring manual paper:** **Zero.**

### The Campus OS Solution
Unified Campus ERP unifies these disjointed touchpoints into a cohesive, role-aware, enterprise-grade operating system. Built on the foundational principle of **"Fill Once, Use Everywhere"**, every student has a single verified identity record that automatically powers smart forms, outpasses, physical certificates, exam hall tickets, and mess rebates without ever retyping demographic data.

---

## ⚙️ Core Architecture & Technology Stack

The application is engineered as a decoupled, high-performance web platform designed to function on high-end desktop workstations down to 2G cellular connections and low-cost Android phones.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER                                          │
│  React 19 SPA (Vite 8) · Vanilla CSS Tokens · Lucide Icons · Multilingual (EN/HI/OR)    │
│  Responsive Viewports: Desktop Admin, Tablet Counter, Mobile Gate Terminal, USSD Sim    │
└─────────────────────────────────────────▲──────────────────────────────────────────────┘
                                          │ RESTful JSON APIs (CORS Enabled)
┌─────────────────────────────────────────▼──────────────────────────────────────────────┐
│                                   API GATEWAY                                          │
│  PHP 8.2 Modular Router (`/backend/api/index.php`) · Token Bearer Auth · Strict Types   │
│  Central Exception Handling · Structured JSON Formatter · Real-time Audit Logger       │
└─────────────────────────────────────────▲──────────────────────────────────────────────┘
                                          │ Internal Modular Controllers
┌─────────────────────────────────────────▼──────────────────────────────────────────────┐
│                               BUSINESS LOGIC LAYER                                     │
│  AuthController           ProfileController         RbacController                     │
│  SmartFormController      ServiceRequestController  NoticeController                   │
│  GrievanceController      ExamController            CampusLifeController               │
│  ChatbotController (Groq / Institutional LLM Engine with Self-Learning Loop)           │
└─────────────────────────────────────────▲──────────────────────────────────────────────┘
                                          │ PDO Prepared Statements
┌─────────────────────────────────────────▼──────────────────────────────────────────────┐
│                                   DATABASE LAYER                                       │
│  MySQL 8.0+ (InnoDB, UTF-8 MB4) · Foreign Key Constraints · Referential Integrity      │
│  Physical File Storage: `/backend/uploads/notices/` (Authenticated Downloads)          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Frontend Specifications
- **Framework**: React 19 (`react` 19.2.8, `react-dom` 19.2.8)
- **Tooling & Bundler**: Vite 8 (`vite` 8.3.0, `@vitejs/plugin-react` 6.1.1)
- **Routing**: React Router v7 (`react-router-dom` 7.18.4)
- **Icons**: Lucide React (`lucide-react` 1.52.0)
- **Linter & Code Quality**: Oxlint (`oxlint` 1.81.0)
- **Design System**: Zero-Tailwind Pure Vanilla CSS (`index.css` ~47 KB)
  - Predefined CSS tokens, semantic themes, HSL colors
  - Embedded **2G Low-Bandwidth Mode** (drops heavy assets, reduces UI payload to **14.2 KB**)
- **State Management**: React Context (`AuthContext`, `AccessibilityContext`)

### Backend Specifications
- **Runtime**: PHP 8.2 (Modular RESTful API pattern with `declare(strict_types=1);`)
- **Routing**: Single entry point `backend/api/index.php` with regex dispatching
- **Database Layer**: Native PHP Data Objects (PDO) with strict prepared statements
- **Security & Authorization**:
  - Bearer token authentication (`X-Auth-Token` / `Authorization`)
  - Two-dimensional RBAC: Primary Roles + Dynamic Contextual Tags
  - Immutable audit logging on all administrative actions
- **AI Integration**:
  - Direct cURL REST integration for automated conversational inference
  - Local handbook fallback engine for zero-network resilience
  - Self-learning knowledge loop (`chatbot_learned_qa`)

---

## 🚀 Comprehensive Feature Matrix (15 Production Modules)

| # | Module Name | Route | Key Institutional Features & Problem Solved |
|---|---|---|---|
| **01** | **Enterprise RBAC & Security Matrix** | `/rbac`, `/audit` | Dual-layer access control: 8 core roles + dynamic tags (`class_representative`, `hostel_prefect`). 38+ fine-grained permissions. Tamper-evident audit ledger capturing actor, role, IP address, and payload diff. |
| **02** | **Verified Identity & Digital ID Pass** | `/profile`, `/students` | *"Fill Once, Use Everywhere"* master record (Roll No, Reg No, Cohort, Blood Group, Hostel Room). Official printable Digital Campus Pass with holographic seal, institutional watermark, and dynamic barcode. |
| **03** | **Smart Forms Engine** | `/forms` | Replaces unverified Google Forms. 22 auto-locked ERP identity fields pre-filled and permanently read-only. Dynamic form builder (text, dropdown, checkboxes, file uploads). 1-click audit CSV export merging student master data. |
| **04** | **Digital Certificates & Service Center** | `/services` | Bonafide, Character, Internship NOC, Attestations. Multi-stage approval lifecycle. Scheduled physical counter pickup pass (e.g., *Counter 3, 11:30 AM*). Official wet seal & registrar ink delivery verification ledger. |
| **05** | **Statutory Notice Board & Read Compliance** | `/notices` | Replaces WhatsApp chaos. Targeted scoping by Branch, Semester, Hostel, or Tag. Immutable circular reference numbers (`CUT/REG/2026/04`). Mandatory digital read-acknowledgments with live compliance percentage (e.g., *94.2% Acknowledged*). |
| **06** | **Grievance Desk & Root-Cause Pattern Radar** | `/grievances` | Strict 24h/72h SLA timers with auto-routing to concerned technicians. Executive Directorate oversight scope (Principal only sees SLA breaches or direct escalations). **Secured Student Completion OTP** prevents fake closures. Autonomous spatial pattern radar heatmap. |
| **07** | **Examination Cell, Hall Tickets & Grade Sheets** | `/exams` | Active Examination Term switcher. Automated **75% Attendance Debarment Gatekeeper** (BPUT Reg 14.2) with HOD condonation override. 1-click Bulk Release Cards. Printable admit card with security QR and marks moderation ledgers. |
| **08** | **Digital Gatepass & Guard Punch Terminal** | `/gatepass` | Day Pass & Night Outpass workflow with parent phone auto-locking. Anti-screenshot time-expiring QR code + 4-digit numeric fallback. Security guard gate terminal mode with 1-click Exit/Entry punch, curfew defaulter flags, and live warden campus census gauge. |
| **09** | **Smart Mess Operations & Food Waste Prevention** | `/mess`, `/mess-manager` | 7-day nutritional menu board. "Skip Meal RSVP" waste prevention engine with cutoff reminders and **Mess Rebate Credits**. Head Chef Kiosk projecting exact net plates to cook (Total - Opted Out - On Leave) with live ₹/kg food waste savings. |
| **10** | **Academic Timetable & 75% Attendance Compliance** | `/academics` | Proactive attendance gauge showing safe skip buffer or shortage deficit. 1-click faculty roll-call roster. 1-click room change / class cancellation broadcast. Official duty leave submission with automatic attendance credit upon approval. |
| **11** | **Zero-Hardware Feature Phone USSD Engine** | `/feature-phone` | 100% software-based interactive feature phone simulation (`*141#` / `*789#`). Zero hardware/telecom gateway costs. Students can check attendance, fetch outpass tokens, view mess menu, RSVP, and read circulars on basic 2G phones. |
| **12** | **Trilingual Regional Language Support** | Header Toggle | Instant one-click toggle across **English (`en`)**, **Hindi (`hi`)**, and native **Odia (`or` - ଓଡ଼ିଆ)**. Designed for regional students, hostel security guards, and mess staff across Odisha technical institutions. |
| **13** | **2G Low-Bandwidth Mode** | Header Toggle | Strips CSS animations, box-shadow elevations, and decorative images. Drops UI network payload by **99.2% (14.2 KB total)** for buttery smooth performance inside concrete hostel corridors and throttled 64 kbps connections. |
| **14** | **1-Click Legacy CSV Migration Wizard** | `/adoption-migration` | Solves university onboarding. Drag-and-drop CSV parser with automatic column mapping, validation preview, and 1-click database seeding for 2,000+ students. Includes a 4-week phased zero-downtime adoption playbook. |
| **15** | **CampusDesk AI Assistant & Self-Learning Hub** | `/support-desk` | 24/7 conversational assistant pre-trained on academic regulations and campus procedures. Human handover escalation queue. Self-learning loop: support staff answers escalate queries and system permanently indexes approved Q&As for future students. |

---

## 👥 Instant 1-Click Evaluation Personas

The application includes 8 pre-seeded institutional personas. Evaluators can switch personas instantly via the top-right header menu or login screen:

| Persona Key | Full Name | Institutional Role & Badges | Primary Demo & Test Scope |
|---|---|---|---|
| `ashish` | **Ashish Kumar Sahoo** | Student (MCA / B.Tech 6th Sem) | Applies for Bonafide, checks 75% attendance, skips dinner RSVP, generates outpass QR, takes exams. |
| `priya_cr` | **Priya Sharma** | Student & Class Representative (CR) | Elevated rights: creates class smart forms, drafts class notices, tracks peer attendance. |
| `prof_sharma` | **Prof. R. K. Sharma** | Faculty Member (Assistant Professor) | Marks roll-call roster, reviews duty leave requests, broadcasts room change/cancellation alerts, enters marks. |
| `hod_cse` | **Dr. S. K. Mohapatra** | Head of Department (HOD - CSE) | Approves academic leaves, condones 75% attendance debarments, reviews departmental grievances. |
| `warden_singh` | **Balwinder Singh** | Hostel Warden (Block B Boys) | Approves night outpasses, views live hostel census gauge, reviews curfew defaulters, monitors mess feedback. |
| `admin_staff` | **Manoranjan Jena** | Administrative Officer (Counter 3) | Processes certificate applications, assigns physical counter slots, logs wet-seal collections in ledger. |
| `exam_admin` | **Dr. P. C. Tripathy** | Controller of Examinations | Publishes exam timetables, manages seating, enforces 75% hall ticket debarment rule, publishes final SGPA results. |
| `admin` | **Super Administrator** | System & Network Administrator | Manages RBAC matrix, executes 1-click 2,000-student legacy CSV migration, inspects immutable audit logs. |

---

## 🔄 End-to-End Operational Workflows

```
WORKFLOW OVERVIEW
═══════════════════════════════════════════════════════════════════════════════════════════════════
1. Certificate Desk:    [Student Applies] ──> [Admin Review] ──> [Pick-Up Pass] ──> [Wet Seal Delivery]
2. Smart Forms:         [CR/Staff Builds] ──> [Auto-Fill Lock] ──> [Student Answers] ──> [Merged CSV Export]
3. Gatepass & Curfew:   [Student Request] ──> [Auto/Warden Consent] ──> [QR Code] ──> [Guard Punch] ──> [Live Census]
4. Mess Food Waste:     [7-Day Menu] ──> [Student Skips Dinner] ──> [Chef Headcount] ──> [Savings Calculated]
5. Grievances:          [Ticket Logged] ──> [SLA Timer & Routing] ──> [Technician Dispatched] ──> [Student OTP Closure]
6. Academic Attendance: [Faculty Marks Class] ──> [75% Meter Updated] ──> [Admit Card Gatekeeper] ──> [Exam Entry]
7. Feature Phone:       [Student Dials *141#] ──> [USSD Menu] ──> [Token Generated] ──> [Guard Verifies]
8. Self-Learning AI:    [Query Asked] ──> [Bot Escalates] ──> [Staff Answers] ──> [System Indexes Q&A for Future]
═══════════════════════════════════════════════════════════════════════════════════════════════════
```

### Detailed Highlights
1. **Physical Certificate Pick-Up Workflow**: Student applies in 1-click using auto-locked ERP identity. Admin approves and assigns Counter Window 3 with a scheduled time slot. Student generates an official **Collection Pass** with university crest and barcode. Counter staff inspects physical ID, wet-seals the paper certificate, and archives the transaction in the Central Dispatch Ledger.
2. **Grievance Resolution with Completion OTP**: A technician dispatched for a plumbing or electrical issue cannot close the ticket from their own console. The ticket requires entering the **4-digit secret OTP visible only to the student** who raised the complaint, completely eliminating fraudulent closures.
3. **Mess Food Waste Prevention**: Students opt out of dinner before 5:00 PM to earn ₹25 Rebate Credits. The Head Chef Kiosk calculates: `Total Boarders - Opted Out - On Approved Leave = Net Plates to Cook (±15 buffer)`. Reduces mess procurement waste by up to 22%.

---

## ⚡ Resilient Computing & Accessibility (2G + USSD)

Campus OS is explicitly architected to overcome the infrastructural realities of tier-2/tier-3 Indian colleges:

### 1. 2G Low-Bandwidth Mode (99.2% Data Saved • 14.2 KB Payload)
- **Problem**: Thick concrete hostel walls and congested student cell towers degrade network speed to 64 kbps (2G / post-FUP throttle).
- **Engineering**:
  - Drops all keyframe animations, transitions, filter blurs, and elevation box-shadows via `.low-bandwidth-mode`.
  - Suppresses raster images and decorative SVGs (`img, svg.decorative { display: none !important; }`).
  - Reduces page transfer overhead from ~1.8 MB down to **14.2 KB**, enabling instant sub-second render speeds.

### 2. Feature Phone USSD Simulation (`*141#` / `*789#`)
- Interactive software-based simulation demonstrating full feature parity on basic Nokia/JioBharat keypad phones with zero internet and zero hardware/telecom cost:
  - `1. Attendance Status` → Returns current % and debarment clearance.
  - `2. Hostel Gatepass` → Issues numeric 4-digit token code for guard checkout.
  - `3. Mess Menu & RSVP` → Views dinner menu and submits meal opt-out.
  - `4. Urgent Circulars` → Displays statutory university emergency alerts.

---

## 📁 Repository Structure

```
collegelife/
├── backend/
│   ├── api/
│   │   └── index.php                 # Central RESTful API Gateway & Dispatcher
│   ├── config/
│   │   └── Database.php              # PDO Connection Manager & Error Handler
│   ├── controllers/
│   │   ├── AuthController.php        # Authentication, Personas, Session Tokens
│   │   ├── ProfileController.php     # Verified ERP Identity & Digital Pass
│   │   ├── RbacController.php        # Role & Tag-Based Access Control Matrix
│   │   ├── SmartFormController.php   # Auto-Locked Smart Forms & CSV Export
│   │   ├── ServiceRequestController.php # Certificates, Physical Passes & Counter Ledger
│   │   ├── NoticeController.php      # Scoped Notices, Read Receipts & SLA Reminders
│   │   ├── GrievanceController.php   # SLA Timers, Auto-Routing, OTP Resolution & Radar
│   │   ├── ExamController.php        # 75% Attendance Guardrail, Hall Tickets, Results
│   │   ├── CampusLifeController.php  # Gatepass QR, Curfew Census, Mess RSVP & Headcount
│   │   └── ChatbotController.php     # CampusDesk AI, LLM Routing & Self-Learning Loop
│   ├── database/
│   │   ├── schema.sql                # Complete Relational Schema (InnoDB)
│   │   ├── seed_personas.sql         # 8 Institutional Personas & Master Records
│   │   └── migrate_chatbot.php       # AI Knowledge Loop Database Migration
│   └── helpers/
│       ├── AuthHelper.php            # Bearer Token & Permission Validator
│       └── Response.php              # Structured JSON Response Formatter
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx            # Trilingual Switcher, 2G Mode, Persona Switcher
│   │   │   ├── Sidebar.jsx           # Institutional Module Navigation
│   │   │   └── CampusDeskBot.jsx     # Floating 24/7 AI Assistant Widget
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # User Session & Persona Switcher State
│   │   │   └── AccessibilityContext.jsx # Trilingual (EN/HI/OR) & 2G Bandwidth Manager
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx     # Institutional Overview & Metrics
│   │   │   ├── ProfilePage.jsx       # Verified Identity & Prestige ID Pass
│   │   │   ├── StudentsPage.jsx      # Student Directory & Filter Roster
│   │   │   ├── SmartFormsPage.jsx    # Form Builder & Locked Answering
│   │   │   ├── ServicesPage.jsx      # Certificate Requests & Collection Pass
│   │   │   ├── NoticesPage.jsx       # Statutory Circulars & Compliance Audit
│   │   │   ├── GrievancesPage.jsx    # SLA Ticketing, Student OTP & Pattern Radar
│   │   │   ├── ExamsPage.jsx         # Hall Tickets, 75% Gatekeeper & Results
│   │   │   ├── GatepassPage.jsx      # Live QR Pass, Guard Terminal & Curfew Census
│   │   │   ├── MessPage.jsx          # Nutritional Menu & Student RSVP Rebates
│   │   │   ├── MessManagerPage.jsx   # Chef Headcount Kiosk & Food Waste Metrics
│   │   │   ├── AcademicsPage.jsx     # Attendance Roster & Class Broadcasts
│   │   │   ├── FeaturePhonePage.jsx  # Interactive USSD Feature Phone Simulator
│   │   │   ├── AdoptionMigrationPage.jsx # 1-Click 2,000-Student CSV Wizard
│   │   │   ├── SupportDeskPage.jsx   # AI Engine Settings & Self-Learning Hub
│   │   │   ├── RbacPage.jsx          # Roles, Tags & Permissions Matrix
│   │   │   └── AuditLogsPage.jsx     # Immutable Real-Time Audit Ledger
│   │   ├── services/
│   │   │   └── api.js                # Centralized REST API Client
│   │   ├── App.jsx                   # Route Registry & Layout Shell
│   │   ├── main.jsx                  # React DOM Root
│   │   └── index.css                 # Vanilla CSS Institutional Design Tokens
│   ├── package.json                  # Dependencies & Scripts
│   └── vite.config.js                # Vite Configuration & Dev Server Proxy
├── PROJECT.md                        # Master Technical & Operational Specification
├── prototype.md                      # Complete Evaluation Prototype Document
└── README.md                         # Project Documentation
```

---

## 💻 Installation & Local Setup Guide

### Prerequisites
- **Web Server**: Apache / Nginx with PHP 8.2+ (e.g., XAMPP, WampServer, or native PHP)
- **Database**: MySQL 8.0+ or MariaDB 10.4+
- **Node.js**: Node 18.x or 20.x with npm

### 1. Database Configuration
1. Start **Apache** and **MySQL** in your XAMPP Control Panel.
2. Open phpMyAdmin (`http://localhost/phpmyadmin`) or MySQL CLI.
3. Create a database named `collegelife_db`:
   ```sql
   CREATE DATABASE collegelife_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. Import the schema and seed files located in `backend/database/`:
   ```bash
   mysql -u root collegelife_db < backend/database/schema.sql
   mysql -u root collegelife_db < backend/database/seed_personas.sql
   ```
5. *(Optional)* Run the chatbot migration script:
   ```bash
   php backend/database/migrate_chatbot.php
   ```

### 2. Backend Verification
1. Ensure the project is located under your web root (e.g., `D:/xammp/htdocs/collegelife`).
2. Verify database credentials in `backend/config/Database.php`:
   ```php
   private string $host = '127.0.0.1';
   private string $db_name = 'collegelife_db';
   private string $username = 'root';
   private string $password = '';
   ```
3. Test API connectivity in your browser:  
   `http://localhost/collegelife/backend/api/index.php?r=auth/personas`  
   *(Should return JSON containing the 8 pre-seeded personas).*

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser:  
   **`http://localhost:5173`**

---

## 🎨 Institutional Design System & Palette

Campus OS adheres to an **Institutional Light Heritage Design Standard** engineered specifically for academic rigor, high data density, and long operational sessions without eye fatigue:

| Color Token | Hex Code | Semantic Role |
|---|---|---|
| **Heritage Emerald** | `#1B4332` | Primary institutional headers, verified badges, active navigational tabs. |
| **Warm Terracotta** | `#9A3412` | Academic alerts, secondary accents, administrative attention tags. |
| **Paper Canvas** | `#FAF9F6` | Neutral background canvas mirroring physical institutional archives. |
| **Deep Forest Ink** | `#0F291E` | Primary typography color ensuring WCAG AAA legibility. |
| **Parchment Amber** | `#FEF3C7` | SLA warnings, statutory undertakings, notice highlight strips. |

- **Strict No-Emoji Standard**: Zero childish emojis in official UI interfaces. All icons use clean, monochromatic Lucide SVG vectors.
- **Micro-Animations**: Purposeful, subtle transitions (disabled automatically in 2G Mode).
- **Physical Print Stylesheets**: Standardized `@media print` rules optimizing Digital Passes, Collection Passes, and Hall Tickets for physical laser printers.

---

## 📜 Statutory Compliance & Standards

Unified Campus ERP aligns natively with prevailing Indian technical higher-education regulations:
1. **BPUT Academic Regulation 14.2**: Strictly enforces the mandatory **75% minimum classroom attendance** requirement for semester examination eligibility, with explicit HOD condonation channels for approved duty leaves (hackathons, sports, medical).
2. **UGC Grievance Redressal Regulations (2023)**: Time-bound SLA escalation hierarchy, zero-bias complaint assignment, and complete student feedback closure loops.
3. **AICTE Student Induction & Paperless Governance Directive**: 100% paperless student services, verifiable digital credentials, and accessible multilingual interfaces.

---

<div align="center">

**Unified Campus ERP · Campus Life, Debugged.**  
Built for the **BPUT Hackathon 2026** · Problem Statement 07 (Fretbox)

</div>
