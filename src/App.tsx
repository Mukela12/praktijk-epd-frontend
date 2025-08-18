import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider, useNotifications } from '@/components/ui/NotificationProvider';
import { PremiumNotifications } from '@/utils/premiumNotifications';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useAuth } from '@/store/authStore';
import { UserRole, AuthenticationState } from '@/types/auth';
import { useAuthMonitor } from '@/hooks/useAuthMonitor';

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
import ClientManagement from '@/pages/roles/admin/client-management/ClientManagement';
import AllTherapists from '@/pages/roles/admin/therapist-management/AllTherapists';
import FinancialDashboard from '@/pages/roles/admin/financial-management/FinancialDashboard';
import WaitingListManagement from '@/pages/roles/admin/waiting-list/WaitingListManagement';
import FinancialOverview from '@/pages/roles/admin/financial/FinancialOverview';
import AdminReports from '@/pages/roles/admin/reports/AdminReports';
import AdminSettings from '@/pages/roles/admin/settings/AdminSettings';
import ResourcesManagement from '@/pages/roles/admin/resources/ResourcesManagement';
import ChallengesManagement from '@/pages/roles/admin/challenges/ChallengesManagement';
import SurveysManagement from '@/pages/roles/admin/surveys/SurveysManagement';
import TherapiesManagement from '@/pages/roles/admin/therapies/TherapiesManagement';
import PsychologicalProblemsManagement from '@/pages/roles/admin/psychological-problems/PsychologicalProblemsManagement';
import AddressChangeManagement from '@/pages/roles/admin/AddressChangeManagement';
import UserManagement from '@/pages/roles/admin/user-management/UserManagement';
import AdminAppointmentsManagement from '@/pages/roles/admin/appointments/AppointmentsManagement';

// Therapist Components
import TherapistCalendar from '@/pages/roles/therapist/calendar/TherapistCalendar';
import TherapistMessages from '@/pages/roles/therapist/messages/TherapistMessages';
import TherapistClients from '@/pages/roles/therapist/clients/TherapistClients';
import TherapistAppointments from '@/pages/roles/therapist/appointments/TherapistAppointments';
// Removed imports for non-existent therapist components
import TherapistProfile from '@/pages/roles/therapist/profile/TherapistProfile';
import AvailabilityManagement from '@/pages/roles/therapist/AvailabilityManagement';
import TherapistSettings from '@/pages/roles/therapist/settings/TherapistSettings';
// Removed imports for non-existent therapist reports and notes

// Client Components
import ClientAppointments from '@/pages/roles/client/appointments/ClientAppointments';
import BookAppointment from '@/pages/roles/client/appointments/BookAppointment';
import ClientMessages from '@/pages/roles/client/messages/ClientMessages';
import ClientProfile from '@/pages/roles/client/profile/ClientProfile';
import ClientDocuments from '@/pages/roles/client/documents/ClientDocuments';
// Removed import for non-existent ClientBilling
import ClientInvoices from '@/pages/roles/client/invoices/ClientInvoices';
// Removed import for non-existent ClientBillingHistory
import PaymentCenter from '@/pages/roles/client/PaymentCenter';
import PaymentMethods from '@/pages/roles/client/PaymentMethods';
import SessionHistory from '@/pages/roles/client/SessionHistory';
// Removed import for non-existent TherapyJourney
import ClientResourcesImproved from '@/pages/roles/client/resources/ClientResourcesImproved';
import ClientResources from '@/pages/roles/client/resources/ClientResources';
import IntakeForm from '@/pages/roles/client/IntakeForm';
import ClientChallenges from '@/pages/roles/client/challenges/ClientChallenges';
import ClientSurveys from '@/pages/roles/client/surveys/ClientSurveys';
import ClientTherapist from '@/pages/roles/client/therapist/ClientTherapist';
// Removed import for non-existent ClientProgress
import AddressChangeRequest from '@/pages/roles/client/AddressChangeRequest';
// Removed import for non-existent ClientQuestionnaires
// Removed import for non-existent ClientNotes
import ClientSettings from '@/pages/roles/client/settings/ClientSettings';

// Assistant Components
import AssistantMessages from '@/pages/roles/assistant/messages/AssistantMessages';

// Bookkeeper Components
import BookkeeperDashboard from '@/pages/roles/bookkeeper/Dashboard';
import BookkeeperFinancialDashboard from '@/pages/roles/bookkeeper/financial/FinancialDashboard';
import InvoiceManagement from '@/pages/roles/bookkeeper/invoices/InvoiceManagement';
import Reports from '@/pages/roles/bookkeeper/reports/Reports';
import BookkeeperMessages from '@/pages/roles/bookkeeper/messages/BookkeeperMessages';
import BookkeeperSettings from '@/pages/roles/bookkeeper/settings/BookkeeperSettings';

// Other Components
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleRedirect from '@/components/auth/RoleRedirect';
import NetworkErrorHandler from '@/components/NetworkErrorHandler';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Component to initialize notification system
const NotificationInitializer: React.FC = () => {
  const { addNotification, removeNotification, clearAll } = useNotifications();
  
  useEffect(() => {
    // Initialize PremiumNotifications with the notification methods
    PremiumNotifications.init({
      addNotification,
      removeNotification,
      clearAll
    });
  }, [addNotification, removeNotification, clearAll]);
  
  return null;
};

