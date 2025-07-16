import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useAuth } from '@/store/authStore';
import { UserRole } from '@/types/auth';

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

const App: React.FC = () => {
  const { isAuthenticated, isLoading, refreshAuth, user, requiresTwoFactor, twoFactorSetupRequired } = useAuth();
  
  // Only log when auth state changes significantly
  React.useEffect(() => {
    console.log('=== AUTH STATE CHANGE ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('requiresTwoFactor:', requiresTwoFactor);
    console.log('twoFactorSetupRequired:', twoFactorSetupRequired);
  }, [isAuthenticated, requiresTwoFactor, twoFactorSetupRequired]);

  // Initialize authentication on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token && !user) {
        await refreshAuth();
      }
    };

    initAuth();
  }, [refreshAuth, user]);

  // Show loading spinner during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Auth routes - Always allow access to auth pages, but redirect authenticated users from login/register */}
              <Route 
                path="/auth/*" 
                element={
                  <AuthLayout>
                    <Routes key={`auth-${isAuthenticated}-${requiresTwoFactor}-${twoFactorSetupRequired}`}>
                      <Route 
                        path="login" 
                        element={
                          isAuthenticated && !requiresTwoFactor && !twoFactorSetupRequired ? (
                            <RoleRedirect />
                          ) : (
                            <LoginPage />
                          )
                        } 
                      />
                      <Route 
                        path="register" 
                        element={
                          (() => {
                            console.log('=== REGISTER ROUTE RENDER CHECK ===');
                            console.log('isAuthenticated:', isAuthenticated);
                            console.log('requiresTwoFactor:', requiresTwoFactor);
                            console.log('twoFactorSetupRequired:', twoFactorSetupRequired);
                            
                            if (isAuthenticated && !requiresTwoFactor && !twoFactorSetupRequired) {
                              console.log('Redirecting authenticated user from register page');
                              return <RoleRedirect />;
                            } else {
                              console.log('Showing register page');
                              return <RegisterPage />;
                            }
                          })()
                        } 
                      />
                      <Route path="forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="reset-password/:token" element={<ResetPasswordPage />} />
                      <Route path="verify-email/:token" element={<VerifyEmailPage />} />
                      <Route 
                        path="email-verification-pending" 
                        element={
                          (() => {
                            console.log('=== RENDERING EMAIL VERIFICATION PENDING ROUTE ===');
                            return <EmailVerificationPendingPage />;
                          })()
                        } 
                      />
                      <Route 
                        path="2fa" 
                        element={
                          isAuthenticated || requiresTwoFactor || twoFactorSetupRequired ? (
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
                  isAuthenticated ? (
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
                  isAuthenticated ? (
                    <RoleRedirect />
                  ) : (
                    <Navigate to="/auth/login" replace />
                  )
                }
              />
            </Routes>

            {/* Global toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </Router>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;