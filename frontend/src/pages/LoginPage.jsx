import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  User,
  KeyRound,
  ArrowRight,
  GraduationCap,
  Layers
} from 'lucide-react';

export default function LoginPage() {
  const { login, demoAccounts, switchPersona } = useAuth();
  const [username, setUsername] = useState('ashish');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify institutional credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (uname) => {
    setUsername(uname);
    setPassword('password123');
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--canvas)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: 'var(--surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-dropdown)',
        padding: '36px',
        overflow: 'hidden'
      }}>
        {/* Institutional Crest and Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--primary)',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 4px 10px rgba(20, 83, 45, 0.2)'
          }}>
            <GraduationCap size={26} />
          </div>

          <div style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: 'var(--primary)',
            textTransform: 'uppercase'
          }}>
            Central University of Technology
          </div>

          <h1 style={{ fontSize: '21px', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Unified Campus ERP
          </h1>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Institutional Single Sign-On • Operating Gateway
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger-text)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: '12px',
            fontWeight: 500,
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Institutional Username or Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. ashish, priya_cr, prof_sharma"
                required
                style={{ width: '100%', paddingLeft: '34px', height: '36px' }}
              />
              <User size={15} style={{ position: 'absolute', left: '11px', top: '11px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Account Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter institutional password"
                required
                style={{ width: '100%', paddingLeft: '34px', height: '36px' }}
              />
              <KeyRound size={15} style={{ position: 'absolute', left: '11px', top: '11px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="app-btn app-btn-primary"
            disabled={isLoading}
            style={{ width: '100%', height: '38px', marginTop: '4px' }}
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate to ERP'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Quick Evaluation Persona Selectors */}
        <div style={{ marginTop: '28px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Evaluation Personas</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>PASS: password123</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => fillCredentials('ashish')}
              className="app-btn app-btn-secondary app-btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: '11px' }}
            >
              Student (Ashish)
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('priya_cr')}
              className="app-btn app-btn-secondary app-btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: '11px' }}
            >
              CR Student (Priya)
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('prof_sharma')}
              className="app-btn app-btn-secondary app-btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: '11px' }}
            >
              Teacher (Prof. Sharma)
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('hod_cse')}
              className="app-btn app-btn-secondary app-btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: '11px' }}
            >
              HOD (Dr. Meenakshi)
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('admin_staff')}
              className="app-btn app-btn-secondary app-btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: '11px' }}
            >
              Admin Staff (Rajesh)
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className="app-btn app-btn-secondary app-btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: '11px' }}
            >
              System Administrator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
