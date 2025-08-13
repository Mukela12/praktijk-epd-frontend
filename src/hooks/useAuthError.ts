import { useState, useCallback } from 'react';
import { AuthError } from '@/components/auth/AuthErrorMessage';

export const useAuthError = () => {
  const [error, setError] = useState<AuthError | null>(null);

  const handleAuthError = useCallback((error: unknown, type: 'login' | 'register' | 'verification' | 'general' = 'general') => {
    console.error('Auth error:', error);

    // Handle different error formats from API
    const err = error as any;
    if (err.response) {
      const { status, data } = err.response;
      
      // Map status codes to error codes
      if (status === 401) {
        // Check for specific 401 scenarios
        if (data.message?.includes('locked')) {
          setError({
            type: 'login',
            code: 'account_locked',
            message: data.message || 'Account temporarily locked'
          });
        } else if (data.message?.includes('2FA') || data.message?.includes('two-factor')) {
          setError({
            type: 'login',
            code: 'invalid_two_factor',
            message: data.message || 'Invalid 2FA code'
          });
        } else {
          setError({
            type: 'login',
            code: 'invalid_credentials',
            message: data.message || 'Invalid credentials',
            field: data.field
          });
        }
      } else if (status === 403) {
        // Check for specific 403 scenarios
        if (data.message?.includes('verify your email')) {
          setError({
            type: 'login',
            code: 'email_not_verified',
            message: data.message || 'Email verification required',
            details: ['Check your email for verification link', 'Click the link to verify your account']
          });
        } else if (data.message?.includes('suspended')) {
          setError({
            type: 'login',
            code: 'account_suspended',
            message: data.message || 'Account suspended'
          });
        } else if (data.message?.includes('locked')) {
          setError({
            type: 'login',
            code: 'account_locked',
            message: data.message || 'Account temporarily locked'
          });
        } else {
          setError({
            type,
            code: 'access_denied',
            message: data.message || 'Access denied'
          });
        }
      } else if (status === 409) {
        setError({
          type: 'register',
          code: 'email_already_exists',
          message: data.message || 'Email already registered'
        });
      } else if (status === 422) {
        // Validation errors
        const validationErrors = data.errors || {};
        const firstError = Object.keys(validationErrors)[0];
        const firstErrorMessage = validationErrors[firstError]?.[0];
        
        if (firstError === 'password') {
          setError({
            type: 'register',
            code: 'weak_password',
            message: firstErrorMessage || 'Password requirements not met',
            field: 'password',
            details: validationErrors.password
          });
        } else if (firstError === 'email') {
          setError({
            type: 'register',
            code: 'invalid_email_format',
            message: firstErrorMessage || 'Invalid email format',
            field: 'email'
          });
        } else {
          setError({
            type,
            message: firstErrorMessage || 'Validation failed',
            field: firstError,
            details: Object.values(validationErrors).flat() as string[]
          });
        }
      } else if (status === 429) {
        setError({
          type,
          code: 'rate_limit',
          message: 'Too many attempts. Please wait before trying again.'
        });
      } else if (status >= 500) {
        setError({
          type: 'general',
          code: 'server_error',
          message: data.message || 'Server error. Please try again later.'
        });
      } else {
        setError({
          type,
          message: data.message || (err as any).message || 'An error occurred'
        });
      }
    } else if (err.code === 'ECONNABORTED' || err.message?.includes('Network')) {
      setError({
        type: 'general',
        code: 'network_error',
        message: 'Connection problem. Please check your internet.'
      });
    } else if (err.message?.includes('2FA') || err.message?.includes('two-factor')) {
      setError({
        type: 'login',
        code: 'two_factor_required',
        message: err.message
      });
    } else {
      // Generic error
      setError({
        type,
        message: err.message || 'An unexpected error occurred'
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    setError,
    handleAuthError,
    clearError
  };
};