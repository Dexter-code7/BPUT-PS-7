import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  FileSpreadsheet,
  Lock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  FileCheck,
  Download,
  Eye,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  ChevronDown,
  Layers,
  Send,
  X,
  User,
  GraduationCap,
  Building2,
  Check
} from 'lucide-react';

export default function FormsPage() {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [erpDictionary, setErpDictionary] = useState({});
  const [canCreate, setCanCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Modals / Views
  const [activeFormDetail, setActiveFormDetail] = useState(null); // For filling or previewing
  const [answeringForm, setAnsweringForm] = useState(false);
  const [submittingAnswers, setSubmittingAnswers] = useState({});
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submissions Manager View
  const [viewingSubmissions, setViewingSubmissions] = useState(null);
  const [submissionsData, setSubmissionsData] = useState(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [inspectedSubmission, setInspectedSubmission] = useState(null);

  // Form Builder View
  const [isBuildingForm, setIsBuildingForm] = useState(false);
  const [newForm, setNewForm] = useState({
    title: '',
    description: '',
    category: 'Academic',
    target_scope: 'all',
    allow_multiple_submissions: false,
    erp_fields: ['full_name', 'roll_number', 'program_name', 'current_semester', 'college_email'],
    fields: [
      { label: 'Reason for Application / Inquiry', field_type: 'textarea', help_text: 'Provide relevant context or explanation', options: [], is_required: true }
    ]
  });
  const [savingForm, setSavingForm] = useState(false);

  // Determine whether current user is permitted to create forms (everyone except regular student)
  const isRegularStudent = user?.role_name === 'student' && !user?.tags?.some(t => t.name === 'class_representative');
  const userCanCreate = canCreate || (!isRegularStudent && Boolean(user));

  // Load Forms
  const loadForms = async () => {
    setIsLoading(true);
    try {
      const res = await api.getForms({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: searchQuery.trim() || undefined
      });
      if (res.success) {
        setForms(res.data.forms || []);
        setCanCreate(Boolean(res.data.can_create));
        if (res.data.erp_dictionary) {
          setErpDictionary(res.data.erp_dictionary);
        }
      }
    } catch (err) {
      console.error('Failed to load forms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, [categoryFilter, user?.id]);


  // Search handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadForms();
  };

  // Open Form to Fill / View
  const handleOpenForm = async (formId) => {
    setActiveFormDetail(null);
    setSubmissionSuccess(null);
    setSubmittingAnswers({});
    setAnsweringForm(true);

    try {
      const res = await api.getFormDetail(formId);
      if (res.success) {
        setActiveFormDetail(res.data);
        // Pre-fill answers if existing
        if (res.data.existing_submission?.answers) {
          setSubmittingAnswers(res.data.existing_submission.answers);
        }
      }
    } catch (err) {
      alert(err.message || 'Error opening form');
      setAnsweringForm(false);
    }
  };

  // Submit Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!activeFormDetail?.form) return;

    // Validate required fields
    for (const fld of activeFormDetail.fields || []) {
      if (fld.is_required) {
        const val = submittingAnswers[fld.field_key];
        if (val === undefined || val === null || val === '') {
          alert(`Please fill in required field: ${fld.label}`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitForm({
        form_id: activeFormDetail.form.id,
        answers: submittingAnswers
      });
      if (res.success) {
        setSubmissionSuccess(res.data);
        loadForms(); // refresh status
      }
    } catch (err) {
      alert(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Submissions Viewer
  const handleOpenSubmissions = async (formId) => {
    setViewingSubmissions(formId);
    setLoadingSubmissions(true);
    setSubmissionsData(null);
    setInspectedSubmission(null);

    try {
      const res = await api.getSubmissions(formId);
      if (res.success) {
        setSubmissionsData(res.data);
      }
    } catch (err) {
      alert(err.message || 'Error loading submissions');
      setViewingSubmissions(null);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Form Builder Field Handlers
  const toggleErpField = (key) => {
    setNewForm(prev => {
      const exists = prev.erp_fields.includes(key);
      const updated = exists ? prev.erp_fields.filter(k => k !== key) : [...prev.erp_fields, key];
      return { ...prev, erp_fields: updated };
    });
  };

  const addCustomQuestion = () => {
    setNewForm(prev => ({
      ...prev,
      fields: [
        ...prev.fields,
        { label: '', field_type: 'text', help_text: '', options: [], is_required: true }
      ]
    }));
  };

  const updateCustomQuestion = (index, key, val) => {
    setNewForm(prev => {
      const copy = [...prev.fields];
      copy[index] = { ...copy[index], [key]: val };
      return { ...prev, fields: copy };
    });
  };

  const removeCustomQuestion = (index) => {
    setNewForm(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const handleSaveNewForm = async (e) => {
    e.preventDefault();
    if (!newForm.title.trim()) {
      alert('Please enter a form title.');
      return;
    }
    if (newForm.erp_fields.length === 0 && newForm.fields.length === 0) {
      alert('Please select at least one ERP field or add one custom question.');
      return;
    }

    setSavingForm(true);
    try {
      const res = await api.createForm(newForm);
      if (res.success) {
        setIsBuildingForm(false);
        loadForms();
        alert('Smart Form published successfully!');
      }
    } catch (err) {
      alert(err.message || 'Failed to create form');
    } finally {
      setSavingForm(false);
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="dash-masthead">
        <div>
          <div className="dash-masthead-ribbon">
            <span className="pulse-dot" />
            <span>Smart Forms Engine • Institutional Data Bridge • "Fill Once, Use Everywhere"</span>
          </div>

          <h1 className="dash-masthead-title">
            Campus Smart Forms & Applications
          </h1>

          <div className="dash-masthead-sub">
            Verified ERP profile fields are automatically locked and inherited. Students fill only new questions; administrators obtain clean, structured datasets.
          </div>
        </div>

        <div className="dash-masthead-actions">
          {userCanCreate && (
            <button
              onClick={() => setIsBuildingForm(true)}
              className="app-btn app-btn-primary"
            >
              <Plus size={15} />
              <span>Design Smart Form</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="table-controls" style={{ borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'Scholarship', 'Academic', 'Hostel', 'General'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`app-btn ${categoryFilter === cat ? 'app-btn-primary' : 'app-btn-secondary'} app-btn-sm`}
            >
              {cat === 'all' ? 'All Applications' : cat}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search forms by title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '240px' }}
          />
          <button type="submit" className="app-btn app-btn-secondary app-btn-sm">
            <Search size={13} />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Forms Card Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading institutional smart forms...
        </div>
      ) : forms.length === 0 ? (
        <div className="dash-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <FileSpreadsheet size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>No Smart Forms Found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            There are no active smart forms published matching the selected criteria.
          </p>
          {userCanCreate && (
            <button
              onClick={() => setIsBuildingForm(true)}
              className="app-btn app-btn-primary"
              style={{ marginTop: '16px' }}
            >
              <Plus size={15} />
              <span>Design Smart Form</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '18px' }}>
          {forms.map(form => {
            const isCreatorOrAdmin = user?.id === form.creator_id || user?.role_name === 'system_admin';
            return (
              <div
                key={form.id}
                className="dash-panel"
                style={{
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: form.category === 'Scholarship' ? '3px solid var(--primary)' : form.category === 'Hostel' ? '3px solid #d97706' : '3px solid var(--accent)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className={`badge-tag ${form.category === 'Scholarship' ? 'emerald' : form.category === 'Hostel' ? 'amber' : 'terracotta'}`}>
                      {form.category}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge-tag neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                        ID: #{form.id}
                      </span>
                      {form.has_submitted && (
                        <span className="badge-tag emerald">
                          <CheckCircle2 size={11} />
                          Submitted
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
                    {form.title}
                  </h3>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                    {form.description}
                  </p>

                  <div style={{
                    marginTop: '12px',
                    padding: '10px',
                    background: 'var(--surface-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Created By:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{form.creator_name} ({form.creator_role})</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Auto-Locked ERP Fields:</span>
                      <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                        {form.erp_fields?.length || 0} Fields 🔒
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Submissions Received:</span>
                      <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                        {form.submission_count} Submissions
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                  {/* Action 1: Fill Form / View Submission */}
                  <button
                    onClick={() => handleOpenForm(form.id)}
                    className={`app-btn ${form.has_submitted ? 'app-btn-secondary' : 'app-btn-primary'}`}
                    style={{ flex: 1, fontSize: '12px' }}
                  >
                    {form.has_submitted ? (
                      <>
                        <Eye size={13} />
                        <span>View Submission</span>
                      </>
                    ) : (
                      <>
                        <Lock size={13} />
                        <span>Fill Application</span>
                      </>
                    )}
                  </button>

                  {/* Action 2: Submissions (for author/admin) */}
                  {isCreatorOrAdmin && (
                    <button
                      onClick={() => handleOpenSubmissions(form.id)}
                      className="app-btn app-btn-secondary"
                      style={{ fontSize: '12px' }}
                      title="View all student submissions & export CSV"
                    >
                      <FileCheck size={13} />
                      <span>Responses ({form.submission_count})</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: GOOGLE FORM STYLE INSTITUTIONAL APPLICATION ENGINE
          ========================================================================= */}
      {/* =========================================================================
          MODAL 1: GOOGLE FORM STYLE INSTITUTIONAL APPLICATION ENGINE
          ========================================================================= */}
      {answeringForm && activeFormDetail && (
        <div className="gform-modal-overlay">
          {/* Top Document Bar like Google Forms */}
          <div className="gform-top-nav">
            <div className="gform-nav-left">
              <div className="gform-nav-logo">
                <FileSpreadsheet size={22} style={{ color: '#14532D' }} />
                <span>Central University Forms</span>
              </div>
              <div className="gform-nav-title">
                {activeFormDetail.form.title}
              </div>
            </div>

            <div className="gform-nav-right">
              <span style={{ fontSize: '12px', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} style={{ color: '#14532D' }} />
                ERP Verified
              </span>
              <button
                type="button"
                onClick={() => setAnsweringForm(false)}
                className="gform-close-btn"
                title="Close Form"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="gform-container">
            {submissionSuccess ? (
              /* Success Confirmation Card (Google Forms Style) */
              <div className="gform-card gform-card-header" style={{ textAlign: 'center', padding: '48px 32px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(20, 83, 45, 0.1)',
                  color: '#14532D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px'
                }}>
                  <CheckCircle2 size={40} />
                </div>

                <h1 style={{ fontSize: '26px', fontWeight: 500, color: '#202124', marginBottom: '10px' }}>
                  Your response has been recorded.
                </h1>

                <p style={{ fontSize: '14px', color: '#5f6368', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 24px auto' }}>
                  Your submission has been registered with official institutional verification. Pre-filled ERP identity credentials were cryptographically sealed with this submission.
                </p>

                <div style={{
                  background: '#F9FAF8',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  padding: '12px 18px',
                  maxWidth: '380px',
                  margin: '0 auto 28px auto',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <div style={{ color: '#202124', fontWeight: 600 }}>Reference: CUT-FORM-SUB-#{submissionSuccess.submission_id}</div>
                  <div style={{ color: '#6B7280', marginTop: '3px' }}>Recorded At: {submissionSuccess.submitted_at || 'Just now'}</div>
                </div>

                <div>
                  <button
                    onClick={() => setAnsweringForm(false)}
                    className="gform-submit-btn"
                  >
                    Done & Return to Forms
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 1. Google Forms Header Card */}
                <div className="gform-card gform-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className="badge-tag emerald" style={{ fontSize: '11px' }}>
                      <ShieldCheck size={11} />
                      Verified Institutional Form
                    </span>
                    <span style={{ fontSize: '12px', color: '#5f6368' }}>
                      Category: <strong>{activeFormDetail.form.category}</strong>
                    </span>
                  </div>

                  <h1 className="gform-card-title">
                    {activeFormDetail.form.title}
                  </h1>

                  {activeFormDetail.form.description && (
                    <div className="gform-card-desc">
                      {activeFormDetail.form.description}
                    </div>
                  )}

                  {/* Google Forms Account Strip */}
                  <div className="gform-account-strip">
                    <div className="gform-account-row">
                      <div>
                        <span className="gform-account-email">
                          {user?.email || 'student@campus.edu'}
                        </span>
                        <span className="gform-switch-link" style={{ marginLeft: '10px' }}>
                          Switch account
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5f6368', fontSize: '12px' }}>
                        <Check size={13} style={{ color: '#14532D' }} />
                        Draft saved
                      </div>
                    </div>

                    <div className="gform-account-notice">
                      The name, email address, and verified academic record associated with your institutional profile will be recorded when you submit this form.
                    </div>

                    <div className="gform-required-note">
                      * Indicates required question
                    </div>
                  </div>
                </div>

                {/* 2. Pre-filled Institutional ERP Question Cards (Google Forms Style) */}
                {Object.values(activeFormDetail.locked_erp_values || {}).map((field) => (
                  <div key={field.key} className="gform-card">
                    <div className="gform-question-title">
                      <span>
                        {field.label}
                        <span className="gform-required-star">*</span>
                      </span>
                      <span className="gform-prefilled-badge">
                        <Lock size={11} />
                        Auto-filled from ERP
                      </span>
                    </div>

                    <div className="gform-question-help">
                      Official student registry record verified by Central Registrar
                    </div>

                    <div className="gform-prefilled-box">
                      <span className="gform-prefilled-val">
                        {field.value || 'Verified Record on File'}
                      </span>
                      <span className="gform-prefilled-note">
                        <Lock size={12} />
                        Locked
                      </span>
                    </div>
                  </div>
                ))}

                {/* 3. Custom Questions Cards (Google Forms Style) */}
                {activeFormDetail.fields?.map((fld) => {
                  const isReadonly = Boolean(activeFormDetail.existing_submission);
                  const currentVal = submittingAnswers[fld.field_key] || '';

                  return (
                    <div key={fld.id} className="gform-card">
                      <div className="gform-question-title">
                        <span>
                          {fld.label}
                          {fld.is_required && <span className="gform-required-star">*</span>}
                        </span>
                      </div>

                      {fld.help_text && (
                        <div className="gform-question-help">
                          {fld.help_text}
                        </div>
                      )}

                      {/* Google Forms Inputs */}
                      {fld.field_type === 'textarea' ? (
                        <div className="gform-underline-wrap">
                          <textarea
                            rows={3}
                            required={fld.is_required}
                            disabled={isReadonly}
                            value={currentVal}
                            onChange={e => setSubmittingAnswers({ ...submittingAnswers, [fld.field_key]: e.target.value })}
                            placeholder="Your answer"
                            className="gform-underline-input"
                            style={{ resize: 'vertical' }}
                          />
                        </div>
                      ) : fld.field_type === 'select' ? (
                        <div style={{ marginTop: '8px' }}>
                          <select
                            required={fld.is_required}
                            disabled={isReadonly}
                            value={currentVal}
                            onChange={e => setSubmittingAnswers({ ...submittingAnswers, [fld.field_key]: e.target.value })}
                            className="gform-select-input"
                          >
                            <option value="">Choose</option>
                            {fld.options?.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      ) : fld.field_type === 'radio' ? (
                        <div className="gform-options-list">
                          {fld.options?.map((opt, i) => (
                            <label key={i} className="gform-radio-label">
                              <input
                                type="radio"
                                name={fld.field_key}
                                value={opt}
                                disabled={isReadonly}
                                checked={currentVal === opt}
                                onChange={() => setSubmittingAnswers({ ...submittingAnswers, [fld.field_key]: opt })}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : fld.field_type === 'consent' ? (
                        <div className="gform-options-list">
                          <label className="gform-checkbox-label">
                            <input
                              type="checkbox"
                              required={fld.is_required}
                              disabled={isReadonly}
                              checked={Boolean(currentVal)}
                              onChange={e => setSubmittingAnswers({ ...submittingAnswers, [fld.field_key]: e.target.checked })}
                            />
                            <span>{fld.label}</span>
                          </label>
                        </div>
                      ) : fld.field_type === 'date' ? (
                        <div style={{ marginTop: '8px' }}>
                          <input
                            type="date"
                            required={fld.is_required}
                            disabled={isReadonly}
                            value={currentVal}
                            onChange={e => setSubmittingAnswers({ ...submittingAnswers, [fld.field_key]: e.target.value })}
                            className="gform-date-input"
                          />
                        </div>
                      ) : (
                        <div className="gform-underline-wrap">
                          <input
                            type={fld.field_type === 'number' ? 'number' : 'text'}
                            required={fld.is_required}
                            disabled={isReadonly}
                            value={currentVal}
                            onChange={e => setSubmittingAnswers({ ...submittingAnswers, [fld.field_key]: e.target.value })}
                            placeholder="Your answer"
                            className="gform-underline-input"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 4. Google Form Actions Bar */}
                <div className="gform-actions-row">
                  {!activeFormDetail.existing_submission ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="gform-submit-btn"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSubmittingAnswers({})}
                        className="gform-clear-btn"
                      >
                        Clear form
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge-tag emerald" style={{ padding: '8px 14px', fontSize: '13px' }}>
                        <CheckCircle2 size={14} />
                        Response Registered in ERP
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setAnsweringForm(false)}
                    className="gform-clear-btn"
                  >
                    Exit to Forms
                  </button>
                </div>

                {/* 5. Google Form Footer Disclaimer */}
                <div className="gform-footer">
                  <div className="gform-footer-warning">
                    Never submit passwords through Central University of Technology Forms.
                  </div>
                  <div className="gform-footer-links">
                    Report Abuse — Terms of Service — Institutional Data Policy
                  </div>
                  <div className="gform-footer-logo">
                    <strong>Central University</strong> of Technology Forms
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}


      {/* =========================================================================
          MODAL 2: SUBMISSIONS & EXPORT DASHBOARD (For Author & Admin)
          ========================================================================= */}
      {viewingSubmissions && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(20, 31, 23, 0.55)',
          backdropFilter: 'blur(2px)',
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
            maxWidth: '1050px',
            maxHeight: '90vh',
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
                <span className="badge-tag emerald" style={{ marginBottom: '4px' }}>
                  Submissions Analytics & Export Desk
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {submissionsData?.form?.title || 'Form Submissions'}
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <a
                  href={api.getExportCsvUrl(viewingSubmissions)}
                  target="_blank"
                  rel="noreferrer"
                  className="app-btn app-btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  <Download size={14} />
                  <span>Download Official CSV</span>
                </a>

                <button
                  onClick={() => setViewingSubmissions(null)}
                  className="app-btn app-btn-secondary"
                  style={{ width: '32px', height: '32px', padding: 0 }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Table Area */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {loadingSubmissions ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Loading submissions data...
                </div>
              ) : submissionsData?.submissions?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                  <FileSpreadsheet size={36} style={{ margin: '0 auto 12px' }} />
                  <p>No student submissions have been recorded for this form yet.</p>
                </div>
              ) : (
                <div className="data-table-container">
                  <table className="app-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Student Name</th>
                        <th>Roll Number</th>
                        <th>Degree / Branch</th>
                        <th>Submitted At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissionsData?.submissions?.map(sub => (
                        <tr key={sub.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                            #{sub.id}
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            {sub.submitter_name}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>
                            {sub.roll_number || 'Staff'}
                          </td>
                          <td>
                            {sub.program_name || '—'} {sub.section ? `(Sec ${sub.section})` : ''}
                          </td>
                          <td style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {sub.submitted_at}
                          </td>
                          <td>
                            <button
                              onClick={() => setInspectedSubmission(sub)}
                              className="app-btn app-btn-secondary app-btn-sm"
                            >
                              <Eye size={12} />
                              <span>Inspect Record</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sub-Inspect Drawer (When clicking a specific row) */}
              {inspectedSubmission && (
                <div style={{
                  marginTop: '20px',
                  background: 'var(--surface-subtle)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
                      <strong style={{ fontSize: '14px' }}>
                        Submission #{inspectedSubmission.id} • {inspectedSubmission.submitter_name} ({inspectedSubmission.roll_number})
                      </strong>
                    </div>

                    <button
                      onClick={() => setInspectedSubmission(null)}
                      className="app-btn app-btn-secondary app-btn-sm"
                    >
                      Close Details
                    </button>
                  </div>

                  {/* Locked ERP Data Snapshot */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '6px' }}>
                      Auto-Locked Institutional Profile Snapshot
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                      {Object.entries(inspectedSubmission.erp_snapshot || {}).map(([k, item]) => (
                        <div key={k} style={{ background: '#ffffff', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontSize: '11px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{item.label}: </span>
                          <strong style={{ color: 'var(--text-main)' }}>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Answers */}
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '6px' }}>
                      Custom Responses Submitted
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {Object.entries(inspectedSubmission.answers || {}).map(([k, val]) => (
                        <div key={k} style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontSize: '12px' }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{k}: </span>
                          <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>
                            {typeof val === 'boolean' ? (val ? 'Yes / Agreed' : 'No') : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: FORM BUILDER DRAWER (For Faculty, Admins, CRs)
          ========================================================================= */}
      {isBuildingForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(20, 31, 23, 0.55)',
          backdropFilter: 'blur(2px)',
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
            maxWidth: '850px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-dropdown)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
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
                  Smart Form Designer
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Create Institutional Smart Form
                </h2>
              </div>

              <button
                onClick={() => setIsBuildingForm(false)}
                className="app-btn app-btn-secondary"
                style={{ width: '32px', height: '32px', padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNewForm} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                {/* 1. Basic Metadata */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700 }}>Form Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Annual Tech Fest Registration & Track Selection"
                      value={newForm.title}
                      onChange={e => setNewForm({ ...newForm, title: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700 }}>Category</label>
                      <select
                        value={newForm.category}
                        onChange={e => setNewForm({ ...newForm, category: e.target.value })}
                        style={{ width: '100%', marginTop: '4px' }}
                      >
                        <option value="Academic">Academic</option>
                        <option value="Scholarship">Scholarship & Assistance</option>
                        <option value="Hostel">Hostel & Housing</option>
                        <option value="Event">Campus Event / Club</option>
                        <option value="General">General Administrative</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700 }}>Target Audience</label>
                      <select
                        value={newForm.target_scope}
                        onChange={e => setNewForm({ ...newForm, target_scope: e.target.value })}
                        style={{ width: '100%', marginTop: '4px' }}
                      >
                        <option value="all">Entire College (All Students)</option>
                        <option value="department">Department-Wide</option>
                        <option value="program">Class / Section Specific</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700 }}>Description & Instructions</label>
                    <textarea
                      rows={2}
                      placeholder="Explain the purpose of this form and who should fill it..."
                      value={newForm.description}
                      onChange={e => setNewForm({ ...newForm, description: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                </div>

                {/* 2. ERP Profile Field Selector ("Fill Once") */}
                <div style={{
                  background: 'var(--primary-subtle)',
                  border: '1px solid var(--primary-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Lock size={15} style={{ color: 'var(--primary)' }} />
                      <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>
                        Select Verified ERP Profile Fields to Auto-Lock
                      </strong>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>
                      {newForm.erp_fields.length} Selected
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Check which identity fields the university already knows. When students open this form, these fields will be automatically locked and pre-populated.
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '8px',
                    maxHeight: '160px',
                    overflowY: 'auto',
                    background: '#ffffff',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {Object.entries(erpDictionary).map(([key, label]) => {
                      const isChecked = newForm.erp_fields.includes(key);
                      return (
                        <label
                          key={key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleErpField(key)}
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Custom Questions Builder */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileCheck size={16} style={{ color: 'var(--accent)' }} />
                      <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                        Custom Application Questions ({newForm.fields.length})
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={addCustomQuestion}
                      className="app-btn app-btn-secondary app-btn-sm"
                    >
                      <Plus size={13} />
                      <span>Add Question</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {newForm.fields.map((fld, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--surface-subtle)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '12px 14px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                            QUESTION #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCustomQuestion(idx)}
                            style={{ color: '#dc2626', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Trash2 size={12} />
                            <span>Remove</span>
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '8px' }}>
                          <input
                            type="text"
                            required
                            placeholder="Question label (e.g. Previous Semester Marks)"
                            value={fld.label}
                            onChange={e => updateCustomQuestion(idx, 'label', e.target.value)}
                          />

                          <select
                            value={fld.field_type}
                            onChange={e => updateCustomQuestion(idx, 'field_type', e.target.value)}
                          >
                            <option value="text">Short Text</option>
                            <option value="textarea">Paragraph / Textarea</option>
                            <option value="number">Number</option>
                            <option value="select">Dropdown Select</option>
                            <option value="radio">Radio Buttons</option>
                            <option value="date">Date</option>
                            <option value="consent">Consent Checkbox</option>
                          </select>
                        </div>

                        {/* Options for Select/Radio */}
                        {['select', 'radio'].includes(fld.field_type) && (
                          <div style={{ marginBottom: '8px' }}>
                            <input
                              type="text"
                              placeholder="Comma-separated options (e.g. Yes, No, Maybe)"
                              value={(fld.options || []).join(', ')}
                              onChange={e => updateCustomQuestion(idx, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                              style={{ width: '100%', fontSize: '12px' }}
                            />
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <input
                            type="text"
                            placeholder="Optional help text / instructions for student..."
                            value={fld.help_text || ''}
                            onChange={e => updateCustomQuestion(idx, 'help_text', e.target.value)}
                            style={{ flex: 1, marginRight: '12px', fontSize: '12px' }}
                          />

                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', flexShrink: 0 }}>
                            <input
                              type="checkbox"
                              checked={fld.is_required}
                              onChange={e => updateCustomQuestion(idx, 'is_required', e.target.checked)}
                            />
                            <span>Required</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                background: 'var(--surface)'
              }}>
                <button
                  type="button"
                  onClick={() => setIsBuildingForm(false)}
                  className="app-btn app-btn-secondary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingForm}
                  className="app-btn app-btn-primary"
                >
                  {savingForm ? 'Publishing...' : 'Publish Smart Form'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
