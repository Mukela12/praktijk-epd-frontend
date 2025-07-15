import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import { UserRole } from '@/types/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Component that redirects users to their role-specific dashboard
 */
const RoleRedirect: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" text="Redirecting..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Determine redirect path based on user role
  const getRedirectPath = (): string => {
    switch (user.role) {
      case UserRole.ADMIN:
        return '/admin/dashboard';
      
      case UserRole.THERAPIST:
      case UserRole.SUBSTITUTE:
        return '/therapist/dashboard';
      
      case UserRole.CLIENT:
        return '/client/dashboard';
      
      case UserRole.ASSISTANT:
        return '/assistant/dashboard';
      
      case UserRole.BOOKKEEPER:
        return '/bookkeeper/dashboard';
      
      default:
        // Fallback to client dashboard
        return '/client/dashboard';
    }
  };

  return <Navigate to={getRedirectPath()} replace />;
};

export default RoleRedirect;