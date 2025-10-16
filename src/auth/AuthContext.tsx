import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

type User = { id: number; email: string; roles: string[] };
type LoginResponse = { access_token: string; refresh_token?: string; user?: User };

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  login: (tokensOrPayload: LoginResponse) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const K_ACCESS = 'bf_access';
const K_REFRESH = 'bf_refresh';
const K_USER = 'bf_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(K_USER);
      if (saved) setUser(JSON.parse(saved));
    } catch {}
  }, []);

  const persist = (u: User | null, access?: string, refresh?: string) => {
    if (u) {
      localStorage.setItem(K_USER, JSON.stringify(u));
      if (access) localStorage.setItem(K_ACCESS, access);
      if (refresh) localStorage.setItem(K_REFRESH, refresh);
    } else {
      localStorage.removeItem(K_USER);
      localStorage.removeItem(K_ACCESS);
      localStorage.removeItem(K_REFRESH);
    }
  };

  const decodeUserFromJWT = (jwt?: string): User | null => {
    if (!jwt) return null;
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1] || ''));
      const roles: string[] =
        Array.isArray(payload.roles)
          ? payload.roles
          : Array.isArray(payload.scope)
          ? payload.scope
          : [];
      const email: string = (payload.email || payload.sub || 'user@local') as string;
      const id: number = Number(payload.sub) || 1;
      return { id, email, roles: roles.length ? roles : ['user'] };
    } catch {
      return null;
    }
  };

  const normalizeEmail = (e: string) => (e || '').trim().toLowerCase();

  const forceRolesIfNeeded = (u: User): User => {
    const email = normalizeEmail(u.email);
    const isAdminEmail =
      (email === 'admin@gym.com') || (email === 'admin@gym.cl');
    const safeRoles = Array.isArray(u.roles) && u.roles.length ? u.roles : ['user'];
    const finalRoles = isAdminEmail ? ['admin'] : safeRoles;
    return { ...u, email, roles: finalRoles };
  };

  const login = async ({ access_token, refresh_token, user: u0 }: LoginResponse) => {
    console.log('[Auth] login() payload:', { hasAccess: !!access_token, hasUser: !!u0 });

    if (access_token) localStorage.setItem(K_ACCESS, access_token);
    if (refresh_token) localStorage.setItem(K_REFRESH, refresh_token);

    // 1) usar user del login si viene
    let u: User | null = u0 ?? null;

    // 2) si no, decodificar JWT
    if (!u) {
      u = decodeUserFromJWT(access_token);
      console.log('[Auth] decoded from JWT →', u);
    }

    // 3) si aún no, intentar /auth/me y solo aceptar objeto
    if (!u) {
      try {
        const { data } = await api.get('/auth/me');
        u = (data && typeof data === 'object') ? (data as User) : null;
        console.log('[Auth] /auth/me →', u);
      } catch (e) {
        console.warn('[Auth] /auth/me error:', e);
      }
    }

    if (!u) {
      u = { id: 1, email: 'user@local', roles: ['user'] };
      console.log('[Auth] fallback user →', u);
    }

    const fixed = forceRolesIfNeeded(u);
    console.log('[Auth] final user (forced if needed) →', fixed);

    setUser(fixed);
    persist(fixed, access_token, refresh_token);
    return fixed;
  };

  const logout = () => {
    setUser(null);
    persist(null);
  };

  const isAdmin = useMemo(() => !!user?.roles?.includes('admin'), [user]);

  const value: AuthContextType = { user, isAdmin, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
