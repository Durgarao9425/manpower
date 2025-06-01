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
        const response = await axios.post(`${API_URL}/login/refresh`, { refreshToken });

        const newToken = response.data.accessToken;
        localStorage.setItem("accessToken", newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
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

// Slider Images API
export const fetchSliderImages = async (): Promise<Slider[]> => {
  const response = await api.get('/slider-images');
  return response.data;
};

export const addSliderImage = async (sliderData: Slider): Promise<{ id: number }> => {
  const response = await api.post('/slider-images', sliderData);
  return response.data;
};

export const updateSliderImage = async (id: number, sliderData: Partial<Slider>): Promise<{ message: string }> => {
  const response = await api.put(`/slider-images/${id}`, sliderData);
  return response.data;
};

export const deleteSliderImage = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/slider-images/${id}`);
  return response.data;
};

// Fetch companies API
export const fetchCompanies = async (): Promise<Company[]> => {
  const response = await api.get('/companies');
  return response.data;
};

// Define Slider type
interface Slider {
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