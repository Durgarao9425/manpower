// import React, { useState } from "react";

// const ManPowerSideNav = ({ children, pendingAlerts = 8 }) => {
//   const [drawerOpen, setDrawerOpen] = useState(true);
//   const [activeItem, setActiveItem] = useState("dashboard");
//   const [isMobile, setIsMobile] = useState(false);

//   // Simple, clean colors
//   const themeColors = {
//     primary: "#3B82F6", // Simple blue
//     secondary: "#64748B", // Neutral gray
//     background: "#FAFAFA", // Very light gray
//     cardBg: "#FFFFFF",
//     textPrimary: "#374151",
//     textSecondary: "#9CA3AF",
//     borderColor: "#E5E7EB",
//     success: "#10B981",
//     warning: "#F59E0B",
//     error: "#EF4444",
//     highlight: "#F0F9FF", // Very light blue
//   };

//   const drawerWidth = 260;

//   // Navigation items
//   const navigationItems = [
//     { id: "dashboard", text: "Dashboard", icon: "📊", path: "/dashboard", badge: 0 },
//     { id: "riders", text: "Riders", icon: "🛵", path: "/riders", badge: 3 },
//     { id: "companies", text: "Companies", icon: "🏢", path: "/companies", badge: 0 },
//     { id: "stores", text: "Stores", icon: "🏪", path: "/stores", badge: 2 },
//     { id: "rider-attendance", text: "Rider Attendance", icon: "⏰", path: "/rider-attendance", badge: 0 },
//     { id: "orders", text: "Orders", icon: "🛒", path: "/orders", badge: 12 },
//     { id: "payments", text: "Payments", icon: "💳", path: "/payments", badge: 5 },
//     { id: "earning", text: "Earning", icon: "📈", path: "/earning", badge: 0 },
//     { id: "advance", text: "Advance", icon: "🏦", path: "/advance", badge: 1 },
//     { id: "settlement", text: "Settlement", icon: "🧾", path: "/settlement", badge: 0 },
//     { id: "invoice", text: "Invoice", icon: "📄", path: "/invoice", badge: 0 },
//     { id: "settings", text: "Settings", icon: "⚙️", path: "/settings", badge: 0 }
//   ];

//   const bottomNavItems = [
//     { label: "Dashboard", icon: "📊", id: "dashboard" },
//     { label: "Orders", icon: "🛒", id: "orders" },
//     { label: "Riders", icon: "🛵", id: "riders" },
//     { label: "Earnings", icon: "📈", id: "earning" }
//   ];

//   const handleNavigation = (itemId) => {
//     setActiveItem(itemId);
//     if (isMobile) {
//       setDrawerOpen(false);
//     }
//   };

//   const handleDrawerToggle = () => {
//     setDrawerOpen(!drawerOpen);
//   };

//   const isActive = (itemId) => {
//     return activeItem === itemId;
//   };

//   return (
//     <div style={{ display: "flex", minHeight: "100vh", fontFamily: 'system-ui, -apple-system, sans-serif' }}>
//       {/* Top AppBar */}
//       <div
//         style={{
//           position: "fixed",
//           top: 0,
//           left: drawerOpen ? drawerWidth : 70,
//           right: 0,
//           height: 60,
//           backgroundColor: themeColors.cardBg,
//           borderBottom: `1px solid ${themeColors.borderColor}`,
//           transition: "all 0.3s ease",
//           zIndex: 1200,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           padding: '0 20px'
//         }}
//       >
//         <button
//           onClick={handleDrawerToggle}
//           style={{
//             display: isMobile ? 'flex' : 'none',
//             alignItems: 'center',
//             justifyContent: 'center',
//             width: 36,
//             height: 36,
//             borderRadius: 6,
//             border: 'none',
//             backgroundColor: themeColors.background,
//             color: themeColors.textPrimary,
//             cursor: 'pointer',
//             fontSize: '16px'
//           }}
//         >
//           ☰
//         </button>

//         <h2 style={{
//           color: themeColors.textPrimary,
//           fontWeight: 400,
//           margin: 0,
//           fontSize: '1.1rem'
//         }}>
//           Delivery Dashboard
//         </h2>

