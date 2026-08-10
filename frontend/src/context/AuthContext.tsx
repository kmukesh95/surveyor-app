import React, { createContext, useContext, useState, useEffect } from 'react';
import { axiosClient } from '../api/axiosClient';

export interface UserRole {
  id: string;
  roleCode: 'SUPER_ADMIN' | 'ADMIN' | 'CMS_USER' | 'SURVEYOR' | 'BENEFICIARY';
  roleName: string;
}

export interface User {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  mobile: string;
  gender: string;
  registrationType: string;
  role: UserRole;
  beneficiaryDetail?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<any>;
  verify2FA: (tfaCode: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  requires2FA: boolean;
  tempToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [requires2FA, setRequires2FA] = useState<boolean>(false);
  const [tempToken, setTempToken] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      if (!localStorage.getItem('access_token')) {
        setIsLoading(false);
        return;
      }
      const response: any = await axiosClient.get('/auth/me');
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to fetch user context:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (identifier: string, password: string) => {
    const response: any = await axiosClient.post('/auth/login', { identifier, password });
    if (response.success && response.data) {
      const { accessToken, requires2FA: needs2FA, user: userData } = response.data;
      if (needs2FA) {
        setRequires2FA(true);
        setTempToken(accessToken);
        localStorage.setItem('access_token', accessToken);
        return { requires2FA: true };
      } else {
        localStorage.setItem('access_token', accessToken);
        setToken(accessToken);
        setUser(userData);
        setRequires2FA(false);
        return { requires2FA: false, user: userData };
      }
    }
    throw new Error(response.message || 'Login failed');
  };

  const verify2FA = async (tfaCode: string) => {
    const response: any = await axiosClient.post('/auth/verify-2fa', { tfaCode });
    if (response.success) {
      setRequires2FA(false);
      setTempToken(null);
      await fetchCurrentUser();
    } else {
      throw new Error(response.message || '2FA Verification failed');
    }
  };

  const logout = async () => {
    try {
      if (localStorage.getItem('access_token')) {
        await axiosClient.post('/auth/logout');
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
      setToken(null);
      setRequires2FA(false);
      setTempToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        verify2FA,
        logout,
        refreshUser: fetchCurrentUser,
        requires2FA,
        tempToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
