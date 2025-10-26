import { createContext, useReducer, useEffect, ReactNode } from 'react';
import { ApiService } from '../services/api';

// Importando tipos diretamente
import type {
  AuthState,
  AuthAction,
  AuthContextType,
  LoginCredentials,
  RegisterData,
  UserRole
} from '../types/auth';
import type { AuthUser } from '../types/auth';
import type { LoginResponse, RegisterResponse, RefreshTokenResponse } from '../types/auth';

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer para gerenciar o estado de autenticação
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'AUTH_UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    case 'AUTH_REFRESH_TOKEN':
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || state.refreshToken,
      };

    default:
      return state;
  }
}

// Contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider de autenticação
interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Função de login
  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await ApiService.post<LoginResponse>('/auth/login', credentials);

      const { token, refreshToken, user } = response;

      // Salvar no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token, refreshToken },
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Erro ao fazer login';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Função de registro
  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await ApiService.post<{
        token: string;
        user: AuthUser;
        message: string;
      }>('/auth/register', data);

      const { token, user } = response;

      // Salvar no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Erro ao criar conta';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Função de logout
  const logout = () => {
    // Remover do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');

    dispatch({ type: 'AUTH_LOGOUT' });
  };

  // Função de refresh token
  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        throw new Error('Refresh token não encontrado');
      }

      const response = await ApiService.post<{
        token: string;
        refreshToken?: string;
      }>('/auth/refresh', { refreshToken: storedRefreshToken });

      const { token, refreshToken: newRefreshToken } = response;

      // Atualizar localStorage
      localStorage.setItem('token', token);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      dispatch({
        type: 'AUTH_REFRESH_TOKEN',
        payload: { token, refreshToken: newRefreshToken },
      });
    } catch (error) {
      logout();
      throw error;
    }
  };

  // Função para atualizar usuário
  const updateUser = (userData: Partial<AuthUser>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch({ type: 'AUTH_UPDATE_USER', payload: userData });
    }
  };

  // Função para verificar permissão
  const hasPermission = (permission: string): boolean => {
    return state.user?.permissions?.includes(permission) || false;
  };

  // Função para verificar role
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!state.user?.role) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(state.user.role);
  };

  // Verificar autenticação ao carregar
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const refreshTokenStr = localStorage.getItem('refreshToken');

        if (token && userStr && refreshTokenStr) {
          const user = JSON.parse(userStr);
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user,
              token,
              refreshToken: refreshTokenStr,
            },
          });
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initAuth();
  }, []);

  const contextValue: AuthContextType = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    loading: state.isLoading, // Adicionando a propriedade loading que está faltando
    error: state.error,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider };
export default AuthContext;