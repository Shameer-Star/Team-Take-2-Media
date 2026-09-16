import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  celebrationShown: boolean;
  setCelebrationShown: (shown: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('take_two_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('take_two_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [celebrationShown, setCelebrationShown] = useState<boolean>(() => {
    return sessionStorage.getItem('take_two_celebrated') === 'true';
  });

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('take_two_token', newToken);
    localStorage.setItem('take_two_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('take_two_token');
    localStorage.removeItem('take_two_user');
    sessionStorage.removeItem('take_two_celebrated');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!token || token.startsWith('demo-')) return;
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('take_two_user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  useEffect(() => {
    if (token) {
      refreshProfile();
    }
  }, [token]);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    refreshProfile,
    celebrationShown,
    setCelebrationShown: (shown: boolean) => {
      setCelebrationShown(shown);
      sessionStorage.setItem('take_two_celebrated', shown ? 'true' : 'false');
    },
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
