import { useCallback, useMemo, useState } from 'react'
import axios from 'axios'
import type { AxiosInstance } from 'axios'

// Hook de autenticação para acesso à API
// - Mantém estado de token e usuário
// - Fornece funções login, logout e register
// - Lê URL base da API via .env (VITE_API_URL)

export type AuthUser = { id: number; email: string; name: string }
export type LoginResponse = { token: string; user: AuthUser }
export type RegisterResponse = { token: string; user: AuthUser }

function createApiClient(): AxiosInstance {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  return axios.create({ baseURL })
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<AuthUser | null>(null)
  const api = useMemo(() => createApiClient(), [])

  // Indica se usuário está autenticado (token presente)
  const isAuthenticated = !!token

  // Realiza login na API, armazena token e usuário
  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [api])

  // Realiza registro na API
  const register = useCallback(async (name: string, email: string, password: string): Promise<AuthUser> => {
    const { data } = await api.post<RegisterResponse>('/auth/register', { name, email, password })
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [api])

  // Efetua logout e limpa token
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  // Cliente com cabeçalho de autorização
  const authApi = useMemo(() => {
    const instance = createApiClient()
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    return instance
  }, [token])

  return { isAuthenticated, user, token, login, register, logout, authApi }
}