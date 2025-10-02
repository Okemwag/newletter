import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, LoginCredentials, SignupData } from '../types/auth.types';
import { tokenStorage } from '../utils/tokenStorage';
import { authApi } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  const loadUser = useCallback(async () => {
    try {
      if (tokenStorage.hasTokens()) {
        const userData = await authApi.getProfile();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      tokenStorage.clearTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials: LoginCredentials) => {
    const { user: userData, tokens } = await authApi.login(credentials);
    tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    setUser(userData);
  };

  const signup = async (data: SignupData) => {
    const { user: userData, tokens } = await authApi.signup(data);
    tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    setUser(userData);
  };

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
    }
  }, []);

  // Automatic token refresh
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
          const tokens = await authApi.refreshToken(refreshToken);
          tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        await logout();
      }
    }, 50 * 60 * 1000); // Refresh every 50 minutes (tokens expire in 1 hour)

    return () => clearInterval(refreshInterval);
  }, [user, logout]);

  const refreshAuth = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
