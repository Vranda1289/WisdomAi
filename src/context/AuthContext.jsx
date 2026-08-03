import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('wisdom_jwt');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('wisdom_jwt');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('wisdom_jwt', response.data.data.token);
      await fetchCurrentUser();
      return response.data;
    }
  };

  const register = async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    if (response.data.success) {
      // API returns token on register
      localStorage.setItem('wisdom_jwt', response.data.data.token);
      await fetchCurrentUser();
      return response.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('wisdom_jwt');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
