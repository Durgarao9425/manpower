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
import type { SelectChangeEvent } from '@mui/material/Select';

// User type for TypeScript
interface User {
    id: number;
    company_id: number | null;
    username: string;
    password?: string;
    email: string;
    user_type: 'admin' | 'company' | 'rider' | 'store_manager';
    full_name: string;
    phone?: string;
    address?: string;
    profile_image?: string;
    created_at?: string;
    updated_at?: string;
    status: 'active' | 'inactive' | 'suspended';
}

const UserListing = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
    const [openForm, setOpenForm] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        user_type: '',
        status: '',
        company_id: ''
    });

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteConfirmOpen(true);
    };

    const handleEdit = (user: User) => {
        console.log('Edit user:', user);
    };

    const handleDelete = (user: User) => {
        console.log('Delete user:', user);
    };
    const handleDeleteConfirm = async () => {
        if (userToDelete) {
            try {
                const response = await fetch(`http://localhost:4003/api/users/${userToDelete.id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setUsers(users.filter(user => user.id !== userToDelete.id));
                    setSnackbarMessage(`${userToDelete.full_name} deleted successfully`);
                } else {
                    setSnackbarMessage('Failed to delete user');
                }
            } catch (error) {
                setSnackbarMessage('Error deleting user');
            }
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
                const response = await fetch('http://localhost:4003/api/users');
                const data = await response.json();
                setUsers(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newViewMode: 'list' | 'card') => {
        if (newViewMode !== null) {
            setViewMode(newViewMode);
        }
    };

    const handleAddUser = () => {
        setCurrentUser(null);
        setOpenForm(true);
    };

    const handleEditUser = (user: User) => {
        setCurrentUser(user);
        setOpenForm(true);
    };

    const handleCloseForm = () => {
        setOpenForm(false);
    };

    const handleSaveUser = async (userData: User) => {
        if (userData.id) {
            // Edit mode: update user
            try {
                const response = await fetch(`http://localhost:4003/api/users/${userData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                if (response.ok) {
                    setUsers(prev => prev.map(u => u.id === userData.id ? { ...u, ...userData } : u));
                    setSnackbarMessage('User updated successfully');
                    setSnackbarOpen(true);
                } else {
                    setSnackbarMessage('Failed to update user');
                    setSnackbarOpen(true);
                }
            } catch (error) {
                setSnackbarMessage('Error updating user');
                setSnackbarOpen(true);
            }
        } else {
            // Create mode: add new user
            try {
                const response = await fetch('http://localhost:4003/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                if (response.ok) {
                    // Refresh user list after save
                    const newUser = await response.json();
                    setUsers(prev => [...prev, newUser]);
                    setSnackbarMessage('User created successfully');
                    setSnackbarOpen(true);
                } else {
                    setSnackbarMessage('Failed to create user');
                    setSnackbarOpen(true);
                }
            } catch (error) {
                setSnackbarMessage('Error creating user');
                setSnackbarOpen(true);
            }
        }
        setOpenForm(false);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1); // Reset to first page when searching
    };

    // Fix: handleFilterChange for MUI Select
    const handleFilterChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name!]: value
        }));
        setPage(1);
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
                                data={paginatedUsers as any[]}
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
                                        <b>{userToDelete?.full_name || '-'}</b>?
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
                                onChange={(_event, value) => setPage(value)}
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