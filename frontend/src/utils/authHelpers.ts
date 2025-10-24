import { UserRole, type Permission } from '../types/auth';

// Função para verificar se o usuário tem uma role específica
export const checkUserRole = (userRoles: UserRole[], requiredRole: UserRole): boolean => {
  return userRoles.includes(requiredRole);
};

// Função para verificar se o usuário tem uma permissão específica
export const checkUserPermission = (userPermissions: Permission[], requiredPermission: Permission): boolean => {
  return userPermissions.includes(requiredPermission);
};

// Função para validar token
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch {
    return false;
  }
};

// Função para extrair dados do token
export const getTokenData = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};