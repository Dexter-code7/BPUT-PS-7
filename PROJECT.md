# Unified Campus ERP --- Project Specification

## 1. Project Overview

### Working Project Name

**Unified Campus ERP --- Smart Campus Operating System**

### Vision

Build one fully working, role-aware campus platform that replaces
fragmented campus workflows such as paper forms, registers, notice
boards, repeated Google Forms, scattered messages, and disconnected
applications.

The platform should allow students, teachers, HODs, college leadership,
administration, examination administration, clubs, wardens and other
authorized users to perform their daily campus operations from one
system.

The central principle is:

> **Enter information once, use it everywhere.**

A student's verified ERP profile becomes the identity source for forms,
requests, certificates, registrations, notices and other workflows.

The official Fretbox problem statement emphasizes reducing daily
friction, giving administrators real visibility, speeding
complaint/request resolution with an audit trail, improving
communication, and supporting low-end devices and poor connectivity.

------------------------------------------------------------------------

# 2. Problem We Are Solving

Campus operations are often distributed across:

-   Google Forms
-   WhatsApp groups
-   Notice boards
-   Paper forms
-   Registers
-   Separate portals
-   Office visits
-   Manual approval processes

This creates repeated work for students and staff.

### Example

A teacher creates a Google Form asking:

-   Student Name
-   Roll Number
-   Registration Number
-   Branch
-   Semester
-   Father's Name
-   Guardian Name
-   Parent Phone Number
-   Student Phone Number

The student already has all this information in the ERP, but is forced
to type it again.

The ERP must eliminate this repetition.

------------------------------------------------------------------------

# 3. Core Product Principle

## Fill Once. Use Everywhere.

When a student logs into the ERP:

``` text
Student Login
      ↓
Verified Student Identity
      ↓
ERP Profile
      ↓
Name
Roll Number
Registration Number
Branch
Semester
Email
Phone
Parent/Guardian Information
Hostel
Room
Academic Information
      ↓
Reusable across authorized workflows
```

The student should not repeatedly type information that the college
already knows.

------------------------------------------------------------------------

# 4. Technology Stack

## Frontend

-   React
-   React Router
-   Modern responsive UI
-   Mobile-first design
-   PWA capability where practical
-   Reusable component system
-   Role-aware navigation

## Backend

-   PHP
-   Laravel recommended for the production backend
-   REST API
-   Authentication and authorization
-   Queue/job processing
-   Notification services
-   File/document management

## Database

-   MySQL 8+
-   Relational schema
-   Foreign keys
-   Indexing
-   Transaction support
-   Soft deletes where appropriate

## Optional Supporting Infrastructure

-   Redis for queues/cache
-   Object storage for documents
-   WebSocket/SSE layer for real-time notifications where needed
-   Email/SMS/push notification provider
-   AI/RAG service
-   Background workers

------------------------------------------------------------------------

# 5. High-Level Architecture

``` text
                         ┌─────────────────────┐
                         │     React Web/PWA   │
                         │ Student / Staff UI  │
                         └──────────┬──────────┘
                                    │
                              REST / API
                                    │
                         ┌──────────▼──────────┐
                         │   PHP / Laravel API │
                         │                     │
                         │ Auth                │
                         │ RBAC                │
                         │ Workflows            │
                         │ Smart Forms          │
                         │ Notifications        │
                         │ Complaints           │
                         │ Academics            │
                         │ Hostel               │
                         │ Exams                │
                         │ Clubs                │
                         │ Reports              │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │       MySQL         │
                         │ Campus Master Data  │
                         └─────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
          Redis/Queue           AI / RAG             Storage
              │                     │                     │
        Notifications        Campus Knowledge       Documents
        Background Jobs      Assistant / Classifier  Attachments
```

------------------------------------------------------------------------

# 6. User and Role Architecture

The system must use **RBAC --- Role-Based Access Control**.

However, role alone is not enough.

The authorization model should be:

``` text
USER
  ↓
ROLE
  ↓
TAGS / DESIGNATIONS
  ↓
SCOPE
  ↓
PERMISSIONS
  ↓
DATA ACCESS + ACTION ACCESS
```

## Core Roles

### 6.1 System Administrator

Technical control over:

-   Users
-   Roles
-   Permissions
-   Tags
-   System settings
-   Integrations
-   Security settings
-   Audit logs
-   Master configuration

### 6.2 College / Director

Institution-level visibility.

Possible permissions:

-   Institution analytics
-   Department performance
-   Major complaints
-   Pending approvals
-   Staff workload
-   Campus-wide notices
-   Reports
-   High-level student statistics
-   Policy/configuration approvals

### 6.3 HOD

Department-level authority.

Possible permissions:

