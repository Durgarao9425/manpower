import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import authService from './authService';

// API base URL from environment variable or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4003/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Skip adding token for auth endpoints
    if (
      config.url?.includes('/login') ||
      config.url?.includes('/register')
    ) {
      return config;
    }
    
    // Add token to request headers
    const token = await authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and not from a refresh token request
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.url?.includes('/login/refresh') &&
      !(originalRequest as any)._retry
    ) {
      (originalRequest as any)._retry = true;
      
      try {
        // Try to refresh the token
        const token = await authService.refreshToken();
        
        // Retry the original request with new token
        if (token && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        authService.logout();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Generic API service for making HTTP requests
 */
class ApiService {
  /**
   * Make a GET request
   */
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.get(endpoint, {
        params,
        ...config,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.delete(endpoint, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Log error details
      console.error('API Error:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        url: axiosError.config?.url,
      });
      
      // Handle specific error codes
      if (axiosError.response?.status === 403) {
        console.error('Permission denied');
      } else if (axiosError.response?.status === 404) {
        console.error('Resource not found');
      } else if (axiosError.response?.status === 500) {
        console.error('Server error');
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;

// Export the axios instance for direct use if needed
export { api };