//         <div style={{
//           display: 'flex',
//           alignItems: 'center',
//           backgroundColor: themeColors.background,
//           borderRadius: 8,
//           padding: '6px 12px',
//           width: '100%',
//           maxWidth: 300,
//           margin: '0 20px',
//           border: `1px solid ${themeColors.borderColor}`,
//         }}>
//           <span style={{ color: themeColors.textSecondary, marginRight: 8 }}>🔍</span>
//           <input
//             placeholder="Search..."
//             style={{
//               border: 'none',
//               outline: 'none',
//               width: '100%',
//               background: 'transparent',
//               color: themeColors.textPrimary,
//               fontSize: '0.9rem',
//             }}
//           />
//         </div>

//         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           <button style={{
//             width: 36,
//             height: 36,
//             borderRadius: 6,
//             border: 'none',
//             backgroundColor: 'transparent',
//             color: themeColors.textSecondary,
//             cursor: 'pointer',
//             fontSize: '16px'
//           }}>
//             ❓
//           </button>

//           <div style={{ position: 'relative' }}>
//             <button style={{
//               width: 36,
//               height: 36,
//               borderRadius: 6,
//               border: 'none',
//               backgroundColor: 'transparent',
//               color: themeColors.textSecondary,
//               cursor: 'pointer',
//               fontSize: '16px'
//             }}>
//               🔔
//             </button>
//             {pendingAlerts > 0 && (
//               <span style={{
//                 position: 'absolute',
//                 top: -2,
//                 right: -2,
//                 backgroundColor: themeColors.error,
//                 color: 'white',
//                 borderRadius: '50%',
//                 width: 18,
//                 height: 18,
//                 fontSize: '0.7rem',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontWeight: 500
//               }}>
//                 {pendingAlerts}
//               </span>
//             )}
//           </div>

//           <div
//             style={{
//               width: 32,
//               height: 32,
//               borderRadius: '50%',
//               backgroundColor: themeColors.primary,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: 'white',
//               fontSize: '14px',
//               cursor: 'pointer'
//             }}
//           >
//             👤
//           </div>
//         </div>
//       </div>

//       {/* Side Drawer */}
//       <div
//         style={{
//           position: "fixed",
//           left: 0,
//           top: 0,
//           bottom: 0,
//           width: drawerOpen ? drawerWidth : 70,
//           backgroundColor: themeColors.cardBg,
//           borderRight: `1px solid ${themeColors.borderColor}`,
//           transition: "width 0.3s ease",
//           zIndex: 1300,
//           display: 'flex',
//           flexDirection: 'column',
//           overflowX: 'hidden'
//         }}
//       >
//         {/* Brand Header */}
//         <div
//           style={{
//             padding: 20,
//             height: 70,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: drawerOpen ? "flex-start" : "center",
//             borderBottom: `1px solid ${themeColors.borderColor}`,
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div
//               style={{
//                 width: 36,
//                 height: 36,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 borderRadius: 6,
//                 backgroundColor: themeColors.primary,
//                 fontSize: '18px'
//               }}
//             >
//               🛵
//             </div>

//             {drawerOpen && (
//               <div>
//                 <h1
//                   style={{
//                     margin: 0,
//                     fontSize: '1.2rem',
//                     fontWeight: 500,
//                     color: themeColors.textPrimary,
//                     lineHeight: 1.2,
//                   }}
//                 >
//                   ManPower
//                 </h1>
//                 <p
//                   style={{
//                     margin: 0,
//                     color: themeColors.textSecondary,
//                     fontSize: '0.7rem',
//                     fontWeight: 400,
//                   }}
//                 >
//                   Delivery System
//                 </p>
//               </div>
//             )}
//           </div>

//           {drawerOpen && (
//             <button
//               onClick={handleDrawerToggle}
//               style={{
//                 marginLeft: 'auto',
//                 width: 28,
//                 height: 28,
//                 borderRadius: 4,
//                 border: 'none',
//                 backgroundColor: 'transparent',
//                 color: themeColors.textSecondary,
//                 cursor: 'pointer',
//                 fontSize: '14px'
//               }}
//             >
//               ◀
//             </button>
//           )}
//         </div>

//         {/* Navigation Menu */}
//         <div
//           style={{
//             padding: '12px',
//             flex: 1,
//             overflowY: "auto",
//           }}
//         >
//           {navigationItems.map((item) => {
//             const itemActive = isActive(item.id);

