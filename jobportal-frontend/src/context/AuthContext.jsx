import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const profile = await userApi.getProfile();
          setUser(profile);
          setRole(profile.role);
          localStorage.setItem('user', JSON.stringify(profile));
          localStorage.setItem('role', profile.role);
        } catch (error) {
          console.error('Failed to restore user profile from token:', error);
          if (error?.status === 401 || error?.status === 403) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [logout]);

  const login = useCallback(async (credentials, isRecruiter = false) => {
    const response = isRecruiter
      ? await authApi.recruiterLogin(credentials)
      : await authApi.login(credentials);

    let jwtToken = '';
    let userRole = '';
    let userData = null;

    if (typeof response === 'string') {
      jwtToken = response;
    } else if (response && response.token) {
      jwtToken = response.token;
      userRole = response.role;
      userData = response;
    } else if (response && response.jwt) {
      jwtToken = response.jwt;
      userRole = response.role;
      userData = response;
    }

    if (!jwtToken) {
      throw new Error('Authentication response did not contain a valid JWT token.');
    }

    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);

    try {
      const profile = await userApi.getProfile();
      setUser(profile);
      setRole(profile.role);
      localStorage.setItem('user', JSON.stringify(profile));
      localStorage.setItem('role', profile.role);
      return profile;
    } catch {
      if (userData) {
        setUser(userData);
        setRole(userRole || (isRecruiter ? 'RECRUITER' : 'USER'));
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', userRole || (isRecruiter ? 'RECRUITER' : 'USER'));
      }
      return userData;
    }
  }, []);

  const updateUserProfile = useCallback((updatedData) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(next));
      if (next.role) {
        setRole(next.role);
        localStorage.setItem('role', next.role);
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    role,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    updateUserProfile,
    updateUser: updateUserProfile, // Alias for seamless compatibility
  }), [user, token, role, loading, login, logout, updateUserProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
