import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { SideNav } from './sideBar';

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const getPendingAlerts = () => {
    return 1;
  };

  return (
    <SideNav pendingAlerts={getPendingAlerts()}>
      <Outlet />
    </SideNav>
  );
};

export default Layout;