//             return (
//               <div key={item.id} style={{ marginBottom: 4 }}>
//                 <button
//                   onClick={() => handleNavigation(item.id)}
//                   style={{
//                     width: '100%',
//                     minHeight: 42,
//                     padding: drawerOpen ? '10px 16px' : '10px',
//                     borderRadius: 6,
//                     border: 'none',
//                     backgroundColor: itemActive ? themeColors.highlight : "transparent",
//                     color: itemActive ? themeColors.primary : themeColors.textPrimary,
//                     cursor: 'pointer',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: drawerOpen ? 'flex-start' : 'center',
//                     gap: drawerOpen ? 12 : 0,
//                     transition: 'all 0.2s ease',
//                     fontSize: '0.9rem',
//                     fontWeight: 400,
//                     textAlign: 'left'
//                   }}
//                   onMouseEnter={(e) => {
//                     if (!itemActive) {
//                       e.target.style.backgroundColor = themeColors.background;
//                     }
//                   }}
//                   onMouseLeave={(e) => {
//                     if (!itemActive) {
//                       e.target.style.backgroundColor = 'transparent';
//                     }
//                   }}
//                 >
//                   <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>

//                   {drawerOpen && (
//                     <>
//                       <span style={{ flex: 1 }}>{item.text}</span>
//                       {item.badge > 0 && (
//                         <span
//                           style={{
//                             backgroundColor: themeColors.error,
//                             color: 'white',
//                             borderRadius: '50%',
//                             minWidth: 18,
//                             height: 18,
//                             fontSize: '0.7rem',
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             fontWeight: 400,
//                             padding: '0 4px'
//                           }}
//                         >
//                           {item.badge}
//                         </span>
//                       )}
//                     </>
//                   )}
//                 </button>
//               </div>
//             );
//           })}
//         </div>

//         {/* Bottom User Section */}
//         <div style={{ padding: 12, marginTop: 'auto' }}>
//           <div style={{
//             height: 1,
//             backgroundColor: themeColors.borderColor,
//             marginBottom: 12
//           }} />

//           {drawerOpen ? (
//             <div
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 12,
//                 padding: 12,
//                 borderRadius: 6,
//                 backgroundColor: themeColors.background,
//               }}
//             >
//               <div
//                 style={{
//                   width: 36,
//                   height: 36,
//                   borderRadius: '50%',
//                   backgroundColor: themeColors.primary,
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   color: 'white',
//                   fontSize: '16px'
//                 }}
//               >
//                 👤
//               </div>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div
//                   style={{
//                     fontWeight: 400,
//                     color: themeColors.textPrimary,
//                     fontSize: '0.85rem',
//                     lineHeight: 1.2,
//                     marginBottom: 2
//                   }}
//                 >
//                   Admin User
//                 </div>
//                 <div
//                   style={{
//                     color: themeColors.textSecondary,
//                     fontSize: '0.7rem'
//                   }}
//                 >
//                   Administrator
//                 </div>
//               </div>
//               <button
//                 style={{
//                   width: 28,
//                   height: 28,
//                   borderRadius: 4,
//                   border: 'none',
//                   backgroundColor: 'transparent',
//                   color: themeColors.textSecondary,
//                   cursor: 'pointer',
//                   fontSize: '14px'
//                 }}
//               >
//                 🚪
//               </button>
//             </div>
//           ) : (
//             <div style={{ display: 'flex', justifyContent: 'center' }}>
//               <div
//                 style={{
//                   width: 36,
//                   height: 36,
//                   borderRadius: '50%',
//                   backgroundColor: themeColors.primary,
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   color: 'white',
//                   fontSize: '14px'
//                 }}
//               >
//                 👤
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Main Content */}
//       <div
//         style={{
//           flex: 1,
//           marginLeft: drawerOpen ? drawerWidth : 70,
//           paddingTop: 60,
//           padding: '80px 20px 20px',
//           backgroundColor: themeColors.background,
//           minHeight: "100vh",
//           transition: "all 0.3s ease",
//         }}
//       >
//         {children || (
//           <div style={{ padding: 20 }}>
//             <div style={{
//               backgroundColor: themeColors.cardBg,
//               borderRadius: 8,
//               padding: 24,
//               boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
//               textAlign: 'center'
//             }}>
//               <div style={{ fontSize: '3rem', marginBottom: 12 }}>🛵</div>
//               <h1 style={{
//                 color: themeColors.textPrimary,
//                 marginBottom: 6,
//                 fontSize: '1.5rem',
//                 fontWeight: 500
//               }}>
//                 Welcome to ManPower
//               </h1>
//               <p style={{
//                 color: themeColors.textSecondary,
//                 fontSize: '1rem',
//                 margin: 0,
//                 lineHeight: 1.4
//               }}>
//                 Delivery Management System
//               </p>

