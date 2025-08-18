import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSimpleAuth } from '@/store/simpleAuthStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface SimpleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const SimpleProtectedRoute: React.FC<SimpleProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isAuthenticated, checkAuth } = useSimpleAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = React.useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsChecking(false);
    };
    verifyAuth();
  }, [checkAuth]);

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect to user's dashboard
      const dashboardRoutes: Record<string, string> = {
        admin: '/admin/dashboard',
        therapist: '/therapist/dashboard',
        substitute: '/therapist/dashboard',
        client: '/client/dashboard',
        assistant: '/assistant/dashboard',
        bookkeeper: '/bookkeeper/dashboard',
      };
      
      const userDashboard = dashboardRoutes[user.role] || '/';
      return <Navigate to={userDashboard} replace />;
    }
  }

  // Check 2FA setup for roles that require it
  const requires2FA = ['admin', 'therapist', 'bookkeeper', 'assistant', 'substitute'].includes(user.role);
  if (requires2FA && user.two_factor_enabled && !user.two_factor_setup_completed) {
    if (!location.pathname.includes('/auth/2fa-setup')) {
      return <Navigate to="/auth/2fa-setup" state={{ from: location }} replace />;
    }
  }

  // All checks passed
  return <>{children}</>;
};

export default SimpleProtectedRoute;