-   Department students
-   Department teachers
-   Department notices
-   Department forms
-   Department approvals
-   Department analytics
-   Attendance overview
-   Requests
-   Department reports

Scope should normally be limited to the HOD's department.

### 6.4 Teacher

Teaching and authorized student-interaction functions:

-   Attendance
-   Classes
-   Timetable visibility
-   Student information permitted by policy
-   Smart Form creation
-   Notices
-   Assignments
-   Academic communication
-   Authorized requests

### 6.5 Administration

General administrative operations:

-   Student records
-   Certificates
-   Documents
-   Requests
-   Approvals
-   Fees/dues workflows
-   General notices
-   Administrative reports
-   Complaint handling

### 6.6 Examination Administration

Dedicated examination authority:

-   Exam creation
-   Exam schedule
-   Subject mapping
-   Exam notices
-   Admit cards
-   Exam forms
-   Eligibility
-   Marks
-   Results
-   Revaluation requests
-   Examination reports

Examination data should have strict permissions and audit logging.

### 6.6A Admission Department

The Admission Department manages the student journey from **selection/admission offer to completed enrollment**. Admission should be a first-class module rather than a separate external process.

The admission lifecycle should support:

```text
Application / Selection
        ↓
Selection Result / Offer
        ↓
Admission Confirmation
        ↓
Student Registration
        ↓
Document Submission / Verification
        ↓
Admission Fee Payment
        ↓
Admission Approval
        ↓
Student ERP Account Created
        ↓
Enrollment Complete
```

### Admission features

- Admission/application records
- Selected / waitlisted / rejected status
- Selection notice / offer communication
- Admission confirmation
- Online admission form
- Student profile creation
- Personal and guardian information
- Course/program/department selection
- Document upload
- Document verification
- Admission fee calculation
- Online admission fee payment
- Payment receipt
- Payment status tracking
- Missing-document alerts
- Admission approval workflow
- Admission deadlines
- Admission status tracking
- Admission correspondence/notifications
- Final enrollment confirmation
- Automatic ERP account creation after successful admission

### Important principle

Once a student is selected and completes admission, the information collected during admission should become the student's verified ERP profile instead of being entered again later.

```text
Admission Data
      ↓
Verified Student Profile
      ↓
ERP Identity
      ↓
Smart Forms / Exams / Hostel / Fees / Certificates / Clubs / Attendance
```

This makes admission the **starting point of the student's complete digital campus journey**.

### 6.7 Student

Student self-service:

-   Personal dashboard
-   Attendance
-   Timetable
-   Exams
-   Results
-   Admit cards
-   Certificates
-   Leave
-   Gate pass
-   Hostel
-   Mess
-   Complaints
-   Smart Forms
-   Notices
-   Fees/dues
-   Campus assistant

### 6.8 Club

Controlled access for recognized clubs:

-   Club profile
-   Members
-   Events
-   Event registrations
-   Club forms
-   Club notices
-   Attendance for club activities
-   Event permission requests
-   Approved club data

A club must never automatically receive unrestricted access to student
records.

------------------------------------------------------------------------

# 7. Tags / Designations System

## Core Concept

A user can have a base role and additional tags.

Example:

``` text
Role: Student

Tags:
- Class Representative
- Club Member
- Event Volunteer
- Student Coordinator
```

Tags can grant additional permissions.

## Example: Class Representative

A normal student might have:

``` text
view_own_profile
submit_forms
submit_requests
view_notices
```

A Class Representative may additionally receive:

``` text
create_class_form
publish_class_notice
send_class_announcement
view_class_submission_status
coordinate_class_event
```

The permissions must be configurable by administrators.

## Important Rule

A tag should never automatically grant unrestricted administrative
access.

Example:

``` text
Student
   +
CR Tag
   ↓
Extra class-level permissions
```

Not:

``` text
Student
   +
CR Tag
   ↓
Full college administration
```

## Suggested Tag Types

Tags should be configurable rather than hard-coded.

Possible examples:

-   Class Representative
-   Deputy Class Representative
-   Club Member
-   Club President
-   Club Secretary
-   Club Coordinator
-   Event Volunteer
-   Student Coordinator
-   Hostel Representative
-   Department Representative
-   Student Ambassador
-   Academic Coordinator
-   Good Student
-   Scholarship Student
-   Volunteer

The college can create additional tags.

------------------------------------------------------------------------

# 8. Student Profile and Identity

The student profile is the central identity record.

Example fields:

``` text
Student ID
Admission Number
Roll Number
Registration Number
Name
Date of Birth
Gender
College Email
Phone
Department
Course
Program
Semester
Year
Section
Father's Name
Mother's Name
Guardian Name
Parent/Guardian Phone
Address
Hostel
Room
Admission Details
Academic Status
Profile Photo
```

