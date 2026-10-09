import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';
import { Phone, Delete, Send, RefreshCw, Smartphone, ShieldCheck } from 'lucide-react';

export default function FeaturePhonePage() {
  const { user, showToast } = useAuth();
  const { t } = useAccessibility();

  const [dialInput, setDialInput] = useState('');
  const [screenText, setScreenText] = useState(
    "=== BPUT CAMPUS TELECOM (USSD) ===\n" +
    "Welcome, Ashish Toppo\n" +
    "1. Active Gatepass Code\n" +
    "2. Today's Mess Menu\n" +
    "3. 75% Attendance Health\n" +
    "4. Hostel Curfew Alert\n" +
    "Send 1-4:"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [studentRoll, setStudentRoll] = useState('2101289045');

  const handleSend = async (queryOverride) => {
    const query = queryOverride !== undefined ? queryOverride : (dialInput.trim() || '*123#');
    setIsProcessing(true);
    try {
      const res = await api.processUssd({
        dial_string: query,
        roll_number: studentRoll
      });
      if (res?.data?.ussd_response) {
        setScreenText(res.data.ussd_response);
      }
      setDialInput('');
    } catch (err) {
      showToast(err.message || 'USSD Network Timeout');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (char) => {
    setDialInput(prev => prev + char);
  };

  const handleClear = () => {
    setDialInput(prev => prev.slice(0, -1));
  };

  const handleReset = () => {
    setDialInput('');
    handleSend('*123#');
  };

  return (
    <div>
      {/* 1. Institutional Masthead */}
      <div className="dash-masthead">
        <div>
          <div className="dash-masthead-ribbon">
            <span className="pulse-dot"></span>
            <span>Accessibility & Inclusion • 100% Software Telecom Simulation • Zero Hardware Cost</span>
          </div>
          <h1 className="dash-masthead-title">{t('featurePhoneUssd')}</h1>
          <div className="dash-masthead-sub">
            Demonstrates real digital inclusion for students without smartphones, dead batteries, or shattered screens via standard GSM USSD cellular protocol emulation.
          </div>
        </div>

        <div className="dash-masthead-actions">
          <button className="app-btn app-btn-secondary app-btn-sm" onClick={handleReset}>
            <RefreshCw size={13} />
            <span>Reset Dialer</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px', alignItems: 'start' }}>
        {/* The Feature Phone Simulator Frame */}
        <div>
          <div className="feature-phone-wrapper">
            <div className="feature-phone-speaker" />

            {/* Simulated LCD Screen */}
            <div className="feature-phone-screen">
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #14532d', paddingBottom: '4px', marginBottom: '8px', fontSize: '10px' }}>
                <span>AIRTEL 2G</span>
                <span>BATTERY 92%</span>
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{screenText}</div>
              {dialInput ? (
                <div style={{ marginTop: '10px', fontWeight: 800, borderTop: '1px dashed #14532d', paddingTop: '4px' }}>
                  Input: {dialInput}
                </div>
              ) : (
                <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7, borderTop: '1px dashed #14532d', paddingTop: '4px' }}>
                  {screenText.includes('Send 1-4') ? 'Type 1-4 on keypad & press SEND' : 'Dial *123# for Main Menu'}
                </div>
              )}
            </div>

            {/* Quick Action Dial Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                className="feature-key"
                style={{ flex: 1, background: '#14532d', borderColor: '#166534', color: '#ffffff' }}
                onClick={() => handleSend()}
                disabled={isProcessing}
              >
                <Send size={14} />
                <span style={{ fontSize: '10px', marginTop: '2px' }}>SEND</span>
              </button>

              <button
                className="feature-key"
                style={{ flex: 1, background: '#991b1b', borderColor: '#b91c1c', color: '#ffffff' }}
                onClick={handleClear}
              >
                <Delete size={14} />
                <span style={{ fontSize: '10px', marginTop: '2px' }}>CLEAR</span>
              </button>
            </div>

            {/* Physical Keypad Grid */}
            <div className="feature-phone-keypad">
              {[
                { k: '1', sub: '.,-' },
                { k: '2', sub: 'ABC' },
                { k: '3', sub: 'DEF' },
                { k: '4', sub: 'GHI' },
                { k: '5', sub: 'JKL' },
                { k: '6', sub: 'MNO' },
                { k: '7', sub: 'PQRS' },
                { k: '8', sub: 'TUV' },
                { k: '9', sub: 'WXYZ' },
                { k: '*', sub: 'PWR' },
                { k: '0', sub: 'SPACE' },
                { k: '#', sub: 'SYM' },
              ].map(({ k, sub }) => (
                <button
                  key={k}
                  className="feature-key"
                  onClick={() => handleKeyPress(k)}
                >
                  <span>{k}</span>
                  <span className="feature-key-sub">{sub}</span>
                </button>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button
                onClick={handleReset}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#a1a1aa',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Reset to Main Menu (*123#)
              </button>
            </div>
          </div>
        </div>

        {/* Explanatory Walkthrough for Hackathon Judges */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <div>
              <h3 className="dash-panel-title">Why This Feature Clinches Top 5</h3>
              <div className="dash-panel-subtitle">
                Addressing Deliverable #4 in Problem Statement 07: Real inclusion for students without smartphones.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ background: 'var(--primary-subtle)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-border)' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary)' }}>
                The Ground Reality in Regional Campuses
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.6' }}>
                When college systems require an iPhone or high-end Android app, students whose phones run out of charge, suffer broken screens, or who use a ₹1,000 basic feature phone are shut out.
                Instead of requiring colleges to purchase expensive touch kiosks, our system exposes standard cellular USSD protocols.
              </p>
            </div>

            <div>
              <label className="input-label">Inspect As Student Roll Number</label>
              <input
                type="text"
                className="input-field"
                value={studentRoll}
                onChange={(e) => setStudentRoll(e.target.value)}
                placeholder="2101289045"
              />
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
                Try These Live Evaluation Shortcuts:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  className="app-btn app-btn-secondary"
                  onClick={() => handleSend('*123*1#')}
                  style={{ justifyContent: 'space-between', padding: '10px 14px' }}
                >
                  <span style={{ fontWeight: 600 }}>Option 1: Retrieve 4-Digit Gatepass Code</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>*123*1#</span>
                </button>

                <button
                  className="app-btn app-btn-secondary"
                  onClick={() => handleSend('*123*2#')}
                  style={{ justifyContent: 'space-between', padding: '10px 14px' }}
                >
                  <span style={{ fontWeight: 600 }}>Option 2: Query Tonight's Mess Menu</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>*123*2#</span>
                </button>

                <button
                  className="app-btn app-btn-secondary"
                  onClick={() => handleSend('*123*3#')}
                  style={{ justifyContent: 'space-between', padding: '10px 14px' }}
                >
                  <span style={{ fontWeight: 600 }}>Option 3: Verify 75% Statutory Attendance</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>*123*3#</span>
                </button>

                <button
                  className="app-btn app-btn-secondary"
                  onClick={() => handleSend('*123*4#')}
                  style={{ justifyContent: 'space-between', padding: '10px 14px' }}
                >
                  <span style={{ fontWeight: 600 }}>Option 4: Hostel Curfew & Warden Helpline</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>*123*4#</span>
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
              Security Note: The 4-digit security code generated via USSD can be entered directly by the Security Guard at the Main Gate Terminal without any smartphone QR camera required.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
