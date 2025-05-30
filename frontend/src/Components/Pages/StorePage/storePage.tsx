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
import apiService from '../../../services/apiService';

type Store = {
  id: number;
  company_id: number;
  store_name: string;
  location: string;
  address: string;
  contact_person: string;
  contact_phone: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type Company = { id: number; name: string };

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
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [filters, setFilters] = useState<{ company: string; status: string }>({ company: '', status: '' });
  const [companies, setCompanies] = useState<Company[]>([]);

  // Fetch stores from the backend API
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const reasponse = await apiService.get('/stores');
        console.log(reasponse,"reasponse+++++++++++++++++++++++++++")
        setStores(reasponse);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch stores');
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  // Fetch companies from backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiService.get('/companies');
        console.log(response,"------------------------------------------------------")
        setCompanies(response);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchCompanies();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = stores;

    if (filters.company) {
      filtered = filtered.filter(store => store.company_id === Number(filters.company));
    }

    if (filters.status) {
      filtered = filtered.filter(store => store.status === filters.status);
    }

    setFilteredStores(filtered);
    setPage(0);
  }, [filters, stores]);

  const handleFilterChange = (field: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value as string
    }));
  };

  const clearFilters = () => {
    setFilters({ company: '', status: '' });
  };

  const handleAddStore = () => {
    setEditingStore(null);
    setShowForm(true); // Show the form page
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setShowForm(true); // Show the form page
  };

  const handleDeleteStore = (id: number) => {
    setStores(prev => prev.filter(store => store.id !== id));
  };

  const handleFormSubmit = async (formData: Store) => {
    try {
      if (editingStore) {
        // Update existing store (not implemented here)
        setStores(prev => prev.map(store => store.id === editingStore.id ? { ...store, ...formData, updated_at: new Date().toISOString() } : store));
      } else {
        // Add new store to backend
        const response = await apiService.post('stores', {
          ...formData,
          company_id: Number(formData.company_id),
        });
        setStores(prev => [...prev, data]);
      }
      setShowForm(false);
      setEditingStore(null);
    } catch (error) {
      alert('Failed to create store.');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStore(null);
  };

  const getCompanyName = (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  };

  const paginatedStores = filteredStores?.slice(
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

  // Show loading/error states
  if (loading) return <div>Loading stores...</div>;
  if (error) return <div>{error}</div>;

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
                {companies?.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.company_name || company.name}
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
        Showing {filteredStores?.length} store(s) {filters.company || filters.status ? 'with applied filters' : 'total'}
      </Alert>

      {/* Content */}
      {viewMode === 'card' ? (
        <Grid container spacing={3}>
          {paginatedStores?.map((store) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={store.id}>
              <StoreCard
                store={store}
                onEdit={handleEditStore}
                onDelete={handleDeleteStore}
                companyName={getCompanyName(store?.company_id)}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} sx={{ minWidth: '77vw' }}>
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
              {paginatedStores?.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{store?.store_name}</Typography>
                  </TableCell>
                  <TableCell>{getCompanyName(store?.company_id)}</TableCell>
                  <TableCell>{store?.location}</TableCell>
                  <TableCell>{store?.contact_person}</TableCell>
                  <TableCell>{store?.contact_phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={store?.status}
                      color={store?.status === 'active' ? 'success' : 'default'}
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
        count={filteredStores?.length}
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