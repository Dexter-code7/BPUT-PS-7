import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Search,
  Filter,
  Tag,
  Download,
  Building2,
  GraduationCap,
  Eye,
  CheckCircle2,
  X
} from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    loadDepartments();
    loadStudents();
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await api.getDepartments();
      setDepartments(res?.data?.departments || []);
    } catch (err) {
      console.warn('Could not load departments:', err);
    }
  };

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedDept) params.department_id = selectedDept;
      if (selectedSem) params.semester = selectedSem;
      if (search) params.search = search;

      const res = await api.listStudents(params);
      setStudents(res?.data?.students || []);
    } catch (err) {
      console.warn('Could not load students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadStudents();
  };

  const handleExportCsv = () => {
    if (students.length === 0) return;
    const headers = ['Roll Number', 'Registration', 'Name', 'Department', 'Program', 'Semester', 'Section', 'Email', 'Hostel'];
    const rows = students.map(s => [
      s.roll_number,
      s.registration_number,
      `"${s.full_name}"`,
      `"${s.department_name}"`,
      `"${s.program_name}"`,
      s.current_semester,
      s.section,
      s.college_email,
      s.hostel_resident ? `"${s.hostel_name} ${s.room_number}"` : 'Day Scholar'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `student_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="card-panel">
        <div className="card-panel-header">
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800 }}>Student Roster & Institutional Registry</h1>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Verified master directory of enrolled students across all university faculties
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleExportCsv} className="app-btn app-btn-secondary app-btn-sm">
              <Download size={13} />
              <span>Export Roster CSV</span>
            </button>
            <span className="badge-tag emerald">
              {students.length} Records
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="table-controls">
          <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
            <div style={{ minWidth: '220px', flex: 1 }}>
              <input
                type="text"
                placeholder="Search by student name or roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ width: '200px' }}>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ width: '140px' }}>
              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="app-btn app-btn-primary app-btn-sm">
              <Filter size={13} />
              <span>Filter</span>
            </button>
          </form>
        </div>

        {/* High Density Table */}
        {isLoading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Retrieving verified records from database...
          </div>
        ) : students.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No students found matching the selected filter criteria.
          </div>
        ) : (
          <div className="data-table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Department / Program</th>
                  <th>Semester</th>
                  <th>Institutional Email</th>
                  <th>Designation / Tags</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu) => (
                  <tr key={stu.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedStudent(stu)}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                      {stu.roll_number}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{stu.full_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Reg: {stu.registration_number}
                      </div>
                    </td>
                    <td>
                      <div>{stu.program_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {stu.department_name}
                      </div>
                    </td>
                    <td>
                      Semester {stu.current_semester} • {stu.section}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {stu.college_email}
                    </td>
                    <td>
                      {stu.active_tags ? (
                        <span className="badge-tag terracotta">
                          <Tag size={10} />
                          {stu.active_tags}
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Standard Student
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(stu);
                        }}
                        className="app-btn app-btn-secondary app-btn-sm"
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Details Inspection Modal / Slide-over */}
      {selectedStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20, 31, 23, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '540px',
            boxShadow: 'var(--shadow-dropdown)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'var(--primary)',
              color: '#ffffff',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700 }}>
                  {selectedStudent.full_name}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.85, fontFamily: 'var(--font-mono)' }}>
                  Roll: {selectedStudent.roll_number} • Reg: {selectedStudent.registration_number}
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                style={{ color: '#ffffff', opacity: 0.8 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'var(--surface-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Department</div>
                  <div style={{ fontWeight: 600, fontSize: '12px', marginTop: '2px' }}>{selectedStudent.department_name}</div>
                </div>

                <div style={{ background: 'var(--surface-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Program</div>
                  <div style={{ fontWeight: 600, fontSize: '12px', marginTop: '2px' }}>{selectedStudent.program_name}</div>
                </div>

                <div style={{ background: 'var(--surface-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Cohort</div>
                  <div style={{ fontWeight: 600, fontSize: '12px', marginTop: '2px' }}>
                    Semester {selectedStudent.current_semester} • Section {selectedStudent.section}
                  </div>
                </div>

                <div style={{ background: 'var(--surface-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Residence</div>
                  <div style={{ fontWeight: 600, fontSize: '12px', marginTop: '2px' }}>
                    {selectedStudent.hostel_resident ? `${selectedStudent.hostel_name} (${selectedStudent.room_number})` : 'Day Scholar'}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--surface-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Institutional Contact</div>
                <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '2px' }}>{selectedStudent.college_email}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Mobile: {selectedStudent.phone_number}</div>
              </div>

              {selectedStudent.active_tags && (
                <div style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)' }}>Active Institutional Designation</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '2px' }}>{selectedStudent.active_tags}</div>
                </div>
              )}
            </div>

            <div style={{ padding: '12px 20px', background: 'var(--surface-subtle)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedStudent(null)}
                className="app-btn app-btn-secondary app-btn-sm"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
