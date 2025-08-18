import { create } from 'zustand';
import { authService, User } from '@/services/authService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needs2FA: boolean;
  loginCredentials: { email: string; password: string } | null;
  
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; needs2FA: boolean; error?: string }>;
  loginWith2FA: (code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useSimpleAuth = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  needs2FA: false,
  loginCredentials: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    try {
      const response = await authService.login(email, password);
      
      if (response.requiresTwoFactor) {
        // Store credentials for 2FA step
        set({
          isLoading: false,
          needs2FA: true,
          loginCredentials: { email, password }
        });
        return { success: true, needs2FA: true };
      }
      
      if (response.success && response.user) {
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          needs2FA: false,
          loginCredentials: null
        });
        return { success: true, needs2FA: false };
      }
      
      set({ isLoading: false });
      return { success: false, needs2FA: false, error: response.message || 'Login failed' };
    } catch (error: any) {
      set({ isLoading: false });
      const errorMessage = error.response?.data?.message || 'Login failed';
      return { success: false, needs2FA: false, error: errorMessage };
    }
  },

  loginWith2FA: async (code: string) => {
    const { loginCredentials } = get();
    if (!loginCredentials) {
      return { success: false, error: 'No login credentials found' };
    }

    set({ isLoading: true });
    
    try {
      const response = await authService.loginWith2FA(
        loginCredentials.email,
        loginCredentials.password,
        code
      );
      
      if (response.success && response.user) {
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          needs2FA: false,
          loginCredentials: null
        });
        return { success: true };
      }
      
      set({ isLoading: false });
      return { success: false, error: response.message || '2FA verification failed' };
    } catch (error: any) {
      set({ isLoading: false });
      const errorMessage = error.response?.data?.message || 'Invalid 2FA code';
      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      needs2FA: false,
      loginCredentials: null
    });
  },

  checkAuth: async () => {
    // Check stored auth first
    const storedUser = authService.getStoredUser();
    const storedToken = authService.getStoredToken();
    
    if (storedUser && storedToken) {
      set({
        user: storedUser,
        isAuthenticated: true
      });
      
      // Verify with server in background
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        set({ user: currentUser });
      } else {
        // Token invalid, clear auth
        set({
          user: null,
          isAuthenticated: false
        });
      }
    } else {
      set({
        user: null,
        isAuthenticated: false
      });
    }
  },

  clearError: () => {
    set({ needs2FA: false, loginCredentials: null });
  }
}));

// Initialize auth check on store creation
useSimpleAuth.getState().checkAuth();