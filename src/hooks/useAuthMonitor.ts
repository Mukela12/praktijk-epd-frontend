import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';

/**
 * Hook that monitors authentication status and handles automatic logout
 * when no valid token exists or when authentication fails.
 */
export const useAuthMonitor = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, authenticationState } = useAuth();

  useEffect(() => {
    let isLogoutInProgress = false;
    
    // Set up an interval to check auth status periodically
    const checkAuthStatus = () => {
      // Prevent multiple logout attempts
      if (isLogoutInProgress) {
        return;
      }
      
      const token = localStorage.getItem('accessToken');
      const currentPath = window.location.pathname;
      
      // Skip check if we're on auth pages
      if (currentPath.startsWith('/auth/')) {
        return;
      }
      
      // Skip check if we're in the middle of authentication
      if (authenticationState === 'AUTHENTICATING' || authenticationState === 'REQUIRES_2FA_VERIFICATION') {
        return;
      }
      
      // If no token and we're on a protected route, clear auth and navigate to login
      if (!token && currentPath !== '/' && currentPath !== '/auth/login') {
        console.log('[useAuthMonitor] No token found, clearing auth');
        isLogoutInProgress = true;
        logout().finally(() => {
          isLogoutInProgress = false;
          navigate('/auth/login', { replace: true });
        });
      }
    };

    // Check after a delay to allow auth to initialize
    const timeoutId = setTimeout(() => {
      checkAuthStatus();
      
      // Then check every 30 seconds (reduced frequency)
      const interval = setInterval(checkAuthStatus, 30000);
      
      // Store interval ID for cleanup
      (window as any).__authMonitorInterval = interval;
    }, 2000); // 2 second initial delay

    // Also listen for storage events (logout from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' && !e.newValue) {
        console.log('[useAuthMonitor] Token removed in another tab');
        logout();
        navigate('/auth/login', { replace: true });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearTimeout(timeoutId);
      if ((window as any).__authMonitorInterval) {
        clearInterval((window as any).__authMonitorInterval);
        delete (window as any).__authMonitorInterval;
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate, logout, authenticationState]);

  return { isAuthenticated, user };
};

/**
 * Hook to prevent authenticated users from accessing auth pages
 */
export const useRedirectIfAuthenticated = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardPath = user.role === 'admin' ? '/admin/dashboard' :
                          user.role === 'therapist' ? '/therapist/dashboard' :
                          user.role === 'client' ? '/client/dashboard' :
                          user.role === 'bookkeeper' ? '/bookkeeper/dashboard' :
                          user.role === 'assistant' ? '/assistant/dashboard' :
                          '/';
      navigate(dashboardPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
};