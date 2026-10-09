import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, Tag, UserCheck, CheckCircle2, Clock } from 'lucide-react';

export default function RbacMatrixPage() {
  const { showToast, reloadUser } = useAuth();
  const [roles, setRoles] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick tag assign modal/form state
  const [assignData, setAssignData] = useState({
    user_id: 8, // Default to Ashish
    tag_id: 1,  // Default to CR
    scope_details: 'MCA 1st Semester Section A (Term 2026-27)',
    expires_at: '2027-06-30 23:59:59',
  });
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    loadRbacData();
  }, []);

  const loadRbacData = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, tagsRes] = await Promise.all([
        api.getRoles(),
        api.getTags(),
      ]);
      setRoles(rolesRes?.data?.roles || []);
      setTags(tagsRes?.data?.tags || []);
    } catch (err) {
      console.warn('Error loading RBAC:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTag = async (e) => {
    e.preventDefault();
    setIsAssigning(true);
    try {
      await api.assignTag(assignData);
      showToast('Tag successfully granted to user');
      await loadRbacData();
      await reloadUser();
    } catch (err) {
      showToast(err.message || 'Could not assign tag');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title">Role-Based Access Control (RBAC) & Tag Hierarchy</h1>
            <div className="card-subtitle">
              Configurable institutional authorities, atomic permissions, and time-bound designations
            </div>
          </div>
          <span className="badge badge-success">
            <Shield size={12} />
            Server-Enforced RBAC
          </span>
        </div>

        {/* Conceptual Rule Box */}
        <div style={{
          background: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '24px',
          fontSize: '13px'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
            Core Authorization Architectural Rule (PROJECT.md Section 6 & 7)
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Users receive capabilities via <strong>Base Role + Dynamic Tags + Department Scope</strong>.
            For example, a student tagged as a <strong>Class Representative (CR)</strong> receives
            elevated permissions to dispatch class-targeted notices and create class-level smart forms,
            without being given general administrative or student-directory override rights.
          </p>
        </div>

        {isLoading ? (
          <div className="loading-box">Loading RBAC matrix...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Base Roles List */}
            <div>
              <div style={{
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-secondary)',
                marginBottom: '12px'
              }}>
                1. Institutional Base Roles
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {roles.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 16px',
                      background: '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {r.display_name}
                      </div>
                      <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                        {r.user_count} Users
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {r.description}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'monospace' }}>
                      Code: {r.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Tags List & Assigner */}
            <div>
              <div style={{
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-secondary)',
                marginBottom: '12px'
              }}>
                2. Configurable Tags & Designations
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {tags.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 16px',
                      background: '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Tag size={13} />
                        {t.display_name}
                      </div>
                      <span className="badge badge-tag" style={{ fontSize: '10px' }}>
                        {t.assigned_count} Assigned
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {t.description}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '4px' }}>
                      Injected Permissions: create_form, view_form_submissions, publish_notice
                    </div>
                  </div>
                ))}
              </div>

              {/* Tag Assignment Tool */}
              <div style={{
                border: '1px solid var(--primary-border)',
                background: 'var(--primary-light)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '13px', marginBottom: '8px' }}>
                  Assign Designation Tag to Student
                </div>
                <form onSubmit={handleAssignTag} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                      Target Student
                    </label>
                    <select
                      value={assignData.user_id}
                      onChange={(e) => setAssignData({ ...assignData, user_id: Number(e.target.value) })}
                      style={{ width: '100%', background: '#ffffff' }}
                    >
                      <option value={8}>Ashish Toppo (ashish — 24050101)</option>
                      <option value={9}>Priya Patel (priya_cr — 24050102)</option>
                      <option value={10}>Aarav Verma (aarav_club — 23010145)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                      Designation Tag
                    </label>
                    <select
                      value={assignData.tag_id}
                      onChange={(e) => setAssignData({ ...assignData, tag_id: Number(e.target.value) })}
                      style={{ width: '100%', background: '#ffffff' }}
                    >
                      {tags.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.display_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                      Scope / Batch Definition
                    </label>
                    <input
                      type="text"
                      value={assignData.scope_details}
                      onChange={(e) => setAssignData({ ...assignData, scope_details: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isAssigning}
                    style={{ alignSelf: 'flex-start', marginTop: '4px' }}
                  >
                    <CheckCircle2 size={13} />
                    <span>{isAssigning ? 'Assigning...' : 'Grant Designation'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
