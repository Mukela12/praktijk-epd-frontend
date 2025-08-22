import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { AuthenticationState } from '@/types/auth';

interface SimpleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  roles?: string[]; // Support both prop names
}

export const SimpleProtectedRoute: React.FC<SimpleProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  roles 
}) => {
  const requiredRoles = allowedRoles || roles;
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get store state directly to avoid hook dependencies
  const authState = useAuthStore.getState();
  const { user, authenticationState, refreshAuth } = authState;
  
  // Check for token
  const hasToken = localStorage.getItem('accessToken');
  
  // Initialize auth on mount if we have a token but no user
  useEffect(() => {
    const initAuth = async () => {
      if (hasToken && !user && authenticationState === AuthenticationState.IDLE) {
        // Initializing auth with token
        try {
          await refreshAuth();
        } catch (error) {
          console.error('[SimpleProtectedRoute] Auth refresh failed:', error);
        }
      }
      setIsInitialized(true);
    };
    
    initAuth();
  }, []); // Empty dependency array - only run once on mount
  
  // Don't render anything until initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  // If in 2FA verification state, don't redirect - let 2FA page handle it
  if (authenticationState === AuthenticationState.REQUIRES_2FA_VERIFICATION) {
    console.log('[SimpleProtectedRoute] In 2FA verification state, not redirecting');
    return null;
  }
  
  // If authenticating, show loading
  if (authenticationState === AuthenticationState.AUTHENTICATING) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  // If no token, redirect to login
  if (!hasToken) {
    // No token found, redirecting to login
    // Don't navigate if we're already on the login page
    if (location.pathname === '/auth/login') {
      return null;
    }
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  // If we have token but no user after initialization, redirect to login
  if (!user) {
    // Have token but no user after init, redirecting to login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  // Check role-based access
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(user.role)) {
      // Redirect to user's own dashboard
      const dashboardPath = 
        user.role === 'admin' ? '/admin/dashboard' :
        user.role === 'therapist' ? '/therapist/dashboard' :
        user.role === 'substitute' ? '/therapist/dashboard' :
        user.role === 'client' ? '/client/dashboard' :
        user.role === 'bookkeeper' ? '/bookkeeper/dashboard' :
        user.role === 'assistant' ? '/assistant/dashboard' :
        '/';
      
      return <Navigate to={dashboardPath} replace />;
    }
  }
  
  // Check if 2FA setup is required
  if (authenticationState === AuthenticationState.REQUIRES_2FA_SETUP) {
    if (!location.pathname.includes('/auth/2fa')) {
      return <Navigate to="/auth/2fa" state={{ from: location }} replace />;
    }
  }
  
  // All checks passed
  return <>{children}</>;
};

export default SimpleProtectedRoute;