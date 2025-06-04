import React, { useState, useEffect, createContext, useContext } from "react";
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
  Collapse,
  Menu,
  ListItemAvatar,
  Button,
  Switch,
  Card,
  Grid,
  Chip,
  Tooltip,
  Slider,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Person as AgentIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  LocalShipping as LocalShippingIcon,
  Work as WorkIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  DarkMode as DarkModeIcon,
  Contrast as ContrastIcon,
  ViewCompact as CompactIcon,
} from "@mui/icons-material";
import durgarao from "../../../Images/durgarao.jpeg";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BusinessIcon from "@mui/icons-material/Business";
import StoreIcon from "@mui/icons-material/Store";
import PaymentIcon from "@mui/icons-material/Payment";
import PaidIcon from "@mui/icons-material/Paid";
import SavingsIcon from "@mui/icons-material/Savings";
import GavelIcon from "@mui/icons-material/Gavel";
import BarChartIcon from "@mui/icons-material/BarChart";
import DownloadIcon from "@mui/icons-material/Download";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReplayIcon from "@mui/icons-material/Replay";
import useUserData from "../../Common/loginInformation";

// Theme context
const ThemeContext = createContext({
  primaryColor: "#0F52BA",
  fontFamily: "Inter",
  fontSize: 15,
  updateTheme: (color: string) => {},
  updateFont: (font: string) => {},
  updateFontSize: (size: number) => {},
  isRiderDashboard: false,
  setIsRiderDashboard: (value: boolean) => {},
});

// Helper function to safely access localStorage
const getLocalStorage = (key: string, defaultValue: string) => {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.warn("Error accessing localStorage:", error);
    return defaultValue;
  }
};

