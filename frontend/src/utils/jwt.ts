import { jwtDecode } from 'jwt-decode';
import type { JwtPayload, AuthUser } from '../types/auth';

export function parseUserFromAccess(token: string | null): AuthUser | null {
  if (!token) return null;
  try {
    const p = jwtDecode<JwtPayload>(token);
    const roles = p.roles ?? [];
    return {
      id: p.sub,
      email: p.email,
      roles: Array.isArray(roles) ? roles : [roles as any],
    };
  } catch {
    return null;
  }
}

export function isExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    if (!exp) return true;
    return Date.now() >= exp * 1000; // exp en segundos
  } catch {
    return true;
  }
}
