import axios from 'axios';

// API base URL from environment variable or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4003/api';
console.log('API URL:', API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Token refresh timing (refresh when token has less than 5 minutes left)
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

// User interface
interface User {
  id: number;
  username: string;
  email: string;
  user_type: string;
  full_name: string;
  company_id?: number;
  profile_image?: string;
  [key: string]: any; // Allow additional properties
}

// Export the User type
export type { User };

// Auth response interface
interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken?: string;
  user: User;
  expiresIn: number;
}

// Refresh token response
interface RefreshResponse {
  success: boolean;
  accessToken: string;
  expiresIn: number;
}

// Class to manage authentication
class AuthService {
  // Store token expiration time
  private tokenExpiration: number = 0;
  
  // Timer for automatic token refresh
  private refreshTimer: number | null = null;

  // Cached access token
  private cachedAccessToken: string | null = null;

  /**
   * Login user and get tokens
   */
  async login(username: string, password: string): Promise<User> {
    try {
      console.log('AuthService: Attempting login request to', `${API_URL}/login`);
      
      const response = await api.post<AuthResponse>('/login', {
        username,
        password,
      });

      console.log('AuthService: Login response received:', response.status);
      
      if (response.data.success) {
        console.log('AuthService: Login successful, setting session');
        this.setSession(
          response.data.accessToken,
          response.data.refreshToken,
          response.data.expiresIn,
          response.data.user
        );
        return response.data.user;
      } else {
        console.error('AuthService: Login failed with success=false');
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('AuthService: Login error:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('AuthService: Server response error:', error.response.status, error.response.data);
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate refresh token cookie
      await api.post('/login/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and session data regardless of API response
      this.clearSession();
    }
  }

  /**
   * Refresh the access token
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await api.post('/login/refresh', { refreshToken });

      if (response.data.success) {
        const { accessToken, expiresIn } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('tokenExpiration', (Date.now() + expiresIn * 1000).toString());
        return accessToken;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const expirationTime = parseInt(localStorage.getItem('tokenExpiration') || '0');
    // If access token is valid, or refresh token exists, consider authenticated
    return (!!accessToken && expirationTime > Date.now()) || !!refreshToken;
  }

  /**
   * Get access token (with automatic refresh if needed)
   */
  async getAccessToken(): Promise<string | null> {
    if (this.cachedAccessToken) {
      return this.cachedAccessToken;
    }

    const accessToken = localStorage.getItem('accessToken');
    const expirationTime = parseInt(localStorage.getItem('tokenExpiration') || '0');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && expirationTime > Date.now()) {
      this.cachedAccessToken = accessToken;
      return accessToken;
    }

    if (refreshToken) {
      try {
        const newToken = await this.refreshToken();
        this.cachedAccessToken = newToken;
        return newToken;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * Set session data after successful login or token refresh
   */
  private setSession(
    accessToken: string,
    refreshToken: string | undefined,
    expiresIn: number,
    user: User
  ): void {
    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', user.user_type);
    localStorage.setItem('userId', user.id.toString());
    localStorage.setItem('userName', user.full_name);
    localStorage.setItem('userEmail', user.email);
    
    // Calculate token expiration time
    const expirationTime = Date.now() + expiresIn * 1000;
    localStorage.setItem('tokenExpiration', expirationTime.toString());
    this.tokenExpiration = expirationTime;
    
    // Setup refresh timer
    this.setupRefreshTimer();
  }

  /**
   * Clear session data on logout
   */
  private clearSession(): void {
    // Clear all auth-related items from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    // Clear refresh timer
    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // Clear cached token
    this.cachedAccessToken = null;
  }

  /**
   * Setup timer for automatic token refresh
   */
  private setupRefreshTimer(): void {
    // Clear existing timer
    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
    }
    
    // Calculate time until refresh (5 minutes before expiration)
    const timeUntilRefresh = Math.max(0, this.tokenExpiration - Date.now() - REFRESH_THRESHOLD);
    
    // Set new timer
    this.refreshTimer = window.setTimeout(() => {
      if (this.isAuthenticated()) {
        this.refreshToken().catch(console.error);
      }
    }, timeUntilRefresh);
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;

// Setup axios interceptors for automatic token handling
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

// Handle 401 responses (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and not from a refresh token request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/login/refresh')
    ) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const token = await authService.refreshToken();
        
        // Retry the original request with new token
        if (token) {
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

// Export the configured axios instance for API calls
export { api };