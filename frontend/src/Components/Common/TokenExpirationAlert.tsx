import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  LinearProgress,
  Box,
  Typography,
} from '@mui/material';
import { useAuth } from '../Pages/Dashboard/Login/authcontext';

// Warning threshold in milliseconds (default: 5 minutes)
const WARNING_THRESHOLD = 
  (import.meta.env.VITE_TOKEN_EXPIRY_WARNING || 5) * 60 * 1000;

// Check interval in milliseconds (30 seconds)
const CHECK_INTERVAL = 30 * 1000;

/**
 * Component that shows an alert when the JWT token is about to expire
 * Gives the user options to refresh the token or logout
 */
const TokenExpirationAlert: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  const { logout } = useAuth();

  // Format time remaining in minutes and seconds
  const formatTimeLeft = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Check token expiration
  const checkTokenExpiration = useCallback(() => {
    const expirationTime = parseInt(localStorage.getItem('tokenExpiration') || '0');
    if (!expirationTime) return;

    const now = Date.now();
    const timeRemaining = expirationTime - now;

    // If token will expire soon, show alert
    if (timeRemaining > 0 && timeRemaining <= WARNING_THRESHOLD) {
      setTimeLeft(timeRemaining);
      setProgress((timeRemaining / WARNING_THRESHOLD) * 100);
      setOpen(true);
    } else if (timeRemaining <= 0) {
      // Token has expired, logout
      logout();
    } else {
      setOpen(false);
    }
  }, [logout]);

  // Set up interval to check token expiration
  useEffect(() => {
    // Check immediately on mount
    checkTokenExpiration();

    // Set up interval
    const intervalId = setInterval(checkTokenExpiration, CHECK_INTERVAL);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [checkTokenExpiration]);

  // Update progress bar every second when dialog is open
  useEffect(() => {
    if (!open) return;

    const updateTimer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1000;
        setProgress((newTime / WARNING_THRESHOLD) * 100);
        return newTime > 0 ? newTime : 0;
      });
    }, 1000);

    return () => clearInterval(updateTimer);
  }, [open]);

  // Handle refresh token
  const handleRefresh = async () => {
    try {
      // Import authService
      const authService = (await import('../../services/authService')).default;
      
      // Use authService to refresh the token
      await authService.refreshToken();
      setOpen(false);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      aria-labelledby="token-expiration-alert"
      disableEscapeKeyDown
    >
      <DialogTitle id="token-expiration-alert">
        Session Expiring Soon
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Your session will expire in {formatTimeLeft(timeLeft)}. Would you like to continue?
        </DialogContentText>
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            color={progress < 30 ? 'error' : progress < 70 ? 'warning' : 'primary'} 
          />
          <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
            {formatTimeLeft(timeLeft)} remaining
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLogout} color="error">
          Logout
        </Button>
        <Button onClick={handleRefresh} color="primary" variant="contained" autoFocus>
          Stay Logged In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TokenExpirationAlert;