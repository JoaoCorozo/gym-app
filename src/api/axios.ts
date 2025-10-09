import axios from 'axios';
import { authStorage } from '../utils/authStorage';
import { isExpired } from '../utils/jwt';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // sigue siendo 3001 solo para tus recursos del mock (clientes, planes, etc.)
  timeout: 12000,
});

let refreshing = false;
let waiters: Array<(ok: boolean) => void> = [];

async function refreshAccess(): Promise<boolean> {
  if (refreshing) return new Promise(res => waiters.push(res));
  refreshing = true;
  try {
    const refreshToken = authStorage.getRefresh();
    if (!refreshToken) return false;

    // ⬇️ IMPORTANTÍSIMO: usar same-origin para que MSW intercepte /auth/refresh
    const { data } = await axios.post('/auth/refresh', { refresh_token: refreshToken });

    if (data?.access_token) {
      authStorage.setAccess(data.access_token);
      waiters.forEach(fn => fn(true));
      waiters = [];
      return true;
    }
    return false;
  } catch {
    return false;
  } finally {
    refreshing = false;
  }
}

api.interceptors.request.use(async (config) => {
  let token = authStorage.getAccess();
  if (!token || isExpired(token)) {
    const ok = await refreshAccess();
    token = ok ? authStorage.getAccess() : null;
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  async (error) => {
    const original = error.config;
    if (error?.response?.status === 401 && !original._retry) {
      original._retry = true;
      const ok = await refreshAccess();
      if (ok) {
        const t = authStorage.getAccess();
        if (t) original.headers.Authorization = `Bearer ${t}`;
        return api(original);
      }
      authStorage.clearAll();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
