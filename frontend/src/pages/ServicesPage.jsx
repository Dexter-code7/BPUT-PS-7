import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatDateTime12 } from '../utils/dateUtils';
import {
  FileCheck,
  ShieldCheck,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle,
  Search,
  User,
  Building2,
  Lock,
  X,
  Eye,
  Send,
  Calendar,
  MapPin,
  Ticket,
  FileQuestion,
  HelpCircle,
  Check,
  ChevronRight
} from 'lucide-react';

export default function ServicesPage() {
  const { user } = useAuth();
  const [catalog, setCatalog] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tabs for Students: 'catalog' | 'my_requests'
  const [activeTab, setActiveTab] = useState('catalog');

  // Filters for Admin Desk
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [applyModalService, setApplyModalService] = useState(null);
  const [applyPurpose, setApplyPurpose] = useState('');
  const [applyDetails, setApplyDetails] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(null);

  // Admin Review Drawer & Action Formulation
  const [inspectRequest, setInspectRequest] = useState(null);
  const [inspectDetails, setInspectDetails] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Scheduling Form Fields (When Admin Approves for Physical Pickup)
  const [schedulePickupDate, setSchedulePickupDate] = useState('');
  const [schedulePickupSlot, setSchedulePickupSlot] = useState('10:30 AM – 01:00 PM (Morning Counter Session)');
  const [schedulePickupLocation, setSchedulePickupLocation] = useState('Administrative Block — Counter Window 3 (Academic & Certificates Desk)');

  // Missing Info Fields (When Admin Requests Extra Data)
  const [missingInfoQuery, setMissingInfoQuery] = useState('');
  const [missingVisitDate, setMissingVisitDate] = useState('');
  const [missingVisitVenue, setMissingVisitVenue] = useState('Administrative Block — Academic Verification Counter 1');

  // Active Action Formulation Panel in Drawer: 'none' | 'schedule_pickup' | 'request_extra' | 'reject'
  const [adminActionForm, setAdminActionForm] = useState('none');

  // Student Response Modal (When student responds to action_required)
  const [respondingToRequest, setRespondingToRequest] = useState(null);
  const [studentResponseText, setStudentResponseText] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  // Physical Collection Pass Modal
  const [viewingPass, setViewingPass] = useState(null);
  const [passData, setPassData] = useState(null);
  const [loadingPass, setLoadingPass] = useState(false);

  // Certificate Viewer Modal
  const [viewingCertificate, setViewingCertificate] = useState(null);
  const [certificateData, setCertificateData] = useState(null);
  const [loadingCert, setLoadingCert] = useState(false);

  // Determine user capabilities
  const isStudent = user?.role_name === 'student' && !user?.tags?.some(t => t.name === 'class_representative');
  const isStaffOrAdmin = user?.profile_type === 'staff' ||
    ['system_admin', 'admin_staff', 'exam_admin', 'director', 'hod', 'teacher', 'warden'].includes(user?.role_name);

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Load catalog
      const catRes = await api.getServiceCatalog();
      if (catRes.success) {
        setCatalog(catRes.data.services || []);
      }

      // 2. Load my requests (if student or anyone who applies)
      const myRes = await api.getMyServiceRequests();
      if (myRes.success) {
        setMyRequests(myRes.data.requests || []);
        // If student has active applications, can default tab to my_requests
        if (myRes.data.requests?.length > 0 && isStudent && activeTab === 'catalog') {
          // Keep activeTab or let user switch
        }
      }

      // 3. Load admin queue if staff/admin
      if (isStaffOrAdmin) {
        const admRes = await api.getServiceRequests({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery.trim() || undefined
        });
        if (admRes.success) {
          setAdminRequests(admRes.data.requests || []);
          setStats(admRes.data.stats || null);
        }
      }
    } catch (err) {
      console.error('Failed to load services data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  // Student apply handler
  const handleOpenApply = (service) => {
    setApplyModalService(service);
    setApplyPurpose('');
    setApplyDetails('');
    setApplySuccess(null);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyModalService) return;

    if (!applyPurpose.trim()) {
      alert('Please specify the purpose for this certificate/application.');
      return;
    }

    setIsApplying(true);
    try {
      const res = await api.applyServiceRequest({
        service_type_id: applyModalService.id,
        purpose: applyPurpose.trim(),
        additional_details: applyDetails ? { notes: applyDetails.trim() } : {}
      });

      if (res.success) {
        setApplySuccess(res.data);
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Application failed');
    } finally {
      setIsApplying(false);
    }
  };

  // Open Inspect Drawer for Admin
  const handleOpenInspect = async (reqId) => {
    setInspectRequest(reqId);
    setInspectDetails(null);
    setAdminComment('');
    setRejectionReason('');
    setAdminActionForm('none');

    // Default pickup date to 2 days from today
    const d = new Date();
    d.setDate(d.getDate() + 2);
    setSchedulePickupDate(d.toISOString().split('T')[0]);

    // Default visit date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setMissingVisitDate(tomorrow.toISOString().split('T')[0]);
    setMissingInfoQuery('');

    try {
      const res = await api.getServiceRequestDetail(reqId);
      if (res.success) {
        setInspectDetails(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to load request details');
      setInspectRequest(null);
    }
  };

  // Update Status for Admin
  const handleExecuteStatusUpdate = async (newStatus) => {
    if (!inspectDetails?.request) return;

    const payload = {
      request_id: inspectDetails.request.id,
      status: newStatus,
      comment: adminComment.trim()
    };

    if (newStatus === 'ready_for_pickup') {
      if (!schedulePickupDate) {
        alert('Please select the physical collection date.');
        return;
      }
      payload.pickup_date = schedulePickupDate;
      payload.pickup_slot = schedulePickupSlot;
      payload.pickup_location = schedulePickupLocation;
    } else if (newStatus === 'action_required') {
      if (!missingInfoQuery.trim()) {
        alert('Please describe what extra documents or data the candidate must provide.');
        return;
      }
      if (!missingVisitDate) {
        alert('Please specify the date for the student to visit with extra data.');
        return;
      }
      payload.missing_info_requested = missingInfoQuery.trim();
      payload.verification_visit_date = missingVisitDate;
      payload.verification_venue = missingVisitVenue;
    } else if (newStatus === 'rejected') {
      if (!rejectionReason.trim()) {
        alert('Please provide a reason for rejecting this application.');
        return;
      }
      payload.rejection_reason = rejectionReason.trim();
    }

    setUpdatingStatus(true);
    try {
      const res = await api.updateServiceStatus(payload);
      if (res.success) {
        const refreshRes = await api.getServiceRequestDetail(inspectDetails.request.id);
        if (refreshRes.success) {
          setInspectDetails(refreshRes.data);
        }
        setAdminActionForm('none');
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Status update failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Student Responds to Missing Info
  const handleOpenStudentResponse = (req) => {
    setRespondingToRequest(req);
    setStudentResponseText('');
  };

  const handleSubmitStudentResponse = async (e) => {
    e.preventDefault();
    if (!respondingToRequest) return;
    if (!studentResponseText.trim()) {
      alert('Please enter your response or confirmation notes.');
      return;
    }

    setIsSubmittingResponse(true);
    try {
      const res = await api.respondServiceAction({
        request_id: respondingToRequest.id,
        response: studentResponseText.trim()
      });
      if (res.success) {
        alert('Your response has been sent to the registrar desk. Application is now under review.');
        setRespondingToRequest(null);
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit response');
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  // View Physical Pickup Pass Modal
  const handleViewPickupPass = async (requestId) => {
    setViewingPass(requestId);
    setPassData(null);
    setLoadingPass(true);
    try {
      const res = await api.getServicePickupPass(requestId);
      if (res.success) {
        setPassData(res.data.pass);
      }
    } catch (err) {
      alert(err.message || 'Failed to retrieve collection pass');
      setViewingPass(null);
    } finally {
      setLoadingPass(false);
    }
  };

  // Certificate Viewer
  const handleViewCertificate = async (requestId) => {
    setViewingCertificate(requestId);
    setCertificateData(null);
    setLoadingCert(true);
    try {
      const res = await api.getServiceCertificate(requestId);
      if (res.success) {
        setCertificateData(res.data.certificate);
      }
    } catch (err) {
      alert(err.message || 'Failed to retrieve certificate data');
      setViewingCertificate(null);
    } finally {
      setLoadingCert(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <span className="badge-tag amber">Submitted (Queue)</span>;
      case 'under_review':
        return <span className="badge-tag terracotta">Under Review</span>;
      case 'action_required':
        return <span className="badge-tag rose" style={{ color: '#9A3412', background: '#FFEDD5', border: '1px solid #FDBA74' }}>Extra Data / Visit Requested</span>;
      case 'ready_for_pickup':
      case 'ready':
        return <span className="badge-tag emerald">Ready for Physical Pickup</span>;
      case 'delivered':
        return <span className="badge-tag neutral">Physically Stamped & Collected</span>;
      case 'rejected':
        return <span className="badge-tag rose" style={{ color: '#dc2626', background: '#fee2e2' }}>Rejected</span>;
      default:
        return <span className="badge-tag neutral">{status}</span>;
    }
  };

  return (
    <div>
      {/* 1. Masthead */}
      <div className="dash-masthead">
        <div>
          <div className="dash-masthead-ribbon">
            <span className="pulse-dot"></span>
            <span>Digital Service Desk • Physical Stamp & Wet Signature Collection • "Fill Once, Use Everywhere"</span>
          </div>
          <h1 className="dash-masthead-title">Digital Certificates & Applications</h1>
          <div className="dash-masthead-sub">
            Apply online using your auto-locked ERP identity. Once verified and officially sealed with university ink and registrar signatures, collect your physical hard copy at the scheduled counter appointment.
          </div>
        </div>

        {isStaffOrAdmin && (
          <div className="dash-masthead-actions">
            <span className="badge-tag emerald">
              <ShieldCheck size={13} />
              Central Verification Desk Active
            </span>
          </div>
        )}
      </div>

      {/* 2. Admin Operational Stats Header (If Staff / Admin) */}
      {isStaffOrAdmin && stats && (
        <div className="dash-metrics-grid" style={{ marginBottom: '20px' }}>
          <div className="dash-metric-card accent-emerald">
            <div className="dash-metric-header">
              <span className="dash-metric-label">Total Applications</span>
              <FileCheck size={16} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="dash-metric-value">{stats.total}</div>
            <div className="dash-metric-footer">
              <span>Cumulative applications lodged</span>
            </div>
          </div>

          <div className="dash-metric-card accent-amber">
            <div className="dash-metric-header">
              <span className="dash-metric-label">Pending Review</span>
              <Clock size={16} style={{ color: '#d97706' }} />
            </div>
            <div className="dash-metric-value">{stats.submitted + stats.under_review}</div>
            <div className="dash-metric-footer">
              <span>{stats.submitted} New • {stats.under_review} Under Review</span>
            </div>
          </div>

          <div className="dash-metric-card accent-emerald">
            <div className="dash-metric-header">
              <span className="dash-metric-label">Ready for Pickup</span>
              <Ticket size={16} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="dash-metric-value">{stats.ready}</div>
            <div className="dash-metric-footer">
              <span>Appointment scheduled at counter windows</span>
            </div>
          </div>

          <div className="dash-metric-card accent-terracotta">
            <div className="dash-metric-header">
              <span className="dash-metric-label">SLA Overdue</span>
              <AlertCircle size={16} style={{ color: stats.overdue > 0 ? '#dc2626' : 'var(--text-muted)' }} />
            </div>
            <div className="dash-metric-value" style={{ color: stats.overdue > 0 ? '#dc2626' : 'var(--text-main)' }}>
              {stats.overdue}
            </div>
            <div className="dash-metric-footer">
              <span>Turnaround target breached</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Role-Based Navigation & Filter Tabs */}
      {isStaffOrAdmin ? (
        /* Staff / Admin Filter Bar */
        <div className="table-controls" style={{ borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'submitted', 'under_review', 'action_required', 'ready_for_pickup', 'delivered', 'rejected'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`app-btn ${statusFilter === st ? 'app-btn-primary' : 'app-btn-secondary'} app-btn-sm`}
              >
                {st === 'all'
                  ? 'All Queue'
                  : st === 'ready_for_pickup'
                  ? 'Ready for Pickup'
                  : st === 'action_required'
                  ? 'Action Required'
                  : st.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search student, roll no, req #..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '250px' }}
            />
            <button type="submit" className="app-btn app-btn-secondary app-btn-sm">
              <Search size={13} />
              <span>Search</span>
            </button>
          </form>
        </div>
      ) : (
        /* Student Navigation Tabs */
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`app-btn ${activeTab === 'catalog' ? 'app-btn-primary' : 'app-btn-secondary'}`}
            style={{ fontSize: '13px' }}
          >
            <FileCheck size={14} />
            <span>Available Certificates Catalog ({catalog.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('my_requests')}
            className={`app-btn ${activeTab === 'my_requests' ? 'app-btn-primary' : 'app-btn-secondary'}`}
            style={{ fontSize: '13px' }}
          >
            <Clock size={14} />
            <span>My Service Applications ({myRequests.length})</span>
          </button>
        </div>
      )}

      {/* 4. Content Display */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
          Retrieving digital service catalog and counter schedules...
        </div>
      ) : isStaffOrAdmin ? (
        /* =========================================================================
           STAFF / ADMIN OPERATIONAL SERVICE DESK
           ========================================================================= */
        <div>
          {adminRequests.length === 0 ? (
            <div className="dash-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <FileCheck size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>No Requests in Queue</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                There are no student service applications matching the current filter criteria.
              </p>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Req Number</th>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Certificate Type</th>
                    <th>Physical Appointment / Visit</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminRequests.map(req => {
                    const isOverdue = req.is_overdue;
                    return (
                      <tr key={req.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                          {req.request_number}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {req.submitter_name}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          {req.roll_number || 'Staff'}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{req.service_title}</span>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{req.service_category}</div>
                        </td>
                        <td style={{ fontSize: '12px' }}>
                          {req.status === 'ready_for_pickup' || req.status === 'ready' ? (
                            <div>
                              <div style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={12} />
                                Pickup: {req.pickup_date || 'Scheduled'}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {req.pickup_location?.split('—')[1] || req.pickup_location || 'Counter Window'}
                              </div>
                            </div>
                          ) : req.status === 'action_required' ? (
                            <div>
                              <span style={{ color: '#9A3412', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertCircle size={12} />
                                Visit: {req.verification_visit_date || 'Urgent'}
                              </span>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {req.missing_info_requested}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {isOverdue ? (
                                <strong style={{ color: '#dc2626' }}>Overdue by {Math.abs(req.hours_remaining)}h</strong>
                              ) : (
                                `${req.hours_remaining}h SLA window`
                              )}
                            </span>
                          )}
                        </td>
                        <td>
                          {getStatusBadge(req.status)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenInspect(req.id)}
                              className="app-btn app-btn-secondary app-btn-sm"
                            >
                              <Eye size={12} />
                              <span>Process</span>
                            </button>

                            {['ready_for_pickup', 'ready', 'delivered'].includes(req.status) && (
                              <button
                                onClick={() => handleViewPickupPass(req.id)}
                                className="app-btn app-btn-primary app-btn-sm"
                                title="View Physical Collection Pass"
                              >
                                <Ticket size={12} />
                                <span>Pass</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'catalog' ? (
        /* =========================================================================
           STUDENT VIEW: SERVICE CATALOG
           ========================================================================= */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
          {catalog.map(service => (
            <div
              key={service.id}
              className="dash-panel"
              style={{
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: service.category === 'Academic' ? '3px solid var(--primary)' : service.category === 'Financial' ? '3px solid #d97706' : '3px solid var(--accent)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span className={`badge-tag ${service.category === 'Academic' ? 'emerald' : service.category === 'Financial' ? 'amber' : 'terracotta'}`}>
                    {service.category}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Physical Turnaround: {service.sla_hours} Hours
                  </span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
                  {service.title}
                </h3>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                  {service.description}
                </p>

                <div style={{
                  marginTop: '16px',
                  padding: '10px 12px',
                  background: 'var(--surface-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Physical Seal & Wet Signature</span>
                  </div>
                  <strong style={{ color: service.fee_amount > 0 ? 'var(--accent)' : 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                    {service.fee_amount > 0 ? `₹${service.fee_amount.toFixed(2)}` : 'FREE / ZERO FEE'}
                  </strong>
                </div>
              </div>

              <div style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => handleOpenApply(service)}
                  className="app-btn app-btn-primary"
                  style={{ width: '100%', fontSize: '13px' }}
                >
                  <Send size={13} />
                  <span>Apply with Verified Identity</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* =========================================================================
           STUDENT VIEW: MY APPLICATIONS TRACKING BOARD
           ========================================================================= */
        <div>
          {myRequests.length === 0 ? (
            <div className="dash-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <FileCheck size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>No Applications Submitted Yet</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                You have not requested any digital certificates or official attestations.
              </p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="app-btn app-btn-primary"
                style={{ marginTop: '16px' }}
              >
                <span>Browse Service Catalog</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myRequests.map(req => {
                const isReadyForPickup = ['ready_for_pickup', 'ready'].includes(req.status);
                const isDelivered = req.status === 'delivered';
                const isActionRequired = req.status === 'action_required';

                return (
                  <div key={req.id} className="dash-panel" style={{ margin: 0, padding: '20px 24px', borderLeft: isReadyForPickup ? '4px solid var(--primary)' : isActionRequired ? '4px solid #EA580C' : '4px solid var(--border-medium)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                      <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '13px', color: 'var(--primary)' }}>
                            {req.request_number}
                          </span>
                          {getStatusBadge(req.status)}
                          <span className="badge-tag neutral" style={{ fontSize: '10px' }}>
                            {req.service_category}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                          {req.service_title}
                        </h3>

                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          <strong>Purpose:</strong> {req.purpose}
                        </div>

                        {/* CASE 1: ACTION REQUIRED (MISSING DATA / MANDATORY IN-PERSON VISIT) */}
                        {isActionRequired && (
                          <div style={{
                            marginTop: '12px',
                            background: '#FFF7ED',
                            border: '1px solid #FFEDD5',
                            borderRadius: 'var(--radius-sm)',
                            padding: '12px 14px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9A3412', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                              <AlertCircle size={14} />
                              Extra Information / In-Person Verification Required
                            </div>
                            <div style={{ fontSize: '13px', color: '#7C2D12', fontWeight: 600 }}>
                              {req.missing_info_requested || 'Additional supporting documentation required by office.'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#9A3412' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={13} />
                                <strong>Visit Date: {req.verification_visit_date || 'Next Working Day'}</strong>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={13} />
                                <span>{req.verification_venue || 'Academic Office'}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CASE 2: READY FOR PHYSICAL PICKUP (DATE & LOCATION SCHEDULED) */}
                        {isReadyForPickup && (
                          <div style={{
                            marginTop: '12px',
                            background: 'rgba(20, 83, 45, 0.06)',
                            border: '1px solid rgba(20, 83, 45, 0.2)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '12px 14px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                              <Ticket size={14} />
                              Physical Collection Scheduled with University Wet Stamp & Signature
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '12px', marginTop: '6px' }}>
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Collection Date: </span>
                                <strong style={{ color: 'var(--text-main)' }}>{req.pickup_date}</strong>
                              </div>
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Time Slot: </span>
                                <strong style={{ color: 'var(--text-main)' }}>{req.pickup_slot}</strong>
                              </div>
                              <div style={{ gridColumn: '1 / -1' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Location / Window: </span>
                                <strong style={{ color: 'var(--primary)' }}>{req.pickup_location}</strong>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CASE 3: DELIVERED (ARCHIVED) */}
                        {isDelivered && (
                          <div style={{
                            marginTop: '10px',
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <CheckCircle2 size={13} style={{ color: 'var(--primary)' }} />
                            <span>Physically collected & signed in Central Dispatch Ledger.</span>
                          </div>
                        )}
                      </div>

                      {/* Right-Side Actions Block */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          Applied: {formatDateTime12(req.created_at)}
                        </div>

                        {/* Action Required: Respond Button */}
                        {isActionRequired && (
                          <button
                            onClick={() => handleOpenStudentResponse(req)}
                            className="app-btn app-btn-primary"
                            style={{ fontSize: '12px', background: '#9A3412', borderColor: '#9A3412' }}
                          >
                            <Send size={13} />
                            <span>Respond / Acknowledge Visit</span>
                          </button>
                        )}

                        {/* Ready for Pickup: View Physical Pass Button */}
                        {isReadyForPickup && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                            <button
                              onClick={() => handleViewPickupPass(req.id)}
                              className="app-btn app-btn-primary"
                              style={{ fontSize: '12px' }}
                            >
                              <Ticket size={13} />
                              <span>View Physical Collection Pass</span>
                            </button>

                            <button
                              onClick={() => handleViewCertificate(req.id)}
                              className="app-btn app-btn-secondary app-btn-sm"
                              style={{ fontSize: '11px' }}
                            >
                              <Eye size={12} />
                              <span>Preview Document Details</span>
                            </button>
                          </div>
                        )}

                        {isDelivered && (
                          <button
                            onClick={() => handleViewCertificate(req.id)}
                            className="app-btn app-btn-secondary"
                            style={{ fontSize: '12px' }}
                          >
                            <Printer size={13} />
                            <span>View Archived Record</span>
                          </button>
                        )}

                        {!isReadyForPickup && !isDelivered && !isActionRequired && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11px',
                            background: 'var(--surface-subtle)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-mono)'
                          }}>
                            <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                            <span>Turnaround Window: {req.hours_remaining > 0 ? `${req.hours_remaining}h SLA` : 'In Progress'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: STUDENT SERVICE APPLICATION MODAL ("Fill Once")
          ========================================================================= */}
      {applyModalService && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20, 31, 23, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-dropdown)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--surface)'
            }}>
              <div>
                <span className="badge-tag emerald" style={{ marginBottom: '4px' }}>
                  Institutional Service Application
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {applyModalService.title}
                </h2>
              </div>

              <button
                onClick={() => setApplyModalService(null)}
                className="app-btn app-btn-secondary"
                style={{ width: '32px', height: '32px', padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            {applySuccess ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(20, 83, 45, 0.1)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <CheckCircle2 size={36} />
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Application Lodged Successfully
                </h3>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '420px', margin: '8px auto' }}>
                  Your request has been registered in the central institutional queue. Official verified credentials were automatically sealed onto this dossier.
                </p>

                <div style={{
                  background: 'var(--surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 18px',
                  maxWidth: '360px',
                  margin: '20px auto',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <div>Tracking Ref: <strong>{applySuccess.request_number}</strong></div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                    Guaranteed SLA Target: {applySuccess.sla_hours} Hours
                  </div>
                </div>

                <button
                  onClick={() => {
                    setApplyModalService(null);
                    setActiveTab('my_requests');
                  }}
                  className="app-btn app-btn-primary"
                  style={{ marginTop: '10px' }}
                >
                  <span>Go to My Applications</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                  <div style={{
                    background: 'var(--primary-subtle)',
                    border: '1px solid var(--primary-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Lock size={14} style={{ color: 'var(--primary)' }} />
                      <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>
                        Institutional "Fill Once" Verification Active
                      </strong>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      The university already holds your verified identity credentials. Name, Roll Number, Academic Program, and Department will be automatically sealed onto your official certificate.
                    </p>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      marginTop: '10px',
                      background: '#ffffff',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Student Name: </span>
                        <strong>{user?.profile?.full_name || user?.username}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Roll Number: </span>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>{user?.profile?.roll_number || 'Official Record'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Program / Degree: </span>
                        <strong>{user?.profile?.program_name || 'MCA / B.Tech'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Current Semester: </span>
                        <strong>Semester {user?.profile?.current_semester || '1'}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                      Purpose of Application / Issuance *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g., Required for State Bank of India Education Loan Disbursement (Ref #SBI-EDU-9921) or Passport Seva Kendra verification..."
                      value={applyPurpose}
                      onChange={e => setApplyPurpose(e.target.value)}
                      style={{ width: '100%', fontSize: '13px' }}
                    />
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      This purpose will be formally printed on the physical hard copy bearing the official seal and registrar signature.
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                      Additional Supporting Context or Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Bank branch name, company duration, or hostel clearance note..."
                      value={applyDetails}
                      onChange={e => setApplyDetails(e.target.value)}
                      style={{ width: '100%', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{
                  padding: '16px 24px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--surface)'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Turnaround: {applyModalService.sla_hours} Hours SLA
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setApplyModalService(null)}
                      className="app-btn app-btn-secondary"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isApplying}
                      className="app-btn app-btn-primary"
                    >
                      {isApplying ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          DRAWER 2: ADMIN DOSSIER & PHYSICAL DISPATCH WORKFLOW
          ========================================================================= */}
      {inspectRequest && inspectDetails && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20, 31, 23, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '860px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-dropdown)',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--surface)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)' }}>
                    {inspectDetails.request.request_number}
                  </span>
                  {getStatusBadge(inspectDetails.request.status)}
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {inspectDetails.request.service_title}
                </h2>
              </div>

              <button
                onClick={() => setInspectRequest(null)}
                className="app-btn app-btn-secondary"
                style={{ width: '32px', height: '32px', padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* 1. Verified Profile Snapshot */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '8px' }}>
                  Verified Institutional Registry Snapshot (Auto-Sealed)
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '8px',
                  background: 'var(--surface-subtle)',
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12px'
                }}>
                  {Object.entries(inspectDetails.request.erp_snapshot || {}).map(([k, item]) => (
                    <div key={k}>
                      <span style={{ color: 'var(--text-muted)' }}>{item.label}: </span>
                      <strong style={{ color: 'var(--text-main)' }}>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Application Purpose */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '6px' }}>
                  Application Purpose Stated by Candidate
                </div>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  lineHeight: 1.5
                }}>
                  {inspectDetails.request.purpose}
                </div>
              </div>

              {/* 3. Physical Pickup / Missing Info Status Box */}
              {inspectDetails.request.status === 'ready_for_pickup' && (
                <div style={{
                  background: 'rgba(20, 83, 45, 0.08)',
                  border: '1px solid rgba(20, 83, 45, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      Physical Collection Appointment Scheduled
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                      Date: {inspectDetails.request.pickup_date} • {inspectDetails.request.pickup_slot}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Counter: {inspectDetails.request.pickup_location}
                    </div>
                    <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--primary)', marginTop: '4px' }}>
                      Pass Token: {inspectDetails.request.pickup_slip_token} • Cert No: {inspectDetails.request.certificate_number}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleViewPickupPass(inspectDetails.request.id)}
                      className="app-btn app-btn-primary app-btn-sm"
                    >
                      <Ticket size={13} />
                      <span>View Collection Pass</span>
                    </button>
                    <button
                      onClick={() => handleViewCertificate(inspectDetails.request.id)}
                      className="app-btn app-btn-secondary app-btn-sm"
                    >
                      <Printer size={13} />
                      <span>Document Preview</span>
                    </button>
                  </div>
                </div>
              )}

              {inspectDetails.request.status === 'action_required' && (
                <div style={{
                  background: '#FFF7ED',
                  border: '1px solid #FFEDD5',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 18px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#9A3412', textTransform: 'uppercase' }}>
                    Extra Documents / In-Person Visit Requested from Student
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#7C2D12', marginTop: '4px' }}>
                    {inspectDetails.request.missing_info_requested}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9A3412', marginTop: '6px' }}>
                    Mandatory Visit Date: <strong>{inspectDetails.request.verification_visit_date}</strong> at <strong>{inspectDetails.request.verification_venue}</strong>
                  </div>
                  {inspectDetails.request.student_response_data && (
                    <div style={{ marginTop: '8px', padding: '8px 12px', background: '#ffffff', borderRadius: '4px', fontSize: '12px', border: '1px solid #FED7AA' }}>
                      <strong>Latest Candidate Response: </strong> {inspectDetails.request.student_response_data}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Timeline History */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Auditable Lifecycle History
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {inspectDetails.timeline?.map(t => (
                    <div key={t.id} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '8px 12px',
                      background: 'var(--surface-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px'
                    }}>
                      <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px', minWidth: '130px' }}>
                        {formatDateTime12(t.created_at)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: 'var(--text-main)' }}>{t.action}</strong>
                        <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>by {t.actor_username} ({t.actor_role})</span>
                        {t.comment && <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{t.comment}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Process Actions Panel */}
              <div style={{
                marginTop: '8px',
                padding: '18px',
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>
                  Action Desk: Process Application & Schedule Collection
                </div>

                {/* Sub-Panel: Schedule Pickup (When Admin clicks 'Approve & Schedule Physical Pickup') */}
                {adminActionForm === 'schedule_pickup' ? (
                  <div style={{ background: 'rgba(20, 83, 45, 0.04)', border: '1px solid rgba(20, 83, 45, 0.2)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary)', marginBottom: '10px' }}>
                      Schedule Physical Pickup Window & Assign Counter
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600 }}>Collection Date *</label>
                        <input
                          type="date"
                          value={schedulePickupDate}
                          onChange={e => setSchedulePickupDate(e.target.value)}
                          style={{ width: '100%', marginTop: '3px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600 }}>Time Session / Slot</label>
                        <select
                          value={schedulePickupSlot}
                          onChange={e => setSchedulePickupSlot(e.target.value)}
                          style={{ width: '100%', marginTop: '3px' }}
                        >
                          <option value="10:00 AM – 01:00 PM (Morning Counter Session)">10:00 AM – 01:00 PM (Morning Session)</option>
                          <option value="02:30 PM – 05:00 PM (Afternoon Counter Session)">02:30 PM – 05:00 PM (Afternoon Session)</option>
                          <option value="09:30 AM – 11:30 AM (Special Window)">09:30 AM – 11:30 AM (Special Window)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 600 }}>Physical Counter / Location</label>
                      <input
                        type="text"
                        value={schedulePickupLocation}
                        onChange={e => setSchedulePickupLocation(e.target.value)}
                        placeholder="e.g. Administrative Block — Counter Window 3 or Hostel Office Block B"
                        style={{ width: '100%', marginTop: '3px' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleExecuteStatusUpdate('ready_for_pickup')}
                        disabled={updatingStatus}
                        className="app-btn app-btn-primary app-btn-sm"
                      >
                        <Check size={12} />
                        <span>Confirm Approval & Issue Pickup Pass</span>
                      </button>
                      <button
                        onClick={() => setAdminActionForm('none')}
                        className="app-btn app-btn-secondary app-btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : adminActionForm === 'request_extra' ? (
                  /* Sub-Panel: Request Extra Data & In-Person Visit */
                  <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#9A3412', marginBottom: '10px' }}>
                      Request Extra Data / Schedule Mandatory Counter Visit
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 600 }}>Required Extra Data / Missing Documents *</label>
                      <textarea
                        rows={2}
                        value={missingInfoQuery}
                        onChange={e => setMissingInfoQuery(e.target.value)}
                        placeholder="e.g. Previous semester grade card copy, parent consent letter, or hostel fee clearance slip..."
                        style={{ width: '100%', marginTop: '3px', fontSize: '12px' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600 }}>Candidate Visit Date *</label>
                        <input
                          type="date"
                          value={missingVisitDate}
                          onChange={e => setMissingVisitDate(e.target.value)}
                          style={{ width: '100%', marginTop: '3px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600 }}>Reporting Venue / Window</label>
                        <input
                          type="text"
                          value={missingVisitVenue}
                          onChange={e => setMissingVisitVenue(e.target.value)}
                          style={{ width: '100%', marginTop: '3px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleExecuteStatusUpdate('action_required')}
                        disabled={updatingStatus}
                        className="app-btn app-btn-primary app-btn-sm"
                        style={{ background: '#9A3412', borderColor: '#9A3412' }}
                      >
                        <Send size={12} />
                        <span>Dispatch Notice to Student</span>
                      </button>
                      <button
                        onClick={() => setAdminActionForm('none')}
                        className="app-btn app-btn-secondary app-btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Operational Buttons */
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {inspectDetails.request.status === 'submitted' && (
                      <button
                        onClick={() => handleExecuteStatusUpdate('under_review')}
                        disabled={updatingStatus}
                        className="app-btn app-btn-secondary"
                        style={{ fontSize: '12px' }}
                      >
                        <Clock size={13} />
                        <span>Move to Under Review</span>
                      </button>
                    )}

                    {['submitted', 'under_review', 'action_required'].includes(inspectDetails.request.status) && (
                      <button
                        onClick={() => setAdminActionForm('schedule_pickup')}
                        className="app-btn app-btn-primary"
                        style={{ fontSize: '12px' }}
                      >
                        <Calendar size={13} />
                        <span>Approve & Schedule Physical Pickup</span>
                      </button>
                    )}

                    {['submitted', 'under_review'].includes(inspectDetails.request.status) && (
                      <button
                        onClick={() => setAdminActionForm('request_extra')}
                        className="app-btn app-btn-secondary"
                        style={{ fontSize: '12px', color: '#9A3412' }}
                      >
                        <FileQuestion size={13} />
                        <span>Request Extra Data / In-Person Visit</span>
                      </button>
                    )}

                    {['ready_for_pickup', 'ready'].includes(inspectDetails.request.status) && (
                      <button
                        onClick={() => handleExecuteStatusUpdate('delivered')}
                        disabled={updatingStatus}
                        className="app-btn app-btn-primary"
                        style={{ fontSize: '12px', background: '#14532D' }}
                      >
                        <CheckCircle2 size={13} />
                        <span>Confirm Physical Handover (Stamped & Signed)</span>
                      </button>
                    )}

                    {['submitted', 'under_review', 'action_required'].includes(inspectDetails.request.status) && (
                      <button
                        onClick={() => {
                          const r = prompt('Enter rejection reason:');
                          if (r) {
                            setRejectionReason(r);
                            handleExecuteStatusUpdate('rejected');
                          }
                        }}
                        className="app-btn app-btn-secondary"
                        style={{ fontSize: '12px', color: '#dc2626' }}
                      >
                        <X size={13} />
                        <span>Reject Application</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: STUDENT ACTION RESPONSE MODAL (Provide Missing Info)
          ========================================================================= */}
      {respondingToRequest && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20, 31, 23, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '560px',
            boxShadow: 'var(--shadow-dropdown)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span className="badge-tag terracotta" style={{ fontSize: '11px', marginBottom: '2px' }}>
                  Action Needed Response
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Respond to Query: {respondingToRequest.service_title}
                </h3>
              </div>
              <button
                onClick={() => setRespondingToRequest(null)}
                className="app-btn app-btn-secondary"
                style={{ width: '28px', height: '28px', padding: 0 }}
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmitStudentResponse} style={{ padding: '20px' }}>
              <div style={{
                background: '#FFF7ED',
                border: '1px solid #FFEDD5',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                fontSize: '12px',
                marginBottom: '14px',
                color: '#7C2D12'
              }}>
                <strong>Requested by Office: </strong> {respondingToRequest.missing_info_requested}
                <div style={{ marginTop: '4px', fontSize: '11px', color: '#9A3412' }}>
                  Reporting appointment: {respondingToRequest.verification_visit_date} at {respondingToRequest.verification_venue}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Your Response / Clarification Note *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. I have obtained the HOD clearance letter and will report to the counter with original hard copies on the scheduled date..."
                  value={studentResponseText}
                  onChange={e => setStudentResponseText(e.target.value)}
                  style={{ width: '100%', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setRespondingToRequest(null)}
                  className="app-btn app-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResponse}
                  className="app-btn app-btn-primary"
                  style={{ background: '#9A3412', borderColor: '#9A3412' }}
                >
                  {isSubmittingResponse ? 'Submitting...' : 'Submit Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: PHYSICAL COLLECTION PASS & APPOINTMENT TOKEN
          ========================================================================= */}
      {viewingPass && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20, 31, 23, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '640px',
            boxShadow: 'var(--shadow-dropdown)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Toolbar */}
            <div className="no-print" style={{
              padding: '14px 20px',
              background: 'var(--surface-subtle)',
              borderBottom: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Physical Collection Pass & Appointment Slip
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  className="app-btn app-btn-primary app-btn-sm"
                >
                  <Printer size={13} />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setViewingPass(null)}
                  className="app-btn app-btn-secondary app-btn-sm"
                >
                  Close
                </button>
              </div>
            </div>

            {loadingPass ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading appointment collection pass...
              </div>
            ) : passData ? (
              <div className="printable-certificate-container" style={{ padding: '32px 36px', background: '#ffffff', color: '#1c1917' }}>
                <div style={{
                  border: '2px solid #14532D',
                  borderRadius: '8px',
                  padding: '24px',
                  background: '#FDFBF7'
                }}>
                  {/* Seal & Institution Header */}
                  <div style={{ textAlign: 'center', borderBottom: '1px solid #E7E5E4', paddingBottom: '14px', marginBottom: '18px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9A3412' }}>
                      CENTRAL UNIVERSITY OF TECHNOLOGY
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 900, color: '#14532D', marginTop: '2px' }}>
                      PHYSICAL DOCUMENT COLLECTION APPOINTMENT PASS
                    </div>
                    <div style={{ fontSize: '12px', color: '#57534E', marginTop: '2px' }}>
                      {passData.sub_header} • Valid for Counter Verification
                    </div>
                  </div>

                  {/* Token & Cert Meta */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#ffffff',
                    border: '1px dashed #D6D3D1',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    marginBottom: '18px'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase' }}>Token Pass Number</div>
                      <div style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'monospace', color: '#14532D' }}>
                        {passData.slip_token}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase' }}>Official Certificate No</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'monospace', color: '#1C1917' }}>
                        {passData.certificate_number}
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Appointment Details */}
                  <div style={{
                    background: 'rgba(20, 83, 45, 0.08)',
                    border: '1px solid rgba(20, 83, 45, 0.25)',
                    borderRadius: '6px',
                    padding: '14px 18px',
                    marginBottom: '18px'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#14532D', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Designated Physical Collection Schedule
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: '#57534E' }}>Date: </span>
                        <strong>{passData.pickup_date}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#57534E' }}>Time Window: </span>
                        <strong>{passData.pickup_slot}</strong>
                      </div>
                      <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                        <span style={{ color: '#57534E' }}>Reporting Location: </span>
                        <strong style={{ color: '#14532D' }}>{passData.pickup_location}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Student Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginBottom: '18px', background: '#ffffff', padding: '12px', borderRadius: '4px', border: '1px solid #E7E5E4' }}>
                    <div>
                      <span style={{ color: '#78716C' }}>Candidate Name: </span>
                      <strong>{passData.student_name}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#78716C' }}>Roll Number: </span>
                      <strong style={{ fontFamily: 'monospace' }}>{passData.roll_number}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#78716C' }}>Program: </span>
                      <strong>{passData.program_name}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#78716C' }}>Document: </span>
                      <strong style={{ color: '#9A3412' }}>{passData.service_title}</strong>
                    </div>
                  </div>

                  {/* Physical Checklist */}
                  <div style={{ fontSize: '11px', color: '#44403C', borderTop: '1px solid #E7E5E4', paddingTop: '12px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '6px', color: '#1C1917' }}>
                      Mandatory Requirements for Physical Collection:
                    </div>
                    <ul style={{ paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
                      {passData.instructions?.map((inst, idx) => (
                        <li key={idx}>{inst}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: OFFICIAL PRINTABLE UNIVERSITY CERTIFICATE PREVIEW
          ========================================================================= */}
      {viewingCertificate && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20, 31, 23, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '840px',
            boxShadow: 'var(--shadow-dropdown)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div className="no-print" style={{
              padding: '14px 24px',
              background: 'var(--surface-subtle)',
              borderBottom: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Official Document Dossier (Physical Stamp Target)
                </span>
                <span className="badge-tag emerald" style={{ fontSize: '11px' }}>
                  Verified by Central Registrar
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => window.print()}
                  className="app-btn app-btn-primary app-btn-sm"
                >
                  <Printer size={13} />
                  <span>Print Document</span>
                </button>

                <button
                  onClick={() => setViewingCertificate(null)}
                  className="app-btn app-btn-secondary app-btn-sm"
                >
                  Close
                </button>
              </div>
            </div>

            {loadingCert ? (
              <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Generating verified certificate document...
              </div>
            ) : certificateData ? (
              <div className="printable-certificate-container" style={{
                padding: '48px 56px',
                background: '#ffffff',
                color: '#1c1917',
                fontFamily: 'Georgia, "Times New Roman", serif',
                position: 'relative'
              }}>
                <div style={{
                  border: '3px double #14532D',
                  padding: '36px 42px',
                  position: 'relative',
                  background: '#faf9f6'
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.04,
                    pointerEvents: 'none',
                    fontSize: '180px',
                    fontWeight: 900,
                    fontFamily: 'serif'
                  }}>
                    CUT
                  </div>

                  <div style={{ textAlign: 'center', borderBottom: '2px solid #14532D', paddingBottom: '16px', marginBottom: '24px' }}>
                    <div style={{ fontSize: '11px', letterSpacing: '0.15em', fontWeight: 700, textTransform: 'uppercase', color: '#9A3412', marginBottom: '4px', fontFamily: 'sans-serif' }}>
                      CENTRAL UNIVERSITY OF TECHNOLOGY • BHUBANESWAR
                    </div>
                    <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#14532D', letterSpacing: '0.04em', margin: '4px 0', textTransform: 'uppercase' }}>
                      {certificateData.institution}
                    </h1>
                    <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#44403c' }}>
                      {certificateData.sub_header}
                    </div>
                    <div style={{ fontSize: '11px', color: '#78716c', marginTop: '2px', fontFamily: 'sans-serif' }}>
                      {certificateData.campus_location}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontFamily: 'sans-serif', marginBottom: '28px', color: '#44403c' }}>
                    <div>
                      <span>Certificate Ref: </span>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: '#14532D' }}>
                        {certificateData.certificate_number}
                      </strong>
                    </div>
                    <div>
                      <span>Date of Issue: </span>
                      <strong>{certificateData.issued_at}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', margin: '24px 0 32px 0' }}>
                    <span style={{
                      fontSize: '19px',
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#14532D',
                      borderBottom: '2px solid #9A3412',
                      paddingBottom: '4px'
                    }}>
                      {certificateData.service_title}
                    </span>
                  </div>

                  <div style={{ fontSize: '15px', lineHeight: 2.1, textAlign: 'justify', color: '#1c1917', marginBottom: '40px' }}>
                    <p>
                      This is to certify that <strong>{certificateData.student_name}</strong>, bearing University Roll Number{' '}
                      <strong style={{ fontFamily: 'monospace' }}>{certificateData.roll_number}</strong> and Permanent Institutional Registration Number{' '}
                      <strong style={{ fontFamily: 'monospace' }}>{certificateData.registration_no}</strong>, is a bonafide and regular student of the{' '}
                      <strong>{certificateData.department_name}</strong> at Central University of Technology.
                    </p>

                    <p style={{ marginTop: '14px' }}>
                      He/She is currently enrolled and actively pursuing the <strong>{certificateData.program_name}</strong> in{' '}
                      <strong>{certificateData.current_semester}</strong> for the Academic Session 2026–2027.
                    </p>

                    <p style={{ marginTop: '14px' }}>
                      According to the official registers maintained in the Central Academic Registry, the candidate maintains a clean disciplinary standing and commendable academic conduct.
                    </p>

                    <p style={{ marginTop: '14px' }}>
                      This official certificate is issued upon the candidate's formal electronic request for the purpose of:{' '}
                      <em style={{ textDecoration: 'underline' }}>{certificateData.purpose}</em>.
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '50px', paddingTop: '20px', borderTop: '1px dashed #d6d3d1' }}>
                    <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#78716c', maxWidth: '300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#14532D', fontWeight: 700, marginBottom: '2px' }}>
                        <ShieldCheck size={14} />
                        OFFICIAL PHYSICAL STAMP ZONE
                      </div>
                      <div>Doc Hash: {certificateData.verification_hash?.substring(0, 32)}...</div>
                      <div>Physical impression of wet seal and registrar ink signature required</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontFamily: 'serif',
                        fontStyle: 'italic',
                        fontSize: '18px',
                        color: '#14532D',
                        marginBottom: '4px',
                        letterSpacing: '0.05em'
                      }}>
                        R. Pillai
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1c1917', fontFamily: 'sans-serif' }}>
                        {certificateData.signatory_name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#78716c', fontFamily: 'sans-serif' }}>
                        {certificateData.signatory_title}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
