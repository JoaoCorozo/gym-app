// ⬇️ usa axios directo, sin baseURL, para pegarle a /auth/* en el mismo origen (5173), que MSW intercepta
import axios from 'axios';
import { authStorage } from '../utils/authStorage';
import { parseUserFromAccess } from '../utils/jwt';
import type { AuthTokens, AuthUser } from '../types/auth';

export async function login(email: string, password: string): Promise<AuthUser> {
  const { data } = await axios.post<AuthTokens>('/auth/login', { email, password });
  authStorage.setAccess(data.access_token);
  authStorage.setRefresh(data.refresh_token);
  const user = parseUserFromAccess(authStorage.getAccess());
  if (!user) throw new Error('Token inválido');
  return user;
}

export async function logout() {
  authStorage.clearAll();
  window.location.href = '/login';
}

export function getCurrentUser(): AuthUser | null {
  return parseUserFromAccess(authStorage.getAccess());
}
