import React, { useState, useEffect } from "react";
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
  CssBaseline,
  Collapse,
  Menu,
  MenuItem,
  ListItemAvatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
} from "@mui/material";

// Mock navigation hooks
const useNavigate = () => (path) => console.log('Navigate to:', path);
const useLocation = () => ({ pathname: '/dashboard' });
const useMediaQuery = (query) => window.innerWidth < 600; // Simple mobile detection
const useTheme = () => ({ 
  breakpoints: { 
    down: (size) => size === 'sm' ? '@media (max-width:599px)' : '@media (max-width:959px)' 
  },
  zIndex: { drawer: 1200, bottomNavigation: 1100 }
});

// Icons (using simple text representations since we don't have MUI icons)
const HomeIcon = () => <span>🏠</span>;
const MenuIcon = () => <span>☰</span>;
const AgentIcon = () => <span>👤</span>;
const CallingGroupIcon = () => <span>👥</span>;
const ReportsIcon = () => <span>📊</span>;
const DownloadsIcon = () => <span>⬇️</span>;
const ContactListIcon = () => <span>📋</span>;
const SoundsIcon = () => <span>🔊</span>;
const SettingsIcon = () => <span>⚙️</span>;
const ExpandLess = () => <span>▲</span>;
const ExpandMore = () => <span>▼</span>;
const NotificationsIcon = () => <span>🔔</span>;
const RidersIcon = () => <span>🏍️</span>;
const OrdersIcon = () => <span>📦</span>;
const PaymentsIcon = () => <span>💳</span>;
const PersonIcon = () => <span>👤</span>;
const CompaniesIcon = () => <span>🏢</span>;
const StoresIcon = () => <span>🏪</span>;
const AttendanceIcon = () => <span>📅</span>;
const EarningsIcon = () => <span>💰</span>;
const SettlementIcon = () => <span>🏦</span>;
const InvoiceIcon = () => <span>📄</span>;
const SecurityIcon = () => <span>🔒</span>;
const FileUploadIcon = () => <span>⬆️</span>;
const LocalShippingIcon = () => <span>🚛</span>;
const WorkIcon = () => <span>💼</span>;
const SubscriptionsIcon = () => <span>📰</span>;
const LogoutIcon = () => <span>🚪</span>;
const CloseIcon = () => <span>✕</span>;
const DarkModeIcon = () => <span>🌙</span>;
const ContrastIcon = () => <span>🎨</span>;
const CompactIcon = () => <span>📐</span>;

// Theme colors matching the design
const themeColors = {
  primary: "#4F46E5",
  secondary: "#6B7280",
  background: "#FFFFFF",
  cardBg: "#F9FAFB",
  sidebarBg: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  borderColor: "#E5E7EB",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  highlight: "#4F46E5",
  hoverBg: "#F3F4F6",
};

// Drawer width
const drawerWidth = 240;

