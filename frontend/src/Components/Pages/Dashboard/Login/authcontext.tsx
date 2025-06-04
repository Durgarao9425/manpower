import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../../../services/authService";
import type { User } from "../../../../services/authService";
import Loader from '../../../Common/Loaders';

// Auth context interface
interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  setSessionTimeout: () => void;
  clearSessionTimeout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  userRole: null,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => false,
  setSessionTimeout: () => {},
  clearSessionTimeout: () => {},
});

// Session timeout duration (30 minutes of inactivity)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [sessionTimeoutId, setSessionTimeoutId] = useState<number | null>(null);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        const token = await authService.getAccessToken();
        if (token) {
          const userData = authService.getCurrentUser();
          if (userData) {
            setCurrentUser(userData);
            setUserRole(userData.user_type);
            setIsAuthenticated(true);
            setSessionExpired(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setCurrentUser(null);
        setUserRole(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // Set up activity listeners for session timeout
  useEffect(() => {
    if (isAuthenticated) {
      setSessionExpired(false); // Reset flag on auth
      // Set initial timeout
      setSessionTimeout();
      
      // Add event listeners for user activity
      const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
      const resetTimeout = () => {
        clearSessionTimeout();
        setSessionTimeout();
      };
      
      activityEvents.forEach(event => {
        window.addEventListener(event, resetTimeout);
      });
      
      // Clean up event listeners
      return () => {
        activityEvents.forEach(event => {
          window.removeEventListener(event, resetTimeout);
        });
        clearSessionTimeout();
      };
    }
  }, [isAuthenticated]);

  // Login function
  const login = useCallback(async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Attempting login for user:', username);
      
      const user = await authService.login(username, password);
      console.log('Login successful, user:', user);
      
      // Set all auth state at once to prevent flickering
      setCurrentUser(user);
      setUserRole(user.user_type);
      setIsAuthenticated(true);
      setSessionExpired(false);
      
      // Navigate based on user role
      const targetPath = user.user_type === 'rider' ? '/rider-dashboard' : '/dashboard';
      navigate(targetPath, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Check if user is authenticated
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const token = await authService.getAccessToken();
      if (!token) {
        setCurrentUser(null);
        setUserRole(null);
        setIsAuthenticated(false);
        return false;
      }

      const user = authService.getCurrentUser();
      if (!user) {
        setCurrentUser(null);
        setUserRole(null);
        setIsAuthenticated(false);
        return false;
      }

      setCurrentUser(user);
      setUserRole(user.user_type);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      setCurrentUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      
      setCurrentUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
      
      navigate('/login', { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Clear session timeout
  const clearSessionTimeout = useCallback(() => {
    if (sessionTimeoutId) {
      window.clearTimeout(sessionTimeoutId);
      setSessionTimeoutId(null);
    }
  }, [sessionTimeoutId]);

  // Set session timeout
  const setSessionTimeout = useCallback(() => {
    clearSessionTimeout(); // Always clear before setting new
    const timeoutId = window.setTimeout(() => {
      if (isAuthenticated && !sessionExpired) {
        setSessionExpired(true);
        logout();
        alert('Your session has expired due to inactivity. Please log in again.');
      }
    }, SESSION_TIMEOUT);
    setSessionTimeoutId(timeoutId);
  }, [isAuthenticated, logout, sessionExpired, clearSessionTimeout]);

  // Context value
  const contextValue: AuthContextType = {
    currentUser,
    isAuthenticated,
    isLoading,
    userRole,
    login,
    logout,
    checkAuth,
    setSessionTimeout,
    clearSessionTimeout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {isLoading ? <Loader message="Loading..." size="large" fullScreen /> : children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);