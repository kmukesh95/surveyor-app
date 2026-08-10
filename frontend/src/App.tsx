import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { TwoFactorModal } from './components/TwoFactorModal';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BeneficiaryDashboard } from './pages/BeneficiaryDashboard';
import { SurveyorDashboard } from './pages/SurveyorDashboard';
import { AdminApprovalDashboard } from './pages/AdminApprovalDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading, requires2FA } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requires2FA) {
    return <TwoFactorModal />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user.role && !allowedRoles.includes(user.role.roleCode)) {
    if (user.role.roleCode === 'ADMIN' || user.role.roleCode === 'SUPER_ADMIN') {
      return <Navigate to="/admin" replace />;
    } else if (user.role.roleCode === 'SURVEYOR') {
      return <Navigate to="/surveyor" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { requires2FA } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      {requires2FA && <TwoFactorModal />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                <BeneficiaryDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/surveyor"
            element={
              <ProtectedRoute allowedRoles={['SURVEYOR', 'ADMIN', 'SUPER_ADMIN']}>
                <SurveyorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminApprovalDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Household Survey & Digital Ration Card System. Production v1.0.0</p>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