// Navigation items
const navigationItems = [
  { 
    id: "home", 
    text: "Home", 
    icon: <HomeIcon />, 
    path: "/dashboard",
    hasSubmenu: false
  },
  { 
    id: "riders", 
    text: "Riders", 
    icon: <RidersIcon />, 
    path: "/riders",
    hasSubmenu: true,
    submenu: [
      { id: "attendance", text: "Rider Attendance", icon: <AttendanceIcon />, path: "/rider-attendance" },
      { id: "Orders", text: "Orders", icon: <OrdersIcon />, path: "/orders" },
    ]
  },
  { 
    id: "companies", 
    text: "Companies", 
    icon: <CompaniesIcon />, 
    path: "/companies",
    hasSubmenu: true,
    submenu: [
      { id: "stores", text: "Stores", icon: <StoresIcon />, path: "/stores" },
    ]
  },
  {  
    id: "payments", 
    text: "Payments", 
    icon: <PaymentsIcon />, 
    path: "/payments",
    hasSubmenu: true,
    submenu: [
      { id: "earnings", text: "Earnings", icon: <EarningsIcon />, path: "/earnings" },
      { id: "advance", text: "Advance", icon: <EarningsIcon />, path: "/advance" },
      { id: "settlement", text: "Settlement", icon: <SettlementIcon />, path: "/settlement" },
    ]
  },
  { 
    id: "user", 
    text: "User", 
    icon: <PersonIcon />, 
    path: "/user-page",
    hasSubmenu: false
  },
  { 
    id: "reports", 
    text: "Reports", 
    icon: <ReportsIcon />, 
    path: "/reports",
    hasSubmenu: false
  },
  { 
    id: "downloads", 
    text: "Downloads", 
    icon: <DownloadsIcon />, 
    path: "/downloads",
    hasSubmenu: false
  },
  { 
    id: "invoice", 
    text: "Invoice", 
    icon: <InvoiceIcon />, 
    path: "/invoice",
    hasSubmenu: false
  },
  { 
    id: "sounds", 
    text: "Sounds", 
    icon: <SoundsIcon />, 
    path: "/sounds",
    hasSubmenu: false
  },
  { 
    id: "settings", 
    text: "Settings", 
    icon: <SettingsIcon />, 
    path: "/settings",
    hasSubmenu: true,
    submenu: [
      { id: "role_permissions", text: "Role Permissions", icon: <SecurityIcon />, path: "/role-permissions" },
      { id: "data_import", text: "Data Import", icon: <FileUploadIcon />, path: "/data-import" },
    ]
  },
];

