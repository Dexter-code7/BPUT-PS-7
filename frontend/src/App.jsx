import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import StudentsPage from './pages/StudentsPage';
import RbacMatrixPage from './pages/RbacMatrixPage';
import AuditLogsPage from './pages/AuditLogsPage';
import FormsPage from './pages/FormsPage';
import ServicesPage from './pages/ServicesPage';
import NoticesPage from './pages/NoticesPage';
import GrievancesPage from './pages/GrievancesPage';
import ExamsPage from './pages/ExamsPage';
import GatepassPage from './pages/GatepassPage';
import MessPage from './pages/MessPage';
import MessManagerPage from './pages/MessManagerPage';
import AcademicsPage from './pages/AcademicsPage';
import FeaturePhonePage from './pages/FeaturePhonePage';
import AdoptionMigrationPage from './pages/AdoptionMigrationPage';
import SupportDeskPage from './pages/SupportDeskPage';
import CampusDeskBot from './components/CampusDeskBot';
import { CheckCircle2, WifiOff } from 'lucide-react';

function AppContent() {
  const { user, isLoading, toastMessage } = useAuth();
  const { lowBandwidth, t } = useAccessibility();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--canvas)',
        color: 'var(--text-secondary)',
        fontSize: '13px',
        fontWeight: 600
      }}>
        Initializing Campus ERP Workspace...
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginPage />
        {toastMessage && (
          <div className="toast-shelf">
            <div className="toast-pill">
              <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="app-shell">
      {lowBandwidth && (
        <div className="low-bandwidth-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WifiOff size={14} />
            <span>{t('lowBandwidthActive')} • {t('dataSavedNote')}</span>
          </div>
          <span className="bandwidth-badge">64 kbps Throttle Simulated</span>
        </div>
      )}

      <Header />

      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/gatepass" element={<GatepassPage />} />
            <Route path="/mess" element={<MessPage />} />
            <Route path="/mess-manager" element={<MessManagerPage />} />
            <Route path="/academics" element={<AcademicsPage />} />
            <Route path="/forms" element={<FormsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/notices" element={<NoticesPage />} />
            <Route path="/grievances" element={<GrievancesPage />} />
            <Route path="/exams" element={<ExamsPage />} />
            <Route path="/feature-phone" element={<FeaturePhonePage />} />
            <Route path="/adoption-migration" element={<AdoptionMigrationPage />} />
            <Route path="/support-desk" element={<SupportDeskPage />} />
            <Route path="/rbac" element={<RbacMatrixPage />} />
            <Route path="/audit" element={<AuditLogsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {toastMessage && (
        <div className="toast-shelf">
          <div className="toast-pill">
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Floating 24/7 CampusDesk FAQ Assistant */}
      <CampusDeskBot />
    </div>
  );
}

export default function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </AccessibilityProvider>
  );
}
