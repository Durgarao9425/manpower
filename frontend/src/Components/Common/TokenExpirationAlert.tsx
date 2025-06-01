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
} from '@mui/material'; // Ensure Material UI is correctly installed and imported
import { useAuth } from '../Pages/Dashboard/Login/authcontext'; // Adjust path as per your project structure
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

// Warning threshold in milliseconds (e.g., 5 minutes before JWT expires)
// This is for the JWT's own lifetime warning.
const JWT_EXPIRY_WARNING_THRESHOLD = (parseInt(import.meta.env.VITE_TOKEN_EXPIRY_WARNING_MINS) || 5) * 60 * 1000;

// Interval to check token status (e.g., every 30 seconds)
const CHECK_INTERVAL = 30 * 1000;

const TokenExpirationAlert: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [timeLeftForJwt, setTimeLeftForJwt] = useState<number>(JWT_EXPIRY_WARNING_THRESHOLD);
  const [jwtProgress, setJwtProgress] = useState<number>(100);

  // Get authentication status and functions from AuthContext
  const { logout, isAuthenticated, isLoading: isAuthLoading, currentUser } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate

  // Helper to format time remaining
  const formatTimeLeft = (milliseconds: number): string => {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
  };

  // Function to handle token refresh
  const handleRefreshToken = async () => {
    try {
      // Dynamically import authService to avoid circular dependencies if any
      const authServiceModule = await import('../../services/authService'); // Adjust path
      const authService = authServiceModule.default;
      await authService.refreshToken();
      setIsDialogOpen(false); // Close dialog on successful refresh
      // The checkTokenStatus interval will pick up the new expiration time
    } catch (error) {
      console.error('TokenExpirationAlert: Failed to refresh token:', error);
      // If refresh fails, logout should be triggered.
      // authService.refreshToken() itself calls clearSession on failure.
      // The AuthContext will then detect unauthenticated state.
      await logout(); // Ensure logout is called to update context and navigate
      setIsDialogOpen(false); // Close dialog
    }
  };

  // Function to handle manual logout from dialog
  const handleLogout = async () => {
    setIsDialogOpen(false);
    await logout(); // AuthContext handles navigation
  };

  // Callback to check the JWT's status
  const checkTokenStatus = useCallback(() => {
    // Do not run checks if auth is loading, user is not authenticated, or no user object
    if (isAuthLoading || !isAuthenticated || !currentUser) {
      if (isDialogOpen) {
        setIsDialogOpen(false); // Close dialog if open and auth state is not valid
      }
      return;
    }

    const tokenExpirationStr = localStorage.getItem('tokenExpiration');
    if (!tokenExpirationStr) {
      // This might happen if tokens are cleared but context hasn't updated yet.
      // Or if tokenExpiration was never set.
      if (isDialogOpen) setIsDialogOpen(false);
      // console.warn('TokenExpirationAlert: tokenExpiration not found in localStorage while authenticated.');
      return;
    }

    const expirationTime = parseInt(tokenExpirationStr, 10);
    if (isNaN(expirationTime) || expirationTime === 0) {
      if (isDialogOpen) setIsDialogOpen(false);
      console.warn('TokenExpirationAlert: Invalid tokenExpiration value in localStorage.');
      return;
    }

    const now = Date.now();
    const remainingTime = expirationTime - now;

    if (remainingTime <= 0) {
      // JWT has actually expired. AuthContext should handle this via its checkAuth or interceptors.
      // If this component detects it first, it means something might be out of sync.
      console.warn('TokenExpirationAlert: JWT expired according to localStorage. Auth system should handle this.');
      // It's possible an inactivity logout has already occurred or is about to.
      // If still authenticated here, it's an issue. Forcing dialog close.
      if (isDialogOpen) setIsDialogOpen(false);
      // Consider if a forced logout from here is needed if isAuthenticated is still true.
      // However, `authService.getAccessToken` and interceptors should ideally catch this.
    } else if (remainingTime <= JWT_EXPIRY_WARNING_THRESHOLD) {
      // JWT is about to expire, show the warning dialog
      setTimeLeftForJwt(remainingTime);
      setJwtProgress((remainingTime / JWT_EXPIRY_WARNING_THRESHOLD) * 100);
      if (!isDialogOpen) {
        setIsDialogOpen(true); // Open the dialog
      }
    } else {
      // JWT is valid and not expiring soon
      if (isDialogOpen) {
        setIsDialogOpen(false); // Close dialog if it was open for JWT warning
      }
    }
  }, [isAuthLoading, isAuthenticated, currentUser, isDialogOpen, JWT_EXPIRY_WARNING_THRESHOLD]);


  // Effect to periodically check JWT status
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      const intervalId = setInterval(checkTokenStatus, CHECK_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [isAuthLoading, isAuthenticated]);


  // Effect to update the countdown timer when the JWT warning dialog is open
  useEffect(() => {
    if (!isDialogOpen || !isAuthenticated) return; // Only run if dialog is open and user is authenticated

    const countdownTimer = setInterval(() => {
      setTimeLeftForJwt((prevTime) => {
        const newTime = prevTime - 1000;
        if (newTime <= 0) {
          clearInterval(countdownTimer);
          // Time in dialog ran out. If token wasn't refreshed, user should be logged out.
          // The checkTokenStatus should eventually detect actual expiry.
          // Or inactivity logout from AuthContext might have occurred.
          // For safety, if dialog countdown reaches zero, close it.
          // The main checkTokenStatus or inactivity logout will handle actual session end.
          setIsDialogOpen(false);
          console.log("TokenExpirationAlert: JWT warning countdown reached zero.");
          return 0;
        }
        setJwtProgress(Math.max(0, (newTime / JWT_EXPIRY_WARNING_THRESHOLD) * 100));
        return newTime;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [isDialogOpen, isAuthenticated, JWT_EXPIRY_WARNING_THRESHOLD]);


  // If auth is loading, or user is not authenticated, don't render the dialog.
  // The useEffects should handle closing the dialog if auth state changes.
  if (!isDialogOpen || !isAuthenticated || isAuthLoading) {
    return null;
  }

  // Determine dialog content based on JWT warning
  // This dialog is now specifically for JWT expiration warning.
  // Session expiry due to inactivity is handled by AuthContext (results in logout, isAuthenticated=false).
  const dialogTitle = 'Session Expiring Soon';
  const dialogText = `Your login session will expire in ${formatTimeLeft(timeLeftForJwt)}. Would you like to extend it?`;

  // Handle session expired scenario
  const handleSessionExpired = () => {
    if (isDialogOpen) return; // Prevent multiple alerts

    setIsDialogOpen(true);
    alert('Your session has expired due to inactivity. Please log in again.');
    setIsDialogOpen(false);
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      handleSessionExpired();
    }
  }, [isAuthenticated]);

  return (
    <Dialog
      open={isDialogOpen}
      onClose={(_, reason) => {
        // Prevent closing on backdrop click or escape key while warning is active
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return;
        }
        setIsDialogOpen(false); // Allow closing if user clicks X (though usually no X on modal)
      }}
      aria-labelledby="token-expiration-alert-title"
      disableEscapeKeyDown // Prevent closing with Escape key
    >
      <DialogTitle id="token-expiration-alert-title">{dialogTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText>{dialogText}</DialogContentText>
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={jwtProgress}
            color={jwtProgress < 30 ? 'error' : jwtProgress < 70 ? 'warning' : 'primary'}
          />
          <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
            {formatTimeLeft(timeLeftForJwt)} remaining
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLogout} color="primary">
          Logout
        </Button>
        <Button onClick={handleRefreshToken} color="primary" variant="contained" autoFocus>
          Stay Logged In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TokenExpirationAlert;
