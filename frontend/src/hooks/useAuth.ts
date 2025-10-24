import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import type { AuthContextType } from '../types/auth';

// Hook para usar o contexto de autenticação
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}