Sensitive fields must be protected using permissions.

Students should be able to request corrections rather than directly
changing verified institutional data.

------------------------------------------------------------------------

# 9. Smart Forms --- Core Feature

## Concept

The ERP should include a built-in alternative to repetitive Google
Forms.

### Teacher / Admin Form Builder

The form creator can select fields from the ERP profile.

Example:

``` text
CREATE FORM

Title:
Scholarship Application

ERP FIELDS
☑ Student Name
☑ Roll Number
☑ Registration Number
☑ Branch
☑ Semester
☑ Father's Name
☑ Guardian Name
☑ Parent Phone
☑ Student Email

CUSTOM FIELDS
☑ Reason for applying
☑ Income details
☑ Upload document
☑ Consent
```

## Student Experience

When the student opens the form:

``` text
Logged-in Student
       ↓
ERP identifies student
       ↓
Authorized fields auto-populate
       ↓
Student answers only new questions
       ↓
Submit
```

Example:

``` text
Student Name       [Ashish Toppo]        🔒
Roll Number        [XXXXXX]              🔒
Registration No.   [XXXXXX]              🔒
Branch             [MCA]                 🔒
Semester           [1st]                 🔒

Reason             [__________________]
Upload document    [Upload]
Consent            [✓]
```

ERP-controlled identity fields should normally be read-only.

------------------------------------------------------------------------

# 10. Smart Form Field Library

The form builder should support:

## ERP Fields

-   Student name
-   Roll number
-   Registration number
-   Admission number
-   Department
-   Course
-   Program
-   Semester
-   Year
-   Section
-   College email
-   Student phone
-   Father's name
-   Mother's name
-   Guardian name
-   Parent phone
-   Hostel
-   Room
-   Academic status

## Standard Form Fields

-   Short text
-   Long text
-   Number
-   Date
-   Time
-   Date/time
-   Dropdown
-   Radio
-   Checkbox
-   Multi-select
-   File upload
-   Image upload
-   Signature
-   Consent
-   Rating
-   Address
-   Emergency contact

------------------------------------------------------------------------

# 11. Form Targeting

A form creator should be able to target:

-   Entire college
-   Department
-   Course
-   Branch
-   Year
-   Semester
-   Section
-   Hostel
-   Specific class
-   Specific tag
-   Club members
-   Selected students

Example:

``` text
Target:
MCA
1st Year
Section A
Tag: Class Representative
```

Only matching users should receive/access the form.

------------------------------------------------------------------------

# 12. Form Management

Each form should support:

-   Draft
-   Published
-   Scheduled
-   Closed
-   Archived

Features:

-   Start date
-   End date
-   Submission limit
-   One submission per user
-   Multiple submissions if authorized
-   Anonymous mode where appropriate
-   File uploads
-   Required fields
-   Conditional fields
-   Form preview
-   Submission dashboard
-   Export CSV/XLSX
-   Search/filter submissions

------------------------------------------------------------------------

# 13. Workflow Engine

Every request should use a common workflow model.

``` text
REQUEST
   ↓
CATEGORY
   ↓
AI / RULE ROUTING
   ↓
RESPONSIBLE AUTHORITY
   ↓
ASSIGNMENT
   ↓
SLA
   ↓
PROCESS
   ↓
APPROVE / REJECT / RESOLVE
   ↓
STUDENT NOTIFICATION
   ↓
AUDIT TRAIL
```

Examples:

-   Leave request
-   Gate pass
-   Certificate
-   Bonafide
-   Hostel complaint
-   Maintenance request
-   Exam request
-   Revaluation
-   Event permission
-   Club permission

------------------------------------------------------------------------

# 14. AI Complaint Classifier

Students should be able to submit complaints in natural language.

Example:

> "The water tap in Room 204 has been leaking for nine days."

AI identifies:

``` text
Category: Hostel Maintenance
Issue: Water Leakage
Location: Room 204
Priority: High
Department: Hostel Maintenance
```

Then:

``` text
Complaint
   ↓
AI Classification
   ↓
Correct Authority
   ↓
Ticket
   ↓
SLA
   ↓
Reminder
   ↓
Escalation
   ↓
Resolution
```

AI must be used as an assistive routing layer. Authorized staff must
retain control over important decisions.

------------------------------------------------------------------------

# 15. SLA and Escalation

Every request/complaint can have a defined SLA.

Example:

``` text
Complaint created
        ↓
SLA = 24 hours
        ↓
12 hours → reminder
        ↓
24 hours → overdue
        ↓
Escalate to supervisor
```

Store:

-   Created time
-   Assigned time
-   First response time
-   Resolution time
-   SLA deadline
-   Overdue status
-   Escalation history

------------------------------------------------------------------------

# 16. RAG Campus Knowledge Assistant

