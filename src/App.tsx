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
import AdminDashboard from '@/pages/roles/admin/Dashboard';
import TherapistDashboard from '@/pages/roles/therapist/Dashboard';
import ClientDashboard from '@/pages/roles/client/Dashboard';

// Admin Components
import AgendaPage from '@/pages/roles/admin/agenda/AgendaPage';
import AllClients from '@/pages/roles/admin/client-management/AllClients';
import AllTherapists from '@/pages/roles/admin/therapist-management/AllTherapists';
import FinancialDashboard from '@/pages/roles/admin/financial-management/FinancialDashboard';
import WaitingListManagement from '@/pages/roles/admin/waiting-list/WaitingListManagement';
import FinancialOverview from '@/pages/roles/admin/financial/FinancialOverview';
import AdminReports from '@/pages/roles/admin/reports/AdminReports';
import AdminSettings from '@/pages/roles/admin/settings/AdminSettings';
import ResourcesManagement from '@/pages/roles/admin/resources/ResourcesManagement';
import ChallengesManagement from '@/pages/roles/admin/challenges/ChallengesManagement';
import SurveysManagement from '@/pages/roles/admin/surveys/SurveysManagement';
import AddressChangeManagement from '@/pages/roles/admin/AddressChangeManagement';

// Therapist Components
import TherapistCalendar from '@/pages/roles/therapist/calendar/TherapistCalendar';
import TherapistMessages from '@/pages/roles/therapist/messages/TherapistMessages';
import TherapistClients from '@/pages/roles/therapist/clients/TherapistClients';
import TherapistAppointments from '@/pages/roles/therapist/appointments/TherapistAppointments';
import TherapistSettings from '@/pages/roles/therapist/settings/TherapistSettings';
import TherapistChallengesManagement from '@/pages/roles/therapist/challenges/ChallengesManagement';
import TherapistSurveysManagement from '@/pages/roles/therapist/surveys/SurveysManagement';
import AvailabilityManagement from '@/pages/roles/therapist/AvailabilityManagement';

// Client Components
import ClientAppointments from '@/pages/roles/client/appointments/ClientAppointments';
import ClientMessages from '@/pages/roles/client/messages/ClientMessages';
import ClientTherapist from '@/pages/roles/client/therapist/ClientTherapist';
import ClientSettings from '@/pages/roles/client/settings/ClientSettings';
import AddressChangeRequest from '@/pages/roles/client/AddressChangeRequest';
import IntakeForm from '@/pages/roles/client/IntakeForm';
import BankInformation from '@/pages/roles/client/BankInformation';
import ClientInvoices from '@/pages/roles/client/invoices/ClientInvoices';
import ClientDocuments from '@/pages/roles/client/documents/ClientDocuments';
import SessionHistory from '@/pages/roles/client/SessionHistory';
import PaymentCenter from '@/pages/roles/client/PaymentCenter';
import PaymentMethods from '@/pages/roles/client/PaymentMethods';

// Assistant Components
import AssistantDashboard from '@/pages/roles/assistant/Dashboard';
import ClientSupport from '@/pages/roles/assistant/client-support/ClientSupport';
import AssistantMessages from '@/pages/roles/assistant/messages/AssistantMessages';
import AssistantScheduling from '@/pages/roles/assistant/scheduling/AssistantScheduling';
import AssistantSettings from '@/pages/roles/assistant/settings/AssistantSettings';

// Bookkeeper Components
import BookkeeperDashboard from '@/pages/roles/bookkeeper/Dashboard';
import BookkeeperFinancialDashboard from '@/pages/roles/bookkeeper/financial/FinancialDashboard';
import InvoiceManagement from '@/pages/roles/bookkeeper/invoices/InvoiceManagement';
import Reports from '@/pages/roles/bookkeeper/reports/Reports';
import BookkeeperMessages from '@/pages/roles/bookkeeper/messages/BookkeeperMessages';
import BookkeeperSettings from '@/pages/roles/bookkeeper/settings/BookkeeperSettings';

// Profile Components
import TherapistProfile from '@/pages/roles/therapist/profile/TherapistProfile';
import TherapistInvoices from '@/pages/roles/therapist/invoices/TherapistInvoices';
import ClientProfile from '@/pages/roles/client/profile/ClientProfile';

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
      const persistedUser = localStorage.getItem('user');
      
      // If we have a token and either no user or the auth state suggests we should refresh
      if (token && (!user || authenticationState === AuthenticationState.IDLE)) {
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
                        <Route path="agenda" element={<AgendaPage />} />
                        <Route path="clients" element={<AllClients />} />
                        <Route path="therapists" element={<AllTherapists />} />
                        <Route path="financial" element={<FinancialDashboard />} />
                        <Route path="waiting-list" element={<WaitingListManagement />} />
                        <Route path="reports" element={<AdminReports />} />
                        <Route path="settings" element={<AdminSettings />} />
                        <Route path="resources" element={<ResourcesManagement />} />
                        <Route path="challenges" element={<ChallengesManagement />} />
                        <Route path="surveys" element={<SurveysManagement />} />
                        <Route path="address-changes" element={<AddressChangeManagement />} />
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
                        <Route path="agenda" element={<TherapistCalendar />} />
                        <Route path="clients" element={<TherapistClients />} />
                        <Route path="appointments" element={<TherapistAppointments />} />
                        <Route path="messages" element={<TherapistMessages />} />
                        <Route path="profile" element={<TherapistProfile />} />
                        <Route path="invoices" element={<TherapistInvoices />} />
                        <Route path="settings" element={<TherapistSettings />} />
                        <Route path="challenges" element={<TherapistChallengesManagement />} />
                        <Route path="surveys" element={<TherapistSurveysManagement />} />
                        <Route path="availability" element={<AvailabilityManagement />} />
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
                        <Route path="agenda" element={<ClientAppointments />} />
                        <Route path="appointments" element={<ClientAppointments />} />
                        <Route path="therapist" element={<ClientTherapist />} />
                        <Route path="messages" element={<ClientMessages />} />
                        <Route path="profile" element={<ClientProfile />} />
                        <Route path="settings" element={<ClientSettings />} />
                        <Route path="address-change" element={<AddressChangeRequest />} />
                        <Route path="intake-form" element={<IntakeForm />} />
                        <Route path="payment-methods" element={<PaymentMethods />} />
                        <Route path="payment-center" element={<PaymentCenter />} />
                        <Route path="invoices" element={<ClientInvoices />} />
                        <Route path="documents" element={<ClientDocuments />} />
                        <Route path="session-history" element={<SessionHistory />} />
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
                        <Route path="" element={<AssistantDashboard />} />
                        <Route path="dashboard" element={<AssistantDashboard />} />
                        <Route path="agenda" element={<AssistantScheduling />} />
                        <Route path="client-support" element={<ClientSupport />} />
                        <Route path="messages" element={<AssistantMessages />} />
                        <Route path="scheduling" element={<AssistantScheduling />} />
                        <Route path="settings" element={<AssistantSettings />} />
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
                        <Route path="" element={<BookkeeperDashboard />} />
                        <Route path="dashboard" element={<BookkeeperDashboard />} />
                        <Route path="agenda" element={<BookkeeperFinancialDashboard />} />
                        <Route path="financial" element={<BookkeeperFinancialDashboard />} />
                        <Route path="invoices" element={<InvoiceManagement />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="messages" element={<BookkeeperMessages />} />
                        <Route path="settings" element={<BookkeeperSettings />} />
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