import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatTime12, formatDateTime12, formatDate12 } from '../utils/dateUtils';
import {
  Bell,
  AlertCircle,
  FileText,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  Pin,
  ExternalLink,
  Download,
  Users,
  ShieldAlert,
  Building,
  GraduationCap,
  Home,
  Tag,
  Eye,
  CheckCheck,
  X,
  FileCheck2,
  Calendar,
  AlertTriangle,
  UploadCloud,
  Mail,
  Send,
  History,
  Settings,
  Play,
  Moon,
  Sun,
  RefreshCw,
  Sliders,
  Check,
  Zap,
  ShieldCheck
} from 'lucide-react';

export default function NoticesPage() {
  const { user, showToast } = useAuth();
  const [notices, setNotices] = useState([]);
  const [counts, setCounts] = useState({ total: 0, unread: 0, urgent: 0, mandatory_pending: 0 });
  const [canPublish, setCanPublish] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Modals & Drawers
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [auditData, setAuditData] = useState(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  // Automated SLA Reminders System State (Administrator Level)
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'automation'
  const [automationSettings, setAutomationSettings] = useState({
    is_enabled: true,
    interval_hours: 1,
    quiet_hours_enabled: true,
    quiet_hours_start: '00:00',
    quiet_hours_end: '05:00',
    max_reminders_per_student: 5,
    initial_delay_hours: 1,
    custom_directive_note: 'Urgent Notice: This is an automated periodic reminder. You are mandated to submit your formal acknowledgment immediately.'
  });
  const [automationDiagnostics, setAutomationDiagnostics] = useState(null);
  const [automationQueue, setAutomationQueue] = useState([]);
  const [automationLogs, setAutomationLogs] = useState([]);
  const [loadingAutomation, setLoadingAutomation] = useState(false);
  const [savingAutomation, setSavingAutomation] = useState(false);
  const [runningAutomation, setRunningAutomation] = useState(false);
  const [bypassQuietForTest, setBypassQuietForTest] = useState(false);
  const [bypassIntervalForTest, setBypassIntervalForTest] = useState(false);
  const [lastRunResult, setLastRunResult] = useState(null);

  // Email Reminder System State
  const [studentReminders, setStudentReminders] = useState([]);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [dispatchReminderModalOpen, setDispatchReminderModalOpen] = useState(false);
  const [reminderCustomNote, setReminderCustomNote] = useState('Final notice: please submit your mandatory institutional acknowledgment immediately.');
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderHistory, setReminderHistory] = useState([]);

  // Publish Form State
  const [publishForm, setPublishForm] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    target_scope: 'all',
    department_id: '',
    semester: '',
    section: '',
    hostel_name: '',
    target_tag_id: '',
    reference_circular_no: '',
    requires_acknowledgment: false,
    auto_reminders_enabled: true,
    is_pinned: false,
    attachment_name: '',
    attachment_size: '',
    expires_at: ''
  });
  const [publishing, setPublishing] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Acknowledgment State
  const [acknowledging, setAcknowledging] = useState(false);
  const [ackNote, setAckNote] = useState('');

  // Master Data
  const [departments, setDepartments] = useState([]);

  const isAdminOrStaff = user && ['system_admin', 'director', 'admin_staff', 'admin', 'exam_admin', 'hod', 'warden'].includes(user.role_name);

  useEffect(() => {
    loadNotices();
    loadMasterData();
    if (user?.profile_type === 'student') {
      loadStudentReminders();
    }
    if (isAdminOrStaff && activeTab === 'automation') {
      loadAutomationData();
    }
  }, [priorityFilter, categoryFilter, unreadOnly, activeTab]);

  const loadAutomationData = async () => {
    try {
      setLoadingAutomation(true);
      const [settingsRes, logsRes] = await Promise.all([
        api.getNoticeAutomationSettings(),
        api.getNoticeAutomatedLogs()
      ]);
      if (settingsRes.success) {
        setAutomationSettings(settingsRes.data.settings);
        setAutomationDiagnostics(settingsRes.data.diagnostics);
        setAutomationQueue(settingsRes.data.queue || []);
      }
      if (logsRes.success) {
        setAutomationLogs(logsRes.data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load automation SLA data', err);
    } finally {
      setLoadingAutomation(false);
    }
  };

  const handleSaveAutomation = async (e) => {
    if (e) e.preventDefault();
    try {
      setSavingAutomation(true);
      const res = await api.updateNoticeAutomationSettings(automationSettings);
      if (res.success) {
        showToast('Automated Notice Reminder SLA settings updated successfully!');
        loadAutomationData();
      }
    } catch (err) {
      showToast('Failed to save SLA settings: ' + err.message, 'error');
    } finally {
      setSavingAutomation(false);
    }
  };

  const handleRunAutomationCycle = async () => {
    try {
      setRunningAutomation(true);
      const res = await api.runNoticeAutomatedCycle({
        force_bypass_quiet: bypassQuietForTest,
        force_bypass_interval: bypassIntervalForTest
      });
      if (res.success) {
        setLastRunResult(res.data);
        if (res.data.status === 'suppressed_quiet_hours') {
          showToast('Night Quiet Window Active (12:00 AM – 05:00 AM): Reminder emails deferred until 05:00 AM.', 'info');
        } else if (res.data.dispatched_count > 0) {
          showToast(`Automated cycle completed: Dispatched ${res.data.dispatched_count} reminder emails to non-compliant students.`);
        } else {
          showToast('Automated cycle evaluated: No unacknowledged students are currently due for reminder dispatch.', 'info');
        }
        loadAutomationData();
      }
    } catch (err) {
      showToast('Automated cycle execution failed: ' + err.message, 'error');
    } finally {
      setRunningAutomation(false);
    }
  };

  const loadStudentReminders = async () => {
    try {
      const res = await api.getMyEmailReminders();
      if (res.success) {
        setStudentReminders(res.data.reminders || []);
      }
    } catch (err) {
      console.error('Failed to load email reminders', err);
    }
  };

  const loadReminderHistory = async (noticeId) => {
    try {
      const res = await api.getNoticeReminderHistory(noticeId);
      if (res.success) {
        setReminderHistory(res.data.history || []);
      }
    } catch (err) {
      console.error('Failed to load reminder history', err);
    }
  };

  const loadNotices = async () => {
    try {
      setLoading(true);
      const res = await api.getNotices({
        search,
        priority: priorityFilter,
        category: categoryFilter,
        unread_only: unreadOnly
      });
      if (res.success) {
        setNotices(res.data.notices || []);
        setCounts(res.data.counts || { total: 0, unread: 0, urgent: 0, mandatory_pending: 0 });
        setCanPublish(res.data.can_publish || false);
      }
    } catch (err) {
      showToast('Failed to load campus notices: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMasterData = async () => {
    try {
      const res = await api.getDepartments();
      if (res.success) {
        setDepartments(res.data.departments || []);
      }
    } catch (err) {
      console.error('Failed to load master departments', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadNotices();
  };

  // Open Full Official Circular
  const openNoticeDetail = async (noticeId) => {
    try {
      const res = await api.getNoticeDetail(noticeId);
      if (res.success) {
        setSelectedNotice(res.data.notice);
        setAuditData(res.data.audit || null);
        setViewModalOpen(true);
        // Refresh feed list so unread counter and read status update immediately
        loadNotices();
      }
    } catch (err) {
      showToast('Error opening circular: ' + err.message, 'error');
    }
  };

  // Open Audit Drawer directly
  const openAuditDrawer = async (noticeId) => {
    try {
      const res = await api.getNoticeDetail(noticeId);
      if (res.success) {
        setSelectedNotice(res.data.notice);
        setAuditData(res.data.audit || null);
        setAuditDrawerOpen(true);
        loadReminderHistory(noticeId);
      }
    } catch (err) {
      showToast('Error opening compliance audit: ' + err.message, 'error');
    }
  };

  // Dispatch Reminder Emails to Non-Compliant Students
  const handleSendReminder = async () => {
    if (!selectedNotice) return;
    try {
      setSendingReminder(true);
      const res = await api.sendNoticeReminder({
        notice_id: selectedNotice.id,
        custom_note: reminderCustomNote
      });
      if (res.success) {
        showToast(res.data.message || `Dispatched reminders to ${res.data.recipient_count} pending students!`);
        setDispatchReminderModalOpen(false);
        // Refresh audit roster and history
        const detailRes = await api.getNoticeDetail(selectedNotice.id);
        if (detailRes.success) {
          setAuditData(detailRes.data.audit);
        }
        loadReminderHistory(selectedNotice.id);
      }
    } catch (err) {
      showToast('Failed to dispatch reminders: ' + err.message, 'error');
    } finally {
      setSendingReminder(false);
    }
  };

  // Submit Formal Acknowledgment
  const handleAcknowledge = async () => {
    if (!selectedNotice) return;
    try {
      setAcknowledging(true);
      const res = await api.acknowledgeNotice({
        notice_id: selectedNotice.id,
        note: ackNote || 'Acknowledged and registered by student'
      });
      if (res.success) {
        showToast('Institutional compliance acknowledgment registered successfully!');
        setSelectedNotice({
          ...selectedNotice,
          is_acknowledged: true,
          acknowledged_at: res.data.acknowledged_at
        });
        loadNotices();
      }
    } catch (err) {
      showToast('Acknowledgment failed: ' + err.message, 'error');
    } finally {
      setAcknowledging(false);
    }
  };

  // Submit Notice Publication
  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    if (!publishForm.title.trim() || !publishForm.content.trim()) {
      showToast('Notice title and body content are required.', 'error');
      return;
    }
    try {
      setPublishing(true);
      const res = await api.createNotice(publishForm);
      if (res.success) {
        showToast(`Official directive published: ${res.data.notice_number}`);
        setPublishModalOpen(false);
        // Reset form
        setPublishForm({
          title: '',
          content: '',
          category: 'general',
          priority: 'normal',
          target_scope: 'all',
          department_id: '',
          semester: '',
          section: '',
          hostel_name: '',
          target_tag_id: '',
          reference_circular_no: '',
          requires_acknowledgment: false,
          auto_reminders_enabled: true,
          is_pinned: false,
          attachment_name: '',
          attachment_url: '',
          attachment_size: '',
          expires_at: ''
        });
        loadNotices();
      }
    } catch (err) {
      showToast('Publication failed: ' + err.message, 'error');
    } finally {
      setPublishing(false);
    }
  };

  // Toggle Automated Reminders on a specific notice
  const handleToggleNoticeAutoReminder = async (noticeId, currentStatus) => {
    try {
      const res = await api.toggleNoticeAutoReminder(noticeId, !currentStatus);
      if (res.success) {
        showToast(res.data.message || 'Auto-reminder status updated successfully.');
        if (selectedNotice && selectedNotice.id === noticeId) {
          setSelectedNotice((prev) => ({
            ...prev,
            auto_reminders_enabled: !currentStatus
          }));
        }
        if (activeTab === 'automation') {
          loadAutomationData();
        }
        loadNotices();
      }
    } catch (err) {
      showToast('Failed to toggle auto-reminders: ' + err.message, 'error');
    }
  };

  // Real File Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAttachment(true);
      const res = await api.uploadNoticeAttachment(file);
      if (res.success) {
        showToast('Document uploaded successfully to university repository!');
        setPublishForm((prev) => ({
          ...prev,
          attachment_name: res.data.attachment_name,
          attachment_url: res.data.attachment_url,
          attachment_size: res.data.attachment_size
        }));
      }
    } catch (err) {
      showToast('File upload failed: ' + err.message, 'error');
    } finally {
      setUploadingAttachment(false);
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = () => {
    setPublishForm((prev) => ({
      ...prev,
      attachment_name: '',
      attachment_url: '',
      attachment_size: ''
    }));
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            background: '#FEE2E2',
            color: '#991B1B',
            border: '1px solid #FCA5A5'
          }}>
            <ShieldAlert size={12} />
            Urgent Directive
          </span>
        );
      case 'circular':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            background: 'var(--primary-subtle)',
            color: 'var(--primary)',
            border: '1px solid var(--primary-border)'
          }}>
            <FileText size={12} />
            Statutory Circular
          </span>
        );
      case 'important':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            background: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #FCD34D'
          }}>
            <AlertTriangle size={12} />
            Important
          </span>
        );
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            background: 'var(--surface-active)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)'
          }}>
            Notice
          </span>
        );
    }
  };

  const getScopeBadge = (notice) => {
    const scope = notice.target_scope;
    let label = 'University-Wide';
    let icon = <Building size={12} />;

    if (scope === 'department') {
      label = `Dept: ${notice.department_code || 'Academic'}${notice.semester ? ` · Sem ${notice.semester}` : ''}`;
      icon = <GraduationCap size={12} />;
    } else if (scope === 'semester') {
      label = `Semester ${notice.semester} Only`;
      icon = <GraduationCap size={12} />;
    } else if (scope === 'section') {
      label = `Dept: ${notice.department_code || 'CSE'} · Sem ${notice.semester || 1} · Sec ${notice.section || 'A'}`;
      icon = <Users size={12} />;
    } else if (scope === 'hostel') {
      label = `Hostel: ${notice.hostel_name || 'Residents'}`;
      icon = <Home size={12} />;
    } else if (scope === 'tag') {
      label = `Designation: ${notice.target_tag_name || 'Class Reps'}`;
      icon = <Tag size={12} />;
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 600,
        background: 'var(--canvas)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-subtle)'
      }}>
        {icon}
        {label}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header & Operational Metrics Bar */}
      <div className="surface-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--primary-border)'
              }}>
                <Bell size={20} />
              </div>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Institutional Notice Board & Statutory Circulars
                </h1>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Authoritative campus directives, departmental gazettes, and statutory regulatory compliance tracking
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {isAdminOrStaff && (
              <div style={{
                display: 'inline-flex',
                background: 'var(--canvas)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                gap: '3px'
              }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('feed')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTab === 'feed' ? 'var(--primary)' : 'transparent',
                    color: activeTab === 'feed' ? '#FFFFFF' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Circulars Feed
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('automation');
                    loadAutomationData();
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTab === 'automation' ? 'var(--primary)' : 'transparent',
                    color: activeTab === 'automation' ? '#FFFFFF' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Clock size={13} />
                  <span>Automated Reminders SLA</span>
                  {automationDiagnostics?.is_quiet_hours ? (
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: 700,
                      background: activeTab === 'automation' ? '#FEE2E2' : '#FEF3C7',
                      color: activeTab === 'automation' ? '#991B1B' : '#92400E'
                    }}>
                      Quiet Hours
                    </span>
                  ) : null}
                </button>
              </div>
            )}
            {canPublish && (
              <button
                className="app-btn app-btn-primary"
                onClick={() => setPublishModalOpen(true)}
              >
                <Plus size={16} />
                <span>Promulgate Official Directive</span>
              </button>
            )}
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ padding: '14px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Audience Feed</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{counts.total}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Scoped to your verified enrollment</div>
          </div>

          <div style={{ padding: '14px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>Unread Notices</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: counts.unread > 0 ? 'var(--primary)' : 'var(--text-primary)', marginTop: '4px' }}>
              {counts.unread}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Requires your attention</div>
          </div>

          <div style={{ padding: '14px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: '#B91C1C', fontWeight: 600, textTransform: 'uppercase' }}>Urgent Directives</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#B91C1C', marginTop: '4px' }}>{counts.urgent}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>High priority campus circulars</div>
          </div>

          <div style={{
            padding: '14px',
            background: counts.mandatory_pending > 0 ? '#FEF2F2' : 'var(--canvas)',
            borderRadius: '6px',
            border: counts.mandatory_pending > 0 ? '1px solid #FCA5A5' : '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '11px', color: counts.mandatory_pending > 0 ? '#991B1B' : 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Mandatory Acknowledgment
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: counts.mandatory_pending > 0 ? '#991B1B' : 'var(--text-primary)', marginTop: '4px' }}>
              {counts.mandatory_pending}
            </div>
            <div style={{ fontSize: '11px', color: counts.mandatory_pending > 0 ? '#991B1B' : 'var(--text-tertiary)', marginTop: '2px' }}>
              {counts.mandatory_pending > 0 ? 'Action required for institutional audit' : 'All statutory items acknowledged'}
            </div>
          </div>
        </div>
      </div>

      {/* Conditional View: 1. Gazette Feed vs 2. Automated Reminders SLA */}
      {activeTab === 'feed' && (
        <>
          {/* 1.5 Official Reminder Alert Banner for Students */}
          {studentReminders.filter(r => !r.is_already_acknowledged).length > 0 && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '8px',
          background: '#FEF2F2',
          border: '1.5px solid #FCA5A5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 6px rgba(185, 28, 28, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#B91C1C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Mail size={20} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#991B1B' }}>
                Action Required: Formal Compliance Reminder Dispatched to Your University Email
              </div>
              <div style={{ fontSize: '12px', color: '#7F1D1D', marginTop: '2px' }}>
                You have {studentReminders.filter(r => !r.is_already_acknowledged).length} statutory notice(s) requiring your immediate acknowledgment. An official reminder notice was dispatched to <strong>{user?.email || 'your registered institutional inbox'}</strong>.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="app-btn app-btn-secondary app-btn-sm"
              onClick={() => {
                const unack = studentReminders.find(r => !r.is_already_acknowledged);
                if (unack) {
                  setSelectedReminder(unack);
                  setEmailModalOpen(true);
                  api.markNoticeReminderRead(unack.id);
                }
              }}
            >
              <Mail size={13} />
              <span>View Dispatched Email</span>
            </button>
            <button
              className="app-btn app-btn-danger app-btn-sm"
              onClick={() => {
                const unack = studentReminders.find(r => !r.is_already_acknowledged);
                if (unack) {
                  openNoticeDetail(unack.notice_id);
                }
              }}
            >
              <CheckCheck size={13} />
              <span>Review & Acknowledge Now</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Interactive Search & Scoping Ribbon */}
      <div className="surface-card" style={{ padding: '14px 20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, minWidth: '240px', gap: '8px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search circulars by subject, ref code, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '32px' }}
            />
          </div>
          <button type="submit" className="app-btn app-btn-secondary">Filter</button>
        </form>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="input-field"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ width: 'auto', fontSize: '12px', padding: '6px 12px' }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent Directives</option>
            <option value="circular">Statutory Circulars</option>
            <option value="important">Important</option>
            <option value="normal">General Notices</option>
          </select>

          <select
            className="input-field"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: 'auto', fontSize: '12px', padding: '6px 12px' }}
          >
            <option value="all">All Categories</option>
            <option value="academic">Academic</option>
            <option value="administrative">Administrative</option>
            <option value="examination">Examination</option>
            <option value="hostel_mess">Hostel & Mess</option>
            <option value="placement">Placements & Internships</option>
          </select>

          <button
            type="button"
            className={`app-btn app-btn-secondary ${unreadOnly ? 'active' : ''}`}
            onClick={() => setUnreadOnly(!unreadOnly)}
          >
            {unreadOnly ? 'Showing Unread Only' : 'Filter Unread'}
          </button>
        </div>
      </div>

      {/* 3. Official Notices List / Gazette Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div className="surface-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Retrieving targeted circulars from central gazette repository...
          </div>
        ) : notices.length === 0 ? (
          <div className="surface-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <FileText size={36} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px' }} />
            <div style={{ fontSize: '15px', fontWeight: 600 }}>No announcements found matching criteria</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              Check back later or adjust your category and keyword filters.
            </div>
          </div>
        ) : (
          notices.map((notice) => {
            const isUrgent = notice.priority === 'urgent';
            const isStatutory = notice.priority === 'circular';
            const borderAccent = isUrgent
              ? '#EF4444'
              : isStatutory
              ? 'var(--primary)'
              : notice.priority === 'important'
              ? '#F59E0B'
              : 'var(--border-subtle)';

            return (
              <div
                key={notice.id}
                className="surface-card"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderLeft: `4px solid ${borderAccent}`,
                  position: 'relative'
                }}
              >
                {/* Meta Ribbon */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {notice.is_pinned && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: '#FEF3C7',
                        color: '#92400E',
                        border: '1px solid #FCD34D'
                      }}>
                        <Pin size={11} />
                        PINNED
                      </span>
                    )}
                    {getPriorityBadge(notice.priority)}
                    {getScopeBadge(notice)}

                    {!notice.is_read && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        background: 'var(--primary-subtle)'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                        Unread
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                    {notice.reference_circular_no || notice.notice_number}
                  </div>
                </div>

                {/* Title & Preview Body */}
                <div>
                  <h2
                    onClick={() => openNoticeDetail(notice.id)}
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      margin: '0 0 6px',
                      cursor: 'pointer',
                      lineHeight: '1.4'
                    }}
                  >
                    {notice.title}
                  </h2>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {notice.content}
                  </p>
                </div>

                {/* Attachment Badge if present with Real Download */}
                {notice.attachment_name && (
                  <a
                    href={api.getNoticeDownloadUrl(notice.id)}
                    target="_blank"
                    rel="noreferrer"
                    title="Click to download institutional document"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      borderRadius: '5px',
                      background: 'var(--canvas)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      width: 'fit-content',
                      textDecoration: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <FileText size={14} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 600 }}>{notice.attachment_name}</span>
                    {notice.attachment_size && (
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>({notice.attachment_size})</span>
                    )}
                    <Download size={13} style={{ color: 'var(--primary)', marginLeft: '4px' }} />
                  </a>
                )}

                {/* Mandatory Acknowledgment Banner on Card */}
                {notice.requires_acknowledgment && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    background: notice.is_acknowledged ? 'var(--primary-subtle)' : '#FEF2F2',
                    border: `1px solid ${notice.is_acknowledged ? 'var(--primary-border)' : '#FCA5A5'}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {notice.is_acknowledged ? (
                        <CheckCircle2 size={15} style={{ color: 'var(--primary)' }} />
                      ) : (
                        <AlertCircle size={15} style={{ color: '#B91C1C' }} />
                      )}
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: notice.is_acknowledged ? 'var(--primary)' : '#991B1B'
                      }}>
                        {notice.is_acknowledged
                          ? `Formally acknowledged by you on ${new Date(notice.acknowledged_at).toLocaleDateString('en-GB')}`
                          : 'Action Required: Institutional statutory acknowledgment pending.'}
                      </span>
                    </div>

                    {!notice.is_acknowledged && (
                      <button
                        className="app-btn app-btn-danger app-btn-xs"
                        onClick={() => openNoticeDetail(notice.id)}
                      >
                        Review & Acknowledge
                      </button>
                    )}
                  </div>
                )}

                {/* Footer Details & Action Buttons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{notice.author_full_name}</span>
                    <span>·</span>
                    <span>{notice.author_designation}</span>
                    <span>·</span>
                    <span>{new Date(notice.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* If author or staff, show Compliance Audit button */}
                    {(canPublish || notice.author_username === user?.username) && (
                      <button
                        className="app-btn app-btn-secondary app-btn-sm"
                        onClick={() => openAuditDrawer(notice.id)}
                      >
                        <Users size={13} />
                        <span>Audit Receipts ({notice.total_ack_count}/{notice.total_read_count} read)</span>
                      </button>
                    )}

                    <button
                      className="app-btn app-btn-secondary app-btn-sm"
                      onClick={() => openNoticeDetail(notice.id)}
                    >
                      <Eye size={13} />
                      <span>Read Gazette Circular</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      </>
      )}

      {/* Conditional View 2: Administrator Automated Reminders SLA Control Center */}
      {activeTab === 'automation' && isAdminOrStaff && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Top Status & Metrics Card */}
          <div className="surface-card" style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: automationDiagnostics?.is_quiet_hours ? '#FEF3C7' : 'var(--primary-subtle)',
                  color: automationDiagnostics?.is_quiet_hours ? '#B45309' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1.5px solid ${automationDiagnostics?.is_quiet_hours ? '#FDE68A' : 'var(--primary-border)'}`
                }}>
                  {automationDiagnostics?.is_quiet_hours ? <Moon size={22} /> : <Zap size={22} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      Automated Notice Reminder SLA Engine
                    </h2>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: !automationSettings.is_enabled
                        ? '#E5E7EB'
                        : automationDiagnostics?.is_quiet_hours
                          ? '#FEF3C7'
                          : '#DCFCE7',
                      color: !automationSettings.is_enabled
                        ? '#4B5563'
                        : automationDiagnostics?.is_quiet_hours
                          ? '#92400E'
                          : '#15803D',
                      border: `1px solid ${
                        !automationSettings.is_enabled
                          ? '#D1D5DB'
                          : automationDiagnostics?.is_quiet_hours
                            ? '#FDE68A'
                            : '#BBF7D0'
                      }`
                    }}>
                      {!automationSettings.is_enabled
                        ? 'Daemon Paused'
                        : automationDiagnostics?.is_quiet_hours
                          ? 'Quiet Hours Active (12 AM – 5 AM)'
                          : `Active Daemon (${automationSettings.interval_hours}h Interval)`}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    Automated background compliance monitoring • Dispatches formal emails exclusively to non-compliant students in the designated audience cohort
                  </div>
                </div>
              </div>

              {/* Server Clock & Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: 'var(--canvas)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end'
                }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    Campus Server Clock (IST)
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                    {automationDiagnostics?.server_time_formatted || '--:--:--'}
                  </span>
                </div>
                <button
                  type="button"
                  className="app-btn app-btn-secondary app-btn-sm"
                  onClick={loadAutomationData}
                  disabled={loadingAutomation}
                  title="Refresh daemon data"
                >
                  <RefreshCw size={13} className={loadingAutomation ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Quiet Hours Policy Callout */}
            <div style={{
              padding: '12px 16px',
              borderRadius: '6px',
              background: automationDiagnostics?.is_quiet_hours ? '#FFFBEB' : 'var(--canvas)',
              borderLeft: `4px solid ${automationDiagnostics?.is_quiet_hours ? '#D97706' : 'var(--primary)'}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{ color: automationDiagnostics?.is_quiet_hours ? '#D97706' : 'var(--primary)', marginTop: '2px', flexShrink: 0 }}>
                {automationDiagnostics?.is_quiet_hours ? <Moon size={18} /> : <ShieldCheck size={18} />}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                <strong>Statutory Dispatch Policy: </strong>
                {automationDiagnostics?.status_message || 'Periodic email reminders are operational.'}
                <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Between <strong>{automationSettings.quiet_hours_start} (Midnight 12 AM)</strong> and <strong>{automationSettings.quiet_hours_end} (5 AM Morning)</strong>, student emails are suppressed to prevent sleep disturbance. Scheduled dispatches resume automatically at 05:01 AM (at 06:00 AM, 08:00 AM, etc.).
                </span>
              </div>
            </div>

            {/* Metrics Counters Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginTop: '4px'
            }}>
              <div style={{ padding: '12px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Statutory Circulars</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {automationDiagnostics?.statutory_circulars_count ?? 0}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Requiring mandatory acknowledgment</div>
              </div>

              <div style={{ padding: '12px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Total Targeted Students</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {automationDiagnostics?.total_target_students ?? 0}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Students with access to active notices</div>
              </div>

              <div style={{ padding: '12px', background: '#FEF2F2', borderRadius: '6px', border: '1px solid #FCA5A5' }}>
                <div style={{ fontSize: '11px', color: '#991B1B', fontWeight: 600, textTransform: 'uppercase' }}>Pending Acknowledgment</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#991B1B', marginTop: '2px' }}>
                  {automationDiagnostics?.total_pending_acknowledgments ?? 0}
                </div>
                <div style={{ fontSize: '11px', color: '#7F1D1D' }}>Targeted for automated reminders</div>
              </div>

              <div style={{ padding: '12px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>Automated Dispatches</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
                  {automationDiagnostics?.automated_dispatches_total ?? 0}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Delivered via university daemon</div>
              </div>
            </div>
          </div>

          {/* Dual Columns: Admin Configuration (Left) & Daemon Execution (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            
            {/* Configuration Form */}
            <div className="surface-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                <Settings size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Administrator SLA & Interval Parameters
                </h3>
              </div>

              <form onSubmit={handleSaveAutomation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Master Engine Switch */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'var(--canvas)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Automated Reminder Daemon
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Autonomous evaluation of unacknowledged students
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={automationSettings.is_enabled}
                      onChange={(e) => setAutomationSettings(s => ({ ...s, is_enabled: e.target.checked }))}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: automationSettings.is_enabled ? 'var(--primary)' : 'var(--text-secondary)' }}>
                      {automationSettings.is_enabled ? 'Active' : 'Paused'}
                    </span>
                  </label>
                </div>

                {/* Interval Setting */}
                <div>
                  <label className="input-label">Reminder Evaluation Frequency (Interval)</label>
                  <select
                    className="input-field"
                    value={automationSettings.interval_hours}
                    onChange={(e) => setAutomationSettings(s => ({ ...s, interval_hours: parseInt(e.target.value) || 1 }))}
                  >
                    <option value="1">Every 1 Hour (Intensive Statutory Tracking - Recommended)</option>
                    <option value="2">Every 2 Hours (Standard Notice Follow-up)</option>
                    <option value="4">Every 4 Hours</option>
                    <option value="6">Every 6 Hours</option>
                    <option value="8">Every 8 Hours (Morning, Midday, Evening)</option>
                    <option value="12">Every 12 Hours (Twice Daily)</option>
                    <option value="24">Every 24 Hours (Daily Digest)</option>
                  </select>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                    Follow-up reminder emails will only be sent if at least {automationSettings.interval_hours} hour(s) have passed since the previous notification.
                  </span>
                </div>

                {/* Quiet Hours Configuration */}
                <div style={{
                  padding: '12px',
                  background: 'var(--canvas)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Moon size={15} style={{ color: '#D97706' }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Night Quiet Hours Blackout Window
                      </span>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={automationSettings.quiet_hours_enabled}
                        onChange={(e) => setAutomationSettings(s => ({ ...s, quiet_hours_enabled: e.target.checked }))}
                        style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Enforced</span>
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Quiet Window Start (Night)</label>
                      <input
                        type="time"
                        className="input-field"
                        value={automationSettings.quiet_hours_start}
                        onChange={(e) => setAutomationSettings(s => ({ ...s, quiet_hours_start: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Quiet Window End (Morning)</label>
                      <input
                        type="time"
                        className="input-field"
                        value={automationSettings.quiet_hours_end}
                        onChange={(e) => setAutomationSettings(s => ({ ...s, quiet_hours_end: e.target.value }))}
                      />
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    No emails are dispatched between {automationSettings.quiet_hours_start} (Midnight) and {automationSettings.quiet_hours_end} (5 AM). Outbound deliveries resume at 05:01 AM.
                  </span>
                </div>

                {/* Max Reminders & Initial Delay */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="input-label">Max Reminders / Student</label>
                    <select
                      className="input-field"
                      value={automationSettings.max_reminders_per_student}
                      onChange={(e) => setAutomationSettings(s => ({ ...s, max_reminders_per_student: parseInt(e.target.value) || 5 }))}
                    >
                      <option value="3">3 Reminders Max</option>
                      <option value="5">5 Reminders Max (Standard)</option>
                      <option value="8">8 Reminders Max</option>
                      <option value="10">10 Reminders Max</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Initial Delay Before #1</label>
                    <select
                      className="input-field"
                      value={automationSettings.initial_delay_hours}
                      onChange={(e) => setAutomationSettings(s => ({ ...s, initial_delay_hours: parseInt(e.target.value) || 1 }))}
                    >
                      <option value="0">Immediate upon notice publication</option>
                      <option value="1">1 Hour after notice publication</option>
                      <option value="2">2 Hours after notice publication</option>
                      <option value="4">4 Hours after notice publication</option>
                    </select>
                  </div>
                </div>

                {/* Custom Directive Note */}
                <div>
                  <label className="input-label">Directive Instruction Note (Appears in Student Email)</label>
                  <textarea
                    className="input-field"
                    rows="3"
                    value={automationSettings.custom_directive_note}
                    onChange={(e) => setAutomationSettings(s => ({ ...s, custom_directive_note: e.target.value }))}
                    placeholder="Directive statement included in every automated notification..."
                  />
                </div>

                <button
                  type="submit"
                  className="app-btn app-btn-primary"
                  disabled={savingAutomation}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
                >
                  <Sliders size={15} />
                  <span>{savingAutomation ? 'Saving Parameters...' : 'Save SLA Configuration'}</span>
                </button>
              </form>
            </div>

            {/* Execution Console & Live Diagnostics (Right Column) */}
            <div className="surface-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                <Play size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Live Daemon Simulation & On-Demand Execution
                </h3>
              </div>

              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                The background daemon evaluates notices automatically. Administrators can trigger an on-demand cycle below to test quiet hours suppression, inspect candidate queue evaluation, or simulate instant dispatch.
              </div>

              {/* Test Options */}
              <div style={{
                padding: '14px',
                background: 'var(--canvas)',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Simulation & Testing Overrides:
                </div>
                
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={bypassQuietForTest}
                    onChange={(e) => setBypassQuietForTest(e.target.checked)}
                    style={{ marginTop: '3px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Bypass Quiet Hours for Instant Test
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>
                      Allows dispatching test reminder emails immediately even if server clock is between 12:00 AM and 05:00 AM.
                    </span>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={bypassIntervalForTest}
                    onChange={(e) => setBypassIntervalForTest(e.target.checked)}
                    style={{ marginTop: '3px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Bypass Elapsed Interval Check (Force Immediate Cycle)
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>
                      Dispatches the next reminder sequence even if {automationSettings.interval_hours} hour(s) have not elapsed yet.
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Button */}
              <button
                type="button"
                className="app-btn app-btn-danger app-btn-lg"
                onClick={handleRunAutomationCycle}
                disabled={runningAutomation}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Play size={16} />
                <span>{runningAutomation ? 'Evaluating Daemon Cycle...' : 'Execute Automated Dispatch Cycle Now'}</span>
              </button>

              {/* Live Run Result Console */}
              {lastRunResult && (
                <div style={{
                  padding: '14px',
                  borderRadius: '6px',
                  background: lastRunResult.status === 'suppressed_quiet_hours' ? '#FFFBEB' : '#F0FDF4',
                  border: `1px solid ${lastRunResult.status === 'suppressed_quiet_hours' ? '#FDE68A' : '#BBF7D0'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: lastRunResult.status === 'suppressed_quiet_hours' ? '#92400E' : '#166534'
                    }}>
                      {lastRunResult.status === 'suppressed_quiet_hours' ? 'Quiet Hours Suppression (Held until 5 AM)' : 'Execution Completed'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                      {formatTime12(new Date())}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                    {lastRunResult.message}
                  </div>

                  {lastRunResult.dispatched && lastRunResult.dispatched.length > 0 && (
                    <div style={{ marginTop: '4px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
                        Dispatched Recipients ({lastRunResult.dispatched.length}):
                      </div>
                      <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {lastRunResult.dispatched.map((d, i) => (
                          <div key={i} style={{ fontSize: '11px', background: '#FFFFFF', padding: '4px 8px', borderRadius: '4px', border: '1px solid #DCFCE7' }}>
                            <strong>{d.student_name}</strong> ({d.student_roll}) • {d.notice_number} • <em>Seq #{d.sequence}</em>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {lastRunResult.skipped && lastRunResult.skipped.length > 0 && (
                    <div style={{ marginTop: '2px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Audited & Skipped ({lastRunResult.skipped.length} students): {lastRunResult.skipped[0]?.reason}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section: Active Statutory Notice Queue & Cohort Scoping Table */}
          <div className="surface-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Active Statutory Notice Queue & Cohort Targeting
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Targeting precision: Periodic reminders are queued ONLY for students who belong to the specified target group and have NOT yet acknowledged
                </p>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {automationQueue.length} Active Circular(s)
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--canvas)', borderBottom: '1.5px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '10px 12px' }}>Circular Reference</th>
                    <th style={{ padding: '10px 12px' }}>Title</th>
                    <th style={{ padding: '10px 12px' }}>Target Group Scope</th>
                    <th style={{ padding: '10px 12px' }}>Audience</th>
                    <th style={{ padding: '10px 12px' }}>Compliance Status</th>
                    <th style={{ padding: '10px 12px' }}>Auto-Reminders</th>
                    <th style={{ padding: '10px 12px' }}>Dispatched Emails</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {automationQueue.map((item) => (
                    <tr key={item.notice_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.notice_number}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '240px' }}>
                        {item.title}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: 'var(--canvas)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)'
                        }}>
                          <Users size={12} />
                          {item.scope_label}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                        {item.total_target} Students
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{item.acknowledged_count} ack ({item.ack_percent}%)</span>
                            <span style={{ color: item.pending_count > 0 ? '#B91C1C' : 'var(--text-tertiary)', fontWeight: 700 }}>
                              {item.pending_count} pending
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '5px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${item.ack_percent}%`, height: '100%', background: 'var(--primary)' }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleNoticeAutoReminder(item.notice_id, item.auto_reminders_enabled)}
                          title={item.auto_reminders_enabled ? 'Click to pause automatic reminders for this circular' : 'Click to enable automatic reminders for this circular'}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: item.auto_reminders_enabled ? 'var(--primary-border)' : 'var(--border-subtle)',
                            background: item.auto_reminders_enabled ? 'rgba(27, 67, 50, 0.08)' : 'var(--canvas)',
                            color: item.auto_reminders_enabled ? 'var(--primary)' : 'var(--text-tertiary)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {item.auto_reminders_enabled ? (
                            <>
                              <Zap size={12} style={{ color: 'var(--primary)' }} />
                              <span>Active (On)</span>
                            </>
                          ) : (
                            <>
                              <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
                              <span>Paused (Off)</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                        <div>{item.reminders_dispatched_total} total</div>
                        {item.last_dispatched_at && (
                          <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
                            Last: {formatTime12(item.last_dispatched_at)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="app-btn app-btn-secondary app-btn-xs"
                          onClick={() => openNoticeDetail(item.notice_id)}
                        >
                          <Eye size={12} />
                          <span>Audit Roster</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Chronological Automated Dispatch Audit Trail */}
          <div className="surface-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Recent Automated Reminder Dispatches
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Audit ledger of periodic automated notification emails delivered by the system daemon
                </p>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {automationLogs.length} Logged Entries
              </span>
            </div>

            {automationLogs.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                No automated reminders dispatched yet. Click "Execute Automated Dispatch Cycle Now" above to initiate a cycle.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--canvas)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 10px' }}>Dispatched At</th>
                      <th style={{ padding: '8px 10px' }}>Sequence</th>
                      <th style={{ padding: '8px 10px' }}>Notice</th>
                      <th style={{ padding: '8px 10px' }}>Student Recipient</th>
                      <th style={{ padding: '8px 10px' }}>Email Address</th>
                      <th style={{ padding: '8px 10px' }}>Student Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {automationLogs.slice(0, 15).map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {formatDateTime12(log.dispatched_at)}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: 'var(--primary-subtle)',
                            color: 'var(--primary)',
                            border: '1px solid var(--primary-border)'
                          }}>
                            Dispatch #{log.reminder_sequence || 1}
                          </span>
                        </td>
                        <td style={{ padding: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {log.notice_number}
                        </td>
                        <td style={{ padding: '10px', color: 'var(--text-primary)' }}>
                          <strong>{log.recipient_name}</strong> ({log.recipient_roll})
                        </td>
                        <td style={{ padding: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          {log.recipient_email}
                        </td>
                        <td style={{ padding: '10px' }}>
                          {log.student_acknowledged_at ? (
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Acknowledged</span>
                          ) : (
                            <span style={{ color: '#B91C1C', fontWeight: 600 }}>Pending Acknowledgment</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Full Official Circular Modal (The Gazette View) */}
      {viewModalOpen && selectedNotice && (
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
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            {/* Modal Top Bar */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--canvas)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Institutional Gazette Circular
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                  [{selectedNotice.reference_circular_no || selectedNotice.notice_number}]
                </span>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body - Official Letterhead Style */}
            <div style={{
              padding: '32px 36px',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              background: '#FFFDF9' /* Prestigious warm archival paper tone */
            }}>
              {/* Institutional Crest & Masthead */}
              <div style={{
                textAlign: 'center',
                borderBottom: '2px solid var(--primary)',
                paddingBottom: '16px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--primary)', textTransform: 'uppercase' }}>
                  CENTRAL UNIVERSITY OF TECHNOLOGY
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Office of Institutional Governance & Central Registry
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  Established under Central Universities Act • NAAC Grade 'A+' Accredited
                </div>
              </div>

              {/* Reference, Date & Scope Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                borderBottom: '1px dashed var(--border-subtle)',
                paddingBottom: '12px'
              }}>
                <div>
                  <strong>Circular Ref:</strong> {selectedNotice.reference_circular_no || selectedNotice.notice_number}
                </div>
                <div>
                  <strong>Date:</strong> {new Date(selectedNotice.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>

              {/* Addressed To */}
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                <strong>TO:</strong> {selectedNotice.target_scope === 'all'
                  ? 'All Enrolled Students, Faculty Members, and Administrative Units'
                  : selectedNotice.target_scope === 'department'
                  ? `Students and Faculty of Department of ${selectedNotice.department_name || 'Engineering'}`
                  : selectedNotice.target_scope === 'section'
                  ? `Students of ${selectedNotice.department_code || 'CSE'} — Semester ${selectedNotice.semester || 1}, Section ${selectedNotice.section || 'A'}`
                  : selectedNotice.target_scope === 'hostel'
                  ? `Boarders & Wardens of ${selectedNotice.hostel_name || 'Hostels'}`
                  : `Members with Tag: ${selectedNotice.target_tag_name || 'Designation'}`}
              </div>

              {/* Formal Subject */}
              <div style={{
                padding: '12px 16px',
                background: 'rgba(20, 83, 45, 0.05)',
                borderLeft: '3px solid var(--primary)',
                borderRadius: '4px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  SUBJECT
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedNotice.title}
                </div>
              </div>

              {/* Promulgation Body */}
              <div style={{
                fontSize: '14px',
                lineHeight: '1.7',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-line'
              }}>
                {selectedNotice.content}
              </div>

              {/* Official Attachment if present with Real Download Link */}
              {selectedNotice.attachment_name && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  background: 'var(--canvas)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={20} style={{ color: 'var(--primary)' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {selectedNotice.attachment_name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        Official University Gazette Attachment {selectedNotice.attachment_size && `• ${selectedNotice.attachment_size}`}
                      </div>
                    </div>
                  </div>
                  <a
                    href={api.getNoticeDownloadUrl(selectedNotice.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="app-btn app-btn-secondary app-btn-sm"
                  >
                    <Download size={13} style={{ color: 'var(--primary)' }} />
                    <span>Download Official Document</span>
                  </a>
                </div>
              )}

              {/* Issuing Authority Signature Block */}
              <div style={{
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'flex-end',
                textAlign: 'right'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <div style={{
                    width: '120px',
                    height: '40px',
                    borderBottom: '1px solid #78716C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'serif',
                    fontStyle: 'italic',
                    color: '#78716C',
                    fontSize: '13px'
                  }}>
                    [Digital Authority Seal]
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {selectedNotice.author_full_name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {selectedNotice.author_designation}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {selectedNotice.author_office || 'Central University of Technology'}
                  </div>
                </div>
              </div>

              {/* Statutory Acknowledgment Action Box inside Modal */}
              {selectedNotice.requires_acknowledgment && (
                <div style={{
                  marginTop: '10px',
                  padding: '16px',
                  borderRadius: '6px',
                  background: selectedNotice.is_acknowledged ? 'var(--primary-subtle)' : '#FEF2F2',
                  border: `1px solid ${selectedNotice.is_acknowledged ? 'var(--primary-border)' : '#FCA5A5'}`
                }}>
                  {selectedNotice.is_acknowledged ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle2 size={20} style={{ color: 'var(--primary)' }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
                          Statutory Receipt Formally Acknowledged
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Registered on {formatDateTime12(selectedNotice.acknowledged_at)} • IP: 127.0.0.1
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <AlertTriangle size={18} style={{ color: '#B91C1C', marginTop: '2px' }} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#991B1B' }}>
                            Mandatory Student Confirmation & Undertaking
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Under institutional regulations, you are required to confirm that you have read, understood, and agree to abide by the contents of this circular. Your acknowledgment is permanently audited.
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: '8px' }}>
                        <button
                          type="button"
                          className="app-btn app-btn-danger app-btn-lg"
                          onClick={handleAcknowledge}
                          disabled={acknowledging}
                          style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}
                        >
                          <CheckCheck size={16} />
                          <span>{acknowledging ? 'Registering Formal Undertaking...' : 'I Acknowledge & Understand This Directive'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Bottom Bar */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--canvas)'
            }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                First viewed: {selectedNotice.first_read_at ? formatDateTime12(selectedNotice.first_read_at) : 'Just now'}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {(canPublish || selectedNotice.author_username === user?.username) && (
                  <button
                    className="app-btn app-btn-secondary app-btn-sm"
                    onClick={() => {
                      setViewModalOpen(false);
                      setAuditDrawerOpen(true);
                    }}
                  >
                    <Users size={13} />
                    <span>View Compliance Roster</span>
                  </button>
                )}
                <button className="app-btn app-btn-secondary app-btn-sm" onClick={() => setViewModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Institutional Audit & Compliance Drawer (Slide-over) */}
      {auditDrawerOpen && selectedNotice && auditData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--surface)',
            width: '100%',
            maxWidth: '680px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.15)'
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              background: 'var(--canvas)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Statutory Compliance & Read Audit
                  </h3>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {selectedNotice.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                  Ref: {selectedNotice.reference_circular_no || selectedNotice.notice_number}
                </div>
              </div>
              <button
                onClick={() => setAuditDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Audit KPIs & Progress Bar */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ padding: '10px', background: 'var(--canvas)', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Target Audience</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {auditData.stats.total_target}
                  </div>
                </div>
                <div style={{ padding: '10px', background: 'var(--canvas)', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Read Rate</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {auditData.stats.read_percent}%
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{auditData.stats.read_count} students</div>
                </div>
                <div style={{ padding: '10px', background: 'var(--canvas)', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--primary)' }}>Acknowledged</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
                    {auditData.stats.ack_percent}%
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{auditData.stats.acknowledged_count} confirmed</div>
                </div>
              </div>

              {/* Compliance Visual Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>Statutory Compliance Progress</span>
                  <span>{auditData.stats.acknowledged_count} of {auditData.stats.total_target} Confirmed</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${auditData.stats.ack_percent}%`,
                    height: '100%',
                    background: 'var(--primary)',
                    borderRadius: '4px',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>

              {/* CSV Export & Send Reminder Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {selectedNotice.requires_acknowledgment && isAdminOrStaff && (
                  <button
                    type="button"
                    onClick={() => handleToggleNoticeAutoReminder(selectedNotice.id, selectedNotice.auto_reminders_enabled)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: selectedNotice.auto_reminders_enabled ? 'var(--primary-border)' : 'var(--border-subtle)',
                      background: selectedNotice.auto_reminders_enabled ? 'rgba(27, 67, 50, 0.08)' : 'var(--canvas)',
                      color: selectedNotice.auto_reminders_enabled ? 'var(--primary)' : 'var(--text-tertiary)'
                    }}
                  >
                    <Zap size={12} />
                    <span>Auto-Reminders: {selectedNotice.auto_reminders_enabled ? 'Active (Click to Pause)' : 'Paused (Click to Enable)'}</span>
                  </button>
                )}

                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                  {auditData.stats.pending_count > 0 && (
                    <button
                      className="app-btn app-btn-danger app-btn-sm"
                      onClick={() => setDispatchReminderModalOpen(true)}
                    >
                      <Send size={13} />
                      <span>Dispatch Email Reminders ({auditData.stats.pending_count} pending)</span>
                    </button>
                  )}
                  <a
                    href={api.getNoticeComplianceExportUrl(selectedNotice.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="app-btn app-btn-secondary app-btn-sm"
                  >
                    <Download size={13} />
                    <span>Export Compliance Ledger (CSV)</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Filter Pills for Audit Roster */}
            <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
              <button
                className={`app-btn app-btn-secondary app-btn-xs ${auditFilter === 'all' ? 'active' : ''}`}
                onClick={() => setAuditFilter('all')}
              >
                All ({auditData.roster.length})
              </button>
              <button
                className={`app-btn app-btn-secondary app-btn-xs ${auditFilter === 'ACKNOWLEDGED' ? 'active' : ''}`}
                onClick={() => setAuditFilter('ACKNOWLEDGED')}
              >
                Acknowledged ({auditData.stats.acknowledged_count})
              </button>
              <button
                className={`app-btn app-btn-secondary app-btn-xs ${auditFilter === 'UNOPENED' ? 'active' : ''}`}
                onClick={() => setAuditFilter('UNOPENED')}
              >
                Unopened ({auditData.stats.total_target - auditData.stats.read_count})
              </button>
            </div>

            {/* Roster Table */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 4px' }}>Roll No</th>
                    <th style={{ padding: '10px 4px' }}>Student</th>
                    <th style={{ padding: '10px 4px' }}>Class</th>
                    <th style={{ padding: '10px 4px' }}>Status</th>
                    <th style={{ padding: '10px 4px' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditData.roster
                    .filter((r) => auditFilter === 'all' || r.compliance_status === auditFilter)
                    .map((student) => (
                      <tr key={student.user_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 4px', fontWeight: 600, fontFamily: 'monospace' }}>
                          {student.roll_number}
                        </td>
                        <td style={{ padding: '10px 4px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.full_name}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{student.college_email}</div>
                        </td>
                        <td style={{ padding: '10px 4px', color: 'var(--text-secondary)' }}>
                          {student.dept_code} S{student.current_semester}-{student.section}
                        </td>
                        <td style={{ padding: '10px 4px' }}>
                          {student.compliance_status === 'ACKNOWLEDGED' ? (
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '3px',
                              fontSize: '10px',
                              fontWeight: 700,
                              background: 'var(--primary-subtle)',
                              color: 'var(--primary)'
                            }}>
                              Acknowledged
                            </span>
                          ) : student.compliance_status === 'VIEWED_PENDING_ACK' ? (
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '3px',
                              fontSize: '10px',
                              fontWeight: 700,
                              background: '#FEF3C7',
                              color: '#92400E'
                            }}>
                              Viewed Only
                            </span>
                          ) : (
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '3px',
                              fontSize: '10px',
                              fontWeight: 600,
                              background: '#FEE2E2',
                              color: '#991B1B'
                            }}>
                              Unopened
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px 4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {student.acknowledged_at
                            ? new Date(student.acknowledged_at).toLocaleDateString('en-GB')
                            : student.first_read_at
                            ? `Read ${new Date(student.first_read_at).toLocaleDateString('en-GB')}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Reminder Dispatch History */}
            {reminderHistory.length > 0 && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--canvas)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <History size={14} style={{ color: 'var(--primary)' }} />
                  <span>Dispatched Reminder Broadcasts ({reminderHistory.length})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '130px', overflowY: 'auto' }}>
                  {reminderHistory.map((item) => (
                    <div key={item.id} style={{ fontSize: '11px', padding: '6px 10px', background: 'var(--surface)', borderRadius: '4px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{item.recipient_name}</strong> ({item.recipient_email})
                        {item.custom_note && <span style={{ color: 'var(--text-tertiary)', marginLeft: '6px' }}>— "{item.custom_note}"</span>}
                      </div>
                      <div style={{ color: 'var(--text-tertiary)' }}>
                        {formatDateTime12(item.dispatched_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drawer Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', background: 'var(--canvas)' }}>
              <button className="app-btn app-btn-secondary app-btn-sm" onClick={() => setAuditDrawerOpen(false)}>
                Close Audit Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Promulgate Official Directive Modal */}
      {publishModalOpen && (
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
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--canvas)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Promulgate Institutional Directive
                </h3>
              </div>
              <button
                onClick={() => setPublishModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Target Scope Selection */}
                <div>
                  <label className="input-label">Audience Scope & Delivery Target *</label>
                  <select
                    className="input-field"
                    value={publishForm.target_scope}
                    onChange={(e) => setPublishForm({ ...publishForm, target_scope: e.target.value })}
                  >
                    {user?.role_name !== 'student' && <option value="all">Entire University (All Students & Faculty)</option>}
                    <option value="department">Department-Specific</option>
                    <option value="section">Specific Section / Batch (CR / Class Teacher)</option>
                    <option value="hostel">Hostel Residents (Warden / Block)</option>
                    <option value="tag">Specific Designation / Tag (CRs / Reps)</option>
                  </select>
                </div>

                {/* Scope Specific Inputs */}
                {publishForm.target_scope === 'department' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="input-label">Department</label>
                      <select
                        className="input-field"
                        value={publishForm.department_id}
                        onChange={(e) => setPublishForm({ ...publishForm, department_id: e.target.value })}
                      >
                        <option value="">Select Department...</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="input-label">Semester (Optional)</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        className="input-field"
                        placeholder="All"
                        value={publishForm.semester}
                        onChange={(e) => setPublishForm({ ...publishForm, semester: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {publishForm.target_scope === 'section' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="input-label">Department</label>
                      <select
                        className="input-field"
                        value={publishForm.department_id}
                        onChange={(e) => setPublishForm({ ...publishForm, department_id: e.target.value })}
                      >
                        <option value="">Select Department...</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="input-label">Semester</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        className="input-field"
                        placeholder="e.g. 1"
                        value={publishForm.semester}
                        onChange={(e) => setPublishForm({ ...publishForm, semester: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="input-label">Section</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. A"
                        value={publishForm.section}
                        onChange={(e) => setPublishForm({ ...publishForm, section: e.target.value.toUpperCase() })}
                      />
                    </div>
                  </div>
                )}

                {publishForm.target_scope === 'hostel' && (
                  <div>
                    <label className="input-label">Hostel Block Name</label>
                    <select
                      className="input-field"
                      value={publishForm.hostel_name}
                      onChange={(e) => setPublishForm({ ...publishForm, hostel_name: e.target.value })}
                    >
                      <option value="">Select Hostel Block...</option>
                      <option value="Boys Hostel Block B">Boys Hostel Block B</option>
                      <option value="Girls Hostel Block A">Girls Hostel Block A</option>
                      <option value="Tagore Bhawan (Hostel 4)">Tagore Bhawan (Hostel 4)</option>
                    </select>
                  </div>
                )}

                {/* Priority & Category */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="input-label">Directive Priority *</label>
                    <select
                      className="input-field"
                      value={publishForm.priority}
                      onChange={(e) => setPublishForm({ ...publishForm, priority: e.target.value })}
                    >
                      <option value="normal">General (Standard Notice)</option>
                      <option value="important">Important (Highlighted in feed)</option>
                      <option value="circular">Statutory Circular (Formal gazette)</option>
                      <option value="urgent">Urgent Directive (Immediate alert)</option>
                    </select>
                  </div>

                  <div>
                    <label className="input-label">Category *</label>
                    <select
                      className="input-field"
                      value={publishForm.category}
                      onChange={(e) => setPublishForm({ ...publishForm, category: e.target.value })}
                    >
                      <option value="academic">Academic & Coursework</option>
                      <option value="administrative">Administrative & Governance</option>
                      <option value="examination">Examination & Results</option>
                      <option value="hostel_mess">Hostel, Dining & Infrastructure</option>
                      <option value="placement">Placements & Careers</option>
                      <option value="cultural_sports">Clubs & Campus Life</option>
                      <option value="general">General Campus Notice</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="input-label">Notice Subject / Title *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter authoritative circular headline..."
                    value={publishForm.title}
                    onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="input-label">Formal Circular Body *</label>
                  <textarea
                    className="input-field"
                    rows="6"
                    placeholder="Enter official text of directive, guidelines, requirements, and compliance deadlines..."
                    value={publishForm.content}
                    onChange={(e) => setPublishForm({ ...publishForm, content: e.target.value })}
                    required
                  />
                </div>

                {/* Reference Number & Real File Upload */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="input-label">Custom Reference No (Optional)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. CUT/CSE/CIR/2026/042"
                      value={publishForm.reference_circular_no}
                      onChange={(e) => setPublishForm({ ...publishForm, reference_circular_no: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="input-label">Official Circular Attachment</label>
                    {!publishForm.attachment_name ? (
                      <div style={{ position: 'relative' }}>
                        <input
                          type="file"
                          id="notice-real-file-upload"
                          style={{ display: 'none' }}
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.zip,.txt"
                        />
                        <label
                          htmlFor="notice-real-file-upload"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '9px 12px',
                            borderRadius: '6px',
                            border: '1.5px dashed var(--border-subtle)',
                            background: 'var(--canvas)',
                            cursor: uploadingAttachment ? 'wait' : 'pointer',
                            transition: 'all 0.15s ease',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--text-primary)'
                          }}
                        >
                          <UploadCloud size={16} style={{ color: 'var(--primary)' }} />
                          <span>{uploadingAttachment ? 'Uploading to Server...' : 'Attach Real Document / PDF'}</span>
                        </label>
                      </div>
                    ) : (
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'var(--canvas)',
                        border: '1px solid var(--primary-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <CheckCircle2 size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {publishForm.attachment_name}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginLeft: '6px' }}>
                              ({publishForm.attachment_size})
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveAttachment}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px'
                          }}
                          title="Remove attached file"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Institutional Guardrails & Toggles */}
                <div style={{
                  padding: '14px',
                  borderRadius: '6px',
                  background: 'var(--canvas)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {/* Mandatory Acknowledgment Toggle */}
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={publishForm.requires_acknowledgment}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setPublishForm({
                          ...publishForm,
                          requires_acknowledgment: checked,
                          auto_reminders_enabled: checked ? true : publishForm.auto_reminders_enabled
                        });
                      }}
                      style={{ marginTop: '3px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        Require Mandatory Student Acknowledgment
                      </span>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        Enforces formal receipt tracking with compliance audit ledger for UGC/statutory audits.
                      </div>
                    </div>
                  </label>

                  {/* Per-Notice Automatic Periodic Reminders Toggle */}
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    background: publishForm.auto_reminders_enabled && publishForm.requires_acknowledgment
                      ? 'rgba(27, 67, 50, 0.05)'
                      : 'var(--surface)',
                    border: publishForm.auto_reminders_enabled && publishForm.requires_acknowledgment
                      ? '1.5px solid var(--primary-border)'
                      : '1px solid var(--border-subtle)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <Zap size={16} style={{ color: publishForm.auto_reminders_enabled ? 'var(--primary)' : 'var(--text-tertiary)', marginTop: '2px' }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                              Start Automatic Periodic Reminders for this Notice
                            </span>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: publishForm.auto_reminders_enabled
                                ? 'var(--primary)'
                                : 'var(--border-subtle)',
                              color: publishForm.auto_reminders_enabled ? '#FFFFFF' : 'var(--text-secondary)'
                            }}>
                              {publishForm.auto_reminders_enabled ? 'YES (AUTOMATIC)' : 'NO (MANUAL ONLY)'}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                            {publishForm.auto_reminders_enabled
                              ? 'Background SLA engine will automatically deliver periodic follow-up emails to unacknowledged students until confirmed.'
                              : 'Background engine will NOT send automated reminder emails for this notice. Reminders can only be dispatched manually.'}
                          </div>
                        </div>
                      </div>

                      {/* Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setPublishForm({ ...publishForm, auto_reminders_enabled: !publishForm.auto_reminders_enabled })}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: publishForm.auto_reminders_enabled ? 'var(--primary)' : 'var(--border-subtle)',
                          background: publishForm.auto_reminders_enabled ? 'var(--primary)' : 'var(--surface)',
                          color: publishForm.auto_reminders_enabled ? '#FFFFFF' : 'var(--text-secondary)',
                          transition: 'all 0.15s ease',
                          flexShrink: 0
                        }}
                      >
                        {publishForm.auto_reminders_enabled ? (
                          <>
                            <Check size={13} />
                            <span>Yes, Enabled</span>
                          </>
                        ) : (
                          <span>No, Off</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Pin Notice Toggle */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={publishForm.is_pinned}
                      onChange={(e) => setPublishForm({ ...publishForm, is_pinned: e.target.checked })}
                    />
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        Pin Notice to Top of Board
                      </span>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        Retains highest prominence above chronological order until expiry.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                background: 'var(--canvas)'
              }}>
                <button
                  type="button"
                  className="app-btn app-btn-secondary"
                  onClick={() => setPublishModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn app-btn-primary"
                  disabled={publishing}
                >
                  <CheckCheck size={16} />
                  <span>{publishing ? 'Promulgating...' : 'Promulgate Directive'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 7. Institutional Email Inbox / Reminder Viewer Modal (for students) */}
      {emailModalOpen && selectedReminder && (
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
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '10px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            {/* Outlook / Institutional Webmail Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--canvas)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Institutional Mailbox — Official Directive Reminder
                </span>
              </div>
              <button
                onClick={() => setEmailModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Email Message Dossier */}
            <div style={{ padding: '24px 28px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '14px',
                background: 'var(--canvas)',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '12px'
              }}>
                <div><strong>Subject:</strong> {selectedReminder.email_subject}</div>
                <div><strong>From:</strong> Central University Governance & Registrar &lt;governance.notifications@campus.edu&gt;</div>
                <div><strong>To:</strong> {selectedReminder.recipient_name} &lt;{selectedReminder.recipient_email}&gt;</div>
                <div><strong>Date:</strong> {formatDateTime12(selectedReminder.dispatched_at)}</div>
                {selectedReminder.is_automated ? (
                  <div style={{ marginTop: '4px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      border: '1px solid #BFDBFE'
                    }}>
                      <Clock size={12} />
                      Automated Governance SLA Reminder (Dispatch #{selectedReminder.reminder_sequence || 1}) • Overnight Quiet Hours Respected
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Warning Notice Banner */}
              <div style={{
                padding: '12px 16px',
                borderRadius: '6px',
                background: '#FEF2F2',
                borderLeft: '4px solid #B91C1C',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <AlertTriangle size={18} style={{ color: '#B91C1C', flexShrink: 0 }} />
                <div style={{ fontSize: '12px', color: '#7F1D1D' }}>
                  <strong>Statutory Action Required:</strong> Failure to submit your mandatory acknowledgment may result in administrative hold on examination admit cards and hostel facilities.
                </div>
              </div>

              {/* Email Body */}
              <div style={{
                fontSize: '13px',
                lineHeight: '1.6',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-line',
                fontFamily: 'var(--font-sans)',
                background: '#FFFFFF',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)'
              }}>
                {selectedReminder.email_body}
              </div>
            </div>

            {/* Email Actions Footer */}
            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--canvas)'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                Authenticated institutional electronic notification
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="app-btn app-btn-secondary app-btn-sm"
                  onClick={() => setEmailModalOpen(false)}
                >
                  Close Mail
                </button>
                <button
                  className="app-btn app-btn-primary app-btn-sm"
                  onClick={() => {
                    setEmailModalOpen(false);
                    openNoticeDetail(selectedReminder.notice_id);
                  }}
                >
                  <CheckCheck size={14} />
                  <span>Open Notice & Acknowledge</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Dispatch Reminder Confirmation Modal (for notice issuers) */}
      {dispatchReminderModalOpen && selectedNotice && auditData && (
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
          zIndex: 1100,
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
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--canvas)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={16} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Dispatch Official Compliance Email Reminder
                </h3>
              </div>
              <button
                onClick={() => setDispatchReminderModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                You are about to dispatch an institutional reminder email to <strong>{auditData.stats.pending_count} pending student(s)</strong> who have not yet acknowledged this circular:
              </div>

              <div style={{
                padding: '10px 14px',
                borderRadius: '6px',
                background: 'var(--canvas)',
                border: '1px solid var(--border-subtle)',
                fontSize: '12px'
              }}>
                <div><strong>Notice:</strong> {selectedNotice.title}</div>
                <div><strong>Ref:</strong> {selectedNotice.reference_circular_no || selectedNotice.notice_number}</div>
              </div>

              <div>
                <label className="input-label">Urgent Directive Note (Appears in Student Email)</label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={reminderCustomNote}
                  onChange={(e) => setReminderCustomNote(e.target.value)}
                  placeholder="e.g. Please record your acknowledgment before tomorrow 5:00 PM to avoid library and hostel hold..."
                />
              </div>
            </div>

            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              background: 'var(--canvas)'
            }}>
              <button
                className="app-btn app-btn-secondary"
                onClick={() => setDispatchReminderModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="app-btn app-btn-danger"
                disabled={sendingReminder}
                onClick={handleSendReminder}
              >
                <Send size={14} />
                <span>{sendingReminder ? 'Dispatching Emails...' : `Broadcast to ${auditData.stats.pending_count} Students`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
