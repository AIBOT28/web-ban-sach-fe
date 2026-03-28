import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { api, getToken, setToken, removeToken } from './api';
import type { TokenPayload, UserInfo, LoginRequest, RegisterRequest } from './types';

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function decodeToken(token: string): UserInfo | null {
  try {
    const decoded = jwtDecode<TokenPayload>(token);

    // Check expiration
    if (decoded.exp * 1000 < Date.now()) {
      removeToken();
      return null;
    }

    const roles = Array.isArray(decoded.role) ? decoded.role : [decoded.role];

    return {
      userId: decoded.nameid,
      username: decoded.given_name,
      email: decoded.email,
      roles,
      isAdmin: roles.includes('Admin'),
    };
  } catch {
    removeToken();
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const userInfo = decodeToken(token);
      setUser(userInfo);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await api.post<{ token: string }>('/api/Auth/login', data);
    const token = response.data.token;
    setToken(token);
    const userInfo = decodeToken(token);
    setUser(userInfo);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await api.post<{ token: string }>('/api/Auth/register', data);
    const token = response.data.token;
    setToken(token);
    const userInfo = decodeToken(token);
    setUser(userInfo);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
