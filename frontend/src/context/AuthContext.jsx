import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('bloodlife_token'));
  const [loading, setLoading] = useState(true);

  const persist = useCallback((newToken, newUser) => {
    if (newToken) {
      localStorage.setItem('bloodlife_token', newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem('bloodlife_token');
      setToken(null);
    }
    setUser(newUser || null);
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: u, token: t } = await authApi.login(email, password);
    persist(t, u);
    return u;
  }, [persist]);

  const registerDonor = useCallback(async (body) => {
    const { user: u, token: t } = await authApi.registerDonor(body);
    persist(t, u);
    return u;
  }, [persist]);

  const registerReceiver = useCallback(async (body) => {
    const { user: u, token: t } = await authApi.registerReceiver(body);
    persist(t, u);
    return u;
  }, [persist]);

  const logout = useCallback(() => {
    persist(null, null);
  }, [persist]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem('bloodlife_token');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const value = {
    user,
    token,
    loading,
    login,
    registerDonor,
    registerReceiver,
    logout,
    isDonor: user?.role === 'donor',
    isReceiver: user?.role === 'receiver',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
