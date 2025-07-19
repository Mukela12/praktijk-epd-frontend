import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider, useNotifications } from '@/components/ui/NotificationProvider';
import { PremiumNotifications } from '@/utils/premiumNotifications';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useAuth } from '@/store/authStore';
import { UserRole, AuthenticationState } from '@/types/auth';

// Layout Components
import AuthLayout from '@/components/layout/AuthLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Auth Components
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import TwoFactorPage from '@/pages/auth/TwoFactorPage';
import EmailVerificationPendingPage from '@/pages/auth/EmailVerificationPendingPage';

// Dashboard Components
import AdminDashboard from '@/pages/admin/AdminDashboard';
import TherapistDashboard from '@/pages/admin/TherapistDashboard';
import ClientDashboard from '@/pages/admin/ClientDashboard';

// Utility Components
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleRedirect from '@/components/auth/RoleRedirect';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Component to initialize the premium notifications
const NotificationInitializer: React.FC = () => {
  const { addNotification, removeNotification, clearAll } = useNotifications();
  
  useEffect(() => {
    PremiumNotifications.init({
      addNotification,
      removeNotification,
      clearAll
    });
  }, [addNotification, removeNotification, clearAll]);
  
  return null;
};

const App: React.FC = () => {
  const { 
    isAuthenticated, 
    authenticationState, 
    refreshAuth, 
    user, 
    requiresTwoFactor, 
    twoFactorSetupRequired 
  } = useAuth();

  // Initialize authentication on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token && !user && authenticationState === AuthenticationState.IDLE) {
        try {
          await refreshAuth();
        } catch (error) {
          console.error('Auth initialization failed:', error);
        }
      }
    };

    initAuth();
  }, [refreshAuth, user, authenticationState]);

  // Show loading spinner during authentication
  if (authenticationState === AuthenticationState.AUTHENTICATING) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <LanguageProvider>
          <NotificationInitializer />
          <Router>
          <div className="App">
            <Routes>
              {/* Auth routes - Only render when on auth paths */}
              <Route 
                path="/auth/*" 
                element={
                  <AuthLayout>
                    <Routes>
                      <Route 
                        path="login" 
                        element={
                          authenticationState === AuthenticationState.AUTHENTICATED_COMPLETE ? (
                            <RoleRedirect />
                          ) : (
                            <LoginPage />
                          )
                        } 
                      />
                      <Route 
                        path="register" 
                        element={
                          authenticationState === AuthenticationState.AUTHENTICATED_COMPLETE ? (
                            <RoleRedirect />
                          ) : (
                            <RegisterPage />
                          )
                        } 
                      />
                      <Route path="forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="reset-password/:token" element={<ResetPasswordPage />} />
                      <Route path="verify-email/:token" element={<VerifyEmailPage />} />
                      <Route 
                        path="email-verification-pending" 
                        element={<EmailVerificationPendingPage />} 
                      />
                      <Route 
                        path="2fa" 
                        element={
                          [
                            AuthenticationState.REQUIRES_2FA_SETUP,
                            AuthenticationState.REQUIRES_2FA_VERIFICATION,
                            AuthenticationState.AUTHENTICATED
                          ].includes(authenticationState) ? (
                            <TwoFactorPage />
                          ) : (
                            <Navigate to="login" replace />
                          )
                        } 
                      />
                      <Route path="" element={<Navigate to="login" replace />} />
                    </Routes>
                  </AuthLayout>
                } 
              />

              {/* Protected dashboard routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <DashboardLayout>
                      <Routes>
                        <Route path="" element={<AdminDashboard />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        {/* Additional admin routes will be added here */}
                        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/therapist/*"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.THERAPIST, UserRole.SUBSTITUTE]}>
                    <DashboardLayout>
                      <Routes>
                        <Route path="" element={<TherapistDashboard />} />
                        <Route path="dashboard" element={<TherapistDashboard />} />
                        {/* Additional therapist routes will be added here */}
                        <Route path="*" element={<Navigate to="/therapist/dashboard" replace />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client/*"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
                    <DashboardLayout>
                      <Routes>
                        <Route path="" element={<ClientDashboard />} />
                        <Route path="dashboard" element={<ClientDashboard />} />
                        {/* Additional client routes will be added here */}
                        <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/assistant/*"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ASSISTANT]}>
                    <DashboardLayout>
                      <Routes>
                        <Route path="" element={<AdminDashboard />} /> {/* Assistants use admin dashboard */}
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="*" element={<Navigate to="/assistant/dashboard" replace />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/bookkeeper/*"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.BOOKKEEPER]}>
                    <DashboardLayout>
                      <Routes>
                        <Route path="" element={<AdminDashboard />} /> {/* Bookkeepers use admin dashboard */}
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="*" element={<Navigate to="/bookkeeper/dashboard" replace />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Root route - redirect based on auth status */}
              <Route
                path="/"
                element={
                  authenticationState === AuthenticationState.AUTHENTICATED_COMPLETE ? (
                    <RoleRedirect />
                  ) : (
                    <Navigate to="/auth/login" replace />
                  )
                }
              />

              {/* Catch all route */}
              <Route
                path="*"
                element={
                  authenticationState === AuthenticationState.AUTHENTICATED_COMPLETE ? (
                    <RoleRedirect />
                  ) : (
                    <Navigate to="/auth/login" replace />
                  )
                }
              />
            </Routes>

            
          </div>
        </Router>
        </LanguageProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
};

export default App;