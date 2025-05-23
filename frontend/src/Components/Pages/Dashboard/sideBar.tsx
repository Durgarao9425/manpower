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
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Divider,
  Paper,
  Tooltip,
  Collapse,
  useMediaQuery,
  useTheme,
  CssBaseline,
  BottomNavigation,
  BottomNavigationAction,
  Chip,
  styled
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  TwoWheeler as ScooterIcon,
  People as RidersIcon,
  Business as CompaniesIcon,
  Store as StoresIcon,
  Schedule as AttendanceIcon,
  LocalShipping as OrdersIcon,
  Payments as PaymentsIcon,
  AttachMoney as EarningsIcon,
  CreditScore as AdvanceIcon,
  AccountBalance as SettlementIcon,
  Receipt as InvoiceIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Help as HelpIcon
} from "@mui/icons-material";

// Custom styled components
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

// Theme colors
const themeColors = {
  primary: "#3f51b5",
  secondary: "#2d3748",
  background: "#f8fafc",
  cardBg: "#ffffff",
  textPrimary: "#1a202c",
  textSecondary: "#4a5568",
  borderColor: "#e2e8f0",
  success: "#38a169",
  warning: "#dd6b20",
  error: "#e53e3e",
  highlight: "#ebf4ff"
};

// Width of the drawer
const drawerWidth = 280;
const collapsedWidth = 80;

