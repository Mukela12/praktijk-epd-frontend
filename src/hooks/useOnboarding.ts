import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/store/authStore';
import { apiService } from '@/services/apiService';

interface OnboardingStatus {
  mustChangePassword: boolean;
  passwordChangedAt?: string;
  onboardingCompleted: boolean;
  tempPasswordExpired: boolean;
  steps: {
    passwordChanged: boolean;
    profileCompleted: boolean;
    twoFactorEnabled: boolean;
    onboardingCompleted: boolean;
  };
  currentStep: 'password' | 'profile' | '2fa' | 'complete';
  role: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileUpdateData {
  bio: string;
  specializations: string[];
  languages: string[];
  qualifications?: string[];
  years_of_experience: number;
  consultation_rate?: number;
  online_therapy?: boolean;
  in_person_therapy?: boolean;
  accepts_new_clients?: boolean;
}

export const useOnboarding = () => {
  const { user, refreshAuth } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOnboardingStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.get<{ data: OnboardingStatus }>('/onboarding/status');
      setStatus(response.data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch onboarding status';
      setError(message);
      console.error('Onboarding status error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changePassword = async (data: PasswordChangeData) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiService.post('/onboarding/change-password', data);
      // Password changed successfully
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to change password';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: ProfileUpdateData) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiService.post('/onboarding/profile', data);
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update profile';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.post<{ redirectTo: string }>('/onboarding/complete');
      
      // Refresh auth to update user state
      await refreshAuth();
      
      // Return the redirect path
      return response.redirectTo;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to complete onboarding';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStatus = async () => {
    return fetchOnboardingStatus();
  };

  // Fetch status on mount
  useEffect(() => {
    if (user) {
      fetchOnboardingStatus();
    }
  }, [user, fetchOnboardingStatus]);

  return {
    status,
    currentStep: status?.currentStep || 'password',
    isLoading,
    error,
    refreshStatus,
    changePassword,
    updateProfile,
    completeOnboarding
  };
};