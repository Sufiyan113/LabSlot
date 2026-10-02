import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('labslot_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('labslot_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        setUser(res.data.user);
        setToken(storedToken);
      } catch (err) {
        // Token invalid — clear
        localStorage.removeItem('labslot_token');
        localStorage.removeItem('labslot_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const res = await authService.login({ email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('labslot_token', newToken);
      localStorage.setItem('labslot_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, message };
    }
  }, []);

  const register = useCallback(async (formData) => {
    setError(null);
    try {
      const res = await authService.register(formData);
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('labslot_token', newToken);
      localStorage.setItem('labslot_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('labslot_token');
    localStorage.removeItem('labslot_user');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isAssistant: user?.role === 'assistant',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
