import { useState, useEffect, useCallback, useRef } from 'react';
import { useAlert } from '@/components/ui/CustomAlert';

interface UseAsyncDataOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showErrorAlert?: boolean;
  retryCount?: number;
  retryDelay?: number;
  dependencies?: any[];
}

interface UseAsyncDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  retry: () => void;
  reset: () => void;
  setData: (data: T | null) => void;
}

export function useAsyncData<T = any>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncDataOptions = {}
): UseAsyncDataReturn<T> {
  const {
    onSuccess,
    onError,
    showErrorAlert = true,
    retryCount = 0,
    retryDelay = 1000,
    dependencies = []
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  
  const { error: errorAlert } = useAlert();
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      const result = await asyncFunction();

      if (isMountedRef.current) {
        setData(result);
        setLoading(false);
        onSuccess?.(result);
      }
    } catch (err: any) {
      if (isMountedRef.current && err.name !== 'AbortError') {
        const error = err instanceof Error ? err : new Error(err.message || 'An error occurred');
        setError(error);
        setLoading(false);

        if (showErrorAlert) {
          errorAlert(error.message);
        }

        onError?.(error);

        // Retry logic
        if (retryAttempt < retryCount) {
          setTimeout(() => {
            setRetryAttempt(prev => prev + 1);
          }, retryDelay * (retryAttempt + 1));
        }
      }
    }
  }, [asyncFunction, onSuccess, onError, showErrorAlert, retryAttempt, retryCount, retryDelay, errorAlert]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [...dependencies, retryAttempt]);

  const retry = useCallback(() => {
    setRetryAttempt(0);
    fetchData();
  }, [fetchData]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setRetryAttempt(0);
  }, []);

  return {
    data,
    loading,
    error,
    retry,
    reset,
    setData
  };
}

// Specialized hooks for common patterns
export function usePaginatedData<T = any>(
  asyncFunction: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
  pageSize: number = 10,
  options: UseAsyncDataOptions = {}
) {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPaginatedData = useCallback(async () => {
    const result = await asyncFunction(page, pageSize);
    setTotalPages(Math.ceil(result.total / pageSize));
    return result.data;
  }, [asyncFunction, page, pageSize]);

  const { data, loading, error, retry, reset } = useAsyncData<T[]>(
    fetchPaginatedData,
    { ...options, dependencies: [page, ...(options.dependencies || [])] }
  );

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [page, goToPage]);

  const previousPage = useCallback(() => {
    goToPage(page - 1);
  }, [page, goToPage]);

  return {
    data: data || [],
    loading,
    error,
    retry,
    reset,
    page,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
}

export function usePollingData<T = any>(
  asyncFunction: () => Promise<T>,
  interval: number = 5000,
  options: UseAsyncDataOptions = {}
) {
  const [isPolling, setIsPolling] = useState(true);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const fetchWithPolling = useCallback(async () => {
    const data = await asyncFunction();
    
    if (isPolling && intervalIdRef.current === null) {
      intervalIdRef.current = setInterval(() => {
        asyncFunction();
      }, interval);
    }
    
    return data;
  }, [asyncFunction, interval, isPolling]);

  const { data, loading, error, retry, reset } = useAsyncData<T>(
    fetchWithPolling,
    options
  );

  useEffect(() => {
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    setIsPolling(true);
    retry();
  }, [retry]);

  return {
    data,
    loading,
    error,
    retry,
    reset,
    isPolling,
    stopPolling,
    startPolling
  };
}