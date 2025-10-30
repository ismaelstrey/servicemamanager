import  { createContext, useReducer, useEffect, type ReactNode } from 'react';
import ClientAuthService from '../services/clientAuthService';
import type { ClientLoginCredentials, ClientRegisterData, ClientUser } from '../types/client';

interface ClientAuthState {
  user: ClientUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type ClientAuthAction =
  | { type: 'CLIENT_AUTH_START' }
  | { type: 'CLIENT_AUTH_SUCCESS'; payload: { user: ClientUser; token: string } }
  | { type: 'CLIENT_AUTH_ERROR'; payload: string }
  | { type: 'CLIENT_AUTH_LOGOUT' }
  | { type: 'CLIENT_AUTH_UPDATE_USER'; payload: Partial<ClientUser> };

export interface ClientAuthContextType {
  user: ClientUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: ClientLoginCredentials) => Promise<void>;
  register: (data: ClientRegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<ClientUser>) => void;
}

const initialState: ClientAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

function clientAuthReducer(state: ClientAuthState, action: ClientAuthAction): ClientAuthState {
  switch (action.type) {
    case 'CLIENT_AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'CLIENT_AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'CLIENT_AUTH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'CLIENT_AUTH_LOGOUT':
      return { ...initialState };
    case 'CLIENT_AUTH_UPDATE_USER':
      return { ...state, user: { ...(state.user as ClientUser), ...action.payload } };
    default:
      return state;
  }
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

interface ClientAuthProviderProps { children: ReactNode }

export function ClientAuthProvider({ children }: ClientAuthProviderProps) {
  const [state, dispatch] = useReducer(clientAuthReducer, initialState);

  useEffect(() => {
    try {
      const token = localStorage.getItem('clientToken');
      const userStr = localStorage.getItem('clientUser');
      if (token && userStr) {
        const user = JSON.parse(userStr) as ClientUser;
        dispatch({ type: 'CLIENT_AUTH_SUCCESS', payload: { user, token } });
      }
    } catch (e) {
      dispatch({ type: 'CLIENT_AUTH_LOGOUT' });
    }
  }, []);

  const login = async (credentials: ClientLoginCredentials) => {
    try {
      dispatch({ type: 'CLIENT_AUTH_START' });
      const res = await ClientAuthService.login(credentials);
      const { token, customer } = res;
      localStorage.setItem('clientToken', token);
      localStorage.setItem('clientUser', JSON.stringify(customer));
      dispatch({ type: 'CLIENT_AUTH_SUCCESS', payload: { user: customer, token } });
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erro ao fazer login do cliente';
      dispatch({ type: 'CLIENT_AUTH_ERROR', payload: msg });
      throw new Error(msg);
    }
  };

  const register = async (data: ClientRegisterData) => {
    try {
      dispatch({ type: 'CLIENT_AUTH_START' });
      const res = await ClientAuthService.register(data);
      const { token, customer } = res;
      localStorage.setItem('clientToken', token);
      localStorage.setItem('clientUser', JSON.stringify(customer));
      dispatch({ type: 'CLIENT_AUTH_SUCCESS', payload: { user: customer, token } });
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erro ao registrar cliente';
      dispatch({ type: 'CLIENT_AUTH_ERROR', payload: msg });
      throw new Error(msg);
    }
  };

  const logout = () => {
    ClientAuthService.clearAuthData();
    dispatch({ type: 'CLIENT_AUTH_LOGOUT' });
  };

  const updateUser = (user: Partial<ClientUser>) => {
    try {
      const currentStr = localStorage.getItem('clientUser');
      const current = currentStr ? (JSON.parse(currentStr) as ClientUser) : null;
      const updated = { ...(current as ClientUser), ...user };
      localStorage.setItem('clientUser', JSON.stringify(updated));
      dispatch({ type: 'CLIENT_AUTH_UPDATE_USER', payload: user });
    } catch {
      // ignore
    }
  };

  const value: ClientAuthContextType = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    updateUser,
  };

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>;
}

export default ClientAuthContext;