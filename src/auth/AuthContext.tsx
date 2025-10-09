import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as doLogin, logout as doLogout, getCurrentUser } from './authService';
import type { AuthUser } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthCtx = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());

  // 🔄 actualiza el usuario cuando cambia el storage (p.ej. otro tab)
  useEffect(() => {
    const onStorage = () => setUser(getCurrentUser());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  async function login(email: string, password: string) {
    await doLogin(email, password);
    setUser(getCurrentUser());
  }

  function logout() {
    doLogout();
    setUser(null);
  }

  const value: AuthContextValue = {
    user,
    isAdmin: !!user?.roles?.includes('admin'),
    login,
    logout,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
