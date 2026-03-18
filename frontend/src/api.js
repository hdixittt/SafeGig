import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach the Supabase access token stored after login/register
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
