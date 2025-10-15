import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

type User = {
  id: number;
  email: string;
  roles: string[]; // ['admin'] | ['user']
};

type LoginResponse = {
  access_token: string;
  refresh_token?: string;
  user?: User; // si tu backend lo envía directo
};

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  login: (tokensOrPayload: LoginResponse) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// storage keys
const K_ACCESS = 'bf_access';
const K_REFRESH = 'bf_refresh';
const K_USER = 'bf_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Cargar sesión desde localStorage al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(K_USER);
      if (saved) setUser(JSON.parse(saved));
    } catch {
      // ignore
    }
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

  const fetchMe = async (): Promise<User | null> => {
    try {
      const { data } = await api.get<User>('/auth/me');
      return data ?? null;
    } catch {
      return null;
    }
  };

  const decodeUserFromJWT = (jwt?: string): User | null => {
    if (!jwt) return null;
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1] || ''));
      // intenta mapear a nuestro shape
      const roles: string[] =
        Array.isArray(payload.roles) ? payload.roles : Array.isArray(payload.scope) ? payload.scope : [];
      const email: string = payload.email || payload.sub || 'user@local';
      const id: number = Number(payload.sub) || 1;
      return { id, email, roles: roles.length ? roles : ['user'] };
    } catch {
      return null;
    }
  };

  const login = async ({ access_token, refresh_token, user: u0 }: LoginResponse) => {
    // guarda tokens
    if (access_token) localStorage.setItem(K_ACCESS, access_token);
    if (refresh_token) localStorage.setItem(K_REFRESH, refresh_token);

    // 1) si viene el usuario en la respuesta, úsalo
    let u: User | null = u0 ?? null;

    // 2) si no viene, intenta pedir /auth/me
    if (!u) u = await fetchMe();

    // 3) si aún no, intenta decodificar el JWT
    if (!u) u = decodeUserFromJWT(access_token);

    // fallback final por si todo falla
    if (!u) u = { id: 1, email: 'user@local', roles: ['user'] };

    setUser(u);
    persist(u, access_token, refresh_token);
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
  if (ctx === undefined) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
