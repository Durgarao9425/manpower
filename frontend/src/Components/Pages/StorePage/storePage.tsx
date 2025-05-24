import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Fab,
  Avatar,
  Divider,
  Stack,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Store as StoreIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  ViewModule as CardViewIcon,
  ViewList as TableViewIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import StoreForm from './storeForm';

// Dummy data for companies
const companies = [
  { id: 1, name: 'TechCorp Solutions' },
  { id: 2, name: 'Retail Giants Inc' },
  { id: 3, name: 'Local Market Chain' },
  { id: 4, name: 'Digital Commerce Co' }
];

// Dummy store data
const initialStores = [
  {
    id: 1,
    company_id: 1,
    store_name: 'TechCorp Downtown',
    location: 'Downtown District',
    address: '123 Main Street, Downtown, NY 10001',
    contact_person: 'John Smith',
    contact_phone: '+1 (555) 123-4567',
    status: 'active',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    company_id: 1,
    store_name: 'TechCorp Mall',
    location: 'Shopping Mall',
    address: '456 Mall Avenue, Shopping Center, NY 10002',
    contact_person: 'Sarah Johnson',
    contact_phone: '+1 (555) 234-5678',
    status: 'active',
    created_at: '2024-01-20T14:15:00Z',
    updated_at: '2024-01-20T14:15:00Z'
  },
  {
    id: 3,
    company_id: 2,
    store_name: 'Retail Giants Central',
    location: 'Central Plaza',
    address: '789 Central Plaza, Business District, NY 10003',
    contact_person: 'Mike Davis',
    contact_phone: '+1 (555) 345-6789',
    status: 'inactive',
    created_at: '2024-02-01T09:45:00Z',
    updated_at: '2024-02-01T09:45:00Z'
  },
  {
    id: 4,
    company_id: 3,
    store_name: 'Local Market West',
    location: 'West Side',
    address: '321 West Boulevard, West Side, NY 10004',
    contact_person: 'Emily Wilson',
    contact_phone: '+1 (555) 456-7890',
    status: 'active',
    created_at: '2024-02-10T16:20:00Z',
    updated_at: '2024-02-10T16:20:00Z'
  },
  {
    id: 5,
    company_id: 4,
    store_name: 'Digital Commerce Hub',
    location: 'Tech Park',
    address: '654 Innovation Drive, Tech Park, NY 10005',
    contact_person: 'Robert Brown',
    contact_phone: '+1 (555) 567-8901',
    status: 'active',
    created_at: '2024-02-15T11:10:00Z',
    updated_at: '2024-02-15T11:10:00Z'
  },
  {
    id: 6,
    company_id: 2,
    store_name: 'Retail Giants North',
    location: 'North District',
    address: '987 North Street, North District, NY 10006',
    contact_person: 'Lisa Garcia',
    contact_phone: '+1 (555) 678-9012',
    status: 'inactive',
    created_at: '2024-03-01T13:30:00Z',
    updated_at: '2024-03-01T13:30:00Z'
  }
];


// Store Card Component
const StoreCard = ({ store, onEdit, onDelete, companyName }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <StoreIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" component="h3">
              {store.store_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {companyName}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{store.location}</Typography>
          </Box>
          
          {store.address && (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
              {store.address}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{store.contact_person}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{store.contact_phone}</Typography>
          </Box>
        </Stack>
        
        <Box sx={{ mt: 2 }}>
          <Chip
            label={store.status}
            color={store.status === 'active' ? 'success' : 'default'}
            size="small"
          />
        </Box>
      </CardContent>
      
      <CardActions>
        <Button size="small" onClick={() => onEdit(store)} startIcon={<EditIcon />}>
          Edit
        </Button>
        <Button size="small" color="error" onClick={() => onDelete(store.id)} startIcon={<DeleteIcon />}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

// Main Store Management Component
const StoreManagement = () => {
  const [stores, setStores] = useState(initialStores);
  const [filteredStores, setFilteredStores] = useState(initialStores);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [showForm, setShowForm] = useState(false); // Changed from formOpen to showForm
  const [editingStore, setEditingStore] = useState(null);
  const [filters, setFilters] = useState({
    company: '',
    status: ''
  });

  // Apply filters
  useEffect(() => {
    let filtered = stores;
    
    if (filters.company) {
      filtered = filtered.filter(store => store.company_id === filters.company);
    }
    
    if (filters.status) {
      filtered = filtered.filter(store => store.status === filters.status);
    }
    
    setFilteredStores(filtered);
    setPage(0);
  }, [filters, stores]);

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const clearFilters = () => {
    setFilters({ company: '', status: '' });
  };

  const handleAddStore = () => {
    setEditingStore(null);
    setShowForm(true); // Show the form page
  };

  const handleEditStore = (store) => {
    setEditingStore(store);
    setShowForm(true); // Show the form page
  };

  const handleDeleteStore = (id) => {
    setStores(prev => prev.filter(store => store.id !== id));
  };

  const handleFormSubmit = (formData) => {
    if (editingStore) {
      // Update existing store
      setStores(prev => prev.map(store => 
        store.id === editingStore.id 
          ? { ...store, ...formData, updated_at: new Date().toISOString() }
          : store
      ));
    } else {
      // Add new store
      const newStore = {
        ...formData,
        id: Math.max(...stores.map(s => s.id)) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setStores(prev => [...prev, newStore]);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStore(null);
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  };

  const paginatedStores = filteredStores.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // If form should be shown, render the form instead of the main view
  if (showForm) {
    return (
      <StoreForm
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingStore}
        companies={companies}
      />
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Store Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddStore}
          size="large"
        >
          Add Store
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
        </Box>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Company</InputLabel>
              <Select
                value={filters.company}
                onChange={handleFilterChange('company')}
                label="Company"
              >
                <MenuItem value="">All Companies</MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={handleFilterChange('status')}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button variant="outlined" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => setViewMode('card')}
                color={viewMode === 'card' ? 'primary' : 'default'}
              >
                <CardViewIcon />
              </IconButton>
              <IconButton
                onClick={() => setViewMode('table')}
                color={viewMode === 'table' ? 'primary' : 'default'}
              >
                <TableViewIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Summary */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Showing {filteredStores.length} store(s) {filters.company || filters.status ? 'with applied filters' : 'total'}
      </Alert>

      {/* Content */}
      {viewMode === 'card' ? (
        <Grid container spacing={3}>
          {paginatedStores.map((store) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={store.id}>
              <StoreCard
                store={store}
                onEdit={handleEditStore}
                onDelete={handleDeleteStore}
                companyName={getCompanyName(store.company_id)}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} sx={{minWidth:'77vw'}}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Store Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{store.store_name}</Typography>
                  </TableCell>
                  <TableCell>{getCompanyName(store.company_id)}</TableCell>
                  <TableCell>{store.location}</TableCell>
                  <TableCell>{store.contact_person}</TableCell>
                  <TableCell>{store.contact_phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={store.status}
                      color={store.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEditStore(store)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteStore(store.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredStores.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        sx={{ mt: 2 }}
      />

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        onClick={handleAddStore}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default StoreManagement;