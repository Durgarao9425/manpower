import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";


export interface LoggedInUser {
  id: number;
  username?: string;
  email?: string;
  role?: string;
  token?: string;
} 

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  afterLogin: (currentUser: LoggedInUser) => void;
  afterLogout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  afterLogin: () => {},
  afterLogout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    setIsAuthenticated(!!currentUser);
    setIsLoading(false);
  }, []);

  const afterLogin = (currentUser: LoggedInUser) => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    setIsAuthenticated(true);
    setIsLoading(false);
    navigate("/");
  };

  const afterLogout = () => {
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    setIsLoading(false);
    navigate("/login" , { replace: true });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, afterLogin, afterLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 