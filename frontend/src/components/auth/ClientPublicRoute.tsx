import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useClientAuth } from '../../hooks/useClientAuth';

export function ClientPublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useClientAuth();
  if (isAuthenticated) {
    return <Navigate to="/client/dashboard" replace />;
  }
  return children as any;
}

export default ClientPublicRoute;