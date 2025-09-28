// React hook for profile data management
// Handles loading and updating user profile information

import { useState, useCallback } from 'react';

const API_BASE_URL = 'https://praktijk-epd-backend-production.up.railway.app';

export interface ProfileData {
  // User table fields
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  role?: string;
  
  // Client profile fields
  dateOfBirth?: string;
  bsn?: string;
  initials?: string;
  namePrefix?: string;
  salutation?: string;
  mobilePhone?: string;
  streetName?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  mailingStreet?: string;
  mailingHouseNumber?: string;
  mailingPostalCode?: string;
  mailingCity?: string;
  insuranceNumber?: string;
  insuranceCompany?: string;
  generalPractitionerName?: string;
  bankAccountIban?: string;
  clientNumber?: string;
  additionalEmails?: string;
  youthBsn?: string;
  guardianName?: string;
  
  // Therapist profile fields
  licenseNumber?: string;
  specializations?: string;
  bio?: string;
  hourlyRate?: number;
  yearsOfExperience?: number;
  education?: string;
  certifications?: string;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileResponse {
  success: boolean;
  data: ProfileData;
  message?: string;
}

export const useProfileData = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => localStorage.getItem('authToken') || '';

  // Load profile data
  const loadProfile = useCallback(async (userId?: string, userType: 'client' | 'therapist' = 'client', isAdmin = false): Promise<ProfileData | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const endpoint = isAdmin && userId 
        ? `/api/admin/users/${userId}`
        : userType === 'client' 
          ? '/api/client/profile'
          : '/api/therapist/profile';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load profile: ${response.status}`);
      }

      const result: ProfileResponse = await response.json();
      
      if (result.success && result.data) {
        setProfileData(result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to load profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save profile data
  const saveProfile = useCallback(async (
    data: Partial<ProfileData>, 
    userId?: string, 
    userType: 'client' | 'therapist' = 'client', 
    isAdmin = false
  ): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);

      const endpoint = isAdmin && userId 
        ? `/api/admin/users/${userId}`
        : userType === 'client' 
          ? '/api/client/profile'
          : '/api/therapist/profile';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`);
      }

      const result: ProfileResponse = await response.json();
      
      if (result.success) {
        setProfileData(prev => ({ ...prev, ...result.data }));
        return true;
      } else {
        throw new Error(result.message || 'Save failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Save failed';
      setError(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  // Update profile data locally (optimistic updates)
  const updateProfile = useCallback((updates: Partial<ProfileData>) => {
    setProfileData(prev => prev ? { ...prev, ...updates } : updates as ProfileData);
  }, []);

  return {
    // State
    profileData,
    isLoading,
    isSaving,
    error,
    
    // Actions
    loadProfile,
    saveProfile,
    updateProfile,
    
    // Computed
    hasProfile: profileData !== null,
    fullName: profileData ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() : '',
    displayName: profileData ? 
      `${profileData.firstName || ''} ${profileData.namePrefix || ''} ${profileData.lastName || ''}`.trim() : ''
  };
};