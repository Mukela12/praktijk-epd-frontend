import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ApiError {
  message: string;
  errors?: Array<{ field: string; message: string }>;
  statusCode?: number;
}

interface UseApiOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  showToast?: boolean;
}

export function useApiWithErrorHandling<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<T | null>(null);

  const {
    successMessage,
    errorMessage = 'An error occurred',
    onSuccess,
    onError,
    showToast = true
  } = options;

  const execute = useCallback(async (...args: any[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[API] Executing request with args:', args);
      const result = await apiFunction(...args);
      console.log('[API] Request successful:', result);
      
      setData(result);
      
      if (showToast && successMessage) {
        toast.success(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      console.error('[API] Request failed:', err);
      
      const axiosError = err as AxiosError<ApiError>;
      const apiError: ApiError = {
        message: errorMessage,
        statusCode: axiosError.response?.status
      };

      // Extract error details from the response
      if (axiosError.response?.data) {
        const responseData = axiosError.response.data;
        
        if (typeof responseData === 'object' && responseData !== null) {
          if ('message' in responseData && typeof responseData.message === 'string') {
            apiError.message = responseData.message;
          }
          
          if ('errors' in responseData && Array.isArray(responseData.errors)) {
            apiError.errors = responseData.errors;
          }
        }
      } else if (axiosError.message) {
        apiError.message = axiosError.message;
      }

      // Log detailed error information
      console.error('[API] Error details:', {
        status: apiError.statusCode,
        message: apiError.message,
        errors: apiError.errors,
        url: axiosError.config?.url,
        method: axiosError.config?.method,
        data: axiosError.config?.data
      });

      setError(apiError);
      
      if (showToast) {
        // Show field-specific errors if available
        if (apiError.errors && apiError.errors.length > 0) {
          apiError.errors.forEach(fieldError => {
            toast.error(`${fieldError.field}: ${fieldError.message}`);
          });
        } else {
          toast.error(apiError.message);
        }
      }
      
      if (onError) {
        onError(apiError);
      }
      
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction, successMessage, errorMessage, onSuccess, onError, showToast]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    execute,
    isLoading,
    error,
    data,
    reset
  };
}