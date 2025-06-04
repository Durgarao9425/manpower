import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

// Define the shape of our context
interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
}

// Create the context with a default value
export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  themeColor: '#1976d2',
  setThemeColor: () => {}
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

// Provider component that wraps the app
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Try to get the saved theme from localStorage, or use default
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  const [themeColor, setThemeColor] = useState(() => {
    const savedColor = localStorage.getItem('themeColor');
    return savedColor || '#1976d2';
  });

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    document.body.style.backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';
    document.body.style.color = isDarkMode ? '#fff' : '#333';
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('themeColor', themeColor);
  }, [themeColor]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // The value that will be provided to consumers of this context
  const value = {
    isDarkMode,
    toggleDarkMode,
    themeColor,
    setThemeColor
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};