import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useClientAuth } from '../../hooks/useClientAuth';

export function ClientProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useClientAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/client/login" replace state={{ from: location }} />;
  }

  return children as any;
}

export default ClientProtectedRoute;