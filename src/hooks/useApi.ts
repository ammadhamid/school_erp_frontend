// =====================================================
// CUSTOM REACT HOOKS FOR API CALLS
// Usage: const { data, loading, error, refetch } = useApi(api.student.getAll)
// =====================================================

import { useState, useEffect, useCallback, useRef } from 'react';

// =====================================================
// TYPES
// =====================================================
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  loading: boolean;
  error: Error | null;
  reset: () => void;
}

export interface UseApiOptions {
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  refetchInterval?: number;
  cacheTime?: number;
}

// =====================================================
// MAIN API HOOK - For GET requests
// =====================================================
export function useApi<T>(
  apiFunction: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const {
    enabled = true,
    onSuccess,
    onError,
    refetchInterval,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<Error | null>(null);
  
  const isMountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction();
      
      if (isMountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      
      if (isMountedRef.current) {
        setError(error);
        onError?.(error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction, enabled, onSuccess, onError]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  // Polling/Refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(fetchData, refetchInterval);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, fetchData, enabled]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate,
  };
}

// =====================================================
// MUTATION HOOK - For POST/PUT/DELETE requests
// =====================================================
export function useMutation<TData, TVariables = void>(
  apiFunction: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
  } = {}
): UseMutationResult<TData, TVariables> {
  const { onSuccess, onError, onSettled } = options;

  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const isMountedRef = useRef(true);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiFunction(variables);
        
        if (isMountedRef.current) {
          setData(result);
          onSuccess?.(result, variables);
        }
        
        onSettled?.(result, null, variables);
        return result;
        
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        
        if (isMountedRef.current) {
          setError(error);
          onError?.(error, variables);
        }
        
        onSettled?.(null, error, variables);
        throw error;
        
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [apiFunction, onSuccess, onError, onSettled]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    mutate,
    data,
    loading,
    error,
    reset,
  };
}

// =====================================================
// LAZY QUERY HOOK - For manual GET requests
// =====================================================
export function useLazyApi<T, TVariables = void>(
  apiFunction: (variables: TVariables) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
): [(variables: TVariables) => Promise<void>, UseApiResult<T>] {
  const { onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const isMountedRef = useRef(true);

  const execute = useCallback(
    async (variables: TVariables): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiFunction(variables);
        
        if (isMountedRef.current) {
          setData(result);
          onSuccess?.(result);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        
        if (isMountedRef.current) {
          setError(error);
          onError?.(error);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const refetch = useCallback(async () => {
    console.warn('Cannot refetch without variables. Use execute() instead.');
  }, []);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [
    execute,
    {
      data,
      loading,
      error,
      refetch,
      mutate,
    },
  ];
}

export default { useApi, useMutation, useLazyApi };
