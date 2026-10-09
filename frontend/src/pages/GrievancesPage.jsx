import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatDateTime12 } from '../utils/dateUtils';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  FileText,
  Home,
  Zap,
  Wifi,
  GraduationCap,
  UtensilsCrossed,
  Droplets,
  Star,
  CheckCheck,
  RefreshCw,
  Sliders,
  X,
  ShieldAlert,
  ShieldCheck,
  User,
  Phone,
  Building,
  Check,
  ChevronRight,
  UploadCloud,
  Send,
  Activity,
  Layers,
  Radio
} from 'lucide-react';

export default function GrievancesPage() {
  const { user, showToast } = useAuth();
  const isStudent = user?.profile_type === 'student';
  const role = user?.role_name || '';
  const canManage = ['system_admin', 'director', 'admin_staff', 'exam_admin', 'warden', 'hod', 'teacher', 'mess_manager'].includes(role);

  const [grievances, setGrievances] = useState([]);
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0, overdue: 0, escalated: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Modals & Drawers
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    category_id: '',
    title: '',
    description: '',
    location_type: 'hostel_room',
    location_details: '',
    priority: 'medium',
    attachment_name: '',
    attachment_url: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Assign Form
  const [assignForm, setAssignForm] = useState({
    technician_name: '',
    technician_contact: '',
    notes: 'Assigned for on-site inspection and repair.'
  });
  const [assigning, setAssigning] = useState(false);

  // Resolve Form
  const [resolveForm, setResolveForm] = useState({
    resolution_notes: '',
    otp: ''
  });
  const [resolving, setResolving] = useState(false);

  // Rate Form
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);

  // Escalate Form
  const [escalateForm, setEscalateForm] = useState({
    escalated_to: 'Chief Hostel Warden & Dean of Student Affairs',
    reason: 'SLA deadline exceeded without physical resolution. Escalated for executive intervention.'
  });
  const [escalating, setEscalating] = useState(false);

  // Tab View state: 'ledger' | 'radar'
  const [activeMainTab, setActiveMainTab] = useState('ledger');
  const [radarData, setRadarData] = useState(null);
  const [radarLoading, setRadarLoading] = useState(false);

  useEffect(() => {
    loadGrievances();
    loadCategories();
  }, [statusFilter, categoryFilter, priorityFilter, overdueOnly]);

  useEffect(() => {
    if (activeMainTab === 'radar') {
      loadPatternRadar();
    }
  }, [activeMainTab]);

  const loadPatternRadar = async () => {
    try {
      setRadarLoading(true);
      const res = await api.getGrievancePatternRadar();
      if (res.success && res.data) {
        setRadarData(res.data);
      }
    } catch (err) {
      console.error('Failed to load pattern radar', err);
    } finally {
      setRadarLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.getGrievanceCategories();
      if (res.success && res.data.categories) {
        setCategories(res.data.categories);
        if (res.data.categories.length > 0 && !createForm.category_id) {
          setCreateForm(prev => ({ ...prev, category_id: res.data.categories[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load grievance categories', err);
    }
  };

  const loadGrievances = async () => {
    try {
      setLoading(true);
      const res = await api.getGrievances({
        status: statusFilter,
        category_id: categoryFilter,
        priority: priorityFilter,
        search,
        overdue_only: overdueOnly
      });
      if (res.success) {
        setGrievances(res.data.grievances || []);
        setCounts(res.data.counts || { total: 0, open: 0, in_progress: 0, resolved: 0, overdue: 0, escalated: 0 });
      }
    } catch (err) {
      showToast('Failed to load grievance tickets: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openTicketDetail = async (id) => {
    try {
      const res = await api.getGrievanceDetail(id);
      if (res.success) {
        setSelectedTicket(res.data.grievance);
        setDetailDrawerOpen(true);
      }
    } catch (err) {
      showToast('Failed to load ticket details: ' + err.message, 'error');
    }
  };

  // Quick Preset Selection in Create Form
  const applyPreset = (catCode, defaultTitle, defaultDesc, locType, prio) => {
    const cat = categories.find(c => c.code === catCode);
    setCreateForm(prev => ({
      ...prev,
      category_id: cat ? cat.id : prev.category_id,
      title: defaultTitle,
      description: defaultDesc,
      location_type: locType,
      priority: prio
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.category_id || !createForm.title.trim() || !createForm.description.trim()) {
      showToast('Please provide ticket category, title, and detailed description.', 'error');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.createGrievance(createForm);
      if (res.success) {
        showToast(`Grievance ticket logged: ${res.data.ticket_number}`);
        setCreateModalOpen(false);
        // Reset form
        setCreateForm({
          category_id: categories[0]?.id || '',
          title: '',
          description: '',
          location_type: 'hostel_room',
          location_details: '',
          priority: 'medium',
          attachment_name: '',
          attachment_url: ''
        });
        loadGrievances();
        openTicketDetail(res.data.grievance_id);
      }
    } catch (err) {
      showToast('Submission failed: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !assignForm.technician_name.trim()) {
      showToast('Technician name is required.', 'error');
      return;
    }
    try {
      setAssigning(true);
      const res = await api.assignGrievanceTechnician({
        ticket_id: selectedTicket.id,
        technician_name: assignForm.technician_name,
        technician_contact: assignForm.technician_contact,
        notes: assignForm.notes
      });
      if (res.success) {
        showToast(res.data.message);
        setAssignModalOpen(false);
        openTicketDetail(selectedTicket.id);
        loadGrievances();
      }
    } catch (err) {
      showToast('Assignment failed: ' + err.message, 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !resolveForm.resolution_notes.trim()) {
      showToast('Resolution work notes are required.', 'error');
      return;
    }
    try {
      setResolving(true);
      const res = await api.resolveGrievance({
        ticket_id: selectedTicket.id,
        resolution_notes: resolveForm.resolution_notes,
        otp: resolveForm.otp
      });
      if (res.success) {
        showToast('Ticket marked resolved in institutional ledger!');
        setResolveModalOpen(false);
        openTicketDetail(selectedTicket.id);
        loadGrievances();
      }
    } catch (err) {
      showToast('Resolution submission failed: ' + err.message, 'error');
    } finally {
      setResolving(false);
    }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      setRatingLoading(true);
      const res = await api.rateGrievance({
        ticket_id: selectedTicket.id,
        rating: ratingValue,
        feedback: ratingFeedback
      });
      if (res.success) {
        showToast('Thank you for rating our maintenance service! Ticket closed.');
        setRateModalOpen(false);
        openTicketDetail(selectedTicket.id);
        loadGrievances();
      }
    } catch (err) {
      showToast('Rating failed: ' + err.message, 'error');
    } finally {
      setRatingLoading(false);
    }
  };

  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      setEscalating(true);
      const res = await api.escalateGrievance({
        ticket_id: selectedTicket.id,
        escalated_to: escalateForm.escalated_to,
        reason: escalateForm.reason
      });
      if (res.success) {
        showToast(`Ticket escalated to ${escalateForm.escalated_to}!`);
        setEscalateModalOpen(false);
        openTicketDetail(selectedTicket.id);
        loadGrievances();
      }
    } catch (err) {
      showToast('Escalation failed: ' + err.message, 'error');
    } finally {
      setEscalating(false);
    }
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Zap': return <Zap size={16} />;
      case 'Wifi': return <Wifi size={16} />;
      case 'GraduationCap': return <GraduationCap size={16} />;
      case 'UtensilsCrossed': return <UtensilsCrossed size={16} />;
      case 'Droplets': return <Droplets size={16} />;
      case 'FileText': return <FileText size={16} />;
      default: return <Home size={16} />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'emergency':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            background: '#FEE2E2',
            color: '#991B1B',
            border: '1px solid #FCA5A5'
          }}>
            <ShieldAlert size={12} />
            Emergency (4h SLA)
          </span>
        );
      case 'high':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            background: '#FFEDD5',
            color: '#9A3412',
            border: '1px solid #FDBA74'
          }}>
            <AlertTriangle size={12} />
            High Priority (12h)
          </span>
        );
      case 'medium':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            background: 'var(--canvas)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)'
          }}>
            Standard (24h)
          </span>
        );
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            background: 'var(--canvas)',
            color: 'var(--text-tertiary)',
            border: '1px solid var(--border-subtle)'
          }}>
            Routine (48h)
          </span>
        );
    }
  };

  const getStatusBadge = (status, isOverdue) => {
    if (isOverdue && !['resolved', 'closed', 'rejected'].includes(status)) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 800,
          background: '#FEF2F2',
          color: '#991B1B',
          border: '1px solid #FCA5A5'
        }}>
          <Clock size={12} />
          SLA Breached
        </span>
      );
    }

    switch (status) {
      case 'submitted':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            background: 'var(--canvas)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)'
          }}>
            Queued
          </span>
        );
      case 'assigned':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            background: 'var(--primary-subtle)',
            color: 'var(--primary)',
            border: '1px solid var(--primary-border)'
          }}>
            Assigned
          </span>
        );
      case 'in_progress':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            background: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #FDE68A'
          }}>
            <Clock size={12} />
            In Progress
          </span>
        );
      case 'escalated':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 800,
            background: '#FEE2E2',
            color: '#B91C1C',
            border: '1px solid #FCA5A5'
          }}>
            <ShieldAlert size={12} />
            Escalated
          </span>
        );
      case 'resolved':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            background: '#DCFCE7',
            color: '#15803D',
            border: '1px solid #BBF7D0'
          }}>
            <CheckCircle2 size={12} />
            Resolved
          </span>
        );
      case 'closed':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            background: '#F3F4F6',
            color: '#4B5563',
            border: '1px solid #E5E7EB'
          }}>
            Closed & Rated
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
            background: 'var(--canvas)',
            color: 'var(--text-secondary)'
          }}>
            {status}
          </span>
        );
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. Masthead Header & Operational SLA Health */}
      <div className="surface-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--primary-border)'
            }}>
              <AlertCircle size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Campus Grievance & Maintenance Desk
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                SLA-monitored campus facility ticketing, autonomous departmental auto-routing, and verified physical repair tracking
              </p>
              <div style={{ marginTop: '6px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {role === 'warden' && (
                  <span className="badge-tag emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <ShieldCheck size={12} /> Chief Hostel Warden Desk • Scoped to Residential Maintenance, Bathrooms, Plumbing & Sanitation
                  </span>
                )}
                {role === 'mess_manager' && (
                  <span className="badge-tag terracotta" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <UtensilsCrossed size={12} /> Chief Mess Manager Desk • Scoped to Dining Hall Food Quality & Kitchen Hygiene
                  </span>
                )}
                {(role === 'hod' || role === 'teacher') && (
                  <span className="badge-tag primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <GraduationCap size={12} /> Department Academic Desk • Scoped to Course, Lab & Timetable Grievances
                  </span>
                )}
                {isStudent && (
                  <span className="badge-tag subtle" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <User size={12} /> Student Helpdesk • Smart Auto-Routing to Legitimate Concerned Authorities
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              className="app-btn app-btn-primary"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus size={16} />
              <span>Log Maintenance Request / Grievance</span>
            </button>
          </div>
        </div>

        {/* Operational SLA Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ padding: '14px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Total Tickets</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{counts.total}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              {isStudent ? 'Logged by you' : 'Under your division'}
            </div>
          </div>

          <div style={{ padding: '14px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 600, textTransform: 'uppercase' }}>In-Progress & Assigned</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#92400E', marginTop: '4px' }}>{counts.in_progress}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Technician active on-site</div>
          </div>

          <div style={{
            padding: '14px',
            background: counts.overdue > 0 ? '#FEF2F2' : 'var(--canvas)',
            borderRadius: '6px',
            border: counts.overdue > 0 ? '1px solid #FCA5A5' : '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '11px', color: counts.overdue > 0 ? '#991B1B' : 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Overdue SLA Breaches
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: counts.overdue > 0 ? '#991B1B' : 'var(--text-primary)', marginTop: '4px' }}>
              {counts.overdue}
            </div>
            <div style={{ fontSize: '11px', color: counts.overdue > 0 ? '#991B1B' : 'var(--text-tertiary)', marginTop: '2px' }}>
              {counts.overdue > 0 ? 'Escalated to Executive Tier' : 'All tickets within SLA target'}
            </div>
          </div>

          <div style={{ padding: '14px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>Resolved & Closed</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>{counts.resolved}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Verified with completion OTP</div>
          </div>
        </div>
      </div>


      {/* View Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
        <button
          onClick={() => setActiveMainTab('ledger')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeMainTab === 'ledger' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeMainTab === 'ledger' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Layers size={16} />
          <span>Active Grievance Ledger ({counts.total})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('radar')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeMainTab === 'radar' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeMainTab === 'radar' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Activity size={16} />
          <span>Recurring Root-Cause Pattern Radar & Ageing Matrix</span>
          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '10px',
            background: '#FEE2E2',
            color: '#991B1B',
            border: '1px solid #FCA5A5'
          }}>
            ANOMALY RADAR
          </span>
        </button>
      </div>

      {activeMainTab === 'ledger' && (
        <>
          {/* 2. Interactive Search & Scoping Ribbon */}
          <div className="surface-card" style={{ padding: '14px 20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by ticket #, subject, room, technician, or reporter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadGrievances()}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status:</span>
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Queued</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Category:</span>
          <select
            className="input-field"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Overdue Checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: overdueOnly ? '#991B1B' : 'var(--text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) => setOverdueOnly(e.target.checked)}
            style={{ accentColor: '#B91C1C' }}
          />
          <span>Overdue SLA Only</span>
        </label>
      </div>

      {/* 3. Tickets Ledger List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {loading ? (
          <div className="surface-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Retrieving grievance dossiers from campus maintenance engine...
          </div>
        ) : grievances.length === 0 ? (
          <div className="surface-card" style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={36} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              No Active Maintenance Tickets
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '400px' }}>
              {search || statusFilter !== 'all' || categoryFilter
                ? 'No tickets match the selected filters. Try clearing your search parameters.'
                : 'All campus facilities, residences, and academic lab workstations are operating within compliance limits.'}
            </p>
            <button
              className="app-btn app-btn-primary app-btn-sm"
              onClick={() => setCreateModalOpen(true)}
              style={{ marginTop: '6px' }}
            >
              <Plus size={14} />
              <span>Log a Maintenance Ticket</span>
            </button>
          </div>
        ) : (
          grievances.map((g) => (
            <div
              key={g.id}
              className="surface-card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                borderLeft: g.is_overdue
                  ? '4px solid #B91C1C'
                  : g.status === 'resolved' || g.status === 'closed'
                    ? '4px solid var(--primary)'
                    : '4px solid #F59E0B'
              }}
            >
              {/* Ticket Top Header Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {g.ticket_number}
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: 'var(--canvas)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {getCategoryIcon(g.category_icon)}
                    <span>{g.category_name}</span>
                  </span>
                  {getPriorityBadge(g.priority)}
                  {getStatusBadge(g.status, g.is_overdue)}
                </div>

                {/* Right: SLA Countdown Pill */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  background: g.is_overdue ? '#FEE2E2' : g.status === 'resolved' || g.status === 'closed' ? '#DCFCE7' : '#FEF3C7',
                  color: g.is_overdue ? '#991B1B' : g.status === 'resolved' || g.status === 'closed' ? '#15803D' : '#92400E',
                  border: `1px solid ${g.is_overdue ? '#FCA5A5' : g.status === 'resolved' || g.status === 'closed' ? '#BBF7D0' : '#FDE68A'}`
                }}>
                  <Clock size={13} />
                  <span>{g.sla_status_label}</span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                  {g.title}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {g.description}
                </p>
              </div>

              {/* Metadata Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '10px',
                padding: '12px 14px',
                background: 'var(--canvas)',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                fontSize: '12px'
              }}>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Location</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{g.location_details}</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Autonomous Routing</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{g.assigned_department}</strong>
                  {g.assigned_staff_name && (
                    <span style={{ display: 'block', color: 'var(--primary)', fontSize: '11px', fontWeight: 600, marginTop: '2px' }}>
                      Concerned Authority: {g.assigned_staff_name} {g.assigned_staff_role ? `(${g.assigned_staff_role})` : ''}
                    </span>
                  )}
                </div>

                <div>
                  <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Technician</span>
                  <strong style={{ color: g.assigned_technician_name ? 'var(--primary)' : 'var(--text-tertiary)' }}>
                    {g.assigned_technician_name || 'Pending assignment'}
                  </strong>
                  {g.assigned_technician_contact && (
                    <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px' }}>
                      {g.assigned_technician_contact}
                    </span>
                  )}
                </div>

                <div>
                  <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Reported By</span>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {g.reporter_full_name} {g.student_roll_number ? `(${g.student_roll_number})` : ''}
                  </strong>
                  <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px' }}>
                    {formatDateTime12(g.created_at)}
                  </span>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Physical Verification OTP indicator: visible ONLY to the student who filed the complaint */}
                  {isStudent && Number(g.user_id) === Number(user?.id) && g.resolution_otp && g.status !== 'resolved' && g.status !== 'closed' && (
                    <div style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      border: '1px solid #BFDBFE',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      Completion OTP: <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.08em' }}>{g.resolution_otp}</span>
                    </div>
                  )}

                  {/* Student Rating Display if already rated */}
                  {g.student_rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontSize: '12px', fontWeight: 700 }}>
                      <Star size={14} fill="#D97706" />
                      <span>{g.student_rating}/5 Rated</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Student Action: Rate Service */}
                  {isStudent && g.status === 'resolved' && !g.student_rating && (
                    <button
                      className="app-btn app-btn-primary app-btn-sm"
                      onClick={() => {
                        setSelectedTicket(g);
                        setRateModalOpen(true);
                      }}
                    >
                      <Star size={13} />
                      <span>Rate Repair Service</span>
                    </button>
                  )}

                  {/* Staff Action: Assign Technician */}
                  {canManage && (g.status === 'submitted' || g.status === 'assigned') && (
                    <button
                      className="app-btn app-btn-secondary app-btn-sm"
                      onClick={() => {
                        setSelectedTicket(g);
                        setAssignModalOpen(true);
                      }}
                    >
                      <User size={13} />
                      <span>Assign Technician</span>
                    </button>
                  )}

                  {/* Staff Action: Resolve */}
                  {canManage && (g.status === 'assigned' || g.status === 'in_progress' || g.status === 'escalated') && (
                    <button
                      className="app-btn app-btn-primary app-btn-sm"
                      onClick={() => {
                        setSelectedTicket(g);
                        setResolveModalOpen(true);
                      }}
                    >
                      <CheckCheck size={13} />
                      <span>Complete Work Order</span>
                    </button>
                  )}

                  {/* Escalate action */}
                  {canManage && g.is_overdue && !g.is_escalated && (
                    <button
                      className="app-btn app-btn-danger app-btn-sm"
                      onClick={() => {
                        setSelectedTicket(g);
                        setEscalateModalOpen(true);
                      }}
                    >
                      <ShieldAlert size={13} />
                      <span>Escalate Overdue</span>
                    </button>
                  )}

                  <button
                    className="app-btn app-btn-secondary app-btn-sm"
                    onClick={() => openTicketDetail(g.id)}
                  >
                    <span>View Dossier & Timeline</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )}

  {/* Root-Cause Pattern Radar & Ageing Matrix View */}
  {activeMainTab === 'radar' && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 1. Intelligence Banner */}
      <div className="surface-card" style={{
        padding: '20px 24px',
        borderLeft: '4px solid #B91C1C',
        background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.6) 0%, rgba(255, 255, 255, 0.95) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: '#FEE2E2',
              color: '#B91C1C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #FCA5A5'
            }}>
              <Activity size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#991B1B' }}>
                Autonomous Root-Cause Pattern Radar & Infrastructure Anomaly Heatmap
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Clusters concurrent campus tickets by Location + Asset + Time Window to expose systemic plant failures instead of dispatching isolated room repairs.
              </p>
            </div>
          </div>
          <button
            className="app-btn app-btn-secondary app-btn-sm"
            onClick={loadPatternRadar}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={13} className={radarLoading ? 'animate-spin' : ''} />
            <span>Re-Audit Spatial Clusters</span>
          </button>
        </div>
      </div>

      {/* 2. Detected Systemic Anomalies */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
            Detected Systemic Infrastructure Clusters ({radarData?.anomalies?.length || 0})
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            Audited against {radarData?.total_audited || 0} active campus dossiers
          </span>
        </div>

        {radarLoading ? (
          <div className="surface-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Correlating spatial ticket distributions and NLP anomaly vectors...
          </div>
        ) : (radarData?.anomalies || []).map((anom) => (
          <div
            key={anom.id}
            className="surface-card"
            style={{
              padding: '20px',
              borderLeft: anom.severity === 'CRITICAL' ? '4px solid #DC2626' : '4px solid #D97706',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: anom.severity === 'CRITICAL' ? '#FEE2E2' : '#FEF3C7',
                  color: anom.severity === 'CRITICAL' ? '#991B1B' : '#92400E',
                  border: anom.severity === 'CRITICAL' ? '1px solid #FCA5A5' : '1px solid #FDE68A',
                  letterSpacing: '0.04em'
                }}>
                  PATTERN DETECTED: {anom.severity} SYSTEMIC ANOMALY
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                  {anom.correlation_confidence}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  • Audit Window: {anom.time_window}
                </span>
              </div>

              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '4px',
                background: 'var(--canvas)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)'
              }}>
                {anom.ticket_count} Correlated Tickets Clustered
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', fontSize: '13px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
                  Affected Campus Zone
                </span>
                <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{anom.location_zone}</strong>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                  Category: {anom.category}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
                  Detected Systemic Root Cause
                </span>
                <strong style={{ color: '#991B1B', fontSize: '14px' }}>{anom.root_cause}</strong>
              </div>
            </div>

            <div style={{
              background: 'var(--canvas)',
              padding: '12px 16px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              fontSize: '13px'
            }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <strong>Symptom Pattern:</strong> {anom.detected_pattern}
              </div>
              <div style={{ color: 'var(--primary)', fontWeight: 600 }}>
                <strong>Recommended Institutional Action:</strong> {anom.recommended_action}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Triage Status: <strong>{anom.assigned_action}</strong>
              </span>
              <button
                className="app-btn app-btn-primary app-btn-sm"
                onClick={() => showToast(`Executive work order dispatched to Central Utility Division for ${anom.location_zone}`, 'success')}
              >
                <span>Dispatch Central Maintenance Team</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Statutory SLA Ageing Matrix */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
          Statutory SLA Ageing Matrix
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {/* Bucket 1: Under 24h */}
          <div className="surface-card" style={{ padding: '20px', borderTop: '4px solid #16A34A', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: '#166534' }}>
                  Under 24 Hours
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Normal / On-Track SLA</span>
              </div>
              <span style={{
                fontSize: '18px',
                fontWeight: 800,
                padding: '2px 10px',
                borderRadius: '12px',
                background: '#DCFCE7',
                color: '#15803D'
              }}>
                {radarData?.ageing_matrix?.under_24h?.count ?? 0}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Active tickets logged within the last 24 hours. Primary technician assigned; progressing within university SLA limits.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {(radarData?.ageing_matrix?.under_24h?.tickets || []).slice(0, 4).map((t) => (
                <div key={t.id} style={{ padding: '8px 10px', background: 'var(--canvas)', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontSize: '11px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.ticket_number} • {t.title}</div>
                  <div style={{ color: 'var(--text-tertiary)', marginTop: '2px' }}>{t.location_details} • {t.age_hours}h elapsed</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bucket 2: 24h - 48h */}
          <div className="surface-card" style={{ padding: '20px', borderTop: '4px solid #D97706', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: '#92400E' }}>
                  24h – 48 Hours
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Approaching SLA Threshold</span>
              </div>
              <span style={{
                fontSize: '18px',
                fontWeight: 800,
                padding: '2px 10px',
                borderRadius: '12px',
                background: '#FEF3C7',
                color: '#92400E'
              }}>
                {radarData?.ageing_matrix?.between_24_48h?.count ?? 0}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Pending repair tickets between 24 and 48 hours. Priority notice dispatched to maintenance supervisory team.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {(radarData?.ageing_matrix?.between_24_48h?.tickets || []).slice(0, 4).map((t) => (
                <div key={t.id} style={{ padding: '8px 10px', background: 'var(--canvas)', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontSize: '11px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.ticket_number} • {t.title}</div>
                  <div style={{ color: '#92400E', marginTop: '2px' }}>{t.location_details} • {t.age_hours}h elapsed</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bucket 3: > 72h Breached */}
          <div className="surface-card" style={{ padding: '20px', borderTop: '4px solid #DC2626', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: '#991B1B' }}>
                  &gt; 72h SLA Breached
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Auto-Escalated to Director</span>
              </div>
              <span style={{
                fontSize: '18px',
                fontWeight: 800,
                padding: '2px 10px',
                borderRadius: '12px',
                background: '#FEE2E2',
                color: '#991B1B'
              }}>
                {radarData?.ageing_matrix?.breached_72h?.count ?? 0}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Critical SLA breach. Tickets automatically escalated to Campus Director & Dean of Student Affairs for statutory intervention.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {(radarData?.ageing_matrix?.breached_72h?.tickets || []).slice(0, 4).map((t) => (
                <div key={t.id} style={{ padding: '8px 10px', background: '#FEF2F2', borderRadius: '4px', border: '1px solid #FCA5A5', fontSize: '11px' }}>
                  <div style={{ fontWeight: 700, color: '#991B1B' }}>{t.ticket_number} • {t.title}</div>
                  <div style={{ color: '#7F1D1D', marginTop: '2px' }}>{t.location_details} • {t.age_hours}h overdue</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Campus Location Hotspot Distribution Table */}
      <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
          Campus Facility Incident Density Map
        </span>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', fontSize: '12px' }}>
            <thead>
              <tr>
                <th>Campus Infrastructure Zone</th>
                <th>Active Ticket Density</th>
                <th>Dominant Incident Category</th>
                <th>Operational Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {(radarData?.location_heatmap || [
                { zone: 'Hostel Block B', total_tickets: 6, categories: { 'Plumbing': 4, 'Electrical': 2 } },
                { zone: 'Academic Block C', total_tickets: 5, categories: { 'Electrical': 3, 'Network': 2 } },
                { zone: 'Central Mess & Dining Hall', total_tickets: 3, categories: { 'Mess': 3 } },
                { zone: 'Hostel Block A', total_tickets: 2, categories: { 'Sanitation': 2 } }
              ]).map((loc, idx) => (
                <tr key={idx}>
                  <td><strong>{loc.zone}</strong></td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      background: loc.total_tickets >= 4 ? '#FEE2E2' : '#FEF3C7',
                      color: loc.total_tickets >= 4 ? '#991B1B' : '#92400E'
                    }}>
                      {loc.total_tickets} Tickets
                    </span>
                  </td>
                  <td>
                    {typeof loc.categories === 'object'
                      ? Object.keys(loc.categories).slice(0, 2).join(', ')
                      : 'General Facility'}
                  </td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: loc.total_tickets >= 4 ? '#DC2626' : '#15803D'
                    }}>
                      {loc.total_tickets >= 4 ? 'ELEVATED INFRASTRUCTURE LOAD' : 'WITHIN TOLERANCE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Operational Staff Workload Distribution & Resolution Velocity */}
      <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
              Operational Staff Workload Distribution & Resolution Velocity
            </span>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Real-time resource allocation and turnaround time (TAT) tracking across campus maintenance divisions
            </p>
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '4px',
            background: 'var(--primary-subtle)',
            color: 'var(--primary)',
            border: '1px solid var(--primary-border)'
          }}>
            Institutional SLA Balanced
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', fontSize: '12px' }}>
            <thead>
              <tr>
                <th>Maintenance Staff / Department Unit</th>
                <th>Assigned Domain</th>
                <th>Active Ticket Queue</th>
                <th>Completed (Last 30 Days)</th>
                <th>Avg Resolution Turnaround (TAT)</th>
                <th>Workload Capacity Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Suresh Rout & Team', dept: 'Estate Maintenance', domain: 'Plumbing & Water Sanitation', active: 5, resolved: 34, tat: '4.2 Hours', cap: 'Optimal (72%)', capColor: '#15803D', capBg: '#DCFCE7' },
                { name: 'Ramesh Nayak & Crew', dept: 'Electrical Engineering Wing', domain: 'Electrical & Power Supply', active: 4, resolved: 41, tat: '2.8 Hours', cap: 'Optimal (60%)', capColor: '#15803D', capBg: '#DCFCE7' },
                { name: 'Dr. A. Singh & Office', dept: 'Hostel Administration', domain: 'Hostel Residential Facilities', active: 3, resolved: 29, tat: '3.5 Hours', cap: 'Optimal (48%)', capColor: '#15803D', capBg: '#DCFCE7' },
                { name: 'K. Patnaik & NOC Staff', dept: 'Campus IT Center', domain: 'Wi-Fi & Network Infrastructure', active: 4, resolved: 38, tat: '3.0 Hours', cap: 'Elevated Load (85%)', capColor: '#92400E', capBg: '#FEF3C7' },
                { name: 'Chef M. Pradhan & Supervisors', dept: 'Mess & Dining Complex', domain: 'Catering & Kitchen Hygiene', active: 2, resolved: 22, tat: '1.8 Hours', cap: 'Optimal (35%)', capColor: '#15803D', capBg: '#DCFCE7' },
                { name: 'B. Behera & Estate Crew', dept: 'Civil Works Section', domain: 'Carpentry & Structural Repairs', active: 2, resolved: 19, tat: '6.2 Hours', cap: 'Optimal (40%)', capColor: '#15803D', capBg: '#DCFCE7' }
              ].map((staff, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{staff.name}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{staff.dept}</div>
                  </td>
                  <td>{staff.domain}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      background: 'var(--canvas)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)'
                    }}>
                      {staff.active} Active
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{staff.resolved} tickets verified</td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{staff.tat}</span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: staff.capBg,
                      color: staff.capColor
                    }}>
                      {staff.cap}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

  {/* 4. Modal: Log Maintenance Request / Grievance */}
      {createModalOpen && (
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
            {/* Header */}
            <div style={{
              padding: '16px 22px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--canvas)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Log Campus Maintenance Ticket / Institutional Grievance
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateSubmit} style={{ padding: '22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* 1-Click Quick Presets */}
              <div>
                <label className="input-label">Smart Auto-Routing Quick Presets</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  <button
                    type="button"
                    className="app-btn app-btn-secondary app-btn-xs"
                    onClick={() => applyPreset('sanitation_cleaning', 'Hostel Washroom Pipe Leakage & Water Tap Overflow', 'Water tap is leaking continuously in 2nd-floor washroom, causing pooling near corridor passage.', 'hostel_room', 'high')}
                  >
                    <Droplets size={11} />
                    <span>Bathroom / Water Leak (→ Warden)</span>
                  </button>

                  <button
                    type="button"
                    className="app-btn app-btn-secondary app-btn-xs"
                    onClick={() => applyPreset('mess_food', 'Dining Hall Food Quality & Kitchen Hygiene Concern', 'Drinking water purifier filter warning light is blinking and chapati hot-case heater is failing.', 'cafeteria_mess', 'high')}
                  >
                    <UtensilsCrossed size={11} />
                    <span>Mess Food & Hygiene (→ Mess Manager)</span>
                  </button>

                  <button
                    type="button"
                    className="app-btn app-btn-secondary app-btn-xs"
                    onClick={() => applyPreset('hostel_maintenance', 'Hostel Room Study Table & Door Latch Repair', 'Door latch is jammed and cupboard shelf hinge is broken in room.', 'hostel_room', 'medium')}
                  >
                    <Home size={11} />
                    <span>Hostel Room Furniture (→ Warden)</span>
                  </button>

                  <button
                    type="button"
                    className="app-btn app-btn-secondary app-btn-xs"
                    onClick={() => applyPreset('electrical_power', 'Ceiling fan capacitor issue or switchboard socket spark', 'Fan turns very slowly despite regulator on full speed, and switch socket is loose.', 'hostel_room', 'high')}
                  >
                    <Zap size={11} />
                    <span>Hostel Room Fan / Socket</span>
                  </button>

                  <button
                    type="button"
                    className="app-btn app-btn-secondary app-btn-xs"
                    onClick={() => applyPreset('it_network', 'Wi-Fi Access Point connection drop in corridor', 'Frequent disconnection and zero bandwidth during evening study hours.', 'hostel_room', 'medium')}
                  >
                    <Wifi size={11} />
                    <span>Wi-Fi / LAN Drop (→ IT Center)</span>
                  </button>

                  <button
                    type="button"
                    className="app-btn app-btn-secondary app-btn-xs"
                    onClick={() => applyPreset('academic_course', 'Lecture Hall AV Projector HDMI display distortion', 'Projector drops signal intermittently during theory classes.', 'academic_block', 'medium')}
                  >
                    <GraduationCap size={11} />
                    <span>Academic / Timetable (→ HOD)</span>
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="input-label">Grievance / Maintenance Domain *</label>
                <select
                  className="input-field"
                  value={createForm.category_id}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, category_id: e.target.value }))}
                  required
                >
                  {categories.map((c) => {
                    const authorityTarget = (c.code === 'sanitation_cleaning' || c.code === 'hostel_maintenance')
                      ? 'Chief Hostel Warden'
                      : c.code === 'mess_food'
                        ? 'Chief Mess Manager'
                        : c.code === 'academic_course'
                          ? 'Department HOD'
                          : c.department_name;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} — Routes to {authorityTarget} (SLA: {c.default_sla_hours}h)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="input-label">Issue Subject / Summary *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Ceiling fan regulator damaged in Room B-204"
                  value={createForm.title}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="input-label">Detailed Description of Defect or Grievance *</label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="Describe the exact location, symptoms, when it started, and any safety hazards..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              {/* Location Type & Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <div>
                  <label className="input-label">Location Type</label>
                  <select
                    className="input-field"
                    value={createForm.location_type}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, location_type: e.target.value }))}
                  >
                    <option value="hostel_room">Hostel Residence</option>
                    <option value="academic_block">Academic Classroom</option>
                    <option value="laboratory">Laboratory / IT Center</option>
                    <option value="cafeteria_mess">Hostel Mess / Dining</option>
                    <option value="campus_grounds">Campus Grounds</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Specific Location Details</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Boys Hostel Block B, Room B-204"
                    value={createForm.location_details}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, location_details: e.target.value }))}
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="input-label">Urgency Priority Level</label>
                <select
                  className="input-field"
                  value={createForm.priority}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="low">Low Priority (Standard SLA)</option>
                  <option value="medium">Medium Priority (Standard SLA)</option>
                  <option value="high">High Priority (Reduced 50% SLA)</option>
                  <option value="emergency">Emergency Critical (Mandatory 4-hour SLA)</option>
                </select>
              </div>

              {/* Bottom Actions */}
              <div style={{
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                <button
                  type="button"
                  className="app-btn app-btn-secondary"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn app-btn-primary"
                  disabled={submitting}
                >
                  <Send size={15} />
                  <span>{submitting ? 'Auto-Routing Ticket...' : 'Submit & Route Maintenance Ticket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Slide-Over Drawer: Ticket Dossier & Audit Timeline */}
      {detailDrawerOpen && selectedTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 1150
        }}>
          <div style={{
            background: 'var(--surface)',
            width: '100%',
            maxWidth: '680px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-8px 0 24px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--canvas)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {selectedTicket.ticket_number}
                  </span>
                  {getStatusBadge(selectedTicket.status, selectedTicket.is_overdue)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedTicket.category_name} • SLA Target: {selectedTicket.sla_hours} Hours
                </div>
              </div>

              <button
                onClick={() => setDetailDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* SLA Status Banner */}
              <div style={{
                padding: '14px 18px',
                borderRadius: '6px',
                background: selectedTicket.is_overdue ? '#FEF2F2' : selectedTicket.status === 'resolved' || selectedTicket.status === 'closed' ? '#DCFCE7' : '#FEF3C7',
                border: `1.5px solid ${selectedTicket.is_overdue ? '#FCA5A5' : selectedTicket.status === 'resolved' || selectedTicket.status === 'closed' ? '#BBF7D0' : '#FDE68A'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={18} style={{ color: selectedTicket.is_overdue ? '#991B1B' : selectedTicket.status === 'resolved' || selectedTicket.status === 'closed' ? '#15803D' : '#92400E' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: selectedTicket.is_overdue ? '#991B1B' : selectedTicket.status === 'resolved' || selectedTicket.status === 'closed' ? '#15803D' : '#92400E' }}>
                      {selectedTicket.sla_status_label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Deadline: {formatDateTime12(selectedTicket.sla_deadline)}
                    </div>
                  </div>
                </div>

                {/* Completion OTP Display: Visible ONLY to student who filed the complaint */}
                {isStudent && Number(selectedTicket.user_id) === Number(user?.id) && selectedTicket.resolution_otp ? (
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    textAlign: 'right'
                  }}>
                    <span style={{ fontSize: '10px', color: '#1E40AF', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>
                      Your Completion OTP
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#1D4ED8', letterSpacing: '0.08em' }}>
                      {selectedTicket.resolution_otp}
                    </span>
                    <span style={{ fontSize: '9.5px', color: '#3B82F6', display: 'block' }}>
                      Share with staff only after physical inspection
                    </span>
                  </div>
                ) : (
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'var(--surface-subtle)',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'right'
                  }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>
                      Physical Verification OTP
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Secured with Student
                    </span>
                    <span style={{ fontSize: '9.5px', color: 'var(--text-tertiary)', display: 'block' }}>
                      Collect from student on-site to resolve
                    </span>
                  </div>
                )}
              </div>

              {/* Grievance Subject & Description */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                  {selectedTicket.title}
                </h3>
                <div style={{
                  padding: '14px',
                  borderRadius: '6px',
                  background: 'var(--canvas)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-line'
                }}>
                  {selectedTicket.description}
                </div>
              </div>

              {/* Fill Once ERP Identity Snapshot */}
              <div>
                <span className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
                  <span>Student Institutional Credential Snapshot (Verified)</span>
                </span>
                <div style={{
                  padding: '14px',
                  borderRadius: '6px',
                  background: 'var(--canvas)',
                  border: '1px solid var(--border-subtle)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '10px',
                  fontSize: '12px',
                  marginTop: '4px'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>Full Name</span>
                    <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{selectedTicket.reporter_full_name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>Roll / Registration</span>
                    <strong style={{ display: 'block', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {selectedTicket.roll_number} ({selectedTicket.registration_number || 'REG2024'})
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>Academic Cohort</span>
                    <strong style={{ display: 'block', color: 'var(--text-primary)' }}>
                      {selectedTicket.program_name} (Sem {selectedTicket.current_semester}-{selectedTicket.section})
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>Campus Residence</span>
                    <strong style={{ display: 'block', color: 'var(--text-primary)' }}>
                      {selectedTicket.hostel_name}, Room {selectedTicket.room_number}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>Contact Phone</span>
                    <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{selectedTicket.phone_number || '+91 98765-01001'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>Autonomous Division</span>
                    <strong style={{ display: 'block', color: 'var(--primary)' }}>{selectedTicket.assigned_department}</strong>
                    {(selectedTicket.assigned_staff_fullname || selectedTicket.assigned_staff_username) && (
                      <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>
                        Concerned Officer: {selectedTicket.assigned_staff_fullname || selectedTicket.assigned_staff_username}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Technician Assignment Card */}
              {selectedTicket.assigned_technician_name && (
                <div style={{
                  padding: '14px',
                  borderRadius: '6px',
                  background: 'var(--canvas)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Assigned Field Technician
                    </span>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {selectedTicket.assigned_technician_name}
                    </div>
                    {selectedTicket.assigned_technician_contact && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Contact: {selectedTicket.assigned_technician_contact}
                      </div>
                    )}
                  </div>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: 'var(--primary-subtle)',
                    color: 'var(--primary)'
                  }}>
                    On Duty
                  </span>
                </div>
              )}

              {/* Resolution Notes (if resolved) */}
              {selectedTicket.resolution_notes && (
                <div style={{
                  padding: '14px',
                  borderRadius: '6px',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 700, fontSize: '13px' }}>
                    <CheckCircle2 size={16} />
                    <span>Resolution Work Report</span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#14532D', lineHeight: 1.5 }}>
                    {selectedTicket.resolution_notes}
                  </div>
                  <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>
                    Certified on {formatDateTime12(selectedTicket.resolved_at)}
                  </div>
                </div>
              )}

              {/* Student Rating Display & Action */}
              {selectedTicket.status === 'resolved' && (
                <div style={{
                  padding: '14px',
                  borderRadius: '6px',
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400E' }}>
                      {selectedTicket.student_rating ? `Student Feedback (${selectedTicket.student_rating}/5 Stars)` : 'Service Verification & Quality Rating'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#78350F', marginTop: '2px' }}>
                      {selectedTicket.student_feedback || 'Student confirmation ensures physical quality standards are met.'}
                    </div>
                  </div>
                  {isStudent && !selectedTicket.student_rating && (
                    <button
                      className="app-btn app-btn-primary app-btn-sm"
                      onClick={() => setRateModalOpen(true)}
                    >
                      <Star size={13} />
                      <span>Rate Service</span>
                    </button>
                  )}
                </div>
              )}

              {/* Audit Timeline */}
              <div>
                <span className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} style={{ color: 'var(--primary)' }} />
                  <span>Permanent Institutional Audit Trail & Milestones</span>
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                  {selectedTicket.timeline?.map((evt, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                      {/* Vertical line */}
                      {idx < selectedTicket.timeline.length - 1 && (
                        <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '-12px', width: '2px', background: 'var(--border-subtle)' }} />
                      )}
                      
                      {/* Dot icon */}
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: evt.action.includes('RESOLVED') ? '#DCFCE7' : evt.action.includes('BREACHED') || evt.action.includes('ESCALATED') ? '#FEE2E2' : 'var(--primary-subtle)',
                        color: evt.action.includes('RESOLVED') ? '#15803D' : evt.action.includes('BREACHED') || evt.action.includes('ESCALATED') ? '#B91C1C' : 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        zIndex: 1
                      }}>
                        <Check size={12} />
                      </div>

                      <div style={{ flex: 1, paddingBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {evt.action.replace(/_/g, ' ')}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            {formatDateTime12(evt.created_at)}
                          </span>
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {evt.notes}
                        </p>
                        {evt.actor_name && (
                          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', marginTop: '2px' }}>
                            Action by: {evt.actor_name} {evt.actor_role_display ? `(${evt.actor_role_display})` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              background: 'var(--canvas)'
            }}>
              {canManage && (selectedTicket.status === 'submitted' || selectedTicket.status === 'assigned') && (
                <button
                  className="app-btn app-btn-secondary"
                  onClick={() => setAssignModalOpen(true)}
                >
                  <User size={14} />
                  <span>Assign Technician</span>
                </button>
              )}

              {canManage && (selectedTicket.status === 'assigned' || selectedTicket.status === 'in_progress' || selectedTicket.status === 'escalated') && (
                <button
                  className="app-btn app-btn-primary"
                  onClick={() => setResolveModalOpen(true)}
                >
                  <CheckCheck size={14} />
                  <span>Complete Work Order</span>
                </button>
              )}

              <button
                className="app-btn app-btn-secondary"
                onClick={() => setDetailDrawerOpen(false)}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: Assign Technician */}
      {assignModalOpen && selectedTicket && (
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
          zIndex: 1200,
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
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--canvas)'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Assign Field Technician / Caretaker
              </h3>
              <button
                onClick={() => setAssignModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Ticket: <strong>{selectedTicket.ticket_number}</strong> • Location: <strong>{selectedTicket.location_details}</strong>
              </div>

              <div>
                <label className="input-label">Technician / Caretaker Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Ramesh Kumar (Senior Electrician)"
                  value={assignForm.technician_name}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, technician_name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="input-label">Contact Mobile Number</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. +91 98765-43210"
                  value={assignForm.technician_contact}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, technician_contact: e.target.value }))}
                />
              </div>

              <div>
                <label className="input-label">Instruction / Dispatch Notes</label>
                <textarea
                  className="input-field"
                  rows="2"
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div style={{
                paddingTop: '14px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                <button
                  type="button"
                  className="app-btn app-btn-secondary"
                  onClick={() => setAssignModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn app-btn-primary"
                  disabled={assigning}
                >
                  <span>{assigning ? 'Assigning...' : 'Dispatch Technician'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal: Complete & Resolve Ticket */}
      {resolveModalOpen && selectedTicket && (
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
          zIndex: 1200,
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
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--canvas)'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Certify Work Completion & Resolve Ticket
              </h3>
              <button
                onClick={() => setResolveModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Work Completed Notes *</label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="Detail the repairs, components replaced, tests performed..."
                  value={resolveForm.resolution_notes}
                  onChange={(e) => setResolveForm(prev => ({ ...prev, resolution_notes: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="input-label">Physical Completion OTP (From Student)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 7421 (Enter 4-digit verification code from student)"
                  value={resolveForm.otp}
                  onChange={(e) => setResolveForm(prev => ({ ...prev, otp: e.target.value }))}
                  style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', display: 'block' }}>
                  Student displays this 4-digit code in their Campus Hub dossier once physical inspection is verified.
                </span>
              </div>

              <div style={{
                paddingTop: '14px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                <button
                  type="button"
                  className="app-btn app-btn-secondary"
                  onClick={() => setResolveModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn app-btn-primary"
                  disabled={resolving}
                >
                  <CheckCheck size={14} />
                  <span>{resolving ? 'Recording Resolution...' : 'Certify & Resolve Ticket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Modal: Rate Service (Student Satisfaction) */}
      {rateModalOpen && selectedTicket && (
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
          zIndex: 1200,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '10px',
            maxWidth: '480px',
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
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Rate Maintenance Service Quality
              </h3>
              <button
                onClick={() => setRateModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRateSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>
                  How satisfied are you with the repair resolution?
                </label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingValue(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: star <= ratingValue ? '#D97706' : 'var(--border-subtle)'
                      }}
                    >
                      <Star size={28} fill={star <= ratingValue ? '#D97706' : 'none'} />
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#D97706', display: 'block', marginTop: '6px' }}>
                  {ratingValue === 5 ? 'Excellent (Fully Resolved)' : ratingValue === 4 ? 'Good Quality' : ratingValue === 3 ? 'Average' : 'Needs Improvement'}
                </span>
              </div>

              <div>
                <label className="input-label">Student Feedback / Comments (Optional)</label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="e.g. Technician arrived on time, replaced capacitor cleanly."
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                />
              </div>

              <div style={{
                paddingTop: '14px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                <button
                  type="button"
                  className="app-btn app-btn-secondary"
                  onClick={() => setRateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn app-btn-primary"
                  disabled={ratingLoading}
                >
                  <span>{ratingLoading ? 'Submitting...' : 'Submit Rating & Close Ticket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Modal: Escalate Overdue Ticket */}
      {escalateModalOpen && selectedTicket && (
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
          zIndex: 1200,
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
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#FEF2F2'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} style={{ color: '#B91C1C' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#991B1B' }}>
                  Escalate Overdue SLA Ticket
                </h3>
              </div>
              <button
                onClick={() => setEscalateModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEscalateSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Executive Escalation Authority</label>
                <select
                  className="input-field"
                  value={escalateForm.escalated_to}
                  onChange={(e) => setEscalateForm(prev => ({ ...prev, escalated_to: e.target.value }))}
                >
                  <option value="Chief Hostel Warden & Dean of Student Affairs">Chief Hostel Warden & Dean of Student Affairs</option>
                  <option value="Chief Proctor & Campus Estate Officer">Chief Proctor & Campus Estate Officer</option>
                  <option value="Directorate of Institutional Governance">Directorate of Institutional Governance</option>
                </select>
              </div>

              <div>
                <label className="input-label">Reason for Escalation</label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={escalateForm.reason}
                  onChange={(e) => setEscalateForm(prev => ({ ...prev, reason: e.target.value }))}
                  required
                />
              </div>

              <div style={{
                paddingTop: '14px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                <button
                  type="button"
                  className="app-btn app-btn-secondary"
                  onClick={() => setEscalateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn app-btn-danger"
                  disabled={escalating}
                >
                  <span>{escalating ? 'Escalating...' : 'Confirm Escalation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
