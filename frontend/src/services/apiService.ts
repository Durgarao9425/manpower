import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

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
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration and sliding token update
api.interceptors.response.use(
  (response) => {
    // Check for sliding token in response headers
    const newToken = response.headers['x-new-token'] || response.headers['X-New-Token'];
    if (newToken) {
      localStorage.setItem('accessToken', newToken);
      // Optionally: update token expiration time if you store it separately
    }
    return response;
  },
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
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          // No refresh token available, redirect to login
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_URL}/login/refresh`, { refreshToken });
        const newToken = response.data.accessToken;
        
        if (!newToken) {
          throw new Error('No new token received');
        }

        localStorage.setItem("accessToken", newToken);

        // Update the original request's authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear tokens and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error: Unable to connect to the server. Please check if the server is running.');
      return Promise.reject({
        message: 'Unable to connect to the server. Please check if the server is running.',
        originalError: error
      });
    }

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url
      });
      return Promise.reject({
        message: error.response?.data?.message || 'An error occurred while processing your request.',
        status: error.response?.status,
        data: error.response?.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return Promise.reject({
        message: 'No response received from the server. Please try again.',
        originalError: error
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      return Promise.reject({
        message: 'An error occurred while setting up the request.',
        originalError: error
      });
    }
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

// Slider Images API
export const fetchSliderImages = async (): Promise<Slider[]> => {
  try {
    const response = await api.get('/slider-images');
    console.log('API Response for slider images:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching slider images:', error);
    throw error;
  }
};

export const addSliderImage = async (sliderData: Slider): Promise<{ id: number, image_path?: string }> => {
  try {
    const response = await api.post('/slider-images', sliderData);
    console.log('API Response for adding slider image:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding slider image:', error);
    throw error;
  }
};

export const updateSliderImage = async (id: number, sliderData: Partial<Slider>): Promise<{ message: string, image_path?: string }> => {
  try {
    const response = await api.put(`/slider-images/${id}`, sliderData);
    console.log('API Response for updating slider image:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating slider image:', error);
    throw error;
  }
};

export const deleteSliderImage = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/slider-images/${id}`);
    console.log('API Response for deleting slider image:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting slider image:', error);
    throw error;
  }
};

// Fetch companies API
export const fetchCompanies = async (): Promise<Company[]> => {
  const response = await api.get('/companies');
  return response.data;
};

// Define Slider type
export interface Slider {
  id: number;
  title: string;
  description: string;
  image_path: string;
  status: string;
  display_order: number;
  company_id: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Define Company type
interface Company {
  id: number;
  company_name: string;
}

// Role Permissions API
export const rolePermissionsAPI = {
  getUserPermissions: async (userId: number) => {
    try {
      const response = await api.get(`/role-permissions/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  },
  updateUserPermissions: async (userId: number, permissions: {
    [moduleId: string]: {
      view: boolean;
      edit: boolean;
      delete: boolean;
    }
  }) => {
    try {
      const response = await api.put(`/role-permissions/${userId}`, { permissions });
      return response.data;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  },
  getModules: async () => {
    try {
      const response = await api.get('/role-permissions/modules');
      return response.data;
    } catch (error) {
      console.error('Error fetching permission modules:', error);
      throw error;
    }
  },
  checkPermission: async (userId: number, moduleId: string) => {
    try {
      const response = await api.get(`/role-permissions/check/${userId}/${moduleId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking user permission:', error);
      throw error;
    }
  }
};

interface ErrorResponse {
  message: string;
  status: number;
  data: any;
}