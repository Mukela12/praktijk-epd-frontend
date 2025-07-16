import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '@/services/api';
import { 
  User, 
  AuthState, 
  LoginCredentials, 
  RegisterData, 
  UserRole,
  TwoFactorSetup 
} from '@/types/auth';
import { toast } from 'react-hot-toast';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean | 'email_not_verified'>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setup2FA: () => Promise<TwoFactorSetup | null>;
  verify2FA: (code: string, secret?: string) => Promise<boolean>;
  disable2FA: (code: string) => Promise<boolean>;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setRequiresTwoFactor: (requires: boolean) => void;
  setTwoFactorSetupRequired: (required: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  
  // Computed values
  isAdmin: () => boolean;
  isTherapist: () => boolean;
  isClient: () => boolean;
  canAccess: (roles: UserRole[]) => boolean;
  getDisplayName: () => string;
  getRoleColor: () => string;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      requiresTwoFactor: false,
      twoFactorSetupRequired: false,

      // Actions
      login: async (credentials: LoginCredentials): Promise<boolean | 'email_not_verified'> => {
        try {
          set({ isLoading: true, requiresTwoFactor: false });
          
          const response = await authApi.login(credentials);
          
          if (response.success) {
            if (response.requiresTwoFactor) {
              // Store partial authentication state for 2FA flow
              set({ 
                requiresTwoFactor: true,
                isLoading: false,
                // Store email for 2FA verification
                user: { email: credentials.email } as any
              });
              return false; // Need 2FA verification
            }
            
            set({
              user: response.user || null,
              accessToken: response.accessToken || null,
              isAuthenticated: true,
              isLoading: false,
              requiresTwoFactor: false,
              twoFactorSetupRequired: response.twoFactorSetupRequired || false
            });
            
            toast.success('Login successful!');
            return true;
          }
          
          toast.error(response.message || 'Login failed');
          return false;
        } catch (error: any) {
          set({ isLoading: false, requiresTwoFactor: false });
          
          // Check if error is due to unverified email
          if (error.response?.status === 403 && 
              error.response?.data?.message?.includes('verify your email')) {
            // Don't show toast error for email verification - let the component handle the redirect
            return 'email_not_verified';
          }
          
          const message = error.response?.data?.message || 'Login failed';
          toast.error(message);
          return false;
        }
      },

      register: async (userData: RegisterData): Promise<boolean> => {
        try {
          set({ isLoading: true });
          
          console.log('=== AUTHSTORE REGISTER ===');
          console.log('Sending registration data to API:', userData);
          
          const response = await authApi.register(userData);
          
          console.log('API Response:', response);
          
          if (response.success) {
            // Clear any existing auth state that might interfere with navigation
            set({ 
              isLoading: false,
              user: null,
              accessToken: null,
              isAuthenticated: false,
              requiresTwoFactor: false,
              twoFactorSetupRequired: false
            });
            
            toast.success('Registration successful! Please check your email to verify your account.');
            return true;
          }
          
          console.log('Registration failed with response:', response);
          toast.error(response.message || 'Registration failed');
          set({ isLoading: false });
          return false;
        } catch (error: any) {
          console.error('=== AUTHSTORE REGISTER ERROR ===');
          console.error('Error caught in authStore:', error);
          console.error('Error response:', error.response);
          console.error('Error response data:', error.response?.data);
          
          // Log specific validation errors
          if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
            console.error('Specific validation errors from backend:');
            console.error('Raw errors array:', error.response.data.errors);
            error.response.data.errors.forEach((err: any, index: number) => {
              console.error(`  ${index + 1}.`, err);
              if (typeof err === 'object') {
                console.error(`     Field: ${err.field || err.path || 'unknown'}`);
                console.error(`     Message: ${err.message || err.msg || JSON.stringify(err)}`);
              }
            });
          }
          
          const message = error.response?.data?.message || 'Registration failed';
          toast.error(message);
          set({ isLoading: false });
          return false;
        }
      },

      logout: async (): Promise<void> => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            requiresTwoFactor: false,
            twoFactorSetupRequired: false
          });
          toast.success('Logged out successfully');
        }
      },

      refreshAuth: async (): Promise<void> => {
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) {
            get().clearAuth();
            return;
          }

          set({ isLoading: true });
          const user = await authApi.getCurrentUser();
          
          set({
            user,
            accessToken: token,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          console.error('Auth refresh failed:', error);
          get().clearAuth();
        }
      },

      setup2FA: async (): Promise<TwoFactorSetup | null> => {
        try {
          const setup = await authApi.setup2FA();
          toast.success('2FA setup initiated. Scan the QR code with your authenticator app.');
          return setup;
        } catch (error: any) {
          console.error('2FA setup error:', error);
          let message = '2FA setup failed';
          
          if (error.response?.status === 409) {
            message = '2FA is already enabled for this account';
          } else if (error.response?.status === 429) {
            message = 'Too many requests. Please wait a moment before trying again.';
          } else if (error.response?.data?.message) {
            message = error.response.data.message;
          }
          
          toast.error(message);
          return null;
        }
      },

      verify2FA: async (code: string, secret?: string): Promise<boolean> => {
        try {
          const response = await authApi.verify2FA(code, secret);
          
          if (response.success) {
            // Update user 2FA status if this was setup verification
            if (secret) {
              const currentUser = get().user;
              if (currentUser) {
                set({
                  user: { ...currentUser, two_factor_enabled: true },
                  twoFactorSetupRequired: false
                });
              }
            } else {
              // This is a login 2FA verification
              // Update authentication state if we have user data in response
              if (response.user && response.accessToken) {
                set({
                  user: response.user,
                  accessToken: response.accessToken,
                  isAuthenticated: true,
                  requiresTwoFactor: false
                });
                localStorage.setItem('accessToken', response.accessToken);
                localStorage.setItem('user', JSON.stringify(response.user));
              }
              // Clear requiresTwoFactor flag
              set({ requiresTwoFactor: false });
            }
            
            toast.success('2FA verification successful!');
            return true;
          }
          
          toast.error(response.message || '2FA verification failed');
          return false;
        } catch (error: any) {
          console.error('2FA verification error:', error);
          let message = '2FA verification failed';
          
          if (error.response?.status === 400) {
            message = 'Invalid verification code. Please try again.';
          } else if (error.response?.status === 429) {
            message = 'Too many verification attempts. Please wait before trying again.';
          } else if (error.response?.status === 404) {
            message = 'No 2FA setup found. Please set up 2FA first.';
          } else if (error.response?.data?.message) {
            message = error.response.data.message;
          }
          
          toast.error(message);
          return false;
        }
      },

      disable2FA: async (code: string): Promise<boolean> => {
        try {
          const response = await authApi.disable2FA(code);
          
          if (response.success) {
            const currentUser = get().user;
            if (currentUser) {
              set({
                user: { ...currentUser, two_factor_enabled: false }
              });
            }
            
            toast.success('2FA disabled successfully');
            return true;
          }
          
          toast.error(response.message || '2FA disable failed');
          return false;
        } catch (error: any) {
          const message = error.response?.data?.message || '2FA disable failed';
          toast.error(message);
          return false;
        }
      },

      clearAuth: (): void => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          requiresTwoFactor: false,
          twoFactorSetupRequired: false
        });
      },

      setLoading: (loading: boolean): void => {
        set({ isLoading: loading });
      },

      setRequiresTwoFactor: (requires: boolean): void => {
        set({ requiresTwoFactor: requires });
      },

      setTwoFactorSetupRequired: (required: boolean): void => {
        set({ twoFactorSetupRequired: required });
      },

      updateUser: (userData: Partial<User>): void => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({ user: updatedUser });
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      },

      // Computed values
      isAdmin: (): boolean => {
        return get().user?.role === UserRole.ADMIN;
      },

      isTherapist: (): boolean => {
        const role = get().user?.role;
        return role === UserRole.THERAPIST || role === UserRole.SUBSTITUTE;
      },

      isClient: (): boolean => {
        return get().user?.role === UserRole.CLIENT;
      },

      canAccess: (roles: UserRole[]): boolean => {
        const userRole = get().user?.role;
        return userRole ? roles.includes(userRole) : false;
      },

      getDisplayName: (): string => {
        const user = get().user;
        if (!user) return '';
        return `${user.first_name} ${user.last_name}`;
      },

      getRoleColor: (): string => {
        const role = get().user?.role;
        const colorMap: Record<UserRole, string> = {
          [UserRole.ADMIN]: 'text-admin-primary',
          [UserRole.THERAPIST]: 'text-therapist-primary',
          [UserRole.CLIENT]: 'text-client-primary',
          [UserRole.ASSISTANT]: 'text-assistant-primary',
          [UserRole.BOOKKEEPER]: 'text-bookkeeper-primary',
          [UserRole.SUBSTITUTE]: 'text-therapist-primary'
        };
        return role ? colorMap[role] : 'text-gray-600';
      }
    }),
    {
      name: 'praktijk-epd-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Auth hooks for convenience
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    requiresTwoFactor: store.requiresTwoFactor,
    twoFactorSetupRequired: store.twoFactorSetupRequired,
    login: store.login,
    register: store.register,
    logout: store.logout,
    refreshAuth: store.refreshAuth,
    setup2FA: store.setup2FA,
    verify2FA: store.verify2FA,
    disable2FA: store.disable2FA,
    isAdmin: store.isAdmin,
    isTherapist: store.isTherapist,
    isClient: store.isClient,
    canAccess: store.canAccess,
    getDisplayName: store.getDisplayName,
    getRoleColor: store.getRoleColor,
    updateUser: store.updateUser,
  };
};

// Role-based access control hook
export const useRoleAccess = (allowedRoles: UserRole[]) => {
  const { user, canAccess } = useAuth();
  return {
    hasAccess: canAccess(allowedRoles),
    userRole: user?.role,
    isLoading: !user && useAuthStore.getState().isLoading,
  };
};

// Authentication status hook
export const useAuthStatus = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  return {
    isAuthenticated,
    isLoading,
    user,
    needsEmailVerification: user && !user.email_verified,
    needs2FASetup: useAuthStore.getState().twoFactorSetupRequired,
    accountStatus: user?.status,
  };
};