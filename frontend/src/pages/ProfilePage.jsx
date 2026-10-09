import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Lock,
  CheckCircle2,
  Tag,
  GraduationCap,
  Printer
} from 'lucide-react';

export default function ProfilePage() {
  const { user, reloadUser, showToast } = useAuth();
  const profile = user?.profile;
  const isStudent = user?.profile_type === 'student';
  const barcodePattern = [3, 1, 2, 1, 4, 1, 1, 2, 3, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2];

  const [activeTab, setActiveTab] = useState('verified'); // 'verified', 'idcard', 'contact'
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: profile?.phone_number || '',
    personal_email: profile?.personal_email || '',
    blood_group: profile?.blood_group || '',
    parent_phone: profile?.parent_phone || '',
    cabin_location: profile?.cabin_location || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateContact(formData);
      showToast('Contact details successfully updated');
      setIsEditing(false);
      await reloadUser();
    } catch (err) {
      showToast(err.message || 'Could not update contact details');
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="card-panel">
        <h2 style={{ fontSize: '16px', fontWeight: 700 }}>System Administration Service Profile</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
          Authenticated under system supervisor handle <strong>{user?.username}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Golden Rule Announcement */}
      <div className="fill-once-showcase">
        <div className="fill-once-header">
          <CheckCircle2 size={16} />
          <span>Core ERP Principle: Fill Once, Use Everywhere</span>
        </div>
        <p className="fill-once-text">
          This verified institutional identity profile serves as the single source of truth for the entire campus.
          When you fill Smart Forms, apply for Bonafide Certificates, or book examination hall tickets,
          all verified parameters (Roll No, Registration No, Program, Semester) auto-populate with immutable institutional integrity.
        </p>
      </div>

      {/* Profile Master Card */}
      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-subtle)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <GraduationCap size={28} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 800 }}>{profile.full_name}</h1>
                <span className="badge-tag emerald">
                  <CheckCircle2 size={11} />
                  Institutional Verified
                </span>
                {user.tags && user.tags.map(t => (
                  <span key={t.user_tag_id} className="badge-tag terracotta">
                    <Tag size={10} />
                    {t.display_name}
                  </span>
                ))}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {isStudent
                  ? `${profile.program_name} (${profile.program_code}) • Semester ${profile.current_semester} • Section ${profile.section} • Roll: ${profile.roll_number}`
                  : `${profile.designation} • Department of ${profile.department_name}`}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status</span>
            <div style={{ fontWeight: 700, color: '#166534', fontSize: '13px' }}>
              Good Standing (Active)
            </div>
          </div>
        </div>

        {/* Tab Row */}
        <div className="tab-row">
          <button
            onClick={() => setActiveTab('verified')}
            className={`tab-btn ${activeTab === 'verified' ? 'active' : ''}`}
          >
            Verified ERP Attributes
          </button>
          <button
            onClick={() => setActiveTab('idcard')}
            className={`tab-btn ${activeTab === 'idcard' ? 'active' : ''}`}
          >
            Digital Campus Pass (ID Card)
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          >
            Contact & Secondary Details
          </button>
        </div>

        {/* Tab 1: Verified ERP Credentials */}
        {activeTab === 'verified' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {isStudent ? (
                <>
                  <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Institutional Roll Number
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{profile.roll_number}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={10} /> Locked
                      </span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      University Registration Number
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{profile.registration_number}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={10} /> Locked
                      </span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Admission Registry Index
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                      {profile.admission_number}
                    </div>
                  </div>

                  <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Department
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>
                      {profile.department_name} ({profile.department_code})
                    </div>
                  </div>

                  <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Academic Program & Level
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>
                      {profile.program_name} [{profile.degree_level}]
                    </div>
                  </div>

                  <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Semester & Cohort Section
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>
                      Semester {profile.current_semester} • Section {profile.section}
                    </div>
                  </div>

                  <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Hostel Residential Record
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>
                      {profile.hostel_resident ? `${profile.hostel_name} (${profile.room_number})` : 'Day Scholar'}
                    </div>
                  </div>

                  <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Institutional Email
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>
                      {profile.college_email}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Employee Code</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>{profile.employee_code}</div>
                  </div>
                  <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Designation</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>{profile.designation}</div>
                  </div>
                  <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Department</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>{profile.department_name}</div>
                  </div>
                  <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Academic Qualification</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>{profile.qualification}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Digital ID Card Preview */}
        {activeTab === 'idcard' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: '16px' }}>
            <div style={{ width: '100%', maxWidth: '520px' }}>
              <div id="id-card" className="prestige-id-pass">
                <div className="id-pass-top-band">
                  <div>
                    <div className="id-pass-institution">CENTRAL UNIVERSITY OF TECHNOLOGY</div>
                    <div className="id-pass-subtag">INSTITUTION OF EMINENCE • OFFICIAL DIGITAL IDENTITY PASS</div>
                  </div>

                  <div className="id-pass-seal-watermark">
                    CUT
                  </div>
                </div>

                <div className="id-pass-main-grid">
                  <div className="id-pass-portrait-frame">
                    <GraduationCap size={36} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px' }}>
                      {isStudent ? 'STUDENT' : 'FACULTY'}
                    </span>
                    <span className="id-pass-verified-seal">VERIFIED</span>
                  </div>

                  <div className="id-pass-info-block">
                    <div className="id-pass-name">
                      {profile?.full_name || user?.username}
                    </div>
                    <div className="id-pass-role-title">
                      {isStudent ? (profile?.program_name || 'Master of Computer Applications') : profile?.designation}
                    </div>

                    <div className="id-pass-field-grid">
                      <div>
                        <div className="id-pass-field-label">{isStudent ? 'Roll Number' : 'Employee ID'}</div>
                        <div className="id-pass-field-value">{profile?.roll_number || profile?.employee_code || '24050101'}</div>
                      </div>
                      <div>
                        <div className="id-pass-field-label">Registration No</div>
                        <div className="id-pass-field-value">{profile?.registration_number || (isStudent ? 'REG2024MCA088' : 'STAFF')}</div>
                      </div>
                      <div>
                        <div className="id-pass-field-label">{isStudent ? 'Cohort / Dept' : 'Department'}</div>
                        <div className="id-pass-field-value">
                          {isStudent ? `${profile?.department_code || 'CSE'} • Sem ${profile?.current_semester || 6} (${profile?.section || 'A'})` : profile?.department_name}
                        </div>
                      </div>
                      <div>
                        <div className="id-pass-field-label">Blood Group</div>
                        <div className="id-pass-field-value">{profile?.blood_group || 'B+'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="id-pass-security-footer">
                  <div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Permanent Residence
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {isStudent
                        ? (profile?.hostel_resident ? `${profile?.hostel_name} (${profile?.room_number})` : 'Day Scholar')
                        : (profile?.cabin_location || 'Admin Wing Room 104')}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="barcode-svg-container">
                      {barcodePattern.map((width, i) => (
                        <div
                          key={i}
                          className="barcode-bar"
                          style={{ width: `${width}px` }}
                        />
                      ))}
                    </div>
                    <div style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '2px' }}>
                      CUT-{isStudent ? profile?.roll_number : profile?.employee_code}-VRF
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="app-btn app-btn-secondary app-btn-sm"
                onClick={() => window.print()}
              >
                <Printer size={13} />
                <span>Print Physical ID Card Pass</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Secondary Contact Updates */}
        {activeTab === 'contact' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Contact & Communication Directory</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Maintain personal phone numbers and emergency contacts
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="app-btn app-btn-secondary"
                >
                  Edit Contact Information
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveContact} style={{ background: 'var(--surface-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Personal Mobile Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Personal Email
                    </label>
                    <input
                      type="email"
                      value={formData.personal_email}
                      onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Parent / Guardian Phone
                    </label>
                    <input
                      type="text"
                      value={formData.parent_phone}
                      onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Blood Group
                    </label>
                    <input
                      type="text"
                      value={formData.blood_group}
                      onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="app-btn app-btn-secondary app-btn-sm"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="app-btn app-btn-primary app-btn-sm"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving Updates...' : 'Save Updates'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Personal Mobile</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>{profile.phone_number || 'Not provided'}</div>
                </div>

                <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Personal Email</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>{profile.personal_email || 'Not provided'}</div>
                </div>

                <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Parent / Emergency Contact</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>{profile.guardian_name || profile.father_name || 'N/A'} ({profile.parent_phone || 'N/A'})</div>
                </div>

                <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Blood Group</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>{profile.blood_group || 'O+'}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
