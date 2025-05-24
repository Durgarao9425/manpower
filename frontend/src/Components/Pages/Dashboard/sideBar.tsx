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
  Chip
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  DirectionsCar as VehicleIcon,
  LocalShipping as TruckIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Route as RouteIcon,
  Payments as PaymentsIcon,
  BusinessCenter as PartiesIcon,
  LocalGasStation as FuelIcon,
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  GridView as GridViewIcon,
  ReceiptLong as ExpensesIcon,
  AutoGraph as ReportsIcon,
  CreditCard as FASTagIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Help as HelpIcon,
  BusinessCenter,
  Receipt
} from "@mui/icons-material";
import {
  TwoWheeler as ScooterIcon,
  People as RidersIcon,
  Business as CompaniesIcon,
  Store as StoresIcon,
  Schedule as AttendanceIcon,
  LocalShipping as OrdersIcon,
  AttachMoney as EarningsIcon,
  CreditScore as AdvanceIcon,
  AccountBalance as SettlementIcon,
  Receipt as InvoiceIcon,
} from "@mui/icons-material";

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
  highlight: "#ECF9F1"
};

// Width of the drawer when expanded
const drawerWidth = 260;

// Navigation items with nested options
const navigationItems = [
  { id: "dashboard", text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { id: "riders", text: "Riders", icon: <RidersIcon />, path: "/riders", badge: 3 },
  { id: "companies", text: "Companies", icon: <CompaniesIcon />, path: "/companies" },
  { id: "stores", text: "Stores", icon: <StoresIcon />, path: "/stores" },
  { id: "attendance", text: "Rider Attendance", icon: <AttendanceIcon />, path: "/rider-attendace" },
  { id: "orders", text: "Orders", icon: <OrdersIcon />, path: "/orders", badge: 5 },
  { id: "payments", text: "Payments", icon: <PaymentsIcon />, path: "/payments" },
  { id: "earnings", text: "Earnings", icon: <EarningsIcon />, path: "/earnings" },
  { id: "advance", text: "Advance", icon: <AdvanceIcon />, path: "/advance" },
  { id: "settlement", text: "Settlement", icon: <SettlementIcon />, path: "/settlement" },
  { id: "invoice", text: "Invoice", icon: <InvoiceIcon />, path: "/invoice" },
  { id: "settings", text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

// Mobile bottom navigation items
const bottomNavItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { label: "Riders", icon: <RidersIcon />, path: "/riders" },
  { label: "Orders", icon: <OrdersIcon />, path: "/orders" },
  { label: "Payments", icon: <PaymentsIcon />, path: "/payments" },
];

// SideNav component props interface
interface SideNavProps {
  children: React.ReactNode;
  pendingAlerts?: number;
}

/**
 * Modern Transport Management SideNav component
 */
const SideNav: React.FC<SideNavProps> = ({ children, pendingAlerts = 5 }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [mobileNavValue, setMobileNavValue] = useState(0);

  // Set initial expanded state based on active path
  useEffect(() => {
    const currentPath = location.pathname;

    // Find which section should be expanded based on current path
    let expandedSections = {};
    navigationItems.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(child =>
          currentPath === child.path || (child.path !== "/" && currentPath.startsWith(child.path))
        );
        if (isChildActive) {
          expandedSections[item.id] = true;
        }
      }
    });

    setExpandedItems(expandedSections);

    // Set mobile navigation value
    const bottomNavIndex = bottomNavItems.findIndex(
      item => currentPath === item.path ||
        (item.path !== "/" && currentPath.startsWith(item.path))
    );
    setMobileNavValue(bottomNavIndex >= 0 ? bottomNavIndex : 0);
  }, [location.pathname]);

  // Toggle drawer
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Toggle expand/collapse of menu sections
  const handleToggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Navigate to a route
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  // Check if a route is active
  const isActive = (path: string) => {
    return location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(path));
  };

  // Drawer content
  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        bgcolor: themeColors.cardBg,
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          p: 2,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: drawerOpen ? "space-between" : "center",
        }}
      >
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
          <IconButton onClick={handleDrawerToggle} edge="end" size="small">
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: themeColors.borderColor }} />

      {/* Navigation Menu */}
      <List
        sx={{
          pt: 1,
          px: 1,
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
        {navigationItems.map((item) => (
          <React.Fragment key={item.id}>
            {item.children ? (
              // Menu item with children
              <>
                <ListItem disablePadding sx={{ display: "block", mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleToggleExpand(item.id)}
                    sx={{
                      minHeight: 48,
                      px: 2.5,
                      py: 1,
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: `${themeColors.highlight}`,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: drawerOpen ? 2 : "auto",
                        justifyContent: "center",
                        color: themeColors.primary,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {drawerOpen && (
                      <>
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{
                            fontWeight: 500,
                            color: themeColors.textPrimary,
                          }}
                        />
                        {expandedItems[item.id] ? (
                          <ExpandLessIcon fontSize="small" color="inherit" />
                        ) : (
                          <ExpandMoreIcon fontSize="small" color="inherit" />
                        )}
                      </>
                    )}
                  </ListItemButton>
                </ListItem>

                {/* Submenu Items */}
                <Collapse
                  in={drawerOpen && expandedItems[item.id]}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.children.map((child) => {
                      const isItemActive = isActive(child.path);

                      return (
                        <ListItem key={child.id} disablePadding sx={{ display: "block", mb: 0.5 }}>
                          <ListItemButton
                            onClick={() => handleNavigation(child.path)}
                            sx={{
                              minHeight: 40,
                              ml: 2,
                              px: 2.5,
                              py: 0.75,
                              borderRadius: 2,
                              bgcolor: isItemActive ? themeColors.highlight : "transparent",
                              "&:hover": {
                                bgcolor: isItemActive ? themeColors.highlight : "rgba(12, 114, 66, 0.08)",
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 0,
                                mr: 2,
                                justifyContent: "center",
                                color: isItemActive ? themeColors.primary : themeColors.textSecondary,
                              }}
                            >
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={child.text}
                              primaryTypographyProps={{
                                fontWeight: isItemActive ? 600 : 400,
                                color: isItemActive ? themeColors.primary : themeColors.textSecondary,
                                fontSize: "0.9rem",
                              }}
                            />
                            {child.badge > 0 && (
                              <Badge
                                badgeContent={child.badge}
                                color="error"
                                sx={{ ml: 1 }}
                              />
                            )}
                            {child.isNew && (
                              <Chip
                                label="NEW"
                                size="small"
                                color="success"
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  ml: 1
                                }}
                              />
                            )}
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </>
            ) : (
              // Regular menu item
              <ListItem disablePadding sx={{ display: "block", mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: isActive(item.path) ? themeColors.highlight : "transparent",
                    "&:hover": {
                      bgcolor: isActive(item.path) ? themeColors.highlight : "rgba(12, 114, 66, 0.08)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: drawerOpen ? 2 : "auto",
                      justifyContent: "center",
                      color: isActive(item.path) ? themeColors.primary : themeColors.textSecondary,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      opacity: drawerOpen ? 1 : 0,
                      display: drawerOpen ? "block" : "none",
                    }}
                    primaryTypographyProps={{
                      fontWeight: isActive(item.path) ? 600 : 500,
                      color: isActive(item.path) ? themeColors.primary : themeColors.textPrimary,
                    }}
                  />
                  {item.badge > 0 && drawerOpen && (
                    <Badge
                      badgeContent={item.badge}
                      color="error"
                      sx={{ ml: 1 }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>

      {/* Bottom Section with User & Logout */}
      <Box sx={{ mt: "auto", p: 2 }}>
        <Divider sx={{ borderColor: themeColors.borderColor, mb: 2 }} />

        {drawerOpen ? (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: themeColors.secondary }}>
                <PersonIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: themeColors.textPrimary }}>
                  Admin User
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  admin@transportbook.com
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              sx={{ color: themeColors.textSecondary }}
              onClick={() => navigate('/logout')}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Tooltip title="Profile" placement="right">
            <IconButton
              sx={{
                display: 'flex',
                mx: 'auto',
                color: themeColors.textPrimary
              }}
              onClick={() => navigate('/profile')}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: themeColors.secondary
                }}
              >
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: drawerOpen ? `calc(100% - ${drawerWidth}px)` : `calc(100% - 80px)` },
          ml: { md: drawerOpen ? `${drawerWidth}px` : '80px' },
          bgcolor: themeColors.cardBg,
          borderBottom: `1px solid ${themeColors.borderColor}`,
          transition: "all 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Mobile Menu Toggle */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { md: "none" },
              color: themeColors.textPrimary,
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'start'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: themeColors.background,
                borderRadius: 2,
                px: 2,
                py: 0.5,
                width: '100%',
                maxWidth: 400,
              }}
            >
              <SearchIcon sx={{ color: themeColors.textSecondary, mr: 1 }} />
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

          {/* Right side actions */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="Help">
              <IconButton sx={{ color: themeColors.textSecondary }}>
                <HelpIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton sx={{ color: themeColors.textSecondary }}>
                <Badge badgeContent={pendingAlerts} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Account">
              <IconButton
                edge="end"
                sx={{ ml: 1, color: themeColors.textPrimary }}
                onClick={() => navigate('/profile')}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: themeColors.primary
                  }}
                >
                  <PersonIcon fontSize="small" />
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Drawer - Permanent on desktop, temporary on mobile */}
      <Box
        component="nav"
        sx={{
          width: { md: drawerOpen ? drawerWidth : 80 },
          flexShrink: 0,
          transition: "width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
        }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
                borderRight: `1px solid ${themeColors.borderColor}`,
              },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              width: drawerOpen ? drawerWidth : 80,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: drawerOpen ? drawerWidth : 80,
                boxSizing: "border-box",
                borderRight: `1px solid ${themeColors.borderColor}`,
                overflowX: "hidden",
                transition: "width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
              },
            }}
            open={drawerOpen}
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerOpen ? drawerWidth : 80}px)` },
          p: { xs: 2, sm: 3 },
          mt: { xs: 7, sm: 8 },
          mb: { xs: 7, md: 2 },
          bgcolor: themeColors.background,
          minHeight: "100vh",
          transition: "all 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
        }}
      >
        {children}
      </Box>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1300,
          }}
        >
          <BottomNavigation
            value={mobileNavValue}
            onChange={(event, newValue) => {
              setMobileNavValue(newValue);
              navigate(bottomNavItems[newValue].path);
            }}
            sx={{
              bgcolor: themeColors.cardBg,
              borderTop: `1px solid ${themeColors.borderColor}`,
              height: 60,
            }}
          >
            {bottomNavItems.map((item, index) => (
              <BottomNavigationAction
                key={item.label}
                label={item.label}
                icon={item.icon}
                sx={{
                  color: mobileNavValue === index ? themeColors.primary : themeColors.textSecondary,
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

