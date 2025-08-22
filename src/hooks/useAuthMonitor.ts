import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';

/**
 * Hook that monitors authentication status and handles automatic logout
 * when no valid token exists or when authentication fails.
 */
export const useAuthMonitor = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const isLogoutInProgress = useRef(false);

  useEffect(() => {
    // Set up an interval to check auth status periodically
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('accessToken');
      const currentPath = window.location.pathname;
      
      // Skip check if we're on auth pages
      if (currentPath.startsWith('/auth/')) {
        return;
      }
      
      // Get current auth state from store to avoid dependency issues
      const currentState = (window as any).useAuthStore?.getState();
      
      // Skip check if we're in 2FA verification state
      if (currentState?.requiresTwoFactor || currentState?.authenticationState === 'REQUIRES_2FA_VERIFICATION') {
        console.log('[useAuthMonitor] In 2FA verification state, skipping auth check');
        return;
      }
      
      // If no token and we're on a protected route, clear auth and navigate to login
      if (!token && currentPath !== '/' && currentPath !== '/auth/login') {
        // Prevent multiple simultaneous logout attempts
        if (isLogoutInProgress.current) {
          return;
        }
        
        // No token found, clearing auth
        isLogoutInProgress.current = true;
        
        try {
          await logout();
          navigate('/auth/login', { replace: true });
        } finally {
          isLogoutInProgress.current = false;
        }
      }
    };

    // Don't check immediately - wait a bit for auth state to settle
    const timeoutId = setTimeout(() => {
      checkAuthStatus();
      
      // Then check every 5 seconds
      const interval = setInterval(checkAuthStatus, 5000);
      
      // Store interval for cleanup
      (window as any).__authMonitorInterval = interval;
    }, 1000); // Wait 1 second before first check

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
  }, [navigate, logout]);

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