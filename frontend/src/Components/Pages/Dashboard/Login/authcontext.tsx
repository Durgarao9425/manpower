import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../../../services/authService";
import type { User } from "../../../../services/authService";

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
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) {
        // Try auto-login if credentials are stored
        const rememberedUser = localStorage.getItem("rememberedUser");
        const rememberedPass = localStorage.getItem("rememberedPass"); // Only for dev/demo!
        if (rememberedUser && rememberedPass) {
          try {
            await login(rememberedUser, rememberedPass);
          } catch {
            // If auto-login fails, redirect to login page
            navigate('/login', { replace: true });
          }
        } else {
          navigate('/login', { replace: true });
        }
      }
    };
    initAuth();
  }, []);

  // Set up activity listeners for session timeout
  useEffect(() => {
    if (isAuthenticated) {
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

  // Check if user is authenticated
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      // Check if token is valid
      if (authService.isAuthenticated()) {
        // Get current user data
        const user = authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setUserRole(user.user_type);
          setIsAuthenticated(true);
          return true;
        }
      }
      
      // If we get here, user is not authenticated
      setCurrentUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      setCurrentUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Login function
  const login = useCallback(async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Attempting login for user:', username);
      
      const user = await authService.login(username, password);
      console.log('Login successful, user:', user);
      
      setCurrentUser(user);
      setUserRole(user.user_type);
      setIsAuthenticated(true);
      
      // Navigate based on user role
      if (user.user_type === 'admin') {
        console.log('Navigating to admin dashboard');
        navigate('/dashboard');
      } else if (user.user_type === 'rider') {
        console.log('Navigating to rider dashboard');
        navigate('/rider-dashboard');
      } else {
        console.log('Navigating to default dashboard');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

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

  // Set session timeout
  const setSessionTimeout = useCallback(() => {
    const timeoutId = window.setTimeout(() => {
      // Auto logout after inactivity
      if (isAuthenticated) {
        logout();
        alert('Your session has expired due to inactivity. Please log in again.');
      }
    }, SESSION_TIMEOUT);
    
    setSessionTimeoutId(timeoutId);
  }, [isAuthenticated, logout]);

  // Clear session timeout
  const clearSessionTimeout = useCallback(() => {
    if (sessionTimeoutId) {
      window.clearTimeout(sessionTimeoutId);
      setSessionTimeoutId(null);
    }
  }, [sessionTimeoutId]);

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
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);