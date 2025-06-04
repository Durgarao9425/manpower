import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../Pages/Dashboard/Login/authcontext';
import Loader from './Loaders';

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
  redirectPath = '/login'
}) => {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader message="Verifying authentication..." size="medium" fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;