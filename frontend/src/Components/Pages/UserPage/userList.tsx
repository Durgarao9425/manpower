import React, { useState, useEffect } from 'react';
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
    IconButton
} from '@mui/material';
import { ViewList, ViewModule } from '@mui/icons-material';
import ReusableTable from './userTable';
import ReusableCard from './userCard';
import UserForm from './userform';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';



const UserListing = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [openForm, setOpenForm] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        user_type: '',
        status: '',
        company_id: ''
    });

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteConfirmOpen(true);
    };

    const handleEdit = (user) => {
  console.log('Edit user:', user);
};

const handleDelete = (user) => {
  console.log('Delete user:', user);
};
    const handleDeleteConfirm = () => {
        if (userToDelete) {
            setUsers(users.filter(user => user.id !== userToDelete.id));
            setSnackbarMessage(`${userToDelete.name} deleted successfully`);
            setSnackbarOpen(true);
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

    // Mock data fetch - replace with actual API call
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 500));
                const mockUsers = [
                    // Sample user data matching your schema
                    {
                        id: 1, company_id: 1, username: 'admin1', email: 'admin@example.com',
                        user_type: 'admin', full_name: 'Admin User', status: 'active'
                    },
                    {
                        id: 2, company_id: 1, username: 'manager1', email: 'manager@example.com',
                        user_type: 'store_manager', full_name: 'Store Manager', status: 'active'
                    },
                    {
                        id: 3, company_id: 2, username: 'rider1', email: 'rider@example.com',
                        user_type: 'rider', full_name: 'Delivery Rider', status: 'active'
                    },
                    // Add more mock users as needed
                ];
                setUsers(mockUsers);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleViewModeChange = (event, newViewMode) => {
        if (newViewMode !== null) {
            setViewMode(newViewMode);
        }
    };

    const handleAddUser = () => {
        setCurrentUser(null);
        setOpenForm(true);
    };

    const handleEditUser = (user) => {
        setCurrentUser(user);
        setOpenForm(true);
    };

    const handleCloseForm = () => {
        setOpenForm(false);
    };

    const handleSaveUser = (userData) => {
        // Handle save logic (create/update)
        console.log('Saving user:', userData);
        setOpenForm(false);
        // Refresh user list after save
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(1); // Reset to first page when searching
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPage(1); // Reset to first page when filtering
    };

    const filteredUsers = users.filter(user => {
        // Search term filter
        const matchesSearch =
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.full_name.toLowerCase().includes(searchTerm.toLowerCase());

        // User type filter
        const matchesUserType = filters.user_type ? user.user_type === filters.user_type : true;

        // Status filter
        const matchesStatus = filters.status ? user.status === filters.status : true;

        // Company filter
        const matchesCompany = filters.company_id ? user.company_id === parseInt(filters.company_id) : true;

        return matchesSearch && matchesUserType && matchesStatus && matchesCompany;
    });

    // Pagination logic
    const count = Math.ceil(filteredUsers.length / rowsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    return (
        <Container maxWidth="xl">
            <Box sx={{ my: 4, minWidth: '77vw' }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                        mb: 3
                    }}
                >
                    {/* Left: Title */}
                    <Typography variant="h4" component="h1" fontWeight={600}>
                        User Management
                    </Typography>

                    {/* Right: Button and View Toggle */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddUser}
                        >
                            Add New User
                        </Button>

                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={handleViewModeChange}
                            aria-label="view mode"
                        >
                            <Tooltip title="List View" arrow>
                                <ToggleButton value="list" aria-label="list view">
                                    <ViewList />
                                </ToggleButton>
                            </Tooltip>
                            <Tooltip title="Card View" arrow>
                                <ToggleButton value="card" aria-label="card view">
                                    <ViewModule />
                                </ToggleButton>
                            </Tooltip>
                        </ToggleButtonGroup>
                    </Box>
                </Box>

                {/* Search and Filters */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Search Users"
                                variant="outlined"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
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
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
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

                    </Grid>
                </Box>

                {/* Content Area */}
                {loading ? (
                    <Typography>Loading users...</Typography>
                ) : (
                    <>
                        {viewMode === 'list' ? (
                            <ReusableTable
                                data={paginatedUsers}
                                onEdit={handleEditUser}
                                onDelete={handleDeleteClick}
                                columns={[
                                    { field: 'id', headerName: 'ID', width: 70 },
                                    { field: 'username', headerName: 'Username', width: 130 },
                                    { field: 'email', headerName: 'Email', width: 200 },
                                    { field: 'full_name', headerName: 'Full Name', width: 180 },
                                    { field: 'user_type', headerName: 'User Type', width: 150 },
                                    { field: 'status', headerName: 'Status', width: 120 },
                                ]}
                            />
                        ) : (
                            <ReusableCard
                                data={paginatedUsers}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                labels={{
                                    email: 'Email Address',
                                    company_id: 'Company ID',
                                    user_type: 'User Role',
                                    status: 'Account Status'
                                }}
                            />
                        )}



                        <Dialog
                            open={deleteConfirmOpen}
                            onClose={handleDeleteCancel}
                            maxWidth="sm"
                            fullWidth
                        >
                            <DialogTitle
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
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
                                        p: 2,
                                        mt: 1,
                                        mb: 2,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 2,
                                        backgroundColor: '#f9f9f9',
                                        minHeight: '100px'
                                    }}
                                >
                                    <Typography variant="body1">
                                        Are you sure you want to delete{' '}
                                        <b>{'Durgarao' || '-'}</b>?
                                    </Typography>
                                </Box>
                            </DialogContent>

                            <DialogActions>
                                <Button onClick={() => {
                                    handleDeleteCancel();
                                    //   setDeleteSelectedItem(null);
                                }}>
                                    No
                                </Button>

                                <Tooltip title="Delete User" arrow>
                                    <Button
                                        onClick={handleDeleteConfirm}
                                        color="error"
                                        variant="contained"
                                        startIcon={<DeleteIcon />}
                                    >
                                        Yes
                                    </Button>
                                </Tooltip>
                            </DialogActions>
                        </Dialog>

                        {/* Success Notification */}
                        <Snackbar
                            open={snackbarOpen}
                            autoHideDuration={3000}
                            onClose={handleSnackbarClose}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <Alert onClose={handleSnackbarClose} severity="success">
                                {snackbarMessage}
                            </Alert>
                        </Snackbar>


                        {/* Pagination */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination
                                count={count}
                                page={page}
                                onChange={(event, value) => setPage(value)}
                                color="primary"
                            />
                        </Box>
                    </>
                )}
            </Box>

            {/* User Form Dialog */}
            <UserForm
                open={openForm}
                onClose={handleCloseForm}
                onSave={handleSaveUser}
                user={currentUser}
            />
        </Container>
    );
};

export default UserListing;