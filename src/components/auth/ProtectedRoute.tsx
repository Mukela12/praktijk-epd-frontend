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
    if (token && !user && !isLoading) {
      refreshAuth().catch(() => {
        // If refresh fails, the API interceptor will handle redirect
        console.log('[ProtectedRoute] Auth refresh failed');
      });
    }
  }, []);

  // Check for token on every render
  const hasToken = localStorage.getItem('accessToken');

  // If no token at all, redirect immediately
  if (!hasToken) {
    console.log('[ProtectedRoute] No token found, redirecting to login');
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
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRoles && requiredRoles.length > 0) {
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
  if (user.two_factor_enabled && !user.two_factor_setup_completed) {
    if (!location.pathname.includes('/auth/2fa')) {
      return <Navigate to="/auth/2fa" state={{ from: location }} replace />;
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default ProtectedRoute;