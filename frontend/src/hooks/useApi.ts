import { useState, useEffect, useCallback } from 'react';
import { ApiService, ApiResponse } from '../services/api';

// Interface para o estado do hook
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Interface para opções do hook
interface UseApiOptions<T = unknown> {
  immediate?: boolean; // Se deve executar imediatamente
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

// Hook para requisições GET automáticas
export function useApi<T>(
  url: string | null,
  options: UseApiOptions<T> = {}
): UseApiState<T> & { refetch: () => void } {
  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!url) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response: ApiResponse<T> = await ApiService.get(url);
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
      onSuccess?.(response.data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err.response?.data?.message || err.message || 'Erro desconhecido';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      onError?.(errorMessage);
    }
  }, [url, onSuccess, onError]);

  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }
  }, [fetchData, immediate, url]);

  return {
    ...state,
    refetch: fetchData,
  };
}

// Hook para requisições manuais (POST, PUT, DELETE, etc.)
export function useApiMutation<TData = unknown, TVariables = unknown>() {
  const [state, setState] = useState<UseApiState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (
    method: 'post' | 'put' | 'patch' | 'delete',
    url: string,
    variables?: TVariables,
    options?: {
      onSuccess?: (data: TData) => void;
      onError?: (error: string) => void;
    }
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let response: ApiResponse<TData>;
      
      switch (method) {
        case 'post':
          response = await ApiService.post(url, variables);
          break;
        case 'put':
          response = await ApiService.put(url, variables);
          break;
        case 'patch':
          response = await ApiService.patch(url, variables);
          break;
        case 'delete':
          response = await ApiService.delete(url);
          break;
        default:
          throw new Error(`Método ${method} não suportado`);
      }

      setState({
        data: response.data,
        loading: false,
        error: null,
      });

      options?.onSuccess?.(response.data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err.response?.data?.message || err.message || 'Erro desconhecido';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      options?.onError?.(errorMessage);
      throw error;
    }
  }, []);

  const post = useCallback((url: string, data?: TVariables, options?: { onSuccess?: (data: TData) => void; onError?: (error: string) => void }) => {
    return mutate('post', url, data, options);
  }, [mutate]);

  const put = useCallback((url: string, data?: TVariables, options?: { onSuccess?: (data: TData) => void; onError?: (error: string) => void }) => {
    return mutate('put', url, data, options);
  }, [mutate]);

  const patch = useCallback((url: string, data?: TVariables, options?: { onSuccess?: (data: TData) => void; onError?: (error: string) => void }) => {
    return mutate('patch', url, data, options);
  }, [mutate]);

  const del = useCallback((url: string, options?: { onSuccess?: (data: TData) => void; onError?: (error: string) => void }) => {
    return mutate('delete', url, undefined, options);
  }, [mutate]);

  return {
    ...state,
    post,
    put,
    patch,
    delete: del,
    mutate,
  };
}

// Hook específico para paginação
export function usePaginatedApi<T>(
  baseUrl: string | null,
  initialPage: number = 1,
  initialLimit: number = 10
) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  
  const url = baseUrl ? `${baseUrl}?page=${page}&limit=${limit}` : null;
  
  const { data, loading, error, refetch } = useApi<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(url);

  const nextPage = useCallback(() => {
    if (data?.pagination && page < data.pagination.totalPages) {
      setPage(prev => prev + 1);
    }
  }, [data?.pagination, page]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const goToPage = useCallback((newPage: number) => {
    if (data?.pagination && newPage >= 1 && newPage <= data.pagination.totalPages) {
      setPage(newPage);
    }
  }, [data?.pagination]);

  return {
    data: data?.data || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch,
    page,
    limit,
    setLimit,
    nextPage,
    prevPage,
    goToPage,
  };
}