//               <div style={{
//                 display: 'grid',
//                 gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
//                 gap: 16,
//                 marginTop: 24
//               }}>
//                 {[
//                   { title: 'Active Orders', value: '156', icon: '🛒', color: themeColors.primary },
//                   { title: 'Online Riders', value: '43', icon: '🛵', color: themeColors.success },
//                   { title: 'Total Earnings', value: '₹45,280', icon: '💰', color: themeColors.secondary },
//                   { title: 'Completed Today', value: '89', icon: '✅', color: themeColors.warning }
//                 ].map((stat, index) => (
//                   <div key={index} style={{
//                     backgroundColor: themeColors.cardBg,
//                     borderRadius: 8,
//                     padding: 16,
//                     border: `1px solid ${themeColors.borderColor}`,
//                   }}>
//                     <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{stat.icon}</div>
//                     <div style={{
//                       fontSize: '1.2rem',
//                       fontWeight: 500,
//                       color: stat.color,
//                       marginBottom: 2
//                     }}>
//                       {stat.value}
//                     </div>
//                     <div style={{
//                       color: themeColors.textSecondary,
//                       fontSize: '0.8rem'
//                     }}>
//                       {stat.title}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Mobile Bottom Navigation */}
//       <div
//         style={{
//           position: "fixed",
//           bottom: 0,
//           left: 0,
//           right: 0,
//           height: 60,
//           backgroundColor: themeColors.cardBg,
//           borderTop: `1px solid ${themeColors.borderColor}`,
//           zIndex: 1300,
//           display: window.innerWidth < 768 ? 'flex' : 'none',
//           alignItems: 'center',
//           justifyContent: 'space-around',
//           padding: '0 12px'
//         }}
//       >
//         {bottomNavItems.map((item, index) => {
//           const isBottomActive = activeItem === item.id;
//           return (
//             <button
//               key={item.id}
//               onClick={() => handleNavigation(item.id)}
//               style={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 gap: 3,
//                 padding: '6px 8px',
//                 border: 'none',
//                 backgroundColor: 'transparent',
//                 color: isBottomActive ? themeColors.primary : themeColors.textSecondary,
//                 cursor: 'pointer',
//                 fontSize: '0.7rem',
//                 fontWeight: 400,
//                 minWidth: 50
//               }}
//             >
//               <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
//               <span>{item.label}</span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default ManPowerSideNav;

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
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
        <Avatar sx={{ bgcolor: themeColors.primary, width: 40, height: 40 }}>
          <FuelIcon />
        </Avatar>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: themeColors.textPrimary,
            whiteSpace: "nowrap",
          }}
        >
          Man Power
        </Typography>
      </Box>
      
      <Divider sx={{ borderColor: themeColors.borderColor, flexShrink: 0 }} />
      
      {/* Navigation List */}
      <List
        sx={{
          pt: 2,
          flex: 1,
          overflow: "auto",
          pr: 1,
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
        }}
      >
        {navigationItems.map((item, index) => (
          <ListItem
            key={item.id}
            disablePadding
            onClick={() => handleNavigation(index)}
            sx={{
              mb: 0.5,
              mx: 0.5,
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
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        maxWidth: "100vw",
        bgcolor: themeColors.background,
        overflow: "hidden",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: themeColors.cardBg,
          borderBottom: `1px solid ${themeColors.borderColor}`,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
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
          flexShrink: { sm: 0 },
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
              // width: "100%",
              borderRight: `1px solid ${themeColors.borderColor}`,
              position: "fixed",
              height: "100vh",
              overflow: "hidden",
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
          width: { xs: "100%", sm: `calc(100% - ${drawerWidth}px)` },
          // ml: { sm: `${drawerWidth}px` },
          mt: { xs: 7, sm: 8 },
          mb: { xs: 8, sm: 0 },
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          minHeight: `calc(100vh - ${isMobile ? 120 : 64}px)`,
          maxWidth: { xs: "100vw", sm: `calc(100vw - ${drawerWidth}px)` },
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            bgcolor: themeColors.background,
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
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
          }}
        >
          <Box sx={{ 
            width: "100%", 
            maxWidth: "100%", 
            overflow: "hidden",
            boxSizing: "border-box",
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