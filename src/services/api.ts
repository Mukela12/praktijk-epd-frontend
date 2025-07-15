import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  TwoFactorSetup,
  PasswordResetRequest,
  PasswordResetConfirm,
  User,
  ApiResponse,
  ApiError
} from '@/types/auth';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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
    
    // Log registration requests
    if (config.url?.includes('/auth/register')) {
      console.log('=== AXIOS INTERCEPTOR - REGISTER REQUEST ===');
      console.log('URL:', config.baseURL + config.url);
      console.log('Method:', config.method);
      console.log('Headers:', config.headers);
      console.log('Data:', config.data);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshResponse = await api.post('/auth/refresh-token');
        
        if (refreshResponse.data.success && refreshResponse.data.accessToken) {
          const newToken = refreshResponse.data.accessToken;
          localStorage.setItem('accessToken', newToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle different error types
    if (error.response?.status === 403) {
      toast.error('Access denied. You do not have permission for this action.');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.');
    } else if (error.response?.status === 422) {
      // Validation errors are handled by individual components
      return Promise.reject(error);
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (error.response?.status && error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    if (response.data.success && response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    console.log('=== API SERVICE REGISTER ===');
    console.log('Payload being sent:', JSON.stringify(userData, null, 2));
    console.log('Request headers:', api.defaults.headers);
    console.log('API Base URL:', api.defaults.baseURL);
    
    const response = await api.post<AuthResponse>('/auth/register', userData);
    
    console.log('API Response Status:', response.status);
    console.log('API Response Data:', response.data);
    
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<{ accessToken: string; user: User }> => {
    const response = await api.post<ApiResponse<{ accessToken: string; user: User }>>('/auth/refresh-token');
    
    if (response.data.success && response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      if (response.data.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
    }
    
    return response.data.data!;
  },

  /**
   * Request password reset
   */
  forgotPassword: async (data: PasswordResetRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Confirm password reset
   */
  resetPassword: async (data: PasswordResetConfirm): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Verify email address
   */
  verifyEmail: async (token: string): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>(`/auth/verify-email/${token}`);
    return response.data;
  },

  /**
   * Setup 2FA
   */
  setup2FA: async (): Promise<TwoFactorSetup> => {
    const response = await api.post<ApiResponse<TwoFactorSetup>>('/auth/setup-2fa');
    return response.data.data!;
  },

  /**
   * Verify 2FA setup
   */
  verify2FA: async (code: string, secret?: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/verify-2fa', { 
      code, 
      ...(secret && { secret }) 
    });
    return response.data;
  },

  /**
   * Disable 2FA
   */
  disable2FA: async (code: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/disable-2fa', { code });
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/change-password', data);
    return response.data;
  },

  /**
   * Get active sessions
   */
  getSessions: async (): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>('/auth/sessions');
    return response.data.data || [];
  },

  /**
   * Revoke session
   */
  revokeSession: async (sessionId: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/auth/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Revoke all sessions
   */
  revokeAllSessions: async (): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/revoke-all-sessions');
    return response.data;
  },
};

// Users API endpoints
export const usersApi = {
  /**
   * Get user profile
   */
  getProfile: async (userId?: string): Promise<User> => {
    const endpoint = userId ? `/users/${userId}` : '/users/profile';
    const response = await api.get<ApiResponse<User>>(endpoint);
    return response.data.data!;
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${userId}`, data);
    return response.data.data!;
  },

  /**
   * Get user activity
   */
  getUserActivity: async (userId: string, limit = 50): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>(`/users/${userId}/activity`, {
      params: { limit }
    });
    return response.data.data || [];
  },
};

// Helper functions
export const apiHelpers = {
  /**
   * Handle API errors and extract user-friendly messages
   */
  handleError: (error: AxiosError): string => {
    if (error.response?.data) {
      const errorData = error.response.data as ApiError;
      return errorData.message || 'An unexpected error occurred';
    }
    
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return 'Network error. Please check your connection.';
    }
    
    return error.message || 'An unexpected error occurred';
  },

  /**
   * Extract validation errors from API response
   */
  extractValidationErrors: (error: AxiosError): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (error.response?.data) {
      const errorData = error.response.data as ApiError;
      if (errorData.errors) {
        errorData.errors.forEach((err) => {
          errors[err.field] = err.message;
        });
      }
    }
    
    return errors;
  },

  /**
   * Check if error is a validation error
   */
  isValidationError: (error: AxiosError): boolean => {
    return error.response?.status === 422;
  },

  /**
   * Check if error is an authentication error
   */
  isAuthError: (error: AxiosError): boolean => {
    return error.response?.status === 401;
  },

  /**
   * Check if error is a permission error
   */
  isPermissionError: (error: AxiosError): boolean => {
    return error.response?.status === 403;
  },

  /**
   * Format API response for consistent error handling
   */
  formatResponse: <T>(response: AxiosResponse<ApiResponse<T>>): T => {
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data!;
  },
};

// Export configured axios instance for use in other services
export default api;