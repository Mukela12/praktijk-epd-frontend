// API Response Normalizer
// Handles inconsistent response structures across different endpoints

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
}

/**
 * Normalize API response to consistent structure
 * Handles various response patterns:
 * - { data: { data: [...] } } - double nested
 * - { data: [...] } - single nested
 * - { success: true, data: [...] } - with success flag
 * - { appointments: [...] } - direct entity property
 */
export const normalizeApiResponse = <T>(response: any, entityKey?: string): ApiResponse<T> => {
  // Handle axios response wrapper
  const rawData = response.data || response;
  
  // Pattern 1: Double nested structure (response.data.data)
  if (rawData.data?.data) {
    return {
      success: rawData.success ?? true,
      data: rawData.data.data,
      pagination: rawData.data.pagination,
      message: rawData.message
    };
  }
  
  // Pattern 2: Single nested with success flag
  if (rawData.success !== undefined && rawData.data) {
    return {
      success: rawData.success,
      data: rawData.data,
      pagination: rawData.pagination,
      message: rawData.message,
      error: rawData.error
    };
  }
  
  // Pattern 3: Entity-specific property (e.g., { appointments: [...] })
  if (entityKey && rawData[entityKey]) {
    return {
      success: true,
      data: rawData[entityKey],
      pagination: rawData.pagination
    };
  }
  
  // Pattern 4: Direct data array/object
  if (rawData.data) {
    return {
      success: true,
      data: rawData.data,
      pagination: rawData.pagination
    };
  }
  
  // Pattern 5: Raw data (fallback)
  return {
    success: true,
    data: rawData
  };
};

/**
 * Normalize paginated response specifically
 */
export const normalizePaginatedResponse = <T>(response: any, entityKey?: string): ApiResponse<T[]> => {
  const normalized = normalizeApiResponse<T[]>(response, entityKey);
  
  // Ensure data is an array
  if (!Array.isArray(normalized.data)) {
    return {
      ...normalized,
      data: normalized.data ? [normalized.data] : []
    };
  }
  
  // Provide default pagination if missing
  if (!normalized.pagination && Array.isArray(normalized.data)) {
    normalized.pagination = {
      page: 1,
      limit: normalized.data.length,
      total: normalized.data.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    };
  }
  
  return normalized;
};

/**
 * Normalize error response
 */
export const normalizeErrorResponse = (error: any): ApiResponse<null> => {
  // Handle axios error response
  const errorResponse = error.response?.data || error;
  
  return {
    success: false,
    data: null,
    message: errorResponse.message || error.message || 'An error occurred',
    error: errorResponse.error || 'API_ERROR'
  };
};

/**
 * Create a typed API response handler
 */
export const createApiResponseHandler = <T>(entityKey?: string) => {
  return {
    single: (response: any): ApiResponse<T> => normalizeApiResponse<T>(response, entityKey),
    list: (response: any): ApiResponse<T[]> => normalizePaginatedResponse<T>(response, entityKey),
    error: (error: any): ApiResponse<null> => normalizeErrorResponse(error)
  };
};

// Pre-configured response handlers for common entities
export const responseHandlers = {
  appointments: createApiResponseHandler<any>('appointments'),
  clients: createApiResponseHandler<any>('clients'),
  therapists: createApiResponseHandler<any>('therapists'),
  waitingList: createApiResponseHandler<any>('waitingList'),
  users: createApiResponseHandler<any>('users'),
  invoices: createApiResponseHandler<any>('invoices'),
  generic: createApiResponseHandler<any>()
};

/**
 * Utility to check if response indicates success
 */
export const isSuccessResponse = (response: any): boolean => {
  const normalized = normalizeApiResponse(response);
  return normalized.success;
};

/**
 * Extract data from response safely
 */
export const extractData = <T>(response: any, entityKey?: string): T | null => {
  try {
    const normalized = normalizeApiResponse<T>(response, entityKey);
    return normalized.success ? normalized.data : null;
  } catch (error) {
    console.error('Error extracting data from response:', error);
    return null;
  }
};

/**
 * Extract pagination info from response
 */
export const extractPagination = (response: any) => {
  const normalized = normalizePaginatedResponse(response);
  return normalized.pagination;
};