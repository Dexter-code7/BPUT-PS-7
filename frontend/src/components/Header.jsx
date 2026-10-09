import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Tag,
  UserCheck,
  Check,
  Layers,
  GraduationCap,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function Header() {
  const { user, demoAccounts, switchPersona, logout } = useAuth();
  const { language, setLanguage, lowBandwidth, setLowBandwidth, t } = useAccessibility();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [personaSearch, setPersonaSearch] = useState('');
  const dropdownRef = useRef(null);

  const filteredPersonas = demoAccounts.filter((acc) => {
    if (!personaSearch.trim()) return true;
    const q = personaSearch.toLowerCase();
    return (
      acc.full_name?.toLowerCase().includes(q) ||
      acc.role_label?.toLowerCase().includes(q) ||
      acc.role_name?.toLowerCase().includes(q) ||
      acc.username?.toLowerCase().includes(q)
    );
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = (user.profile?.full_name || user.username)
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="app-header">
      {/* Brand Section */}
      <div className="brand-wrapper">
        <div className="university-seal">
          CUT
        </div>
        <div className="brand-info">
          <span className="brand-title">CENTRAL UNIVERSITY OF TECHNOLOGY</span>
          <span className="brand-term-tag">CAMPUS OPERATING SYSTEM • AUTUMN 2026–2027</span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="header-center">
        <div className="header-search" style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search records, notices, roster..."
            readOnly
            style={{ paddingRight: '48px' }}
          />
          <kbd style={{
            position: 'absolute',
            right: '8px',
            top: '7px',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            background: 'var(--surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: '3px',
            padding: '1px 5px'
          }}>
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Trilingual Language Selector (EN / HI / ODIA) */}
        <div style={{
          display: 'flex',
          background: 'var(--surface-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '2px'
        }}>
          {[
            { code: 'en', label: 'EN' },
            { code: 'hi', label: 'HI' },
            { code: 'or', label: 'ଓଡ଼ି' }
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              style={{
                border: 'none',
                background: language === lang.code ? 'var(--primary)' : 'transparent',
                color: language === lang.code ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
              title={`Switch language to ${lang.label}`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* 2G Low-Bandwidth Mode Toggle */}
        <button
          className="app-btn app-btn-secondary"
          onClick={() => setLowBandwidth(!lowBandwidth)}
          style={{
            fontSize: '11px',
            padding: '4px 8px',
            background: lowBandwidth ? '#fef3c7' : 'inherit',
            borderColor: lowBandwidth ? '#fde68a' : 'var(--border-subtle)',
            color: lowBandwidth ? '#92400e' : 'var(--text-secondary)'
          }}
          title="Toggle 2G Low-Bandwidth Mode for Patchy Hostel Networks"
        >
          {lowBandwidth ? <WifiOff size={13} /> : <Wifi size={13} />}
          <span>{lowBandwidth ? '2G Saver ON' : '2G Mode'}</span>
        </button>

        {/* Active Tag Badge if present */}
        {user.tags && user.tags.length > 0 && (
          <span className="badge-tag terracotta" style={{ fontSize: '11px' }}>
            <Tag size={11} />
            {user.tags.map(t => t.display_name).join(', ')}
          </span>
        )}

        {/* Notifications Icon */}
        <button
          className="app-btn app-btn-secondary"
          style={{ width: '32px', height: '32px', padding: 0, position: 'relative' }}
          title="Campus Notifications"
        >
          <Bell size={15} style={{ color: 'var(--text-secondary)' }} />
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--accent)'
          }} />
        </button>

        {/* User Account / Persona Trigger */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className="user-menu-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
          >
            <div className="user-avatar-initials">
              {initials}
            </div>
            <div className="user-menu-meta">
              <div className="user-menu-name">
                {user.profile?.full_name || user.username}
              </div>
              <div className="user-menu-role">
                {user.role_label}
              </div>
            </div>
            <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Persona & Account Dropdown Modal */}
          {dropdownOpen && (
            <div className="persona-dropdown-modal">
              <div className="persona-dropdown-header">
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>
                    {user.profile?.full_name || user.username}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {user.email}
                  </div>
                </div>
                <span className="badge-tag success" style={{ fontSize: '10px' }}>
                  {user.role_name.toUpperCase()}
                </span>
              </div>

              <div className="persona-section-title">
                <span>Evaluation Persona Switcher</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {filteredPersonas.length} Accounts
                </span>
              </div>

              <div style={{ marginBottom: '8px', flexShrink: 0 }}>
                <input
                  type="text"
                  placeholder="Quick filter (e.g. mess, warden, student)..."
                  value={personaSearch}
                  onChange={(e) => setPersonaSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '5px 10px',
                    fontSize: '11.5px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div className="persona-list">
                {filteredPersonas.map((acc) => {
                  const accId = acc.user_id || acc.id;
                  const isCurrent = accId === user.id;
                  return (
                    <button
                      key={accId}
                      className={`persona-item-btn ${isCurrent ? 'selected' : ''}`}
                      onClick={() => {
                        setDropdownOpen(false);
                        setPersonaSearch('');
                        switchPersona(accId);
                      }}
                    >
                      <div className="persona-btn-avatar">
                        {acc.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="persona-btn-info">
                        <div className="persona-btn-name">
                          {acc.full_name}
                        </div>
                        <div className="persona-btn-meta">
                          {acc.role_label} {acc.tag_label ? `• ${acc.tag_label}` : ''}
                        </div>
                      </div>
                      {isCurrent && (
                        <Check size={14} style={{ color: 'var(--primary)', marginLeft: 'auto' }} />
                      )}
                    </button>
                  );
                })}
                {filteredPersonas.length === 0 && (
                  <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    No matching persona found
                  </div>
                )}
              </div>

              <div className="persona-dropdown-footer">
                <button
                  className="logout-action-btn"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={13} />
                  <span>Terminate Session (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
