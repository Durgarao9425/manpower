import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from './authcontext';

/**
 * Logout component that handles user logout
 * Automatically logs out the user and redirects to login page
 */
const Logout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Redirect to login page regardless of logout success/failure
        navigate('/login', { replace: true });
      }
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <CircularProgress size={60} thickness={4} sx={{ color: 'white' }} />
      <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
        Logging out...
      </Typography>
    </Box>
  );
};

export default Logout;
