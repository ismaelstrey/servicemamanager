import { useCallback, useMemo } from 'react';

export interface UseApiOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  getToken?: () => string | null;
}

export interface ApiError<T = unknown> {
  status: number;
  data?: T;
  message?: string;
}

async function parseJsonSafe<T>(res: Response): Promise<T | undefined> {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) as T : undefined;
  } catch {
    return undefined;
  }
}

export function useApi(options?: UseApiOptions) {
  const baseUrl = useMemo(() => options?.baseUrl ?? (import.meta as any)?.env?.VITE_API_URL ?? '/api', [options?.baseUrl]);

  const buildHeaders = useCallback((headers?: HeadersInit): HeadersInit => {
    const token = options?.getToken?.();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.defaultHeaders ?? {}),
      ...(headers ?? {}),
    };
  }, [options?.defaultHeaders, options?.getToken]);

  const request = useCallback(async <T>(path: string, init?: RequestInit): Promise<T> => {
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: buildHeaders(init?.headers),
    });
    const data = await parseJsonSafe<T>(res);
    if (!res.ok) {
      const err: ApiError = { status: res.status, data, message: res.statusText };
      throw err;
    }
    return (data as T);
  }, [baseUrl, buildHeaders]);

  const get = useCallback(<T>(path: string, init?: RequestInit) => request<T>(path, { method: 'GET', ...init }), [request]);
  const post = useCallback(<T>(path: string, body?: unknown, init?: RequestInit) => request<T>(path, { method: 'POST', body: body != null ? JSON.stringify(body) : undefined, ...init }), [request]);
  const put = useCallback(<T>(path: string, body?: unknown, init?: RequestInit) => request<T>(path, { method: 'PUT', body: body != null ? JSON.stringify(body) : undefined, ...init }), [request]);
  const del = useCallback<(<T>(path: string, init?: RequestInit) => Promise<T>)>(
    (path, init) => request(path, { method: 'DELETE', ...init }),
    [request]
  );

  return { baseUrl, get, post, put, del };
}

export default useApi;