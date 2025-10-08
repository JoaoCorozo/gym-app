import axios from 'axios';
import { tokenStorage } from '../utils/storage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // http://localhost:3001
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
