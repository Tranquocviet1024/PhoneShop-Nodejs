import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra token khi load
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    if (accessToken && userData && userData !== 'undefined') {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
        // Set default token cho axios
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/signin', { email, password });
      // Backend trả về: { success, statusCode, data: { accessToken, refreshToken, user }, message }
      const responseData = response.data.data || response.data;
      const { accessToken, refreshToken, user } = responseData;
      
      if (!accessToken || !user) {
        throw new Error('Invalid response format');
      }
      
      console.log('✅ Login successful, storing tokens and user');
      
      // Lưu tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set default token cho axios
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      setUser(user);
      setIsAuthenticated(true);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Login error:', error.message);
      return { success: false, error: error.response?.data?.message || error.message || 'Đăng nhập thất bại' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      // Backend trả về: { success, statusCode, data: { accessToken, refreshToken, user }, message }
      const responseData = response.data.data || response.data;
      const { accessToken, refreshToken, user } = responseData;
      
      if (!accessToken || !user) {
        throw new Error('Invalid response format');
      }
      
      // Lưu tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set default token cho axios
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      setUser(user);
      setIsAuthenticated(true);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message || 'Đăng ký thất bại' };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