The ERP should support an official college knowledge base.

Possible sources:

-   College rules
-   Hostel rules
-   Examination rules
-   Academic calendar
-   Leave policies
-   Fee policies
-   Circulars
-   Department guidelines
-   FAQs
-   Student handbook

Students can ask:

> "How many days of hostel leave can I take?"

The assistant should retrieve official information from the college
knowledge base rather than inventing policies.

The response should ideally show its source document.

------------------------------------------------------------------------

# 17. Targeted Notifications

Replace uncontrolled broadcast messaging.

Notification targeting:

``` text
College
Department
Branch
Year
Semester
Section
Hostel
Club
Tag
Selected users
```

Example:

``` text
Exam Room Changed

Target:
MCA
2nd Semester
CSE
```

Students receive only relevant notifications.

Track:

-   Delivered
-   Read
-   Clicked
-   Action completed

------------------------------------------------------------------------

# 18. Academic Module

Student-facing:

-   Attendance
-   Timetable
-   Subjects
-   Faculty
-   Assignments
-   Internal marks where permitted
-   Exam schedule
-   Admit card
-   Results
-   Syllabus
-   Academic calendar

Teacher-facing:

-   Attendance entry
-   Class information
-   Student academic view
-   Notices
-   Forms
-   Assignments

HOD-facing:

-   Department attendance
-   Faculty/class overview
-   Department analytics

------------------------------------------------------------------------

# 19. Hostel Module

Features:

-   Hostel allocation
-   Room records
-   Room/asset records
-   Leave
-   Gate pass
-   Visitor logs
-   Complaints
-   Maintenance
-   Mess menu
-   Mess feedback
-   Meal ON/OFF

## Important Integration

Leave and mess can communicate.

Example:

``` text
Student applies leave
        ↓
Leave approved
        ↓
Mess status updated
        ↓
Meal count adjusted
```

The exact business rules should be configurable by the college.

------------------------------------------------------------------------

# 20. Examination Module

Separate permission boundary.

Features:

-   Examination setup
-   Subject mapping
-   Exam schedule
-   Student eligibility
-   Admit card generation
-   Exam room allocation
-   Seating plan
-   Marks entry
-   Result processing
-   Result publication
-   Revaluation
-   Examination forms
-   Examination notices

All sensitive examination actions should be logged.

------------------------------------------------------------------------

# 21. Club Management

Clubs can manage:

-   Club profile
-   Members
-   Recruitment
-   Events
-   Registration
-   Event attendance
-   Notices
-   Forms
-   Event permissions
-   Certificates where authorized

Club access is scoped only to the club's authorized data.

------------------------------------------------------------------------

# 22. Certificate and Document Requests

Students can request:

-   Bonafide
-   Character certificate
-   Student certificate
-   Other institution-defined certificates

Workflow:

``` text
Student
 ↓
Request
 ↓
Verification
 ↓
Authorized Officer
 ↓
Approval
 ↓
Generate document
 ↓
Digital delivery
```

Document status:

``` text
Submitted
Under Review
Approved
Rejected
Ready
Downloaded
```

------------------------------------------------------------------------

# 22A. Administration Service Request Center

The Administration module should work as a **digital service desk for students**. Students should not have to repeatedly visit offices just to submit an application, ask whether it is ready, or find out when to collect a document.

## Example: Fee Structure Request

A student can request the college fee structure online:

```text
Student
  ↓
Select Service: Fee Structure
  ↓
Fill required details
  ↓
Submit application
  ↓
Administration receives request
  ↓
Officer reviews request
  ↓
Officer responds / prepares document
  ↓
Student receives status update
  ↓
System shows expected completion / collection date
  ↓
Student receives final document or collection instruction
```

The student should be able to see: 

- Application/request number
- Date submitted
- Current status
- Assigned department/officer where appropriate
- Missing information, if any
- Expected completion date
- Whether the student needs to visit the office
- Collection date/time when physical collection is required
- Online document/download when available
- Final response
- Complete request history

### General Administration Services

The same workflow should support services such as:

- Fee structure request
- Bonafide certificate
- Character certificate
- Student certificate
- Document verification
- Migration-related requests
- Transcript-related requests
- Scholarship documents
- NOC requests
- Administrative letters
- Duplicate document requests
- General applications
- Permission requests
- Other college-defined services

The exact service catalogue should be configurable by the college.

## No More "Did My Work Get Done?" Visits

Every administrative request should have a trackable lifecycle:

```text
Submitted
   ↓
Received
   ↓
Under Review
   ↓
Additional Information Required (if needed)
   ↓
Approved / Prepared
   ↓
Ready for Download / Collection
   ↓
Completed
```

If the request is delayed:

```text
SLA / Expected Date
       ↓
Reminder
       ↓
Overdue
       ↓
Escalation
```

Students should receive notifications when the status changes. This directly reduces unnecessary office visits and uncertainty.

## Online Application First

Whenever a service can be completed digitally, the platform should allow the student to:

1. Select the service.
2. Automatically populate known ERP information.
3. Enter only the additional information required for that service.
4. Upload documents if required.
5. Submit online.
6. Track the request.
7. Receive the result digitally where possible.
8. Receive clear instructions if physical verification or collection is genuinely required.

The system should clearly tell the student **what is happening next**, rather than forcing them to visit the office to ask.

# 23. Fees / Dues

Where integrated with the college's financial data, students can see:

-   Current dues
-   Payment status
-   Receipts
-   Fee notices
-   Relevant deadlines

Access to financial information must be permission-controlled.

------------------------------------------------------------------------

# 24. Administrator Command Center

Dashboard should provide:

``` text
Pending Requests
Overdue Requests
Open Complaints
Average Resolution Time
SLA Compliance
Recurring Issues
Department Workload
Notification Statistics
Form Completion
Student Activity
```

Example:

``` text
HOSTEL COMPLAINTS

Water            42
Electrical       18
Cleaning         27
Furniture         9

Recurring:
Block B — Water complaints ↑ 31%
```

------------------------------------------------------------------------

# 25. Role-Aware Dashboard

The dashboard must change based on role and tags.

### Student

``` text
My Tasks
My Attendance
My Forms
My Requests
My Notices
My Exams
```

### CR Student

``` text
My Tasks
Class Forms
Class Notices
Class Submissions
My Academic Data
```

### Teacher

``` text
My Classes
Attendance
Forms
Notices
Student Requests
```

### HOD

``` text
Department Overview
Requests
Faculty
Students
Analytics
```

### Director

``` text
College Overview
Department Performance
Major Issues
Analytics
```

### Examination Admin

``` text
Exams
Eligibility
Admit Cards
Marks
Results
Revaluation
```

------------------------------------------------------------------------

# 26. Permissions Model

Permissions should be atomic.

Examples:

``` text
view_own_profile
edit_own_profile
view_student_profile
create_form
publish_form
view_form_submissions
export_form_submissions
create_notice
publish_notice
send_targeted_notification
view_attendance
edit_attendance
create_leave_request
approve_leave
create_gate_pass
approve_gate_pass
create_complaint
assign_complaint
resolve_complaint
view_admin_dashboard
manage_users
manage_roles
manage_tags
manage_exam
enter_marks
publish_results
manage_club
```

A user can receive permissions from:

``` text
Base Role
+
Tag
+
Department Scope
+
Temporary Assignment
```

------------------------------------------------------------------------

# 27. Temporary Permissions

Some responsibilities are temporary.

Example:

``` text
Student
+
CR Tag
+
Academic Year 2026-27
```

At the end of the term, the tag can expire automatically.

Similarly:

``` text
Club Event Coordinator
Valid:
10 Oct → 30 Oct
```

After expiration, permissions are automatically removed.

------------------------------------------------------------------------

# 28. Audit Logging

Every important action should be logged.

Example:

``` text
Who:
Teacher A

Action:
Published Notice

Target:
MCA 1st Year

Time:
2026-10-08 10:30

IP / Device:
Logged according to institutional policy
```

Audit events should include:

-   Login
-   Logout
-   Profile changes
-   Permission changes
-   Form creation
-   Form publication
-   Notice publication
-   Approval
-   Rejection
-   Complaint assignment
-   Complaint resolution
-   Marks changes
-   Result publication
-   Document generation
-   Role/tag changes

------------------------------------------------------------------------

# 29. Security Requirements

Minimum security requirements:

-   Secure authentication
-   Password hashing
-   Session/token security
-   RBAC authorization on backend
-   Server-side permission checks
-   Input validation
-   CSRF protection where applicable
-   Rate limiting
-   File upload validation
-   SQL injection protection
-   XSS protection
-   Secure HTTP headers
-   Audit logs
-   Database backups
-   Sensitive-field access controls
-   Secure password reset
-   Account lock/rate controls
-   HTTPS in production

**Never rely only on React UI restrictions.**

Every permission must be enforced by the PHP backend.

------------------------------------------------------------------------

# 30. Database Design --- Initial Core Tables

Suggested tables:

``` text
users
roles
permissions
role_permissions
user_roles

tags
tag_permissions
user_tags
tag_scopes

admission_applications
admission_selections
admission_offers
admission_documents
admission_document_verifications
admission_payments
admission_status_history
admission_deadlines

students
student_profiles
departments
courses
programs
semesters
sections

teachers
staff
staff_departments

forms
form_fields
form_targets
form_submissions
form_answers

notices
notice_targets
notice_reads
notice_actions

service_catalog
service_requests
service_request_fields
service_request_attachments
service_request_status_history
service_request_assignments
service_request_comments
service_request_slas
service_request_notifications

requests
request_types
request_statuses
request_assignments
request_comments
request_approvals

complaints
complaint_categories
complaint_assignments
complaint_status_history
complaint_escalations

attendance
attendance_sessions
attendance_records

subjects
classes
timetables
assignments

hostels
hostel_blocks
rooms
room_allocations
hostel_complaints
mess_menus
mess_feedback
meal_status
gate_passes
visitor_logs

examinations
exam_subjects
exam_schedules
exam_eligibility
admit_cards
marks
results
revaluation_requests

clubs
club_members
club_events
club_registrations

documents
document_requests
generated_documents

notifications
notification_deliveries

knowledge_documents
knowledge_chunks
knowledge_sources

audit_logs
settings
```

This is an initial logical model and should be normalized/refined during
implementation.

------------------------------------------------------------------------

# 31. Important Data Relationship

The system should maintain a single institutional identity.

``` text
USER
  ↓
STUDENT / STAFF PROFILE
  ↓
DEPARTMENT
  ↓
PROGRAM / COURSE
  ↓
YEAR / SEMESTER / SECTION
  ↓
ROLES
  ↓
TAGS
  ↓
PERMISSIONS
```

This identity should power:

-   Smart Forms
-   Notifications
-   Requests
-   Attendance
-   Exams
-   Hostel
-   Clubs
-   Reports

------------------------------------------------------------------------

# 32. Smart Form Security

A form creator must only be able to select ERP fields they are
authorized to use.

Example:

``` text
Teacher:
☑ Name
☑ Roll Number
☑ Branch
☑ Semester
☑ College Email

Restricted:
☐ Fee balance
☐ Examination result
☐ Sensitive personal information
```

The backend must validate this again when the form is published.

------------------------------------------------------------------------

# 33. Low-Bandwidth and Low-End Device Strategy

The official problem statement requires attention to low-bandwidth,
low-end devices and students without smartphones.

Design principles:

-   Lightweight React pages
-   Avoid unnecessarily large assets
-   Pagination
-   Lazy loading
-   Optimized API payloads
-   Image compression
-   Cached static assets
-   Offline-friendly form drafts
-   Retry failed submissions
-   Clear network status
-   PWA support where practical
-   SMS/alternative fallback for important workflows

The exact fallback channel can be selected based on the college's
infrastructure.

------------------------------------------------------------------------

# 34. Regional Language Support

Architecture should support multilingual content.

Do not hard-code text into components.

Use:

``` text
translation_key
language
translated_text
```

Potential languages can be configured by the institution.

------------------------------------------------------------------------

# 35. AI Architecture

AI features should be modular.

``` text
AI Gateway
   ├── Complaint Classifier
   ├── Request Router
   ├── RAG Assistant
   ├── Recurring Issue Detector
   ├── Notification Assistance
   └── Analytics / Prediction
```

The core ERP must continue working even if the AI service is
unavailable.

------------------------------------------------------------------------

# 36. RAG Rules

AI should distinguish:

### Official information

From:

-   College documents
-   Policies
-   Rules
-   Circulars
-   Approved FAQs

### Generated assistance

AI can summarize or explain official information.

For high-impact decisions:

``` text
AI Suggests
   ↓
Authorized Human Confirms
```

AI should not silently change official records.

------------------------------------------------------------------------

# 37. Notification Engine

Create one common notification service.

Channels may include:

-   In-app
-   Push
-   Email
-   SMS where configured

Notification object:

``` text
Notification
├── title
├── message
├── sender
├── target
├── priority
├── action_url
├── created_at
├── expires_at
└── tracking
```

------------------------------------------------------------------------

# 38. Development Phases

## Phase 1 --- Foundation

-   Laravel/PHP backend
-   React frontend
-   MySQL
-   Authentication
-   User management
-   RBAC
-   Roles
-   Permissions
-   Tags
-   Department structure
-   Student/staff profiles

## Phase 2 --- Smart Forms

-   Form builder
-   ERP field library
-   Custom fields
-   Targeting
-   Auto-fill
-   Submission
-   Dashboard
-   Export
-   Permissions

## Phase 3 --- Communication

-   Notices
-   Targeting
-   Notifications
-   Read tracking
-   Action tracking

## Phase 4 --- Requests

-   Request engine
-   Leave
-   Gate pass
-   Certificates
-   Approvals
-   SLA
-   Escalation
-   Audit trail

## Phase 5 --- Hostel

-   Rooms
-   Allocation
-   Complaints
-   Maintenance
-   Mess
-   Leave integration
-   Gate/visitor workflows