// Theme colors - initialize with localStorage value if available
const themeColors = {
  primary: getLocalStorage("mpm-theme-color", "#0F52BA"), // Solid version of your main brand color
  primaryGradient:
    "linear-gradient(135deg, #0F52BA, #008080, #00A86B, #50C878, #8A2BE2, #4169E1, #37FDFC)",

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

// Custom hook to use theme context
const useAppTheme = () => useContext(ThemeContext);

const presets = [
  { color: "#10B981", name: "Green" },
  { color: "#3B82F6", name: "Blue" },
  { color: "#8B5CF6", name: "Purple" },
  { color: "#60A5FA", name: "Light Blue" },
  { color: "#F59E0B", name: "Orange" },
  { color: "#EF4444", name: "Red" },
];

// Drawer width
const drawerWidth = 240;

// Navigation items

const navigationItems = [
  {
    id: "home",
    text: "Home",
    icon: <DashboardIcon />,
    path: "/dashboard",
    hasSubmenu: false,
  },
  {
    id: "riders",
    text: "Riders",
    icon: <PeopleIcon />,
    hasSubmenu: true,
    submenu: [
      {
        id: "riders-list",
        text: "Riders",
        icon: <PeopleIcon />,
        path: "/riders",
      },
      {
        id: "rider-attendance",
        text: "Rider Attendance",
        icon: <AccessTimeIcon />,
        path: "/rider-attendance",
      },
    ],
  },

  {
    id: "orders",
    text: "Orders",
    icon: <LocalShippingIcon />,
    hasSubmenu: true,
    submenu: [
      {
        id: "dailyorder",
        text: "Daily Orders",
        icon: <PeopleIcon />,
        path: "/orders",
      },
      {
        id: "weekly-orders",
        text: "Weekly orders",
        icon: <AccessTimeIcon />,
        path: "/upload-orders",
      },
    ],
  },
  {
    id: "companies",
    text: "Companies",
    icon: <BusinessIcon />,
    hasSubmenu: true,
    submenu: [
      {
        id: "companies-list",
        text: "Companies",
        icon: <BusinessIcon />,
        path: "/companies",
      },
      { id: "stores", text: "Stores", icon: <StoreIcon />, path: "/stores" },
    ],
  },
  {
    id: "payments",
    text: "Payments",
    icon: <PaymentIcon />,
    hasSubmenu: true,
    submenu: [
      {
        id: "payments-list",
        text: "Payments",
        icon: <PaidIcon />,
        path: "/payments",
      },
      {
        id: "earnings",
        text: "Earnings",
        icon: <SavingsIcon />,
        path: "/earnings",
      },
      {
        id: "advance",
        text: "Advance",
        icon: <PaymentIcon />,
        path: "/rider-advance",
      },
      {
        id: "settlement",
        text: "Settlement",
        icon: <GavelIcon />,
        path: "/settlement",
      },
    ],
  },
  {
    id: "user",
    text: "User",
    icon: <PersonIcon />,
    path: "/user-page",
    hasSubmenu: false,
  },
  {
    id: "reports",
    text: "Reports",
    icon: <BarChartIcon />,
    path: "/reports",
    hasSubmenu: false,
  },
  {
    id: "custom-fields",
    text: "Custom Fields",
    icon: <WorkIcon />,
    path: "/custom-fields",
    hasSubmenu: false,
  },
  {
    id: "slider-page",
    text: "Slider Page",
    icon: <DownloadIcon />,
    path: "/slider-page",
    hasSubmenu: false,
  },
  {
    id: "invoice",
    text: "Invoice",
    icon: <ReceiptIcon />,
    path: "/invoice",
    hasSubmenu: false,
  },
  {
    id: "settings",
    text: "Settings",
    icon: <SettingsIcon />,
    hasSubmenu: true,
    submenu: [
      {
        id: "role-permissions",
        text: "Role Permissions",
        icon: <AdminPanelSettingsIcon />,
        path: "/role-permissions",
      },
      {
        id: "data-import",
        text: "Data Import",
        icon: <UploadFileIcon />,
        path: "/data-import",
      },
    ],
  },
];

const fonts = [
  { label: "Public Sans", value: "Public Sans" },
  { label: "DM Sans", value: "DM Sans" },
  { label: "Inter", value: "Inter" },
  { label: "Nunito Sans", value: "Nunito Sans" },
];
// Mobile bottom navigation items
const bottomNavItems = [
  { label: "Home", icon: <HomeIcon />, path: "/dashboard" },
  { label: "Agent", icon: <AgentIcon />, path: "/agent" },
  { label: "Reports", icon: <ReportsIcon />, path: "/reports" },
  { label: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

interface AdminSidebarProps {
  children: React.ReactNode;
  pendingAlerts?: number;
}

// Export the theme hook for use in other components
export const useThemeSettings = () => useContext(ThemeContext);

export const SideNav: React.FC<AdminSidebarProps> = ({
  children,
  pendingAlerts = 0,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<{
    [key: string]: boolean;
  }>({});

  // Theme state with localStorage persistence
  const [primaryColor, setPrimaryColor] = useState(() => {
    return getLocalStorage("mpm-theme-color", "#0F52BA");
  });

  const [selectedFont, setSelectedFont] = useState(() => {
    return getLocalStorage("mpm-theme-font", "Inter");
  });

  const [fontSize, setFontSize] = useState(() => {
    const savedSize = getLocalStorage("mpm-theme-fontSize", "15");
    return parseInt(savedSize);
  });

  const [isRiderDashboard, setIsRiderDashboard] = useState(false);

  // Check if current path is rider dashboard to prevent theme changes
  useEffect(() => {
    const isRiderPath = location.pathname.includes("/rider-dashboard");
    setIsRiderDashboard(isRiderPath);
  }, [location.pathname]);

  // Update themeColors.primary when primaryColor changes
  useEffect(() => {
    if (!isRiderDashboard) {
      themeColors.primary = primaryColor;
    }
  }, [primaryColor, isRiderDashboard]);

  // Create custom MUI theme based on settings
  const customTheme = createTheme({
    typography: {
      fontFamily: isRiderDashboard
        ? "Roboto, sans-serif"
        : `${selectedFont}, sans-serif`,
      fontSize: isRiderDashboard ? 14 : fontSize,
    },
    palette: {
      primary: {
        main: isRiderDashboard ? "#0F52BA" : primaryColor,
      },
    },
  });

  // AppBar related states
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("main");

  // Settings state
  const [darkMode, setDarkMode] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [rtl, setRtl] = useState(false);
  const [compact, setCompact] = useState(true);

  const [profileOpen, setProfileOpen] = useState(false);
  const handleCloseProfile = () => setProfileOpen(false);
  const handleProfileClick = () => setProfileOpen(true);

  // Helper function to safely set localStorage
  const setLocalStorage = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn("Error setting localStorage:", error);
    }
  };

  // Theme context value with localStorage persistence
  const themeContextValue = {
    primaryColor,
    fontFamily: selectedFont,
    fontSize,
    updateTheme: (color: string) => {
      if (!isRiderDashboard) {
        setPrimaryColor(color);
        // Update themeColors.primary for consistency
        themeColors.primary = color;
        // Save to localStorage
        setLocalStorage("mpm-theme-color", color);
      }
    },
    updateFont: (font: string) => {
      if (!isRiderDashboard) {
        setSelectedFont(font);
        // Save to localStorage
        setLocalStorage("mpm-theme-font", font);
      }
    },
    updateFontSize: (size: number) => {
      if (!isRiderDashboard) {
        setFontSize(size);
        // Save to localStorage
        setLocalStorage("mpm-theme-fontSize", size.toString());
      }
    },
    isRiderDashboard,
    setIsRiderDashboard,
  };

  // User data
  // const userData = {
  //   name: "Durgarao",
  //   email: "durgarao@minimals.cc",
  //   avatar: durgarao
  // };
  const { userData, loading, error } = useUserData();

  const handleLogout = () => {
    // Optional: clear user data here
    navigate("/login");
  };

  // Notifications data
  const notifications = [
    {
      id: 1,
      user: "Deja Brady",
      action: "sent you a friend request",
      time: "5 minutes",
      category: "Communication",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deja",
      type: "friend_request",
      unread: true,
    },
    {
      id: 2,
      user: "Jayvon Hull",
      action: "mentioned you in Minimal UI",
      time: "a day",
      category: "Project UI",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jayvon",
      description:
        "@Durgarao feedback by asking questions or just leave a note of appreciation.",
      type: "mention",
      unread: true,
    },
    {
      id: 3,
      user: "Lainey Davidson",
      action: "added file to File manager",
      time: "2 days",
      category: "File manager",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lainey",
      type: "file",
      unread: true,
    },
  ];

  const getActiveNavIndex = () => {
    for (let i = 0; i < navigationItems.length; i++) {
      const item = navigationItems[i];
      if (
        location.pathname === item.path ||
        location.pathname.startsWith(item.path + "/")
      ) {
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
      (item) =>
        currentPath === item.path ||
        (item.path !== "/" && currentPath.startsWith(item.path))
    );
    setBottomNavValue(bottomNavIndex >= 0 ? bottomNavIndex : 0);
  }, [location.pathname]);

  const handleNavigation = (index: number, item: any) => {
    if (item.hasSubmenu) {
      setExpandedItems((prev) => ({
        ...prev,
        [item.id]: !prev[item.id],
      }));
    } else {
      setNavValue(index);
      navigate(item.path);
      setMobileOpen(false);
    }
  };

  const handleSubmenuNavigation = (path: string, parentIndex: number) => {
    setNavValue(parentIndex);
    navigate(path);
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActiveSubmenu = (parentItem: any) => {
    if (!parentItem.submenu) return false;
    return parentItem.submenu.some(
      (subItem: any) => location.pathname === subItem.path
    );
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleSettingsClick = () => {
    setSettingsOpen(true);
  };

  const handleCloseMenus = () => {
    setNotificationAnchor(null);
    setProfileAnchor(null);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
    setSettingsTab("main");
  };

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
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexShrink: 0,
          minHeight: 72,
          borderBottom: `1px solid ${themeColors.borderColor}`,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            bgcolor: primaryColor,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LocalShippingIcon sx={{ color: "white", fontSize: 20 }} />
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
            <React.Fragment key={item.id}>
              <ListItem
                disablePadding
                onClick={() => handleNavigation(index, item)}
                sx={{
                  mb: 0.5,
                  borderRadius: 1,
                  bgcolor:
                    navValue === index || isActiveSubmenu(item)
                      ? primaryColor
                      : "transparent",
                  "&:hover": {
                    bgcolor:
                      navValue === index || isActiveSubmenu(item)
                        ? primaryColor
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
                      color:
                        navValue === index || isActiveSubmenu(item)
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
                      fontWeight:
                        navValue === index || isActiveSubmenu(item) ? 500 : 400,
                      color:
                        navValue === index || isActiveSubmenu(item)
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
                        color:
                          navValue === index || isActiveSubmenu(item)
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
                <Collapse
                  in={expandedItems[item.id]}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding sx={{ pl: 2 }}>
                    {item.submenu?.map((subItem) => (
                      <ListItem
                        key={subItem.id}
                        disablePadding
                        onClick={() =>
                          handleSubmenuNavigation(subItem.path, index)
                        }
                        sx={{
                          mb: 0.5,
                          borderRadius: 1,
                          bgcolor:
                            location.pathname === subItem.path
                              ? themeColors.primary
                              : "transparent",
                          "&:hover": {
                            bgcolor:
                              location.pathname === subItem.path
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
                              color:
                                location.pathname === subItem.path
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
                              fontWeight:
                                location.pathname === subItem.path ? 500 : 400,
                              color:
                                location.pathname === subItem.path
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

  const renderNotificationMenu = () => (
    <Menu
      anchorEl={notificationAnchor}
      open={Boolean(notificationAnchor)}
      onClose={handleCloseMenus}
      PaperProps={{
        sx: {
          width: 360,
          maxHeight: 400,
          mt: 1,
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6">Notifications</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip label="All 22" size="small" color="primary" />
          <Chip label="Unread 12" size="small" variant="outlined" />
        </Box>
      </Box>
      <Divider />
      <List sx={{ p: 0 }}>
        {notifications.map((notification) => (
          <ListItem key={notification.id} sx={{ py: 2 }}>
            <ListItemAvatar>
              <Avatar
                src={notification.avatar}
                sx={{ width: 40, height: 40 }}
              />
            </ListItemAvatar>
            <Box sx={{ flex: 1, ml: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {notification.user} {notification.action}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notification.time} • {notification.category}
              </Typography>
              {notification.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {notification.description}
                </Typography>
              )}
              {notification.type === "friend_request" && (
                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ bgcolor: "#2B2D31", color: "white" }}
                  >
                    Accept
                  </Button>
                  <Button variant="outlined" size="small">
                    Decline
                  </Button>
                </Box>
              )}
            </Box>
            {notification.unread && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: "#00B8D4",
                  borderRadius: "50%",
                  ml: 1,
                }}
              />
            )}
          </ListItem>
        ))}
      </List>
    </Menu>
  );

  const renderProfileDrawer = () => (
    <Drawer
      anchor="right"
      open={profileOpen}
      onClose={handleCloseProfile}
      sx={{
        "& .MuiDrawer-paper": {
          width: 320,
          bgcolor: "#f8f9fa",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.1)",
        },
      }}
    >
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <IconButton onClick={handleCloseProfile} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, pb: 3, textAlign: "center" }}>
          <Avatar
            src={durgarao}
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 2,
              border: "3px solid #10B981",
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            {userData?.user?.username}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {userData?.user?.email}
          </Typography>
        </Box>

        <List sx={{ flex: 1, px: 2 }}>
          <ListItem
            sx={{
              borderRadius: 2,
              mb: 1,
              "&:hover": { bgcolor: "rgba(16, 185, 129, 0.1)" },
            }}
          >
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem
            sx={{
              borderRadius: 2,
              mb: 1,
              "&:hover": { bgcolor: "rgba(16, 185, 129, 0.1)" },
            }}
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          <ListItem
            sx={{
              borderRadius: 2,
              mb: 1,
              "&:hover": { bgcolor: "rgba(16, 185, 129, 0.1)" },
            }}
          >
            <ListItemIcon>
              <WorkIcon />
            </ListItemIcon>
            <ListItemText primary="Projects" />
            <Chip label="3" size="small" color="error" />
          </ListItem>
        </List>

        <Box sx={{ p: 3 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              bgcolor: "#ffebee",
              color: "#d32f2f",
              borderRadius: 3,
              py: 1.5,
              "&:hover": { bgcolor: "#ffcdd2" },
              boxShadow: "none",
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Drawer>
  );

  const renderSettingsDrawer = () => (
    <Drawer
      anchor="right"
      open={settingsOpen}
      onClose={handleCloseSettings}
      sx={{
        "& .MuiDrawer-paper": {
          width: 390,
          bgcolor: "#f8f9fa",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.1)",
          boxSizing: "border-box", // important
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        },
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e0e0e0",
            bgcolor: "#f8f9fa",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Settings
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton size="small" sx={{ color: "#666" }}>
              <span>⚙️</span>
            </IconButton>
            <IconButton size="small" sx={{ color: "#666" }}>
              <span>🔄</span>
            </IconButton>
            <IconButton size="small" onClick={handleCloseSettings}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 3, boxSizing: "border-box" }}>
          {isRiderDashboard && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: "#FEF3C7",
                borderRadius: 2,
                border: "1px solid #F59E0B",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#92400E", fontWeight: 500 }}
              >
                Theme settings are disabled for Rider Dashboard as requested.
              </Typography>
            </Box>
          )}

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>
              Presets
            </Typography>

            <Grid container spacing={1}>
              {presets.map((preset, index) => (
                <Grid item xs={4} key={index}>
                  <Box
                    onClick={() => {
                      if (!isRiderDashboard) {
                        setPrimaryColor(preset.color);
                        themeColors.primary = preset.color;
                        // Save to localStorage
                        setLocalStorage("mpm-theme-color", preset.color);
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      p: 1,
                      bgcolor: "background.paper",
                      border:
                        primaryColor === preset.color
                          ? "2px solid #10B981"
                          : "1px solid #e0e0e0",
                      textAlign: "center",
                      cursor: isRiderDashboard ? "not-allowed" : "pointer",
                      transition: "0.2s",
                      opacity: isRiderDashboard ? 0.6 : 1,
                      "&:hover": {
                        boxShadow: isRiderDashboard ? "none" : 2,
                        transform: isRiderDashboard
                          ? "none"
                          : "translateY(-2px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 24,
                        bgcolor: preset.color,
                        borderRadius: 1,
                        mx: "auto",
                      }}
                    />
                    <Typography variant="caption" mt={1} display="block">
                      {preset.name}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              width: "100%", // Changed from fixed 320px to 100%
              background: "linear-gradient(145deg, #f0f4f8, #ffffff)",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxSizing: "border-box",
              opacity: isRiderDashboard ? 0.6 : 1,
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  bgcolor: "#000",
                  color: "#fff",
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  fontSize: "0.75rem",
                }}
              >
                Font
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <ReplayIcon fontSize="small" />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Family
              </Typography>
            </Box>

            <Grid container spacing={2} mb={2}>
              {fonts.map((font) => (
                <Grid item xs={6} key={font.value}>
                  <Paper
                    onClick={() => {
                      if (!isRiderDashboard) {
                        setSelectedFont(font.value);
                        // Save to localStorage
                        setLocalStorage("mpm-theme-font", font.value);
                      }
                    }}
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      borderRadius: 3,
                      cursor: isRiderDashboard ? "not-allowed" : "pointer",
                      border:
                        selectedFont === font.value
                          ? "2px solid #10B981"
                          : "1px solid #ccc",
                      backgroundColor:
                        selectedFont === font.value ? "#f0fdf4" : "transparent",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: font.value,
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: selectedFont === font.value ? "#10B981" : "#aaa",
                      }}
                    >
                      Aa
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: selectedFont === font.value ? "#000" : "#aaa",
                        fontWeight: 600,
                      }}
                    >
                      {font.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <ReplayIcon fontSize="small" />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Size
              </Typography>
            </Box>

            <Box px={1}>
              <Tooltip title={`${fontSize}px`} arrow placement="top">
                <Slider
                  value={fontSize}
                  onChange={(e, newValue) => {
                    if (!isRiderDashboard) {
                      const size = newValue as number;
                      setFontSize(size);
                      // Save to localStorage
                      setLocalStorage("mpm-theme-fontSize", size.toString());
                    }
                  }}
                  min={12}
                  max={20}
                  step={1}
                  valueLabelDisplay="off"
                  disabled={isRiderDashboard}
                  sx={{
                    color: "#10B981",
                    height: 8,
                    "& .MuiSlider-thumb": {
                      width: 20,
                      height: 20,
                    },
                    "& .MuiSlider-track": {
                      border: "none",
                    },
                  }}
                />
              </Tooltip>
            </Box>
          </Paper>

          {/* Mode Settings */}
          {/* <Grid container spacing={2} sx={{ mb: 4 }}>
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
          </Grid> */}

          {/* Font Section */}
          {/* <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{
                bgcolor: '#343a40',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 2,
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'inline-block',
                mb: 2
              }}
            >
              Font
            </Typography>

            <Typography variant="body2" sx={{ color: '#666', mb: 2, fontWeight: 500 }}>
              Family
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card
                  sx={{
                    p: 3,
                    bgcolor: 'white',
                    borderRadius: 3,
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    '&:hover': {
                      border: '2px solid #10B981'
                    }
                  }}
                >
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography
                      sx={{
                        fontSize: '2rem',
                        fontWeight: 600,
                        color: '#10B981',
                        fontFamily: 'sans-serif'
                      }}
                    >
                      Aa
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#333'
                    }}
                  >
                    Public Sans
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  sx={{
                    p: 3,
                    bgcolor: 'white',
                    borderRadius: 3,
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    '&:hover': {
                      border: '2px solid #6B7280'
                    }
                  }}
                >
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography
                      sx={{
                        fontSize: '2rem',
                        fontWeight: 400,
                        color: '#6B7280',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      Aa
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#6B7280'
                    }}
                  >
                    Inter
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box> */}
        </Box>
      </Box>
    </Drawer>
  );
  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeProvider theme={customTheme}>
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
            fontFamily: isRiderDashboard
              ? "Roboto, sans-serif"
              : `${selectedFont}, sans-serif`,
            fontSize: isRiderDashboard ? 14 : fontSize,
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
                sm: `calc(100% - ${drawerWidth}px)`,
              },
              // ml: { sm: `${drawerWidth}px` },
              height: "100vh",
              overflow: "hidden",
            }}
          >
            {/* App Bar */}
            <AppBar
              position="static"
              elevation={0}
              sx={{
                bgcolor: "white",
                borderBottom: "1px solid #e0e0e0",
                zIndex: theme.zIndex.appBar,
              }}
            >
              <Toolbar sx={{ px: 3 }}>
                <IconButton
                  edge="start"
                  sx={{ mr: 2, color: "#666", display: { sm: "none" } }}
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>

                <Typography
                  variant="h6"
                  sx={{
                    color: "#333",
                    fontWeight: 600,
                    flexGrow: 1,
                  }}
                >
                  Welcome Durgarao Admin
                </Typography>

                <IconButton
                  onClick={handleNotificationClick}
                  sx={{ color: "#666", mr: 1 }}
                >
                  <Badge
                    badgeContent={pendingAlerts}
                    color="error"
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: "0.75rem",
                        height: "18px",
                        minWidth: "18px",
                      },
                    }}
                  >
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                <IconButton
                  onClick={handleSettingsClick}
                  sx={{
                    color: "#666",
                    mr: 1,
                    animation: "spin 10s linear infinite", // ⏳ Slow spin (10 seconds per rotation)
                    "@keyframes spin": {
                      from: { transform: "rotate(0deg)" },
                      to: { transform: "rotate(360deg)" },
                    },
                  }}
                >
                  <SettingsIcon />
                </IconButton>

                <IconButton onClick={handleProfileClick} sx={{ p: 0.5 }}>
                  <Avatar src={durgarao} sx={{ width: 32, height: 32 }} />
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
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#E5E7EB",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "#D1D5DB",
                  },
                }}
              >
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
                borderTop: `1px solid ${themeColors.borderColor}`,
              }}
              elevation={3}
            >
              <BottomNavigation
                value={bottomNavValue}
                onChange={(event, newValue) => {
                  setBottomNavValue(newValue);
                  navigate(bottomNavItems[newValue].path);
                }}
                sx={{
                  height: 64,
                  "& .MuiBottomNavigationAction-root": {
                    color: themeColors.textSecondary,
                    "&.Mui-selected": {
                      color: primaryColor,
                    },
                  },
                }}
              >
                {bottomNavItems.map((item, index) => (
                  <BottomNavigationAction
                    key={index}
                    label={item.label}
                    icon={item.icon}
                    sx={{
                      minWidth: 60,
                      fontSize: "0.75rem",
                    }}
                  />
                ))}
              </BottomNavigation>
            </Paper>
          )}

          {/* Notification Menu */}
          {renderNotificationMenu()}

          {/* Profile Menu */}
          {renderProfileDrawer()}

          {/* Settings Dialog */}
          {renderSettingsDrawer()}
        </Box>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
