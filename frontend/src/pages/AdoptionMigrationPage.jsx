import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  ArrowRight,
  Database,
  Building,
  Calendar,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Download,
  BookOpen,
  Users,
  Smartphone,
  Check,
  FileText,
  Printer
} from 'lucide-react';

export default function AdoptionMigrationPage() {
  const { user, showToast } = useAuth();
  const { t } = useAccessibility();

  const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'data_matrix' | 'habits' | 'sop'
  const [datasetType, setDatasetType] = useState('students');
  const [isProcessing, setIsProcessing] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);

  const handleSimulateImport = async () => {
    setIsProcessing(true);
    try {
      const res = await api.processMigrationImport({
        dataset_type: datasetType
      });
      setMigrationResult(res.data);
      showToast(res.message || 'Legacy CSV data mapped and verified.');
    } catch (err) {
      showToast(err.message || 'Migration parsing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. Institutional Masthead */}
      <div className="surface-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--primary)',
              background: 'var(--primary-subtle)',
              padding: '3px 10px',
              borderRadius: '12px',
              border: '1px solid var(--primary-border)',
              marginBottom: '8px'
            }}>
              <ShieldCheck size={13} />
              <span>Institutional Rollout • Deliverable #5 • Zero-Downtime Migration</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              College Adoption & Legacy Migration Dossier
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '850px', lineHeight: 1.5 }}>
              How an existing 40-year-old state university with 3,500 students, paper registers, discordant Excel sheets, and entrenched WhatsApp habits rolls out Unified Campus OS without stopping college operations for even a single day.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: '6px',
              background: '#DCFCE7',
              color: '#15803D',
              border: '1px solid #BBF7D0'
            }}>
              <CheckCircle2 size={14} />
              <span>Zero Operational Downtime Protocol</span>
            </span>
          </div>
        </div>

        {/* 4 Pillars Summary Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ padding: '12px 14px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Week 1: Shadow Ingestion</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>Golden Record Master</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Student roster & rooms auto-mapped</div>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>Week 2: Dual-Ledger Run</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#92400E', marginTop: '4px' }}>Coexistence at Gate & Mess</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Paper register runs in parallel</div>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>Week 3: Digital Cutover</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>Certificates & Notice Feeds</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>WhatsApp groups decommissioned</div>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>Week 4: 100% Paperless</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>Full Campus Cutover</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>All registers permanently archived</div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
        <button
          onClick={() => setActiveTab('roadmap')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'roadmap' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'roadmap' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Calendar size={16} />
          <span>4-Week Zero-Downtime Rollout Roadmap</span>
        </button>

        <button
          onClick={() => setActiveTab('data_matrix')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'data_matrix' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'data_matrix' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Database size={16} />
          <span>Data Migration Matrix (What to Migrate vs Abandon)</span>
        </button>

        <button
          onClick={() => setActiveTab('habits')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'habits' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'habits' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Users size={16} />
          <span>Change Management & Overcoming Habit Inertia</span>
        </button>

        <button
          onClick={() => setActiveTab('sop')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'sop' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'sop' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileText size={16} />
          <span>Official University Rollout Circular (SOP)</span>
        </button>
      </div>

      {/* TAB 1: 4-WEEK ROLLOUT ROADMAP */}
      {activeTab === 'roadmap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="surface-card" style={{ padding: '22px', borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
              The Zero-Downtime Phased Implementation Doctrine
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Most college ERP implementations fail because they attempt a "Big Bang Cutover" on a Monday morning. When a student's phone dies at the gate, guards panic, and the college immediately reverts to paper. Unified Campus OS deploys a 4-week dual-track protocol where legacy and digital systems run in tandem until stakeholders personally experience that the digital system is 10x faster and safer.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            
            {/* Week 1 */}
            <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '4px solid #16A34A' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#166534' }}>
                  Week 1 (Days 1 – 7)
                </span>
                <span className="badge-tag emerald" style={{ fontSize: '10px' }}>Zero Risk</span>
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  Golden Master Ingestion & Shadow Profiles
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  The college registrar and IT cell import the unformatted legacy Excel sheets via the 1-Click Reconciliation Engine.
                </p>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>Auto-generate credentials for 3,500 students and 200 faculty.</li>
                <li>Digital ID cards with SVG variable barcodes minted.</li>
                <li>Students log in and verify their own profile ("Fill Once, Use Everywhere").</li>
                <li>Zero change to gate, mess, or class operations.</li>
              </ul>
            </div>

            {/* Week 2 */}
            <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '4px solid #D97706' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#92400E' }}>
                  Week 2 (Days 8 – 14)
                </span>
                <span className="badge-tag amber" style={{ fontSize: '10px' }}>Dual-Ledger</span>
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  Dual-Ledger Parallel Gate & Mess Run
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Physical registers remain on security desks, but security guards simultaneously scan dynamic QR codes or enter 4-digit tokens.
                </p>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>Guards realize scanning QR takes 3 seconds vs 45 seconds of handwriting.</li>
                <li>Non-smartphone students use *123# USSD tokens without friction.</li>
                <li>Students begin testing "Skip Dinner" RSVP (+₹25 mess rebate credit).</li>
                <li>Hostel wardens observe live automated census reconciliation.</li>
              </ul>
            </div>

            {/* Week 3 */}
            <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '4px solid #9A3412' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#9A3412' }}>
                  Week 3 (Days 15 – 21)
                </span>
                <span className="badge-tag terracotta" style={{ fontSize: '10px' }}>Digitization</span>
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  Certificate Desk & Circular Cutover
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  The administrative counter stops issuing paper applications for Bonafide, Fee Clearance, and Railway concessions.
                </p>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>Students submit pre-filled requests; collect physical passes by token.</li>
                <li>Official notices published exclusively on ERP with UGC read receipts.</li>
                <li>WhatsApp broadcasts declared unofficial for statutory compliance.</li>
                <li>Campus maintenance desk triages complaints with automated SLAs.</li>
              </ul>
            </div>

            {/* Week 4 */}
            <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '4px solid #1E3A8A' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#1E3A8A' }}>
                  Week 4 (Days 22 – 30)
                </span>
                <span className="badge-tag emerald" style={{ fontSize: '10px' }}>Full Cutover</span>
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  100% Paperless Cutover & Archival
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Paper registers officially retired and sealed into the university physical archive. Full digital governance achieved.
                </p>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>Gate security operates 100% on Guard Scanner Kiosk & USSD.</li>
                <li>Kitchen reduces food waste by 18% using dynamic RSVP headcounts.</li>
                <li>Semester Admit Cards issued automatically based on 75% attendance.</li>
                <li>Principal & Registrar monitor live institutional health dashboard.</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: DATA MIGRATION MATRIX */}
      {activeTab === 'data_matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Comparative Data Strategy */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* What to Migrate */}
            <div className="surface-card" style={{ padding: '20px', borderTop: '4px solid #16A34A', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} style={{ color: '#16A34A' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#166534' }}>
                  What to Migrate (The Golden Record Master)
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Only verified structural baseline data required to establish identity, academic status, and residential safety:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div style={{ padding: '10px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <strong>1. Student Master Roster:</strong>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    University Registration No (Primary Key), Roll Number, Full Name, Department, Current Semester, Mobile Number, Parent Phone.
                  </div>
                </div>

                <div style={{ padding: '10px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <strong>2. Hostel Allotment Ledger:</strong>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Hostel Block ID, Room Number, Bed ID, Warden In-charge, Day Scholar / Boarder Flag.
                  </div>
                </div>

                <div style={{ padding: '10px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <strong>3. Academic Structure & Course Matrix:</strong>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Departments (CSE, EE, MECH, etc.), Programs (B.Tech, M.Tech, MCA), Subject Codes, Assigned Faculty.
                  </div>
                </div>

                <div style={{ padding: '10px', background: 'var(--canvas)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <strong>4. Active Financial Dues Ledger:</strong>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Outstanding dues for current semester only (Clear / Dues Pending flag).
                  </div>
                </div>
              </div>
            </div>

            {/* What to Leave Behind */}
            <div className="surface-card" style={{ padding: '20px', borderTop: '4px solid #DC2626', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} style={{ color: '#DC2626' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#991B1B' }}>
                  What to Leave Behind (The "Clean Slate" Doctrine)
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Do NOT spend months attempting to clean and digitize 10 years of legacy manual paperwork:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div style={{ padding: '10px', background: '#FEF2F2', borderRadius: '6px', border: '1px solid #FCA5A5' }}>
                  <strong style={{ color: '#991B1B' }}>1. Historical Paper Gate Entry Logs:</strong>
                  <div style={{ color: '#7F1D1D', marginTop: '2px' }}>
                    Archive the physical registers in the store room. Start transactional digital punch logs fresh on Day 1.
                  </div>
                </div>

                <div style={{ padding: '10px', background: '#FEF2F2', borderRadius: '6px', border: '1px solid #FCA5A5' }}>
                  <strong style={{ color: '#991B1B' }}>2. Resolved Physical Grievance Slips:</strong>
                  <div style={{ color: '#7F1D1D', marginTop: '2px' }}>
                    Do not type past resolved plumbing/electrical paper slips. Fresh ticketing starts in the new SLA engine.
                  </div>
                </div>

                <div style={{ padding: '10px', background: '#FEF2F2', borderRadius: '6px', border: '1px solid #FCA5A5' }}>
                  <strong style={{ color: '#991B1B' }}>3. Ten-Year Financial Audit Ledgers:</strong>
                  <div style={{ color: '#7F1D1D', marginTop: '2px' }}>
                    Keep Tally ERP 9 as the historical financial record. Only export net clearance status into Campus OS.
                  </div>
                </div>

                <div style={{ padding: '10px', background: '#FEF2F2', borderRadius: '6px', border: '1px solid #FCA5A5' }}>
                  <strong style={{ color: '#991B1B' }}>4. Past Semester Seating Charts:</strong>
                  <div style={{ color: '#7F1D1D', marginTop: '2px' }}>
                    Exam seating plans are ephemeral; new sessions generate digital hall tickets automatically.
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Interactive Spreadsheet Importer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '22px' }}>
            <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  Legacy Spreadsheet Ingestion Engine
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Upload dirty registrar spreadsheets. The reconciliation engine maps disparate headers into verified schemas.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Select Legacy Dataset Schema
                </label>
                <select
                  className="input-field"
                  value={datasetType}
                  onChange={(e) => setDatasetType(e.target.value)}
                >
                  <option value="students">Student Master Roster (Roll, Name, Dept, Phone)</option>
                  <option value="hostel_rooms">Hostel Allotment & Bed Master (Block, Room, Bed)</option>
                  <option value="faculty">Faculty Directory & Course Teaching Matrix</option>
                  <option value="dues">Current Session Tuition & Mess Dues Ledger</option>
                </select>
              </div>

              {/* Dropzone */}
              <div style={{
                border: '2px dashed var(--border-subtle)',
                borderRadius: '8px',
                padding: '30px 20px',
                textAlign: 'center',
                background: 'var(--canvas)'
              }}>
                <UploadCloud size={32} style={{ color: 'var(--primary)', margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700, fontSize: '13px' }}>Drag & Drop Legacy Excel (.xlsx) / CSV File</div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Supports legacy MIS exports or unformatted office spreadsheets
                </div>
              </div>

              <button
                className="app-btn app-btn-primary"
                onClick={handleSimulateImport}
                disabled={isProcessing}
                style={{ justifyContent: 'center' }}
              >
                <FileSpreadsheet size={15} />
                <span>{isProcessing ? 'Reconciling Columns...' : 'Ingest & Validate Sample Legacy CSV'}</span>
              </button>
            </div>

            {/* Results Preview */}
            <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Schema Reconciliation & Sanitization Report
              </h3>

              {migrationResult ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', marginBottom: '14px' }}>
                    <CheckCircle2 size={16} />
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>
                      {migrationResult.message}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Automated Column Re-Mapping:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                    {Object.entries(migrationResult.schema_mapping).map(([legacy, standard]) => (
                      <div key={legacy} style={{ background: 'var(--canvas)', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', border: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{legacy}</span>
                        <span style={{ margin: '0 4px' }}>→</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{standard}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Sanitized Student Records Preview:</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ width: '100%', fontSize: '11px' }}>
                      <thead>
                        <tr>
                          <th>Roll No</th>
                          <th>Student Name</th>
                          <th>Department</th>
                          <th>Hostel / Room</th>
                          <th>Verification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {migrationResult.preview_rows.map((row) => (
                          <tr key={row.roll_number}>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{row.roll_number}</td>
                            <td style={{ fontWeight: 700 }}>{row.name}</td>
                            <td>{row.department} (Sem {row.semester})</td>
                            <td>{row.hostel} / {row.room}</td>
                            <td>
                              <span style={{ padding: '1px 6px', borderRadius: '4px', background: '#DCFCE7', color: '#15803D', fontWeight: 700 }}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  Click "Ingest & Validate Sample Legacy CSV" to preview automated schema reconciliation and column re-mapping.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: CHANGE MANAGEMENT & HABIT PLAYBOOK */}
      {activeTab === 'habits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="surface-card" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
              Overcoming Institutional Inertia & Human Resistance
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              In government and affiliated universities, technology is rarely rejected for technical reasons; it is rejected because people are attached to their daily routines. Here is how Unified Campus OS structurally eliminates friction for every stakeholder:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            
            {/* Security Guard */}
            <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>1. Security Guards (The Paper Register Habit)</strong>
                <span className="badge-tag emerald">Solved</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>The Resistance:</strong> Guards are accustomed to physical paper books and resist typing into computer forms.
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>The Solution:</strong> The Guard Scanner Terminal has only 2 giant buttons ("Punch Exit" and "Punch Entry") with an SVG camera scanner that takes 2 seconds. If a student's battery is dead, the guard punches a 4-digit code. Zero keyboard typing.
              </div>
            </div>

            {/* Faculty */}
            <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>2. Faculty Members (The WhatsApp Group Habit)</strong>
                <span className="badge-tag emerald">Solved</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>The Resistance:</strong> Professors find ERPs slow and prefer sending lecture cancellations over unofficial WhatsApp groups.
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>The Solution:</strong> In Academics, faculty have a 1-click "Lecture Shift / Broadcast" button that alerts students immediately and satisfies UGC compliance audits with verified read tracking.
              </div>
            </div>

            {/* Students */}
            <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>3. Students (Adoption Apathy)</strong>
                <span className="badge-tag emerald">Solved</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>The Resistance:</strong> Students ignore institutional portals unless forced.
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>The Solution:</strong> Tangible economic & time incentives: skipping dinner gives a direct ₹25 mess rebate; gatepasses generate instantly without hunting down the hostel warden across campus.
              </div>
            </div>

            {/* Non-Smartphone Students */}
            <div className="surface-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>4. Non-Smartphone Users (Digital Divide)</strong>
                <span className="badge-tag emerald">Solved</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>The Resistance:</strong> Economically disadvantaged students with basic keypad phones feel excluded.
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>The Solution:</strong> Dialing *123# on any basic phone generates an offline 4-digit token for gate security, checks mess menus, and receives curfew return alerts with zero internet needed.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: OFFICIAL UNIVERSITY CIRCULAR & SOP */}
      {activeTab === 'sop' && (
        <div className="surface-card" style={{ padding: '36px 42px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#FFFFFF', border: '2px solid #14532D' }}>
          
          <div style={{ textAlign: 'center', borderBottom: '2px solid #14532D', paddingBottom: '16px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#14532D', fontWeight: 800 }}>
              CENTRAL UNIVERSITY OF TECHNOLOGY • OFFICE OF THE REGISTRAR
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginTop: '4px' }}>
              INSTITUTIONAL DIRECTIVE: PHASED TRANSITION TO UNIFIED CAMPUS OS
            </div>
            <div style={{ fontSize: '12px', color: '#4B5563', marginTop: '2px' }}>
              Notification No: CUT/REG/2026/CIRC-104 • Dated: 09 October 2026
            </div>
          </div>

          <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#1F2937', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p>
              In accordance with BPUT Academic Guidelines and the National Digital Education Architecture (NDEAR), all campus administrative units, hostels, academic departments, and security gates are hereby instructed to commence the 4-week zero-downtime transition to Unified Campus OS.
            </p>

            <div>
              <strong>1. Verification of Golden Student Master (Week 1):</strong>
              <div>All enrolled students must log into the portal to review their verified academic particulars under the "Fill Once, Use Everywhere" doctrine. Discrepancies must be flagged through the digital correction desk.</div>
            </div>

            <div>
              <strong>2. Dual-Ledger Coexistence Protocol (Week 2):</strong>
              <div>Security personnel at Gates 1, 2, and 3 shall continue maintaining the physical visitors register while simultaneously verifying students via the QR Scanner Terminal and *123# USSD tokens.</div>
            </div>

            <div>
              <strong>3. Decommissioning of Unofficial Broadcast Groups (Week 3):</strong>
              <div>Effective Week 3, broadcast groups on commercial messaging platforms (WhatsApp, Telegram) are officially retired. All statutory academic circulars, class cancellations, and notices must be published via the ERP Notice Desk with verified UGC read receipts.</div>
            </div>

            <div>
              <strong>4. Mess Food Waste Prevention Mandate (Week 4):</strong>
              <div>Boarders must declare their dining attendance before 05:00 PM daily. A dining credit rebate of ₹25 per skipped meal will be automatically credited to the student's monthly ledger. Head Chefs shall prepare rations strictly adhering to the RSVP headcounts.</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '20px', borderTop: '1px solid #E5E7EB', marginTop: '10px' }}>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>
              <div>Copy to: Principal, All HODs, Chief Warden, Security Officer, Mess Contractor</div>
              <div>System Archive Reference: CUT-ERP-SOP-V2.1</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ width: '120px', height: '1px', background: '#111827', marginBottom: '6px', marginLeft: 'auto' }}></div>
              <div style={{ fontWeight: 800, fontSize: '12px', color: '#111827' }}>DR. PRADEEP KUMAR PANDA</div>
              <div style={{ fontSize: '11px', color: '#4B5563' }}>Registrar & Controller of Operations</div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