## Phase 6 --- Academic

-   Attendance
-   Timetable
-   Subjects
-   Assignments
-   Academic dashboard

## Phase 7 --- Examination

-   Exam schedules
-   Admit cards
-   Marks
-   Results
-   Revaluation

## Phase 8 --- Clubs

-   Club management
-   Members
-   Events
-   Registrations
-   Club forms

## Phase 9 --- AI/RAG

-   Knowledge base
-   RAG assistant
-   Complaint classifier
-   Request routing
-   Recurring issue detection

## Phase 10 --- Production Hardening

-   Security audit
-   Performance
-   Backups
-   Monitoring
-   Accessibility
-   Low-bandwidth testing
-   Error handling
-   Documentation
-   Deployment

------------------------------------------------------------------------

# 39. Minimum Fully Working MVP

The first complete demo should include at least these end-to-end
workflows:

## Workflow 1 --- Smart Form

``` text
Teacher creates form
→ Selects ERP fields
→ Targets students
→ Student opens link
→ Profile automatically fills
→ Student completes remaining fields
→ Submit
→ Teacher sees responses
```

## Workflow 2 --- Complaint

``` text
Student submits complaint
→ AI categorizes
→ Department assigned
→ SLA starts
→ Authority receives notification
→ Authority resolves
→ Student receives update
→ Audit history saved
```

## Workflow 3 --- Leave

``` text
Student requests leave
→ Warden/authorized person receives
→ Approve/reject
→ Student notified
→ Gate/mess status can update
```

## Workflow 4 --- Targeted Notice

``` text
Teacher/Admin creates notice
→ Select target
→ Publish
→ Only matching users receive it
→ Read/action tracking
```

## Workflow 5 --- Role + Tag

``` text
Student
→ CR tag assigned
→ CR receives extra permissions
→ CR can create approved class-level forms/notices
→ Tag expires or is removed
→ Extra permissions disappear
```

------------------------------------------------------------------------

# 40. Demo Scenario

The final hackathon demonstration should tell one connected story.

### Step 1

Student logs into ERP.

### Step 2

Student sees:

``` text
Attendance
Exam
Forms
Notices
Hostel
Requests
```

### Step 3

Teacher creates:

**"Industrial Visit Registration Form"**

Teacher selects:

``` text
Student Name
Roll Number
Branch
Semester
Phone
```

plus:

``` text
Food Preference
Emergency Contact
Consent
```

### Step 4

Student opens the form.

ERP automatically fills verified identity information.

Student only answers the new questions.

### Step 5

Student reports:

> "The hostel bathroom tap has been leaking for five days."

AI classifies the complaint.

### Step 6

System routes it to the correct authority and starts the SLA.

### Step 7

Authority dashboard shows:

``` text
New Complaint
Hostel
Water Leakage
Room/Location
SLA: 24 hours
```

### Step 8

Administrator sees the complaint in the command center.

### Step 9

Teacher publishes an announcement targeted only to:

``` text
MCA
1st Year
Section A
```

### Step 10

A student with the **Class Representative** tag gets additional
class-level capabilities.

This demonstrates that the platform is not just an app; it is a
connected campus operating system.

------------------------------------------------------------------------

# 41. Success Criteria

The project should demonstrate:

### Student

-   Less repetitive data entry
-   One place for campus tasks
-   Clear request status
-   Relevant notifications
-   Faster access to information

### Teacher

-   Easy forms
-   Auto-filled student information
-   Targeted communication
-   Student workflow management

### HOD

-   Department visibility
-   Requests
-   Forms
-   Notices
-   Analytics

### Administration

-   Centralized operations
-   Pending work visibility
-   SLA tracking
-   Audit trails

### Director

-   Institution-wide visibility
-   Trends
-   Recurring problems
-   Department comparison

### Examination Administration

-   Controlled exam workflows
-   Secure marks/results operations

### Clubs

-   Controlled student interaction
-   Events
-   Registrations
-   Forms

------------------------------------------------------------------------

# 42. Non-Functional Requirements

The platform should be:

-   Secure
-   Scalable
-   Maintainable
-   Responsive
-   Accessible
-   Low-bandwidth friendly
-   Mobile friendly
-   Auditable
-   API-driven
-   Modular
-   Backup-ready
-   Production deployable

------------------------------------------------------------------------

# 43. Development Rules

1.  Backend is the source of truth.
2.  Never trust frontend permission checks.
3.  Every sensitive action must be authorized server-side.
4.  Every important action must be auditable.
5.  Avoid duplicating student identity data unnecessarily.
6.  Smart Forms should reference verified ERP data.
7.  AI should never silently modify sensitive institutional records.
8.  AI must fail gracefully.
9.  Role permissions and tags must be configurable.
10. Department/college scope must be enforced at API level.
11. Examination and financial information require stronger permissions.
12. Build reusable workflow components rather than separate
    implementations for every request.
