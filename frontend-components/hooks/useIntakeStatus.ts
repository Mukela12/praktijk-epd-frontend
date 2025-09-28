// React hook for intake status management
// Checks if client has completed intake form and can book appointments

import { useState, useEffect, useCallback } from 'react';
import { IntakeStatusResponse } from '../types/intake-form.types';

const API_BASE_URL = 'https://praktijk-epd-backend-production.up.railway.app';

export const useIntakeStatus = (clientId?: string) => {
  const [intakeStatus, setIntakeStatus] = useState<IntakeStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => localStorage.getItem('authToken') || '';

  const checkIntakeStatus = useCallback(async () => {
    if (!clientId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/intake/status/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check intake status');
      }

      const result: IntakeStatusResponse = await response.json();
      
      if (result.success) {
        setIntakeStatus(result);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check intake status');
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  // Auto-check on mount and when clientId changes
  useEffect(() => {
    if (clientId) {
      checkIntakeStatus();
    }
  }, [clientId, checkIntakeStatus]);

  return {
    intakeStatus,
    isLoading,
    error,
    
    // Status helpers
    hasCompletedIntake: intakeStatus?.hasCompletedIntake || false,
    canBookAppointments: intakeStatus?.canBookAppointments || false,
    completionPercentage: intakeStatus?.completionPercentage || 0,
    
    // Actions
    refetchStatus: checkIntakeStatus
  };
};