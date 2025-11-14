import type React from 'react';
import styled from 'styled-components';
import { Navigate, useLocation } from 'react-router-dom';
import { Button, LogoLoader, Card } from '../../components/ui';
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
        <AccessWrapper>
          <Card>
            <AccessContent role="alert">
              <AccessIcon>🚫</AccessIcon>
              <AccessTitle>Acesso Negado</AccessTitle>
              <AccessDesc>
                Você não tem permissão para acessar esta página. Entre em contato com o administrador se acredita que isso é um erro.
              </AccessDesc>
              <AccessInfo>
                <p><strong>Roles necessárias:</strong> {requiredRoles.join(', ')}</p>
                <p><strong>Sua role:</strong> {user.role}</p>
              </AccessInfo>
              <Button variant="secondary" onClick={() => window.history.back()}>Voltar</Button>
            </AccessContent>
          </Card>
        </AccessWrapper>
      );
    }
  }

  // Verificar se o usuário tem as permissões necessárias
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(permission => hasPermission(permission));
    if (!hasRequiredPermission) {
      return fallback || (
        <AccessWrapper>
          <Card>
            <AccessContent role="alert">
              <AccessIcon>🚫</AccessIcon>
              <AccessTitle>Permissão Insuficiente</AccessTitle>
              <AccessDesc>
                Você não tem as permissões necessárias para acessar esta funcionalidade.
              </AccessDesc>
              <AccessInfo>
                <p><strong>Permissões necessárias:</strong> {requiredPermissions.join(', ')}</p>
              </AccessInfo>
              <Button variant="secondary" onClick={() => window.history.back()}>Voltar</Button>
            </AccessContent>
          </Card>
        </AccessWrapper>
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

const AccessWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const AccessContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const AccessIcon = styled.div`
  font-size: 32px;
`;

const AccessTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const AccessDesc = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AccessInfo = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
`;