// Navigation items
const navItems = [
  { id: "dashboard", text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { id: "riders", text: "Riders", icon: <RidersIcon />, path: "/riders", badge: 3 },
  { id: "companies", text: "Companies", icon: <CompaniesIcon />, path: "/companies" },
  { id: "stores", text: "Stores", icon: <StoresIcon />, path: "/stores" },
  { id: "attendance", text: "Rider Attendance", icon: <AttendanceIcon />, path: "/attendance" },
  { id: "orders", text: "Orders", icon: <OrdersIcon />, path: "/orders", badge: 5 },
  { id: "payments", text: "Payments", icon: <PaymentsIcon />, path: "/payments" },
  { id: "earnings", text: "Earnings", icon: <EarningsIcon />, path: "/earnings" },
  { id: "advance", text: "Advance", icon: <AdvanceIcon />, path: "/advance" },
  { id: "settlement", text: "Settlement", icon: <SettlementIcon />, path: "/settlement" },
  { id: "invoice", text: "Invoice", icon: <InvoiceIcon />, path: "/invoice" },
  { id: "settings", text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

// Mobile bottom navigation items
const mobileNavItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { label: "Riders", icon: <RidersIcon />, path: "/riders" },
  { label: "Orders", icon: <OrdersIcon />, path: "/orders" },
  { label: "Payments", icon: <PaymentsIcon />, path: "/payments" },
];

interface SideNavProps {
  children: React.ReactNode;
}

const SideNav: React.FC<SideNavProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [mobileNavValue, setMobileNavValue] = useState(0);

 useEffect(() => {
  const currentPath = location.pathname;
  const index = mobileNavItems.findIndex(
    item => currentPath === item.path || 
           (item.path !== "/" && currentPath.startsWith(item.path))
  );
  setMobileNavValue(index >= 0 ? index : 0);
}, [location.pathname]);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) setDrawerOpen(false);
  };

  const isActive = (path: string) => 
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  // Drawer content
  const drawerContent = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: themeColors.cardBg
    }}>
      {/* Brand header */}
      <Box sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: drawerOpen ? 'space-between' : 'center',
        height: 64,
        borderBottom: `1px solid ${themeColors.borderColor}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ 
            bgcolor: themeColors.primary,
            width: 36,
            height: 36
          }}>
            <ScooterIcon />
          </Avatar>
          {drawerOpen && (
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              color: themeColors.primary,
              whiteSpace: 'nowrap'
            }}>
              Man Power
            </Typography>
          )}
        </Box>
        {!isMobile && (
          <IconButton onClick={toggleDrawer} size="small">
            {/* {drawerOpen ? <ChevronLeftIcon /> : <ChevronLeftIcon sx={{ transform: 'rotate(180deg)' }} />} */}
          </IconButton>
        )}
      </Box>

      {/* Navigation items */}
      <List sx={{ 
        flexGrow: 1,
        overflowY: 'auto',
        p: 1,
        '& .MuiListItemButton-root': {
          borderRadius: 2,
          mb: 0.5
        }
      }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  bgcolor: active ? themeColors.highlight : 'transparent',
                  '&:hover': {
                    bgcolor: active ? themeColors.highlight : 'rgba(63, 81, 181, 0.08)'
                  }
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 0,
                  mr: drawerOpen ? 2 : 'auto',
                  color: active ? themeColors.primary : themeColors.textSecondary
                }}>
                  {item.badge ? (
                    <StyledBadge badgeContent={item.badge} color="error">
                      {item.icon}
                    </StyledBadge>
                  ) : item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: active ? 600 : 400,
                    color: active ? themeColors.primary : themeColors.textPrimary,
                    fontSize: '0.9rem'
                  }}
                  sx={{ opacity: drawerOpen ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User section */}
      <Box sx={{ 
        p: 2,
        borderTop: `1px solid ${themeColors.borderColor}`
      }}>
        {drawerOpen ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ 
              width: 40, 
              height: 40,
              bgcolor: themeColors.secondary
            }}>
              <PersonIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Admin User
              </Typography>
              <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                admin@manpower.com
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => navigate('/logout')}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Tooltip title="Profile" placement="right">
            <IconButton
              sx={{ display: 'flex', mx: 'auto' }}
              onClick={() => navigate('/profile')}
            >
              <Avatar sx={{ 
                width: 36, 
                height: 36,
                bgcolor: themeColors.secondary
              }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerOpen ? drawerWidth : collapsedWidth}px)` },
          ml: { md: `${drawerOpen ? drawerWidth : collapsedWidth}px` },
          bgcolor: themeColors.cardBg,
          color: themeColors.textPrimary,
          boxShadow: 'none',
          borderBottom: `1px solid ${themeColors.borderColor}`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Mobile menu button */}
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Search bar - desktop */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              bgcolor: themeColors.background,
              borderRadius: 2,
              px: 2,
              py: 0.5,
              width: 400,
              maxWidth: '100%'
            }}>
              <SearchIcon sx={{ 
                color: themeColors.textSecondary,
                mr: 1,
                fontSize: 20
              }} />
              <input
                placeholder="Search..."
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  background: 'transparent',
                  color: themeColors.textPrimary,
                  fontSize: '0.9rem',
                }}
              />
            </Box>
          </Box>

          {/* Right side icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Help">
              <IconButton>
                <HelpIcon sx={{ color: themeColors.textSecondary }} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifications">
              <IconButton>
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon sx={{ color: themeColors.textSecondary }} />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Profile">
              <IconButton onClick={() => navigate('/profile')}>
                <Avatar sx={{ 
                  width: 36, 
                  height: 36,
                  bgcolor: themeColors.primary
                }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{
          width: { md: drawerOpen ? drawerWidth : collapsedWidth },
          flexShrink: { md: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={toggleDrawer}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                borderRight: `1px solid ${themeColors.borderColor}`,
              },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open={drawerOpen}
            sx={{
              '& .MuiDrawer-paper': {
                width: drawerOpen ? drawerWidth : collapsedWidth,
                boxSizing: 'border-box',
                borderRight: `1px solid ${themeColors.borderColor}`,
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerOpen ? drawerWidth : collapsedWidth}px)` },
          p: { xs: 2, sm: 3 },
          mt: 8,
          mb: { xs: 7, md: 0 },
          bgcolor: themeColors.background,
          minHeight: '100vh',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            borderTop: `1px solid ${themeColors.borderColor}`
          }}
        >
          <BottomNavigation
            showLabels
            value={mobileNavValue}
            onChange={(event, newValue) => {
              setMobileNavValue(newValue);
              navigate(mobileNavItems[newValue].path);
            }}
            sx={{
              bgcolor: themeColors.cardBg,
              height: 56
            }}
          >
            {mobileNavItems.map((item, index) => (
              <BottomNavigationAction
                key={item.label}
                label={item.label}
                icon={item.icon}
                sx={{
                  color: mobileNavValue === index ? themeColors.primary : themeColors.textSecondary,
                  '& .MuiBottomNavigationAction-label': {
                    fontSize: '0.75rem',
                    mt: 0.5
                  }
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