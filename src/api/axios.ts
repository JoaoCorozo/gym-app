import axios from 'axios';

const instance = axios.create({
  baseURL: '', // same-origin para MSW
});

const K_ACCESS = 'bf_access';

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem(K_ACCESS);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
