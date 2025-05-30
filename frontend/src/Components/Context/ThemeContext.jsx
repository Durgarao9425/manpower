// contexts/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

const presets = [
  { color: '#10B981', name: 'Green' },
  { color: '#3B82F6', name: 'Blue' },
  { color: '#8B5CF6', name: 'Purple' },
  { color: '#60A5FA', name: 'Light Blue' },
  { color: '#F59E0B', name: 'Orange' },
  { color: '#EF4444', name: 'Red' },
];

const fonts = [
  { label: 'Public Sans', value: 'Public Sans, sans-serif' },
  { label: 'DM Sans', value: 'DM Sans, sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Nunito Sans', value: 'Nunito Sans, sans-serif' }
];

export const ThemeContextProvider = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState('#10B981');
  const [fontFamily, setFontFamily] = useState('Public Sans, sans-serif');
  const [fontSize, setFontSize] = useState(16);
  const [darkMode, setDarkMode] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('themeSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setPrimaryColor(settings.primaryColor || '#10B981');
      setFontFamily(settings.fontFamily || 'Public Sans, sans-serif');
      setFontSize(settings.fontSize || 16);
      setDarkMode(settings.darkMode || false);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settings = {
      primaryColor,
      fontFamily,
      fontSize,
      darkMode
    };
    localStorage.setItem('themeSettings', JSON.stringify(settings));
  }, [primaryColor, fontFamily, fontSize, darkMode]);

  // Create MUI theme based on current settings
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: primaryColor,
      },
      background: {
        default: darkMode ? '#121212' : '#ffffff',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: fontFamily,
      fontSize: fontSize,
      h1: { fontFamily: fontFamily },
      h2: { fontFamily: fontFamily },
      h3: { fontFamily: fontFamily },
      h4: { fontFamily: fontFamily },
      h5: { fontFamily: fontFamily },
      h6: { fontFamily: fontFamily },
      body1: { fontFamily: fontFamily },
      body2: { fontFamily: fontFamily },
      button: { fontFamily: fontFamily },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: fontFamily,
            textTransform: 'none',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-root': {
              fontFamily: fontFamily,
            },
          },
        },
      },
    },
  });

  const contextValue = {
    // Current values
    primaryColor,
    fontFamily,
    fontSize,
    darkMode,
    
    // Setters
    setPrimaryColor,
    setFontFamily,
    setFontSize,
    setDarkMode,
    
    // Helper data
    presets,
    fonts,
    
    // Helper functions
    resetToDefaults: () => {
      setPrimaryColor('#10B981');
      setFontFamily('Public Sans, sans-serif');
      setFontSize(16);
      setDarkMode(false);
    },
    
    applyPreset: (color) => {
      setPrimaryColor(color);
    }
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
};