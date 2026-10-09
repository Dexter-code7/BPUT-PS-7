import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Fetch current user from session token
  const loadUser = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res?.data?.user) {
        setUser(res.data.user);
      } else {
        clearStoredToken();
        setUser(null);
      }
    } catch (err) {
      console.warn('Session verification failed:', err);
      clearStoredToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load demo accounts for persona switcher
  const loadDemoAccounts = useCallback(async () => {
    try {
      const res = await api.getDemoAccounts();
      if (res?.data?.accounts) {
        setDemoAccounts(res.data.accounts);
      }
    } catch (err) {
      console.warn('Could not load demo accounts:', err);
    }
  }, []);

  useEffect(() => {
    loadUser();
    loadDemoAccounts();
  }, [loadUser, loadDemoAccounts]);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const res = await api.login(username, password);
      if (res.data?.token) {
        setStoredToken(res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        showToast(`Authenticated as ${res.data.user.username} (${res.data.user.role_label})`);
        return res.data.user;
      }
    } catch (err) {
      showToast(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout warning:', err);
    } finally {
      clearStoredToken();
      setToken(null);
      setUser(null);
      showToast('Logged out of session');
    }
  };

  const switchPersona = async (targetUserId) => {
    setIsLoading(true);
    try {
      const res = await api.demoSwitch(targetUserId);
      if (res.data?.token) {
        setStoredToken(res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        showToast(`Persona switched to: ${res.data.user.role_label} (${res.data.user.profile?.full_name || res.data.user.username})`);
      }
    } catch (err) {
      showToast(err.message || 'Could not switch persona');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        demoAccounts,
        login,
        logout,
        switchPersona,
        reloadUser: loadUser,
        showToast,
        toastMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
