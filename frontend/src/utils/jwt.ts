export interface JwtPayload {
  userId?: number;
  email?: string;
  role?: string;
  providerId?: number;
}

export function decodeJwt(token?: string): JwtPayload | null {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1];
    const json = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
    return json as JwtPayload;
  } catch (e) {
    console.error('Failed to decode JWT', e);
    return null;
  }
}