import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  statusCode?: number;
}

export class ApiError extends Error {
  public statusCode: number;
  public errors?: Array<{ field: string; message: string }>;
  public originalError: AxiosError;

  constructor(message: string, statusCode: number, errors?: Array<{ field: string; message: string }>, originalError?: AxiosError) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.originalError = originalError as AxiosError;
  }
}

export function handleApiError(error: any, defaultMessage: string = 'An error occurred'): ApiError {
  console.error('[API Error]', error);

  if (error instanceof ApiError) {
    return error;
  }

  const axiosError = error as AxiosError<ApiErrorResponse>;
  
  // Network error
  if (!axiosError.response) {
    return new ApiError('Network error. Please check your connection.', 0, undefined, axiosError);
  }

  const { status, data } = axiosError.response;
  
  // Extract error message
  let message = defaultMessage;
  let errors: Array<{ field: string; message: string }> | undefined;

  if (data && typeof data === 'object') {
    // Check for standard error response format
    if ('message' in data && typeof data.message === 'string') {
      message = data.message;
    }
    
    // Check for validation errors
    if ('errors' in data && Array.isArray(data.errors)) {
      errors = data.errors;
    }
  }

  // Handle specific status codes
  switch (status) {
    case 400:
      message = message || 'Invalid request. Please check your input.';
      break;
    case 401:
      message = 'You are not authenticated. Please log in.';
      break;
    case 403:
      message = 'You do not have permission to perform this action.';
      break;
    case 404:
      message = 'The requested resource was not found.';
      break;
    case 409:
      message = message || 'A conflict occurred. The resource may already exist.';
      break;
    case 422:
      message = message || 'Validation failed. Please check your input.';
      break;
    case 429:
      message = 'Too many requests. Please try again later.';
      break;
    case 500:
      message = 'Server error. Please try again later.';
      break;
    default:
      message = message || `An error occurred (${status})`;
  }

  return new ApiError(message, status, errors, axiosError);
}

export function showApiError(error: any, defaultMessage?: string): void {
  const apiError = handleApiError(error, defaultMessage);
  
  // Show validation errors
  if (apiError.errors && apiError.errors.length > 0) {
    apiError.errors.forEach(err => {
      toast.error(`${err.field}: ${err.message}`);
    });
  } else {
    // Show general error
    toast.error(apiError.message);
  }
}

export function getFieldError(error: ApiError | null, field: string): string | undefined {
  if (!error || !error.errors) return undefined;
  
  const fieldError = error.errors.find(err => err.field === field);
  return fieldError?.message;
}

// Helper to format API request data
export function formatApiData(data: Record<string, any>): Record<string, any> {
  const formatted: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    // Convert empty strings to null
    if (value === '') {
      formatted[key] = null;
    }
    // Trim strings
    else if (typeof value === 'string') {
      formatted[key] = value.trim();
    }
    // Keep other values as is
    else {
      formatted[key] = value;
    }
  });
  
  return formatted;
}

// Helper to validate required fields
export function validateRequired(data: Record<string, any>, requiredFields: string[]): Record<string, string> {
  const errors: Record<string, string> = {};
  
  requiredFields.forEach(field => {
    const value = data[field];
    if (!value || (typeof value === 'string' && !value.trim())) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')} is required`;
    }
  });
  
  return errors;
}