// Component that renders routes and uses auth monitor
const AppRoutes: React.FC = () => {
  const { 
    isAuthenticated, 
    authenticationState, 
    refreshAuth, 
    user, 
    requiresTwoFactor, 
    twoFactorSetupRequired 
  } = useAuth();
  
  // Use auth monitor to handle automatic logout
  useAuthMonitor();
  
  return (
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
                    requiresTwoFactor || twoFactorSetupRequired ? (
                      <TwoFactorPage />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  } 
                />
                <Route path="*" element={<Navigate to="/auth/login" replace />} />
              </Routes>
            </AuthLayout>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN]}>
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="agenda" element={<AgendaPage />} />
                  <Route path="clients" element={<AllClients />} />
                  <Route path="clients/:clientId" element={<ClientManagement />} />
                  <Route path="therapists" element={<AllTherapists />} />
                  <Route path="waiting-list" element={<WaitingListManagement />} />
                  <Route path="financial" element={<FinancialOverview />} />
                  <Route path="financial-dashboard" element={<FinancialDashboard />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="resources" element={<ResourcesManagement />} />
                  <Route path="challenges" element={<ChallengesManagement />} />
                  <Route path="surveys" element={<SurveysManagement />} />
                  <Route path="therapies" element={<TherapiesManagement />} />
                  <Route path="psychological-problems" element={<PsychologicalProblemsManagement />} />
                  <Route path="address-changes" element={<AddressChangeManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="appointments" element={<AdminAppointmentsManagement />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Therapist routes */}
        <Route
          path="/therapist/*"
          element={
            <ProtectedRoute roles={[UserRole.THERAPIST, UserRole.SUBSTITUTE]}>
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<TherapistDashboard />} />
                  <Route path="calendar" element={<TherapistCalendar />} />
                  <Route path="messages" element={<TherapistMessages />} />
                  <Route path="appointments" element={<TherapistAppointments />} />
                  <Route path="clients" element={<TherapistClients />} />
                  {/* <Route path="clients/:clientId" element={<TherapistClientProfile />} /> */}
                  {/* <Route path="client/:clientId" element={<ClientOverview />} /> */}
                  {/* <Route path="billing" element={<TherapistBilling />} /> */}
                  <Route path="profile" element={<TherapistProfile />} />
                  <Route path="availability" element={<AvailabilityManagement />} />
                  <Route path="settings" element={<TherapistSettings />} />
                  {/* <Route path="reports" element={<TherapistReports />} /> */}
                  {/* <Route path="notes" element={<TherapistNotes />} /> */}
                  <Route path="*" element={<Navigate to="/therapist/dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Client routes */}
        <Route
          path="/client/*"
          element={
            <ProtectedRoute roles={[UserRole.CLIENT]}>
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<ClientDashboard />} />
                  <Route path="appointments" element={<ClientAppointments />} />
                  <Route path="appointments/new" element={<BookAppointment />} />
                  <Route path="messages" element={<ClientMessages />} />
                  <Route path="profile" element={<ClientProfile />} />
                  <Route path="documents" element={<ClientDocuments />} />
                  {/* <Route path="billing" element={<ClientBilling />} /> */}
                  <Route path="invoices" element={<ClientInvoices />} />
                  {/* <Route path="billing-history" element={<ClientBillingHistory />} /> */}
                  <Route path="payment-center" element={<PaymentCenter />} />
                  <Route path="payment-methods" element={<PaymentMethods />} />
                  <Route path="session-history" element={<SessionHistory />} />
                  {/* <Route path="therapy-journey" element={<TherapyJourney />} /> */}
                  <Route path="resources" element={<ClientResourcesImproved />} />
                  <Route path="resources-old" element={<ClientResources />} />
                  <Route path="intake" element={<IntakeForm />} />
                  <Route path="challenges" element={<ClientChallenges />} />
                  <Route path="surveys" element={<ClientSurveys />} />
                  <Route path="therapist" element={<ClientTherapist />} />
                  {/* <Route path="progress" element={<ClientProgress />} /> */}
                  <Route path="address-change" element={<AddressChangeRequest />} />
                  {/* <Route path="questionnaires" element={<ClientQuestionnaires />} /> */}
                  {/* <Route path="notes" element={<ClientNotes />} /> */}
                  <Route path="settings" element={<ClientSettings />} />
                  <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Assistant routes */}
        <Route
          path="/assistant/*"
          element={
            <ProtectedRoute roles={[UserRole.ASSISTANT]}>
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="agenda" element={<AgendaPage />} />
                  <Route path="messages" element={<AssistantMessages />} />
                  <Route path="*" element={<Navigate to="/assistant/dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Bookkeeper routes */}
        <Route
          path="/bookkeeper/*"
          element={
            <ProtectedRoute roles={[UserRole.BOOKKEEPER]}>
              <DashboardLayout>
                <Routes>
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
  );
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

    // Add a small delay to prevent immediate API calls that might fail
    const timer = setTimeout(() => {
      initAuth();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // Remove dependencies to prevent infinite loops

  // Add a loading timeout
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  
  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (authenticationState === AuthenticationState.AUTHENTICATING) {
      // Set a 3-second timeout for authentication
      timeout = setTimeout(() => {
        setLoadingTimeout(true);
      }, 3000);
    } else {
      setLoadingTimeout(false);
    }
    
    return () => clearTimeout(timeout);
  }, [authenticationState]);

  // Show loading screen while initializing
  if (authenticationState === AuthenticationState.AUTHENTICATING && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <NetworkErrorHandler>
            <LanguageProvider>
              <NotificationInitializer />
              <Router>
                <AppRoutes />
              </Router>
            </LanguageProvider>
          </NetworkErrorHandler>
        </NotificationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;