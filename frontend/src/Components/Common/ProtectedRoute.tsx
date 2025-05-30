import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../Pages/Dashboard/Login/authcontext';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectPath?: string;
}

/**
 * Protected route component that checks authentication and role permissions
 * 
 * @param allowedRoles - Array of roles allowed to access the route
 * @param redirectPath - Path to redirect to if not authenticated or authorized
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = [],
  redirectPath = '/login',
}) => {
  const { isAuthenticated, isLoading, userRole, checkAuth } = useAuth();
  const location = useLocation();

  // Check authentication on route change
  useEffect(() => {
    checkAuth();
  }, [location.pathname, checkAuth]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Verifying authentication...
        </Typography>
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has required role
  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and authorized, render the protected route
  return <Outlet />;
};

export default ProtectedRoute;