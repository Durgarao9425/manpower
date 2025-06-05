import React, { useState, useEffect } from "react";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Pagination,
  Tooltip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import ReusableTable from "./userTable";
import ReusableCard from "./userCard";
import UserForm from "./userform";
import UserView from "./userView";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import apiService from "../../../services/apiService";

// Define a shared type for user_type
type UserType = "admin" | "company" | "rider" | "store_manager";
type UserStatus = "active" | "inactive" | "suspended";

interface User {
  id?: number;
  company_id: number | null;
  username: string;
  password?: string;
  email: string;
  user_type: UserType;
  full_name: string;
  phone?: string;
  address?: string;
  profile_image?: string;
  status: UserStatus;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
}

interface UserFormData {
  id?: number;
  company_id: number | null;
  username: string;
  password: string;
  email: string;
  user_type: UserType;
  full_name: string;
  phone: string;
  address: string;
  profile_image: string;
  status: UserStatus;
  created_by?: number;
}

interface UserTableProps {
  columns: Array<{
    field: string;
    headerName: string;
    type?: string;
  }>;
  data: User[];
  loading: boolean;
  actions: Array<{
    icon: React.ReactElement;
    color: string;
    title: string;
    onClick: (item: User) => void;
  }>;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
}

const UserListing = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    user_type: "",
    status: "",
    company_id: "",
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const [activeTab, setActiveTab] = useState('all');

  // API Base URL
  const API_BASE_URL = "http://localhost:4003/api";

  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setShowForm(true);
  };

  // New function to handle view
  const handleView = (user: User) => {
    if (user.id) {
      setSelectedUserId(user.id);
      setShowView(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Fetch users with error handling
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/users");
      // Ensure type safety for the response data
      const typedUsers = response.map((user: any) => ({
        ...user,
        user_type: user.user_type as UserType,
        status: user.status as UserStatus
      }));
      setUsers(typedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewMode: "list" | "card"
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setShowView(false);
    setCurrentUser(null);
    setSelectedUserId(null);
  };

  const handleSaveUser = async (userData: UserFormData) => {
    try {
      if (currentUser?.id) {
        // Edit mode: update user
        const updatedUserData = {
          ...userData,
          id: currentUser.id,
        };

        const response = await apiService.put(
          `/users/${currentUser.id}`,
          updatedUserData
        );

        // Update the users array with the response data
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(user => {
            if (user.id === currentUser.id) {
              // Ensure we keep all existing fields and merge with response
              return {
                ...user,
                ...response,
                id: currentUser.id, // Ensure ID is preserved
                user_type: response.user_type as UserType, // Ensure type safety
                status: response.status as UserStatus // Ensure type safety
              };
            }
            return user;
          });
          return updatedUsers;
        });

        // Refresh the data to ensure consistency
        await fetchUsers();
        showSnackbar("User updated successfully");
      } else {
        // Create mode: add new user
        const response = await apiService.post("/users", userData);
        const createdUser = response;
        
        // If user_type is rider or company, send a second request to create the minimal record
        if (userData.user_type === "rider") {
          await apiService.post("/riders", {
            rider_id: userData.full_name,
            user_id: createdUser.id,
            rider_code: userData.username,
            created_by: userData.created_by || 1,
            status: userData.status || "active",
          });
        } else if (userData.user_type === "company") {
          await apiService.post("/companies", {
            user_id: createdUser.id,
            company_name: userData.full_name,
            company_email: userData.email,
            company_phone: userData.phone,
            logo: userData.profile_image,
            created_by: userData.created_by || 1,
          });
        }

        // Add the new user to the end of the users array
        setUsers(prevUsers => [...prevUsers, {
          ...createdUser,
          user_type: createdUser.user_type as UserType,
          status: createdUser.status as UserStatus
        }]);
        showSnackbar("User created successfully");
      }
      setShowForm(false);
      setCurrentUser(null);
    } catch (error) {
      console.error("Error saving user:", error);
      showSnackbar(
        currentUser?.id ? "Failed to update user" : "Failed to create user",
        "error"
      );
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name!]: value,
    }));
    setPage(1);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    setFilters(prev => ({
      ...prev,
      status: newValue === 'all' ? '' : newValue
    }));
  };

  const filteredUsers = users.filter((user) => {
    // Search term filter
    const matchesSearch =
      user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    // User type filter
    const matchesUserType = filters.user_type
      ? user.user_type === filters.user_type
      : true;

    // Status filter
    const matchesStatus = filters.status
      ? user.status === filters.status
      : true;

    // Company filter
    const matchesCompany = filters.company_id
      ? user.company_id === parseInt(filters.company_id)
      : true;

    return matchesSearch && matchesUserType && matchesStatus && matchesCompany;
  });

  // Pagination logic
  const count = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const tabs = [
    { 
      label: 'All Users', 
      value: 'all', 
      count: users.length, 
      color: 'default' 
    },
    { 
      label: 'Active', 
      value: 'active', 
      count: users.filter(u => u.status === 'active').length, 
      color: 'success' 
    },
    { 
      label: 'Inactive', 
      value: 'inactive', 
      count: users.filter(u => u.status === 'inactive').length, 
      color: 'warning' 
    },
    { 
      label: 'Suspended', 
      value: 'suspended', 
      count: users.filter(u => u.status === 'suspended').length, 
      color: 'error' 
    }
  ];

  const columns = [
    { field: 'full_name', headerName: 'FULL NAME' },
    { field: 'username', headerName: 'USERNAME' },
    { field: 'email', headerName: 'EMAIL' },
    { field: 'user_type', headerName: 'USER TYPE' },
    { field: 'phone', headerName: 'PHONE' },
    { field: 'status', headerName: 'STATUS', type: 'status' }
  ];

  const actions = [
    {
      icon: <VisibilityIcon fontSize="small" />,
      color: 'primary',
      title: 'View Details',
      onClick: (item: User) => handleView(item)
    },
    {
      icon: <EditIcon fontSize="small" />,
      color: 'secondary',
      title: 'Edit',
      onClick: (item: User) => handleEdit(item)
    }
  ];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Show user view as full page
  if (showView && selectedUserId) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ my: 4, minWidth: "77vw" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 3,
            }}
          >
            <IconButton
              onClick={handleBackToList}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h4" component="h1" fontWeight={600}>
              User Details
            </Typography>
          </Box>

          <UserView 
            userId={selectedUserId} 
            onClose={handleBackToList}
            onEdit={handleEdit}
          />
        </Box>
      </Container>
    );
  }

  // Show form as full page
  if (showForm) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ my: 4, minWidth: "77vw" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 3,
            }}
          >
            <IconButton
              onClick={handleBackToList}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h4" component="h1" fontWeight={600}>
              {currentUser ? "Edit User" : "Add New User"}
            </Typography>
          </Box>

          <UserForm
            open={true}
            onClose={handleBackToList}
            onSave={handleSaveUser}
            user={currentUser || undefined}
            isFullPage={true}
          />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
        >
          Add New User
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.label}
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: `${tab.color}.light`,
                      color: `${tab.color}.main`,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    {tab.count}
                  </Typography>
                </Box>
              }
              value={tab.value}
            />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Users"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>User Type</InputLabel>
              <Select
                value={filters.user_type}
                label="User Type"
                onChange={(e) => handleFilterChange({ target: { name: 'user_type', value: e.target.value } } as any)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="company">Company</MenuItem>
                <MenuItem value="rider">Rider</MenuItem>
                <MenuItem value="store_manager">Store Manager</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <ReusableTable
        columns={columns}
        data={paginatedUsers}
        loading={loading}
        actions={actions}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        totalCount={filteredUsers.length}
      />

      {showForm && (
        <UserForm
          open={showForm}
          onClose={handleBackToList}
          onSave={handleSaveUser}
          user={currentUser || undefined}
          isFullPage={true}
        />
      )}

      {showView && selectedUserId && (
        <UserView
          userId={selectedUserId}
          onClose={handleBackToList}
          onEdit={handleEdit}
        />
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserListing;
