import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  CheckCircle2,
  BookOpen,
  Calendar,
  Clock,
  ShieldCheck,
  Building2,
  FileText,
  AlertCircle,
  Tag,
  ArrowRight,
  GraduationCap,
  Users,
  MapPin,
  ExternalLink,
  ClipboardList,
  Check,
  Award,
  Layers,
  Send,
  HelpCircle,
  FileSpreadsheet,
  X,
  ShieldAlert,
  CheckCheck,
  Bell,
  KeyRound,
  Utensils
} from 'lucide-react';

export default function DashboardPage() {
  const { user, showToast } = useAuth();
  const profile = user?.profile;
  const role = user?.role_name;

  const isStudent = role === 'student';
  const isCR = user?.tags?.some(t => t.name === 'class_representative');
  const isFaculty = role === 'teacher';
  const isHOD = role === 'hod';
  const isWarden = role === 'warden';
  const isMessManager = role === 'mess_manager';
  const isAdminOrStaff = ['system_admin', 'admin_staff', 'exam_admin', 'director'].includes(role);
  const isAcademicPersona = isStudent || isFaculty || isHOD;

  const [activeTab, setActiveTab] = useState('overview');

  // Urgent Notice Banner & Popup State
  const [urgentNotice, setUrgentNotice] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  useEffect(() => {
    if (isStudent) {
      loadPendingUrgentNotices();
    }
  }, [isStudent]);

  const loadPendingUrgentNotices = async () => {
    try {
      const res = await api.getNotices();
      if (res.success && res.data.notices) {
        // Find notice requiring acknowledgment that is not yet acknowledged, prioritizing urgent/circular
        const pending = res.data.notices.find(n => n.requires_acknowledgment && !n.is_acknowledged);
        if (pending) {
          setUrgentNotice(pending);
          const dismissed = sessionStorage.getItem(`dismissed_notice_${pending.id}`);
          if (dismissed) {
            setBannerDismissed(true);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load pending notices on dashboard', err);
    }
  };

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    if (urgentNotice) {
      sessionStorage.setItem(`dismissed_notice_${urgentNotice.id}`, 'true');
    }
  };

  const handleDashboardAcknowledge = async () => {
    if (!urgentNotice) return;
    try {
      setAcknowledging(true);
      const res = await api.acknowledgeNotice({
        notice_id: urgentNotice.id,
        note: 'Acknowledged and registered by student via Campus Hub'
      });
      if (res.success) {
        showToast('Institutional compliance acknowledgment registered successfully!');
        setPopupOpen(false);
        setBannerDismissed(true);
        setUrgentNotice(prev => prev ? { ...prev, is_acknowledged: true } : null);
      }
    } catch (err) {
      showToast('Acknowledgment failed: ' + err.message, 'error');
    } finally {
      setAcknowledging(false);
    }
  };

  // Realistic academic schedule data
  const studentSchedule = [
    { time: '09:30 AM – 10:30 AM', code: 'MCA-101', subject: 'Advanced Data Structures & Algorithms', room: 'Lecture Hall C-201', faculty: 'Prof. Ashok Sharma', status: 'Completed', type: 'Lecture' },
    { time: '10:45 AM – 12:15 PM', code: 'MCA-102', subject: 'Enterprise Database Systems Lab', room: 'Lab Block A-104', faculty: 'Dr. Meenakshi Sundaram', status: 'Live Now', type: 'Laboratory' },
    { time: '02:00 PM – 03:00 PM', code: 'MCA-104', subject: 'Software Engineering & Architecture', room: 'Lecture Hall C-201', faculty: 'Prof. S. Nayak', status: 'Upcoming', type: 'Lecture' },
  ];

  const facultySchedule = [
    { time: '09:30 AM – 10:30 AM', code: 'MCA-101', subject: 'Advanced Data Structures (MCA-1A)', room: 'Lecture Hall C-201', students: 58, status: 'Completed', type: 'Theory Lecture' },
    { time: '11:30 AM – 01:00 PM', code: 'MCA-101', subject: 'Data Structures Problem Tutorial', room: 'Tutorial Room C-102', students: 28, status: 'Live Now', type: 'Tutorial Session' },
    { time: '03:15 PM – 04:15 PM', code: 'MCA-104', subject: 'Software Engineering Seminar', room: 'Lecture Hall C-201', students: 60, status: 'Upcoming', type: 'Interactive Seminar' },
  ];

  const studentCourses = [
    { code: 'MCA-101', name: 'Advanced Data Structures & Algorithms', faculty: 'Prof. Ashok Sharma', credits: 4, room: 'Hall C-201', attendance: '92.0%', classesHeld: 25, classesAttended: 23, syllabus: 48 },
    { code: 'MCA-102', name: 'Enterprise Database Systems & MySQL', faculty: 'Dr. Meenakshi Sundaram', credits: 4, room: 'Lab A-104', attendance: '88.0%', classesHeld: 25, classesAttended: 22, syllabus: 52 },
    { code: 'MCA-103', name: 'Operating System Internals & Linux', faculty: 'Prof. P. K. Rout', credits: 4, room: 'Hall C-202', attendance: '84.0%', classesHeld: 25, classesAttended: 21, syllabus: 45 },
    { code: 'MCA-104', name: 'Software Engineering & Architecture', faculty: 'Prof. S. Nayak', credits: 4, room: 'Hall C-201', attendance: '92.0%', classesHeld: 25, classesAttended: 23, syllabus: 50 },
  ];

  const facultyCourses = [
    { code: 'MCA-101', name: 'Advanced Data Structures & Algorithms', batch: 'MCA 1st Year (Sec A)', students: 58, credits: 4, avgAttendance: '91.2%', syllabusCovered: 48 },
    { code: 'MCA-104', name: 'Software Engineering & System Architecture', batch: 'MCA 1st Year (Sec B)', students: 60, credits: 4, avgAttendance: '88.5%', syllabusCovered: 44 },
  ];

  const campusCirculars = [
    {
      ref: 'CUT/EXAM/2026/089',
      date: 'Oct 7, 2026',
      title: 'Autumn Term Mid-Semester Examination Schedule Notification',
      issuer: 'Controller of Examinations',
      tag: 'Academic',
      urgent: true
    },
    {
      ref: 'CUT/HOSTEL/2026/042',
      date: 'Oct 5, 2026',
      title: 'Winter Hostel Gate Timings & Digital Gate Pass Protocol',
      issuer: 'Chief Hostel Warden',
      tag: 'Residential',
      urgent: false
    },
    {
      ref: 'CUT/DSA/2026/019',
      date: 'Oct 3, 2026',
      title: 'Call for Student Registrations: Inter-College Technical Symposium TechVeda 2026',
      issuer: 'Dean of Student Affairs',
      tag: 'General',
      urgent: false
    }
  ];

  // Helper for generating realistic SVG barcode bars
  const barcodePattern = [3, 1, 2, 1, 4, 1, 1, 2, 3, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2];

  return (
    <div>
      {/* Important Statutory Notice Banner with Dismiss Cross (X) */}
      {urgentNotice && !urgentNotice.is_acknowledged && !bannerDismissed && (
        <div style={{
          marginBottom: '20px',
          padding: '16px 20px',
          borderRadius: '8px',
          background: '#FEF2F2',
          border: '1.5px solid #FCA5A5',
          boxShadow: '0 4px 14px rgba(185, 28, 28, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '280px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: '#FEE2E2',
              color: '#B91C1C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid #FCA5A5'
            }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: '#991B1B',
                  color: '#FFFFFF'
                }}>
                  Important Statutory Notice
                </span>
                <span style={{ fontSize: '11px', color: '#7F1D1D', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  [{urgentNotice.reference_circular_no || urgentNotice.notice_number}]
                </span>
              </div>
              <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#991B1B', margin: '4px 0 2px' }}>
                {urgentNotice.title}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#7F1D1D', lineHeight: 1.4 }}>
                Under Central University regulations, your mandatory formal acknowledgment is pending for this circular. Failure to submit compliance undertaking may result in semester examination hall ticket debarment.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="app-btn app-btn-danger app-btn-sm"
              onClick={() => setPopupOpen(true)}
              style={{ boxShadow: '0 2px 4px rgba(185, 28, 28, 0.2)' }}
            >
              <CheckCheck size={14} />
              <span>Review & Acknowledge</span>
            </button>
            <Link
              to="/notices"
              className="app-btn app-btn-secondary app-btn-sm"
            >
              <span>View Notice Board</span>
              <ArrowRight size={13} />
            </Link>
            <button
              type="button"
              onClick={handleDismissBanner}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#991B1B',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s ease'
              }}
              title="Dismiss banner"
              aria-label="Dismiss banner"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* 1. Institutional Masthead Header */}
      <div className="dash-masthead">
        <div>
          <div className="dash-masthead-ribbon">
            <span className="pulse-dot" />
            <span>Campus Live Gateway • Autumn Semester 2026–27 • Week 7 of 16</span>
          </div>

          <h1 className="dash-masthead-title">
            {isStudent && `Welcome back, ${profile?.full_name || user?.username}`}
            {isFaculty && `Faculty Desk — ${profile?.full_name || user?.username}`}
            {isHOD && `Departmental Command — ${profile?.full_name || user?.username}`}
            {isWarden && `Hostel Administration — ${profile?.full_name || user?.username}`}
            {isMessManager && `Dining & Kitchen Operations — ${profile?.full_name || user?.username}`}
            {isAdminOrStaff && `Institutional Operations — ${profile?.full_name || user?.username}`}
          </h1>

          <div className="dash-masthead-sub">
            {isStudent && (
              <span>
                {profile?.program_name || 'Master of Computer Applications'} • Semester {profile?.current_semester || 1} • Section {profile?.section || 'A'} • Roll No: <strong style={{ fontFamily: 'var(--font-mono)' }}>{profile?.roll_number}</strong>
              </span>
            )}
            {isFaculty && (
              <span>
                {profile?.designation} • Department of {profile?.department_name} • Cabin {profile?.cabin_location || 'C-104'}
              </span>
            )}
            {isHOD && (
              <span>
                Head of Department • Department of {profile?.department_name} • Executive Suite C-201
              </span>
            )}
            {isWarden && (
              <span>
                Chief Hostel Warden • Vindhya Hall of Residence (Hostel Block C) • Ext. 801
              </span>
            )}
            {isMessManager && (
              <span>
                Mess Manager & Catering Contractor • Central Dining Complex • FSSAI Lic. Verified
              </span>
            )}
            {isAdminOrStaff && (
              <span>
                {user?.role_label} • Central Administrative Information Technology Center
              </span>
            )}
          </div>
        </div>

        <div className="dash-masthead-actions">
          {isStudent && (
            <>
              <Link to="/gatepass" className="app-btn app-btn-secondary">
                <KeyRound size={14} style={{ color: 'var(--accent)' }} />
                <span>Outpass</span>
              </Link>
              <Link to="/mess" className="app-btn app-btn-secondary">
                <Utensils size={14} style={{ color: 'var(--primary)' }} />
                <span>Mess RSVP</span>
              </Link>
              <Link to="/academics" className="app-btn app-btn-primary">
                <BookOpen size={14} />
                <span>75% Attendance</span>
              </Link>
            </>
          )}

          {isFaculty && (
            <>
              <Link to="/academics" className="app-btn app-btn-primary">
                <BookOpen size={14} />
                <span>Timetable & Lecture Alerts</span>
              </Link>
              <Link to="/students" className="app-btn app-btn-secondary">
                <Users size={14} />
                <span>Batch Roster</span>
              </Link>
            </>
          )}

          {isHOD && (
            <>
              <Link to="/academics" className="app-btn app-btn-primary">
                <BookOpen size={14} />
                <span>Attendance Health</span>
              </Link>
              <Link to="/students" className="app-btn app-btn-secondary">
                <Users size={14} />
                <span>Department Students</span>
              </Link>
            </>
          )}

          {isWarden && (
            <>
              <Link to="/gatepass" className="app-btn app-btn-primary">
                <KeyRound size={14} />
                <span>Gatepass Census</span>
              </Link>
              <Link to="/mess-manager" className="app-btn app-btn-secondary">
                <Utensils size={14} />
                <span>Mess Operations</span>
              </Link>
            </>
          )}

          {isMessManager && (
            <>
              <Link to="/mess-manager" className="app-btn app-btn-primary">
                <Utensils size={14} />
                <span>Mess Manager Desk</span>
              </Link>
              <Link to="/mess" className="app-btn app-btn-secondary">
                <Utensils size={14} />
                <span>7-Day Menu Preview</span>
              </Link>
            </>
          )}

          {isAdminOrStaff && (
            <>
              <Link to="/adoption-migration" className="app-btn app-btn-primary">
                <Layers size={14} />
                <span>CSV Migration</span>
              </Link>
              <Link to="/audit" className="app-btn app-btn-secondary">
                <Clock size={14} />
                <span>Audit Logs</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 2. Role-Adaptive Institutional Metric Tiles */}
      <div className="dash-metrics-grid">
        {isStudent && (
          <>
            <div className="dash-metric-card accent-emerald">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Clock size={12} />
                  Attendance Standing
                </span>
                <span className="badge-tag emerald">Compliant</span>
              </div>
              <div className="dash-metric-value" style={{ color: '#166534' }}>
                89.2%
              </div>
              <div className="dash-metric-footer">
                <span>31/35 Sessions attended</span>
                <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--primary)' }}>+4 Safe Buffer</span>
              </div>
            </div>

            <div className="dash-metric-card accent-stone">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <BookOpen size={12} />
                  Curricular Load
                </span>
                <span className="badge-tag neutral">Autumn 2026</span>
              </div>
              <div className="dash-metric-value">
                16 Credits
              </div>
              <div className="dash-metric-footer">
                <span>4 Registered subjects • Sem {profile?.current_semester || 1}</span>
              </div>
            </div>

            <div className="dash-metric-card accent-amber">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Award size={12} />
                  Academic Status
                </span>
                <span className="badge-tag amber">Regular</span>
              </div>
              <div className="dash-metric-value">
                Good Standing
              </div>
              <div className="dash-metric-footer">
                <span>Zero backlogs • CGPA target 8.5+</span>
              </div>
            </div>

            <div className="dash-metric-card accent-terracotta">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Building2 size={12} />
                  Campus Housing
                </span>
                <span className="badge-tag terracotta">
                  {profile?.hostel_resident ? 'Resident' : 'Day Scholar'}
                </span>
              </div>
              <div className="dash-metric-value" style={{ fontSize: '20px' }}>
                {profile?.hostel_resident ? profile?.room_number : 'Day Scholar'}
              </div>
              <div className="dash-metric-footer">
                <span>{profile?.hostel_resident ? profile?.hostel_name : 'No Hostel Dues'}</span>
              </div>
            </div>
          </>
        )}

        {isFaculty && (
          <>
            <div className="dash-metric-card accent-emerald">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Clock size={12} />
                  Teaching Hours
                </span>
                <span className="badge-tag emerald">Active</span>
              </div>
              <div className="dash-metric-value" style={{ color: 'var(--primary)' }}>
                14 Hrs/Wk
              </div>
              <div className="dash-metric-footer">
                <span>2 Theory Courses • 1 Practical Lab</span>
              </div>
            </div>

            <div className="dash-metric-card accent-stone">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Users size={12} />
                  Mentees Enrolled
                </span>
                <span className="badge-tag neutral">MCA 2024–26</span>
              </div>
              <div className="dash-metric-value">
                118 Students
              </div>
              <div className="dash-metric-footer">
                <span>Sections A & B under mentorship</span>
              </div>
            </div>

            <div className="dash-metric-card accent-amber">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Calendar size={12} />
                  Classes Today
                </span>
                <span className="badge-tag amber">3 Sessions</span>
              </div>
              <div className="dash-metric-value">
                2 Conducted
              </div>
              <div className="dash-metric-footer">
                <span>1 Session upcoming (Hall C-201)</span>
              </div>
            </div>

            <div className="dash-metric-card accent-terracotta">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <ClipboardList size={12} />
                  Attendance Log
                </span>
                <span className="badge-tag emerald">100% On-Time</span>
              </div>
              <div className="dash-metric-value">
                Synced
              </div>
              <div className="dash-metric-footer">
                <span>All past lecture registers submitted</span>
              </div>
            </div>
          </>
        )}

        {isHOD && (
          <>
            <div className="dash-metric-card accent-emerald">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Users size={12} />
                  Department Faculty
                </span>
                <span className="badge-tag emerald">Active</span>
              </div>
              <div className="dash-metric-value" style={{ color: 'var(--primary)' }}>
                18 / 20
              </div>
              <div className="dash-metric-footer">
                <span>18 On duty • 2 Approved academic leave</span>
              </div>
            </div>

            <div className="dash-metric-card accent-stone">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <GraduationCap size={12} />
                  Department Roll
                </span>
                <span className="badge-tag neutral">CSE Dept</span>
              </div>
              <div className="dash-metric-value">
                420 Students
              </div>
              <div className="dash-metric-footer">
                <span>Across MCA & B.Tech CSE batches</span>
              </div>
            </div>

            <div className="dash-metric-card accent-amber">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <CheckCircle2 size={12} />
                  Class Conduction
                </span>
                <span className="badge-tag emerald">96.4%</span>
              </div>
              <div className="dash-metric-value">
                27 / 28
              </div>
              <div className="dash-metric-footer">
                <span>Sessions held on schedule today</span>
              </div>
            </div>

            <div className="dash-metric-card accent-terracotta">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Clock size={12} />
                  Average Attendance
                </span>
                <span className="badge-tag neutral">CSE Batches</span>
              </div>
              <div className="dash-metric-value">
                87.2%
              </div>
              <div className="dash-metric-footer">
                <span>Exceeds university standard norm</span>
              </div>
            </div>
          </>
        )}

        {isWarden && (
          <>
            <div className="dash-metric-card accent-emerald">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Building2 size={12} />
                  Hostel Inmates
                </span>
                <span className="badge-tag emerald">97.7% Present</span>
              </div>
              <div className="dash-metric-value" style={{ color: 'var(--primary)' }}>
                342 / 350
              </div>
              <div className="dash-metric-footer">
                <span>Vindhya Hall (Hostel Block C)</span>
              </div>
            </div>

            <div className="dash-metric-card accent-stone">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Calendar size={12} />
                  Active Gate Passes
                </span>
                <span className="badge-tag amber">8 Active</span>
              </div>
              <div className="dash-metric-value">
                8 Approved
              </div>
              <div className="dash-metric-footer">
                <span>4 Day passes • 4 Weekend outstation</span>
              </div>
            </div>

            <div className="dash-metric-card accent-amber">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Users size={12} />
                  Dinner Mess Headcount
                </span>
                <span className="badge-tag neutral">Reconciled</span>
              </div>
              <div className="dash-metric-value">
                334 Diners
              </div>
              <div className="dash-metric-footer">
                <span>Auto-deducted 8 outstation residents</span>
              </div>
            </div>

            <div className="dash-metric-card accent-terracotta">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <AlertCircle size={12} />
                  Maintenance Desk
                </span>
                <span className="badge-tag terracotta">3 Open</span>
              </div>
              <div className="dash-metric-value">
                3 Pending
              </div>
              <div className="dash-metric-footer">
                <span>2 Plumbing Wing B • 1 Electrical Wing A</span>
              </div>
            </div>
          </>
        )}

        {isMessManager && (
          <>
            <div className="dash-metric-card accent-emerald">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Utensils size={12} />
                  Dinner Expected Diners
                </span>
                <span className="badge-tag emerald">Headcount Live</span>
              </div>
              <div className="dash-metric-value" style={{ color: 'var(--primary)' }}>
                817 Plates
              </div>
              <div className="dash-metric-footer">
                <span>945 Enrolled • 128 Outpass/Leaves</span>
              </div>
            </div>

            <div className="dash-metric-card accent-stone">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Layers size={12} />
                  Batch Raw Material Rations
                </span>
                <span className="badge-tag neutral">Production Ready</span>
              </div>
              <div className="dash-metric-value">
                163.4 kg
              </div>
              <div className="dash-metric-footer">
                <span>Basmati Rice • 40.8 kg Dal • 98 kg Veg</span>
              </div>
            </div>

            <div className="dash-metric-card accent-amber">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Calendar size={12} />
                  Revolving Menu Cycle
                </span>
                <span className="badge-tag amber">Day 5 Active</span>
              </div>
              <div className="dash-metric-value" style={{ fontSize: '18px' }}>
                Paneer Butter
              </div>
              <div className="dash-metric-footer">
                <span>Dinner: Paneer Butter Masala, Roti, Dal Makhani</span>
              </div>
            </div>

            <div className="dash-metric-card accent-terracotta">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Award size={12} />
                  Audit & Food Safety
                </span>
                <span className="badge-tag emerald">FSSAI A+</span>
              </div>
              <div className="dash-metric-value">
                4.8 / 5.0
              </div>
              <div className="dash-metric-footer">
                <span>100% Hygiene Compliance • 142 Reviews</span>
              </div>
            </div>
          </>
        )}

        {isAdminOrStaff && (
          <>
            <div className="dash-metric-card accent-emerald">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <ShieldCheck size={12} />
                  Verified Profiles
                </span>
                <span className="badge-tag emerald">Synchronized</span>
              </div>
              <div className="dash-metric-value" style={{ color: 'var(--primary)' }}>
                1,280
              </div>
              <div className="dash-metric-footer">
                <span>Single source of truth established</span>
              </div>
            </div>

            <div className="dash-metric-card accent-stone">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Building2 size={12} />
                  Institutional Nodes
                </span>
                <span className="badge-tag neutral">Cluster</span>
              </div>
              <div className="dash-metric-value">
                18 / 18
              </div>
              <div className="dash-metric-footer">
                <span>All campus server services nominal</span>
              </div>
            </div>

            <div className="dash-metric-card accent-amber">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Tag size={12} />
                  Access Policies
                </span>
                <span className="badge-tag amber">RBAC Active</span>
              </div>
              <div className="dash-metric-value">
                8 Roles • 6 Tags
              </div>
              <div className="dash-metric-footer">
                <span>Granular institutional authorization</span>
              </div>
            </div>

            <div className="dash-metric-card accent-terracotta">
              <div className="dash-metric-header">
                <span className="dash-metric-label">
                  <Clock size={12} />
                  Audit Events Today
                </span>
                <span className="badge-tag neutral">Tamper-Proof</span>
              </div>
              <div className="dash-metric-value">
                142 Events
              </div>
              <div className="dash-metric-footer">
                <span>Recorded in institutional security log</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. Main Workspace: Asymmetric Two-Column Architecture */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.3fr', gap: '22px' }}>
        {/* Left Column: Academic Routine, Course Roster & Notices */}
        <div>
          {/* =============================================================== */}
          {/* A & B. ROLE-AWARE OPERATIONS PANELS                             */}
          {/* =============================================================== */}

          {/* 1. Academic Personas (Student, Faculty, HOD): Timetable & Course Attendance */}
          {isAcademicPersona && (
            <>
              {/* A. Timetable Timeline Panel */}
              <div className="dash-panel">
                <div className="dash-panel-header">
                  <div>
                    <h2 className="dash-panel-title">
                      {isFaculty ? "Today's Faculty Teaching Schedule" : "Today's Academic Class Timetable"}
                    </h2>
                    <div className="dash-panel-subtitle">
                      {isFaculty
                        ? "Scheduled lectures, tutorial hours, and consultation"
                        : `Registered schedule for Semester ${profile?.current_semester || 1} • Section ${profile?.section || 'A'}`}
                    </div>
                  </div>
                  <span className="badge-tag emerald">
                    <span className="pulse-dot" style={{ width: '5px', height: '5px' }} />
                    Session Active
                  </span>
                </div>

                <div className="timetable-timeline">
                  {(isFaculty ? facultySchedule : studentSchedule).map((slot, idx) => (
                    <div
                      key={idx}
                      className={`timetable-slot ${slot.status === 'Live Now' ? 'active-session' : ''}`}
                    >
                      <div className="timetable-time-box">
                        <span className="timetable-time-str">{slot.time}</span>
                        <span className="timetable-room-chip">
                          <MapPin size={11} />
                          {slot.room}
                        </span>
                      </div>

                      <div className="timetable-detail">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="course-code-badge">{slot.code}</span>
                          <span className="timetable-subject">{slot.subject}</span>
                        </div>

                        <div className="timetable-faculty">
                          {isFaculty ? `${slot.students} Students • ${slot.type}` : `${slot.faculty} • ${slot.type}`}
                        </div>
                      </div>

                      <span className={`badge-tag ${slot.status === 'Live Now' ? 'emerald' : slot.status === 'Completed' ? 'neutral' : 'amber'}`}>
                        {slot.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* B. Course Enrolment & Attendance Health */}
              <div className="dash-panel">
                <div className="dash-panel-header">
                  <div>
                    <h2 className="dash-panel-title">
                      {isFaculty ? "Assigned Courses & Batch Overview" : "Registered Academic Curriculum & Attendance Pulse"}
                    </h2>
                    <div className="dash-panel-subtitle">
                      {isFaculty
                        ? "Continuous assessment tracking and syllabus progress"
                        : "Individual course attendance metrics and statutory 75% norm check"}
                    </div>
                  </div>
                  <span className="badge-tag neutral">Autumn Term 2026</span>
                </div>

                <div className="course-roster-list">
                  {isFaculty ? (
                    facultyCourses.map((c) => (
                      <div key={c.code} className="course-roster-card">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="course-code-badge">{c.code}</span>
                            <span className="course-name-text">{c.name}</span>
                          </div>
                          <div className="course-meta-text">
                            {c.batch} • {c.students} Students • {c.credits} Credits
                          </div>
                        </div>

                        <div className="attendance-meter">
                          <div className="attendance-pct-text" style={{ color: '#166534' }}>
                            {c.avgAttendance} Avg.
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Syllabus: {c.syllabusCovered}%
                          </div>
                          <div className="attendance-track">
                            <div
                              className="attendance-fill"
                              style={{ width: `${c.syllabusCovered}%`, background: 'var(--primary)' }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    studentCourses.map((c) => (
                      <div key={c.code} className="course-roster-card">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="course-code-badge">{c.code}</span>
                            <span className="course-name-text">{c.name}</span>
                          </div>
                          <div className="course-meta-text">
                            {c.faculty} • {c.room} • {c.credits} Credits • {c.classesAttended}/{c.classesHeld} Sessions
                          </div>
                        </div>

                        <div className="attendance-meter">
                          <div
                            className="attendance-pct-text"
                            style={{ color: parseFloat(c.attendance) >= 85 ? '#166534' : '#b45309' }}
                          >
                            {c.attendance}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            Attendance Rate
                          </div>
                          <div className="attendance-track">
                            <div
                              className="attendance-fill"
                              style={{
                                width: c.attendance,
                                background: parseFloat(c.attendance) >= 85 ? '#166534' : '#d97706'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* 2. Mess Manager: Dining Hall Operations & Kitchen Headcount Dispatch */}
          {isMessManager && (
            <>
              <div className="dash-panel">
                <div className="dash-panel-header">
                  <div>
                    <h2 className="dash-panel-title">Dining Hall & Kitchen Production Dispatch</h2>
                    <div className="dash-panel-subtitle">Live plate targets computed from verified student RSVPs and gatepass records</div>
                  </div>
                  <span className="badge-tag emerald">Active: Dinner Session</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', background: 'var(--surface-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Registered Diners</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>850 Boarders</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Hostel residents</div>
                  </div>
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', background: 'var(--accent-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent)' }}>Opted Out (Skip)</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)', marginTop: '2px' }}>-48 Diners</div>
                    <div style={{ fontSize: '10px', color: 'var(--accent)' }}>RSVP logged before 05:00 PM</div>
                  </div>
                  <div style={{ border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-md)', padding: '12px', background: 'var(--primary-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--primary)' }}>Target Plates to Cook</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>817 Plates</div>
                    <div style={{ fontSize: '10px', color: 'var(--primary)' }}>Includes +15 buffer</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>Tonight's Menu: Paneer Butter Masala, Jeera Rice, Tawa Roti, Gulab Jamun</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Estimated food waste diverted: 18.2 kg • Procurement savings: ₹3,120</div>
                  </div>
                  <Link to="/mess-manager" className="app-btn app-btn-primary app-btn-sm" style={{ textDecoration: 'none' }}>
                    <span>Manage Menu & Roster</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              <div className="dash-panel">
                <div className="dash-panel-header">
                  <div>
                    <h2 className="dash-panel-title">Kitchen Batch Raw Material Rations Guide</h2>
                    <div className="dash-panel-subtitle">Calculated strictly for verified 817 diners (eliminating surplus food dumping)</div>
                  </div>
                  <span className="badge-tag neutral">FSSAI Batch Standard</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { item: 'Basmati / Sona Masoori Rice', ration: '120g/plate', total: '98.0 kg', status: 'Dispatched to Boiler' },
                    { item: 'Whole Wheat Atta (Tawa Roti)', ration: '90g (3 Rotis)', total: '73.5 kg', status: 'In Kneading Machine' },
                    { item: 'Toor Dal / Pulses (Raw)', ration: '45g/plate', total: '36.8 kg', status: 'Steam Kettle Boiling' },
                    { item: 'Fresh Paneer & Seasonal Veg', ration: '160g/plate', total: '130.7 kg', status: 'Gravy Preparation' }
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{r.item}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.ration}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>{r.total}</div>
                        <span className="badge-tag emerald" style={{ fontSize: '10px' }}>{r.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 3. Hostel Warden: Boarder Census & Curfew Security Oversight */}
          {isWarden && (
            <>
              <div className="dash-panel">
                <div className="dash-panel-header">
                  <div>
                    <h2 className="dash-panel-title">Hostel Residency & Curfew Compliance Desk</h2>
                    <div className="dash-panel-subtitle">Live boarder headcounts, curfew tracking, and outpass approvals</div>
                  </div>
                  <span className="badge-tag emerald">Hostel Block C (Vindhya)</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', background: 'var(--surface-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Inside Perimeter</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px', color: 'var(--primary)' }}>342 Boarders</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>97.7% Present in rooms</div>
                  </div>
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', background: 'var(--accent-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent)' }}>Outside on Outpass</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)', marginTop: '2px' }}>8 Students</div>
                    <div style={{ fontSize: '10px', color: 'var(--accent)' }}>Authorized by Warden</div>
                  </div>
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', background: 'var(--surface-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Curfew Defaulters</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px', color: 'var(--primary)' }}>0 Defaulters</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Zero breaches today</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>2 Gatepass Applications Pending Warden Endorsement</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Parental verification and emergency outstation requests</div>
                  </div>
                  <Link to="/gatepass" className="app-btn app-btn-primary app-btn-sm" style={{ textDecoration: 'none' }}>
                    <span>Review Gatepasses</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              <div className="dash-panel">
                <div className="dash-panel-header">
                  <div>
                    <h2 className="dash-panel-title">Hostel Wing Roll-Call & Night Inspection Status</h2>
                    <div className="dash-panel-subtitle">Evening biometric & room muster roll completion</div>
                  </div>
                  <span className="badge-tag emerald">100% Synced</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { wing: 'Wing A (Ground & 1st Floor)', residents: '114 Residents', check: '114 Present • 0 On Leave', status: 'Completed' },
                    { wing: 'Wing B (2nd & 3rd Floor)', residents: '118 Residents', check: '115 Present • 3 Outstation', status: 'Completed' },
                    { wing: 'Wing C (4th Floor)', residents: '118 Residents', check: '113 Present • 5 Outpass', status: 'Completed' }
                  ].map((w, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{w.wing}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{w.residents} • {w.check}</div>
                      </div>
                      <span className="badge-tag emerald" style={{ fontSize: '11px' }}>{w.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 4. Administrative Staff & System Admin: Records & Digital Services Desk */}
          {isAdminOrStaff && (
            <>
              <div className="dash-panel">
                <div className="dash-panel-header">
                  <div>
                    <h2 className="dash-panel-title">Institutional Records & Digital Services Queue</h2>
                    <div className="dash-panel-subtitle">Central registry service applications and smart form submissions</div>
                  </div>
                  <span className="badge-tag emerald">Service Desk Live</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', background: 'var(--surface-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verified Student Profiles</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px', color: 'var(--primary)' }}>1,280</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Fill Once, Use Everywhere</div>
                  </div>
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', background: 'var(--accent-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent)' }}>Certificate Requests</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)', marginTop: '2px' }}>4 Pending</div>
                    <div style={{ fontSize: '10px', color: 'var(--accent)' }}>Bonafide & Migration tokens</div>
                  </div>
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', background: 'var(--surface-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Smart Forms Submissions</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>187 Forms</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Automated CSV reconciliations</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>Digital Certificate Pickup Passes Generated</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Dynamic verification tokens active for window counter dispatch</div>
                  </div>
                  <Link to="/services" className="app-btn app-btn-primary app-btn-sm" style={{ textDecoration: 'none' }}>
                    <span>Open Services Desk</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              <div className="dash-panel">
                <div className="dash-panel-header">
                  <div>
                    <h2 className="dash-panel-title">Campus Single Source of Truth & Regulatory Ledger</h2>
                    <div className="dash-panel-subtitle">Audited data integrity across university academic departments</div>
                  </div>
                  <span className="badge-tag neutral">Tamper-Proof</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { dept: 'Department of Computer Science & Engineering', sync: '420 Profiles • 100% Synced', status: 'Verified' },
                    { dept: 'Department of Electronics & Communication', sync: '380 Profiles • 100% Synced', status: 'Verified' },
                    { dept: 'Department of Electrical Engineering', sync: '290 Profiles • 100% Synced', status: 'Verified' },
                    { dept: 'Department of Mechanical Engineering', sync: '190 Profiles • 100% Synced', status: 'Verified' }
                  ].map((d, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{d.dept}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.sync}</div>
                      </div>
                      <span className="badge-tag emerald" style={{ fontSize: '11px' }}>{d.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* C. Official Institutional Notice Board */}
          <div className="dash-panel">
            <div className="dash-panel-header">
              <div>
                <h2 className="dash-panel-title">Campus Announcements & Official Circulars</h2>
                <div className="dash-panel-subtitle">
                  Authorized notices dispatched from University Administration
                </div>
              </div>
              <span className="badge-tag terracotta">Official Feed</span>
            </div>

            <div className="circular-list">
              {campusCirculars.map((circ, idx) => (
                <div key={idx} className="circular-card">
                  <div className="circular-meta-top">
                    <span className="circular-ref-code">{circ.ref}</span>
                    <span className={`badge-tag ${circ.urgent ? 'terracotta' : 'neutral'}`}>
                      {circ.tag}
                    </span>
                  </div>

                  <div className="circular-title">{circ.title}</div>

                  <div className="circular-footer">
                    <span>Issued by {circ.issuer}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{circ.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Digital Pass, CR Desk, and Services Launchpad */}
        <div>
          {/* A. Class Representative (CR) Desk (Shown if user has CR tag, e.g. Priya Patel) */}
          {isCR && (
            <div className="cr-coordination-deck">
              <div className="cr-deck-header">
                <Tag size={15} />
                <span>Class Representative Desk — Section {profile?.section || '1A'}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                You hold verified student coordination privileges for MCA Batch 2024–26. You can broadcast class notices, coordinate peer feedback, and initiate batch polls.
              </p>

              <div className="cr-deck-actions">
                <button className="app-btn app-btn-secondary" style={{ fontSize: '12px' }}>
                  <Send size={13} />
                  <span>Class Notice</span>
                </button>
                <Link to="/forms" className="app-btn app-btn-secondary" style={{ fontSize: '12px' }}>
                  <FileSpreadsheet size={13} />
                  <span>Smart Forms & Polls</span>
                </Link>
              </div>
            </div>
          )}

          {/* B. Prestige University Digital Smart Pass */}
          <div id="id-card" className="prestige-id-pass">
            <div className="id-pass-top-band">
              <div className="id-pass-institution">CENTRAL UNIVERSITY OF TECHNOLOGY</div>
              <div className="id-pass-subtag">INSTITUTION OF EMINENCE • DIGITAL SMART PASS</div>

              <div className="id-pass-seal-watermark">
                CUT
              </div>
            </div>

            <div className="id-pass-main-grid">
              <div className="id-pass-portrait-frame">
                <GraduationCap size={36} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px' }}>
                  {isStudent ? 'STUDENT' : 'FACULTY'}
                </span>
                <span className="id-pass-verified-seal">VERIFIED</span>
              </div>

              <div className="id-pass-info-block">
                <div className="id-pass-name">
                  {profile?.full_name || user?.username}
                </div>
                <div className="id-pass-role-title">
                  {isStudent ? (profile?.program_name || 'Master of Computer Applications') : profile?.designation}
                </div>

                <div className="id-pass-field-grid">
                  <div>
                    <div className="id-pass-field-label">{isStudent ? 'Roll Number' : 'Employee ID'}</div>
                    <div className="id-pass-field-value">{isStudent ? profile?.roll_number : profile?.employee_code}</div>
                  </div>
                  <div>
                    <div className="id-pass-field-label">Registration No</div>
                    <div className="id-pass-field-value">{isStudent ? (profile?.registration_number || 'REG-2024') : 'REG-STAFF'}</div>
                  </div>
                  <div>
                    <div className="id-pass-field-label">{isStudent ? 'Batch & Section' : 'Department'}</div>
                    <div className="id-pass-field-value">
                      {isStudent ? `Sem ${profile?.current_semester || 1} • Sec ${profile?.section || 'A'}` : profile?.department_name}
                    </div>
                  </div>
                  <div>
                    <div className="id-pass-field-label">Blood Group</div>
                    <div className="id-pass-field-value">{profile?.blood_group || 'B+'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="id-pass-security-footer">
              <div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {isStudent ? 'Campus Residence' : 'Faculty Cabin'}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {isStudent
                    ? (profile?.hostel_resident ? `${profile?.hostel_name} (${profile?.room_number})` : 'Day Scholar')
                    : (profile?.cabin_location || 'Admin Wing C-104')}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div className="barcode-svg-container">
                  {barcodePattern.map((width, i) => (
                    <div
                      key={i}
                      className="barcode-bar"
                      style={{ width: `${width}px` }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '2px' }}>
                  CUT-{isStudent ? profile?.roll_number : profile?.employee_code}-VRF
                </div>
              </div>
            </div>
          </div>

          {/* C. Role-Aware Operations Hub & Request Launchpad */}
          {isMessManager && (
            <div className="dash-panel" style={{ marginTop: '22px' }}>
              <div className="dash-panel-header">
                <div>
                  <h2 className="dash-panel-title">Mess & Dining Operations Desk</h2>
                  <div className="dash-panel-subtitle">Contractor catering and kitchen management workflows</div>
                </div>
                <span className="badge-tag emerald">Staff Console</span>
              </div>

              <div className="service-hub-list">
                <Link to="/mess-manager" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Weekly Revolving Menu Editor</div>
                      <div className="service-hub-sla">Edit dishes, dietary tags & cutoff timings • 7 Days</div>
                    </div>
                    <span className="badge-tag emerald" style={{ fontSize: '10px' }}>Manage Menu</span>
                  </div>
                </Link>

                <Link to="/mess-manager" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Kitchen Production & Batch Rations</div>
                      <div className="service-hub-sla">Headcounts calculated: 817 Plates • Zero food waste</div>
                    </div>
                    <span className="badge-tag neutral" style={{ fontSize: '10px' }}>Calculate</span>
                  </div>
                </Link>

                <Link to="/mess-manager" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Boarders Dining RSVP Roster</div>
                      <div className="service-hub-sla">Audit attending diners vs skipped opt-outs</div>
                    </div>
                    <span className="badge-tag neutral" style={{ fontSize: '10px' }}>Audit Roster</span>
                  </div>
                </Link>

                <Link to="/mess-manager" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Food Hygiene & Taste Review Ledger</div>
                      <div className="service-hub-sla">Student star ratings & dining grievances feedback</div>
                    </div>
                    <span className="badge-tag neutral" style={{ fontSize: '10px' }}>Reviews</span>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {isWarden && (
            <div className="dash-panel" style={{ marginTop: '22px' }}>
              <div className="dash-panel-header">
                <div>
                  <h2 className="dash-panel-title">Hostel & Security Clearance Desk</h2>
                  <div className="dash-panel-subtitle">Warden administrative clearance & perimeter security</div>
                </div>
                <span className="badge-tag emerald">Warden Console</span>
              </div>

              <div className="service-hub-list">
                <Link to="/gatepass" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Gatepass Approvals & Curfew Queue</div>
                      <div className="service-hub-sla">Emergency & weekend outpass verification</div>
                    </div>
                    <span className="badge-tag terracotta" style={{ fontSize: '10px' }}>Review Passes</span>
                  </div>
                </Link>

                <Link to="/gatepass" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Perimeter Population & Census</div>
                      <div className="service-hub-sla">Live headcount of students inside vs departed</div>
                    </div>
                    <span className="badge-tag emerald" style={{ fontSize: '10px' }}>View Census</span>
                  </div>
                </Link>

                <Link to="/mess-manager" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Dining Headcount Reconciliation</div>
                      <div className="service-hub-sla">Cross-verify outstation leaves with mess rebates</div>
                    </div>
                    <span className="badge-tag neutral" style={{ fontSize: '10px' }}>Audit Meals</span>
                  </div>
                </Link>

                <Link to="/grievances" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Hostel Maintenance & Repair Desk</div>
                      <div className="service-hub-sla">Plumbing, electrical & wing maintenance tickets</div>
                    </div>
                    <span className="badge-tag neutral" style={{ fontSize: '10px' }}>Maintenance</span>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {isAdminOrStaff && !isMessManager && !isWarden && (
            <div className="dash-panel" style={{ marginTop: '22px' }}>
              <div className="dash-panel-header">
                <div>
                  <h2 className="dash-panel-title">Institutional Services & Registry Console</h2>
                  <div className="dash-panel-subtitle">Official administrative dispatch and student processing</div>
                </div>
                <span className="badge-tag emerald">Registry Desk</span>
              </div>

              <div className="service-hub-list">
                <Link to="/services" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Process Digital Certificate Requests</div>
                      <div className="service-hub-sla">Bonafide, migration & character certificates queue</div>
                    </div>
                    <span className="badge-tag emerald" style={{ fontSize: '10px' }}>Issue Passes</span>
                  </div>
                </Link>

                <Link to="/students" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Student Directory & Identity Audit</div>
                      <div className="service-hub-sla">Verified profile single source of truth ledger</div>
                    </div>
                    <span className="badge-tag neutral" style={{ fontSize: '10px' }}>Inspect</span>
                  </div>
                </Link>

                <Link to="/forms" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Smart Forms Submissions & CSV Export</div>
                      <div className="service-hub-sla">Survey and institutional intake data reconciliations</div>
                    </div>
                    <span className="badge-tag neutral" style={{ fontSize: '10px' }}>Export CSV</span>
                  </div>
                </Link>

                <Link to="/notices" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Publish Official Circular / Notice</div>
                      <div className="service-hub-sla">Broadcast compliance and administrative circulars</div>
                    </div>
                    <span className="badge-tag neutral" style={{ fontSize: '10px' }}>Broadcast</span>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {isFaculty && (
            <div className="dash-panel" style={{ marginTop: '22px' }}>
              <div className="dash-panel-header">
                <div>
                  <h2 className="dash-panel-title">Faculty Teaching & Academic Desk</h2>
                  <div className="dash-panel-subtitle">Course management and student mentorship</div>
                </div>
                <span className="badge-tag emerald">Faculty Console</span>
              </div>

              <div className="service-hub-list">
                <Link to="/academics" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Broadcast Lecture Status Alert</div>
                      <div className="service-hub-sla">Room relocation & cancellation notifications</div>
                    </div>
                    <span className="badge-tag terracotta" style={{ fontSize: '10px' }}>Broadcast</span>
                  </div>
                </Link>

                <Link to="/academics" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Course Timetable & Syllabus Roster</div>
                      <div className="service-hub-sla">Syllabus progression & continuous assessment</div>
                    </div>
                    <span className="badge-tag emerald" style={{ fontSize: '10px' }}>Review</span>
                  </div>
                </Link>

                <Link to="/students" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Batch Mentorship Directory</div>
                      <div className="service-hub-sla">View assigned student profiles & academic standing</div>
                    </div>
                    <span className="badge-tag neutral" style={{ fontSize: '10px' }}>Inspect</span>
                  </div>
                </Link>

                <Link to="/forms" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Create Academic Smart Form / Quiz</div>
                      <div className="service-hub-sla">Course evaluation & assignment collection</div>
                    </div>
                    <span className="badge-tag neutral" style={{ fontSize: '10px' }}>Design Form</span>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {isStudent && (
            <div className="dash-panel" style={{ marginTop: '22px' }}>
              <div className="dash-panel-header">
                <div>
                  <h2 className="dash-panel-title">Campus Services & Request Desk</h2>
                  <div className="dash-panel-subtitle">Official university service counters</div>
                </div>
                <span className="badge-tag emerald">Self-Service</span>
              </div>

              <div className="service-hub-list">
                <Link to="/services" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Bonafide Certificate Request</div>
                      <div className="service-hub-sla">Automated institutional verification • SLA: 24h</div>
                    </div>
                    <span className="badge-tag neutral" style={{ fontSize: '10px' }}>Apply</span>
                  </div>
                </Link>

                <Link to="/gatepass" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Hostel Leave & Digital Gate Pass</div>
                      <div className="service-hub-sla">Warden electronic clearance • Instant Pass</div>
                    </div>
                    <span className="badge-tag neutral" style={{ fontSize: '10px' }}>Apply</span>
                  </div>
                </Link>

                <Link to="/exams" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Examination Hall Ticket / Admit Card</div>
                      <div className="service-hub-sla">Autumn Mid-Term 2026 • Verified eligibility</div>
                    </div>
                    <span className="badge-tag neutral" style={{ fontSize: '10px' }}>Check</span>
                  </div>
                </Link>

                <Link to="/grievances" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="service-hub-item">
                    <div>
                      <div className="service-hub-label">Facility & Hostel Grievance Desk</div>
                      <div className="service-hub-sla">Maintenance ticketing & routing • SLA: 48h</div>
                    </div>
                    <span className="badge-tag neutral" style={{ fontSize: '10px' }}>Log Issue</span>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* D. Role-Specific Assurance / Compliance Pledge */}
          {isMessManager ? (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderLeft: '4px solid var(--primary)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 750, fontSize: '13px' }}>
                <ShieldCheck size={16} />
                <span>FSSAI Food Safety & Catering Contractor Compliance</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                Central Dining Complex license verified. Daily cooking batch preparation counts and boarder meal rebate deductions are cryptographically audited against biometric gate logs.
              </p>
            </div>
          ) : isWarden ? (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderLeft: '4px solid var(--primary)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 750, fontSize: '13px' }}>
                <ShieldCheck size={16} />
                <span>Hostel Warden Perimeter Authorization</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                Institutional residential perimeter security active. Electronic gatepasses require formal warden clearance before physical security turnstile release.
              </p>
            </div>
          ) : (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderLeft: '4px solid var(--primary)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 750, fontSize: '13px' }}>
                <ShieldCheck size={16} />
                <span>Institutional Identity Assurance</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                Your profile is verified by the Central Registrar. Identity fields are automatically inherited and cryptographically locked across official forms, examinations, and certificate requests.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Important Notice Review & Direct Acknowledgment Popup Modal */}
      {popupOpen && urgentNotice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '20px',
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '10px',
            maxWidth: '640px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
            border: '1.5px solid #FCA5A5'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 22px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#FEF2F2'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={20} style={{ color: '#B91C1C' }} />
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#991B1B' }}>
                    Important Institutional Directive Notice
                  </h3>
                  <span style={{ fontSize: '11px', color: '#7F1D1D', fontFamily: 'var(--font-mono)' }}>
                    {urgentNotice.reference_circular_no || urgentNotice.notice_number}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPopupOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#991B1B',
                  padding: '4px',
                  borderRadius: '4px'
                }}
                aria-label="Close popup"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px 26px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {urgentNotice.title}
                </h4>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Promulgated by {urgentNotice.author_full_name || 'Central Administration'} ({urgentNotice.author_designation || 'Directorate'})
                </div>
              </div>

              {/* Warning box */}
              <div style={{
                padding: '12px 16px',
                borderRadius: '6px',
                background: '#FEF2F2',
                borderLeft: '4px solid #B91C1C',
                fontSize: '12.5px',
                color: '#7F1D1D',
                lineHeight: 1.5
              }}>
                <strong>Mandatory Undertaking:</strong> All students in this cohort are required to confirm receipt and compliance. Your digital signature and timestamp are audited permanently.
              </div>

              {/* Notice Body */}
              <div style={{
                background: 'var(--canvas)',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                fontSize: '13px',
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                maxHeight: '220px',
                overflowY: 'auto',
                whiteSpace: 'pre-line'
              }}>
                {urgentNotice.content}
              </div>

              {/* Direct 1-Click Acknowledge Button */}
              <button
                type="button"
                className="app-btn app-btn-danger app-btn-lg"
                onClick={handleDashboardAcknowledge}
                disabled={acknowledging}
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                <CheckCheck size={16} />
                <span>{acknowledging ? 'Registering Formal Undertaking...' : 'I Acknowledge & Understand This Directive'}</span>
              </button>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 24px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--canvas)'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                Authenticated institutional compliance portal
              </span>
              <button
                type="button"
                className="app-btn app-btn-secondary app-btn-xs"
                onClick={() => setPopupOpen(false)}
              >
                Close (Review Later)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
