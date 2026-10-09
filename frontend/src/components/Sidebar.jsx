import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Shield,
  FileSpreadsheet,
  FileCheck,
  Bell,
  AlertCircle,
  Clock,
  Layers,
  GraduationCap,
  KeyRound,
  Utensils,
  ChefHat,
  BookOpen,
  Smartphone,
  UploadCloud,
  Headphones
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const { t } = useAccessibility();
  const permissions = user?.permissions || [];
  const isAdmin = user?.role_name === 'system_admin';

  const canViewStudents = isAdmin || permissions.includes('view_student_profile');
  const canManageRBAC = isAdmin || permissions.includes('manage_roles_tags');
  const canViewAudit = isAdmin || permissions.includes('manage_users');

  const isStudent = user?.role_name === 'student';
  const isTeacher = user?.role_name === 'teacher';
  const isHOD = user?.role_name === 'hod';
  const isWarden = user?.role_name === 'warden';
  const isMessManager = user?.role_name === 'mess_manager';

  const canAccessGatepass = isStudent || isWarden || isAdmin;
  const canAccessMess = isStudent || isWarden || isMessManager || isAdmin;
  const canAccessMessDesk = ['mess_manager', 'warden', 'system_admin', 'admin_staff', 'director'].includes(user?.role_name);
  const canAccessAcademics = isStudent || isTeacher || isHOD || ['system_admin', 'director', 'exam_admin'].includes(user?.role_name);
  const canAccessForms = isStudent || isTeacher || isHOD || ['system_admin', 'admin_staff', 'director'].includes(user?.role_name);
  const canAccessServices = isStudent || ['system_admin', 'admin_staff', 'director'].includes(user?.role_name);
  const canAccessExams = isStudent || ['system_admin', 'exam_admin', 'director'].includes(user?.role_name);
  const canAccessSupportDesk = ['admin_staff', 'system_admin', 'director', 'warden', 'exam_admin', 'hod', 'teacher', 'mess_manager'].includes(user?.role_name);

  const hasCampusLifeModules = canAccessGatepass || canAccessMess || canAccessMessDesk || canAccessAcademics;

  return (
    <aside className="app-sidebar">
      {/* Primary Section */}
      <div>
        <div className="sidebar-heading">Workspace</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={16} />
            <span>{t('campusHub')}</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <UserCheck size={16} />
            <span>{t('verifiedIdentity')}</span>
          </NavLink>

          {canViewStudents && (
            <NavLink
              to="/students"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Users size={16} />
              <span>{t('studentRoster')}</span>
            </NavLink>
          )}

          {canManageRBAC && (
            <NavLink
              to="/rbac"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Shield size={16} />
              <span>Roles & Tags (RBAC)</span>
            </NavLink>
          )}

          {canViewAudit && (
            <NavLink
              to="/audit"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Clock size={16} />
              <span>Institutional Audit</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* Campus Life Modules Section (Role-Scoped) */}
      {hasCampusLifeModules && (
        <div>
          <div className="sidebar-heading">Campus Life & Operations</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {canAccessGatepass && (
              <NavLink
                to="/gatepass"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <KeyRound size={16} />
                <span>{t('gatepassSecurity')}</span>
                <span className="nav-badge-pill" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', border: '1px solid var(--primary-border)' }}>Active</span>
              </NavLink>
            )}

            {canAccessMess && (
              <NavLink
                to="/mess"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Utensils size={16} />
                <span>{t('messDining')}</span>
                <span className="nav-badge-pill" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', border: '1px solid var(--primary-border)' }}>Active</span>
              </NavLink>
            )}

            {canAccessMessDesk && (
              <NavLink
                to="/mess-manager"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <ChefHat size={16} />
                <span>Mess Manager Desk</span>
                <span className="nav-badge-pill" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--border-subtle)' }}>Staff</span>
              </NavLink>
            )}

            {canAccessAcademics && (
              <NavLink
                to="/academics"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <BookOpen size={16} />
                <span>{t('academicsAttendance')}</span>
                <span className="nav-badge-pill" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', border: '1px solid var(--primary-border)' }}>Active</span>
              </NavLink>
            )}
          </nav>
        </div>
      )}

      {/* Digital Services Section */}
      <div>
        <div className="sidebar-heading">Digital Desks</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {canAccessForms && (
            <NavLink
              to="/forms"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <FileSpreadsheet size={16} />
              <span>{t('smartForms')}</span>
            </NavLink>
          )}

          {canAccessServices && (
            <NavLink
              to="/services"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <FileCheck size={16} />
              <span>{t('digitalCertificates')}</span>
            </NavLink>
          )}

          <NavLink
            to="/notices"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Bell size={16} />
            <span>{t('campusNotices')}</span>
          </NavLink>

          <NavLink
            to="/grievances"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <AlertCircle size={16} />
            <span>{t('grievanceDesk')}</span>
          </NavLink>

          {canAccessExams && (
            <NavLink
              to="/exams"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <GraduationCap size={16} />
              <span>{t('examinationCell')}</span>
            </NavLink>
          )}

          {canAccessSupportDesk && (
            <NavLink
              to="/support-desk"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Headphones size={16} />
              <span>Support Desk & AI Hub</span>
              <span className="nav-badge-pill" style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}>Staff</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* Inclusivity & Adoption Section */}
      <div>
        <div className="sidebar-heading">Accessibility & Rollout</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <NavLink
            to="/feature-phone"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Smartphone size={16} />
            <span>{t('featurePhoneUssd')}</span>
            <span className="nav-badge-pill" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>Fallback</span>
          </NavLink>

          <NavLink
            to="/adoption-migration"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <UploadCloud size={16} />
            <span>{t('adoptionMigration')}</span>
          </NavLink>
        </nav>
      </div>

      {/* Footer Institutional Node Card */}
      <div style={{
        marginTop: 'auto',
        background: 'var(--surface-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a', display: 'inline-block', boxShadow: '0 0 0 2px rgba(22, 163, 74, 0.2)' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>CUT Intranet Node</span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Node-01</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Central University of Technology • Enterprise Core
        </div>
      </div>
    </aside>
  );
}
