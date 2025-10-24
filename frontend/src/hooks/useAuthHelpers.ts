import { useAuth } from './useAuth';

// Hook para usar as funções de autenticação
export const useAuthHelpers = () => {
  const { hasRole, hasPermission } = useAuth();

  return {
    hasRole,
    hasPermission,
  };
};