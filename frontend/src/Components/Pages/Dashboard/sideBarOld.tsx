import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Divider,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  useTheme,
  CssBaseline,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as RidersIcon,
  LocalShipping as OrdersIcon,
  Payments as PaymentsIcon,
  Person as PersonIcon,
  LocalGasStation as FuelIcon,
  Notifications as NotificationsIcon,
  BusinessCenter as CompaniesIcon,
  Store as StoresIcon,
  Schedule as AttendanceIcon,
  AttachMoney as EarningsIcon,
  CreditScore as AdvanceIcon,
  AccountBalance as SettlementIcon,
  Receipt as InvoiceIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import SecurityIcon from "@mui/icons-material/Security";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ElectricScooterIcon from '@mui/icons-material/ElectricScooter';
import BikeScooterIcon from '@mui/icons-material/BikeScooter';


// Theme colors
const themeColors = {
  primary: "#0C7242",
  secondary: "#1E293B",
  background: "#F1F5F9",
  cardBg: "#FFFFFF",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  borderColor: "#E2E8F0",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  highlight: "#ECF9F1",
};

// Drawer width
const drawerWidth = 260;

// Navigation items
const navigationItems = [
  { id: "dashboard", text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { id: "user", text: "User", icon: <PersonIcon />, path: "/user-page" },
  { id: "companies", text: "Companies", icon: <CompaniesIcon />, path: "/companies" },
  { id: "stores", text: "Stores", icon: <StoresIcon />, path: "/stores" },
  { id: "riders", text: "Riders", icon: <RidersIcon />, path: "/riders", badge: 3 },
  { id: "orders", text: "Orders", icon: <OrdersIcon />, path: "/orders", badge: 5 },
  { id: "attendance", text: "Rider Attendance", icon: <AttendanceIcon />, path: "/rider-attendance" },
  { id: "role_permissions", text: "Role Permissions", icon: <SecurityIcon />, path: "/role-permissions" },
  { id: "data_import", text: "Data Import", icon: <FileUploadIcon />, path: "/data-import" },
  { id: "payments", text: "Payments", icon: <PaymentsIcon />, path: "/payments" },
  { id: "earnings", text: "Earnings", icon: <EarningsIcon />, path: "/earnings" },
  { id: "advance", text: "Advance", icon: <AdvanceIcon />, path: "/advance" },
  { id: "settlement", text: "Settlement", icon: <SettlementIcon />, path: "/settlement" },
  { id: "invoice", text: "Invoice", icon: <InvoiceIcon />, path: "/invoice" },
  { id: "settings", text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

// Mobile bottom navigation items
const bottomNavItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { label: "Riders", icon: <RidersIcon />, path: "/riders" },
  { label: "Orders", icon: <OrdersIcon />, path: "/orders" },
  { label: "Payments", icon: <PaymentsIcon />, path: "/payments" },
];

interface SideNavProps {
  children: React.ReactNode;
  pendingAlerts?: number;
}

const SideNav: React.FC<SideNavProps> = ({ children, pendingAlerts = 0 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getActiveNavIndex = () => {
    const activeItem = navigationItems.findIndex(
      (item) =>
        location.pathname === item.path ||
        (item.path !== "/" && location.pathname.startsWith(item.path))
    );
    return activeItem >= 0 ? activeItem : 0;
  };

  const [navValue, setNavValue] = useState(getActiveNavIndex());
  const [bottomNavValue, setBottomNavValue] = useState(0);

  useEffect(() => {
    const activeIndex = getActiveNavIndex();
    setNavValue(activeIndex);

    const currentPath = location.pathname;
    const bottomNavIndex = bottomNavItems.findIndex(
      item => currentPath === item.path ||
        (item.path !== '/' && currentPath.startsWith(item.path))
    );
    setBottomNavValue(bottomNavIndex >= 0 ? bottomNavIndex : 0);
  }, [location.pathname]);

  const handleNavigation = (index: number) => {
    setNavValue(index);
    navigate(navigationItems[index].path);
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box
      sx={{
        bgcolor: themeColors.cardBg,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        width: drawerWidth,
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: "flex", 
        alignItems: "center", 
        gap: 2, 
        flexShrink: 0,
        minHeight: 72,
        borderBottom: `1px solid ${themeColors.borderColor}`,
      }}>
        <Avatar sx={{ bgcolor: themeColors.primary, width: 40, height: 40 }}>
            <BikeScooterIcon />

        </Avatar>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: themeColors.textPrimary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Man Power
        </Typography>
      </Box>
      
      {/* Navigation List */}
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <List
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            pt: 2,
            pb: 2,
            px: 1,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: themeColors.borderColor,
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: themeColors.textSecondary,
            },
          }}
        >
          {navigationItems.map((item, index) => (
            <ListItem
              key={item.id}
              disablePadding
              onClick={() => handleNavigation(index)}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                bgcolor: navValue === index ? `${themeColors.primary}15` : "transparent",
                "&:hover": {
                  bgcolor: navValue === index
                    ? `${themeColors.primary}15`
                    : `${themeColors.primary}08`,
                },
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  px: 2,
                  py: 1.2,
                  overflow: "hidden",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: navValue === index ? themeColors.primary : themeColors.textSecondary,
                    minWidth: 40,
                    transition: "color 0.2s ease-in-out",
                  }}
                >
                  {item.badge ? (
                    <Badge 
                      badgeContent={item.badge} 
                      color="error"
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.75rem",
                          height: "18px",
                          minWidth: "18px",
                        }
                      }}
                    >
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    fontWeight: navValue === index ? 600 : 400,
                    color: navValue === index ? themeColors.primary : themeColors.textPrimary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  sx={{ 
                    overflow: "hidden",
                    transition: "color 0.2s ease-in-out",
                  }}
                />
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        bgcolor: themeColors.background,
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { 
            xs: "100%", 
            sm: `calc(100% - ${drawerWidth}px)` 
          },
          left: { 
            xs: 0, 
            sm: drawerWidth 
          },
          bgcolor: themeColors.cardBg,
          borderBottom: `1px solid ${themeColors.borderColor}`,
          zIndex: theme.zIndex.drawer + 1,
          height: { xs: 56, sm: 64 },
        }}
      >
        <Toolbar sx={{ 
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 2, sm: 3 },
        }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: "none" },
              color: themeColors.textPrimary,
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <IconButton 
            sx={{ 
              color: themeColors.textPrimary,
              mr: 1,
            }}
          >
            <Badge 
              badgeContent={pendingAlerts} 
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.75rem",
                  height: "18px",
                  minWidth: "18px",
                }
              }}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton
            sx={{ color: themeColors.textPrimary }}
            onClick={() => navigate('/userprofile')}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: themeColors.primary }}>
              <PersonIcon fontSize="small" />
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ 
          width: { sm: drawerWidth }, 
          flexShrink: 0,
          zIndex: theme.zIndex.drawer,
        }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: `1px solid ${themeColors.borderColor}`,
              overflow: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: `1px solid ${themeColors.borderColor}`,
              position: "fixed",
              height: "100vh",
              overflow: "hidden",
              top: 0,
              left: 0,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          width: { 
            xs: "100%", 
            sm: `calc(100% - ${drawerWidth}px)` 
          },
        
          paddingTop: { xs: 7, sm: 8 },
          paddingBottom: { xs: 8, sm: 0 },
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          bgcolor: themeColors.background,
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            width: "100%",
            px: { xs: 2, sm: 3 },
            py: 2,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: themeColors.borderColor,
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: themeColors.textSecondary,
            },
          }}
        >
          <Box sx={{ 
            width: "100%",
            maxWidth: "100%",
            minWidth: 0, // Prevents flex item from overflowing
          }}>
            {children}
          </Box>
        </Box>
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.bottomNavigation,
            elevation: 8,
            borderTop: `1px solid ${themeColors.borderColor}`,
          }}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={(event, newValue) => {
              setBottomNavValue(newValue);
              navigate(bottomNavItems[newValue].path);
              setMobileOpen(false);
            }}
            sx={{
              bgcolor: themeColors.cardBg,
              height: 64,
              "& .MuiBottomNavigationAction-root": {
                minWidth: "auto",
                padding: "6px 12px 8px",
                "& .MuiBottomNavigationAction-label": {
                  fontSize: "0.75rem",
                  marginTop: "4px",
                },
              },
            }}
          >
            {bottomNavItems.map((item, index) => (
              <BottomNavigationAction
                key={item.label}
                label={item.label}
                icon={item.icon}
                sx={{
                  color: bottomNavValue === index ? themeColors.primary : themeColors.textSecondary,
                  "&.Mui-selected": {
                    color: themeColors.primary,
                  },
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default SideNav;
// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   Box,
//   Drawer,
//   AppBar,
//   Toolbar,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   Typography,
//   IconButton,
//   Avatar,
//   Badge,
//   Divider,
//   Paper,
//   BottomNavigation,
//   BottomNavigationAction,
//   useMediaQuery,
//   useTheme,
//   CssBaseline,
// } from "@mui/material";
// import {
//   Menu as MenuIcon,
//   Dashboard as DashboardIcon,
//   People as RidersIcon,
//   LocalShipping as OrdersIcon,
//   Payments as PaymentsIcon,
//   Person as PersonIcon,
//   LocalGasStation as FuelIcon,
//   Notifications as NotificationsIcon,
//   BusinessCenter as CompaniesIcon,
//   Store as StoresIcon,
//   Schedule as AttendanceIcon,
//   AttachMoney as EarningsIcon,
//   CreditScore as AdvanceIcon,
//   AccountBalance as SettlementIcon,
//   Receipt as InvoiceIcon,
//   Settings as SettingsIcon,
// } from "@mui/icons-material";
// import SecurityIcon from "@mui/icons-material/Security";
// import FileUploadIcon from "@mui/icons-material/FileUpload";
// import ElectricScooterIcon from '@mui/icons-material/ElectricScooter';
// import BikeScooterIcon from '@mui/icons-material/BikeScooter';


// // Theme colors
// const themeColors = {
//   primary: "#0C7242",
//   secondary: "#1E293B",
//   background: "#F1F5F9",
//   cardBg: "#FFFFFF",
//   textPrimary: "#1E293B",
//   textSecondary: "#64748B",
//   borderColor: "#E2E8F0",
//   success: "#10B981",
//   warning: "#F59E0B",
//   error: "#EF4444",
//   highlight: "#ECF9F1",
// };

// // Drawer width
// const drawerWidth = 260;

// // Navigation items
// const navigationItems = [
//   { id: "dashboard", text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
//   { id: "user", text: "User", icon: <PersonIcon />, path: "/user-page" },
//   { id: "companies", text: "Companies", icon: <CompaniesIcon />, path: "/companies" },
//   { id: "stores", text: "Stores", icon: <StoresIcon />, path: "/stores" },
//   { id: "riders", text: "Riders", icon: <RidersIcon />, path: "/riders", badge: 3 },
//   { id: "orders", text: "Orders", icon: <OrdersIcon />, path: "/orders", badge: 5 },
//   { id: "attendance", text: "Rider Attendance", icon: <AttendanceIcon />, path: "/rider-attendance" },
//   { id: "role_permissions", text: "Role Permissions", icon: <SecurityIcon />, path: "/role-permissions" },
//   { id: "data_import", text: "Data Import", icon: <FileUploadIcon />, path: "/data-import" },
//   { id: "payments", text: "Payments", icon: <PaymentsIcon />, path: "/payments" },
//   { id: "earnings", text: "Earnings", icon: <EarningsIcon />, path: "/earnings" },
//   { id: "advance", text: "Advance", icon: <AdvanceIcon />, path: "/advance" },
//   { id: "settlement", text: "Settlement", icon: <SettlementIcon />, path: "/settlement" },
//   { id: "invoice", text: "Invoice", icon: <InvoiceIcon />, path: "/invoice" },
//   { id: "settings", text: "Settings", icon: <SettingsIcon />, path: "/settings" },
// ];

// // Mobile bottom navigation items
// const bottomNavItems = [
//   { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
//   { label: "Riders", icon: <RidersIcon />, path: "/riders" },
//   { label: "Orders", icon: <OrdersIcon />, path: "/orders" },
//   { label: "Payments", icon: <PaymentsIcon />, path: "/payments" },
// ];

// interface SideNavProps {
//   children: React.ReactNode;
//   pendingAlerts?: number;
// }

// const SideNav: React.FC<SideNavProps> = ({ children, pendingAlerts = 0 }) => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [mobileOpen, setMobileOpen] = useState(false);

//   const getActiveNavIndex = () => {
//     const activeItem = navigationItems.findIndex(
//       (item) =>
//         location.pathname === item.path ||
//         (item.path !== "/" && location.pathname.startsWith(item.path))
//     );
//     return activeItem >= 0 ? activeItem : 0;
//   };

//   const [navValue, setNavValue] = useState(getActiveNavIndex());
//   const [bottomNavValue, setBottomNavValue] = useState(0);

//   useEffect(() => {
//     const activeIndex = getActiveNavIndex();
//     setNavValue(activeIndex);

//     const currentPath = location.pathname;
//     const bottomNavIndex = bottomNavItems.findIndex(
//       item => currentPath === item.path ||
//         (item.path !== '/' && currentPath.startsWith(item.path))
//     );
//     setBottomNavValue(bottomNavIndex >= 0 ? bottomNavIndex : 0);
//   }, [location.pathname]);

//   const handleNavigation = (index: number) => {
//     setNavValue(index);
//     navigate(navigationItems[index].path);
//     setMobileOpen(false);
//   };

//   const handleDrawerToggle = () => {
//     setMobileOpen(!mobileOpen);
//   };

//   const drawerContent = (
//     <Box
//       sx={{
//         bgcolor: themeColors.cardBg,
//         height: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         overflow: "hidden",
//         width: drawerWidth,
//       }}
//     >
//       {/* Header */}
//       <Box sx={{ 
//         p: 2, 
//         display: "flex", 
//         alignItems: "center", 
//         gap: 2, 
//         flexShrink: 0,
//         minHeight: 72,
//         borderBottom: `1px solid ${themeColors.borderColor}`,
//       }}>
//         <Avatar sx={{ bgcolor: themeColors.primary, width: 40, height: 40 }}>
//             <BikeScooterIcon />

//         </Avatar>
//         <Typography
//           variant="h6"
//           sx={{
//             fontWeight: 600,
//             color: themeColors.textPrimary,
//             whiteSpace: "nowrap",
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//           }}
//         >
//           Man Power
//         </Typography>
//       </Box>

//       {/* Navigation List */}
//       <Box
//         sx={{
//           flex: 1,
//           overflow: "hidden",
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         <List
//           sx={{
//             flex: 1,
//             overflowY: "auto",
//             overflowX: "hidden",
//             pt: 2,
//             pb: 2,
//             px: 1,
//             "&::-webkit-scrollbar": {
//               width: "6px",
//             },
//             "&::-webkit-scrollbar-track": {
//               backgroundColor: "transparent",
//             },
//             "&::-webkit-scrollbar-thumb": {
//               backgroundColor: themeColors.borderColor,
//               borderRadius: "3px",
//             },
//             "&::-webkit-scrollbar-thumb:hover": {
//               backgroundColor: themeColors.textSecondary,
//             },
//           }}
//         >
//           {navigationItems.map((item, index) => (
//             <ListItem
//               key={item.id}
//               disablePadding
//               onClick={() => handleNavigation(index)}
//               sx={{
//                 mb: 0.5,
//                 borderRadius: 2,
//                 bgcolor: navValue === index ? `${themeColors.primary}15` : "transparent",
//                 "&:hover": {
//                   bgcolor: navValue === index
//                     ? `${themeColors.primary}15`
//                     : `${themeColors.primary}08`,
//                 },
//                 cursor: "pointer",
//                 transition: "all 0.2s ease-in-out",
//               }}
//             >
//               <Box
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                   width: "100%",
//                   px: 2,
//                   py: 1.2,
//                   overflow: "hidden",
//                 }}
//               >
//                 <ListItemIcon
//                   sx={{
//                     color: navValue === index ? themeColors.primary : themeColors.textSecondary,
//                     minWidth: 40,
//                     transition: "color 0.2s ease-in-out",
//                   }}
//                 >
//                   {item.badge ? (
//                     <Badge 
//                       badgeContent={item.badge} 
//                       color="error"
//                       sx={{
//                         "& .MuiBadge-badge": {
//                           fontSize: "0.75rem",
//                           height: "18px",
//                           minWidth: "18px",
//                         }
//                       }}
//                     >
//                       {item.icon}
//                     </Badge>
//                   ) : (
//                     item.icon
//                   )}
//                 </ListItemIcon>
//                 <ListItemText
//                   primary={item.text}
//                   primaryTypographyProps={{
//                     fontSize: "0.9rem",
//                     fontWeight: navValue === index ? 600 : 400,
//                     color: navValue === index ? themeColors.primary : themeColors.textPrimary,
//                     whiteSpace: "nowrap",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                   }}
//                   sx={{ 
//                     overflow: "hidden",
//                     transition: "color 0.2s ease-in-out",
//                   }}
//                 />
//               </Box>
//             </ListItem>
//           ))}
//         </List>
//       </Box>
//     </Box>
//   );

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         height: "100vh",
//         width: "100vw",
//         bgcolor: themeColors.background,
//         overflow: "hidden",
//         position: "fixed",
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//       }}
//     >
//       <CssBaseline />

//       {/* App Bar */}
//       <AppBar
//         position="fixed"
//         elevation={0}
//         sx={{
//           width: { 
//             xs: "100%", 
//             sm: `calc(100% - ${drawerWidth}px)` 
//           },
//           left: { 
//             xs: 0, 
//             sm: drawerWidth 
//           },
//           bgcolor: themeColors.cardBg,
//           borderBottom: `1px solid ${themeColors.borderColor}`,
//           zIndex: theme.zIndex.drawer + 1,
//           height: { xs: 56, sm: 64 },
//         }}
//       >
//         <Toolbar sx={{ 
//           minHeight: { xs: 56, sm: 64 },
//           px: { xs: 2, sm: 3 },
//         }}>
//           <IconButton
//             color="inherit"
//             edge="start"
//             onClick={handleDrawerToggle}
//             sx={{
//               mr: 2,
//               display: { sm: "none" },
//               color: themeColors.textPrimary,
//             }}
//           >
//             <MenuIcon />
//           </IconButton>

//           <Box sx={{ flexGrow: 1 }} />

//           <IconButton 
//             sx={{ 
//               color: themeColors.textPrimary,
//               mr: 1,
//             }}
//           >
//             <Badge 
//               badgeContent={pendingAlerts} 
//               color="error"
//               sx={{
//                 "& .MuiBadge-badge": {
//                   fontSize: "0.75rem",
//                   height: "18px",
//                   minWidth: "18px",
//                 }
//               }}
//             >
//               <NotificationsIcon />
//             </Badge>
//           </IconButton>

//           <IconButton
//             sx={{ color: themeColors.textPrimary }}
//             onClick={() => navigate('/userprofile')}
//           >
//             <Avatar sx={{ width: 32, height: 32, bgcolor: themeColors.primary }}>
//               <PersonIcon fontSize="small" />
//             </Avatar>
//           </IconButton>
//         </Toolbar>
//       </AppBar>

//       {/* Sidebar Drawer */}
//       <Box
//         component="nav"
//         sx={{ 
//           width: { sm: drawerWidth }, 
//           flexShrink: 0,
//           zIndex: theme.zIndex.drawer,
//         }}
//       >
//         {/* Mobile Drawer */}
//         <Drawer
//           variant="temporary"
//           open={mobileOpen}
//           onClose={handleDrawerToggle}
//           ModalProps={{ keepMounted: true }}
//           sx={{
//             display: { xs: "block", sm: "none" },
//             "& .MuiDrawer-paper": {
//               boxSizing: "border-box",
//               width: drawerWidth,
//               borderRight: `1px solid ${themeColors.borderColor}`,
//               overflow: "hidden",
//             },
//           }}
//         >
//           {drawerContent}
//         </Drawer>

//         {/* Desktop Drawer */}
//         <Drawer
//           variant="permanent"
//           sx={{
//             display: { xs: "none", sm: "block" },
//             "& .MuiDrawer-paper": {
//               boxSizing: "border-box",
//               width: drawerWidth,
//               borderRight: `1px solid ${themeColors.borderColor}`,
//               position: "fixed",
//               height: "100vh",
//               overflow: "hidden",
//               top: 0,
//               left: 0,
//             },
//           }}
//           open
//         >
//           {drawerContent}
//         </Drawer>
//       </Box>

//       {/* Main Content */}
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           height: "100vh",
//           width: { 
//             xs: "100%", 
//             sm: `calc(100% - ${drawerWidth}px)` 
//           },

//           paddingTop: { xs: 7, sm: 8 },
//           paddingBottom: { xs: 8, sm: 0 },
//           overflow: "hidden",
//           display: "flex",
//           flexDirection: "column",
//           position: "relative",
//           bgcolor: themeColors.background,
//         }}
//       >
//         <Box
//           sx={{
//             flex: 1,
//             overflowY: "auto",
//             overflowX: "hidden",
//             width: "100%",
//             px: { xs: 2, sm: 3 },
//             py: 2,
//             "&::-webkit-scrollbar": {
//               width: "8px",
//             },
//             "&::-webkit-scrollbar-track": {
//               backgroundColor: "transparent",
//             },
//             "&::-webkit-scrollbar-thumb": {
//               backgroundColor: themeColors.borderColor,
//               borderRadius: "4px",
//             },
//             "&::-webkit-scrollbar-thumb:hover": {
//               backgroundColor: themeColors.textSecondary,
//             },
//           }}
//         >
//           <Box sx={{ 
//             width: "100%",
//             maxWidth: "100%",
//             minWidth: 0, // Prevents flex item from overflowing
//           }}>
//             {children}
//           </Box>
//         </Box>
//       </Box>

//       {/* Mobile Bottom Navigation */}
//       {isMobile && (
//         <Paper
//           sx={{
//             position: "fixed",
//             bottom: 0,
//             left: 0,
//             right: 0,
//             zIndex: theme.zIndex.bottomNavigation,
//             elevation: 8,
//             borderTop: `1px solid ${themeColors.borderColor}`,
//           }}
//         >
//           <BottomNavigation
//             value={bottomNavValue}
//             onChange={(event, newValue) => {
//               setBottomNavValue(newValue);
//               navigate(bottomNavItems[newValue].path);
//               setMobileOpen(false);
//             }}
//             sx={{
//               bgcolor: themeColors.cardBg,
//               height: 64,
//               "& .MuiBottomNavigationAction-root": {
//                 minWidth: "auto",
//                 padding: "6px 12px 8px",
//                 "& .MuiBottomNavigationAction-label": {
//                   fontSize: "0.75rem",
//                   marginTop: "4px",
//                 },
//               },
//             }}
//           >
//             {bottomNavItems.map((item, index) => (
//               <BottomNavigationAction
//                 key={item.label}
//                 label={item.label}
//                 icon={item.icon}
//                 sx={{
//                   color: bottomNavValue === index ? themeColors.primary : themeColors.textSecondary,
//                   "&.Mui-selected": {
//                     color: themeColors.primary,
//                   },
//                 }}
//               />
//             ))}
//           </BottomNavigation>
//         </Paper>
//       )}
//     </Box>
//   );
// };

// export default SideNav;