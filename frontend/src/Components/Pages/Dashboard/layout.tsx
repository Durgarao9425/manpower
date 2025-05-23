import React from 'react';
import { Outlet } from 'react-router-dom';
import SideNav from './sideBar';
import ManPowerSideNav from './sideBar';

const Layout: React.FC = () => {
  // Get pending alerts from the appropriate source based on the route
  const getPendingAlerts = () => {
    // This is a placeholder - you would likely get this from a context or prop
    return 2;
  };

  return (
    <SideNav>
      <Outlet />
    </SideNav>
  );
};

export default Layout; 