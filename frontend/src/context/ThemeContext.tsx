import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define the shape of our context
interface ThemeContextType {
  themeColor: string;
  setThemeColor: (color: string) => void;
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
  themeColor: '#1976d2', // Default blue
  setThemeColor: () => {},
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

// Provider component that wraps the app
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Try to get the saved theme from localStorage, or use default
  const [themeColor, setThemeColor] = useState<string>(() => {
    const savedTheme = localStorage.getItem('riderThemeColor');
    return savedTheme || '#1976d2'; // Default blue if no saved theme
  });

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('riderThemeColor', themeColor);
  }, [themeColor]);

  // The value that will be provided to consumers of this context
  const value = {
    themeColor,
    setThemeColor,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};