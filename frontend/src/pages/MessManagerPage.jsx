import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';
import { formatTime12 } from '../utils/dateUtils';
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
  Save,
  Users,
  Shield,
  FileText,
  Star,
  Layers,
  ChefHat
} from 'lucide-react';

export default function MessManagerPage() {
  const { user, showToast } = useAuth();
  const { t } = useAccessibility();

  const [activeTab, setActiveTab] = useState('production'); // 'production' | 'editor' | 'roster' | 'feedback'
  const [menuData, setMenuData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [rosterData, setRosterData] = useState({ roster: [], total_boarders: 850, opted_out_count: 0, confirmed_attend: 850 });
  const [feedbackData, setFeedbackData] = useState({ feedback: [], average_taste: 4.2, average_hygiene: 4.4, total_reviews: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Menu Editor state
  const [editDay, setEditDay] = useState('monday');
  const [editMeal, setEditMeal] = useState('dinner');
  const [editItems, setEditItems] = useState('');
  const [editNutritional, setEditNutritional] = useState('Pure Vegetarian');
  const [editCutoff, setEditCutoff] = useState('17:00:00');
  const [editIsSpecial, setEditIsSpecial] = useState(false);
  const [isSavingMenu, setIsSavingMenu] = useState(false);

  // Roster Filter state
  const [rosterDate, setRosterDate] = useState(new Date().toISOString().slice(0, 10));
  const [rosterMeal, setRosterMeal] = useState('dinner');
  const [isFetchingRoster, setIsFetchingRoster] = useState(false);

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [menuRes, analyticsRes, feedbackRes] = await Promise.all([
        api.getMessMenu(),
        api.getMessAnalytics(),
        api.getMessFeedbackLedger().catch(() => ({ data: { feedback: [], average_taste: 4.2, average_hygiene: 4.4, total_reviews: 0 } }))
      ]);

      if (menuRes?.data) {
        const list = menuRes.data.menu || [];
        setMenuData(list);
        // Pre-populate editor with selected day & meal
        populateEditor(list, editDay, editMeal);
      }
      if (analyticsRes?.data) {
        setAnalytics(analyticsRes.data);
      }
      if (feedbackRes?.data) {
        setFeedbackData(feedbackRes.data);
      }
      await fetchRoster(rosterDate, rosterMeal);
    } catch (err) {
      showToast(err.message || 'Failed to load mess management data');
    } finally {
      setIsLoading(false);
    }
  };

  const populateEditor = (menuList, day, meal) => {
    const found = menuList.find(m => m.day_of_week === day && m.meal_type === meal);
    if (found) {
      setEditItems(found.items || '');
      setEditNutritional(found.nutritional_tags || 'Pure Vegetarian');
      setEditCutoff(found.cutoff_time || '17:00:00');
      setEditIsSpecial(Number(found.is_special) === 1);
    } else {
      setEditItems('');
      setEditNutritional('Pure Vegetarian');
      setEditCutoff('17:00:00');
      setEditIsSpecial(false);
    }
  };

  const handleSelectDayOrMeal = (day, meal) => {
    setEditDay(day);
    setEditMeal(meal);
    populateEditor(menuData, day, meal);
  };

  const fetchRoster = async (date, meal) => {
    setIsFetchingRoster(true);
    try {
      const res = await api.getMessRoster({ date, meal_type: meal });
      if (res?.data) {
        setRosterData(res.data);
      }
    } catch (err) {
      // Fallback state
    } finally {
      setIsFetchingRoster(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    if (!editItems.trim()) {
      showToast('Please specify the menu dishes.');
      return;
    }
    setIsSavingMenu(true);
    try {
      const payload = {
        day_of_week: editDay,
        meal_type: editMeal,
        items: editItems.trim(),
        nutritional_tags: editNutritional.trim(),
        cutoff_time: editCutoff,
        is_special: editIsSpecial ? 1 : 0
      };
      const res = await api.updateMessMenu(payload);
      showToast(res.message || 'Menu updated successfully.');

      // Refresh menu list
      const menuRes = await api.getMessMenu();
      if (menuRes?.data) {
        setMenuData(menuRes.data.menu || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update mess menu');
    } finally {
      setIsSavingMenu(false);
    }
  };

  const filteredDayMeals = menuData.filter(m => m.day_of_week === editDay);

  // Raw material ration calculations based on target plate count
  const plates = analytics?.net_plates_to_cook || 800;
  const rawRations = [
    { item: 'Basmati / Sona Masoori Rice', perPlate: '120 g', totalKg: ((plates * 0.12).toFixed(1)) + ' kg' },
    { item: 'Whole Wheat Atta (Tawa Roti)', perPlate: '90 g (3 Rotis)', totalKg: ((plates * 0.09).toFixed(1)) + ' kg' },
    { item: 'Toor Dal / Pulses (Raw)', perPlate: '45 g', totalKg: ((plates * 0.045).toFixed(1)) + ' kg' },
    { item: 'Fresh Seasonal Vegetables / Paneer', perPlate: '160 g', totalKg: ((plates * 0.16).toFixed(1)) + ' kg' },
    { item: 'Refined Oil / Pure Ghee', perPlate: '18 ml', totalKg: ((plates * 0.018).toFixed(1)) + ' L' },
    { item: 'Fresh Curd / Milk Dairy', perPlate: '100 ml', totalKg: ((plates * 0.1).toFixed(1)) + ' L' }
  ];

  return (
    <div>
      {/* 1. Institutional Masthead */}
      <div className="dash-masthead">
        <div>
          <div className="dash-masthead-ribbon">
            <span className="pulse-dot"></span>
            <span>Dining Hall Operations Desk • Mess Contractor Terminal • Zero Food Waste Engine</span>
          </div>
          <h1 className="dash-masthead-title">Mess Manager & Kitchen Operations</h1>
          <div className="dash-masthead-sub">
            Real-time kitchen ration calculations, weekly revolving menu editor, boarder RSVP rosters, and student hygiene & taste audit ledger.
          </div>
        </div>

        <div className="dash-masthead-actions" style={{ display: 'flex', gap: '8px' }}>
          <Link to="/mess" className="app-btn app-btn-secondary app-btn-sm" style={{ textDecoration: 'none' }}>
            <Calendar size={13} />
            <span>Open Menu Calendar</span>
          </Link>
          <button className="app-btn app-btn-secondary app-btn-sm" onClick={loadAllData} disabled={isLoading}>
            <RefreshCw size={13} className={isLoading ? 'spin-icon' : ''} />
            <span>Sync Kitchen Records</span>
          </button>
        </div>
      </div>

      {/* 2. Top Operational Performance Grid */}
      {analytics && (
        <div className="dash-metrics-grid">
          <div className="dash-metric-card accent-stone">
            <div className="dash-metric-header">
              <span className="dash-metric-label">
                <Users size={12} />
                Hostel Boarders
              </span>
              <span className="badge-tag neutral">Baseline</span>
            </div>
            <div className="dash-metric-value">{analytics.total_hostel_boarders}</div>
            <div className="dash-metric-footer">
              <span>Total registered hostel diners</span>
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
              -{analytics.meals_opted_out}
            </div>
            <div className="dash-metric-footer">
              <span>RSVP marked before 05:00 PM cutoff</span>
            </div>
          </div>

          <div className="dash-metric-card accent-emerald">
            <div className="dash-metric-header">
              <span className="dash-metric-label">
                <CheckCircle2 size={12} />
                Net Plates to Cook
              </span>
              <span className="badge-tag emerald">Target</span>
            </div>
            <div className="dash-metric-value" style={{ color: 'var(--primary)' }}>
              {analytics.net_plates_to_cook}
            </div>
            <div className="dash-metric-footer">
              <span>Includes +{analytics.buffer_margin_plates} buffer plates</span>
            </div>
          </div>

          <div className="dash-metric-card accent-emerald">
            <div className="dash-metric-header">
              <span className="dash-metric-label">
                <TrendingDown size={12} />
                Food Saved Tonight
              </span>
              <span className="badge-tag emerald">Prevented</span>
            </div>
            <div className="dash-metric-value" style={{ color: 'var(--primary)' }}>
              {analytics.food_saved_kg} kg
            </div>
            <div className="dash-metric-footer">
              <span>Saved ₹{analytics.cost_saved_inr.toLocaleString()} procurement cost</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="tab-row">
        <button
          className={`tab-btn ${activeTab === 'production' ? 'active' : ''}`}
          onClick={() => setActiveTab('production')}
        >
          Live Production & Ration Kiosk
        </button>
        <button
          className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          Manage Revolving Menu
        </button>
        <button
          className={`tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          Boarders RSVP Roster
        </button>
        <button
          className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          Hygiene & Taste Audit ({feedbackData.total_reviews} Reviews)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PRODUCTION & RAW MATERIAL RATIONS KIOSK */}
      {/* ========================================================================= */}
      {activeTab === 'production' && analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
          {/* Main Production Guide */}
          <div className="dash-panel">
            <div className="dash-panel-header">
              <div>
                <h3 className="dash-panel-title">Head Chef Batch Cooking Directive</h3>
                <div className="dash-panel-subtitle">
                  Calculated based on verified {analytics.net_plates_to_cook} diners. Zero surplus dumping.
                </div>
              </div>
              <span className="badge-tag emerald">Active Session: Dinner</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', background: 'var(--surface-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Registered Diners</div>
                <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{analytics.total_hostel_boarders}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Hostel Resident Base</div>
              </div>
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', background: 'var(--accent-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--accent)' }}>Opted Out (Skip)</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)', marginTop: '2px' }}>-{analytics.meals_opted_out}</div>
                <div style={{ fontSize: '10px', color: 'var(--accent)' }}>Not dining tonight</div>
              </div>
              <div style={{ border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-md)', padding: '12px', background: 'var(--primary-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--primary)' }}>Target Batch Size</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>{analytics.net_plates_to_cook}</div>
                <div style={{ fontSize: '10px', color: 'var(--primary)' }}>Plates to prepare</div>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Raw Material Procurement & Cooking Rations</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Standardized culinary measurements adjusted strictly for {analytics.net_plates_to_cook} portions:
              </p>

              <table className="app-table">
                <thead>
                  <tr>
                    <th>Ingredient / Commodity</th>
                    <th>Standard Rations</th>
                    <th>Batch Requisition</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rawRations.map((r, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{r.item}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{r.perPlate}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                        {r.totalKg}
                      </td>
                      <td>
                        <span className="badge-tag emerald">Dispatched</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Mandatory Kitchen Dispatch Protocols</h4>
              <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, paddingLeft: '18px' }}>
                <li>Food temperature must register above 65°C at service counters.</li>
                <li>Retain 150g sterile control sample in blast chiller for 48-hour regulatory inspection.</li>
                <li>Tasting committee signature must be recorded prior to opening dining hall gates.</li>
              </ul>
            </div>
          </div>

          {/* Audit & Savings Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="dash-panel">
              <div className="dash-panel-header">
                <div>
                  <h3 className="dash-panel-title">Institutional Financial Audit</h3>
                  <div className="dash-panel-subtitle">Audited food cost recovery from advance RSVPs</div>
                </div>
              </div>

              <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '30px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                  ₹{analytics.cost_saved_inr.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Nightly procurement savings achieved
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Food Waste Diverted:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{analytics.food_saved_kg} kg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Procurement Efficiency:</span>
                  <span style={{ fontWeight: 700 }}>{analytics.efficiency_index}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Student Rebate Liability:</span>
                  <span style={{ fontWeight: 700 }}>₹{(analytics.meals_opted_out * 25).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Net Contractor Margin:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{(analytics.cost_saved_inr - (analytics.meals_opted_out * 25)).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="dash-panel" style={{ background: 'var(--surface-subtle)' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
                Cutoff Policy Rules
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                Breakfast RSVP closes at 09:00 PM the prior night. Lunch RSVP closes at 09:00 AM. Dinner RSVP closes strictly at 05:00 PM. Modifications after cutoff require written Warden dispensary endorsement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WEEKLY MENU EDITOR */}
      {/* ========================================================================= */}
      {activeTab === 'editor' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '20px' }}>
          {/* Menu Edit Form */}
          <div className="dash-panel">
            <div className="dash-panel-header">
              <div>
                <h3 className="dash-panel-title">Edit Dining Menu</h3>
                <div className="dash-panel-subtitle">Select day and meal session to update dishes, nutritional notes, and cutoff timings.</div>
              </div>
            </div>

            <form onSubmit={handleSaveMenu} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Day Selector Pills */}
              <div>
                <label className="input-label">Select Day of Week</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {daysOfWeek.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`app-btn app-btn-sm ${editDay === d ? 'app-btn-primary' : 'app-btn-secondary'}`}
                      onClick={() => handleSelectDayOrMeal(d, editMeal)}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {d.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meal Selector Pills */}
              <div>
                <label className="input-label">Select Meal Session</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {mealTypes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`app-btn app-btn-sm ${editMeal === m ? 'app-btn-primary' : 'app-btn-secondary'}`}
                      onClick={() => handleSelectDayOrMeal(editDay, m)}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Items */}
              <div>
                <label className="input-label">
                  Dishes & Prepared Items (Comma separated)
                </label>
                <textarea
                  rows={4}
                  className="input-field"
                  placeholder="e.g. Paneer Butter Masala, Jeera Rice, Dal Makhani, Tawa Roti, Mixed Green Salad, Gulab Jamun"
                  value={editItems}
                  onChange={(e) => setEditItems(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                <div>
                  <label className="input-label">Nutritional / Dietary Classification</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Pure Vegetarian, High Protein"
                    value={editNutritional}
                    onChange={(e) => setEditNutritional(e.target.value)}
                  />
                </div>

                <div>
                  <label className="input-label">RSVP Cutoff Time</label>
                  <input
                    type="time"
                    step="1"
                    className="input-field"
                    value={editCutoff}
                    onChange={(e) => setEditCutoff(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="chkSpecial"
                  checked={editIsSpecial}
                  onChange={(e) => setEditIsSpecial(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="chkSpecial" style={{ fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Mark as Feast / Chef Special Meal
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="app-btn app-btn-secondary"
                  onClick={() => populateEditor(menuData, editDay, editMeal)}
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  className="app-btn app-btn-primary"
                  disabled={isSavingMenu}
                >
                  <Save size={14} />
                  <span>{isSavingMenu ? 'Saving...' : `Update ${editDay.toUpperCase()} ${editMeal.toUpperCase()}`}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Day Schedule Live Preview */}
          <div className="dash-panel">
            <div className="dash-panel-header">
              <div>
                <h3 className="dash-panel-title" style={{ textTransform: 'capitalize' }}>
                  {editDay} Dining Schedule
                </h3>
                <div className="dash-panel-subtitle">Review all 4 meal sessions currently configured for {editDay}.</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mealTypes.map((m) => {
                const mealEntry = filteredDayMeals.find(item => item.meal_type === m);
                const isSelected = editMeal === m;
                return (
                  <div
                    key={m}
                    style={{
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px',
                      background: isSelected ? 'var(--primary-subtle)' : 'var(--surface)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, textTransform: 'capitalize', fontSize: '14px' }}>
                          {m}
                        </span>
                        {mealEntry?.is_special ? (
                          <span className="badge-tag terracotta">Special Feast</span>
                        ) : null}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Cutoff: {formatTime12(mealEntry?.cutoff_time || '17:00:00')}
                        </span>
                        <button
                          type="button"
                          className="app-btn app-btn-secondary app-btn-sm"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => handleSelectDayOrMeal(editDay, m)}
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {mealEntry?.items || 'No menu configured yet.'}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Dietary: <strong>{mealEntry?.nutritional_tags || 'Pure Vegetarian'}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BOARDERS RSVP ROSTER */}
      {/* ========================================================================= */}
      {activeTab === 'roster' && (
        <div className="dash-panel">
          <div className="dash-panel-header">
            <div>
              <h3 className="dash-panel-title">Hostel Boarders Dining Roster</h3>
              <div className="dash-panel-subtitle">
                Live attendance vs opt-out status for specific meal dates and sessions.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="date"
                className="input-field"
                style={{ width: '150px' }}
                value={rosterDate}
                onChange={(e) => {
                  setRosterDate(e.target.value);
                  fetchRoster(e.target.value, rosterMeal);
                }}
              />
              <select
                className="input-field"
                style={{ width: '130px' }}
                value={rosterMeal}
                onChange={(e) => {
                  setRosterMeal(e.target.value);
                  fetchRoster(rosterDate, e.target.value);
                }}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snacks">Snacks</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', background: 'var(--surface-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Boarders</div>
              <div style={{ fontSize: '20px', fontWeight: 800 }}>{rosterData.total_boarders}</div>
            </div>
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', background: 'var(--accent-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--accent)' }}>Opted Out (Skipped)</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)' }}>{rosterData.opted_out_count}</div>
            </div>
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', background: 'var(--primary-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--primary)' }}>Attending In Hall</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>{rosterData.confirmed_attend}</div>
            </div>
          </div>

          <table className="app-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Hostel Block & Room</th>
                <th>Meal Session</th>
                <th>RSVP Status</th>
                <th>Rebate Action</th>
              </tr>
            </thead>
            <tbody>
              {rosterData.roster.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No explicit opt-outs logged for this date. All {rosterData.total_boarders} boarders will be catered.
                  </td>
                </tr>
              ) : (
                rosterData.roster.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.roll_number}</td>
                    <td>{r.username}</td>
                    <td>{r.hostel_block} / Room {r.room_number}</td>
                    <td style={{ textTransform: 'capitalize' }}>{r.meal_type}</td>
                    <td>
                      <span className={`badge-tag ${r.status === 'skipping' ? 'terracotta' : 'emerald'}`}>
                        {r.status === 'skipping' ? 'Skipping (Opted Out)' : 'Attending'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      {r.status === 'skipping' ? '+25 Credits Accrued' : 'None'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HYGIENE & TASTE AUDIT LEDGER */}
      {/* ========================================================================= */}
      {activeTab === 'feedback' && (
        <div className="dash-panel">
          <div className="dash-panel-header">
            <div>
              <h3 className="dash-panel-title">Hostel Dining Taste & Hygiene Review Ledger</h3>
              <div className="dash-panel-subtitle">
                Student ratings submitted after meals. Monitored by the Dean of Student Welfare and Mess Committee.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Avg Taste Rating</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>
                  {feedbackData.average_taste} / 5.0
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Avg Hygiene Rating</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>
                  {feedbackData.average_hygiene} / 5.0
                </div>
              </div>
            </div>
          </div>

          <table className="app-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Meal Session</th>
                <th>Student Roll No</th>
                <th>Taste (1-5)</th>
                <th>Hygiene (1-5)</th>
                <th>Student Comments</th>
              </tr>
            </thead>
            <tbody>
              {feedbackData.feedback.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No reviews logged yet. Reviews will appear here in real time as students rate meals.
                  </td>
                </tr>
              ) : (
                feedbackData.feedback.map((f) => (
                  <tr key={f.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{f.date}</td>
                    <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>{f.meal_type}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{f.roll_number}</td>
                    <td>
                      <span className="badge-tag emerald">
                        ★ {f.rating_taste}.0
                      </span>
                    </td>
                    <td>
                      <span className="badge-tag emerald">
                        ★ {f.rating_hygiene}.0
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {f.comment || 'No specific comment provided.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
