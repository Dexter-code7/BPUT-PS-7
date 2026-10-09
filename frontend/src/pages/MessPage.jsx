import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';
import {
  Utensils,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Sparkles,
  Coffee,
  Coins,
  ThumbsUp,
  RefreshCw,
  Award,
  BedDouble
} from 'lucide-react';
import MessCalendar from '../components/MessCalendar';

export default function MessPage() {
  const { user, showToast } = useAuth();
  const { t } = useAccessibility();

  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'rsvp' | 'analytics'
  const [menuData, setMenuData] = useState([]);
  const [currentDay, setCurrentDay] = useState('monday');
  const [activeMeal, setActiveMeal] = useState('dinner');
  const [selectedDay, setSelectedDay] = useState('monday');
  const [rsvps, setRsvps] = useState([]);
  const [hostelLeaves, setHostelLeaves] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Feedback form state
  const [ratingTaste, setRatingTaste] = useState(4);
  const [ratingHygiene, setRatingHygiene] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [menuRes, rsvpRes, analyticsRes, leavesRes] = await Promise.all([
        api.getMessMenu(),
        api.getMessRsvps(),
        api.getMessAnalytics(),
        api.getHostelLeaves()
      ]);

      if (menuRes?.data) {
        setMenuData(menuRes.data.menu || []);
        setCurrentDay(menuRes.data.current_day || 'monday');
        setSelectedDay(menuRes.data.current_day || 'monday');
        setActiveMeal(menuRes.data.active_meal || 'dinner');
      }
      if (rsvpRes?.data?.rsvps) {
        setRsvps(rsvpRes.data.rsvps);
      }
      if (analyticsRes?.data) {
        setAnalytics(analyticsRes.data);
      }
      if (leavesRes?.data?.leaves) {
        setHostelLeaves(leavesRes.data.leaves);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load mess data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleRsvp = async (mealType, newStatus, targetDate) => {
    try {
      const dateToUse = targetDate || new Date().toISOString().slice(0, 10);
      const res = await api.toggleMessRsvp({
        date: dateToUse,
        meal_type: mealType,
        status: newStatus
      });
      showToast(res.message || 'RSVP updated.');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Could not update meal RSVP');
    }
  };

  const handleBulkRsvp = async (payload) => {
    try {
      const res = await api.bulkMessRsvp(payload);
      showToast(res.message || 'Bulk meal status updated.');
      await loadData();
      return res;
    } catch (err) {
      showToast(err.message || 'Could not update bulk meal RSVP');
      throw err;
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    try {
      const res = await api.submitMessFeedback({
        meal_type: activeMeal,
        rating_taste: ratingTaste,
        rating_hygiene: ratingHygiene,
        comment: feedbackComment
      });
      showToast(res.message || 'Feedback submitted.');
      setFeedbackComment('');
    } catch (err) {
      showToast(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const filteredMenu = menuData.filter(m => m.day_of_week === selectedDay);

  const todayDate = new Date().toISOString().slice(0, 10);
  const todayDinnerRsvp = rsvps.find(r => r.date === todayDate && r.meal_type === 'dinner');
  const isSkippingDinner = todayDinnerRsvp?.status === 'skipping';

  const isStudent = user?.role_name === 'student' || !user?.role_name;
  const isStaffOrWarden = ['warden', 'system_admin', 'admin_staff', 'mess_manager'].includes(user?.role_name);

  return (
    <div>
      {/* 1. Institutional Masthead */}
      <div className="dash-masthead">
        <div>
          <div className="dash-masthead-ribbon">
            <span className="pulse-dot"></span>
            <span>Hostel Dining Operations • 7-Day Revolving Menu • Live RSVP Food Waste Prevention</span>
          </div>
          <h1 className="dash-masthead-title">{t('messDining')}</h1>
          <div className="dash-masthead-sub">
            Real-time meal RSVP with cutoff timers prevents kitchen food waste, accrues student rebate credits, and provides live headcounts for dining contractors.
          </div>
        </div>

        <div className="dash-masthead-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isStaffOrWarden && (
            <a
              href="#/mess-manager"
              className="app-btn app-btn-primary app-btn-sm"
              style={{ textDecoration: 'none' }}
            >
              <Utensils size={13} />
              <span>Mess Manager Desk</span>
            </a>
          )}
          <button className="app-btn app-btn-secondary app-btn-sm" onClick={loadData}>
            <RefreshCw size={13} />
            <span>Sync Menu</span>
          </button>
        </div>
      </div>

      {/* Automated Mess Deactivation from Hostel Leave Alert Banner */}
      {(() => {
        const activeHostelLeave = hostelLeaves.find(l => (l.status === 'approved' || l.status === 'pending') && l.auto_close_mess);
        if (!activeHostelLeave) return null;
        return (
          <div style={{
            padding: '14px 18px',
            borderRadius: '8px',
            background: activeHostelLeave.status === 'approved' ? '#F0FDF4' : '#FEF3C7',
            border: `1.5px solid ${activeHostelLeave.status === 'approved' ? '#BBF7D0' : '#FDE68A'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: activeHostelLeave.status === 'approved' ? '#DCFCE7' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeHostelLeave.status === 'approved' ? '#15803D' : '#92400E' }}>
                <BedDouble size={18} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: activeHostelLeave.status === 'approved' ? '#166534' : '#92400E' }}>
                  {activeHostelLeave.status === 'approved'
                    ? `Hostel Leave Approved: Mess Dining Automatically Deactivated (${activeHostelLeave.leave_number})`
                    : `Hostel Leave Pending: Automated Mess Deactivation Scheduled (${activeHostelLeave.leave_number})`
                  }
                </div>
                <div style={{ fontSize: '11.5px', color: activeHostelLeave.status === 'approved' ? '#15803D' : '#78350F' }}>
                  Boarder away to <strong>{activeHostelLeave.destination}</strong> from <strong>{activeHostelLeave.start_date}</strong> to <strong>{activeHostelLeave.end_date}</strong> ({activeHostelLeave.total_days} Days).
                  {' '}&bull; {activeHostelLeave.mess_meals_paused_count} meals closed &bull; <strong>+{activeHostelLeave.mess_rebate_credits_accrued} Mess Rebate Credits</strong> accrued.
                </div>
              </div>
            </div>

            <a
              href="#/gatepass"
              className="app-btn app-btn-secondary app-btn-xs"
              style={{ textDecoration: 'none' }}
            >
              Manage Hostel Leave
            </a>
          </div>
        );
      })()}

      {/* 2. Institutional Navigation Tabs */}
      <div className="tab-row">
        <button
          className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          7-Day Revolving Menu
        </button>
        <button
          className={`tab-btn ${activeTab === 'rsvp' ? 'active' : ''}`}
          onClick={() => setActiveTab('rsvp')}
        >
          Meal RSVP & Rebate Credits
        </button>
        <button
          className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          Rate Meal & Feedback
        </button>
        {isStaffOrWarden && (
          <button
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Chef Production Kiosk (Staff)
          </button>
        )}
      </div>

      {/* 3. Metrics Grid: Contractor Kitchen Analytics for Mess Manager, Personal Dining Status for Students */}
      {isStaffOrWarden && analytics && !analytics.restricted ? (
        <div className="dash-metrics-grid">
          <div className="dash-metric-card accent-stone">
            <div className="dash-metric-header">
              <span className="dash-metric-label">
                <Utensils size={12} />
                Hostel Boarders
              </span>
              <span className="badge-tag neutral">Diners</span>
            </div>
            <div className="dash-metric-value">{analytics.total_hostel_boarders}</div>
            <div className="dash-metric-footer">
              <span>Registered mess diners</span>
            </div>
          </div>

          <div className="dash-metric-card accent-terracotta">
            <div className="dash-metric-header">
              <span className="dash-metric-label">
                <Clock size={12} />
                Opted Out Today
              </span>
              <span className="badge-tag terracotta">Skipping</span>
            </div>
            <div className="dash-metric-value" style={{ color: 'var(--accent)' }}>
              {analytics.meals_opted_out}
            </div>
            <div className="dash-metric-footer">
              <span>RSVP marked before 05:00 PM cutoff</span>
            </div>
          </div>

          <div className="dash-metric-card accent-emerald">
            <div className="dash-metric-header">
              <span className="dash-metric-label">
                <CheckCircle2 size={12} />
                Plates to Cook
              </span>
              <span className="badge-tag emerald">Target</span>
            </div>
            <div className="dash-metric-value" style={{ color: 'var(--primary)' }}>
              {analytics.net_plates_to_cook}
            </div>
            <div className="dash-metric-footer">
              <span>Includes +{analytics.buffer_margin_plates} chef buffer plates</span>
            </div>
          </div>

          <div className="dash-metric-card accent-amber">
            <div className="dash-metric-header">
              <span className="dash-metric-label">
                <TrendingDown size={12} />
                Food Saved Today
              </span>
              <span className="badge-tag amber">Waste Prevention</span>
            </div>
            <div className="dash-metric-value" style={{ color: '#d97706' }}>
              {analytics.food_saved_kg} kg
            </div>
            <div className="dash-metric-footer">
              <span>≈ ₹{analytics.cost_saved_inr.toLocaleString()} procurement saved</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="dash-metrics-grid">
          <div className="dash-metric-card accent-emerald">
            <div className="dash-metric-header">
              <span className="dash-metric-label">
                <Utensils size={12} />
                Today's Dinner Status
              </span>
              <span className={`badge-tag ${isSkippingDinner ? 'terracotta' : 'emerald'}`}>
                {isSkippingDinner ? 'Skipping' : 'Attending'}
              </span>
            </div>
            <div className="dash-metric-value" style={{ color: isSkippingDinner ? 'var(--accent)' : 'var(--primary)', fontSize: '18px' }}>
              {isSkippingDinner ? 'Dinner Skipped' : 'Standard Plate Active'}
            </div>
            <div className="dash-metric-footer">
              <span>{isSkippingDinner ? 'Eating Outside (+25 Credits Accrued)' : 'Chef preparing standard serving'}</span>
            </div>
          </div>

          <div className="dash-metric-card accent-stone">
            <div className="dash-metric-header">
              <span className="dash-metric-label">
                <Coins size={12} />
                My Mess Rebate Balance
              </span>
              <span className="badge-tag emerald">Accrued</span>
            </div>
            <div className="dash-metric-value" style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
              125 Credits
            </div>
            <div className="dash-metric-footer">
              <span>Auto-credited against hostel dues ledger</span>
            </div>
          </div>

          <div className="dash-metric-card accent-amber">
            <div className="dash-metric-header">
              <span className="dash-metric-label">
                <Clock size={12} />
                Active Session
              </span>
              <span className="badge-tag amber">Live</span>
            </div>
            <div className="dash-metric-value" style={{ fontSize: '18px', textTransform: 'capitalize' }}>
              {activeMeal || 'Dinner'} Session
            </div>
            <div className="dash-metric-footer">
              <span>Dining Hall Open: 07:30 PM – 09:30 PM</span>
            </div>
          </div>

          <div className="dash-metric-card accent-terracotta">
            <div className="dash-metric-header">
              <span className="dash-metric-label">
                <Calendar size={12} />
                Daily RSVP Cutoff
              </span>
              <span className="badge-tag neutral">Policy</span>
            </div>
            <div className="dash-metric-value" style={{ fontSize: '18px' }}>
              05:00 PM Daily
            </div>
            <div className="dash-metric-footer">
              <span>Toggle skip before cutoff to earn rebates</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: WEEKLY REVOLVING MENU (GOOGLE CALENDAR INTERFACE) */}
      {activeTab === 'menu' && (
        <MessCalendar
          menuData={menuData}
          currentDay={currentDay}
          activeMeal={activeMeal}
          rsvps={rsvps}
          onToggleRsvp={handleToggleRsvp}
          onBulkRsvp={handleBulkRsvp}
          isStudent={isStudent}
          canEditMenu={isStaffOrWarden}
          onMenuUpdated={loadData}
        />
      )}

      {/* TAB 2: MEAL RSVP & REBATE CREDITS */}
      {activeTab === 'rsvp' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '22px' }}>
          <div className="dash-panel">
            <div className="dash-panel-header">
              <div>
                <h3 className="dash-panel-title">Meal Attendance RSVP</h3>
                <div className="dash-panel-subtitle">Mark meal skips 4h before serving to prevent waste and earn 25 Rebate Credits per meal.</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Tonight's Dinner RSVP Toggle */}
              <div style={{
                background: isSkippingDinner ? 'var(--accent-subtle)' : 'var(--primary-subtle)',
                border: `1px solid ${isSkippingDinner ? 'var(--accent-border)' : 'var(--primary-border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: isSkippingDinner ? 'var(--accent)' : 'var(--primary)' }}>
                    Tonight's Dinner ({new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })})
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '2px' }}>
                    Status: {isSkippingDinner ? 'Skipping (Eating Outside / On Leave)' : 'Attending (Standard Plate)'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {isSkippingDinner
                      ? 'Contractor notified. 25 Mess Rebate Credits accrued to your hostel dues ledger.'
                      : 'Chef will prepare your meal. You can toggle skip before 05:00 PM.'}
                  </div>
                </div>

                <div>
                  {isSkippingDinner ? (
                    <button
                      className="app-btn app-btn-secondary"
                      onClick={() => handleToggleRsvp('dinner', 'attending')}
                    >
                      Undo: I Will Attend Dinner
                    </button>
                  ) : (
                    <button
                      className="app-btn app-btn-primary"
                      onClick={() => handleToggleRsvp('dinner', 'skipping')}
                      style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }}
                    >
                      Skip Tonight's Dinner (+25 Credits)
                    </button>
                  )}
                </div>
              </div>

              {/* Advance Multi-Day Leave Planner */}
              <div style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                background: '#FAFAF9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Advance Absence & Weekend Leave Planner
                  </div>
                  <span className="badge-tag emerald" style={{ fontSize: '10px' }}>
                    Instant Rebate
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  Going home for the weekend or taking a week of approved hostel leave? Turn off meals in advance to credit your ledger and notify dining staff.
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    className="app-btn app-btn-secondary app-btn-sm"
                    onClick={() => handleBulkRsvp({
                      dates: ['2026-10-10', '2026-10-11'],
                      meal_types: ['breakfast', 'lunch', 'snacks', 'dinner'],
                      status: 'skipping'
                    })}
                  >
                    Skip Weekend (Sat & Sun • +₹200 Credits)
                  </button>

                  <button
                    className="app-btn app-btn-secondary app-btn-sm"
                    onClick={() => handleBulkRsvp({
                      dates: ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11'],
                      meal_types: ['breakfast', 'lunch', 'snacks', 'dinner'],
                      status: 'skipping'
                    })}
                  >
                    Skip Full 7-Day Week (+₹700 Credits)
                  </button>

                  <button
                    className="app-btn app-btn-secondary app-btn-sm"
                    onClick={() => handleBulkRsvp({
                      dates: ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11'],
                      meal_types: ['breakfast', 'lunch', 'snacks', 'dinner'],
                      status: 'attending'
                    })}
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Restore All to Attending
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Credits Ledger Card */}
          <div className="dash-panel">
            <div className="dash-panel-header">
              <div>
                <h3 className="dash-panel-title">Mess Rebate Balance</h3>
                <div className="dash-panel-subtitle">Accrued credits applied against hostel mess bill</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                125 Credits
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Equivalent to ₹125 rebate against semester mess dues
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>Recent Participation Log</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {rsvps.map((r) => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px dashed var(--border-subtle)' }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{r.date}</span> • <span style={{ textTransform: 'capitalize' }}>{r.meal_type}</span>
                    </div>
                    <div style={{ color: r.status === 'skipping' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {r.status === 'skipping' ? '+25 Credits (Skipped)' : 'Attended'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STUDENT MEAL QUALITY & TASTE FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="dash-panel">
          <div className="dash-panel-header">
            <div>
              <h3 className="dash-panel-title">Post-Meal Quality & Taste Audit</h3>
              <div className="dash-panel-subtitle">
                Student-submitted feedback directly alerts the Mess Contractor and Hostel Committee to maintain food standards.
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="input-label">Taste & Flavor Rating (1 - 5)</label>
                <select
                  className="input-field"
                  value={ratingTaste}
                  onChange={(e) => setRatingTaste(Number(e.target.value))}
                >
                  <option value={5}>5 - Excellent / Hot & Fresh</option>
                  <option value={4}>4 - Good / Satisfactory</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Poor / Insufficient Seasoning</option>
                  <option value={1}>1 - Unacceptable Quality</option>
                </select>
              </div>

              <div>
                <label className="input-label">Dining Hygiene & Cleanliness (1 - 5)</label>
                <select
                  className="input-field"
                  value={ratingHygiene}
                  onChange={(e) => setRatingHygiene(Number(e.target.value))}
                >
                  <option value={5}>5 - Spotless / Clean Utensils</option>
                  <option value={4}>4 - Clean</option>
                  <option value={3}>3 - Acceptable</option>
                  <option value={2}>2 - Unclean Counter</option>
                  <option value={1}>1 - Severe Hygiene Breach</option>
                </select>
              </div>
            </div>

            <div>
              <label className="input-label">Specific Comments or Recommendations</label>
              <textarea
                rows={3}
                className="input-field"
                placeholder="e.g. Sambhar was warm and well prepared, curd was fresh, chapatis were soft..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button
                type="submit"
                className="app-btn app-btn-primary"
                disabled={isSubmittingFeedback}
              >
                {isSubmittingFeedback ? 'Submitting...' : 'Submit Mess Feedback'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: CONTRACTOR HEADCOUNT KIOSK */}
      {activeTab === 'analytics' && analytics && (
        <div className="dash-panel">
          <div className="dash-panel-header">
            <div>
              <h3 className="dash-panel-title">Head Chef & Contractor Production Terminal</h3>
              <div className="dash-panel-subtitle">Live calculation of exact rations to cook, eliminating food dumping and optimizing institutional procurement costs.</div>
            </div>
            <button className="app-btn app-btn-secondary app-btn-sm" onClick={loadData}>
              <RefreshCw size={12} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--surface)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Registered Diners (Baseline)</div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{analytics.total_hostel_boarders} Plates</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Active hostel residents</div>
            </div>

            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--accent-subtle)' }}>
              <div style={{ fontSize: '12px', color: 'var(--accent)' }}>Opted Out via App & Gatepass</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>-{analytics.meals_opted_out} Plates</div>
              <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '4px' }}>Will not dine tonight</div>
            </div>

            <div style={{ border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--primary-subtle)' }}>
              <div style={{ fontSize: '12px', color: 'var(--primary)' }}>Target Plates to Prepare</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>{analytics.net_plates_to_cook} Plates</div>
              <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '4px' }}>Includes {analytics.buffer_margin_plates} buffer plates</div>
            </div>
          </div>

          <div style={{ marginTop: '20px', background: 'var(--surface-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>Audited Institutional Savings Projection</div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              By establishing an advance 05:00 PM cut-off RSVP mechanism, the dining hall avoids over-cooking food for {analytics.meals_opted_out} absent students.
              This prevents <strong>{analytics.food_saved_kg} kg of biodegradable waste</strong> and saves an estimated <strong>₹{analytics.cost_saved_inr.toLocaleString()}</strong> in nightly institutional kitchen procurement costs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
