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
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('coco_token') || localStorage.getItem('take_two_token') || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('coco_user') || localStorage.getItem('take_two_user');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.email) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [celebrationShown, setCelebrationShown] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('take_two_celebrated') === 'true';
    } catch {
      return false;
    }
  });

  const login = (newToken: string, newUser: User) => {
    try {
      localStorage.setItem('coco_token', newToken);
      localStorage.setItem('take_two_token', newToken);
      localStorage.setItem('coco_user', JSON.stringify(newUser));
      localStorage.setItem('take_two_user', JSON.stringify(newUser));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    try {
      localStorage.removeItem('coco_token');
      localStorage.removeItem('take_two_token');
      localStorage.removeItem('coco_user');
      localStorage.removeItem('take_two_user');
      sessionStorage.removeItem('take_two_celebrated');
    } catch (e) {
      console.warn('Storage clear error:', e);
    }
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
