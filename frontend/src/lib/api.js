import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const TOKEN_KEY = 'physio_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalise error messages coming from the API.
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';
    const details = error.response?.data?.error?.details;
    return Promise.reject({ message, details, status: error.response?.status });
  },
);

export default api;
