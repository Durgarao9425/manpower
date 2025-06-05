import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../context/PermissionContext';
import { useAuth } from '../Pages/Dashboard/Login/authcontext';
import { Box, CircularProgress } from '@mui/material';

interface PermissionGuardProps {
  children: React.ReactNode;
  moduleId: string;
  requiredPermission: 'view' | 'edit' | 'delete';
  fallbackPath?: string;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  moduleId,
  requiredPermission,
  fallbackPath = '/unauthorized'
}) => {
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const { currentUser, isLoading: authLoading } = useAuth();
  
  const loading = permissionsLoading || authLoading;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Super admin can access everything
  if (currentUser?.is_super_admin) {
    return <>{children}</>;
  }

  // Check if user has the required permission
  if (!hasPermission(moduleId, requiredPermission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default PermissionGuard;