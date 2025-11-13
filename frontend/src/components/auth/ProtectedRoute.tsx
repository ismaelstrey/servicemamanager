import type React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Button, LogoLoader } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types/auth';
import { usePermissions } from '../../hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallback,
}) => {
  const { user, loading, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return <LogoLoader fullscreen message="Verificando autenticação..." />;
  }

  // Se não estiver logado, redirecionar para login
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Verificar se o usuário tem as roles necessárias
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return fallback || (
        <div className="access-denied">
          <div className="access-denied__content">
            <div className="access-denied__icon">🚫</div>
            <h2>Acesso Negado</h2>
            <p>
              Você não tem permissão para acessar esta página.
              Entre em contato com o administrador se acredita que isso é um erro.
            </p>
            <div className="access-denied__info">
              <p><strong>Roles necessárias:</strong> {requiredRoles.join(', ')}</p>
              <p><strong>Sua role:</strong> {user.role}</p>
            </div>
            <Button variant="secondary" onClick={() => window.history.back()}>Voltar</Button>
          </div>
        </div>
      );
    }
  }

  // Verificar se o usuário tem as permissões necessárias
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(permission => hasPermission(permission));
    if (!hasRequiredPermission) {
      return fallback || (
        <div className="access-denied">
          <div className="access-denied__content">
            <div className="access-denied__icon">🚫</div>
            <h2>Permissão Insuficiente</h2>
            <p>
              Você não tem as permissões necessárias para acessar esta funcionalidade.
            </p>
            <div className="access-denied__info">
              <p><strong>Permissões necessárias:</strong> {requiredPermissions.join(', ')}</p>
            </div>
            <Button variant="secondary" onClick={() => window.history.back()}>Voltar</Button>
          </div>
        </div>
      );
    }
  }

  // Se passou por todas as verificações, renderizar o conteúdo
  return <>{children}</>;
};

// Componente para verificação condicional de permissões
interface ConditionalRenderProps {
  roles?: UserRole[];
  permissions?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  roles,
  permissions,
  children,
  fallback = null,
}) => {
  const { canAccess } = usePermissions();

  if (canAccess(roles, permissions)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default ProtectedRoute;