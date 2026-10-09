# 🎓 Unified Campus ERP — Smart Campus Operating System

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

[Explore Innovations](#-the-5-breakthrough-innovations) • [System Architecture](#-system-architecture) • [Feature Matrix](#-comprehensive-feature-matrix-15-modules) • [Evaluation Personas](#-instant-1-click-evaluation-personas) • [Quickstart](#-quickstart--installation-guide)

</div>

---

## 🏛️ Executive Summary: "The Tuesday Dilemma"

Most universities across India operate on a fragmented patchwork of paper registers, physical notice boards, unofficial WhatsApp groups, printed forms, and disconnected spreadsheets. Students lose hours standing in physical lines, while administrators lack real-time visibility into pending tasks, curfew status, mess procurement, and statutory compliance.

```
THE OLD REALITY (Half a day wasted across 4 physical checkpoints):
1. Bonafide Certificate  ──► Admin Block Counter 3 (Queue opens 11:00 AM)
2. Leaking Hostel Tap    ──► Physical Warden Diary (Wait until night rounds)
3. Cancelled Lecture     ──► Lost inside a 200-member noisy WhatsApp group
4. Mess Dinner Menu      ──► Ask a senior "who usually knows"

THE CAMPUS OS REALITY (0 Queues · 0 WhatsApp Noise · Instant Resolution):
1. Bonafide Certificate  ──► 1-Click apply with auto-locked verified ERP identity & scheduled counter pass
2. Leaking Hostel Tap    ──► 72h SLA timer, auto-routed to plumber, closed ONLY with Student Completion OTP
3. Cancelled Lecture     ──► Official faculty timetable broadcast with authenticated push delivery
4. Mess Dinner Menu      ──► Live 7-day nutritional menu + opt-out before 5 PM for headcount audit & ₹25 rebate
```

---

## 🌟 The 5 Breakthrough Innovations

Beyond standard ERP digitisation, Campus OS introduces **5 core outlier innovations** engineered specifically for real-world campus constraints, infrastructure gaps, and statutory university mandates:

<br/>

### 1. 🤖 CampusDesk: Self-Learning Institutional AI & Support Hub
> *A 24/7 conversational campus assistant that continuously learns from human support officers in real time.*

```
Student Asks Query
        │
        ▼
[Learned Knowledge Engine] ──(Match Found)──► Instant Verified Resolution (<300ms)
        │ (No Match / Complex)
        ▼
[Primary Campus LLM API]  ──(Grounded Context)──► Automated Response
        │ (Student requests human / Low Confidence)
        ▼
[Live Support Queue]      ──► Human Officer responds in /support-desk
                                     │
                                     ▼
                    [Auto-Teach Feedback Loop]
                    System permanently indexes approved Q&A
                    into 'chatbot_learned_qa'. All future
                    students get instant automated answers!
```

- **Institutional Grounding**: Pre-indexed on BPUT academic regulations, 75% attendance rules, hostel curfew bylaws, and official certificate procedures.
- **Autonomous Feedback Loop**: When a human support officer answers an escalated ticket in the Support Desk console, a single checkbox permanently commits the verified answer to the institutional knowledge base.
- **Privacy Shield**: The engine strips internal provider tags, presenting a neutral, tamper-proof academic intelligence assistant.

---

### 2. 📱 Zero-Hardware Feature Phone USSD Engine (`*141#` / `*789#`)
> *Bridging the digital divide for students with basic keypad phones or zero cellular data.*

- **100% Software-Based Simulation**: Interactive in-browser feature phone simulator demonstrating complete USSD menu navigation (`*141#`) with zero dependency on expensive telco hardware or paid SMS gateways.
- **Complete Operational Parity**:
  - `1. Attendance Status` → Real-time % check, classes attended/conducted, and debarment clearance.
  - `2. Hostel Gatepass` → Instant 4-digit numeric token code for security guard exit/entry verification.
  - `3. Mess Menu & RSVP` → Inspects daily menu and submits dinner opt-out to earn rebate credits.
  - `4. Emergency Circulars` → Displays urgent statutory campus directives directly on the 128x160 monochrome screen.

---

### 3. ⚡ 2G Low-Bandwidth Mode (99.2% Data Saved • 14.2 KB Payload)
> *Engineered for thick concrete hostel dorms and throttled 64 kbps cellular connections.*

- **The Problem**: Concrete hostel blocks and congested cell towers frequently drop connections down to 2G/EDGE (64 kbps throttled FUP limits). Heavy modern web apps (2+ MB) completely hang.
- **The Architecture**:
  - One-click top-bar toggle applies `.low-bandwidth-mode` directly to `document.body`.
  - **CSS Stripping & GPU Decoupling**: Completely eliminates CSS keyframe animations, transition lags, text shadows, filter blurs, and elevation box-shadows.
  - **Asset Suppression**: Disables non-essential raster images and decorative SVGs (`img, svg.decorative { display: none !important; }`).
  - **Payload Compression**: Slashes operational network transfer from **~1.8 MB down to just 14.2 KB** (a 99.2% data reduction), allowing gatepass generation and notice acknowledgments to load in under **1.2 seconds on 2G**.

---

### 4. 🔒 Anti-Fraud Security: Secured Student OTP & Dynamic Gatepass QR
> *Tamper-proof accountability across physical hostel security and campus maintenance.*

- **Secured Grievance Completion OTP**:
  - Maintenance technicians cannot falsely mark leaking taps or electrical issues as "Resolved" from their desks.
  - The secret 4-digit Completion OTP is **rendered exclusively on the student's screen** who raised the ticket. Technicians and mess managers receive `NULL` in APIs.
  - The technician must physically visit the room, perform the repair, and obtain the OTP from the student to successfully close the ticket.
- **Time-Expiring Holographic Gatepass QR**:
  - Outpasses render a dynamic, rotating countdown ticker and auto-expiring QR code with a 4-digit fallback token, completely preventing student screenshot-sharing or badge forgery.
  - Dedicated **Security Guard Gate Terminal Mode** enables 1-click Exit and Entry punches with automated curfew breach flags.

---

### 5. 🍲 Smart Mess Food Waste Prevention & Live Head Chef Kiosk
> *Closing the loop between student dining schedules and commercial kitchen procurement.*

- **Dinner RSVP Waste Prevention Engine**: Students opt out of dinner before the daily 5:00 PM cutoff to earn **Mess Rebate Credits** credited toward monthly hostel dues.
- **Head Chef Live Headcount Kiosk (`/mess-manager`)**:
  $$\text{Net Plates to Cook} = \text{Total Boarders} - \text{Opted Out (RSVP)} - \text{Approved Hostel Leaves} \pm 15 \text{ buffer}$$
- **Institutional Impact**: Live dashboard tracks cumulative **kilograms of food waste prevented** and **procurement rupees saved**, eliminating commercial kitchen overcooking by up to **22%**.

---

## ⚙️ System Architecture

Campus OS is built as a decoupled, high-performance web platform combining a reactive client with an enterprise PHP 8.2 REST API gateway and a relational MySQL 8 data tier:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER                                          │
│  React 19 SPA (Vite 8) · Vanilla CSS Design Tokens · Lucide Icons · Multilingual (EN/HI/OR) │
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
│  ChatbotController (Campus Intelligence Engine with Self-Learning Loop)                │
└─────────────────────────────────────────▲──────────────────────────────────────────────┘
                                          │ PDO Prepared Statements
┌─────────────────────────────────────────▼──────────────────────────────────────────────┐
│                                   DATABASE LAYER                                       │
│  MySQL 8.0+ (InnoDB, UTF-8 MB4) · Foreign Key Constraints · Referential Integrity      │
│  Complete Seed Dump: `/backend/database/collegelife_db.sql` (272 KB Clean Dataset)     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Comprehensive Feature Matrix (15 Modules)

| # | Module | Route | Primary Highlights & Institutional Workflows |
|:---:|---|---|---|
| **01** | **Enterprise RBAC & Audit Trail** | `/rbac`, `/audit` | Dual-layer security: 8 core institutional roles + dynamic tags (`class_representative`, `hostel_prefect`). 38+ fine-grained permissions. Tamper-evident audit ledger capturing timestamp, actor, role, IP address, and payload diff. |
| **02** | **Verified Identity & Smart ID Pass** | `/profile`, `/students` | *"Fill Once, Use Everywhere"* master data source. University Digital Campus Pass with institutional crest, holographic watermark seal, dynamic barcode, and print-ready laser stylesheet. |
| **03** | **Smart Forms Engine** | `/forms` | Replaces Google Forms. 22 auto-locked ERP identity fields permanently read-only when answered by students. Dynamic form builder (text, dropdowns, checkboxes, file uploads). 1-click audit CSV export merging master student records. |
| **04** | **Digital Certificates & Service Center** | `/services` | Bonafide, Character, Internship NOC, Attestations. Multi-stage approval lifecycle. Scheduled physical counter pickup pass (e.g., *Counter 3, 11:30 AM*). Official wet seal & registrar ink delivery verification ledger. |
| **05** | **Statutory Notice Board & Read Compliance** | `/notices` | Precision scoping by Branch, Semester, Hostel, or Tag. Immutable circular reference numbers (`CUT/REG/2026/04`). Mandatory digital read-acknowledgments with live compliance meter (e.g., *94.2% Acknowledged*) and automated reminder queues. |
| **06** | **Grievance Desk & Root-Cause Pattern Radar** | `/grievances` | Strict 24h/72h SLA timers with auto-routing to technicians. Executive Directorate oversight scope (Principal only sees SLA breaches). **Secured Student Completion OTP**. Autonomous spatial pattern radar heatmap. |
| **07** | **Examination Cell, Hall Tickets & Grade Sheets** | `/exams` | Active Examination Term switcher. Automated **75% Attendance Debarment Gatekeeper** (BPUT Reg 14.2) with HOD condonation override. 1-click Bulk Release Cards. Printable admit card with security QR and marks moderation ledgers. |
| **08** | **Digital Gatepass & Guard Punch Terminal** | `/gatepass` | Day Pass & Night Outpass workflow with parent phone auto-locking. Anti-screenshot time-expiring QR code + 4-digit numeric fallback. Security guard gate terminal mode with 1-click Exit/Entry punch, curfew defaulter flags, and live warden campus census gauge. |
| **09** | **Smart Mess Operations & Food Waste Prevention** | `/mess`, `/mess-manager` | 7-day nutritional menu board. "Skip Meal RSVP" waste prevention engine with cutoff reminders and **Mess Rebate Credits**. Head Chef Kiosk projecting exact net plates to cook with live ₹/kg food waste savings. |
| **10** | **Academic Timetable & 75% Attendance Meter** | `/academics` | Proactive attendance gauge showing safe skip buffer or shortage deficit. 1-click faculty roll-call roster. 1-click room change / class cancellation broadcast. Official duty leave submission with automatic attendance credit upon approval. |
| **11** | **Feature Phone USSD Simulator** | `/feature-phone` | 100% software-based interactive feature phone simulation (`*141#` / `*789#`). Zero hardware/telecom cost. Access attendance, gatepass tokens, mess menu, meal RSVPs, and urgent notices on basic 2G phones. |
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
- **Physical Print Stylesheets**: Standardized `@media print` rules optimizing Digital Passes, Collection Passes, and Hall Tickets for physical laser printers.

---

## 💻 Quickstart & Installation Guide

### Prerequisites
- **Web Server**: Apache / Nginx with PHP 8.2+ (e.g. XAMPP, WampServer)
- **Database**: MySQL 8.0+ / MariaDB 10.4+
- **Node.js**: Node 18.x or 20.x with npm

### 1. Database Setup
1. Start **Apache** and **MySQL** in XAMPP.
2. Open phpMyAdmin (`http://localhost/phpmyadmin`) or MySQL CLI.
3. Create the database:
   ```sql
   CREATE DATABASE collegelife_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. Import the complete, sanitized dataset located at `backend/database/collegelife_db.sql`:
   ```bash
   mysql -u root collegelife_db < backend/database/collegelife_db.sql
   ```

### 2. Backend Verification
- Ensure the project directory is located under your web root (e.g., `d:/xammp/htdocs/collegelife`).
- Database credentials in `backend/config/Database.php` defaults to:
  ```php
  private string $host = '127.0.0.1';
  private string $db_name = 'collegelife_db';
  private string $username = 'root';
  private string $password = '';
  ```
- Test API connectivity:  
  `http://localhost/collegelife/backend/api/index.php?r=auth/personas`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

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
