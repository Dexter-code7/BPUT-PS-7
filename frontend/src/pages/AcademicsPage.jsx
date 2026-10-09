import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';
import { formatTimeRange12, formatDateTime12 } from '../utils/dateUtils';
import {
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  MapPin,
  User,
  ShieldCheck,
  RefreshCw,
  Bell,
  Utensils,
  KeyRound,
  FileText,
  Award,
  Plus,
  Check,
  X,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Layers,
  Activity,
  Zap,
  AlertCircle,
  FileCheck2,
  Users,
  Lock,
  Unlock,
  History,
  UserCheck,
  ClipboardCheck
} from 'lucide-react';

export default function AcademicsPage() {
  const { user, showToast } = useAuth();
  const { t } = useAccessibility();

  const isStudent = user?.role_name === 'student';
  const isFaculty = user?.role_name === 'teacher' || user?.role_name === 'hod';
  const isHOD = user?.role_name === 'hod';
  const isAdmin = ['system_admin', 'director', 'exam_admin', 'admin_staff'].includes(user?.role_name);
  const isNonAcademicStaff = ['warden', 'mess_manager', 'club_coordinator'].includes(user?.role_name);
  const canReviewLeaves = ['teacher', 'hod', 'system_admin', 'director', 'exam_admin', 'admin_staff'].includes(user?.role_name);
  const canBroadcast = ['teacher', 'hod', 'system_admin', 'director'].includes(user?.role_name);
  const canMarkRollCall = ['teacher', 'hod', 'system_admin', 'director'].includes(user?.role_name);

  // Tab State
  const [activeTab, setActiveTab] = useState(
    ['teacher', 'hod'].includes(user?.role_name) ? 'roll_call' : 'calendar'
  ); // 'calendar' | 'attendance' | 'duty_leaves' | 'timetable' | 'roll_call'

  // Digital Roll Call Register State (Paper & Pen mode)
  const [rollCallSubject, setRollCallSubject] = useState('CS-601');
  const [rollCallDate, setRollCallDate] = useState('2026-10-09');
  const [rollCallSemester, setRollCallSemester] = useState(6);
  const [rollCallSection, setRollCallSection] = useState('A');
  const [rollCallSlotTime, setRollCallSlotTime] = useState('09:00 AM - 10:00 AM');
  const [rollCallNotes, setRollCallNotes] = useState('');
  const [rollCallData, setRollCallData] = useState(null);
  const [rollCallRoster, setRollCallRoster] = useState([]);
  const [isLoadingRollCall, setIsLoadingRollCall] = useState(false);
  const [isSubmittingRollCall, setIsSubmittingRollCall] = useState(false);

  // HOD Faculty Subject Allocation Modal State
  const [hodModalOpen, setHodModalOpen] = useState(false);
  const [allocationsData, setAllocationsData] = useState(null);
  const [isSavingAllocation, setIsSavingAllocation] = useState(false);

  // Attendance History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historySessions, setHistorySessions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Academic Calendar State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 9)); // October 2026
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('2026-10-09');
  const [calendarData, setCalendarData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [timetableByDay, setTimetableByDay] = useState({});
  const [dutyLeaves, setDutyLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Leave Filter
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all');

  // Modal States
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeaveForReview, setSelectedLeaveForReview] = useState(null);
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);

  // Broadcast lecture change modal state
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [broadcastStatus, setBroadcastStatus] = useState('cancelled');
  const [broadcastNote, setBroadcastNote] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Form States
  const [applyForm, setApplyForm] = useState({
    leave_type: 'hackathon',
    title: '',
    organization_or_hospital: '',
    start_date: '2026-10-12',
    end_date: '2026-10-14',
    reason: '',
    proof_document: ''
  });
  const [applyingLeave, setApplyingLeave] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    action: 'approved',
    reviewer_remarks: '',
    lecture_credits_granted: 12
  });
  const [reviewingLeave, setReviewingLeave] = useState(false);

  const [eventForm, setEventForm] = useState({
    event_title: '',
    event_type: 'holiday',
    start_date: '2026-10-15',
    end_date: '2026-10-15',
    description: '',
    is_holiday: true
  });
  const [creatingEvent, setCreatingEvent] = useState(false);

  const [selectedTimetableDay, setSelectedTimetableDay] = useState(() => {
    const d = new Date().getDay();
    const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return map[d] === 'sunday' ? 'monday' : map[d];
  });

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const [calRes, attRes, ttRes, leaveRes] = await Promise.all([
        api.getAcademicCalendar({ month: monthStr }),
        api.getAttendance(),
        api.getTimetable(),
        api.getDutyLeaves({ status: leaveStatusFilter !== 'all' ? leaveStatusFilter : undefined })
      ]);

      if (calRes?.data) {
        setCalendarData(calRes.data);
        if (calRes.data.timetable_by_day) {
          setTimetableByDay(calRes.data.timetable_by_day);
        }
      }
      if (attRes?.data) {
        setAttendanceData(attRes.data);
      }
      if (ttRes?.data?.slots) {
        setTimetableSlots(ttRes.data.slots);
      }
      if (leaveRes?.data?.leaves) {
        setDutyLeaves(leaveRes.data.leaves);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load academic and calendar records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [leaveStatusFilter, currentDate]);

  const loadRollCall = async (subject = rollCallSubject, date = rollCallDate, sem = rollCallSemester, sec = rollCallSection) => {
    if (!canMarkRollCall) return;
    setIsLoadingRollCall(true);
    try {
      const res = await api.getAttendanceRoster({
        subject_code: subject,
        date: date,
        semester: sem,
        section: sec,
        slot_time: rollCallSlotTime
      });
      if (res?.data) {
        setRollCallData(res.data);
        setRollCallRoster(res.data.roster || []);
        if (res.data.subject_code && res.data.subject_code !== rollCallSubject) {
          setRollCallSubject(res.data.subject_code);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to load roll call roster', 'error');
    } finally {
      setIsLoadingRollCall(false);
    }
  };

  useEffect(() => {
    if (canMarkRollCall && activeTab === 'roll_call') {
      loadRollCall(rollCallSubject, rollCallDate, rollCallSemester, rollCallSection);
    }
  }, [activeTab, rollCallSubject, rollCallDate, rollCallSemester, rollCallSection]);

  const toggleStudentStatus = (studentId, targetStatus) => {
    setRollCallRoster(prev => prev.map(student => {
      if (student.student_id !== studentId) return student;
      return {
        ...student,
        status: targetStatus
      };
    }));
  };

  const markAllStudents = (status) => {
    setRollCallRoster(prev => prev.map(student => {
      if (student.has_approved_leave) return student;
      return {
        ...student,
        status: status
      };
    }));
  };

  const handleRemarkChange = (studentId, text) => {
    setRollCallRoster(prev => prev.map(student => {
      if (student.student_id !== studentId) return student;
      return { ...student, remarks: text };
    }));
  };

  const handleSubmitAttendance = async () => {
    if (!rollCallRoster || rollCallRoster.length === 0) return;
    setIsSubmittingRollCall(true);
    try {
      const payload = {
        subject_code: rollCallSubject,
        subject_name: rollCallData?.subject_name || rollCallSubject,
        semester: rollCallSemester,
        section: rollCallSection,
        attendance_date: rollCallDate,
        slot_time: rollCallSlotTime,
        notes: rollCallNotes,
        entries: rollCallRoster.map(s => ({
          student_id: s.student_id,
          roll_number: s.roll_number,
          student_name: s.full_name,
          status: s.status,
          od_leave_id: s.approved_leave_id,
          od_type: s.approved_leave_type,
          od_title: s.approved_leave_title,
          remarks: s.remarks
        }))
      };
      const res = await api.submitAttendanceRoster(payload);
      if (res.success) {
        showToast(res.data.message || `Attendance register sealed for ${rollCallSubject}`);
        await loadRollCall();
        await loadAllData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to seal attendance register', 'error');
    } finally {
      setIsSubmittingRollCall(false);
    }
  };

  const loadHODAllocations = async () => {
    try {
      const res = await api.getSubjectAllocations();
      if (res?.data) {
        setAllocationsData(res.data);
        setHodModalOpen(true);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load subject allocations', 'error');
    }
  };

  const handleAssignFaculty = async (subjectCode, facultyUserId) => {
    setIsSavingAllocation(true);
    try {
      const res = await api.assignFacultySubject({
        subject_code: subjectCode,
        semester: rollCallSemester,
        section: rollCallSection,
        faculty_user_id: facultyUserId
      });
      if (res.success) {
        showToast(res.data.message || `Faculty assigned to ${subjectCode}`);
        const updated = await api.getSubjectAllocations();
        if (updated?.data) setAllocationsData(updated.data);
        await loadRollCall();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update faculty assignment', 'error');
    } finally {
      setIsSavingAllocation(false);
    }
  };

  const loadAttendanceHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await api.getAttendanceHistory({ subject_code: rollCallSubject });
      if (res?.data) {
        setHistorySessions(res.data.sessions || []);
        setHistoryModalOpen(true);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load attendance history', 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Calendar navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate calendar days for current month
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfWeek = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // 0 = Monday, 6 = Sunday
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfWeek(year, month);

  // Helper: check if date falls in range
  const isDateInRange = (dateStr, startStr, endStr) => {
    const d = new Date(dateStr);
    const s = new Date(startStr);
    const e = new Date(endStr);
    return d >= s && d <= e;
  };

  // Find events for date
  const getEventsForDate = (dateStr) => {
    if (!calendarData?.events) return [];
    return calendarData.events.filter(e => isDateInRange(dateStr, e.start_date, e.end_date));
  };

  // Find duty leaves for date
  const getDutyLeavesForDate = (dateStr) => {
    const leavesList = calendarData?.duty_leaves || dutyLeaves || [];
    return leavesList.filter(l => l.status === 'approved' && isDateInRange(dateStr, l.start_date, l.end_date));
  };

  // Broadcast lecture handler
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setIsBroadcasting(true);
    try {
      await api.updateTimetableSlot({
        slot_id: selectedSlot.id,
        status: broadcastStatus,
        notice_note: broadcastNote
      });
      showToast('Timetable schedule broadcast promulgated successfully.');
      setSelectedSlot(null);
      setBroadcastNote('');
      await loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to broadcast update');
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Student applies for OD / Medical Leave
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setApplyingLeave(true);
    try {
      const res = await api.applyDutyLeave(applyForm);
      if (res.success) {
        showToast(res.data.message || 'On-Duty leave application submitted successfully.');
        setApplyModalOpen(false);
        setApplyForm({
          leave_type: 'hackathon',
          title: '',
          organization_or_hospital: '',
          start_date: '2026-10-12',
          end_date: '2026-10-14',
          reason: '',
          proof_document: ''
        });
        await loadAllData();
      }
    } catch (err) {
      showToast('Application submission failed: ' + err.message, 'error');
    } finally {
      setApplyingLeave(false);
    }
  };

  // HOD / Faculty reviews duty leave
  const handleReviewLeave = async (e) => {
    e.preventDefault();
    if (!selectedLeaveForReview) return;
    setReviewingLeave(true);
    try {
      const res = await api.reviewDutyLeave({
        leave_id: selectedLeaveForReview.id,
        action: reviewForm.action,
        reviewer_remarks: reviewForm.reviewer_remarks,
        lecture_credits_granted: parseInt(reviewForm.lecture_credits_granted, 10)
      });
      if (res.success) {
        showToast(res.data.message || 'On-Duty leave reviewed successfully.');
        setReviewModalOpen(false);
        setSelectedLeaveForReview(null);
        await loadAllData();
      }
    } catch (err) {
      showToast('Review failed: ' + err.message, 'error');
    } finally {
      setReviewingLeave(false);
    }
  };

  // Admin creates academic calendar event / holiday
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreatingEvent(true);
    try {
      const res = await api.createCalendarEvent(eventForm);
      if (res.success) {
        showToast(res.data.message || 'Academic calendar event recorded.');
        setCreateEventModalOpen(false);
        setEventForm({
          event_title: '',
          event_type: 'holiday',
          start_date: '2026-10-15',
          end_date: '2026-10-15',
          description: '',
          is_holiday: true
        });
        await loadAllData();
      }
    } catch (err) {
      showToast('Failed to create calendar event: ' + err.message, 'error');
    } finally {
      setCreatingEvent(false);
    }
  };

  // Day inspector resolution
  const selectedDateEvents = getEventsForDate(selectedCalendarDate);
  const selectedDateDutyLeaves = getDutyLeavesForDate(selectedCalendarDate);
  const selectedDateObj = new Date(selectedCalendarDate);
  const dayNameMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const selectedDayOfWeek = dayNameMap[selectedDateObj.getDay()];
  const selectedDaySlots = timetableByDay[selectedDayOfWeek] || [];
  const isSelectedDateHoliday = selectedDateEvents.some(e => e.is_holiday);

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const filteredSlots = timetableSlots.filter(s => s.day_of_week === selectedTimetableDay);

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Institutional Masthead Header */}
      <div className="surface-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulse-dot" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em' }}>
                Academic Affairs • Statutory 75% Attendance Compliance • On-Duty (OD) Condonation
              </span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0 2px' }}>
              Academic Calendar & On-Duty Leave Management
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              Interactive institutional schedule, gazetted holidays marked in red, statutory 75% examination guardrail, and approved sports/hackathon/medical on-duty leaves counted as Present.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {isStudent && (
              <button
                className="app-btn app-btn-primary app-btn-sm"
                onClick={() => setApplyModalOpen(true)}
              >
                <Plus size={14} />
                <span>Apply On-Duty / Medical Leave</span>
              </button>
            )}

            {isAdmin && (
              <button
                className="app-btn app-btn-secondary app-btn-sm"
                onClick={() => setCreateEventModalOpen(true)}
              >
                <Plus size={14} />
                <span>Add Gazetted Holiday / Milestone</span>
              </button>
            )}

            <button className="app-btn app-btn-secondary app-btn-sm" onClick={loadAllData} title="Refresh Academic Records">
              <RefreshCw size={13} />
              <span>Refresh Records</span>
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', overflowX: 'auto' }}>
          {canMarkRollCall && (
            <button
              onClick={() => setActiveTab('roll_call')}
              style={{
                padding: '9px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: activeTab === 'roll_call' ? 'var(--primary)' : '#86EFAC',
                background: activeTab === 'roll_call' ? 'var(--primary)' : '#F0FDF4',
                color: activeTab === 'roll_call' ? '#FFFFFF' : '#166534',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
                boxShadow: activeTab === 'roll_call' ? '0 2px 4px rgba(20, 83, 45, 0.2)' : 'none'
              }}
            >
              <ClipboardCheck size={15} />
              <span>Digital Roll Call (Paper & Pen)</span>
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '10px',
                background: activeTab === 'roll_call' ? 'rgba(255,255,255,0.2)' : '#DCFCE7',
                color: activeTab === 'roll_call' ? '#FFFFFF' : '#15803D',
                fontWeight: 800
              }}>
                FACULTY
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('calendar')}
            style={{
              padding: '9px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: activeTab === 'calendar' ? 'var(--primary)' : 'var(--border-subtle)',
              background: activeTab === 'calendar' ? 'var(--primary)' : 'var(--canvas)',
              color: activeTab === 'calendar' ? '#FFFFFF' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <Calendar size={15} />
            <span>Academic Calendar & Holidays (Red)</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            style={{
              padding: '9px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: activeTab === 'attendance' ? 'var(--primary)' : 'var(--border-subtle)',
              background: activeTab === 'attendance' ? 'var(--primary)' : 'var(--canvas)',
              color: activeTab === 'attendance' ? '#FFFFFF' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={15} />
            <span>75% Statutory Attendance Ledger</span>
            {attendanceData?.od_protected && (
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '10px',
                background: '#FEF3C7',
                color: '#92400E',
                fontWeight: 800
              }}>
                OD PROTECTED
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('duty_leaves')}
            style={{
              padding: '9px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: activeTab === 'duty_leaves' ? 'var(--primary)' : 'var(--border-subtle)',
              background: activeTab === 'duty_leaves' ? 'var(--primary)' : 'var(--canvas)',
              color: activeTab === 'duty_leaves' ? '#FFFFFF' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <Award size={15} />
            <span>Approved On-Duty & Medical Leaves</span>
            {dutyLeaves.filter(l => l.status === 'pending').length > 0 && canReviewLeaves && (
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '10px',
                background: '#DC2626',
                color: '#FFFFFF',
                fontWeight: 800
              }}>
                {dutyLeaves.filter(l => l.status === 'pending').length} PENDING
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('timetable')}
            style={{
              padding: '9px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: activeTab === 'timetable' ? 'var(--primary)' : 'var(--border-subtle)',
              background: activeTab === 'timetable' ? 'var(--primary)' : 'var(--canvas)',
              color: activeTab === 'timetable' ? '#FFFFFF' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <Clock size={15} />
            <span>Weekly Class Timetable & Broadcasts</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: DIGITAL ROLL CALL REGISTER (PAPER & PEN MODE)                      */}
      {/* ========================================================================= */}
      {activeTab === 'roll_call' && canMarkRollCall && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 1. Masthead Card with Paper-Register Theme */}
          <div className="surface-card" style={{ padding: '22px', borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#FFFFFF',
                    background: 'var(--primary)',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    Official Lecture Attendance Register
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803D' }}>
                    Paper & Pen Digital Twin
                  </span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '6px 0 2px', color: 'var(--text-primary)' }}>
                  {rollCallData?.subject_code || rollCallSubject}: {rollCallData?.subject_name || 'Advanced Algorithms & Complexity'}
                </h2>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span><strong>Faculty In-Charge:</strong> {rollCallData?.faculty_name || user?.username}</span>
                  <span>•</span>
                  <span><strong>Cohort:</strong> Semester {rollCallSemester} — Section {rollCallSection}</span>
                  <span>•</span>
                  <span style={{ color: isHOD ? '#9A3412' : '#15803D', fontWeight: 700 }}>
                    {isHOD ? 'HOD Oversight & Subject Reallocation Enabled' : 'Authorized Subject (Allocated by HOD)'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {isHOD && (
                  <button
                    className="app-btn app-btn-secondary app-btn-sm"
                    onClick={loadHODAllocations}
                    style={{ borderColor: '#FDBA74', background: '#FFF7ED', color: '#9A3412', fontWeight: 700 }}
                  >
                    <Users size={14} />
                    <span>HOD: Allocate Teachers to Subjects</span>
                  </button>
                )}
                <button
                  className="app-btn app-btn-secondary app-btn-sm"
                  onClick={loadAttendanceHistory}
                >
                  <History size={14} />
                  <span>Register History</span>
                </button>
                <button
                  className="app-btn app-btn-secondary app-btn-sm"
                  onClick={() => loadRollCall()}
                  title="Reload Class Roster"
                >
                  <RefreshCw size={13} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Register Parameter Filters Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              padding: '14px',
              background: 'var(--canvas)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <label className="input-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Subject Allocation *
                </label>
                <select
                  className="input-field"
                  style={{ padding: '7px 10px', fontSize: '13px', fontWeight: 700 }}
                  value={rollCallSubject}
                  onChange={(e) => {
                    setRollCallSubject(e.target.value);
                    loadRollCall(e.target.value, rollCallDate, rollCallSemester, rollCallSection);
                  }}
                >
                  {(rollCallData?.assigned_subjects || [{ subject_code: 'CS-601', subject_name: 'Advanced Algorithms' }]).map((subj) => (
                    <option key={subj.subject_code} value={subj.subject_code}>
                      {subj.subject_code} - {subj.subject_name} ({subj.faculty_name || 'Faculty'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Lecture Date *
                </label>
                <input
                  type="date"
                  className="input-field"
                  style={{ padding: '7px 10px', fontSize: '13px' }}
                  value={rollCallDate}
                  onChange={(e) => {
                    setRollCallDate(e.target.value);
                    loadRollCall(rollCallSubject, e.target.value, rollCallSemester, rollCallSection);
                  }}
                />
              </div>

              <div>
                <label className="input-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Time Slot / Period *
                </label>
                <select
                  className="input-field"
                  style={{ padding: '7px 10px', fontSize: '13px' }}
                  value={rollCallSlotTime}
                  onChange={(e) => setRollCallSlotTime(e.target.value)}
                >
                  <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM (Period 1)</option>
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM (Period 2)</option>
                  <option value="11:15 AM - 12:15 PM">11:15 AM - 12:15 PM (Period 3)</option>
                  <option value="01:30 PM - 04:30 PM">01:30 PM - 04:30 PM (Laboratory)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Quick Roll Call Actions
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="app-btn app-btn-secondary app-btn-sm"
                    onClick={() => markAllStudents('present')}
                    style={{ flex: 1, padding: '6px 8px', fontSize: '11.5px', color: '#166534', background: '#F0FDF4', borderColor: '#BBF7D0' }}
                  >
                    <Check size={13} />
                    <span>All Present</span>
                  </button>
                  <button
                    type="button"
                    className="app-btn app-btn-secondary app-btn-sm"
                    onClick={() => markAllStudents('absent')}
                    style={{ flex: 1, padding: '6px 8px', fontSize: '11.5px', color: '#991B1B', background: '#FEF2F2', borderColor: '#FECACA' }}
                  >
                    <X size={13} />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live KPI Summary Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '14px'
            }}>
              <div style={{ padding: '10px 14px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Class Strength</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {rollCallRoster.length}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Enrolled Students</div>
              </div>

              <div style={{ padding: '10px 14px', background: '#F0FDF4', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                <div style={{ fontSize: '10.5px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Present (Hall)</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>
                  {rollCallRoster.filter(s => s.status === 'present').length}
                </div>
                <div style={{ fontSize: '11px', color: '#166534' }}>Physically in class</div>
              </div>

              <div style={{ padding: '10px 14px', background: '#FAF5FF', borderRadius: '6px', border: '1px solid #E9D5FF' }}>
                <div style={{ fontSize: '10.5px', color: '#6D28D9', fontWeight: 700, textTransform: 'uppercase' }}>Approved Leave (OD)</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#7C3AED', marginTop: '2px' }}>
                  {rollCallRoster.filter(s => s.status === 'approved_od').length}
                </div>
                <div style={{ fontSize: '11px', color: '#6D28D9' }}>Condoned as Present</div>
              </div>

              <div style={{ padding: '10px 14px', background: '#FEF2F2', borderRadius: '6px', border: '1px solid #FECACA' }}>
                <div style={{ fontSize: '10.5px', color: '#991B1B', fontWeight: 700, textTransform: 'uppercase' }}>Absent</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#DC2626', marginTop: '2px' }}>
                  {rollCallRoster.filter(s => s.status === 'absent').length}
                </div>
                <div style={{ fontSize: '11px', color: '#991B1B' }}>Uninformed absence</div>
              </div>

              <div style={{ padding: '10px 14px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Effective Rate</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                  {rollCallRoster.length > 0
                    ? Math.round(((rollCallRoster.filter(s => s.status !== 'absent').length) / rollCallRoster.length) * 100)
                    : 100}%
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Incl. Approved OD</div>
              </div>

              <div style={{ padding: '10px 14px', background: rollCallData?.is_sealed ? '#ECFDF5' : '#FFFBEB', borderRadius: '6px', border: `1px solid ${rollCallData?.is_sealed ? '#A7F3D0' : '#FDE68A'}` }}>
                <div style={{ fontSize: '10.5px', color: rollCallData?.is_sealed ? '#047857' : '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>Register Status</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: rollCallData?.is_sealed ? '#065F46' : '#92400E', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {rollCallData?.is_sealed ? <Lock size={14} /> : <Unlock size={14} />}
                  <span>{rollCallData?.is_sealed ? 'SEALED & FILED' : 'DRAFT SESSION'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Paper & Pen Classroom Register Sheet */}
          <div className="surface-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-medium)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            
            {/* Register Head Bar */}
            <div style={{
              padding: '14px 20px',
              background: '#F8FAF8',
              borderBottom: '2px solid var(--border-medium)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                  STUDENT ROLL CALL LEDGER
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '10px' }}>
                  Date: {rollCallDate} • Slot: {rollCallSlotTime}
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Rule: Approved Leave students are marked automatically. Click "P" or "A" for classroom students.
              </div>
            </div>

            {/* Roster Table */}
            {isLoadingRollCall ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px', color: 'var(--primary)' }} />
                <div>Loading classroom roll call roster...</div>
              </div>
            ) : rollCallRoster.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div>No students enrolled for Semester {rollCallSemester} Section {rollCallSection}.</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F1F4F0', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '12px 16px', width: '48px', fontWeight: 700, fontSize: '11.5px' }}>#</th>
                      <th style={{ padding: '12px 16px', width: '140px', fontWeight: 800, fontSize: '11.5px', letterSpacing: '0.04em' }}>ROLL NUMBER</th>
                      <th style={{ padding: '12px 16px', fontWeight: 800, fontSize: '11.5px', letterSpacing: '0.04em' }}>STUDENT NAME</th>
                      <th style={{ padding: '12px 16px', width: '380px', fontWeight: 800, fontSize: '11.5px', letterSpacing: '0.04em' }}>ATTENDANCE STATUS</th>
                      <th style={{ padding: '12px 16px', width: '240px', fontWeight: 800, fontSize: '11.5px', letterSpacing: '0.04em' }}>FACULTY REMARKS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rollCallRoster.map((student, idx) => {
                      const isLeave = student.has_approved_leave;
                      const isPresent = student.status === 'present';
                      const isAbsent = student.status === 'absent';
                      const isOD = student.status === 'approved_od';

                      return (
                        <tr
                          key={student.student_id}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            background: isLeave
                              ? '#FAF5FF'
                              : isAbsent
                                ? '#FFF5F5'
                                : (idx % 2 === 0 ? '#FFFFFF' : '#FAFCFA'),
                            transition: 'background 0.15s ease'
                          }}
                        >
                          {/* S.No */}
                          <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            {idx + 1}
                          </td>

                          {/* Roll Number (Crisp Monospace) */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '13.5px',
                              color: 'var(--primary)',
                              letterSpacing: '0.03em'
                            }}>
                              {student.roll_number}
                            </div>
                            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              Reg: {student.registration_number || 'NA'}
                            </div>
                          </td>

                          {/* Student Name */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13.5px' }}>
                              {student.full_name}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '3px' }}>
                              <span style={{
                                fontSize: '10px',
                                padding: '1px 6px',
                                borderRadius: '3px',
                                background: student.gender === 'Female' ? '#FDF2F8' : '#F0F9FF',
                                color: student.gender === 'Female' ? '#9D174D' : '#0369A1',
                                fontWeight: 700
                              }}>
                                {student.gender || 'Regular'}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                Section {rollCallSection}
                              </span>
                            </div>
                          </td>

                          {/* Attendance Action Column */}
                          <td style={{ padding: '14px 16px' }}>
                            {isLeave ? (
                              /* APPROVED ON-DUTY / MEDICAL LEAVE BADGE */
                              <div style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                background: '#F3E8FF',
                                border: '1.5px solid #C084FC',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '3px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                  <span style={{
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    background: '#7C3AED',
                                    color: '#FFFFFF',
                                    letterSpacing: '0.03em'
                                  }}>
                                    APPROVED LEAVE (OD)
                                  </span>
                                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#6D28D9' }}>
                                    Credited as Present
                                  </span>
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#4C1D95', marginTop: '2px' }}>
                                  {student.approved_leave_title}
                                </div>
                                <div style={{ fontSize: '11px', color: '#6D28D9' }}>
                                  Sanctioned collegiate on-duty • Counted in 75% statutory attendance
                                </div>
                              </div>
                            ) : (
                              /* INTERACTIVE 1-CLICK TACTILE BUTTONS */
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                {/* Present Button */}
                                <button
                                  type="button"
                                  onClick={() => toggleStudentStatus(student.student_id, 'present')}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '8px 18px',
                                    borderRadius: '6px',
                                    fontWeight: 800,
                                    fontSize: '12.5px',
                                    cursor: 'pointer',
                                    border: '1.5px solid',
                                    borderColor: isPresent ? '#15803D' : '#CBD5E1',
                                    background: isPresent ? '#15803D' : '#F8FAFC',
                                    color: isPresent ? '#FFFFFF' : '#475569',
                                    boxShadow: isPresent ? '0 2px 4px rgba(21, 128, 61, 0.25)' : 'none',
                                    transition: 'all 0.12s ease',
                                    minWidth: '105px'
                                  }}
                                  title="Mark Present in Lecture"
                                >
                                  <Check size={15} strokeWidth={isPresent ? 3 : 2} />
                                  <span>P • Present</span>
                                </button>

                                {/* Absent Button */}
                                <button
                                  type="button"
                                  onClick={() => toggleStudentStatus(student.student_id, 'absent')}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '8px 18px',
                                    borderRadius: '6px',
                                    fontWeight: 800,
                                    fontSize: '12.5px',
                                    cursor: 'pointer',
                                    border: '1.5px solid',
                                    borderColor: isAbsent ? '#DC2626' : '#CBD5E1',
                                    background: isAbsent ? '#DC2626' : '#F8FAFC',
                                    color: isAbsent ? '#FFFFFF' : '#475569',
                                    boxShadow: isAbsent ? '0 2px 4px rgba(220, 38, 38, 0.25)' : 'none',
                                    transition: 'all 0.12s ease',
                                    minWidth: '105px'
                                  }}
                                  title="Mark Absent"
                                >
                                  <X size={15} strokeWidth={isAbsent ? 3 : 2} />
                                  <span>A • Absent</span>
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Remarks Column */}
                          <td style={{ padding: '14px 16px' }}>
                            <input
                              type="text"
                              className="input-field"
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                              placeholder={isLeave ? 'Sanctioned leave' : 'Remarks (optional)...'}
                              value={student.remarks || ''}
                              onChange={(e) => handleRemarkChange(student.student_id, e.target.value)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Register Sealing & Submission Footer */}
            <div style={{
              padding: '20px',
              background: '#F8FAF8',
              borderTop: '2px solid var(--border-medium)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', alignItems: 'center' }}>
                <div>
                  <label className="input-label" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                    Lecture Syllabus & Conduction Notes
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    style={{ fontSize: '12.5px' }}
                    placeholder="e.g. Covered Dynamic Programming, Bellman-Ford shortest paths, and complexity proofs"
                    value={rollCallNotes}
                    onChange={(e) => setRollCallNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Statutory 75% Audit Guarantee
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Sealing this register automatically updates cumulative records and hall ticket eligibility for all {rollCallRoster.length} students.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Current Tally: {' '}
                  <span style={{ color: '#15803D' }}>{rollCallRoster.filter(s => s.status === 'present').length} Present</span>, {' '}
                  <span style={{ color: '#6D28D9' }}>{rollCallRoster.filter(s => s.status === 'approved_od').length} Approved OD</span>, {' '}
                  <span style={{ color: '#DC2626' }}>{rollCallRoster.filter(s => s.status === 'absent').length} Absent</span>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="app-btn app-btn-secondary"
                    onClick={() => loadRollCall()}
                    disabled={isSubmittingRollCall}
                  >
                    Reset Changes
                  </button>
                  <button
                    type="button"
                    className="app-btn app-btn-primary"
                    style={{ padding: '10px 22px', fontSize: '13.5px', fontWeight: 800, gap: '8px' }}
                    onClick={handleSubmitAttendance}
                    disabled={isSubmittingRollCall || rollCallRoster.length === 0}
                  >
                    <Lock size={15} />
                    <span>{isSubmittingRollCall ? 'Sealing Attendance Register...' : 'Submit & Seal Attendance Register'}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: ACADEMIC CALENDAR & SCHEDULE MATRIX                                */}
      {/* ========================================================================= */}
      {activeTab === 'calendar' && (
        <div className="academic-calendar-layout">
          
          {/* Main Month Grid */}
          <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, overflow: 'hidden' }}>
            
            {/* Month Header & Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {monthNames[month]} {year}
                </h2>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  border: '1px solid var(--primary-border)'
                }}>
                  Autumn Semester 2026&ndash;27
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="app-btn app-btn-secondary app-btn-xs"
                  onClick={handlePrevMonth}
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  className="app-btn app-btn-secondary app-btn-xs"
                  onClick={() => setCurrentDate(new Date(2026, 9, 9))}
                >
                  <span>Today</span>
                </button>
                <button
                  type="button"
                  className="app-btn app-btn-secondary app-btn-xs"
                  onClick={handleNextMonth}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Calendar Legend Bar */}
            <div style={{
              display: 'flex',
              gap: '14px',
              padding: '10px 14px',
              background: 'var(--canvas)',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              fontSize: '11.5px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#DC2626' }} />
                <strong style={{ color: '#991B1B' }}>Official Holiday (College Closed)</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#7C3AED' }} />
                <strong style={{ color: '#6D28D9' }}>Approved On-Duty / Medical (Counted as Present)</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#D97706' }} />
                <strong style={{ color: '#92400E' }}>Exams / Assessments</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary)' }} />
                <span>Regular Teaching Day</span>
              </div>
            </div>

            {/* 7-Day Day-of-Week Table Header */}
            <div className="academic-calendar-header">
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
              <div style={{ color: '#DC2626' }}>Sun</div>
            </div>

            {/* Monthly Calendar Grid Cells */}
            <div className="academic-calendar-grid">
              {/* Leading Empty Cells */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} style={{ minHeight: '86px', background: 'var(--canvas)', opacity: 0.35, borderRadius: '6px', minWidth: 0 }} />
              ))}

              {/* Day Cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const events = getEventsForDate(dateStr);
                const dutyLeavesOnDay = getDutyLeavesForDate(dateStr);
                const isHoliday = events.some(e => e.is_holiday);
                const isExam = events.some(e => e.event_type === 'exam');
                const hasDutyLeave = dutyLeavesOnDay.length > 0;
                const isSelected = selectedCalendarDate === dateStr;
                const isSunday = new Date(year, month, dayNum).getDay() === 0;

                // Day of week name for slots count
                const dow = dayNameMap[new Date(year, month, dayNum).getDay()];
                const daySlots = (!isHoliday && !isSunday) ? (timetableByDay[dow] || []) : [];

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedCalendarDate(dateStr)}
                    className="academic-calendar-day"
                    style={{
                      border: isSelected
                        ? '2px solid var(--primary)'
                        : isHoliday
                          ? '1.5px solid #FCA5A5'
                          : hasDutyLeave
                            ? '1.5px solid #C4B5FD'
                            : '1px solid var(--border-subtle)',
                      background: isHoliday
                        ? '#FEE2E2'
                        : hasDutyLeave
                          ? '#EDE9FE'
                          : isExam
                            ? '#FEF3C7'
                            : isSelected
                              ? 'var(--canvas)'
                              : 'var(--surface)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        color: isHoliday ? '#DC2626' : isSunday ? '#B91C1C' : 'var(--text-primary)'
                      }}>
                        {dayNum}
                      </span>

                      {isSelected && (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                      )}
                    </div>

                    {/* Official Holiday Tag (RED) */}
                    {isHoliday && (
                      <div className="academic-badge academic-badge-holiday" title={`Holiday: ${events[0]?.event_title}`}>
                        {events[0]?.event_title}
                      </div>
                    )}

                    {/* Approved On-Duty / Medical Leave Tag (PURPLE) */}
                    {hasDutyLeave && !isHoliday && (
                      <div className="academic-badge academic-badge-od" title={`${dutyLeavesOnDay[0]?.title} (Counted as Present)`}>
                        OD: {dutyLeavesOnDay[0]?.leave_type.toUpperCase()}
                      </div>
                    )}

                    {/* Exam Tag (AMBER) */}
                    {isExam && !isHoliday && (
                      <div className="academic-badge academic-badge-exam">
                        EXAMS
                      </div>
                    )}

                    {/* Regular Lectures Count */}
                    {!isHoliday && !isSunday && daySlots.length > 0 && !hasDutyLeave && (
                      <div style={{ marginTop: 'auto', fontSize: '10px', color: 'var(--text-secondary)' }}>
                        {daySlots.length} Classes
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Inspector & Scheduled Classes Card */}
          <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0, position: 'sticky', top: '20px' }}>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary)' }}>
                Selected Day Schedule Inspector
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '4px 0 0', color: 'var(--text-primary)' }}>
                {new Date(selectedCalendarDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
            </div>

            {/* Case 1: Gazetted Holiday Proclamation Banner */}
            {isSelectedDateHoliday ? (
              <div style={{
                padding: '14px',
                borderRadius: '6px',
                background: '#FEE2E2',
                border: '1.5px solid #FCA5A5',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B' }}>
                  <AlertCircle size={18} />
                  <strong style={{ fontSize: '13px' }}>Official Gazetted University Holiday</strong>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#7F1D1D' }}>
                  {selectedDateEvents[0]?.event_title}
                </div>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#991B1B', lineHeight: 1.4 }}>
                  {selectedDateEvents[0]?.description || 'Statutory holiday promulgated by university administration. All lectures suspended; college closed.'}
                </p>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#B91C1C', marginTop: '4px' }}>
                  Status: College Closed &bull; 0 Attendance Deficit
                </div>
              </div>
            ) : selectedDateDutyLeaves.length > 0 ? (
              /* Case 2: Approved On-Duty / Medical Leave Active on Selected Date */
              <div style={{
                padding: '14px',
                borderRadius: '6px',
                background: '#EDE9FE',
                border: '1.5px solid #C4B5FD',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6D28D9' }}>
                  <Award size={18} />
                  <strong style={{ fontSize: '13px' }}>Approved On-Duty Leave (Counted as Present)</strong>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#4C1D95' }}>
                  {selectedDateDutyLeaves[0]?.title}
                </div>
                <div style={{ fontSize: '11.5px', color: '#5B21B6' }}>
                  {selectedDateDutyLeaves[0]?.organization_or_hospital}
                </div>
                <div style={{
                  padding: '6px 10px',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.7)',
                  fontSize: '11px',
                  color: '#4C1D95'
                }}>
                  <strong>Accredited Status:</strong> Physically away representing university; attendance accredited as <strong>100% Present</strong> in statutory register.
                </div>
              </div>
            ) : null}

            {/* Scheduled Classes for this Day */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Classes Scheduled ({selectedDaySlots.length})
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {selectedDayOfWeek}
                </span>
              </div>

              {selectedDaySlots.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px', background: 'var(--canvas)', borderRadius: '6px' }}>
                  No classroom lectures scheduled on this day.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto' }}>
                  {selectedDaySlots.map((slot) => {
                    const isOD = selectedDateDutyLeaves.length > 0;
                    return (
                      <div
                        key={slot.id}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '6px',
                          background: slot.status === 'cancelled'
                            ? '#FEF2F2'
                            : isOD
                              ? '#F5F3FF'
                              : 'var(--canvas)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                            {formatTimeRange12(slot.start_time, slot.end_time)}
                          </span>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '3px',
                            background: slot.status === 'cancelled'
                              ? '#FEE2E2'
                              : isOD
                                ? '#DDD6FE'
                                : '#DCFCE7',
                            color: slot.status === 'cancelled'
                              ? '#B91C1C'
                              : isOD
                                ? '#6D28D9'
                                : '#15803D'
                          }}>
                            {slot.status === 'cancelled'
                              ? 'CANCELLED'
                              : isOD
                                ? 'ON-DUTY (PRESENT)'
                                : 'PRESENT'}
                          </span>
                        </div>

                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {slot.subject_name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {slot.faculty_name} &bull; Room: <strong>{slot.room_number}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 75% STATUTORY ATTENDANCE LEDGER & OD PROTECTION                    */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && attendanceData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Statutory Health KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            
            {/* Metric 1: Effective Statutory Attendance */}
            <div className="surface-card" style={{ padding: '18px', borderLeft: `4px solid ${attendanceData.is_overall_eligible ? 'var(--primary)' : '#DC2626'}` }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Effective Statutory Attendance
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: attendanceData.is_overall_eligible ? 'var(--primary)' : '#DC2626', marginTop: '4px' }}>
                {attendanceData.overall_percentage}%
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {attendanceData.total_attended} of {attendanceData.total_conducted} accredited lectures
              </div>
            </div>

            {/* Metric 2: Physical vs OD Credits */}
            <div className="surface-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Classroom Physical Attendance
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {attendanceData.physical_percentage}%
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {attendanceData.physical_attended} physically attended in lecture hall
              </div>
            </div>

            {/* Metric 3: Approved On-Duty Credits Granted */}
            <div className="surface-card" style={{ padding: '18px', borderLeft: '4px solid #7C3AED' }}>
              <div style={{ fontSize: '11px', color: '#6D28D9', fontWeight: 700, textTransform: 'uppercase' }}>
                Approved On-Duty (OD) Credits
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#6D28D9', marginTop: '4px' }}>
                +{attendanceData.total_od_credits} Classes
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Accredited for college hackathons & sports representation
              </div>
            </div>

            {/* Metric 4: Hall Ticket Clearance Status */}
            <div className="surface-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Admit Card Eligibility
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: attendanceData.is_overall_eligible ? 'var(--primary)' : '#DC2626', marginTop: '8px' }}>
                {attendanceData.hall_ticket_status}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Mandatory minimum 75.00% under university bylaws
              </div>
            </div>
          </div>

          {/* On-Duty Protection Advisory Banner */}
          {attendanceData.od_protected && (
            <div style={{
              padding: '14px 18px',
              borderRadius: '8px',
              background: '#EDE9FE',
              border: '1.5px solid #C4B5FD',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Award size={22} style={{ color: '#6D28D9', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '13px', color: '#4C1D95' }}>
                  Student Protected Against Debarment by Approved On-Duty (OD) Condonation
                </strong>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#5B21B6' }}>
                  Classroom physical attendance is currently {attendanceData.physical_percentage}%, which would otherwise trigger an exam debarment warning. With +{attendanceData.total_od_credits} approved duty credits credited for official collegiate representation (hackathon/sports), effective attendance is restored to {attendanceData.overall_percentage}% (Eligible).
                </p>
              </div>
            </div>
          )}

          {/* Subject-by-Subject Ledger */}
          <div className="surface-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Course-Wise Statutory Attendance Ledger
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
              {attendanceData.records?.map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: 'var(--canvas)',
                    border: '1px solid',
                    borderColor: rec.is_compliant ? 'var(--border-subtle)' : '#FCA5A5',
                    borderLeft: `4px solid ${rec.is_compliant ? (rec.od_protected ? '#7C3AED' : 'var(--primary)') : '#DC2626'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {rec.subject_code}
                      </span>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {rec.subject_name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        Faculty: {rec.faculty_name}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: rec.is_compliant ? 'var(--primary)' : '#DC2626', fontFamily: 'monospace' }}>
                        {rec.percentage}%
                      </div>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '3px',
                        background: rec.is_compliant ? '#DCFCE7' : '#FEE2E2',
                        color: rec.is_compliant ? '#15803D' : '#991B1B'
                      }}>
                        {rec.status_label}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    padding: '8px 10px',
                    background: 'var(--surface)',
                    borderRadius: '5px',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      Physical: <strong>{rec.physical_attended}</strong> / {rec.total_classes} ({rec.physical_percentage}%)
                    </div>
                    {rec.od_credits > 0 && (
                      <span style={{ fontWeight: 700, color: '#6D28D9' }}>
                        +{rec.od_credits} OD Credits
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '11.5px', fontWeight: 600, color: rec.is_compliant ? 'var(--primary)' : '#DC2626' }}>
                    {rec.compliance_note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: APPROVED ON-DUTY & MEDICAL LEAVE DESK                               */}
      {/* ========================================================================= */}
      {activeTab === 'duty_leaves' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  On-Duty (OD) & Medical Leave Applications
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Formal condonation of attendance for inter-college hackathons, university sports competitions, and certified medical leaves.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Filter Status:</span>
                <select
                  className="input-field"
                  style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}
                  value={leaveStatusFilter}
                  onChange={(e) => setLeaveStatusFilter(e.target.value)}
                >
                  <option value="all">All Applications</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending Review</option>
                  <option value="rejected">Rejected</option>
                </select>

                {isStudent && (
                  <button
                    className="app-btn app-btn-primary app-btn-sm"
                    onClick={() => setApplyModalOpen(true)}
                  >
                    <Plus size={13} />
                    <span>Apply for Leave</span>
                  </button>
                )}
              </div>
            </div>

            {/* Applications Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--canvas)', borderBottom: '1.5px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '10px 12px' }}>Category</th>
                    <th style={{ padding: '10px 12px' }}>Event / Medical Title</th>
                    {!isStudent && <th style={{ padding: '10px 12px' }}>Applicant</th>}
                    <th style={{ padding: '10px 12px' }}>Dates & Duration</th>
                    <th style={{ padding: '10px 12px' }}>Accredited Lecture Credits</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                    {canReviewLeaves && <th style={{ padding: '10px 12px', textAlign: 'right' }}>HOD Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {dutyLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={canReviewLeaves ? 7 : 6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                        No On-Duty or Medical Leave applications recorded.
                      </td>
                    </tr>
                  ) : (
                    dutyLeaves.map((l) => (
                      <tr key={l.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            background: l.leave_type === 'hackathon'
                              ? '#EDE9FE'
                              : l.leave_type === 'sports'
                                ? '#FEF3C7'
                                : l.leave_type === 'medical'
                                  ? '#FEE2E2'
                                  : 'var(--canvas)',
                            color: l.leave_type === 'hackathon'
                              ? '#6D28D9'
                              : l.leave_type === 'sports'
                                ? '#92400E'
                                : l.leave_type === 'medical'
                                  ? '#991B1B'
                                  : 'var(--text-primary)'
                          }}>
                            {l.leave_type.replace('_', ' ')}
                          </span>
                        </td>

                        <td style={{ padding: '12px', maxWidth: '280px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{l.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {l.organization_or_hospital}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', fontStyle: 'italic' }}>
                            "{l.reason}"
                          </div>
                        </td>

                        {!isStudent && (
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 600 }}>{l.student_name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                              {l.roll_number}
                            </div>
                          </td>
                        )}

                        <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600 }}>
                            {new Date(l.start_date).toLocaleDateString('en-GB')} &ndash; {new Date(l.end_date).toLocaleDateString('en-GB')}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                            {l.total_days} Day(s) Condoned
                          </div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700,
                            color: l.status === 'approved' ? '#6D28D9' : 'var(--text-tertiary)'
                          }}>
                            +{l.lecture_credits_granted} Lectures
                          </span>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: l.status === 'approved' ? '#DCFCE7' : l.status === 'rejected' ? '#FEE2E2' : '#FEF3C7',
                            color: l.status === 'approved' ? '#15803D' : l.status === 'rejected' ? '#991B1B' : '#92400E'
                          }}>
                            {l.status.toUpperCase()}
                          </span>
                          {l.reviewer_remarks && (
                            <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '3px' }}>
                              {l.reviewer_remarks}
                            </div>
                          )}
                        </td>

                        {canReviewLeaves && (
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            {l.status === 'pending' ? (
                              <button
                                className="app-btn app-btn-primary app-btn-xs"
                                onClick={() => {
                                  setSelectedLeaveForReview(l);
                                  setReviewForm({
                                    action: 'approved',
                                    reviewer_remarks: 'Approved by Department HOD. Official university representation.',
                                    lecture_credits_granted: l.total_days * 4
                                  });
                                  setReviewModalOpen(true);
                                }}
                              >
                                <span>Review Application</span>
                              </button>
                            ) : (
                              <button
                                className="app-btn app-btn-secondary app-btn-xs"
                                onClick={() => {
                                  setSelectedLeaveForReview(l);
                                  setReviewForm({
                                    action: l.status,
                                    reviewer_remarks: l.reviewer_remarks || '',
                                    lecture_credits_granted: l.lecture_credits_granted
                                  });
                                  setReviewModalOpen(true);
                                }}
                              >
                                <span>Modify Decision</span>
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: WEEKLY CLASS TIMETABLE & BROADCASTS                                 */}
      {/* ========================================================================= */}
      {activeTab === 'timetable' && (
        <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Weekly Class Timetable (CSE - Semester 6A)
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Instant lecture cancellations or room changes broadcasted directly to students in real time.
            </p>
          </div>

          {/* Day Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {daysOfWeek.map((day) => (
              <button
                key={day}
                className={`app-btn ${selectedTimetableDay === day ? 'app-btn-primary' : 'app-btn-secondary'} app-btn-sm`}
                onClick={() => setSelectedTimetableDay(day)}
                style={{ textTransform: 'capitalize' }}
              >
                <span>{day}</span>
              </button>
            ))}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--canvas)', borderBottom: '1.5px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Time Window</th>
                  <th style={{ padding: '10px 12px' }}>Course</th>
                  <th style={{ padding: '10px 12px' }}>Instructor</th>
                  <th style={{ padding: '10px 12px' }}>Venue Room</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  {canBroadcast && <th style={{ padding: '10px 12px', textAlign: 'right' }}>Faculty Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredSlots.length === 0 ? (
                  <tr>
                    <td colSpan={canBroadcast ? 6 : 5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                      No lectures scheduled for {selectedTimetableDay}.
                    </td>
                  </tr>
                ) : (
                  filteredSlots.map((slot) => (
                    <tr key={slot.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700 }}>
                        {formatTimeRange12(slot.start_time, slot.end_time)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700 }}>{slot.subject_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{slot.subject_code}</div>
                      </td>
                      <td style={{ padding: '12px' }}>{slot.faculty_name}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} style={{ color: 'var(--text-tertiary)' }} />
                          <span style={{ fontWeight: 600 }}>{slot.room_number}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: slot.status === 'scheduled' ? '#DCFCE7' : '#FEE2E2',
                          color: slot.status === 'scheduled' ? '#15803D' : '#991B1B'
                        }}>
                          {slot.status.toUpperCase()}
                        </span>
                        {slot.notice_note && (
                          <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '3px', fontWeight: 600 }}>
                            {slot.notice_note}
                          </div>
                        )}
                      </td>
                      {canBroadcast && (
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            className="app-btn app-btn-secondary app-btn-xs"
                            onClick={() => {
                              setSelectedSlot(slot);
                              setBroadcastStatus(slot.status === 'cancelled' ? 'scheduled' : 'cancelled');
                              setBroadcastNote('');
                            }}
                          >
                            <Bell size={11} />
                            <span>Broadcast Alert</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: APPLY FOR ON-DUTY (OD) / MEDICAL LEAVE                           */}
      {/* ========================================================================= */}
      {applyModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '10px',
            maxWidth: '560px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--canvas)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Apply for On-Duty (OD) / Medical Attendance Condonation
                </h3>
              </div>
              <button onClick={() => setApplyModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Condonation Category *</label>
                <select
                  className="input-field"
                  value={applyForm.leave_type}
                  onChange={(e) => setApplyForm({ ...applyForm, leave_type: e.target.value })}
                >
                  <option value="hackathon">Hackathon / Inter-College Technical Competition</option>
                  <option value="sports">University Sports Tournament / Athletic Meet</option>
                  <option value="cultural">Cultural Festival / Youth Convention</option>
                  <option value="medical">Medical Illness / Inpatient Hospitalization</option>
                  <option value="personal_emergency">Special Personal Emergency (Dean Condonation)</option>
                </select>
              </div>

              <div>
                <label className="input-label">Event / Activity / Medical Title *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. BPUT Hackathon 2026 Grand Finale"
                  value={applyForm.title}
                  onChange={(e) => setApplyForm({ ...applyForm, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="input-label">Host Organization / Hospital Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Fretbox & BPUT Innovation Hub, Rourkela"
                  value={applyForm.organization_or_hospital}
                  onChange={(e) => setApplyForm({ ...applyForm, organization_or_hospital: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Start Date *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={applyForm.start_date}
                    onChange={(e) => setApplyForm({ ...applyForm, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">End Date *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={applyForm.end_date}
                    onChange={(e) => setApplyForm({ ...applyForm, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Justification & Official Details *</label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="Explain your collegiate representation or medical condition..."
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="input-label">Supporting Document / Letter Reference</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. SELECTION_OFFER_LETTER_PS07.pdf"
                  value={applyForm.proof_document}
                  onChange={(e) => setApplyForm({ ...applyForm, proof_document: e.target.value })}
                />
              </div>

              <div style={{
                padding: '10px 14px',
                borderRadius: '6px',
                background: '#EDE9FE',
                fontSize: '11.5px',
                color: '#5B21B6',
                lineHeight: 1.4
              }}>
                <strong>BPUT Statutory Rule:</strong> Approved On-Duty leaves grant Present-equivalent credits across all missed lectures for approved dates, protecting students against the 75% debarment threshold.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" className="app-btn app-btn-secondary" onClick={() => setApplyModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="app-btn app-btn-primary" disabled={applyingLeave}>
                  {applyingLeave ? 'Submitting...' : 'Submit to HOD for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: HOD / FACULTY REVIEW ON-DUTY LEAVE                               */}
      {/* ========================================================================= */}
      {reviewModalOpen && selectedLeaveForReview && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '10px',
            maxWidth: '540px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--canvas)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  HOD Review: On-Duty & Medical Condonation
                </h3>
              </div>
              <button onClick={() => setReviewModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReviewLeave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px', background: 'var(--canvas)', borderRadius: '6px', fontSize: '12px' }}>
                <div><strong>Student:</strong> {selectedLeaveForReview.student_name} ({selectedLeaveForReview.roll_number})</div>
                <div style={{ marginTop: '2px' }}><strong>Event:</strong> {selectedLeaveForReview.title}</div>
                <div style={{ marginTop: '2px' }}><strong>Dates:</strong> {selectedLeaveForReview.start_date} to {selectedLeaveForReview.end_date} ({selectedLeaveForReview.total_days} days)</div>
                <div style={{ marginTop: '4px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{selectedLeaveForReview.reason}"</div>
              </div>

              <div>
                <label className="input-label">Decision *</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="action"
                      value="approved"
                      checked={reviewForm.action === 'approved'}
                      onChange={() => setReviewForm({ ...reviewForm, action: 'approved' })}
                    />
                    <span style={{ color: '#15803D' }}>Approve & Credit Attendance (Present)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="action"
                      value="rejected"
                      checked={reviewForm.action === 'rejected'}
                      onChange={() => setReviewForm({ ...reviewForm, action: 'rejected' })}
                    />
                    <span style={{ color: '#DC2626' }}>Reject Application</span>
                  </label>
                </div>
              </div>

              {reviewForm.action === 'approved' && (
                <div>
                  <label className="input-label">Lecture Attendance Credits to Accrue *</label>
                  <input
                    type="number"
                    className="input-field"
                    value={reviewForm.lecture_credits_granted}
                    onChange={(e) => setReviewForm({ ...reviewForm, lecture_credits_granted: e.target.value })}
                    required
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Calculated standard: {selectedLeaveForReview.total_days} days &times; 4 lectures/day = {selectedLeaveForReview.total_days * 4} credits.
                  </div>
                </div>
              )}

              <div>
                <label className="input-label">Official Review Remarks</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Approved under sports condonation quota"
                  value={reviewForm.reviewer_remarks}
                  onChange={(e) => setReviewForm({ ...reviewForm, reviewer_remarks: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" className="app-btn app-btn-secondary" onClick={() => setReviewModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="app-btn app-btn-primary" disabled={reviewingLeave}>
                  {reviewingLeave ? 'Saving...' : 'Confirm Decision & Update Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD GAZETTED HOLIDAY / CALENDAR MILESTONE (ADMIN)                */}
      {/* ========================================================================= */}
      {createEventModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '10px',
            maxWidth: '520px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--canvas)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Add Academic Calendar Event / Holiday
                </h3>
              </div>
              <button onClick={() => setCreateEventModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Event / Holiday Headline *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Utkal Divas / Odisha Foundation Day"
                  value={eventForm.event_title}
                  onChange={(e) => setEventForm({ ...eventForm, event_title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="input-label">Classification *</label>
                <select
                  className="input-field"
                  value={eventForm.event_type}
                  onChange={(e) => setEventForm({
                    ...eventForm,
                    event_type: e.target.value,
                    is_holiday: e.target.value === 'holiday' || e.target.value === 'vacation'
                  })}
                >
                  <option value="holiday">Official Gazetted Holiday (College Closed - Red)</option>
                  <option value="vacation">Statutory Recess / Vacation Window (Red)</option>
                  <option value="exam">Examination Assessment Window (Amber)</option>
                  <option value="academic_event">Symposium / Project Exhibition (Blue)</option>
                  <option value="semester_milestone">Semester Milestone / Result Publication</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Start Date *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={eventForm.start_date}
                    onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">End Date *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={eventForm.end_date}
                    onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Administrative Gazette Proclamation</label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="Statutory details, circular reference, and guidelines..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" className="app-btn app-btn-secondary" onClick={() => setCreateEventModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="app-btn app-btn-primary" disabled={creatingEvent}>
                  {creatingEvent ? 'Promulgating...' : 'Promulgate Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: FACULTY BROADCAST LECTURE RESCHEDULE / CANCEL                     */}
      {/* ========================================================================= */}
      {selectedSlot && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--canvas)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Promulgate Lecture Schedule Alert
                </h3>
              </div>
              <button onClick={() => setSelectedSlot(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBroadcast} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px', background: 'var(--canvas)', borderRadius: '6px', fontSize: '12px' }}>
                <div><strong>Course:</strong> {selectedSlot.subject_name} ({selectedSlot.subject_code})</div>
                <div style={{ marginTop: '2px' }}><strong>Scheduled Time:</strong> {formatTimeRange12(selectedSlot.start_time, selectedSlot.end_time)}</div>
                <div style={{ marginTop: '2px' }}><strong>Room:</strong> {selectedSlot.room_number}</div>
              </div>

              <div>
                <label className="input-label">Update Status *</label>
                <select
                  className="input-field"
                  value={broadcastStatus}
                  onChange={(e) => setBroadcastStatus(e.target.value)}
                >
                  <option value="scheduled">Scheduled (Normal Conduction)</option>
                  <option value="cancelled">Cancelled (No Class)</option>
                  <option value="rescheduled">Relocated / Rescheduled</option>
                </select>
              </div>

              <div>
                <label className="input-label">Advisory Note to Enrolled Students</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Relocated to LH-201 due to projector calibration"
                  value={broadcastNote}
                  onChange={(e) => setBroadcastNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" className="app-btn app-btn-secondary" onClick={() => setSelectedSlot(null)}>
                  Cancel
                </button>
                <button type="submit" className="app-btn app-btn-primary" disabled={isBroadcasting}>
                  {isBroadcasting ? 'Broadcasting...' : 'Broadcast Immediate Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HOD Subject Allocation Modal */}
      {hodModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '10px',
            maxWidth: '780px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--canvas)' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  HOD Departmental Subject Allocation & Faculty Roster
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Assign teachers to specific subjects. Teachers will only have access to mark attendance for their allocated courses.
                </p>
              </div>
              <button onClick={() => setHodModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F1F4F0', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Subject Code</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Subject Name</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Sem / Sec</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Assigned Faculty</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, width: '220px' }}>Reassign Teacher</th>
                  </tr>
                </thead>
                <tbody>
                  {(allocationsData?.allocations || []).map((alloc) => (
                    <tr key={`${alloc.subject_code}-${alloc.semester}-${alloc.section}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)' }}>
                        {alloc.subject_code}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>
                        {alloc.subject_name}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                        Sem {alloc.semester} - Sec {alloc.section}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {alloc.faculty_name}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <select
                          className="input-field"
                          style={{ padding: '6px 8px', fontSize: '12px', width: '100%' }}
                          value={alloc.faculty_user_id || ''}
                          onChange={(e) => handleAssignFaculty(alloc.subject_code, parseInt(e.target.value, 10))}
                          disabled={isSavingAllocation}
                        >
                          <option value="">Select Faculty...</option>
                          {(allocationsData?.faculty_list || []).map((f) => (
                            <option key={f.user_id} value={f.user_id}>
                              {f.full_name} ({f.designation || 'Faculty'})
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="app-btn app-btn-secondary" onClick={() => setHodModalOpen(false)}>
                  Close Allocation Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance History Modal */}
      {historyModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '10px',
            maxWidth: '750px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--canvas)' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Sealed Attendance Registers History
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Audit log of historical classroom attendance sessions and sealed registers
                </p>
              </div>
              <button onClick={() => setHistoryModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isLoadingHistory ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
                  <div>Loading session records...</div>
                </div>
              ) : historySessions.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No historical sessions recorded yet.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: '#F1F4F0', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 12px', fontWeight: 700 }}>Date</th>
                      <th style={{ padding: '10px 12px', fontWeight: 700 }}>Subject</th>
                      <th style={{ padding: '10px 12px', fontWeight: 700 }}>Slot / Period</th>
                      <th style={{ padding: '10px 12px', fontWeight: 700 }}>Faculty</th>
                      <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Present</th>
                      <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>OD Leave</th>
                      <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Absent</th>
                      <th style={{ padding: '10px 12px', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historySessions.map((sess) => (
                      <tr key={sess.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>{sess.attendance_date}</td>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{sess.subject_code}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{sess.slot_time}</td>
                        <td style={{ padding: '10px 12px' }}>{sess.faculty_name}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#15803D' }}>{sess.present_count}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#7C3AED' }}>{sess.approved_od_count}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#DC2626' }}>{sess.absent_count}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#DCFCE7', color: '#15803D' }}>
                            SEALED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="app-btn app-btn-secondary" onClick={() => setHistoryModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
