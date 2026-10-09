import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatDateTime12 } from '../utils/dateUtils';
import {
  Headphones,
  MessageSquare,
  Bot,
  UserCheck,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  Trash2,
  Key,
  Sliders,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Check,
  Building,
  User
} from 'lucide-react';

export default function SupportDeskPage() {
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'knowledge' | 'settings'

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [sessionCounts, setSessionCounts] = useState({ pending: 0, active: 0, resolved: 0, learned_total: 0 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState(null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Staff reply form
  const [replyText, setReplyText] = useState('');
  const [autoTeach, setAutoTeach] = useState(true);
  const [questionPattern, setQuestionPattern] = useState('');
  const [keywords, setKeywords] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Knowledge base state
  const [learnedQAList, setLearnedQAList] = useState([]);
  const [loadingQA, setLoadingQA] = useState(false);
  const [teachModalOpen, setTeachModalOpen] = useState(false);
  const [teachForm, setTeachForm] = useState({
    question: '',
    keywords: '',
    answer: '',
    answer_hi: '',
    answer_or: '',
    category: 'general',
    action_route: ''
  });
  const [submittingTeach, setSubmittingTeach] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    grok_api_key: '',
    grok_model: 'openai/gpt-oss-20b',
    human_escalation_threshold: '2',
    campus_office_hours: 'Monday to Friday, 09:30 AM to 05:00 PM'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Test simulation in settings
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testingAi, setTestingAi] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [statusFilter]);

  useEffect(() => {
    if (activeTab === 'knowledge') {
      loadLearnedQA();
    } else if (activeTab === 'settings') {
      loadSettings();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedSessionId) {
      loadSessionDetail(selectedSessionId);
    }
  }, [selectedSessionId]);

  // Periodic poll for active chat updates
  useEffect(() => {
    if (!selectedSessionId || activeTab !== 'sessions') return;
    const interval = setInterval(() => {
      loadSessionDetail(selectedSessionId, true);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedSessionId, activeTab]);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await api.getSupportSessions({ status: statusFilter });
      if (res.success && res.data) {
        setSessions(res.data.sessions || []);
        setSessionCounts(res.data.counts || { pending: 0, active: 0, resolved: 0, learned_total: 0 });
        if (!selectedSessionId && res.data.sessions?.length > 0) {
          setSelectedSessionId(res.data.sessions[0].id);
        }
      }
    } catch (err) {
      showToast('Failed to load support queues: ' + err.message, 'error');
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadSessionDetail = async (id, isSilent = false) => {
    try {
      if (!isSilent) setLoadingDetail(true);
      const res = await api.getSupportSessionDetail(id);
      if (res.success && res.data) {
        setSelectedSessionDetail(res.data.session);
        setSessionMessages(res.data.messages || []);

        // Pre-fill question pattern for teaching if available
        if (res.data.session.unresolved_question && !questionPattern) {
          setQuestionPattern(res.data.session.unresolved_question);
          setKeywords(res.data.session.unresolved_question.toLowerCase());
        }
      }
    } catch (err) {
      if (!isSilent) showToast('Failed to load session details: ' + err.message, 'error');
    } finally {
      if (!isSilent) setLoadingDetail(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedSessionId || !replyText.trim()) return;

    try {
      setSendingReply(true);
      const res = await api.sendSupportReply({
        session_id: selectedSessionId,
        message: replyText.trim(),
        auto_teach: autoTeach,
        question_pattern: questionPattern.trim() || selectedSessionDetail?.unresolved_question || '',
        keywords: keywords.trim()
      });

      if (res.success) {
        showToast(
          res.data.is_taught
            ? 'Reply sent and permanently taught to CampusDesk AI engine!'
            : 'Reply delivered to student successfully.',
          'success'
        );
        setReplyText('');
        loadSessionDetail(selectedSessionId);
        loadSessions();
      }
    } catch (err) {
      showToast('Failed to deliver reply: ' + err.message, 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const handleResolveSession = async () => {
    if (!selectedSessionId) return;
    try {
      const res = await api.resolveSupportSession({ session_id: selectedSessionId });
      if (res.success) {
        showToast('Support session marked resolved.', 'success');
        loadSessionDetail(selectedSessionId);
        loadSessions();
      }
    } catch (err) {
      showToast('Failed to resolve session: ' + err.message, 'error');
    }
  };

  const loadLearnedQA = async () => {
    try {
      setLoadingQA(true);
      const res = await api.getSupportLearnedQA();
      if (res.success && res.data) {
        setLearnedQAList(res.data.qa_items || []);
      }
    } catch (err) {
      showToast('Failed to load learned knowledge base: ' + err.message, 'error');
    } finally {
      setLoadingQA(false);
    }
  };

  const handleTeachSubmit = async (e) => {
    e.preventDefault();
    if (!teachForm.question.trim() || !teachForm.answer.trim()) {
      showToast('Question pattern and answer are required.', 'error');
      return;
    }

    try {
      setSubmittingTeach(true);
      const res = await api.teachSupportQA(teachForm);
      if (res.success) {
        showToast('New knowledge entry taught to CampusDesk AI!', 'success');
        setTeachModalOpen(false);
        setTeachForm({
          question: '',
          keywords: '',
          answer: '',
          answer_hi: '',
          answer_or: '',
          category: 'general',
          action_route: ''
        });
        loadLearnedQA();
      }
    } catch (err) {
      showToast('Teaching failed: ' + err.message, 'error');
    } finally {
      setSubmittingTeach(false);
    }
  };

  const handleDeleteQA = async (id) => {
    if (!window.confirm('Delete this learned knowledge entry?')) return;
    try {
      const res = await api.deleteSupportQA({ id });
      if (res.success) {
        showToast('Knowledge entry removed.', 'success');
        loadLearnedQA();
      }
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    }
  };

  const loadSettings = async () => {
    try {
      const res = await api.getSupportSettings();
      if (res.success && res.data?.settings) {
        setSettings(prev => ({ ...prev, ...res.data.settings }));
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await api.updateSupportSettings(settings);
      if (res.success) {
        showToast('Campus AI and support settings saved successfully.', 'success');
      }
    } catch (err) {
      showToast('Failed to save settings: ' + err.message, 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTestQuery = async () => {
    if (!testQuery.trim()) return;
    try {
      setTestingAi(true);
      setTestResult(null);
      const res = await api.askChatbot({ query: testQuery, language: 'en' });
      if (res.success && res.data) {
        setTestResult(res.data);
      }
    } catch (err) {
      showToast('AI test query failed: ' + err.message, 'error');
    } finally {
      setTestingAi(false);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. Header Masthead */}
      <div className="surface-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--primary-border)'
            }}>
              <Headphones size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Campus Support Desk & Self-Learning AI Hub
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Live student chat handovers, Campus AI integration, and continuous self-learning knowledge loop
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              className="app-btn app-btn-secondary"
              onClick={() => {
                if (activeTab === 'sessions') loadSessions();
                else if (activeTab === 'knowledge') loadLearnedQA();
              }}
            >
              <RefreshCw size={14} className={loadingSessions || loadingQA ? 'animate-spin' : ''} />
              <span>Refresh Desk</span>
            </button>
            <button
              className="app-btn app-btn-primary"
              onClick={() => setTeachModalOpen(true)}
            >
              <Plus size={16} />
              <span>Teach New Answer</span>
            </button>
          </div>
        </div>

        {/* Operational Health Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            padding: '14px',
            background: sessionCounts.pending > 0 ? '#FEF2F2' : 'var(--canvas)',
            borderRadius: '6px',
            border: sessionCounts.pending > 0 ? '1px solid #FCA5A5' : '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '11px', color: sessionCounts.pending > 0 ? '#991B1B' : 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Pending Escalations
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: sessionCounts.pending > 0 ? '#991B1B' : 'var(--text-primary)', marginTop: '4px' }}>
              {sessionCounts.pending}
            </div>
            <div style={{ fontSize: '11px', color: sessionCounts.pending > 0 ? '#991B1B' : 'var(--text-tertiary)', marginTop: '2px' }}>
              Students waiting for staff
            </div>
          </div>

          <div style={{ padding: '14px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>
              Human Active Chats
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#92400E', marginTop: '4px' }}>
              {sessionCounts.active}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Staff currently assisting
            </div>
          </div>

          <div style={{ padding: '14px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Resolved Consultations
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
              {sessionCounts.resolved}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Closed inquiries
            </div>
          </div>

          <div style={{ padding: '14px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>
              Self-Learned QA Bank
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>
              {sessionCounts.learned_total}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Permanent learned answers
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
        <button
          onClick={() => setActiveTab('sessions')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'sessions' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'sessions' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MessageSquare size={16} />
          <span>Live Student Handover Queues ({sessionCounts.pending + sessionCounts.active})</span>
        </button>

        <button
          onClick={() => setActiveTab('knowledge')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'knowledge' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'knowledge' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <BookOpen size={16} />
          <span>Self-Learned Knowledge Base ({sessionCounts.learned_total})</span>
          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '10px',
            background: 'var(--primary-subtle)',
            color: 'var(--primary)',
            border: '1px solid var(--primary-border)'
          }}>
            SELF-LEARNING
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'settings' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sliders size={16} />
          <span>Campus AI Engine Settings</span>
        </button>
      </div>

      {/* TAB 1: LIVE STUDENT QUEUES & CONSOLE */}
      {activeTab === 'sessions' && (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', alignItems: 'start' }}>
          
          {/* Left Column: Sessions Queue List */}
          <div className="surface-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', height: '680px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                Student Inquiries
              </span>
              <select
                className="input-field"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto', padding: '4px 8px', fontSize: '11px' }}
              >
                <option value="all">All Statuses</option>
                <option value="escalated_pending">Pending Handover</option>
                <option value="human_active">Human Active</option>
                <option value="bot">Bot Active</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {loadingSessions ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                Polling support queues...
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <CheckCircle2 size={32} style={{ color: 'var(--primary)', margin: '0 auto 8px' }} />
                No active student inquiries in queue.
              </div>
            ) : (
              sessions.map((s) => {
                const isSelected = selectedSessionId === s.id;
                const isPending = s.status === 'escalated_pending';
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSessionId(s.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '6px',
                      background: isSelected ? 'var(--primary-subtle)' : 'var(--canvas)',
                      border: isSelected
                        ? '1px solid var(--primary)'
                        : isPending
                        ? '1px solid #FCA5A5'
                        : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                        {s.student_name || s.student_username}
                      </strong>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isPending ? '#FEE2E2' : s.status === 'human_active' ? '#FEF3C7' : '#DCFCE7',
                        color: isPending ? '#991B1B' : s.status === 'human_active' ? '#92400E' : '#15803D',
                        border: isPending ? '1px solid #FCA5A5' : '1px solid transparent'
                      }}>
                        {isPending ? 'HANDOVER QUEUED' : s.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Roll: <span style={{ fontFamily: 'var(--font-mono)' }}>{s.roll_number || 'N/A'}</span> • {s.hostel_name || 'Hostel'} Room {s.room_number || '-'}
                    </div>

                    <div style={{
                      fontSize: '12px',
                      color: isPending ? '#991B1B' : 'var(--text-secondary)',
                      fontStyle: 'italic',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {s.unresolved_question || s.last_message || 'Awaiting question...'}
                    </div>

                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                      {s.last_message_at ? formatDateTime12(s.last_message_at) : 'Active'}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Active Conversation Console & Teaching Workspace */}
          <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', height: '680px' }}>
            {selectedSessionDetail ? (
              <>
                {/* Session Header Details */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '14px',
                  borderBottom: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'var(--primary-subtle)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800
                    }}>
                      <User size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        {selectedSessionDetail.student_name} ({selectedSessionDetail.student_username})
                      </h3>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Roll: {selectedSessionDetail.roll_number} • Dept: {selectedSessionDetail.department_name} • {selectedSessionDetail.hostel_name} (Room {selectedSessionDetail.room_number})
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {selectedSessionDetail.status !== 'resolved' && (
                      <button
                        className="app-btn app-btn-secondary app-btn-sm"
                        onClick={handleResolveSession}
                      >
                        <CheckCircle2 size={13} />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Message Stream */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '12px',
                  background: '#FAF9F6',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {loadingDetail ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      Retrieving transcript...
                    </div>
                  ) : sessionMessages.map((m) => {
                    const isStaff = m.sender_type === 'human_staff';
                    const isStudent = m.sender_type === 'student';
                    return (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isStaff ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div style={{
                          maxWidth: '80%',
                          padding: '10px 14px',
                          borderRadius: isStaff
                            ? '12px 12px 2px 12px'
                            : isStudent
                            ? '12px 12px 12px 2px'
                            : '8px',
                          background: isStaff
                            ? 'var(--primary)'
                            : isStudent
                            ? '#FFFFFF'
                            : 'var(--canvas)',
                          color: isStaff ? '#FFFFFF' : 'var(--text-primary)',
                          border: isStaff ? 'none' : '1px solid var(--border-subtle)',
                          fontSize: '13px',
                          lineHeight: 1.45
                        }}>
                          <div style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            marginBottom: '4px',
                            opacity: 0.85,
                            textTransform: 'uppercase'
                          }}>
                            {isStaff ? 'Staff Support Officer' : isStudent ? 'Student' : 'CampusDesk Bot'}
                            {m.is_learned === 1 && ' • Self-Learned QA'}
                          </div>
                          {m.message_text}
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                          {formatDateTime12(m.created_at)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Reply & Teach Workspace */}
                <form onSubmit={handleSendReply} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{
                    padding: '10px 14px',
                    background: 'var(--canvas)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                        <input
                          type="checkbox"
                          checked={autoTeach}
                          onChange={(e) => setAutoTeach(e.target.checked)}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <span>Permanently Save & Teach CampusDesk Bot (Self-Learning Loop)</span>
                      </label>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        Next student with this query gets answered automatically
                      </span>
                    </div>

                    {autoTeach && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                            Question Pattern
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            value={questionPattern}
                            onChange={(e) => setQuestionPattern(e.target.value)}
                            placeholder="e.g. What time does the office start?"
                            style={{ padding: '5px 8px', fontSize: '11px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                            Search Keywords (Comma separated)
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder="e.g. office timing, start time, open"
                            style={{ padding: '5px 8px', fontSize: '11px' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <textarea
                      rows={2}
                      className="input-field"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type the official answer to the student..."
                      style={{ flex: 1, resize: 'none' }}
                    />
                    <button
                      type="submit"
                      disabled={sendingReply || !replyText.trim()}
                      className="app-btn app-btn-primary"
                      style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Send size={15} />
                      <span>{autoTeach ? 'Reply & Teach' : 'Reply'}</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                Select an active student inquiry from the left queue to open the live support console.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SELF-LEARNED KNOWLEDGE BASE */}
      {activeTab === 'knowledge' && (
        <div className="surface-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                CampusDesk Self-Learned Knowledge Base (Q&A Repository)
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Every question answered by staff or taught here is indexed into the autonomous NLP engine for instant student responses.
              </p>
            </div>
            <button
              className="app-btn app-btn-primary app-btn-sm"
              onClick={() => setTeachModalOpen(true)}
            >
              <Plus size={14} />
              <span>Teach New Question</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th>Question Pattern</th>
                  <th>Keywords</th>
                  <th>Approved Institutional Answer</th>
                  <th>Category</th>
                  <th>Times Used</th>
                  <th>Taught By</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingQA ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      Loading knowledge repository...
                    </td>
                  </tr>
                ) : learnedQAList.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      No knowledge entries recorded.
                    </td>
                  </tr>
                ) : (
                  learnedQAList.map((qa) => (
                    <tr key={qa.id}>
                      <td style={{ maxWidth: '200px' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{qa.question_pattern}</strong>
                      </td>
                      <td style={{ maxWidth: '180px', color: 'var(--text-secondary)', fontSize: '11px' }}>
                        {qa.keywords}
                      </td>
                      <td style={{ maxWidth: '320px', lineHeight: 1.4 }}>
                        <div style={{ color: 'var(--text-primary)' }}>{qa.answer_text}</div>
                        {qa.answer_hi && (
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            HI: {qa.answer_hi}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'var(--canvas)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '11px',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {qa.category}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: '#DCFCE7',
                          color: '#15803D',
                          fontWeight: 700
                        }}>
                          {qa.times_used} uses
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                        {qa.taught_by_name || 'Pre-Trained'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteQA(qa.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#DC2626',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Delete entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CAMPUS AI ENGINE SETTINGS */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Settings Form */}
          <div className="surface-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                AI Chatbot Engine Configuration (Campus Intelligence Engine)
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Configure primary AI inference engine API key for automated campus chat when an inquiry is not already in the self-learned knowledge base.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  AI Engine API Key
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Primary Engine Key (Leave empty to use institutional default)..."
                  value={settings.grok_api_key || ''}
                  onChange={(e) => setSettings({ ...settings, grok_api_key: e.target.value })}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '3px', display: 'block' }}>
                  Institutional API key configured. Fast campus conversational models supported out of the box.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Model Selection (Primary LLM Architecture)
                </label>
                <select
                  className="input-field"
                  value={settings.grok_model || 'openai/gpt-oss-20b'}
                  onChange={(e) => setSettings({ ...settings, grok_model: e.target.value })}
                >
                  <option value="openai/gpt-oss-20b">openai/gpt-oss-20b (Recommended Normal Model - Fast & Concise)</option>
                  <option value="qwen/qwen3.8-27b">qwen/qwen3.8-27b (High Accuracy Multilingual Chat Model)</option>
                  <option value="grok-beta">Campus Neural Fast (Institutional LLM)</option>
                  <option value="grok-2-latest">Campus Neural Advanced (High Precision)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Human Handover Request Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="input-field"
                  value={settings.human_escalation_threshold || '2'}
                  onChange={(e) => setSettings({ ...settings, human_escalation_threshold: e.target.value })}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '3px', display: 'block' }}>
                  Number of times a student must request "connect to human" before automated queue handover occurs (Default: 2).
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Official Campus Office Working Hours
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={settings.campus_office_hours || ''}
                  onChange={(e) => setSettings({ ...settings, campus_office_hours: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="app-btn app-btn-primary"
                style={{ marginTop: '8px' }}
              >
                <span>Save AI Engine Configuration</span>
              </button>
            </form>
          </div>

          {/* Test & Simulation Console */}
          <div className="surface-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Live Chatbot Verification Console
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Test any question to verify whether it resolves via the Self-Learned Knowledge Base, Live AI Engine, or triggers staff handover.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Ask e.g. What time does the office start? or Connect me to human"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTestQuery()}
              />
              <button
                className="app-btn app-btn-primary"
                onClick={handleTestQuery}
                disabled={testingAi || !testQuery.trim()}
              >
                <span>Test</span>
              </button>
            </div>

            {testResult && (
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                background: 'var(--canvas)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)' }}>
                    Source: {testResult.source || 'campus_engine'}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: testResult.is_learned ? '#DCFCE7' : '#FEF3C7',
                    color: testResult.is_learned ? '#15803D' : '#92400E'
                  }}>
                    {testResult.is_learned ? 'SELF-LEARNED MATCH' : 'UNRESOLVED / ESCALATION'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {testResult.message}
                </div>
                {testResult.action_route && (
                  <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                    1-Click Route Trigger: {testResult.action_route}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Teach New Question Modal */}
      {teachModalOpen && (
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
          zIndex: 99999
        }}>
          <div className="surface-card" style={{ width: '560px', maxWidth: '90vw', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Teach CampusDesk New Answer (Self-Learning)
              </h3>
              <button
                onClick={() => setTeachModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTeachSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                  Question Pattern (How students ask it)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. What time does the scholarship verification desk open?"
                  value={teachForm.question}
                  onChange={(e) => setTeachForm({ ...teachForm, question: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                  Search Keywords (Comma separated)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. scholarship, verification, counter, timing, open"
                  value={teachForm.keywords}
                  onChange={(e) => setTeachForm({ ...teachForm, keywords: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                  Approved Answer (English)
                </label>
                <textarea
                  rows={3}
                  className="input-field"
                  placeholder="Enter the official institutional answer..."
                  value={teachForm.answer}
                  onChange={(e) => setTeachForm({ ...teachForm, answer: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                    Optional Hindi Translation
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="हिंदी में उत्तर..."
                    value={teachForm.answer_hi}
                    onChange={(e) => setTeachForm({ ...teachForm, answer_hi: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                    Optional Odia Translation
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="ଓଡ଼ିଆରେ ଉତ୍ତର..."
                    value={teachForm.answer_or}
                    onChange={(e) => setTeachForm({ ...teachForm, answer_or: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                    Category
                  </label>
                  <select
                    className="input-field"
                    value={teachForm.category}
                    onChange={(e) => setTeachForm({ ...teachForm, category: e.target.value })}
                  >
                    <option value="general">General</option>
                    <option value="administration">Administration & Office</option>
                    <option value="mess">Mess & Dining</option>
                    <option value="academics">Academics & Attendance</option>
                    <option value="hostel">Hostel & Curfew</option>
                    <option value="services">Digital Certificates</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                    1-Click Deep Link Route
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. /services or /gatepass"
                    value={teachForm.action_route}
                    onChange={(e) => setTeachForm({ ...teachForm, action_route: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="app-btn app-btn-secondary"
                  onClick={() => setTeachModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTeach}
                  className="app-btn app-btn-primary"
                >
                  Save & Index into AI Engine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
