import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('rideflow_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('rideflow_user');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('rideflow_user');
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const data = res.data?.data || res.data || res;
    const jwtToken = data?.token || res?.token;
    setToken(jwtToken);
    setUser(data);
    if (jwtToken) {
      localStorage.setItem('rideflow_token', jwtToken);
    }
    localStorage.setItem('rideflow_user', JSON.stringify(data));
    return data;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const data = res.data?.data || res.data || res;
    const jwtToken = data?.token || res?.token;
    setToken(jwtToken);
    setUser(data);
    if (jwtToken) {
      localStorage.setItem('rideflow_token', jwtToken);
    }
    localStorage.setItem('rideflow_user', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rideflow_token');
    localStorage.removeItem('rideflow_user');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('rideflow_user', JSON.stringify(merged));
      return merged;
    });
  };

  const role = user?.role || null;
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        isAuthenticated,
        isAdmin: role === 'ADMIN' || role === 'ROLE_ADMIN',
        isStaff: role === 'STAFF' || role === 'ROLE_STAFF',
        isCustomer: role === 'CUSTOMER' || role === 'ROLE_CUSTOMER',
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
