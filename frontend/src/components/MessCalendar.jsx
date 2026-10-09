import React, { useState, useMemo } from 'react';
import { api } from '../services/api';
import { formatTime12 } from '../utils/dateUtils';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Utensils,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  MapPin,
  X,
  Flame,
  Download,
  Share2,
  Sparkles,
  Info,
  SlidersHorizontal,
  LayoutGrid,
  List,
  CalendarDays,
  Edit2,
  Plus,
  Save,
  RotateCcw,
  ChefHat,
  Check
} from 'lucide-react';

export default function MessCalendar({
  menuData = [],
  currentDay = 'friday',
  activeMeal = 'dinner',
  rsvps = [],
  onToggleRsvp,
  onBulkRsvp,
  isStudent = false,
  canEditMenu = false,
  onMenuUpdated
}) {
  const [calendarView, setCalendarView] = useState('week'); // 'week' | 'day' | 'agenda'
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [searchQuery, setSearchQuery] = useState('');
  const [mealFilter, setMealFilter] = useState('all'); // 'all' | 'breakfast' | 'lunch' | 'snacks' | 'dinner'
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Bulk Meal Skip & Hostel Leave Modal State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [bulkStatusMsg, setBulkStatusMsg] = useState('');

  // Mess Manager Editor State
  const [editingMeal, setEditingMeal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [editErrorMsg, setEditErrorMsg] = useState('');

  // Quick Dish Suggestion Presets for faster menu creation
  const quickPresets = [
    {
      label: 'Paneer Feast',
      items: 'Paneer Butter Masala, Jeera Rice, Tawa Roti, Dal Makhani, Gulab Jamun',
      tag: 'Special Feast',
      cutoff: '17:00:00'
    },
    {
      label: 'Biryani Special',
      items: 'Hyderabadi Veg Biryani, Mirchi Ka Salan, Boondi Raita, Onion Rings, Phirni',
      tag: 'Special Feast',
      cutoff: '11:00:00'
    },
    {
      label: 'North Indian Lunch',
      items: 'Rajma Masala, Steamed Rice, Phulka Roti, Yellow Dal Tadka, Cucumber Salad',
      tag: 'Pure Vegetarian',
      cutoff: '11:00:00'
    },
    {
      label: 'Traditional Breakfast',
      items: 'Methi Puri, Aloo Tamatar Sabzi, Curd, Hot Tea / Filter Coffee',
      tag: 'Traditional Breakfast',
      cutoff: '07:00:00'
    },
    {
      label: 'South Indian Breakfast',
      items: 'Masala Dosa, Idli (2 Pcs), Medu Vada, Drumstick Sambar, Coconut Chutney',
      tag: 'High Protein',
      cutoff: '07:00:00'
    },
    {
      label: 'Evening Snacks',
      items: 'Crispy Bread Pakoda, Green Mint Chutney, Masala Chai, Sweet Biscuits',
      tag: 'Evening Snacks',
      cutoff: '16:00:00'
    }
  ];

  // Calendar dates mapping for the 7 days of the cycle
  const weekDays = [
    { key: 'monday', label: 'MON', dateNumber: 5, fullLabel: 'Monday, Oct 5', dateStr: '2026-10-05' },
    { key: 'tuesday', label: 'TUE', dateNumber: 6, fullLabel: 'Tuesday, Oct 6', dateStr: '2026-10-06' },
    { key: 'wednesday', label: 'WED', dateNumber: 7, fullLabel: 'Wednesday, Oct 7', dateStr: '2026-10-07' },
    { key: 'thursday', label: 'THU', dateNumber: 8, fullLabel: 'Thursday, Oct 8', dateStr: '2026-10-08' },
    { key: 'friday', label: 'FRI', dateNumber: 9, fullLabel: 'Friday, Oct 9', dateStr: '2026-10-09' },
    { key: 'saturday', label: 'SAT', dateNumber: 10, fullLabel: 'Saturday, Oct 10', dateStr: '2026-10-10' },
    { key: 'sunday', label: 'SUN', dateNumber: 11, fullLabel: 'Sunday, Oct 11', dateStr: '2026-10-11' }
  ];

  const mealSlots = [
    {
      type: 'breakfast',
      label: 'Breakfast',
      timeSlot: '07:30 AM – 09:00 AM',
      startHour: 7.5,
      endHour: 9.0,
      accentColor: '#d97706',
      bgTint: '#FEF3C7',
      borderTint: '#F59E0B',
      icon: Coffee,
      typicalKcal: 480
    },
    {
      type: 'lunch',
      label: 'Lunch',
      timeSlot: '12:30 PM – 02:00 PM',
      startHour: 12.5,
      endHour: 14.0,
      accentColor: '#15803d',
      bgTint: '#DCFCE7',
      borderTint: '#22C55E',
      icon: Utensils,
      typicalKcal: 720
    },
    {
      type: 'snacks',
      label: 'Evening Snacks',
      timeSlot: '05:00 PM – 06:00 PM',
      startHour: 17.0,
      endHour: 18.0,
      accentColor: '#c2410c',
      bgTint: '#FFEDD5',
      borderTint: '#FB923C',
      icon: Coffee,
      typicalKcal: 320
    },
    {
      type: 'dinner',
      label: 'Dinner',
      timeSlot: '08:00 PM – 09:30 PM',
      startHour: 20.0,
      endHour: 21.5,
      accentColor: '#0f766e',
      bgTint: '#CCFBF1',
      borderTint: '#14B8A6',
      icon: Utensils,
      typicalKcal: 680
    }
  ];

  // Map menu data into a fast lookup dictionary: [day_of_week][meal_type]
  const menuMap = useMemo(() => {
    const map = {};
    weekDays.forEach(d => {
      map[d.key] = {};
    });
    menuData.forEach(item => {
      if (map[item.day_of_week]) {
        map[item.day_of_week][item.meal_type] = item;
      }
    });
    return map;
  }, [menuData]);

  // Filtered menu check
  const matchesFilter = (mealItem) => {
    if (!mealItem) return false;
    if (mealFilter !== 'all' && mealItem.meal_type !== mealFilter) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchItems = mealItem.items?.toLowerCase().includes(q);
      const matchTags = mealItem.nutritional_tags?.toLowerCase().includes(q);
      const matchMeal = mealItem.meal_type?.toLowerCase().includes(q);
      if (!matchItems && !matchTags && !matchMeal) return false;
    }
    return true;
  };

  const currentDayObj = weekDays.find(d => d.key === currentDay) || weekDays[4];

  // Helper to check if a specific day/meal is active right now
  const isNowActive = (dayKey, mealType) => {
    return dayKey === currentDay && mealType === activeMeal;
  };

  // Helper to check student RSVP status for any given date & meal
  const getRsvpStatus = (dateStr, mealType) => {
    const targetDate = dateStr || '2026-10-09';
    const r = rsvps.find(x => x.date === targetDate && x.meal_type === mealType);
    return (r && r.status === 'skipping') ? 'skipping' : 'attending';
  };

  const getTodayRsvpStatus = (mealType) => {
    return getRsvpStatus('2026-10-09', mealType);
  };

  // Cutoff timing rule:
  // - Past days (< today): locked
  // - Future days (> today): open anytime ("they can turn off the mess anytime they want")
  // - Today: closes 4 hours before meal service
  const getMealLockStatus = (dateStr, cutoffTimeStr, mealType, startHour = 12.0) => {
    const todayStr = '2026-10-09';
    if (!dateStr) return { isLocked: false, reason: 'Advance RSVP Open', canToggle: true };

    if (dateStr < todayStr) {
      return { isLocked: true, reason: 'Past Meal (Archived)', canToggle: false };
    }
    if (dateStr > todayStr) {
      // Future dates can be turned off anytime in advance!
      return { isLocked: false, reason: 'Advance RSVP Open', canToggle: true };
    }

    // Today:
    // User specification: closes before 4 hours of serving
    const now = new Date();
    const currentHours = now.getHours() + (now.getMinutes() / 60);

    let cutoffDecimal = 17.0; // default 5:00 PM for dinner
    if (cutoffTimeStr) {
      const parts = cutoffTimeStr.split(':');
      cutoffDecimal = parseFloat(parts[0]) + (parseFloat(parts[1] || 0) / 60);
    } else if (startHour) {
      cutoffDecimal = Math.max(0, startHour - 4);
    }

    const formatted = formatTime12(cutoffTimeStr || `${Math.floor(cutoffDecimal)}:00`);
    if (currentHours >= cutoffDecimal) {
      return {
        isLocked: true,
        reason: `Cutoff Passed (Closed at ${formatted} • 4h before serving)`,
        canToggle: false
      };
    }

    return {
      isLocked: false,
      reason: `Open (Cutoff: ${formatted} • 4h before serving)`,
      canToggle: true
    };
  };

  const handleQuickRsvpToggle = (e, mealType, targetDateStr = '2026-10-09') => {
    e.stopPropagation();
    if (!onToggleRsvp) return;
    const currentStatus = getRsvpStatus(targetDateStr, mealType);
    const nextStatus = currentStatus === 'skipping' ? 'attending' : 'skipping';
    onToggleRsvp(mealType, nextStatus, targetDateStr);
  };

  const handleBulkAction = async (preset) => {
    if (!onBulkRsvp) return;
    setIsBulkSubmitting(true);
    setBulkStatusMsg('');
    try {
      let payload;
      if (preset === 'weekend') {
        payload = {
          dates: ['2026-10-10', '2026-10-11'],
          meal_types: ['breakfast', 'lunch', 'snacks', 'dinner'],
          status: 'skipping'
        };
      } else if (preset === 'week') {
        payload = {
          dates: ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11'],
          meal_types: ['breakfast', 'lunch', 'snacks', 'dinner'],
          status: 'skipping'
        };
      } else if (preset === 'restore') {
        payload = {
          dates: ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11'],
          meal_types: ['breakfast', 'lunch', 'snacks', 'dinner'],
          status: 'attending'
        };
      }
      const res = await onBulkRsvp(payload);
      setBulkStatusMsg(res?.message || 'Bulk meal status saved successfully!');
      setTimeout(() => {
        setBulkStatusMsg('');
        setShowBulkModal(false);
      }, 900);
    } catch (err) {
      setBulkStatusMsg('Failed to update: ' + (err.message || 'Error occurred'));
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  // Open the Menu Editor modal for a specific day and meal
  const handleOpenEdit = (mealItem, dayObj, slotObj) => {
    setEditingMeal({
      day_of_week: dayObj.key,
      meal_type: slotObj.type,
      dayLabel: dayObj.fullLabel,
      mealLabel: slotObj.label,
      items: mealItem ? mealItem.items : '',
      nutritional_tags: mealItem ? mealItem.nutritional_tags : 'Pure Vegetarian',
      cutoff_time: mealItem ? mealItem.cutoff_time : (slotObj.type === 'breakfast' ? '07:00:00' : slotObj.type === 'lunch' ? '11:00:00' : slotObj.type === 'snacks' ? '16:00:00' : '17:00:00'),
      is_special: mealItem ? Boolean(Number(mealItem.is_special)) : false,
      accentColor: slotObj.accentColor
    });
    // Close detail view if currently open
    setSelectedEvent(null);
  };

  // Save updated menu to backend MySQL database
  const handleSaveMenu = async (e) => {
    e.preventDefault();
    setEditErrorMsg('');
    if (!editingMeal?.items?.trim()) {
      setEditErrorMsg('Please specify the menu items.');
      return;
    }
    setIsSaving(true);
    try {
      await api.updateMessMenu({
        day_of_week: editingMeal.day_of_week,
        meal_type: editingMeal.meal_type,
        items: editingMeal.items.trim(),
        nutritional_tags: editingMeal.nutritional_tags.trim(),
        cutoff_time: editingMeal.cutoff_time,
        is_special: editingMeal.is_special ? 1 : 0
      });
      setEditSuccessMsg(`Menu updated for ${editingMeal.day_of_week.toUpperCase()} ${editingMeal.meal_type.toUpperCase()}!`);
      setTimeout(async () => {
        setEditSuccessMsg('');
        setEditingMeal(null);
        if (onMenuUpdated) {
          await onMenuUpdated();
        }
      }, 700);
    } catch (err) {
      setEditErrorMsg(err.message || 'Failed to update menu.');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate Google Calendar .ics download
  const handleExportIcs = (meal, dayInfo, slotInfo) => {
    const title = `Mess Dining: ${slotInfo.label} (${meal.items.slice(0, 35)}...)`;
    const description = `Menu Items:\n${meal.items}\n\nNutritional Notes: ${meal.nutritional_tags}\nCutoff Time: ${meal.cutoff_time}\nCentral Dining Complex, BPUT / CUT.`;
    const location = 'Central Dining Complex (Dining Hall 1 & 2)';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Central University of Technology//Mess Calendar//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      `LOCATION:${location}`,
      `DTSTART:20261009T080000`,
      `DTEND:20261009T093000`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `mess_${dayInfo.key}_${slotInfo.type}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
      marginBottom: '24px'
    }}>
      {/* ========================================================================= */}
      {/* 1. GOOGLE CALENDAR CONTROLS & NAVIGATION BAR                              */}
      {/* ========================================================================= */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        background: '#FAF9F6'
      }}>
        {/* Left: Navigation, Today Button, Month & Cycle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Google Calendar Logo-style Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#E8F5E9',
              color: '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #BBF7D0'
            }}>
              <CalendarIcon size={18} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Revolving Dining Calendar</span>
                <span style={{ fontSize: '10px', background: 'var(--primary-subtle)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  Live Schedule
                </span>
                {canEditMenu && (
                  <span style={{ fontSize: '10px', background: 'var(--accent-subtle)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    Manager Edit Mode
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                October 2026 • Cycle Week 41 (Autumn Semester)
              </div>
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', background: 'var(--border-subtle)' }} />

          {/* Today Button & Chevron Arrows */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setSelectedDay(currentDay)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid var(--border-medium)',
                background: selectedDay === currentDay ? 'var(--primary)' : 'var(--surface)',
                color: selectedDay === currentDay ? '#FFFFFF' : 'var(--text-main)',
                fontSize: '12px',
                fontWeight: 650,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Today
            </button>

            <button
              onClick={() => {
                const idx = weekDays.findIndex(d => d.key === selectedDay);
                const prev = (idx - 1 + 7) % 7;
                setSelectedDay(weekDays[prev].key);
              }}
              aria-label="Previous day"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() => {
                const idx = weekDays.findIndex(d => d.key === selectedDay);
                const next = (idx + 1) % 7;
                setSelectedDay(weekDays[next].key);
              }}
              aria-label="Next day"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Center: Search & Filter Inputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '440px', minWidth: '220px' }}>
          <div style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search dishes (e.g. Paneer, Biryani, Puri)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface)',
                fontSize: '12px'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '8px', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-muted)' }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Quick Meal Type Filter */}
          <select
            value={mealFilter}
            onChange={(e) => setMealFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface)',
              fontSize: '12px',
              fontWeight: 500
            }}
          >
            <option value="all">All Meals</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="snacks">Snacks</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>

        {/* Right: Mess Manager Action + Student Skip Week + View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isStudent && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="app-btn app-btn-secondary app-btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CalendarDays size={13} />
              <span>Skip Week / Leave</span>
            </button>
          )}

          {canEditMenu && (
            <button
              onClick={() => handleOpenEdit(null, weekDays.find(d => d.key === selectedDay) || weekDays[4], mealSlots[0])}
              className="app-btn app-btn-primary app-btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={13} />
              <span>Make / Edit Menu</span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--surface)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setCalendarView('week')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: calendarView === 'week' ? 700 : 500,
                background: calendarView === 'week' ? 'var(--primary-subtle)' : 'transparent',
                color: calendarView === 'week' ? 'var(--primary)' : 'var(--text-secondary)',
                border: calendarView === 'week' ? '1px solid var(--primary-border)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              <LayoutGrid size={13} />
              <span>Week</span>
            </button>

            <button
              onClick={() => setCalendarView('day')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: calendarView === 'day' ? 700 : 500,
                background: calendarView === 'day' ? 'var(--primary-subtle)' : 'transparent',
                color: calendarView === 'day' ? 'var(--primary)' : 'var(--text-secondary)',
                border: calendarView === 'day' ? '1px solid var(--primary-border)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              <CalendarDays size={13} />
              <span>Day</span>
            </button>

            <button
              onClick={() => setCalendarView('agenda')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: calendarView === 'agenda' ? 700 : 500,
                background: calendarView === 'agenda' ? 'var(--primary-subtle)' : 'transparent',
                color: calendarView === 'agenda' ? 'var(--primary)' : 'var(--text-secondary)',
                border: calendarView === 'agenda' ? '1px solid var(--primary-border)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              <List size={13} />
              <span>Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. VIEW A: GOOGLE CALENDAR WEEK MATRIX (7 COLUMNS x 4 TIME SLOTS)         */}
      {/* ========================================================================= */}
      {calendarView === 'week' && (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '940px' }}>
            {/* Week Header Row (Mon 5, Tue 6 ... Fri 9 [Today]) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px repeat(7, 1fr)',
              borderBottom: '1px solid var(--border-subtle)',
              background: '#FAFAF9'
            }}>
              {/* Empty Top-Left Gutter */}
              <div style={{
                padding: '10px 8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '10px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                borderRight: '1px solid var(--border-subtle)'
              }}>
                <span>IST</span>
                <span>(UTC+5:30)</span>
              </div>

              {/* 7 Day Headers */}
              {weekDays.map((d) => {
                const isToday = d.key === currentDay;
                const isSelected = d.key === selectedDay;
                return (
                  <div
                    key={d.key}
                    onClick={() => setSelectedDay(d.key)}
                    style={{
                      padding: '10px 8px',
                      textAlign: 'center',
                      borderRight: '1px solid var(--border-subtle)',
                      background: isToday ? 'rgba(20, 83, 45, 0.04)' : isSelected ? '#F5F5F4' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isToday ? 'var(--primary)' : 'var(--text-muted)',
                      letterSpacing: '0.04em'
                    }}>
                      {d.label}
                    </div>

                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      margin: '3px auto 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 800,
                      background: isToday ? 'var(--primary)' : 'transparent',
                      color: isToday ? '#FFFFFF' : 'var(--text-main)',
                      boxShadow: isToday ? '0 2px 6px rgba(20, 83, 45, 0.3)' : 'none'
                    }}>
                      {d.dateNumber}
                    </div>

                    {isToday && (
                      <div style={{
                        fontSize: '9px',
                        fontWeight: 750,
                        textTransform: 'uppercase',
                        color: 'var(--primary)',
                        marginTop: '2px'
                      }}>
                        Today
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time Slot Rows (Breakfast, Lunch, Snacks, Dinner) */}
            {mealSlots.map((slot) => {
              if (mealFilter !== 'all' && mealFilter !== slot.type) return null;

              return (
                <div
                  key={slot.type}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px repeat(7, 1fr)',
                    borderBottom: '1px solid var(--border-subtle)',
                    minHeight: '135px'
                  }}
                >
                  {/* Left Gutter: Time Slot & Label */}
                  <div style={{
                    padding: '12px 8px',
                    borderRight: '1px solid var(--border-subtle)',
                    background: '#FAFAF9',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <slot.icon size={15} style={{ color: slot.accentColor, marginBottom: '4px' }} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {slot.label}
                    </span>
                    <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {slot.timeSlot}
                    </span>
                  </div>

                  {/* 7 Day Cells */}
                  {weekDays.map((d) => {
                    const isToday = d.key === currentDay;
                    const mealItem = menuMap[d.key]?.[slot.type];
                    const activeNow = isNowActive(d.key, slot.type);
                    const visible = matchesFilter(mealItem);

                    if (!visible || !mealItem) {
                      return (
                        <div
                          key={d.key}
                          style={{
                            padding: '8px',
                            borderRight: '1px solid var(--border-subtle)',
                            background: isToday ? 'rgba(20, 83, 45, 0.02)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {canEditMenu ? (
                            <button
                              onClick={() => handleOpenEdit(null, d, slot)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                color: 'var(--primary)',
                                background: 'var(--primary-subtle)',
                                border: '1px dashed var(--primary-border)',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              <Plus size={12} />
                              <span>Make Menu</span>
                            </button>
                          ) : (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              No dish listed
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={d.key}
                        style={{
                          padding: '6px',
                          borderRight: '1px solid var(--border-subtle)',
                          background: isToday ? 'rgba(20, 83, 45, 0.02)' : 'transparent',
                          position: 'relative'
                        }}
                      >
                        {/* Red / Emerald "Current Time" Horizontal Line for Active Meal */}
                        {activeNow && (
                          <div style={{
                            position: 'absolute',
                            top: '4px',
                            left: '2px',
                            right: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            zIndex: 2
                          }}>
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: '#15803D',
                              boxShadow: '0 0 6px rgba(21, 128, 61, 0.8)'
                            }} />
                            <span style={{
                              height: '2px',
                              flex: 1,
                              background: '#15803D'
                            }} />
                          </div>
                        )}

                        {/* Google Calendar Event Chip */}
                        <div
                          onClick={() => setSelectedEvent({ meal: mealItem, day: d, slot })}
                          style={{
                            height: '100%',
                            minHeight: '120px',
                            background: activeNow ? '#FFFFFF' : '#FAFAF9',
                            border: `1px solid ${activeNow ? slot.borderTint : 'var(--border-subtle)'}`,
                            borderLeft: `3.5px solid ${slot.accentColor}`,
                            borderRadius: '6px',
                            padding: '8px 10px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease',
                            boxShadow: activeNow ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = activeNow ? '0 4px 12px rgba(0,0,0,0.06)' : 'none';
                          }}
                        >
                          <div>
                            {/* Card Top: Active Pill or Cutoff Time + Quick Edit Button */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: slot.accentColor }}>
                                {slot.timeSlot.split(/[-–]/)[0].trim()}
                              </span>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {activeNow ? (
                                  <span style={{
                                    fontSize: '9px',
                                    fontWeight: 800,
                                    background: '#15803D',
                                    color: '#FFFFFF',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    letterSpacing: '0.02em'
                                  }}>
                                    LIVE NOW
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                                    Cutoff {formatTime12(mealItem.cutoff_time)}
                                  </span>
                                )}

                                {canEditMenu && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEdit(mealItem, d, slot);
                                    }}
                                    title="Edit Food for this meal"
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '4px',
                                      background: 'var(--surface)',
                                      border: '1px solid var(--border-subtle)',
                                      color: 'var(--primary)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Edit2 size={10} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Dishes List */}
                            <div style={{
                              fontSize: '11.5px',
                              fontWeight: 650,
                              color: 'var(--text-main)',
                              lineHeight: '1.4',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {mealItem.items}
                            </div>
                          </div>

                          {/* Card Footer: Nutritional Tag & Student RSVP Indicator */}
                          <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '4px' }}>
                            <span style={{
                              fontSize: '9px',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              background: 'var(--surface)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-secondary)',
                              maxWidth: '85px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {mealItem.nutritional_tags}
                            </span>

                            {isStudent && (() => {
                              const dateStr = d.dateStr || '2026-10-09';
                              const lock = getMealLockStatus(dateStr, mealItem.cutoff_time, slot.type, slot.startHour);
                              const status = getRsvpStatus(dateStr, slot.type);
                              const isSkipping = status === 'skipping';

                              if (lock.isLocked) {
                                return (
                                  <span
                                    title={lock.reason}
                                    style={{
                                      fontSize: '9px',
                                      fontWeight: 600,
                                      padding: '1px 5px',
                                      borderRadius: '3px',
                                      background: isSkipping ? '#FEE2E2' : '#F3F4F6',
                                      color: isSkipping ? '#991B1B' : '#6B7280',
                                      cursor: 'default'
                                    }}
                                  >
                                    {isSkipping ? 'Skipped' : 'Attended'}
                                  </span>
                                );
                              }

                              return (
                                <button
                                  onClick={(e) => handleQuickRsvpToggle(e, slot.type, dateStr)}
                                  title={isSkipping ? 'Click to restore attendance' : 'Click to skip meal (+25 Credits)'}
                                  style={{
                                    fontSize: '9px',
                                    fontWeight: 700,
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: isSkipping ? '#FEE2E2' : '#DCFCE7',
                                    color: isSkipping ? '#B91C1C' : '#15803D'
                                  }}
                                >
                                  {isSkipping ? 'Skipping' : 'Attending'}
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW B: GOOGLE CALENDAR DAY TIMELINE VIEW                              */}
      {/* ========================================================================= */}
      {calendarView === 'day' && (
        <div style={{ padding: '20px' }}>
          {/* Day Carousel Navigation */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
            {weekDays.map((d) => {
              const isSelected = d.key === selectedDay;
              const isToday = d.key === currentDay;
              return (
                <button
                  key={d.key}
                  onClick={() => setSelectedDay(d.key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--primary-subtle)' : 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '13px', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                    {d.label} {d.dateNumber}
                  </span>
                  {isToday && (
                    <span style={{ fontSize: '9px', background: 'var(--primary)', color: '#FFFFFF', padding: '1px 5px', borderRadius: '3px' }}>
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Timeline of Meals for Selected Day */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mealSlots.map((slot) => {
              const mealItem = menuMap[selectedDay]?.[slot.type];
              const activeNow = isNowActive(selectedDay, slot.type);

              return (
                <div
                  key={slot.type}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${activeNow ? slot.borderTint : 'var(--border-subtle)'}`,
                    borderLeft: `5px solid ${slot.accentColor}`,
                    background: activeNow ? '#FFFFFF' : 'var(--surface-subtle)',
                    boxShadow: activeNow ? '0 6px 18px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Left Column: Time & Icon */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: slot.accentColor, fontWeight: 750, fontSize: '13px' }}>
                      <slot.icon size={16} />
                      <span>{slot.label}</span>
                    </div>
                    <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {slot.timeSlot}
                    </div>
                    {activeNow && (
                      <span className="badge-tag emerald" style={{ fontSize: '10px', marginTop: '8px' }}>
                        Active Session
                      </span>
                    )}
                  </div>

                  {/* Right Column: Menu Spread & Action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.5' }}>
                        {mealItem ? mealItem.items : 'No meal items configured.'}
                      </div>
                      {mealItem && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          <span>Dietary: {mealItem.nutritional_tags}</span>
                          <span>•</span>
                          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Cutoff: {formatTime12(mealItem.cutoff_time)}</span>
                          <span>•</span>
                          <span>Est. {slot.typicalKcal} kcal</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {canEditMenu && (
                        <button
                          onClick={() => handleOpenEdit(mealItem, weekDays.find(d => d.key === selectedDay) || weekDays[4], slot)}
                          className="app-btn app-btn-secondary app-btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <Edit2 size={12} />
                          <span>{mealItem ? 'Edit Food' : 'Make Menu'}</span>
                        </button>
                      )}

                      {isStudent && mealItem && (() => {
                        const activeDayObj = weekDays.find(d => d.key === selectedDay) || weekDays[4];
                        const dateStr = activeDayObj.dateStr || '2026-10-09';
                        const lock = getMealLockStatus(dateStr, mealItem.cutoff_time, slot.type, slot.startHour);
                        const status = getRsvpStatus(dateStr, slot.type);
                        const isSkipping = status === 'skipping';

                        if (lock.isLocked) {
                          return (
                            <span
                              title={lock.reason}
                              style={{
                                fontSize: '11px',
                                fontWeight: 650,
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: '#F3F4F6',
                                color: '#6B7280',
                                border: '1px solid #E5E7EB'
                              }}
                            >
                              Cutoff Locked
                            </span>
                          );
                        }

                        return (
                          <button
                            onClick={(e) => handleQuickRsvpToggle(e, slot.type, dateStr)}
                            className={`app-btn app-btn-sm ${isSkipping ? 'app-btn-secondary' : 'app-btn-primary'}`}
                          >
                            {isSkipping ? 'Undo Skip' : 'Skip Meal (+25 Credits)'}
                          </button>
                        );
                      })()}

                      {mealItem && (
                        <button
                          onClick={() => setSelectedEvent({ meal: mealItem, day: weekDays.find(d => d.key === selectedDay) || weekDays[4], slot })}
                          className="app-btn app-btn-secondary app-btn-sm"
                        >
                          <span>Details</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW C: GOOGLE CALENDAR SCHEDULE / AGENDA LIST VIEW                     */}
      {/* ========================================================================= */}
      {calendarView === 'agenda' && (
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {weekDays.map((d) => (
              <div key={d.key} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {/* Day Header Banner */}
                <div style={{
                  padding: '8px 16px',
                  background: d.key === currentDay ? 'var(--primary-subtle)' : '#FAFAF9',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: d.key === currentDay ? 'var(--primary)' : 'var(--text-main)' }}>
                    {d.fullLabel}
                  </span>
                  {d.key === currentDay && (
                    <span className="badge-tag emerald" style={{ fontSize: '10px' }}>Current Day</span>
                  )}
                </div>

                {/* Day Meals List */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {mealSlots.map((slot) => {
                    const mealItem = menuMap[d.key]?.[slot.type];
                    if (!mealItem) return null;
                    return (
                      <div
                        key={slot.type}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '140px 1fr 160px',
                          padding: '10px 16px',
                          borderBottom: '1px solid var(--border-subtle)',
                          alignItems: 'center',
                          gap: '12px',
                          background: isNowActive(d.key, slot.type) ? '#FFFFFF' : 'transparent',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <slot.icon size={13} style={{ color: slot.accentColor }} />
                          <span style={{ fontWeight: 700, fontSize: '12px' }}>{slot.label}</span>
                        </div>

                        <div
                          onClick={() => setSelectedEvent({ meal: mealItem, day: d, slot })}
                          style={{ fontSize: '12.5px', color: 'var(--text-main)', fontWeight: 500, cursor: 'pointer' }}
                        >
                          {mealItem.items}
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {slot.timeSlot.split(/[-–]/)[0].trim()}
                          </span>
                          {canEditMenu && (
                            <button
                              onClick={() => handleOpenEdit(mealItem, d, slot)}
                              className="app-btn app-btn-secondary app-btn-sm"
                              style={{ padding: '3px 8px', fontSize: '10px' }}
                            >
                              <Edit2 size={11} />
                              <span>Edit</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. GOOGLE CALENDAR EVENT DETAIL MODAL (READ-ONLY VIEW)                     */}
      {/* ========================================================================= */}
      {selectedEvent && !editingMeal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(3px)',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '12px',
            maxWidth: '560px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 48px rgba(0,0,0,0.2)',
            border: '1px solid var(--border-subtle)',
            animation: 'fadeIn 0.15s ease'
          }}>
            {/* Modal Header with Event Color */}
            <div style={{
              background: selectedEvent.slot.bgTint,
              borderBottom: `2px solid ${selectedEvent.slot.accentColor}`,
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <selectedEvent.slot.icon size={22} style={{ color: selectedEvent.slot.accentColor }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {selectedEvent.day.label} {selectedEvent.slot.label}
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {selectedEvent.day.fullLabel} • {selectedEvent.slot.timeSlot}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Location & Hall */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <MapPin size={15} style={{ color: 'var(--primary)' }} />
                <span>Central Dining Complex • Ground Floor Dining Hall 1 & 2</span>
              </div>

              {/* Menu Spread Description */}
              <div style={{
                background: 'var(--surface-subtle)',
                borderRadius: '8px',
                padding: '14px 16px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 750, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Menu Items Spread
                </div>
                <div style={{ fontSize: '14px', fontWeight: 650, color: 'var(--text-main)', lineHeight: '1.6' }}>
                  {selectedEvent.meal.items}
                </div>
              </div>

              {/* Nutritional Pulse & Dietary Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Estimated Energy</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '2px', color: selectedEvent.slot.accentColor }}>
                    {selectedEvent.slot.typicalKcal} kcal
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Dietary Classification</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px', color: 'var(--primary)' }}>
                    {selectedEvent.meal.nutritional_tags}
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>RSVP Cutoff</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '3px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                    {formatTime12(selectedEvent.meal.cutoff_time)}
                  </div>
                </div>
              </div>

              {/* Universal Dining Attendance RSVP Action for Students */}
              {isStudent && (() => {
                const dateStr = selectedEvent.day.dateStr || '2026-10-09';
                const lock = getMealLockStatus(dateStr, selectedEvent.meal.cutoff_time, selectedEvent.slot.type, selectedEvent.slot.startHour);
                const currentStatus = getRsvpStatus(dateStr, selectedEvent.slot.type);
                const isSkipping = currentStatus === 'skipping';

                return (
                  <div style={{
                    background: isSkipping ? '#FEF2F2' : 'var(--primary-subtle)',
                    border: `1px solid ${isSkipping ? '#FCA5A5' : 'var(--primary-border)'}`,
                    borderRadius: '8px',
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: isSkipping ? '#B91C1C' : 'var(--primary)' }}>
                          Dining Attendance RSVP
                        </div>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: lock.isLocked ? '#F3F4F6' : '#DCFCE7',
                          color: lock.isLocked ? '#6B7280' : '#15803D'
                        }}>
                          {lock.isLocked ? 'Cutoff Locked' : 'Open for Changes'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '2px', color: isSkipping ? '#991B1B' : 'var(--text-main)' }}>
                        {isSkipping ? 'Status: Skipping (Eating Outside / On Leave)' : 'Status: Attending (Standard Plate)'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {lock.isLocked
                          ? `RSVP window closed 4h before meal service. ${lock.reason}`
                          : (isSkipping
                              ? 'Dining staff notified. +25 Mess Rebate Credits accrued to your hostel account.'
                              : 'Chef will prepare your meal. You can turn off this meal anytime before the cutoff.')}
                      </div>
                    </div>

                    <div>
                      {lock.isLocked ? (
                        <div style={{
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 650,
                          borderRadius: '6px',
                          background: '#F3F4F6',
                          color: '#6B7280',
                          border: '1px solid #E5E7EB',
                          whiteSpace: 'nowrap'
                        }}>
                          Cutoff Passed
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleQuickRsvpToggle(e, selectedEvent.slot.type, dateStr)}
                          className={`app-btn app-btn-sm ${isSkipping ? 'app-btn-secondary' : 'app-btn-primary'}`}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {isSkipping ? 'Undo: Attend Meal' : 'Skip Meal (+25 Credits)'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer Actions */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border-subtle)',
              background: '#FAFAF9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => handleExportIcs(selectedEvent.meal, selectedEvent.day, selectedEvent.slot)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'none'
                  }}
                >
                  <Download size={13} />
                  <span>Export (.ics)</span>
                </button>

                {canEditMenu && (
                  <button
                    onClick={() => handleOpenEdit(selectedEvent.meal, selectedEvent.day, selectedEvent.slot)}
                    className="app-btn app-btn-primary app-btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Edit2 size={12} />
                    <span>Edit Food Items</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="app-btn app-btn-secondary app-btn-sm"
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. GOOGLE CALENDAR EVENT EDITOR MODAL (MESS MANAGER FOOD & MENU EDITOR)   */}
      {/* ========================================================================= */}
      {editingMeal && (
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
          backdropFilter: 'blur(3px)',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '12px',
            maxWidth: '620px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 24px 50px rgba(0,0,0,0.25)',
            border: '1.5px solid var(--primary-border)',
            animation: 'fadeIn 0.15s ease'
          }}>
            {/* Editor Header */}
            <div style={{
              background: 'var(--primary-subtle)',
              borderBottom: '1px solid var(--primary-border)',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ChefHat size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>
                    Edit Menu: {editingMeal.day_of_week.toUpperCase()} {editingMeal.meal_type.toUpperCase()}
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Configure dishes, dietary classification, and cutoff time in the revolving menu ledger
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEditingMeal(null)}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'var(--surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Success Feedback Banner */}
            {editSuccessMsg && (
              <div style={{
                background: '#DCFCE7',
                color: '#15803D',
                padding: '10px 20px',
                fontSize: '12.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: '1px solid #BBF7D0'
              }}>
                <Check size={16} />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            {editErrorMsg && (
              <div style={{
                background: '#FEE2E2',
                color: '#B91C1C',
                padding: '10px 20px',
                fontSize: '12.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: '1px solid #FCA5A5'
              }}>
                <AlertCircle size={16} />
                <span>{editErrorMsg}</span>
              </div>
            )}

            {/* Editor Form */}
            <form onSubmit={handleSaveMenu} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Day & Meal Switcher Pill Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label" style={{ fontSize: '11px' }}>Day of Week</label>
                  <select
                    className="input-field"
                    value={editingMeal.day_of_week}
                    onChange={(e) => setEditingMeal({ ...editingMeal, day_of_week: e.target.value })}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {weekDays.map(d => (
                      <option key={d.key} value={d.key}>{d.fullLabel}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label" style={{ fontSize: '11px' }}>Meal Session</label>
                  <select
                    className="input-field"
                    value={editingMeal.meal_type}
                    onChange={(e) => setEditingMeal({ ...editingMeal, meal_type: e.target.value })}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {mealSlots.map(s => (
                      <option key={s.type} value={s.type}>{s.label} ({s.timeSlot})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} style={{ color: 'var(--accent)' }} />
                  <span>Quick Dish Suggestions (Click to Auto-fill):</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {quickPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditingMeal({
                        ...editingMeal,
                        items: preset.items,
                        nutritional_tags: preset.tag,
                        cutoff_time: preset.cutoff
                      })}
                      style={{
                        fontSize: '10.5px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--surface-subtle)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.background = 'var(--primary-subtle)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.background = 'var(--surface-subtle)';
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dishes Textarea */}
              <div>
                <label className="input-label" style={{ fontSize: '11px' }}>
                  Prepared Dishes & Meal Spread (Comma Separated) *
                </label>
                <textarea
                  rows={3}
                  className="input-field"
                  placeholder="e.g. Paneer Butter Masala, Jeera Rice, Tawa Roti, Dal Makhani, Gulab Jamun"
                  value={editingMeal.items}
                  onChange={(e) => setEditingMeal({ ...editingMeal, items: e.target.value })}
                  required
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              {/* Dietary Tags & Cutoff Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                <div>
                  <label className="input-label" style={{ fontSize: '11px' }}>Dietary Classification</label>
                  <select
                    className="input-field"
                    value={editingMeal.nutritional_tags}
                    onChange={(e) => setEditingMeal({ ...editingMeal, nutritional_tags: e.target.value })}
                  >
                    <option value="Pure Vegetarian">Pure Vegetarian</option>
                    <option value="High Protein">High Protein Special</option>
                    <option value="Special Feast">Special Feast / Celebration</option>
                    <option value="Traditional Breakfast">Traditional Breakfast</option>
                    <option value="Evening Snacks">Evening Snacks</option>
                    <option value="Jain / Satvik Option">Jain / Satvik Option</option>
                    <option value="South Indian Special">South Indian Special</option>
                  </select>
                </div>

                <div>
                  <label className="input-label" style={{ fontSize: '11px' }}>RSVP Cutoff Timing</label>
                  <input
                    type="time"
                    step="1"
                    className="input-field"
                    value={editingMeal.cutoff_time}
                    onChange={(e) => setEditingMeal({ ...editingMeal, cutoff_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Special Feast Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="chkSpecialMeal"
                  checked={editingMeal.is_special}
                  onChange={(e) => setEditingMeal({ ...editingMeal, is_special: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="chkSpecialMeal" style={{ fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  Mark as Feast / Chef Special Meal (Promoted banner across campus)
                </label>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '14px',
                marginTop: '4px'
              }}>
                <button
                  type="button"
                  className="app-btn app-btn-secondary app-btn-sm"
                  onClick={() => setEditingMeal(null)}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="app-btn app-btn-primary app-btn-sm"
                  disabled={isSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={13} />
                  <span>{isSaving ? 'Saving to Database...' : 'Save & Publish Menu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. STUDENT BULK MEAL SKIP & HOSTEL LEAVE MODAL                           */}
      {/* ========================================================================= */}
      {showBulkModal && (
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
          backdropFilter: 'blur(3px)',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '12px',
            maxWidth: '560px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 48px rgba(0,0,0,0.2)',
            border: '1px solid var(--border-subtle)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#FAF9F6'
            }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Bulk Meal Absence & Leave Planner
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Turn off meals in advance for hostel leave or home trips • Accrue ₹25 rebate per skipped meal
                </div>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bulkStatusMsg && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: '#DCFCE7',
                  border: '1px solid #BBF7D0',
                  color: '#15803D',
                  fontSize: '12px',
                  fontWeight: 650
                }}>
                  {bulkStatusMsg}
                </div>
              )}

              {/* Option 1: Skip Weekend */}
              <div style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#FAFAF9'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Skip Upcoming Weekend (Sat Oct 10 & Sun Oct 11)
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    8 Total Meals • Accrues +200 Mess Rebate Credits (₹200)
                  </div>
                </div>

                <button
                  disabled={isBulkSubmitting}
                  onClick={() => handleBulkAction('weekend')}
                  className="app-btn app-btn-primary app-btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {isBulkSubmitting ? 'Saving...' : 'Apply Weekend Skip'}
                </button>
              </div>

              {/* Option 2: Skip Full Week */}
              <div style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#FAFAF9'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Skip Full 7-Day Cycle (Mon Oct 5 – Sun Oct 11)
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    28 Total Meals • Accrues +700 Mess Rebate Credits (₹700)
                  </div>
                </div>

                <button
                  disabled={isBulkSubmitting}
                  onClick={() => handleBulkAction('week')}
                  className="app-btn app-btn-primary app-btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {isBulkSubmitting ? 'Saving...' : 'Apply Week Skip'}
                </button>
              </div>

              {/* Option 3: Restore All to Attending */}
              <div style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#FAFAF9'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Restore All Meals to Attending
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Cancelled your leave? Revert all week meals to standard plates
                  </div>
                </div>

                <button
                  disabled={isBulkSubmitting}
                  onClick={() => handleBulkAction('restore')}
                  className="app-btn app-btn-secondary app-btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {isBulkSubmitting ? 'Saving...' : 'Restore All'}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border-subtle)',
              background: '#FAFAF9',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                className="app-btn app-btn-secondary app-btn-sm"
                onClick={() => setShowBulkModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
