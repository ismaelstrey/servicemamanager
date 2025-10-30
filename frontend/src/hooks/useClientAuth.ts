import { useContext } from 'react';
import ClientAuthContext, { type ClientAuthContextType } from '../contexts/ClientAuthContext';

export function useClientAuth(): ClientAuthContextType {
  const ctx = useContext(ClientAuthContext);
  if (!ctx) {
    throw new Error('useClientAuth deve ser usado dentro de um ClientAuthProvider');
  }
  return ctx;
}