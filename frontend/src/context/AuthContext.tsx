import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AuthUser, AuthContextValue, SignupData } from '../types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'retinacare_auth_token';
const USER_KEY  = 'retinacare_auth_user';

const API_BASE = '/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Validate token with backend on mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      let savedToken: string | null = null;
      try {
        savedToken = localStorage.getItem(TOKEN_KEY);
      } catch {
        // ignore
      }

      if (!savedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.status === 401) {
          // Token expired or invalid on backend
          if (isMounted) {
            logout();
          } else {
            try {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
            } catch {
              // ignore
            }
          }
        } else if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.user) {
            if (isMounted) {
              setUser(data.data.user);
              setToken(savedToken);
            }
            try {
              localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
              localStorage.setItem(TOKEN_KEY, savedToken);
            } catch {
              // ignore
            }
          }
        }
        // Non-401 errors: do not destroy cached session from localStorage
      } catch {
        // Network error connecting to backend: preserve cached user
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [logout]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.data?.token && data.data?.user) {
        setToken(data.data.token);
        setUser(data.data.user);
        try {
          localStorage.setItem(TOKEN_KEY, data.data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
        } catch {
          // ignore
        }
        return { success: true, message: data.message };
      }

      return { success: false, message: data.message || 'Login failed.' };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network error connecting to auth server.';
      return { success: false, message: errorMsg };
    }
  };

  const signup = async (signupData: SignupData): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      const data = await res.json();

      if (res.ok && data.success && data.data?.token && data.data?.user) {
        setToken(data.data.token);
        setUser(data.data.user);
        try {
          localStorage.setItem(TOKEN_KEY, data.data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
        } catch {
          // ignore
        }
        return { success: true, message: data.message };
      }

      return {
        success: false,
        message: data.message || (data.errors ? Object.values(data.errors).join(', ') : 'Signup failed.'),
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network error connecting to auth server.';
      return { success: false, message: errorMsg };
    }
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
