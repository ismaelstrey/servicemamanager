import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Instância do axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Controle de refresh token para evitar corrida e laços
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

// Interceptor para adicionar token de autenticação (admin vs cliente)
api.interceptors.request.use(
  (config) => {
    const url = config.url ?? '';
    const isClientEndpoint = url.startsWith('/client');

    const tokenKey = isClientEndpoint ? 'clientToken' : 'token';
    const token = localStorage.getItem(tokenKey);
    if (token) {
      // Garante que o header Authorization seja corretamente aplicado
      // Funciona tanto com AxiosHeaders quanto com objeto literal
      const currentHeaders = (config.headers ?? {}) as Record<string, unknown>;
      config.headers = {
        ...currentHeaders,
        Authorization: `Bearer ${token}`,
      } as any;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config ?? {};
    const url = originalRequest.url ?? '';
    const isClientEndpoint = url.startsWith('/client');

    // Apenas tenta refresh para endpoints admin; cliente mantém fallback por enquanto
    if (status === 401 && !isClientEndpoint) {
      const alreadyRetried = (originalRequest as any)._retry;
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (alreadyRetried || !storedRefreshToken) {
        // Fluxo padrão: limpar sessão e redirecionar
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // Usa axios direto para evitar interceptors da própria instância
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken: storedRefreshToken }, {
            headers: { 'Content-Type': 'application/json' },
          });
          const { token, refreshToken: newRefreshToken } = res.data ?? {};
          if (!token) throw new Error('Refresh sem token');

          // Atualiza armazenamento e headers default
          localStorage.setItem('token', token);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
          api.defaults.headers.common.Authorization = `Bearer ${token}`;

          isRefreshing = false;
          onRefreshed(token);
        } catch (refreshError) {
          isRefreshing = false;
          // Falhou: limpa sessão e redireciona
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }

      // Retenta a requisição original após o refresh
      const retryOrigReq = new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          (originalRequest as any)._retry = true;
          originalRequest.headers = originalRequest.headers || {};
          (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
          resolve(api.request(originalRequest));
        });
      });
      return retryOrigReq;
    }

    if (status === 401 && isClientEndpoint) {
      // Fluxo cliente: ainda sem refresh automático
      localStorage.removeItem('clientToken');
      localStorage.removeItem('clientUser');
      if (window.location.pathname !== '/client/login') {
        window.location.href = '/client/login';
      }
    }

    return Promise.reject(error);
  }
);

// Interface para resposta padrão da API
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

// Interface para resposta paginada
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Helper para normalizar respostas da API
function normalizeApiResponse<T>(body: unknown): ApiResponse<T> {
  // Se já estiver no formato envelope (possui "data"), retorna como está
  if (body && typeof body === 'object' && body !== null && 'data' in (body as Record<string, unknown>)) {
    return body as ApiResponse<T>;
  }
  // Caso contrário, embrulha o corpo cru em um envelope padrão
  return { data: body as T, success: true };
}

// Classe para gerenciar requisições da API
export class ApiService {
  // GET request
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await api.get(url, config);
    return normalizeApiResponse<T>(response.data as unknown);
  }

  // POST request
  static async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await api.post(url, data, config);
    return normalizeApiResponse<T>(response.data as unknown);
  }

  // PUT request
  static async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await api.put(url, data, config);
    return normalizeApiResponse<T>(response.data as unknown);
  }

  // PATCH request
  static async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await api.patch(url, data, config);
    return normalizeApiResponse<T>(response.data as unknown);
  }

  // DELETE request
  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await api.delete(url, config);
    return normalizeApiResponse<T>(response.data as unknown);
  }
}

export default api;