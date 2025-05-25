import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  Tab,
  Tabs,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  Avatar,
  Divider,
  FormControlLabel,
  Switch,
  Tooltip
} from '@mui/material';
import {
  Settings,
  Edit,
  Delete,
  Add,
  Save,
  Close,
  Person,
  AdminPanelSettings,
  Security,
  Dashboard,
  Business,
  Store,
  Schedule,
  LocalShipping,
  Payment,
  AttachMoney,
  CreditScore,
  AccountBalance,
  Receipt,
  TwoWheeler
} from '@mui/icons-material';
import axios from 'axios';

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

// Navigation items with icons and permissions
const navigationModules = [
  { id: "dashboard", text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { id: "user", text: "User Management", icon: <Person />, path: "/user-page" },
  { id: "riders", text: "Riders", icon: <TwoWheeler />, path: "/riders" },
  { id: "companies", text: "Companies", icon: <Business />, path: "/companies" },
  { id: "stores", text: "Stores", icon: <Store />, path: "/stores" },
  { id: "attendance", text: "Rider Attendance", icon: <Schedule />, path: "/rider-attendance" },
  { id: "orders", text: "Orders", icon: <LocalShipping />, path: "/orders" },
  { id: "payments", text: "Payments", icon: <Payment />, path: "/payments" },
  { id: "earnings", text: "Earnings", icon: <AttachMoney />, path: "/earnings" },
  { id: "advance", text: "Advance", icon: <CreditScore />, path: "/advance" },
  { id: "settlement", text: "Settlement", icon: <AccountBalance />, path: "/settlement" },
  { id: "invoice", text: "Invoice", icon: <Receipt />, path: "/invoice" },
  { id: "settings", text: "Settings", icon: <Settings />, path: "/settings" },
];

// User interface
interface User {
  id: number;
  company_id: number | null;
  username: string;
  email: string;
  user_type: 'admin' | 'company' | 'rider' | 'store_manager';
  full_name: string;
  phone?: string;
  address?: string;
  profile_image?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at?: string;
  updated_at?: string;
}

// Permission interface
interface Permission {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

interface UserPermissions {
  [moduleId: string]: Permission;
}

const RoleManagementPage = () => {
  // States
  const [activeTab, setActiveTab] = useState(0);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<{ [userId: number]: UserPermissions }>({});
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // API Base URL
  const API_BASE_URL = 'http://localhost:4003/api';

  // Fetch admin users
  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users`);
      const adminUsers = response.data.filter((user: User) => user.user_type === 'admin');
      setAdminUsers(adminUsers);
      
      // Initialize permissions for each admin user
      const initialPermissions: { [userId: number]: UserPermissions } = {};
      adminUsers.forEach((user: User) => {
        initialPermissions[user.id] = {};
        navigationModules.forEach(module => {
          initialPermissions[user.id][module.id] = {
            view: false,
            edit: false,
            delete: false
          };
        });
      });
      setPermissions(initialPermissions);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      showSnackbar('Failed to fetch admin users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  // Show snackbar
  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle permission change
  const handlePermissionChange = (userId: number, moduleId: string, permissionType: keyof Permission) => {
    setPermissions(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [moduleId]: {
          ...prev[userId][moduleId],
          [permissionType]: !prev[userId][moduleId][permissionType]
        }
      }
    }));
  };

  // Handle select all permissions for a user
  const handleSelectAllForUser = (userId: number, permissionType: keyof Permission) => {
    const currentUser = adminUsers.find(user => user.id === userId);
    if (!currentUser) return;

    const allChecked = navigationModules.every(module => 
      permissions[userId]?.[module.id]?.[permissionType]
    );

    setPermissions(prev => {
      const newPermissions = { ...prev };
      navigationModules.forEach(module => {
        if (!newPermissions[userId]) newPermissions[userId] = {};
        if (!newPermissions[userId][module.id]) {
          newPermissions[userId][module.id] = { view: false, edit: false, delete: false };
        }
        newPermissions[userId][module.id][permissionType] = !allChecked;
      });
      return newPermissions;
    });
  };

  // Save permissions
  const handleSavePermissions = async () => {
    try {
      // Here you would typically send the permissions to your backend
      // For now, we'll just show a success message
      showSnackbar('Permissions saved successfully!');
    } catch (error) {
      showSnackbar('Failed to save permissions', 'error');
    }
  };

  // Add new admin user
  const handleAddUser = async () => {
    try {
      const userData = {
        ...newUserData,
        user_type: 'admin',
        status: 'active'
      };
      
      const response = await axios.post(`${API_BASE_URL}/users`, userData);
      setAdminUsers(prev => [...prev, response.data]);
      
      // Initialize permissions for new user
      setPermissions(prev => ({
        ...prev,
        [response.data.id]: navigationModules.reduce((acc, module) => ({
          ...acc,
          [module.id]: { view: false, edit: false, delete: false }
        }), {})
      }));
      
      setShowAddUserDialog(false);
      setNewUserData({ username: '', email: '', full_name: '', password: '' });
      showSnackbar('Admin user added successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
      showSnackbar('Failed to add user', 'error');
    }
  };

  // Delete admin user
  const handleDeleteUser = async (userId: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}`);
      setAdminUsers(prev => prev.filter(user => user.id !== userId));
      setPermissions(prev => {
        const newPerms = { ...prev };
        delete newPerms[userId];
        return newPerms;
      });
      showSnackbar('Admin user deleted successfully!');
    } catch (error) {
      showSnackbar('Failed to delete user', 'error');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4,minWidth:'77vw'}}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6" color="textSecondary">Loading admin users...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4,minWidth:'77vw'}}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color={themeColors.textPrimary} gutterBottom>
          Role & Permission Management
        </Typography>
        <Typography variant="body1" color={themeColors.textSecondary}>
          Manage admin user roles and their module permissions
        </Typography>
      </Box>

      {/* Main Content Card */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {/* Tabs Header */}
        <Box sx={{ 
          bgcolor: themeColors.cardBg, 
          borderBottom: `1px solid ${themeColors.borderColor}`,
          px: 3,
          pt: 2
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600} color={themeColors.textPrimary}>
              Admin Users ({adminUsers.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowAddUserDialog(true)}
              sx={{
                bgcolor: themeColors.primary,
                '&:hover': { bgcolor: '#0a5d35' },
                borderRadius: 2,
                px: 3
              }}
            >
              Add Admin User
            </Button>
          </Box>

          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 60,
                px: 3
              },
              '& .Mui-selected': {
                color: themeColors.primary,
                fontWeight: 600
              }
            }}
          >
            {adminUsers.map((user, index) => (
              <Tab
                key={user.id}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: themeColors.primary }}>
                      <AdminPanelSettings fontSize="small" />
                    </Avatar>
                    <Box textAlign="left">
                      <Typography variant="body2" fontWeight={600}>
                        {user.full_name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {user.email}
                      </Typography>
                    </Box>
                    <Chip
                      label={user.status}
                      size="small"
                      color={user.status === 'active' ? 'success' : 'default'}
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 4 }}>
          {adminUsers.length > 0 && adminUsers[activeTab] && (
            <>
              {/* User Info Card */}
              {/* <Card sx={{ mb: 4, bgcolor: themeColors.highlight, border: `1px solid ${themeColors.borderColor}` }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box display="flex" gap={3}>
                      <Avatar sx={{ width: 64, height: 64, bgcolor: themeColors.primary }}>
                        <AdminPanelSettings sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {adminUsers[activeTab].full_name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {adminUsers[activeTab].email}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Username: {adminUsers[activeTab].username}
                        </Typography>
                        {adminUsers[activeTab].phone && (
                          <Typography variant="body2" color="textSecondary">
                            Phone: {adminUsers[activeTab].phone}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Edit User">
                        <IconButton color="primary">
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton 
                          color="error"
                          onClick={() => handleDeleteUser(adminUsers[activeTab].id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card> */}

              {/* Permissions Table */}
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                Module Permissions
              </Typography>

              <TableContainer component={Paper} sx={{ borderRadius: 2, border: `1px solid ${themeColors.borderColor}` }}>
                <Table>
                  <TableHead sx={{ bgcolor: themeColors.background }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%' }}>
                        Module
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {/* <Eye fontSize="small" /> */}
                            <Typography variant="body2" fontWeight={600}>View</Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => handleSelectAllForUser(adminUsers[activeTab].id, 'view')}
                            sx={{ fontSize: '0.7rem', textTransform: 'none' }}
                          >
                            Select All
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Edit fontSize="small" />
                            <Typography variant="body2" fontWeight={600}>Edit</Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => handleSelectAllForUser(adminUsers[activeTab].id, 'edit')}
                            sx={{ fontSize: '0.7rem', textTransform: 'none' }}
                          >
                            Select All
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Delete fontSize="small" />
                            <Typography variant="body2" fontWeight={600}>Delete</Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => handleSelectAllForUser(adminUsers[activeTab].id, 'delete')}
                            sx={{ fontSize: '0.7rem', textTransform: 'none' }}
                          >
                            Select All
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {navigationModules.map((module) => (
                      <TableRow key={module.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box sx={{ color: themeColors.primary }}>
                              {module.icon}
                            </Box>
                            <Typography variant="body2" fontWeight={500}>
                              {module.text}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={permissions[adminUsers[activeTab].id]?.[module.id]?.view || false}
                            onChange={() => handlePermissionChange(adminUsers[activeTab].id, module.id, 'view')}
                            color="primary"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={permissions[adminUsers[activeTab].id]?.[module.id]?.edit || false}
                            onChange={() => handlePermissionChange(adminUsers[activeTab].id, module.id, 'edit')}
                            color="primary"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={permissions[adminUsers[activeTab].id]?.[module.id]?.delete || false}
                            onChange={() => handlePermissionChange(adminUsers[activeTab].id, module.id, 'delete')}
                            color="error"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Save Button */}
              <Box display="flex" justifyContent="end" mt={4}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Save />}
                  onClick={handleSavePermissions}
                  sx={{
                    bgcolor: themeColors.primary,
                    '&:hover': { bgcolor: '#0a5d35' },
                    borderRadius: 2,
                    px: 4,
                    py: 1.5
                  }}
                >
                  Save Permissions
                </Button>
              </Box>
            </>
          )}

          {adminUsers.length === 0 && (
            <Box textAlign="center" py={8}>
              <AdminPanelSettings sx={{ fontSize: 64, color: themeColors.textSecondary, mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No Admin Users Found
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={3}>
                Add your first admin user to start managing permissions
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowAddUserDialog(true)}
                sx={{
                  bgcolor: themeColors.primary,
                  '&:hover': { bgcolor: '#0a5d35' }
                }}
              >
                Add Admin User
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Add User Dialog */}
      <Dialog
        open={showAddUserDialog}
        onClose={() => setShowAddUserDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <AdminPanelSettings color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Add New Admin User
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} pt={2}>
            <TextField
              label="Full Name"
              value={newUserData.full_name}
              onChange={(e) => setNewUserData(prev => ({ ...prev, full_name: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Username"
              value={newUserData.username}
              onChange={(e) => setNewUserData(prev => ({ ...prev, username: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={newUserData.password}
              onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowAddUserDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddUser}
            variant="contained"
            startIcon={<Save />}
            sx={{
              bgcolor: themeColors.primary,
              '&:hover': { bgcolor: '#0a5d35' }
            }}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RoleManagementPage;