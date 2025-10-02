import { User, LoginCredentials, SignupData, AuthTokens } from '../types/auth.types';
import { httpClient } from './httpClient';

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await httpClient.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/login',
      credentials,
      { skipAuth: true }
    );

    return {
      user: response.data.user,
      tokens: {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      },
    };
  },

  signup: async (data: SignupData): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await httpClient.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/signup',
      data,
      { skipAuth: true }
    );

    return {
      user: response.data.user,
      tokens: {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      },
    };
  },

  logout: async (): Promise<void> => {
    await httpClient.post<ApiResponse<void>>('/auth/logout');
  },

  getProfile: async (): Promise<User> => {
    const response = await httpClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await httpClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh',
      { refreshToken },
      { skipAuth: true }
    );

    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    };
  },
};
