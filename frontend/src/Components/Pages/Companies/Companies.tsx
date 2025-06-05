import React from 'react';
import { Box, Typography } from '@mui/material';
import PermissionGuard from '../../Common/PermissionGuard';
import { usePermissions } from '../../../context/PermissionContext';

const Companies: React.FC = () => {
  const { hasPermission } = usePermissions();

  return (
    <PermissionGuard moduleId="companies" requiredPermission="view">
      <Box>
        <Typography variant="h4">Companies</Typography>
        
        {/* Example of conditional rendering based on permissions */}
        {hasPermission('companies', 'edit') && (
          <Box>
            {/* Add Company Form */}
          </Box>
        )}

        {hasPermission('companies', 'delete') && (
          <Box>
            {/* Delete Company Button */}
          </Box>
        )}

        {/* Company List - visible to all with view permission */}
        <Box>
          {/* Company List Component */}
        </Box>
      </Box>
    </PermissionGuard>
  );
};

export default Companies; 