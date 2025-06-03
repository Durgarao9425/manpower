import React, { useState, useEffect } from "react";
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
  ToggleButton,
  ToggleButtonGroup,
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
import { ViewList, ViewModule, ArrowBack } from "@mui/icons-material";
import ReusableTable from "./userTable";
import ReusableCard from "./userCard";
import UserForm from "./userform";
import UserView from "./userView";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import apiService from "../../../services/apiService";

// User type for TypeScript
interface User {
  id?: number;
  company_id: number | null;
  username: string;
  password?: string;
  email: string;
  user_type: "admin" | "company" | "rider" | "store_manager";
  full_name: string;
  phone?: string;
  address?: string;
  profile_image?: string;
  created_at?: string;
  updated_at?: string;
  status: "active" | "inactive" | "suspended";
}

const UserListing = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false); // New state for view mode
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null); // Selected user for viewing
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    user_type: "",
    status: "",
    company_id: "",
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

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

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setShowForm(true);
  };

  const handleDelete = (user: User) => {
    handleDeleteClick(user);
  };

  // New function to handle view
  const handleView = (user: User) => {
    if (user.id) {
      setSelectedUserId(user.id);
      setShowView(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete && userToDelete.id) {
      try {
        await apiService.delete(`/users/${userToDelete.id}`);
        setUsers(users.filter((user) => user.id !== userToDelete.id));
        showSnackbar(`${userToDelete.full_name} deleted successfully`);
      } catch (error) {
        console.error("Error deleting user:", error);
        showSnackbar("Failed to delete user", "error");
      }
    }
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Fetch users with error handling
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/users");
      setUsers(response);
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

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setShowView(false); // Reset view mode too
    setCurrentUser(null);
    setSelectedUserId(null);
  };

  const handleSaveUser = async (userData: User) => {
    try {
      if (currentUser?.id) {
        // Edit mode: update user
        // Include the ID in the userData for the API call
        const updatedUserData = {
          ...userData,
          id: currentUser.id, // Make sure the ID is included
        };

        const response = await apiService.put(
          `/users/${currentUser.id}`,
          updatedUserData
        );

        // Make sure we're updating the users array with the complete user object including ID
        const updatedUser = {
          ...response,
          id: currentUser.id, // Ensure ID is preserved in case it's not returned by the API
        };

        setUsers((prev) =>
          prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
        );
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
            status: userData.status || "Active",
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
        setUsers((prev) => [...prev, createdUser]);
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
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1" fontWeight={600}>
              User Details
            </Typography>
          </Box>

          <UserView selectedUserId={selectedUserId} />
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
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1" fontWeight={600}>
              {currentUser ? "Edit User" : "Add New User"}
            </Typography>
          </Box>

          <UserForm
            open={true}
            onClose={handleBackToList}
            onSave={handleSaveUser}
            user={currentUser}
            isFullPage={true}
          />
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "white", minHeight: "100vh", width: "78vw" }}>
      <Container
        maxWidth="xl"
        sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}
      >
        <Box sx={{ my: 4 }}>
          {/* Top Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
              mb: 3,
            }}
          >
            <Typography variant="h4" component="h1" fontWeight={600}>
              User Management
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                mt: 2,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddUser}
                size="small"
                sx={{
                  px: 2.5,
                  py: 1,
                  fontWeight: 500,
                  textTransform: "none",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  boxShadow: 2,
                  ":hover": {
                    backgroundColor: "#1976d2", // deeper blue on hover
                    boxShadow: 4,
                    transform: "scale(1.03)",
                  },
                }}
              >
                Add New User
              </Button>

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="view mode"
                size="small"
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: 2,
                  boxShadow: 1,
                  overflow: "hidden",
                }}
              >
                <Tooltip title="List View" arrow>
                  <ToggleButton
                    value="list"
                    aria-label="list view"
                    sx={{
                      px: 2,
                      py: 1,
                      transition: "all 0.2s",
                      ":hover": { bgcolor: "#e3f2fd" },
                    }}
                  >
                    <ViewList fontSize="small" />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Card View" arrow>
                  <ToggleButton
                    value="card"
                    aria-label="card view"
                    sx={{
                      px: 2,
                      py: 1,
                      transition: "all 0.2s",
                      ":hover": { bgcolor: "#e3f2fd" },
                    }}
                  >
                    <ViewModule fontSize="small" />
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </Box>
          </Box>

          {/* Filters */}
          <Box
            sx={{
              mb: 2,
              p: 2,
              bgcolor: "#f9f9fb", // Light gray background
              borderRadius: 2,
              boxShadow: 2,
              border: "1px solid #e0e0e0",
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="🔍 Search Users"
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Username, email, or name"
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: 1,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl
                  fullWidth
                  size="small"
                  sx={{ backgroundColor: "#fff", borderRadius: 1 }}
                >
                  <InputLabel>User Type</InputLabel>
                  <Select
                    name="user_type"
                    value={filters.user_type}
                    onChange={handleFilterChange}
                    label="User Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="company">Company</MenuItem>
                    <MenuItem value="rider">Rider</MenuItem>
                    <MenuItem value="store_manager">Store Manager</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl
                  fullWidth
                  size="small"
                  sx={{ backgroundColor: "#fff", borderRadius: 1 }}
                >
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  size="small"
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({ user_type: "", status: "", company_id: "" });
                    setPage(1);
                  }}
                  sx={{
                    height: "40px",
                    borderRadius: 1,
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Content Area */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <Typography variant="h6">Loading users...</Typography>
            </Box>
          ) : (
            <>
              {viewMode === "list" ? (
                <ReusableTable
                  data={paginatedUsers}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteClick}
                  onView={handleView}
                  columns={[
                    { field: "id", headerName: "ID", width: 40 },
                    {
                      field: "username",
                      headerName: "Username",
                      width: 130,
                      clickable: true,
                    },
                    { field: "email", headerName: "Email", width: 200 },
                    { field: "full_name", headerName: "Full Name", width: 180 },
                    { field: "user_type", headerName: "User Type", width: 100 },
                    { field: "status", headerName: "Status", width: 80 },
                  ]}
                />
              ) : (
                <ReusableCard
                  data={paginatedUsers}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                  labels={{
                    email: "Email Address",
                    company_id: "Company ID",
                    user_type: "User Role",
                    status: "Account Status",
                  }}
                />
              )}

              {/* Delete Confirmation */}
              <Dialog
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  Confirm Deletion
                  <IconButton onClick={handleDeleteCancel} size="small">
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                <DialogContent>
                  <Box
                    sx={{
                      p: 3,
                      mt: 1,
                      mb: 2,
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      backgroundColor: "#f9f9f9",
                      minHeight: "100px",
                    }}
                  >
                    <Typography variant="body1">
                      Are you sure you want to delete{" "}
                      <strong>{userToDelete?.full_name || "-"}</strong>?
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      This action cannot be undone.
                    </Typography>
                  </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                  <Button onClick={handleDeleteCancel} variant="outlined">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteConfirm}
                    color="error"
                    variant="contained"
                    startIcon={<DeleteIcon />}
                  >
                    Delete User
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Snackbar */}
              <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <Alert
                  onClose={handleSnackbarClose}
                  severity={snackbarSeverity}
                  variant="filled"
                >
                  {snackbarMessage}
                </Alert>
              </Snackbar>

              {/* Pagination */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                <Pagination
                  count={count}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  size="large"
                />
              </Box>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default UserListing;
