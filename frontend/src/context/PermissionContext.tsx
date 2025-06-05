import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { rolePermissionsAPI } from '../services/apiService';

interface Permission {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

interface UserPermissions {
  [moduleId: string]: Permission;
}

interface PermissionContextType {
  permissions: UserPermissions;
  loading: boolean;
  hasPermission: (moduleId: string, action: 'view' | 'edit' | 'delete') => boolean;
  refreshPermissions: () => Promise<void>;
}

// Default modules that should always be initialized
const defaultModules = [
  'dashboard',
  'user',
  'riders',
  'companies',
  'stores',
  'attendance',
  'orders',
  'payments',
  'earnings',
  'advance',
  'settlement',
  'invoice',
  'settings'
];

// Initialize default permissions (all false)
const initializeDefaultPermissions = (): UserPermissions => {
  const defaultPermissions: UserPermissions = {};
  defaultModules.forEach(moduleId => {
    defaultPermissions[moduleId] = {
      view: false,
      edit: false,
      delete: false
    };
  });
  return defaultPermissions;
};

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<UserPermissions>(initializeDefaultPermissions());
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get user ID from localStorage
      const userId = localStorage.getItem('userId');
      const userType = localStorage.getItem('userType');
      
      // If no user ID or user is not admin, set default permissions
      if (!userId || userType !== 'admin') {
        setPermissions(initializeDefaultPermissions());
        return;
      }

      // Check if user is super admin
      const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
      
      // If super admin, grant all permissions
      if (isSuperAdmin) {
        const superAdminPermissions = initializeDefaultPermissions();
        defaultModules.forEach(moduleId => {
          superAdminPermissions[moduleId] = {
            view: true,
            edit: true,
            delete: true
          };
        });
        setPermissions(superAdminPermissions);
        return;
      }

      // Otherwise fetch permissions from API
      const response = await rolePermissionsAPI.getUserPermissions(parseInt(userId));
      if (response.success && response.permissions) {
        // Merge received permissions with default permissions
        const formattedPermissions = initializeDefaultPermissions();
        Object.entries(response.permissions).forEach(([moduleId, permission]) => {
          const typedPermission = permission as Permission;
          if (defaultModules.includes(moduleId)) {
            formattedPermissions[moduleId] = {
              view: Boolean(typedPermission.view),
              edit: Boolean(typedPermission.edit),
              delete: Boolean(typedPermission.delete)
            };
          }
        });
        setPermissions(formattedPermissions);
      } else {
        setPermissions(initializeDefaultPermissions());
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions(initializeDefaultPermissions());
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch permissions on mount and when localStorage changes
  useEffect(() => {
    fetchPermissions();
    
    // Listen for storage events to update permissions when user changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userId' || e.key === 'userType' || e.key === 'isSuperAdmin') {
        fetchPermissions();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchPermissions]);

  const hasPermission = useCallback((moduleId: string, action: 'view' | 'edit' | 'delete'): boolean => {
    // Check if super admin (always has permission)
    const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
    if (isSuperAdmin) {
      return true;
    }
    
    // Strict check for permissions
    if (!permissions || !permissions[moduleId] || typeof permissions[moduleId][action] !== 'boolean') {
      return false;
    }
    return permissions[moduleId][action] === true;
  }, [permissions]);

  const refreshPermissions = useCallback(async () => {
    setLoading(true);
    await fetchPermissions();
  }, [fetchPermissions]);

  return (
    <PermissionContext.Provider value={{ permissions, loading, hasPermission, refreshPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}; 