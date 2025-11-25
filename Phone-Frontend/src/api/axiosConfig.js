import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Thêm token vào header nếu có
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  console.log('🔐 Request to:', config.url, '| Token exists:', !!accessToken); // Debug
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else {
    console.warn('⚠️ No access token found in localStorage!'); // Debug
  }
  return config;
});

// Xử lý response lỗi (e.g., token hết hạn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // Không có refresh token, đăng xuất
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Thử refresh token
      return api
        .post('/auth/refresh', { refreshToken })
        .then((response) => {
          console.log('✅ Refresh token response:', response.data); // Debug
          const newAccessToken = response.data?.data?.accessToken || response.data?.accessToken;
          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
            console.log('✅ Token refreshed, retrying original request'); // Debug
            return api(originalRequest);
          } else {
            throw new Error('No new token received');
          }
        })
        .catch((err) => {
          console.error('❌ Refresh token failed:', err.message); // Debug
          processQueue(err, null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          window.location.href = '/login';
          return Promise.reject(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    if (error.response?.status === 401) {
      // Token hết hạn, không thể refresh, đăng xuất
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
