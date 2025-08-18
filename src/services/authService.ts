import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://praktijk-epd-backend-production.up.railway.app/api';

// Create a dedicated auth axios instance
const authApi = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Simple request interceptor - just add token if available
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    return config;
  },
  (error) => Promise.reject(error)
);

// Simple response interceptor - handle errors
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear auth if we're not on login page
      if (!window.location.pathname.includes('/auth/login')) {
        localStorage.clear();
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    two_factor_enabled: boolean;
    two_factor_setup_completed: boolean;
  };
  requiresTwoFactor?: boolean;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  two_factor_enabled: boolean;
  two_factor_setup_completed: boolean;
}

class AuthService {
  // Step 1: Initial login
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await authApi.post<LoginResponse>('/auth/login', {
        email,
        password,
        rememberDevice: false
      });

      console.log('[AuthService] Login response:', response.data);

      // If login successful and no 2FA required
      if (response.data.success && response.data.accessToken && !response.data.requiresTwoFactor) {
        this.storeAuthData(response.data.accessToken, response.data.user!);
      }

      return response.data;
    } catch (error: any) {
      console.error('[AuthService] Login error:', error);
      throw error;
    }
  }

  // Step 2: Complete login with 2FA
  async loginWith2FA(email: string, password: string, twoFactorCode: string): Promise<LoginResponse> {
    try {
      const response = await authApi.post<LoginResponse>('/auth/login', {
        email,
        password,
        twoFactorCode,
        rememberDevice: false
      });

      console.log('[AuthService] 2FA Login response:', response.data);

      if (response.data.success && response.data.accessToken) {
        this.storeAuthData(response.data.accessToken, response.data.user!);
      }

      return response.data;
    } catch (error: any) {
      console.error('[AuthService] 2FA Login error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;

      const response = await authApi.get<{ success: boolean; data: User }>('/auth/me');
      if (response.data.success && response.data.data) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('[AuthService] Get current user error:', error);
      return null;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await authApi.delete('/auth/logout');
    } catch (error) {
      console.error('[AuthService] Logout error:', error);
    } finally {
      this.clearAuthData();
      window.location.href = '/auth/login';
    }
  }

  // Helper: Store auth data
  private storeAuthData(token: string, user: User): void {
    console.log('[AuthService] Storing auth data');
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Verify storage
    console.log('[AuthService] Stored token:', localStorage.getItem('accessToken'));
    console.log('[AuthService] Stored user:', localStorage.getItem('user'));
  }

  // Helper: Clear auth data
  private clearAuthData(): void {
    console.log('[AuthService] Clearing auth data');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tempToken');
    localStorage.removeItem('pendingLogin');
    localStorage.removeItem('praktijk-epd-auth');
  }

  // Helper: Get stored user
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Helper: Get stored token
  getStoredToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Helper: Check if authenticated
  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  // Helper: Get dashboard route for role
  getDashboardRoute(role: string): string {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'therapist':
      case 'substitute':
        return '/therapist/dashboard';
      case 'client':
        return '/client/dashboard';
      case 'assistant':
        return '/assistant/dashboard';
      case 'bookkeeper':
        return '/bookkeeper/dashboard';
      default:
        return '/';
    }
  }
}

export const authService = new AuthService();
export default authService;