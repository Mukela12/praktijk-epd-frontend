import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  roles?: string[]; // Support both prop names
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, roles }) => {
  // Use either allowedRoles or roles prop
  const requiredRoles = allowedRoles || roles;
  const { user, isAuthenticated, isLoading, refreshAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Try to refresh auth on mount if we have a token but no user
    const token = localStorage.getItem('accessToken');
    console.log('[ProtectedRoute] useEffect - token:', !!token, 'user:', !!user, 'isLoading:', isLoading);
    
    if (token && !user && !isLoading) {
      console.log('[ProtectedRoute] Have token but no user, refreshing auth...');
      refreshAuth().catch(() => {
        // If refresh fails, the API interceptor will handle redirect
        console.log('[ProtectedRoute] Auth refresh failed');
      });
    }
  }, [user, isLoading, refreshAuth]);

  // Check for token on every render
  const hasToken = localStorage.getItem('accessToken');
  
  // Get current state from localStorage to check 2FA state
  const storedAuthState = localStorage.getItem('praktijk-epd-auth');
  let is2FAState = false;
  
  try {
    if (storedAuthState) {
      const parsedState = JSON.parse(storedAuthState);
      is2FAState = parsedState.state?.requiresTwoFactor || 
                   parsedState.state?.authenticationState === 'REQUIRES_2FA_VERIFICATION';
    }
  } catch (e) {
    // Ignore parse errors
  }

  // If we're in 2FA verification state, don't redirect
  if (is2FAState) {
    console.log('[ProtectedRoute] In 2FA verification state, not redirecting');
    return null; // Let the 2FA page handle this
  }

  // If no token at all, redirect immediately
  if (!hasToken) {
    console.log('[ProtectedRoute] No token found, redirecting to login');
    // Don't navigate if we're already on the login page
    if (location.pathname === '/auth/login') {
      return null;
    }
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // If not authenticated after loading, redirect to login
  if (!isAuthenticated || !user) {
    console.log('[ProtectedRoute] Not authenticated, checking token...');
    console.log('[ProtectedRoute] isAuthenticated:', isAuthenticated);
    console.log('[ProtectedRoute] user:', user);
    console.log('[ProtectedRoute] hasToken:', hasToken);
    
    // If we have a token but no user yet, wait for auth to load
    if (hasToken && !user) {
      console.log('[ProtectedRoute] Has token but no user, showing loading...');
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="large" />
        </div>
      );
    }
    
    // Only redirect to login if we truly have no auth
    if (!hasToken) {
      console.log('[ProtectedRoute] No token, redirecting to login');
      return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }
  }

  // Check role-based access
  if (requiredRoles && requiredRoles.length > 0 && user) {
    if (!requiredRoles.includes(user.role)) {
      console.log('[ProtectedRoute] User role not allowed, redirecting to dashboard');
      // Redirect to appropriate dashboard based on user role
      const dashboardPath = user.role === 'admin' ? '/admin/dashboard' :
                          user.role === 'therapist' ? '/therapist/dashboard' :
                          user.role === 'client' ? '/client/dashboard' :
                          user.role === 'bookkeeper' ? '/bookkeeper/dashboard' :
                          user.role === 'assistant' ? '/assistant/dashboard' :
                          '/';
      return <Navigate to={dashboardPath} replace />;
    }
  }

  // Check for 2FA requirements
  if (user && user.two_factor_enabled && !user.two_factor_setup_completed) {
    if (!location.pathname.includes('/auth/2fa')) {
      return <Navigate to="/auth/2fa" state={{ from: location }} replace />;
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default ProtectedRoute;