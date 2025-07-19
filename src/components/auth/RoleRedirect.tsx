import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import { UserRole, AuthenticationState } from '@/types/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTranslation } from '@/contexts/LanguageContext';

/**
 * Component that redirects users to their role-specific dashboard
 */
const RoleRedirect: React.FC = () => {
  const { user, authenticationState, navigation } = useAuth();
  const { t } = useTranslation();

  console.log('[RoleRedirect] Current state:', {
    authenticationState,
    userEmail: user?.email,
    userRole: user?.role,
    has2FA: user?.two_factor_enabled,
    has2FASetupCompleted: user?.two_factor_setup_completed
  });

  // Show loading while authenticating
  if (authenticationState === AuthenticationState.AUTHENTICATING) {
    console.log('[RoleRedirect] Still authenticating, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" text="Redirecting..." />
      </div>
    );
  }

  // Handle invalid states first - if authenticated but no user, this is an error state
  if (authenticationState === AuthenticationState.AUTHENTICATED_COMPLETE && !user) {
    console.log('[RoleRedirect] Invalid state: authenticated but no user, redirecting to login');
    return <Navigate to="/auth/login" replace />;
  }

  // Handle different authentication states
  if (!user) {
    console.log('[RoleRedirect] No user, redirecting to login');
    return <Navigate to="/auth/login" replace />;
  }

  // Handle 2FA states
  if (authenticationState === AuthenticationState.REQUIRES_2FA_SETUP || 
      authenticationState === AuthenticationState.REQUIRES_2FA_VERIFICATION) {
    console.log('[RoleRedirect] 2FA required, redirecting to /auth/2fa');
    return <Navigate to="/auth/2fa" replace />;
  }

  // Redirect to login if not fully authenticated
  if (authenticationState !== AuthenticationState.AUTHENTICATED_COMPLETE) {
    console.log('[RoleRedirect] Not fully authenticated, redirecting to login');
    return <Navigate to="/auth/login" replace />;
  }

  // Use the centralized navigation helper
  const redirectPath = navigation.getDashboardPath(user.role);
  console.log('[RoleRedirect] Redirecting to dashboard:', redirectPath);

  return <Navigate to={redirectPath} replace />;
};

export default RoleRedirect;