// Mobile bottom navigation items
const bottomNavItems = [
  { label: "Home", icon: <HomeIcon />, path: "/dashboard" },
  { label: "Agent", icon: <AgentIcon />, path: "/agent" },
  { label: "Reports", icon: <ReportsIcon />, path: "/reports" },
  { label: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

export default function SideNav() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [rtl, setRtl] = useState(false);
  const [compact, setCompact] = useState(true);
  const [pendingAlerts] = useState(3);

  // User data
  const userData = {
    name: "Durgarao",
    email: "durgarao@minimals.cc",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Durgarao"
  };

  const getActiveNavIndex = () => {
    for (let i = 0; i < navigationItems.length; i++) {
      const item = navigationItems[i];
      if (location.pathname === item.path || 
          location.pathname.startsWith(item.path + '/')) {
        return i;
      }
      if (item.submenu) {
        for (const subItem of item.submenu) {
          if (location.pathname === subItem.path) {
            return i;
          }
        }
      }
    }
    return 0;
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

  const handleNavigation = (index, item) => {
    if (item.hasSubmenu) {
      setExpandedItems(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
    } else {
      setNavValue(index);
      navigate(item.path);
      setMobileOpen(false);
    }
  };

  const handleSubmenuNavigation = (path, parentIndex) => {
    setNavValue(parentIndex);
    navigate(path);
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActiveSubmenu = (parentItem) => {
    if (!parentItem.submenu) return false;
    return parentItem.submenu.some((subItem) => 
      location.pathname === subItem.path
    );
  };

  const handleProfileClick = () => setProfileOpen(true);
  const handleSettingsClick = () => setSettingsOpen(true);
  const handleCloseProfile = () => setProfileOpen(false);
  const handleCloseSettings = () => setSettingsOpen(false);

  const drawerContent = (
    <Box
      sx={{
        bgcolor: themeColors.sidebarBg,
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
        <Box
          sx={{
            width: 40,
            height: 40,
            bgcolor: themeColors.primary,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
         <LocalShippingIcon />
        </Box>
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
            pt: 1,
            pb: 2,
            px: 1,
          }}
        >
          {navigationItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem
                onClick={() => handleNavigation(index, item)}
                sx={{
                  mb: 0.5,
                  borderRadius: 1,
                  bgcolor: (navValue === index || isActiveSubmenu(item)) 
                    ? themeColors.primary 
                    : "transparent",
                  "&:hover": {
                    bgcolor: (navValue === index || isActiveSubmenu(item))
                      ? themeColors.primary
                      : themeColors.hoverBg,
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
                    py: 1.5,
                    overflow: "hidden",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: (navValue === index || isActiveSubmenu(item)) 
                        ? "white" 
                        : themeColors.textSecondary,
                      minWidth: 40,
                      transition: "color 0.2s ease-in-out",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight: (navValue === index || isActiveSubmenu(item)) ? 500 : 400,
                      color: (navValue === index || isActiveSubmenu(item)) 
                        ? "white" 
                        : themeColors.textSecondary,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    sx={{ 
                      overflow: "hidden",
                      transition: "color 0.2s ease-in-out",
                    }}
                  />
                  {item.hasSubmenu && (
                    <IconButton
                      size="small"
                      sx={{
                        color: (navValue === index || isActiveSubmenu(item)) 
                          ? "white" 
                          : themeColors.textSecondary,
                      }}
                    >
                      {expandedItems[item.id] ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  )}
                </Box>
              </ListItem>
              
              {/* Submenu */}
              {item.hasSubmenu && (
                <Collapse in={expandedItems[item.id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 2 }}>
                    {item.submenu?.map((subItem) => (
                      <ListItem
                        key={subItem.id}
                        onClick={() => handleSubmenuNavigation(subItem.path, index)}
                        sx={{
                          mb: 0.5,
                          borderRadius: 1,
                          bgcolor: location.pathname === subItem.path 
                            ? themeColors.primary 
                            : "transparent",
                          "&:hover": {
                            bgcolor: location.pathname === subItem.path
                              ? themeColors.primary
                              : themeColors.hoverBg,
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
                            py: 1,
                            overflow: "hidden",
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              color: location.pathname === subItem.path 
                                ? "white" 
                                : themeColors.textSecondary,
                              minWidth: 32,
                              transition: "color 0.2s ease-in-out",
                            }}
                          >
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={subItem.text}
                            primaryTypographyProps={{
                              fontSize: "0.85rem",
                              fontWeight: location.pathname === subItem.path ? 500 : 400,
                              color: location.pathname === subItem.path 
                                ? "white" 
                                : themeColors.textSecondary,
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
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Box>
  );

  // Profile Drawer
  const renderProfileDrawer = () => (
    <Drawer
      anchor="right"
      open={profileOpen}
      onClose={handleCloseProfile}
      sx={{
        '& .MuiDrawer-paper': {
          width: 320,
          bgcolor: '#f8f9fa',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={handleCloseProfile} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, pb: 3, textAlign: 'center' }}>
          <Avatar 
            src={userData.avatar} 
            sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 2,
              border: '3px solid #10B981'
            }} 
          />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            {userData.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {userData.email}
          </Typography>
        </Box>

        <List sx={{ flex: 1, px: 2 }}>
          <ListItem sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' } }}>
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' } }}>
            <ListItemIcon><PersonIcon /></ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          <ListItem sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' } }}>
            <ListItemIcon><WorkIcon /></ListItemIcon>
            <ListItemText primary="Projects" />
            <Chip label="3" size="small" color="error" />
          </ListItem>
        </List>

        <Box sx={{ p: 3 }}>
          <Button 
            fullWidth 
            variant="contained"
            startIcon={<LogoutIcon />}
            sx={{ 
              bgcolor: '#ffebee', 
              color: '#d32f2f', 
              borderRadius: 3,
              py: 1.5,
              '&:hover': { bgcolor: '#ffcdd2' },
              boxShadow: 'none'
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Drawer>
  );

  // Settings Drawer
  const renderSettingsDrawer = () => (
    <Drawer
      anchor="right"
      open={settingsOpen}
      onClose={handleCloseSettings}
      sx={{
        '& .MuiDrawer-paper': {
          width: 320,
          bgcolor: '#f8f9fa',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid #e0e0e0',
          bgcolor: '#f8f9fa',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Settings
          </Typography>
          <IconButton size="small" onClick={handleCloseSettings}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6}>
              <Card sx={{ p: 2, bgcolor: darkMode ? '#2B2D31' : 'white', borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <DarkModeIcon />
                  <Switch 
                    checked={darkMode} 
                    onChange={(e) => setDarkMode(e.target.checked)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Mode
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ p: 2, bgcolor: 'white', borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <ContrastIcon />
                  <Switch 
                    checked={contrast} 
                    onChange={(e) => setContrast(e.target.checked)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Contrast
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ p: 2, bgcolor: 'white', borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Switch 
                    checked={rtl} 
                    onChange={(e) => setRtl(e.target.checked)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Right to left
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ p: 2, bgcolor: 'white', borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <CompactIcon />
                  <Switch 
                    checked={compact} 
                    onChange={(e) => setCompact(e.target.checked)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Compact
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Drawer>
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
              border: 0,
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
              border: 0,
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

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          width: { 
            xs: "100%", 
            sm: `calc(100% - ${drawerWidth}px)` 
          },
          ml: { sm: `${drawerWidth}px` },
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* App Bar */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            bgcolor: 'white',
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <Toolbar sx={{ px: 3 }}>
            <IconButton 
              edge="start" 
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: '#666', display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography
              variant="h6"
              sx={{
                color: '#333',
                fontWeight: 600,
                flexGrow: 1,
              }}
            >
              Welcome Durgarao Admin
            </Typography>
            
            <IconButton sx={{ color: '#666', mr: 1 }}>
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
              onClick={handleSettingsClick}
              sx={{ color: '#666', mr: 1 }}
            >
              <SettingsIcon />
            </IconButton>

            <IconButton 
              onClick={handleProfileClick}
              sx={{ p: 0.5 }}
            >
              <Avatar 
                src={userData.avatar}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            bgcolor: themeColors.background,
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              px: { xs: 2, sm: 3 },
              py: 2,
            }}
          >
            {/* Sample Content */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h4" sx={{ mb: 2, color: themeColors.primary }}>
                Dashboard Overview
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Welcome to the Man Power admin dashboard. This is a sample content area where your main application content will be displayed.
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ p: 2, bgcolor: themeColors.primary, color: 'white' }}>
                    <Typography variant="h6">Total Riders</Typography>
                    <Typography variant="h4">245</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ p: 2, bgcolor: themeColors.success, color: 'white' }}>
                    <Typography variant="h6">Active Orders</Typography>
                    <Typography variant="h4">89</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ p: 2, bgcolor: themeColors.warning, color: 'white' }}>
                    <Typography variant="h6">Total Earnings</Typography>
                    <Typography variant="h4">$12,450</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ p: 2, bgcolor: themeColors.error, color: 'white' }}>
                    <Typography variant="h6">Pending</Typography>
                    <Typography variant="h4">23</Typography>
                  </Card>
                </Grid>
              </Grid>
            </Card>
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
            borderTop: `1px solid ${themeColors.borderColor}`,
          }}
          elevation={8}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={(event, newValue) => {
              setBottomNavValue(newValue);
              navigate(bottomNavItems[newValue].path);
            }}
            sx={{
              height: 70,
              bgcolor: themeColors.background,
              "& .MuiBottomNavigationAction-root": {
                color: themeColors.textSecondary,
                "&.Mui-selected": {
                  color: themeColors.primary,
                },
                "& .MuiBottomNavigationAction-label": {
                  fontSize: "0.75rem",
                  fontWeight: 500,
                },
              },
            }}
          >
            {bottomNavItems.map((item, index) => (
              <BottomNavigationAction
                key={index}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}

      {/* Profile Drawer */}
      {renderProfileDrawer()}

      {/* Settings Drawer */}
      {renderSettingsDrawer()}
    </Box>
  );
}