// Auth debugging utilities
export const authDebug = {
  // Check current auth state
  checkAuthState: () => {
    console.log('=== Auth Debug Info ===');
    console.log('Access Token:', localStorage.getItem('accessToken'));
    console.log('User:', localStorage.getItem('user'));
    console.log('Temp Token:', localStorage.getItem('tempToken'));
    console.log('Pending Login:', localStorage.getItem('pendingLogin'));
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.error('Invalid token format - should have 3 parts');
        } else {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token payload:', payload);
          console.log('Token expiry:', new Date(payload.exp * 1000));
          console.log('Token expired:', new Date(payload.exp * 1000) < new Date());
        }
      } catch (e) {
        console.error('Failed to parse token:', e);
      }
    }
    console.log('===================');
  },

  // Clear all auth data
  clearAllAuth: () => {
    console.log('Clearing all auth data...');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tempToken');
    localStorage.removeItem('pendingLogin');
    localStorage.removeItem('praktijk-epd-auth');
    console.log('Auth data cleared');
  },

  // Fix malformed token
  fixToken: () => {
    const token = localStorage.getItem('accessToken');
    if (token && !token.includes('.')) {
      console.log('Token appears malformed, clearing...');
      localStorage.removeItem('accessToken');
    }
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).authDebug = authDebug;
}