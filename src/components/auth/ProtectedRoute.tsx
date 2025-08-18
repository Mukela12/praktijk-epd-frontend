import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import { UserRole, UserStatus, AuthenticationState } from '@/types/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTranslation } from '@/contexts/LanguageContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireEmailVerification?: boolean;
  require2FA?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireEmailVerification = true,
  require2FA = false
}) => {
  const { 
    authenticationState, 
    user, 
    canAccess
  } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Show loading spinner while authenticating
  if (authenticationState === AuthenticationState.AUTHENTICATING) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" text={t('action.loading')} />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || authenticationState === AuthenticationState.IDLE || authenticationState === AuthenticationState.ERROR) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Handle 2FA requirements
  if (authenticationState === AuthenticationState.REQUIRES_2FA_SETUP) {
    return <Navigate to="/auth/2fa" state={{ from: location }} replace />;
  }

  if (authenticationState === AuthenticationState.REQUIRES_2FA_VERIFICATION) {
    return <Navigate to="/auth/2fa" state={{ from: location }} replace />;
  }

  // Only allow access if authentication is complete
  if (authenticationState !== AuthenticationState.AUTHENTICATED_COMPLETE) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check if user's role has access
  if (allowedRoles.length > 0 && !canAccess(allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page. Your current role is: {t(`role.${user.role.toLowerCase()}`)}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check email verification
  if (requireEmailVerification && !user.email_verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Email Verification Required
          </h3>
          <p className="text-gray-600 mb-4">
            Please verify your email address to access the dashboard. Check your inbox for a verification link.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                // Implement resend verification email
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Resend Verification Email
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              I've Verified My Email
            </button>
          </div>
        </div>
      </div>
    );
  }


  // Check if account is suspended
  if (user.status === UserStatus.SUSPENDED) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636A9 9 0 015.636 18.364" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Account Suspended
          </h3>
          <p className="text-gray-600 mb-4">
            Your account has been suspended. Please contact the administrator for more information.
          </p>
          <button
            onClick={() => {
              // Implement contact support
              window.location.href = 'mailto:support@praktijkepd.nl';
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  // Check if account is inactive
  if (user.status === UserStatus.INACTIVE) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Account Inactive
          </h3>
          <p className="text-gray-600 mb-4">
            Your account is currently inactive. Please contact the administrator to activate your account.
          </p>
          <button
            onClick={() => {
              // Implement contact support
              window.location.href = 'mailto:support@praktijkepd.nl';
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default ProtectedRoute;