13. Keep the student experience simple.
14. Keep administrative dashboards actionable rather than merely
    decorative.

------------------------------------------------------------------------

# 44. Project Folder Structure

Suggested backend:

``` text
backend/
├── app/
│   ├── Models/
│   ├── Controllers/
│   ├── Services/
│   ├── Policies/
│   ├── Jobs/
│   ├── Notifications/
│   ├── Events/
│   └── AI/
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── routes/
├── config/
├── resources/
└── tests/
```

Suggested frontend:

``` text
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── features/
│   │   ├── auth/
│   │   ├── forms/
│   │   ├── complaints/
│   │   ├── attendance/
│   │   ├── hostel/
│   │   ├── exams/
│   │   ├── clubs/
│   │   ├── notices/
│   │   └── admin/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── utils/
│   └── routes/
└── public/
```

------------------------------------------------------------------------

# 45. API Design

Use REST APIs with consistent responses.

Example:

``` text
POST   /api/auth/login
GET    /api/me

GET    /api/students/me
GET    /api/students/{id}

GET    /api/admissions
POST   /api/admissions/applications
GET    /api/admissions/{id}
POST   /api/admissions/{id}/documents
POST   /api/admissions/{id}/payment
PATCH  /api/admissions/{id}/status

GET    /api/services
POST   /api/service-requests
GET    /api/service-requests/{id}
PATCH  /api/service-requests/{id}
POST   /api/service-requests/{id}/attachments
POST   /api/service-requests/{id}/comments

GET    /api/forms
POST   /api/forms
GET    /api/forms/{id}
POST   /api/forms/{id}/submit

GET    /api/notices
POST   /api/notices

GET    /api/complaints
POST   /api/complaints
PATCH  /api/complaints/{id}

GET    /api/requests
POST   /api/requests
PATCH  /api/requests/{id}

GET    /api/attendance
POST   /api/attendance

GET    /api/exams
GET    /api/results

GET    /api/hostel
GET    /api/clubs

GET    /api/admin/dashboard
GET    /api/audit-logs
```

All APIs must enforce RBAC and scope.

------------------------------------------------------------------------

# 46. Testing Strategy

## Unit Tests

Test:

-   Permissions
-   Role inheritance
-   Tag permissions
-   Form validation
-   SLA calculation
-   Notification targeting

## Feature Tests

Test:

-   Student submits form
-   Teacher creates form
-   CR receives extra permission
-   Unauthorized teacher cannot access another department
-   Complaint routing
-   Leave approval
-   Exam permissions

## Security Tests

Test:

-   Unauthorized API access
-   IDOR
-   Privilege escalation
-   File upload attacks
-   SQL injection
-   XSS
-   CSRF
-   Rate limits

## User Acceptance Testing

Test workflows with:

-   Student
-   Teacher
-   CR
-   HOD
-   Admin
-   Examination Admin
-   Director

------------------------------------------------------------------------

# 47. Final Product Definition

The final platform should be understood as:

> **A unified, role-aware and intelligent campus operating system where
> institutional identity is stored once, workflows are automated,
> information is targeted to the right people, requests are tracked from
> submission to resolution, and every user sees only what they are
> authorized to see.**

The strongest product principles are:

### 0. Admission-to-Alumni Digital Journey

The student's digital journey begins when the college publishes the selection result and continues through admission, academics, hostel, examinations, administration, clubs and other campus services.

### 1. One Identity

Student/staff information is entered once.

### 2. One Platform

Campus operations happen in one place.

### 3. Smart Forms

ERP information automatically fills authorized form fields.

### 4. Role + Tag Based Access

A user gets capabilities based on their role, tags, scope and
permissions.

### 5. Workflow Automation

Requests move automatically to the correct authority.

### 6. AI Assistance

AI classifies, routes, searches official knowledge and identifies
patterns.

### 7. Targeted Communication

The right information reaches the right group.

### 8. Full Visibility

Administrators can see what is pending, overdue, resolved and recurring.

### 9. Accessibility

The platform remains useful on low-end devices and poor networks.

### 10. Auditability

Important actions have a traceable history.

------------------------------------------------------------------------

# 48. Source Alignment

This project specification is based on the Fretbox / BPUT Hackathon 2026
problem statement **"Attendance, Mess, Hostel, Repeat: Campus Life,
Debugged."**

The source requires a working prototype covering multiple everyday
campus workflows, an administrator dashboard, targeted communication,
and accessibility/low-bandwidth considerations.

The implementation described above expands those requirements into a
complete product architecture while preserving the core problem:
reducing everyday friction for both students and administrators.
