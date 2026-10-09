import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';
import { formatTime12, formatDateTime12, formatDate12 } from '../utils/dateUtils';
import {
  Shield,
  QrCode,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Compass,
  FileCheck,
  Building,
  KeyRound,
  ArrowRight,
  RefreshCw,
  LogOut,
  LogIn,
  Utensils,
  Calendar,
  Award,
  Check,
  X,
  Filter,
  Plus,
  BedDouble,
  Phone,
  AlertCircle
} from 'lucide-react';

export default function GatepassPage() {
  const { user, showToast } = useAuth();
  const { t } = useAccessibility();

  const isWarden = ['warden', 'system_admin', 'director', 'admin_staff'].includes(user?.role_name);
  const isStudent = user?.role_name === 'student' || !user?.role_name;

  // Active top tab
  const [activeTab, setActiveTab] = useState('hostel_leave'); // 'hostel_leave' | 'gatepass' | 'terminal' | 'census'

  // Gatepass state
  const [gatepasses, setGatepasses] = useState([]);
  const [census, setCensus] = useState(null);

  // Hostel Leave state
  const [hostelLeaves, setHostelLeaves] = useState([]);
  const [hostelStats, setHostelStats] = useState(null);
  const [studentHostelInfo, setStudentHostelInfo] = useState(null);
  const [leaveFilter, setLeaveFilter] = useState('all');
  const [hostelBlockFilter, setHostelBlockFilter] = useState('all');

  const [isLoading, setIsLoading] = useState(true);

  // Hostel Leave Application Form State
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'home_visit',
    destination: '',
    emergency_contact: '',
    start_date: '2026-10-14',
    end_date: '2026-10-18',
    departure_time: '08:00',
    return_time: '20:00',
    reason: '',
    auto_close_mess: true,
    parent_consent_confirmed: true
  });
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  // Warden Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeaveForReview, setSelectedLeaveForReview] = useState(null);
  const [reviewAction, setReviewAction] = useState('approved');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [isReviewingLeave, setIsReviewingLeave] = useState(false);

  // Daily Outpass Application Form State
  const [passType, setPassType] = useState('day_outpass');
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [outExpected, setOutExpected] = useState('');
  const [inExpected, setInExpected] = useState('');
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  // Guard terminal state
  const [guardIdentifier, setGuardIdentifier] = useState('');
  const [guardPunchType, setGuardPunchType] = useState('exit');
  const [punchResult, setPunchResult] = useState(null);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [gpRes, censusRes, leavesRes] = await Promise.all([
        api.getGatepasses(),
        api.getCampusCensus(),
        api.getHostelLeaves({
          status: leaveFilter,
          hostel: hostelBlockFilter
        })
      ]);

      if (gpRes?.data?.gatepasses) {
        setGatepasses(gpRes.data.gatepasses);
      }
      if (censusRes?.data) {
        setCensus(censusRes.data);
      }
      if (leavesRes?.data) {
        setHostelLeaves(leavesRes.data.leaves || []);
        setHostelStats(leavesRes.data.stats || null);
        if (leavesRes.data.student_hostel_info) {
          setStudentHostelInfo(leavesRes.data.student_hostel_info);
          if (!leaveForm.emergency_contact && leavesRes.data.student_hostel_info.phone) {
            setLeaveForm(prev => ({
              ...prev,
              emergency_contact: leavesRes.data.student_hostel_info.phone
            }));
          }
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to load hostel and gatepass records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    setOutExpected(now.toISOString().slice(0, 16));
    setInExpected(twoHoursLater.toISOString().slice(0, 16));
  }, [leaveFilter, hostelBlockFilter]);

  // Calculate live days and meals for hostel leave form
  const computeLeaveDays = () => {
    if (!leaveForm.start_date || !leaveForm.end_date) return 1;
    const s = new Date(leaveForm.start_date);
    const e = new Date(leaveForm.end_date);
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };
  const formLeaveDays = computeLeaveDays();
  const formPausedMeals = leaveForm.auto_close_mess ? formLeaveDays * 4 : 0;
  const formRebateCredits = leaveForm.auto_close_mess ? formLeaveDays * 4 * 25 : 0;

  // Student applies for Hostel Leave
  const handleApplyHostelLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.destination || !leaveForm.reason) {
      showToast('Destination and reason are mandatory.');
      return;
    }
    setIsSubmittingLeave(true);
    try {
      const res = await api.applyHostelLeave({
        leave_type: leaveForm.leave_type,
        destination: leaveForm.destination,
        emergency_contact: leaveForm.emergency_contact,
        start_date: leaveForm.start_date,
        end_date: leaveForm.end_date,
        departure_time: leaveForm.departure_time + ':00',
        return_time: leaveForm.return_time + ':00',
        reason: leaveForm.reason,
        auto_close_mess: leaveForm.auto_close_mess,
        parent_consent_confirmed: leaveForm.parent_consent_confirmed
      });
      showToast(res.message || 'Hostel leave submitted. Mess dining automatically paused.');
      setLeaveModalOpen(false);
      setLeaveForm(prev => ({
        ...prev,
        destination: '',
        reason: ''
      }));
      await loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to submit hostel leave');
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  // Warden reviews Hostel Leave
  const handleReviewHostelLeave = async (e) => {
    e.preventDefault();
    if (!selectedLeaveForReview) return;
    setIsReviewingLeave(true);
    try {
      const res = await api.reviewHostelLeave({
        leave_id: selectedLeaveForReview.id,
        action: reviewAction,
        warden_remarks: reviewRemarks
      });
      showToast(res.message || `Leave application ${reviewAction}.`);
      setReviewModalOpen(false);
      setSelectedLeaveForReview(null);
      setReviewRemarks('');
      await loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to review hostel leave');
    } finally {
      setIsReviewingLeave(false);
    }
  };

  // Student cancels leave
  const handleCancelHostelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave application? Your mess dining will be restored to attending.')) {
      return;
    }
    try {
      const res = await api.cancelHostelLeave({ leave_id: leaveId });
      showToast(res.message || 'Leave cancelled and mess dining restored.');
      await loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to cancel leave');
    }
  };

  // Daily Outpass Application
  const handleApplyPass = async (e) => {
    e.preventDefault();
    if (!destination || !reason) {
      showToast('Destination and reason are mandatory.');
      return;
    }
    setIsSubmittingPass(true);
    try {
      const res = await api.applyGatepass({
        pass_type: passType,
        destination,
        reason,
        out_time_expected: outExpected.replace('T', ' ') + ':00',
        in_time_expected: inExpected.replace('T', ' ') + ':00'
      });
      showToast(res.message || 'Gatepass application submitted.');
      setDestination('');
      setReason('');
      await loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to apply for gatepass');
    } finally {
      setIsSubmittingPass(false);
    }
  };

  // Warden reviews day gatepass
  const handleReviewPass = async (passId, action) => {
    try {
      await api.reviewGatepass({
        pass_id: passId,
        action,
        remarks: `Decision by ${user?.role_label || 'Hostel Warden'}`
      });
      showToast(`Gatepass ${action}.`);
      await loadAllData();
    } catch (err) {
      showToast(err.message || 'Review failed');
    }
  };

  // Guard punches gate entry/exit
  const handleGuardPunch = async (e) => {
    e.preventDefault();
    if (!guardIdentifier) {
      showToast('Scan QR token or type 4-digit security code.');
      return;
    }
    try {
      const res = await api.punchGatepass({
        identifier: guardIdentifier,
        punch_type: guardPunchType
      });
      setPunchResult(res.data);
      showToast(res.message || 'Punch recorded successfully.');
      setGuardIdentifier('');
      await loadAllData();
    } catch (err) {
      showToast(err.message || 'Punch error');
    }
  };

  const activeStudentPass = isStudent
    ? gatepasses.find(g => ['approved', 'departed', 'pending'].includes(g.status))
    : null;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Institutional Masthead Header */}
      <div className="surface-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulse-dot" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em' }}>
                Hostel Boarder Life • Vacation Leave Management • Automated Mess Food Deactivation
              </span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0 2px' }}>
              Hostel Leave & Digital Gatepass Operations
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              Integrated leave management for hostel boarders (Boys & Girls Blocks), Warden/Superintendent approvals, and automated mess dining deactivation that saves food waste and credits rebates.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {isStudent && (
              <button
                className="app-btn app-btn-primary app-btn-sm"
                onClick={() => setLeaveModalOpen(true)}
              >
                <Plus size={14} />
                <span>Apply Hostel Leave (Home / Vacation)</span>
              </button>
            )}

            <button className="app-btn app-btn-secondary app-btn-sm" onClick={loadAllData} title="Sync Hostel & Gatepass Records">
              <RefreshCw size={13} />
              <span>Sync Records</span>
            </button>
          </div>
        </div>

        {/* Live Census & Automated Mess Closure KPI Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ padding: '12px 14px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
              <Users size={13} />
              <span>Registered Boarders</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {census?.total_registered_students || 1420}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Boys & Girls Hostel Blocks
            </div>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
              <Shield size={13} />
              <span>Inside Perimeter</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
              {census?.currently_inside_campus || 1386}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Verified present in hostel
            </div>
          </div>

          <div style={{ padding: '12px 14px', background: '#EDE9FE', borderRadius: '6px', border: '1px solid #DDD6FE' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6D28D9', fontWeight: 700, textTransform: 'uppercase' }}>
              <Compass size={13} />
              <span>Away on Approved Leave</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#5B21B6', marginTop: '4px' }}>
              {hostelStats?.approved_count || 1}
            </div>
            <div style={{ fontSize: '11px', color: '#6D28D9', marginTop: '2px' }}>
              Home visits, holidays & outpasses
            </div>
          </div>

          <div style={{ padding: '12px 14px', background: '#DCFCE7', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
              <Utensils size={13} />
              <span>Mess Meals Auto-Paused</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803D', marginTop: '4px' }}>
              {hostelStats?.total_mess_meals_paused || 28}
            </div>
            <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>
              {hostelStats?.total_rebates_credited || 700} Rebate Credits credited
            </div>
          </div>

          <div style={{ padding: '12px 14px', background: (hostelStats?.pending_count > 0 || census?.overdue_curfew_defaulters > 0) ? '#FEF2F2' : 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: (hostelStats?.pending_count > 0) ? '#991B1B' : 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
              <Clock size={13} />
              <span>Pending Warden Queue</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: (hostelStats?.pending_count > 0) ? '#DC2626' : 'var(--text-primary)', marginTop: '4px' }}>
              {hostelStats?.pending_count || 0}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Awaiting superintendent action
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <button
            onClick={() => setActiveTab('hostel_leave')}
            style={{
              padding: '9px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: activeTab === 'hostel_leave' ? 'var(--primary)' : 'var(--border-subtle)',
              background: activeTab === 'hostel_leave' ? 'var(--primary)' : 'var(--canvas)',
              color: activeTab === 'hostel_leave' ? '#FFFFFF' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <BedDouble size={15} />
            <span>Hostel Leave & Home Outpass (Date X &rarr; Y)</span>
            {hostelStats?.pending_count > 0 && isWarden && (
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', background: '#DC2626', color: '#FFFFFF', fontWeight: 800 }}>
                {hostelStats.pending_count} PENDING
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('gatepass')}
            style={{
              padding: '9px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: activeTab === 'gatepass' ? 'var(--primary)' : 'var(--border-subtle)',
              background: activeTab === 'gatepass' ? 'var(--primary)' : 'var(--canvas)',
              color: activeTab === 'gatepass' ? '#FFFFFF' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <KeyRound size={15} />
            <span>Daily Campus Outpass & Curfew QR</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            style={{
              padding: '9px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: activeTab === 'terminal' ? 'var(--primary)' : 'var(--border-subtle)',
              background: activeTab === 'terminal' ? 'var(--primary)' : 'var(--canvas)',
              color: activeTab === 'terminal' ? '#FFFFFF' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <QrCode size={15} />
            <span>Security Guard Gate Terminal</span>
          </button>

          {isWarden && (
            <button
              onClick={() => setActiveTab('census')}
              style={{
                padding: '9px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: activeTab === 'census' ? 'var(--primary)' : 'var(--border-subtle)',
                background: activeTab === 'census' ? 'var(--primary)' : 'var(--canvas)',
                color: activeTab === 'census' ? '#FFFFFF' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <Building size={15} />
              <span>Hostel Block Census & Defaulters</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HOSTEL LEAVE MANAGEMENT & AUTOMATIC MESS CLOSURE                   */}
      {/* ========================================================================= */}
      {activeTab === 'hostel_leave' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Automated Mess Deactivation Policy Banner */}
          <div style={{
            padding: '16px 20px',
            borderRadius: '8px',
            background: '#F0FDF4',
            border: '1.5px solid #BBF7D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803D' }}>
                <Utensils size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#166534' }}>
                  Automated Mess Food Deactivation Protocol Active
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#15803D' }}>
                  Whenever a boarder applies for home visit or vacation leave from Date X to Date Y, all 4 daily mess meals are automatically closed. The chef's kitchen headcount is updated immediately, preventing food wastage while crediting 100 Rebate Credits/day.
                </p>
              </div>
            </div>

            {isStudent && (
              <button
                className="app-btn app-btn-primary app-btn-sm"
                onClick={() => setLeaveModalOpen(true)}
              >
                <Plus size={14} />
                <span>Apply Home Leave</span>
              </button>
            )}
          </div>

          {/* Filter Bar for Wardens / Staff */}
          {isWarden && (
            <div className="surface-card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>Hostel Block:</span>
                  <select
                    className="input-field"
                    style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                    value={hostelBlockFilter}
                    onChange={(e) => setHostelBlockFilter(e.target.value)}
                  >
                    <option value="all">All Hostels (Boys & Girls)</option>
                    <option value="Boys Hostel">Boys Hostel Blocks</option>
                    <option value="Girls Hostel">Girls Hostel Blocks</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>Leave Status:</span>
                  <select
                    className="input-field"
                    style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                    value={leaveFilter}
                    onChange={(e) => setLeaveFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending Warden Review</option>
                    <option value="approved">Approved & Mess Deactivated</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Showing <strong>{hostelLeaves.length}</strong> applications
              </div>
            </div>
          )}

          {/* Student's Hostel Identity Card (If Student) */}
          {isStudent && studentHostelInfo && (
            <div className="surface-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'var(--canvas)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BedDouble size={20} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {studentHostelInfo.hostel_name} &bull; Room {studentHostelInfo.room_number}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Boarder Profile: <strong>{user?.username}</strong> &bull; Emergency Contact: <strong>{studentHostelInfo.phone || '+91 94370 12345'}</strong>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px', background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' }}>
                Active Hostel Resident &bull; Auto-Rebate Eligible
              </div>
            </div>
          )}

          {/* Applications List */}
          <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {isStudent ? 'My Hostel Leave & Home Visit Applications' : 'Hostel Boarder Leave Queue (Warden & Superintendent Desk)'}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Official records of student movement out of campus, parent contact validations, and synchronized mess closures.
                </p>
              </div>

              {isStudent && (
                <button
                  className="app-btn app-btn-secondary app-btn-xs"
                  onClick={() => setLeaveModalOpen(true)}
                >
                  <Plus size={13} />
                  <span>New Leave Application</span>
                </button>
              )}
            </div>

            {hostelLeaves.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                No hostel leave records found matching the current criteria.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {hostelLeaves.map((leave) => {
                  const isApproved = leave.status === 'approved';
                  const isPending = leave.status === 'pending';
                  const isRejected = leave.status === 'rejected';

                  return (
                    <div
                      key={leave.id}
                      style={{
                        padding: '16px 18px',
                        borderRadius: '8px',
                        background: 'var(--surface)',
                        border: isPending
                          ? '1.5px solid #FDE68A'
                          : isApproved
                            ? '1.5px solid #BBF7D0'
                            : '1px solid var(--border-subtle)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      {/* Top Header Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                              {leave.leave_number}
                            </span>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: isPending
                                ? '#FEF3C7'
                                : isApproved
                                  ? '#DCFCE7'
                                  : isRejected
                                    ? '#FEE2E2'
                                    : '#F3F4F6',
                              color: isPending
                                ? '#92400E'
                                : isApproved
                                  ? '#166534'
                                  : isRejected
                                    ? '#991B1B'
                                    : '#4B5563'
                            }}>
                              {leave.status === 'approved' ? 'Approved & Mess Closed' : leave.status.toUpperCase()}
                            </span>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: 'var(--text-secondary)',
                              textTransform: 'capitalize'
                            }}>
                              &bull; {leave.leave_type.replace('_', ' ')}
                            </span>
                          </div>

                          <h4 style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {leave.destination}
                          </h4>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {formatDate12(leave.start_date)} &rarr; {formatDate12(leave.end_date)}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            Duration: <strong>{leave.total_days} Days</strong> (Depart: {leave.departure_time.slice(0, 5)} &bull; Return: {leave.return_time.slice(0, 5)})
                          </div>
                        </div>
                      </div>

                      {/* Middle Details Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '10px',
                        padding: '10px 14px',
                        background: 'var(--canvas)',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}>
                        <div>
                          <span style={{ color: 'var(--text-secondary)' }}>Boarder / Room:</span>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                            {leave.student_name} ({leave.roll_number})
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                            {leave.hostel_name} &bull; Room {leave.room_number}
                          </div>
                        </div>

                        <div>
                          <span style={{ color: 'var(--text-secondary)' }}>Reason / Declaration:</span>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                            {leave.reason}
                          </div>
                        </div>

                        <div>
                          <span style={{ color: 'var(--text-secondary)' }}>Parent Emergency Contact:</span>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={12} />
                            <span>{leave.emergency_contact}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#166534' }}>
                            Parent Consent Confirmed
                          </div>
                        </div>
                      </div>

                      {/* Automated Mess Closure Status Ribbon */}
                      {leave.auto_close_mess ? (
                        <div style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: isApproved ? '#DCFCE7' : '#FEF3C7',
                          border: `1px solid ${isApproved ? '#BBF7D0' : '#FDE68A'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px',
                          fontSize: '11.5px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isApproved ? '#166534' : '#92400E' }}>
                            <Utensils size={14} />
                            <strong>Automated Mess Closure:</strong>
                            <span>
                              {leave.mess_meals_paused_count} meals (Breakfast, Lunch, Snacks, Dinner) {isApproved ? 'closed in dining hall' : 'queued for deactivation'}
                            </span>
                          </div>

                          <div style={{ fontWeight: 800, color: isApproved ? '#15803D' : '#B45309' }}>
                            +{leave.mess_rebate_credits_accrued} Mess Rebate Credits Accrued
                          </div>
                        </div>
                      ) : null}

                      {/* Warden Directives / Remarks */}
                      {leave.warden_remarks && (
                        <div style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: '#F3F4F6',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '11.5px',
                          color: 'var(--text-secondary)'
                        }}>
                          <strong>Warden Directive:</strong> {leave.warden_remarks}
                          {leave.reviewer_name && (
                            <span style={{ marginLeft: '6px', color: 'var(--text-tertiary)' }}>
                              &mdash; Reviewed by {leave.reviewer_name}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions Footer */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '2px' }}>
                        {isStudent && isPending && (
                          <button
                            className="app-btn app-btn-secondary app-btn-xs"
                            onClick={() => handleCancelHostelLeave(leave.id)}
                          >
                            <X size={12} />
                            <span>Cancel Application (Restore Mess)</span>
                          </button>
                        )}

                        {isWarden && isPending && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="app-btn app-btn-primary app-btn-xs"
                              onClick={() => {
                                setSelectedLeaveForReview(leave);
                                setReviewAction('approved');
                                setReviewRemarks(`Verified with guardian (${leave.emergency_contact}). Home leave sanctioned; mess dining automatically paused.`);
                                setReviewModalOpen(true);
                              }}
                            >
                              <Check size={12} />
                              <span>Approve & Close Mess</span>
                            </button>

                            <button
                              className="app-btn app-btn-secondary app-btn-xs"
                              style={{ color: '#DC2626' }}
                              onClick={() => {
                                setSelectedLeaveForReview(leave);
                                setReviewAction('rejected');
                                setReviewRemarks('Rejected: Mandatory laboratory exam sessions scheduled during this period.');
                                setReviewModalOpen(true);
                              }}
                            >
                              <X size={12} />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DAILY CAMPUS OUTPASS & CURFEW QR                                   */}
      {/* ========================================================================= */}
      {activeTab === 'gatepass' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '20px', alignItems: 'start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Active Pass Digital Card if student has active outpass */}
            {activeStudentPass ? (
              <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)' }}>
                      Active Campus Outpass Token
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '2px 0 0', color: 'var(--text-primary)' }}>
                      {activeStudentPass.pass_number}
                    </h3>
                  </div>
                  <span className={`badge-tag ${activeStudentPass.status === 'approved' ? 'emerald' : activeStudentPass.status === 'departed' ? 'terracotta' : 'neutral'}`}>
                    {activeStudentPass.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ padding: '10px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <svg viewBox="0 0 100 100" width="100" height="100">
                      <rect width="100" height="100" fill="#ffffff" />
                      <rect x="10" y="10" width="24" height="24" fill="#14532d" />
                      <rect x="14" y="14" width="16" height="16" fill="#ffffff" />
                      <rect x="18" y="18" width="8" height="8" fill="#14532d" />
                      <rect x="66" y="10" width="24" height="24" fill="#14532d" />
                      <rect x="70" y="14" width="16" height="16" fill="#ffffff" />
                      <rect x="74" y="18" width="8" height="8" fill="#14532d" />
                      <rect x="10" y="66" width="24" height="24" fill="#14532d" />
                      <rect x="14" y="70" width="16" height="16" fill="#ffffff" />
                      <rect x="18" y="74" width="8" height="8" fill="#14532d" />
                      <rect x="42" y="14" width="6" height="12" fill="#14532d" />
                      <rect x="52" y="10" width="6" height="18" fill="#14532d" />
                      <rect x="42" y="42" width="16" height="16" fill="#14532d" />
                    </svg>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>4-Digit Non-Smartphone Code:</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '4px', fontFamily: 'monospace', color: 'var(--primary)', marginTop: '2px' }}>
                      {activeStudentPass.security_code}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      Expected Return: <strong>{formatTime12(activeStudentPass.in_time_expected)}</strong>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      Destination: {activeStudentPass.destination}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Daily Outpass Application Form */}
            <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Request Daily Campus Outpass
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Single-day local market passes with automatic return curfew check.
                </p>
              </div>

              <form onSubmit={handleApplyPass} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="input-label">Pass Category *</label>
                  <select
                    className="input-field"
                    value={passType}
                    onChange={(e) => setPassType(e.target.value)}
                  >
                    <option value="day_outpass">Day Outpass (Local City / Market &lt; 08:00 PM)</option>
                    <option value="night_outpass">Night Outpass (Overnight with Warden Review)</option>
                    <option value="emergency">Emergency Medical Outpass</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Destination Location *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Civil Town Market, Sector 4 Station"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Purpose & Justification *</label>
                  <textarea
                    className="input-field"
                    rows="2"
                    placeholder="e.g. Purchasing hardware components for semester laboratory project..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="input-label">Departure Time *</label>
                    <input
                      type="datetime-local"
                      className="input-field"
                      value={outExpected}
                      onChange={(e) => setOutExpected(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Expected Return Curfew *</label>
                    <input
                      type="datetime-local"
                      className="input-field"
                      value={inExpected}
                      onChange={(e) => setInExpected(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button type="submit" className="app-btn app-btn-primary" disabled={isSubmittingPass}>
                    {isSubmittingPass ? 'Submitting...' : 'Generate Outpass QR'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Outpass Audit History */}
          <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Outpass History
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
              {gatepasses.map((gp) => (
                <div
                  key={gp.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: 'var(--canvas)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)' }}>
                      {gp.pass_number}
                    </span>
                    <span className={`badge-tag ${gp.status === 'returned' ? 'emerald' : gp.status === 'departed' ? 'terracotta' : 'neutral'}`} style={{ fontSize: '9.5px' }}>
                      {gp.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {gp.destination}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Return: {formatDateTime12(gp.in_time_expected)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SECURITY GUARD GATE TERMINAL                                       */}
      {/* ========================================================================= */}
      {activeTab === 'terminal' && (
        <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <div className="surface-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Security Guard Gate Terminal
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Punch exit or return for any student using QR token string or 4-digit feature phone code.
              </p>
            </div>

            <form onSubmit={handleGuardPunch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Enter Token or 4-Digit Code</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 4921, GP-2026-0041"
                    value={guardIdentifier}
                    onChange={(e) => setGuardIdentifier(e.target.value)}
                    style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'monospace' }}
                  />
                  <button
                    type="button"
                    className="app-btn app-btn-secondary"
                    onClick={() => setGuardIdentifier('4921')}
                  >
                    Demo (4921)
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="submit"
                  className={`app-btn ${guardPunchType === 'exit' ? 'app-btn-primary' : 'app-btn-secondary'}`}
                  onClick={() => setGuardPunchType('exit')}
                  style={{ padding: '14px', fontSize: '13.5px', fontWeight: 700 }}
                >
                  <LogOut size={16} />
                  <span>Punch Departure (Exit)</span>
                </button>

                <button
                  type="submit"
                  className={`app-btn ${guardPunchType === 'entry' ? 'app-btn-primary' : 'app-btn-secondary'}`}
                  onClick={() => setGuardPunchType('entry')}
                  style={{ padding: '14px', fontSize: '13.5px', fontWeight: 700 }}
                >
                  <LogIn size={16} />
                  <span>Punch Return (Entry)</span>
                </button>
              </div>
            </form>

            {punchResult && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                borderRadius: '8px',
                background: punchResult.is_overdue ? '#FEF2F2' : '#F0FDF4',
                border: `1px solid ${punchResult.is_overdue ? '#FCA5A5' : '#BBF7D0'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: punchResult.is_overdue ? '#991B1B' : '#166534', fontWeight: 800 }}>
                  <CheckCircle2 size={18} />
                  <span>{punchResult.message}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Student:</span>
                    <div style={{ fontWeight: 700 }}>{punchResult.student_name}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Roll:</span>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{punchResult.roll_number}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Hostel:</span>
                    <div style={{ fontWeight: 700 }}>{punchResult.hostel_room}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HOSTEL CENSUS & DEFAULTERS                                         */}
      {/* ========================================================================= */}
      {activeTab === 'census' && isWarden && (
        <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Live Hostel Census & Boarder Registry
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Headcount verification across Boys Hostel Block B and Girls Hostel Block A.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--canvas)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                Aryabhatta Boys Hostel Block B
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0' }}>
                780 Boarders
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>Verified Inside: <strong>762</strong></div>
                <div>Away on Leave / Mess Closed: <strong style={{ color: '#6D28D9' }}>18</strong></div>
                <div>Overdue Curfew: <strong style={{ color: '#DC2626' }}>0</strong></div>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--canvas)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase' }}>
                Sarojini Girls Hostel Block A
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0' }}>
                640 Boarders
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>Verified Inside: <strong>624</strong></div>
                <div>Away on Leave / Mess Closed: <strong style={{ color: '#6D28D9' }}>16</strong></div>
                <div>Overdue Curfew: <strong style={{ color: '#DC2626' }}>0</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: APPLY HOSTEL LEAVE (DATE X TO Y WITH MESS CLOSURE)               */}
      {/* ========================================================================= */}
      {leaveModalOpen && (
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
            maxWidth: '560px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--canvas)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BedDouble size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Apply for Hostel Leave & Home Outpass
                </h3>
              </div>
              <button onClick={() => setLeaveModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyHostelLeave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Leave Category *</label>
                <select
                  className="input-field"
                  value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                >
                  <option value="home_visit">Home Visit / Personal Work</option>
                  <option value="festival_holiday">Semester Vacation / Festival Break (Durga Puja, Diwali)</option>
                  <option value="family_emergency">Family Emergency / Function</option>
                  <option value="medical_home">Medical Recovery / Treatment at Home</option>
                </select>
              </div>

              <div>
                <label className="input-label">Destination Address / City *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Sundargarh, Odisha (Home Residence)"
                  value={leaveForm.destination}
                  onChange={(e) => setLeaveForm({ ...leaveForm, destination: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Departure Date (Date X) *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Return Date (Date Y) *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Departure Time</label>
                  <input
                    type="time"
                    className="input-field"
                    value={leaveForm.departure_time}
                    onChange={(e) => setLeaveForm({ ...leaveForm, departure_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Return Curfew Time</label>
                  <input
                    type="time"
                    className="input-field"
                    value={leaveForm.return_time}
                    onChange={(e) => setLeaveForm({ ...leaveForm, return_time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Parent / Guardian Emergency Phone *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. +91 94370 12345"
                  value={leaveForm.emergency_contact}
                  onChange={(e) => setLeaveForm({ ...leaveForm, emergency_contact: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="input-label">Detailed Purpose & Reason *</label>
                <textarea
                  className="input-field"
                  rows="2"
                  placeholder="Explain why you are taking leave to travel home..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  required
                />
              </div>

              {/* AUTOMATIC MESS DEACTIVATION TOGGLE */}
              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: '#F0FDF4',
                border: '1.5px solid #BBF7D0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '13px', color: '#166534' }}>
                  <input
                    type="checkbox"
                    checked={leaveForm.auto_close_mess}
                    onChange={(e) => setLeaveForm({ ...leaveForm, auto_close_mess: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <span>Automatically Close Hostel Mess Dining During Leave</span>
                </label>

                {leaveForm.auto_close_mess ? (
                  <div style={{ fontSize: '11.5px', color: '#15803D', lineHeight: 1.4, paddingLeft: '24px' }}>
                    <strong>Automated calculation:</strong> For your <strong>{formLeaveDays} days</strong> of leave, all 4 daily meals (Breakfast, Lunch, Snacks, Dinner) = <strong>{formPausedMeals} meals</strong> will be automatically cancelled.
                    <br />
                    You will accrue <strong>{formRebateCredits} Mess Rebate Credits</strong> (25 credits per meal). Kitchen staff will not cook food for you.
                  </div>
                ) : (
                  <div style={{ fontSize: '11.5px', color: '#92400E', paddingLeft: '24px' }}>
                    Note: Mess dining remains active. Meals will be prepared and charged to your account.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" className="app-btn app-btn-secondary" onClick={() => setLeaveModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="app-btn app-btn-primary" disabled={isSubmittingLeave}>
                  {isSubmittingLeave ? 'Submitting...' : 'Submit to Warden for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: WARDEN REVIEW & APPROVE (DEACTIVATE MESS)                        */}
      {/* ========================================================================= */}
      {reviewModalOpen && selectedLeaveForReview && (
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
            maxWidth: '520px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--canvas)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Warden Review: {selectedLeaveForReview.leave_number}
              </h3>
              <button onClick={() => setReviewModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReviewHostelLeave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
                Boarder: <strong>{selectedLeaveForReview.student_name} ({selectedLeaveForReview.roll_number})</strong>
                <br />
                Hostel: <strong>{selectedLeaveForReview.hostel_name} &bull; Room {selectedLeaveForReview.room_number}</strong>
                <br />
                Destination: <strong>{selectedLeaveForReview.destination}</strong>
                <br />
                Dates: <strong>{formatDate12(selectedLeaveForReview.start_date)} &rarr; {formatDate12(selectedLeaveForReview.end_date)} ({selectedLeaveForReview.total_days} Days)</strong>
              </div>

              <div>
                <label className="input-label">Action *</label>
                <select
                  className="input-field"
                  value={reviewAction}
                  onChange={(e) => setReviewAction(e.target.value)}
                >
                  <option value="approved">Approve Home Leave & Automatically Deactivate Mess</option>
                  <option value="rejected">Reject Application (Keep Student in Mess)</option>
                </select>
              </div>

              <div>
                <label className="input-label">Warden Remarks / Conditions</label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="e.g. Verified with parent over phone. Permitted with return before curfew."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="app-btn app-btn-secondary" onClick={() => setReviewModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="app-btn app-btn-primary" disabled={isReviewingLeave}>
                  {isReviewingLeave ? 'Processing...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
