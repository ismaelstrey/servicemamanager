import { useAuth } from './useAuth';
import type { UserRole } from '../types/auth';

// Hook para verificar permissões em componentes
export const usePermissions = () => {
  const { hasRole, hasPermission } = useAuth();

  const canAccess = (roles?: UserRole[], permissions?: string[]): boolean => {
    if (roles && roles.length > 0) {
      const hasRequiredRole = roles.some(role => hasRole(role));
      if (!hasRequiredRole) return false;
    }

    if (permissions && permissions.length > 0) {
      const hasRequiredPermission = permissions.some(permission => hasPermission(permission));
      if (!hasRequiredPermission) return false;
    }

    return true;
  };

  return { canAccess };
};