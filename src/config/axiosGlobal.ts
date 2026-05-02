import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api/v1';

const api = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = false;
let queue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const flushQueue = (err: any, token: string | null) => {
  queue.forEach(p => err ? p.reject(err) : p.resolve(token!));
  queue = [];
};

const forceLogout = () => {
  localStorage.clear();
  window.location.replace('/login');
};

api.interceptors.response.use(res => res, async (error) => {
  const original = error.config;
  const status   = error.response?.status;
  const code     = error.response?.data?.code;

  // Solo manejamos 401 o TOKEN_EXPIRED
  if ((status !== 401 && code !== 'TOKEN_EXPIRED') || original._retry) {
    return Promise.reject(error);
  }

  // Si ya estamos refrescando, encolar esta request
  if (refreshing) {
    return new Promise((resolve, reject) => {
      queue.push({
        resolve: (newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(original));
        },
        reject,
      });
    });
  }

  original._retry = true;
  refreshing = true;

  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('no_refresh');

    const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    flushQueue(null, data.accessToken);
    original.headers.Authorization = `Bearer ${data.accessToken}`;
    return api(original);
  } catch (err) {
    flushQueue(err, null);
    forceLogout();
    return Promise.reject(err);
  } finally {
    refreshing = false;
  }
});

export default api;
