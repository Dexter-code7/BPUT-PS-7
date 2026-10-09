import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  GraduationCap,
  Calendar,
  FileText,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Download,
  Search,
  Filter,
  Check,
  X,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Building,
  User,
  Layers,
  ChevronRight,
  Plus,
  RefreshCw,
  Edit3,
  Sliders,
  Send,
  Lock,
  Unlock,
  Sparkles
} from 'lucide-react';

export default function ExamsPage() {
  const { user, showToast } = useAuth();
  const isStudent = user?.profile_type === 'student';
  const role = user?.role_name || '';
  const canManage = ['system_admin', 'director', 'exam_admin', 'hod', 'teacher', 'admin_staff'].includes(role);
  const isExamAdmin = ['system_admin', 'director', 'exam_admin'].includes(role);

  // Core State
  const [activeTab, setActiveTab] = useState(isStudent ? 'admit-card' : 'roster'); // 'admit-card' | 'schedule' | 'results' | 'roster' | 'marks'
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [loading, setLoading] = useState(true);

  // Schedules State
  const [schedules, setSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSearch, setScheduleSearch] = useState('');

  // Admit Card State
  const [admitCardData, setAdmitCardData] = useState(null);
  const [admitCardLoading, setAdmitCardLoading] = useState(false);

  // Results State
  const [resultsData, setResultsData] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);

  // Admin Roster State
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterStatusFilter, setRosterStatusFilter] = useState('all');

  // Admin Marks Entry State
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [marksRoster, setMarksRoster] = useState([]);
  const [savingMarks, setSavingMarks] = useState(false);

  // Admin Create Schedule Modal
  const [createScheduleModal, setCreateScheduleModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    course_id: '',
    exam_date: '',
    start_time: '10:00:00',
    end_time: '13:00:00',
    shift_name: 'Morning Session (10:00 AM - 01:00 PM)',
    hall_name: 'LH-101 (Lecture Hall Complex)',
    seating_plan: 'Rows 1-6 (All Enrolled Candidates)',
    invigilator_name: 'Prof. Ashok Sharma'
  });

  // Load Sessions initially
  useEffect(() => {
    loadSessions();
  }, []);

  // When selected session changes, reload current tab data
  useEffect(() => {
    if (!selectedSessionId) return;
    if (activeTab === 'admit-card') loadAdmitCard();
    else if (activeTab === 'schedule') loadSchedules();
    else if (activeTab === 'results') loadResults();
    else if (activeTab === 'roster') loadRoster();
    else if (activeTab === 'marks') loadMarksRoster();
  }, [selectedSessionId, activeTab]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await api.getExamSessions();
      if (res.success && res.data?.sessions?.length) {
        setSessions(res.data.sessions);
        // Default to first session (or Autumn 2026)
        setSelectedSessionId(res.data.sessions[0].id);
      }
      // Also load courses for dropdowns
      const cRes = await api.getExamCourses();
      if (cRes.success) {
        setCourses(cRes.data.courses || []);
        if (cRes.data.courses?.length) {
          setSelectedCourseId(cRes.data.courses[0].id);
        }
      }
    } catch (err) {
      showToast('Failed to load examination sessions: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      setScheduleLoading(true);
      const res = await api.getExamSchedules({ session_id: selectedSessionId });
      if (res.success) {
        setSchedules(res.data.schedules || []);
      }
    } catch (err) {
      showToast('Failed to load exam timetable: ' + err.message, 'error');
    } finally {
      setScheduleLoading(false);
    }
  };

  const loadAdmitCard = async (studentProfileId = null) => {
    try {
      setAdmitCardLoading(true);
      const res = await api.getAdmitCard({
        session_id: selectedSessionId,
        student_profile_id: studentProfileId
      });
      if (res.success) {
        setAdmitCardData(res.data);
      }
    } catch (err) {
      showToast('Failed to load admit card: ' + err.message, 'error');
    } finally {
      setAdmitCardLoading(false);
    }
  };

  const loadResults = async (studentProfileId = null) => {
    try {
      setResultsLoading(true);
      const res = await api.getExamResults({
        session_id: selectedSessionId,
        student_profile_id: studentProfileId
      });
      if (res.success) {
        setResultsData(res.data);
      }
    } catch (err) {
      showToast('Failed to load results: ' + err.message, 'error');
    } finally {
      setResultsLoading(false);
    }
  };

  const loadRoster = async () => {
    try {
      setRosterLoading(true);
      const res = await api.getAdmitCardsRoster({
        session_id: selectedSessionId,
        status: rosterStatusFilter,
        search: rosterSearch
      });
      if (res.success) {
        setRoster(res.data.roster || []);
      }
    } catch (err) {
      showToast('Failed to load candidate roster: ' + err.message, 'error');
    } finally {
      setRosterLoading(false);
    }
  };

  const loadMarksRoster = async () => {
    if (!selectedCourseId) return;
    try {
      setRosterLoading(true);
      // Fetch roster of students and existing marks
      const rRes = await api.getAdmitCardsRoster({ session_id: selectedSessionId });
      if (rRes.success) {
        const studentList = rRes.data.roster || [];
        // Map into editable list with current marks or default
        const initMarks = studentList.map(s => ({
          student_profile_id: s.student_profile_id,
          roll_number: s.roll_number,
          student_name: s.student_name,
          internal_marks: 35,
          external_marks: 52
        }));
        setMarksRoster(initMarks);
      }
    } catch (err) {
      showToast('Failed to prepare marks entry: ' + err.message, 'error');
    } finally {
      setRosterLoading(false);
    }
  };

  // Admin Actions
  const handleToggleAdmitCard = async (studentProfileId, currentStatus) => {
    const nextStatus = currentStatus === 'issued' ? 'withheld' : 'issued';
    try {
      const res = await api.toggleAdmitCard({
        session_id: selectedSessionId,
        student_profile_id: studentProfileId,
        status: nextStatus,
        remarks: nextStatus === 'withheld' ? 'Withheld by Examination Cell' : 'Cleared for exam hall entry'
      });
      if (res.success) {
        showToast(res.data.message);
        loadRoster();
      }
    } catch (err) {
      showToast('Toggle failed: ' + err.message, 'error');
    }
  };

  const handleBulkReleaseCards = async () => {
    if (!window.confirm('Release and publish admit cards for all eligible candidates in this session?')) return;
    try {
      const res = await api.bulkReleaseAdmitCards({ session_id: selectedSessionId });
      if (res.success) {
        showToast(res.data.message);
        loadSessions();
        loadRoster();
      }
    } catch (err) {
      showToast('Bulk release failed: ' + err.message, 'error');
    }
  };

  const handleTogglePublishResults = async (publishFlag) => {
    const msg = publishFlag ? 'Publish official results for this examination session?' : 'Retract results to moderation mode?';
    if (!window.confirm(msg)) return;
    try {
      const res = await api.publishExamResults({
        session_id: selectedSessionId,
        publish: publishFlag
      });
      if (res.success) {
        showToast(res.data.message);
        loadSessions();
        if (activeTab === 'results') loadResults();
      }
    } catch (err) {
      showToast('Result action failed: ' + err.message, 'error');
    }
  };

  const handleMarksChange = (idx, field, val) => {
    const updated = [...marksRoster];
    updated[idx][field] = parseFloat(val) || 0;
    setMarksRoster(updated);
  };

  const handleSaveMarks = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !marksRoster.length) return;
    try {
      setSavingMarks(true);
      const res = await api.enterExamMarks({
        session_id: selectedSessionId,
        course_id: selectedCourseId,
        marks_list: marksRoster
      });
      if (res.success) {
        showToast(res.data.message);
      }
    } catch (err) {
      showToast('Marks save failed: ' + err.message, 'error');
    } finally {
      setSavingMarks(false);
    }
  };

  const handleCreateScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newSchedule.course_id || !newSchedule.exam_date) {
      showToast('Please select course and exam date.', 'error');
      return;
    }
    try {
      const res = await api.createExamSchedule({
        session_id: selectedSessionId,
        ...newSchedule
      });
      if (res.success) {
        showToast('Timetable slot created successfully!');
        setCreateScheduleModal(false);
        loadSchedules();
      }
    } catch (err) {
      showToast('Failed to create schedule: ' + err.message, 'error');
    }
  };

  const currentSession = sessions.find(s => String(s.id) === String(selectedSessionId));

  // Compute grade preview helper
  const getGradePreview = (tot) => {
    if (tot >= 90) return { grade: 'O', gp: 10, bg: '#dcfce7', color: '#166534' };
    if (tot >= 80) return { grade: 'A+', gp: 9, bg: '#f0fdf4', color: '#15803d' };
    if (tot >= 70) return { grade: 'A', gp: 8, bg: '#fef3c7', color: '#92400e' };
    if (tot >= 60) return { grade: 'B+', gp: 7, bg: '#ffedd5', color: '#9a3412' };
    if (tot >= 50) return { grade: 'B', gp: 6, bg: '#f3f4f6', color: '#374151' };
    if (tot >= 40) return { grade: 'C', gp: 5, bg: '#fef9c3', color: '#854d0e' };
    return { grade: 'F', gp: 0, bg: '#fee2e2', color: '#991b1b' };
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto' }}>

      {/* Top Breadcrumb & Phase Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            <span>Campus ERP</span>
            <ChevronRight size={12} />
            <span>Academic Affairs</span>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Examination Cell</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap size={26} style={{ color: 'var(--primary)' }} />
            Examination & Academic Performance Cell
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Official Hall Tickets, Examination Timetables, Marks Moderation & Institutional Grade Ledgers
          </p>
        </div>

        {/* Global Session Switcher & Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Active Examination Term
            </span>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-main)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '7px 12px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.academic_year})
                </option>
              ))}
            </select>
          </div>

          {isExamAdmin && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleBulkReleaseCards}
                className="btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px' }}
                title="Bulk publish admit cards for all eligible students"
              >
                <Unlock size={14} style={{ color: 'var(--primary)' }} />
                <span>Bulk Release Cards</span>
              </button>
              {currentSession?.results_published ? (
                <button
                  onClick={() => handleTogglePublishResults(false)}
                  className="btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px', borderColor: '#fca5a5', color: '#b91c1c' }}
                >
                  <Lock size={14} />
                  <span>Retract Results</span>
                </button>
              ) : (
                <button
                  onClick={() => handleTogglePublishResults(true)}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px' }}
                >
                  <Award size={14} />
                  <span>Publish Results</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Session Metadata Banner */}
      {currentSession && (
        <div style={{
          background: 'var(--surface-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Examination Term</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{currentSession.title}</div>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dates Window</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                {currentSession.start_date} to {currentSession.end_date}
              </div>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Chief Invigilator</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{currentSession.chief_invigilator_name}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              background: currentSession.admit_cards_published ? 'var(--primary-subtle)' : '#fef2f2',
              color: currentSession.admit_cards_published ? 'var(--primary)' : '#991b1b',
              border: `1px solid ${currentSession.admit_cards_published ? 'var(--primary-border)' : '#fecaca'}`
            }}>
              {currentSession.admit_cards_published ? <CheckCircle2 size={12} /> : <Clock size={12} />}
              {currentSession.admit_cards_published ? 'Admit Cards Live' : 'Admit Cards Withheld'}
            </span>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              background: currentSession.results_published ? '#ecfdf5' : '#fffbeb',
              color: currentSession.results_published ? '#065f46' : '#92400e',
              border: `1px solid ${currentSession.results_published ? '#a7f3d0' : '#fde68a'}`
            }}>
              {currentSession.results_published ? <Award size={12} /> : <Sliders size={12} />}
              {currentSession.results_published ? 'Results Declared' : 'Under Evaluation'}
            </span>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '24px', gap: '4px' }}>
        <button
          onClick={() => setActiveTab('admit-card')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'admit-card' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'admit-card' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileText size={16} />
          <span>Candidate Admit Card</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'schedule' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'schedule' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Calendar size={16} />
          <span>Examination Timetable</span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'results' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'results' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Award size={16} />
          <span>Official Grade Sheet & Results</span>
        </button>

        {canManage && (
          <button
            onClick={() => setActiveTab('roster')}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'roster' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'roster' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <User size={16} />
            <span>Admit Cards Roster (Admin)</span>
          </button>
        )}

        {canManage && (
          <button
            onClick={() => setActiveTab('marks')}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'marks' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'marks' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Edit3 size={16} />
            <span>Marks Entry & Moderation (Admin)</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          TAB 1: OFFICIAL CANDIDATE ADMIT CARD (HALL TICKET)
          ========================================================================= */}
      {activeTab === 'admit-card' && (
        <div>
          {admitCardLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading candidate hall ticket dossier...
            </div>
          ) : !admitCardData ? (
            <div style={{ padding: '60px', textAlign: 'center', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
              No admit card record found for this examination term.
            </div>
          ) : (
            <div>
              {/* Top Controls & Print Trigger */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Official Hall Ticket Verification Status:
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: admitCardData.admit_card?.status === 'issued' ? 'var(--primary-subtle)' : '#fee2e2',
                    color: admitCardData.admit_card?.status === 'issued' ? 'var(--primary)' : '#991b1b',
                    border: `1px solid ${admitCardData.admit_card?.status === 'issued' ? 'var(--primary-border)' : '#fecaca'}`
                  }}>
                    {admitCardData.admit_card?.status === 'issued' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                    {admitCardData.admit_card?.status === 'issued' ? 'OFFICIALLY ISSUED & VALID' : 'WITHHELD / PENDING CLEARANCE'}
                  </span>
                </div>

                <button
                  onClick={() => window.print()}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '8px 18px' }}
                >
                  <Printer size={16} />
                  <span>Print Official Hall Ticket</span>
                </button>
              </div>

              {/* Printable Hall Ticket Document Canvas */}
              <div
                id="printable-hall-ticket"
                style={{
                  background: '#ffffff',
                  border: '2px solid #14532D',
                  borderRadius: '6px',
                  padding: '36px 42px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  color: '#111827',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                {/* Institutional Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #14532D', paddingBottom: '16px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#14532D', fontWeight: 800 }}>
                    {admitCardData.institution_name}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginTop: '4px', letterSpacing: '-0.02em' }}>
                    OFFICE OF THE CONTROLLER OF EXAMINATIONS
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#4B5563', marginTop: '2px' }}>
                    {admitCardData.session?.title} ({admitCardData.session?.academic_year})
                  </div>
                  <div style={{
                    display: 'inline-block',
                    marginTop: '10px',
                    padding: '4px 16px',
                    background: '#14532D',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13px',
                    borderRadius: '4px',
                    letterSpacing: '0.04em'
                  }}>
                    EXAMINATION ADMIT CARD / HALL TICKET
                  </div>
                </div>

                {/* Statutory Attendance Debarment Notice if < 75% */}
                {Number(admitCardData.admit_card?.attendance_percentage) < 75 && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    padding: '12px 18px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertTriangle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
                      <div style={{ fontSize: '12px', color: '#991b1b', lineHeight: 1.4 }}>
                        <div style={{ fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                          Statutory Attendance Debarment Warning (BPUT / UGC Regulation 14.2)
                        </div>
                        <div>
                          Student attendance is {admitCardData.admit_card?.attendance_percentage}%, below the mandatory 75% threshold. Examination hall entry requires formal HOD Condonation Approval.
                        </div>
                      </div>
                    </div>
                    {canManage && admitCardData.admit_card?.eligibility_status !== 'condoned' && (
                      <button
                        onClick={async () => {
                          try {
                            const res = await api.toggleAdmitCard({
                              student_profile_id: admitCardData.student?.id,
                              session_id: selectedSessionId,
                              status: 'issued',
                              remarks: 'Statutory HOD Condonation Granted (Medical Exemption Clause 14.3)'
                            });
                            if (res.success) {
                              showToast('HOD Statutory Condonation successfully granted.', 'success');
                              loadAdmitCard(admitCardData.student?.id);
                            }
                          } catch (err) {
                            showToast(err.message, 'error');
                          }
                        }}
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '6px 14px',
                          background: '#ffffff',
                          border: '1px solid #dc2626',
                          color: '#dc2626',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Grant HOD Condonation Override
                      </button>
                    )}
                  </div>
                )}

                {/* Candidate Particulars & Security Seal */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '24px', marginBottom: '24px' }}>
                  {/* Candidate Info Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 20px', fontSize: '13px' }}>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600 }}>Candidate Full Name</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{admitCardData.student?.full_name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600 }}>University Roll Number</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#14532D', fontFamily: 'monospace' }}>
                        {admitCardData.student?.roll_number}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600 }}>Registration Number</div>
                      <div style={{ fontWeight: 600, color: '#374151', fontFamily: 'monospace' }}>
                        {admitCardData.student?.registration_number}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600 }}>Academic Program</div>
                      <div style={{ fontWeight: 600, color: '#374151' }}>
                        {admitCardData.student?.program_name} (Sem {admitCardData.student?.current_semester})
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600 }}>Department</div>
                      <div style={{ fontWeight: 600, color: '#374151' }}>{admitCardData.student?.department_name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600 }}>Admit Card Number</div>
                      <div style={{ fontWeight: 700, color: '#111827', fontFamily: 'monospace' }}>
                        {admitCardData.admit_card?.admit_card_number}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600 }}>Allotted Exam Center</div>
                      <div style={{ fontWeight: 600, color: '#374151' }}>{admitCardData.session?.exam_center_name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600 }}>Seating Allotment</div>
                      <div style={{ fontWeight: 700, color: '#14532D' }}>
                        {admitCardData.admit_card?.seating_hall_allotment || 'Main Hall - Desk 24'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600 }}>Statutory Attendance (75% UGC Rule)</div>
                      <div style={{
                        fontWeight: 700,
                        color: Number(admitCardData.admit_card?.attendance_percentage) >= 75 ? '#166534' : '#991b1b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>{admitCardData.admit_card?.attendance_percentage}%</span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: Number(admitCardData.admit_card?.attendance_percentage) >= 75 ? '#dcfce7' : '#fee2e2',
                          color: Number(admitCardData.admit_card?.attendance_percentage) >= 75 ? '#166534' : '#991b1b'
                        }}>
                          {Number(admitCardData.admit_card?.attendance_percentage) >= 75
                            ? 'COMPLIANT'
                            : admitCardData.admit_card?.eligibility_status === 'condoned'
                            ? 'CONDONED BY HOD'
                            : 'DEBARMENT RISK'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600 }}>Fee Clearance</div>
                      <div style={{ fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                        {admitCardData.admit_card?.fee_clearance_status}
                      </div>
                    </div>
                  </div>

                  {/* Candidate Photo & Barcode Seal Box */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed #9CA3AF', borderRadius: '4px', padding: '12px', background: '#F9FAFB' }}>
                    <div style={{
                      width: '100px',
                      height: '110px',
                      background: '#E5E7EB',
                      border: '1px solid #D1D5DB',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      color: '#6B7280',
                      textAlign: 'center',
                      marginBottom: '8px'
                    }}>
                      <User size={36} style={{ color: '#9CA3AF', marginBottom: '4px' }} />
                      <span>Candidate Photo</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '9px', fontFamily: 'monospace', color: '#4B5563', wordBreak: 'break-all', fontWeight: 600 }}>
                        {admitCardData.admit_card?.qr_security_hash}
                      </div>
                      <div style={{ fontSize: '9px', color: '#6B7280', marginTop: '2px' }}>
                        Digital Security Seal
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timetable of Registered Papers */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, color: '#14532D', marginBottom: '8px' }}>
                    Registered Examination Subjects & Timetable
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #E5E7EB' }}>
                    <thead>
                      <tr style={{ background: '#F3F4F6', borderBottom: '1px solid #D1D5DB' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Course Code</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Subject Title</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#374151' }}>Date</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#374151' }}>Session / Time</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#374151' }}>Exam Hall</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#374151' }}>Invigilator Sign</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admitCardData.exam_papers?.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ padding: '16px', textAlign: 'center', color: '#6B7280' }}>
                            No courses registered for this examination term.
                          </td>
                        </tr>
                      ) : (
                        admitCardData.exam_papers?.map((paper, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: '#111827', fontFamily: 'monospace' }}>
                              {paper.course_code}
                            </td>
                            <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1F2937' }}>
                              {paper.course_name}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#111827' }}>
                              {paper.exam_date}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', color: '#4B5563' }}>
                              10:00 AM - 01:00 PM
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', color: '#4B5563' }}>
                              {paper.hall_name}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', color: '#9CA3AF' }}>
                              [ .................... ]
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Candidate Instructions */}
                <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '4px', padding: '14px 18px', fontSize: '11px', color: '#4B5563', marginBottom: '28px' }}>
                  <div style={{ fontWeight: 700, color: '#111827', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Important Instructions for the Candidate:
                  </div>
                  <ol style={{ margin: 0, paddingLeft: '18px', lineHeight: '1.6' }}>
                    <li>This Admit Card must be presented at the examination hall alongside the verified University Photo Identity Card.</li>
                    <li>Candidates must take their designated seats at least 20 minutes prior to the scheduled start time. Late arrivals beyond 30 minutes will not be admitted.</li>
                    <li>Possession of mobile phones, smartwatches, digital devices, notes, or unauthorized aids inside the examination hall constitutes gross academic malpractice.</li>
                    <li>Candidates must preserve this Admit Card securely until the final declaration of institutional semester results and grade cards.</li>
                  </ol>
                </div>

                {/* Signatures Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '20px', borderTop: '1px solid #E5E7EB' }}>
                  <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ borderBottom: '1px solid #9CA3AF', height: '36px', marginBottom: '6px' }} />
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#4B5563' }}>Candidate Signature</div>
                  </div>

                  <div style={{ textAlign: 'center', width: '220px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#14532D', fontFamily: 'serif', fontStyle: 'italic', marginBottom: '4px' }}>
                      Vandana Saxena
                    </div>
                    <div style={{ borderBottom: '1px solid #9CA3AF', marginBottom: '6px' }} />
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#111827' }}>Controller of Examinations</div>
                    <div style={{ fontSize: '10px', color: '#6B7280' }}>Central University of Technology</div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: EXAMINATION TIMETABLE / DATESHEET
          ========================================================================= */}
      {activeTab === 'schedule' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px',
                width: '280px'
              }}>
                <Search size={14} style={{ color: 'var(--text-muted)', marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="Filter by subject or code..."
                  value={scheduleSearch}
                  onChange={(e) => setScheduleSearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%', color: 'var(--text-main)' }}
                />
              </div>
            </div>

            {canManage && (
              <button
                onClick={() => setCreateScheduleModal(true)}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}
              >
                <Plus size={16} />
                <span>Add Timetable Slot</span>
              </button>
            )}
          </div>

          {scheduleLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading examination schedules...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {schedules
                .filter(s =>
                  !scheduleSearch ||
                  s.course_code.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
                  s.course_name.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
                  s.hall_name.toLowerCase().includes(scheduleSearch.toLowerCase())
                )
                .map((slot, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                      {/* Date Badge */}
                      <div style={{
                        background: 'var(--surface-subtle)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        textAlign: 'center',
                        minWidth: '85px'
                      }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                          {new Date(slot.exam_date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', lineHeight: '1.1' }}>
                          {new Date(slot.exam_date).getDate()}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {new Date(slot.exam_date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                      </div>

                      {/* Course Particulars */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            background: 'var(--primary-subtle)',
                            color: 'var(--primary)',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            {slot.course_code}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {slot.program_name} (Semester {slot.semester}) • {slot.credits} Credits
                          </span>
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {slot.course_name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} style={{ color: 'var(--primary)' }} />
                            {slot.shift_name}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building size={13} style={{ color: 'var(--text-muted)' }} />
                            {slot.hall_name}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={13} style={{ color: 'var(--text-muted)' }} />
                            Invigilator: {slot.invigilator_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Countdown Pill */}
                    <div>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: slot.days_left > 0 ? 'var(--primary-subtle)' : slot.days_left === 0 ? '#fef3c7' : '#f3f4f6',
                        color: slot.days_left > 0 ? 'var(--primary)' : slot.days_left === 0 ? '#92400e' : '#6b7280',
                        border: `1px solid ${slot.days_left > 0 ? 'var(--primary-border)' : slot.days_left === 0 ? '#fde68a' : '#e5e7eb'}`
                      }}>
                        <Clock size={13} />
                        {slot.time_badge}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: OFFICIAL GRADE SHEET & SEMESTER RESULTS
          ========================================================================= */}
      {activeTab === 'results' && (
        <div>
          {resultsLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Retrieving institutional grade ledger...
            </div>
          ) : !resultsData ? (
            <div style={{ padding: '60px', textAlign: 'center', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
              No results recorded for this examination session.
            </div>
          ) : (
            <div>
              {/* Results Declaration Notice / Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: resultsData.is_declared ? '#ecfdf5' : '#fffbeb',
                    color: resultsData.is_declared ? '#065f46' : '#92400e',
                    border: `1px solid ${resultsData.is_declared ? '#a7f3d0' : '#fde68a'}`
                  }}>
                    <Award size={14} />
                    {resultsData.is_declared ? 'OFFICIALLY PUBLISHED & SEALED' : 'UNDER PROVISIONAL MODERATION'}
                  </span>
                </div>

                <button
                  onClick={() => window.print()}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '8px 18px' }}
                >
                  <Printer size={16} />
                  <span>Print Grade Transcript</span>
                </button>
              </div>

              {/* Performance Metric Counters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Semester Grade Point Average (SGPA)</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                    {resultsData.summary?.sgpa || '0.00'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>UGC 10-Point Scale</div>
                </div>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Cumulative GPA (CGPA)</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                    {resultsData.summary?.cgpa || '0.00'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>All Completed Semesters</div>
                </div>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Credits Earned</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                    {resultsData.summary?.total_credits_earned || 0} / {resultsData.summary?.total_credits_registered || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>100% Credit Fulfillment</div>
                </div>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Institutional Standing</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginTop: '8px' }}>
                    {resultsData.summary?.classification || 'First Class with Distinction'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Active Backlogs: {resultsData.summary?.backlog_count || 0}
                  </div>
                </div>
              </div>

              {/* Printable Grade Card Sheet */}
              <div
                id="printable-grade-sheet"
                style={{
                  background: '#ffffff',
                  border: '2px solid #14532D',
                  borderRadius: '6px',
                  padding: '36px 42px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  color: '#111827'
                }}
              >
                {/* Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #14532D', paddingBottom: '16px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#14532D', fontWeight: 800 }}>
                    {resultsData.institution_name}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginTop: '4px' }}>
                    SEMESTER GRADE REPORT & ACADEMIC TRANSCRIPT
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#4B5563', marginTop: '2px' }}>
                    {resultsData.session?.title} • Session {resultsData.session?.academic_year}
                  </div>
                </div>

                {/* Candidate Particulars */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '12px', marginBottom: '24px', background: '#F9FAFB', padding: '14px 18px', borderRadius: '4px', border: '1px solid #E5E7EB' }}>
                  <div>
                    <span style={{ color: '#6B7280' }}>Student Name:</span>
                    <div style={{ fontWeight: 700, color: '#111827' }}>{resultsData.student?.full_name}</div>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280' }}>Roll Number:</span>
                    <div style={{ fontWeight: 800, color: '#14532D', fontFamily: 'monospace' }}>{resultsData.student?.roll_number}</div>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280' }}>Registration No:</span>
                    <div style={{ fontWeight: 600, color: '#374151', fontFamily: 'monospace' }}>{resultsData.student?.registration_number}</div>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280' }}>Program & Semester:</span>
                    <div style={{ fontWeight: 600, color: '#374151' }}>{resultsData.student?.program_name} (Sem {resultsData.student?.current_semester})</div>
                  </div>
                </div>

                {/* Course Evaluation Breakdown Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
                  <thead>
                    <tr style={{ background: '#F3F4F6', borderBottom: '1px solid #D1D5DB' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700 }}>Course Code</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700 }}>Subject Title</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>Credits</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>Internal (40)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>End-Sem (60)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>Total (100)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>Grade Letter</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>Grade Points</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsData.course_marks?.map((cm, idx) => {
                      const gradeMeta = getGradePreview(cm.total_marks);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'monospace' }}>{cm.course_code}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{cm.course_name}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600 }}>{cm.credits}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>{cm.internal_marks}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>{cm.external_marks}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>{cm.total_marks}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 800,
                              background: gradeMeta.bg,
                              color: gradeMeta.color
                            }}>
                              {cm.grade_letter}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>{cm.grade_points}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: cm.result_status === 'pass' ? '#dcfce7' : '#fee2e2',
                              color: cm.result_status === 'pass' ? '#166534' : '#991b1b'
                            }}>
                              {cm.result_status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Ledger Summary Footnote */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '11px', color: '#6B7280', maxWidth: '400px', lineHeight: '1.5' }}>
                    <strong>Grading Scale:</strong> O (90-100%, 10 pts) • A+ (80-89%, 9 pts) • A (70-79%, 8 pts) • B+ (60-69%, 7 pts) • B (50-59%, 6 pts) • C (40-49%, 5 pts) • F (Below 40%, 0 pts).
                  </div>

                  <div style={{ textAlign: 'center', width: '220px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#14532D', fontFamily: 'serif', fontStyle: 'italic', marginBottom: '4px' }}>
                      Vandana Saxena
                    </div>
                    <div style={{ borderBottom: '1px solid #9CA3AF', marginBottom: '6px' }} />
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#111827' }}>{resultsData.controller_sign}</div>
                    <div style={{ fontSize: '10px', color: '#6B7280' }}>Verified Institutional Transcript</div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: ADMIN ADMIT CARDS ROSTER CONTROLLER
          ========================================================================= */}
      {activeTab === 'roster' && canManage && (
        <div>
          {/* Controls Ribbon */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px',
                width: '280px'
              }}>
                <Search size={14} style={{ color: 'var(--text-muted)', marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="Search student or roll number..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadRoster()}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%', color: 'var(--text-main)' }}
                />
              </div>

              <select
                value={rosterStatusFilter}
                onChange={(e) => { setRosterStatusFilter(e.target.value); setTimeout(loadRoster, 50); }}
                style={{
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Card Statuses</option>
                <option value="issued">Issued & Valid</option>
                <option value="withheld">Withheld</option>
              </select>

              <button
                onClick={loadRoster}
                className="btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '7px 12px' }}
              >
                <RefreshCw size={13} />
                <span>Refresh</span>
              </button>
            </div>

            <button
              onClick={handleBulkReleaseCards}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}
            >
              <Unlock size={14} />
              <span>Bulk Release All Eligible</span>
            </button>
          </div>

          {rosterLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading candidate eligibility roster...
            </div>
          ) : (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Roll Number</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Candidate Name</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Program & Sem</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>Attendance %</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>Fee Status</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>Admit Card Status</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>
                        {row.roll_number}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {row.student_name}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                        {row.program_code} (Sem {row.current_semester})
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: parseFloat(row.attendance_percentage || 85) >= 75 ? '#16a34a' : '#dc2626' }}>
                        {row.attendance_percentage || '85.00'}%
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: row.fee_clearance_status === 'cleared' ? '#dcfce7' : '#fee2e2',
                          color: row.fee_clearance_status === 'cleared' ? '#166534' : '#991b1b',
                          textTransform: 'uppercase'
                        }}>
                          {row.fee_clearance_status || 'cleared'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '14px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: row.status === 'issued' ? 'var(--primary-subtle)' : '#fef2f2',
                          color: row.status === 'issued' ? 'var(--primary)' : '#991b1b',
                          border: `1px solid ${row.status === 'issued' ? 'var(--primary-border)' : '#fecaca'}`
                        }}>
                          {row.status === 'issued' ? 'ISSUED & ACTIVE' : 'WITHHELD'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => {
                              loadAdmitCard(row.student_profile_id);
                              setActiveTab('admit-card');
                            }}
                            className="btn-outline"
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                          >
                            View Card
                          </button>
                          <button
                            onClick={() => handleToggleAdmitCard(row.student_profile_id, row.status)}
                            className="btn-outline"
                            style={{
                              fontSize: '11px',
                              padding: '4px 10px',
                              color: row.status === 'issued' ? '#dc2626' : 'var(--primary)',
                              borderColor: row.status === 'issued' ? '#fecaca' : 'var(--primary-border)'
                            }}
                          >
                            {row.status === 'issued' ? 'Withhold' : 'Issue Card'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: ADMIN MARKS ENTRY & MODERATION
          ========================================================================= */}
      {activeTab === 'marks' && canManage && (
        <div>
          {/* Header Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Select Course / Subject For Marks Entry
                </span>
                <select
                  value={selectedCourseId}
                  onChange={(e) => { setSelectedCourseId(e.target.value); setTimeout(loadMarksRoster, 50); }}
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    padding: '7px 12px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name} ({c.program_code} Sem {c.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '16px' }}>
                Maximum: Internal (40 Marks) + External (60 Marks) = 100 Marks
              </div>
            </div>

            <button
              onClick={handleSaveMarks}
              disabled={savingMarks}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 18px' }}
            >
              <Check size={16} />
              <span>{savingMarks ? 'Saving Records...' : 'Save & Submit Evaluation Roster'}</span>
            </button>
          </div>

          {/* Marks Entry Table */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Roll Number</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Candidate Name</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>Internal (Max 40)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>End-Sem (Max 60)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>Total (100)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>Calculated Grade</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>Grade Points</th>
                </tr>
              </thead>
              <tbody>
                {marksRoster.map((m, idx) => {
                  const total = (parseFloat(m.internal_marks) || 0) + (parseFloat(m.external_marks) || 0);
                  const preview = getGradePreview(total);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>
                        {m.roll_number}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {m.student_name}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          max="40"
                          value={m.internal_marks}
                          onChange={(e) => handleMarksChange(idx, 'internal_marks', e.target.value)}
                          style={{
                            width: '70px',
                            padding: '6px 8px',
                            textAlign: 'center',
                            fontSize: '13px',
                            fontWeight: 700,
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            background: 'var(--surface-subtle)',
                            color: 'var(--text-main)'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={m.external_marks}
                          onChange={(e) => handleMarksChange(idx, 'external_marks', e.target.value)}
                          style={{
                            width: '70px',
                            padding: '6px 8px',
                            textAlign: 'center',
                            fontSize: '13px',
                            fontWeight: 700,
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            background: 'var(--surface-subtle)',
                            color: 'var(--text-main)'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, fontSize: '14px' }}>
                        {total.toFixed(1)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '4px',
                          fontWeight: 800,
                          fontSize: '12px',
                          background: preview.bg,
                          color: preview.color
                        }}>
                          {preview.grade}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {preview.gp}.0
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          CREATE SCHEDULE MODAL
          ========================================================================= */}
      {createScheduleModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px 28px',
            width: '480px',
            maxWidth: '90%',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                Add Examination Timetable Slot
              </h3>
              <button onClick={() => setCreateScheduleModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Course / Subject *
                </label>
                <select
                  required
                  value={newSchedule.course_id}
                  onChange={(e) => setNewSchedule({ ...newSchedule, course_id: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--border)' }}
                >
                  <option value="">Select course...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name} ({c.program_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Exam Date *
                </label>
                <input
                  type="date"
                  required
                  value={newSchedule.exam_date}
                  onChange={(e) => setNewSchedule({ ...newSchedule, exam_date: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--border)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Shift / Timing Label
                </label>
                <input
                  type="text"
                  value={newSchedule.shift_name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, shift_name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--border)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Examination Hall / Room Venue
                </label>
                <input
                  type="text"
                  value={newSchedule.hall_name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, hall_name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--border)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Duty Invigilator
                </label>
                <input
                  type="text"
                  value={newSchedule.invigilator_name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, invigilator_name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--border)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCreateScheduleModal(false)}
                  className="btn-outline"
                  style={{ padding: '8px 14px', fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '12px' }}
                >
                  Save Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
