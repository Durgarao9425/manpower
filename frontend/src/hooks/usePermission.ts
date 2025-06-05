import { useState, useEffect, useCallback } from 'react';
import { rolePermissionsAPI } from '../services/apiService';

// Define permission types
export type PermissionType = 'view' | 'edit' | 'delete';

// Define the return type for the hook
interface UsePermissionReturn {
  checkPermission: (moduleId: string, permissionType: PermissionType) => boolean;
  hasPermission: (moduleId: string, permissionType: PermissionType) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to check user permissions
 * @param userId - The ID of the user to check permissions for
 * @returns Object with permission checking functions and status
 */
export const usePermission = (userId: number): UsePermissionReturn => {
  const [permissions, setPermissions] = useState<{[moduleId: string]: {[key: string]: boolean}}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch permissions for the user
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await rolePermissionsAPI.getUserPermissions(userId);
        
        if (response.success && response.permissions) {
          setPermissions(response.permissions);
        } else {
          setError('Failed to fetch permissions');
        }
      } catch (err) {
        console.error('Error in usePermission hook:', err);
        setError('Error fetching permissions');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId]);

  // Check permission from cached data
  const checkPermission = useCallback((moduleId: string, permissionType: PermissionType): boolean => {
    if (!permissions || !permissions[moduleId]) {
      return false;
    }
    
    return permissions[moduleId][permissionType] === true;
  }, [permissions]);

  // Check permission directly from API (for real-time checks)
  const hasPermission = useCallback(async (moduleId: string, permissionType: PermissionType): Promise<boolean> => {
    if (!userId || !moduleId) {
      return false;
    }
    
    try {
      const response = await rolePermissionsAPI.checkPermission(userId, moduleId);
      
      if (response.success && response.permissions) {
        return response.permissions[permissionType] === true;
      }
      
      return false;
    } catch (err) {
      console.error('Error checking permission:', err);
      return false;
    }
  }, [userId]);

  return {
    checkPermission,
    hasPermission,
    loading,
    error
  };
};

export default usePermission;