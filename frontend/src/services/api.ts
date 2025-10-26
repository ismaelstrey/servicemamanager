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

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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