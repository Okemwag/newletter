import { tokenStorage } from '../utils/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
}

class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { skipAuth = false, headers = {}, ...restConfig } = config;

    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add authorization header if not skipped and token exists
    if (!skipAuth) {
      const token = tokenStorage.getAccessToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...restConfig,
        headers: requestHeaders,
      });

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401 && !skipAuth) {
        // Try to refresh the token
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
          try {
            const refreshResponse = await this.post<{ data: { accessToken: string; refreshToken: string } }>(
              '/auth/refresh',
              { refreshToken },
              { skipAuth: true }
            );
            
            // Update tokens
            tokenStorage.setTokens(
              refreshResponse.data.accessToken,
              refreshResponse.data.refreshToken
            );

            // Retry the original request with new token
            requestHeaders['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
            const retryResponse = await fetch(url, {
              ...restConfig,
              headers: requestHeaders,
            });

            if (!retryResponse.ok) {
              throw new Error(`HTTP error! status: ${retryResponse.status}`);
            }

            return await retryResponse.json();
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            tokenStorage.clearTokens();
            window.location.href = '/login';
            throw new Error('Session expired. Please login again.');
          }
        } else {
          // No refresh token, redirect to login
          tokenStorage.clearTokens();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const httpClient = new HttpClient(API_BASE_URL);
