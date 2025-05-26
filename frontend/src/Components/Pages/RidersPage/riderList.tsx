import React, { useState, useEffect } from 'react';
import RiderRegistrationForm from './Riderform';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Input,
  Switch,
  FormControlLabel,
  TablePagination
} from '@mui/material';

import type { SelectChangeEvent } from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  DirectionsBike as BikeIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Rider {
  id: number;
  rider_id: string;
  user_id: string;
  rider_code: string;
  id_proof: string;
  emergency_contact: string;
  date_of_birth: string;
  blood_group: string;
  joining_date: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  upi_id: string;
  id_card_path: string;
  performance_tier: string;
  last_certificate_date: string;
  created_by: number;
  id_card_number: string;
  id_card_issue_date: string;
  id_card_expiry_date: string;
  documents: any[];
  status: string;
  vehicle_type: string;
  vehicle_number: string;
}

interface Company {
  id: number;
  name: string;
}

interface Stats {
  totalRiders: number;
  activeRiders: number;
  topPerformers: number;
  totalDeliveries: number;
}

const RiderListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [filteredRiders, setFilteredRiders] = useState<Rider[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRiders: 0,
    activeRiders: 0,
    topPerformers: 0,
    totalDeliveries: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [stores, setStores] = useState<any[]>([]);
  
  // Enhanced pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dense, setDense] = useState(false);
  const [companyRiderId, setCompanyRiderId] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [pendingStoreId, setPendingStoreId] = useState<string | null>(null);

  useEffect(() => {
    fetchRiders();
    fetchCompanies();
    fetchStores();
  }, []);

  console.log(companies, "companies----------------------")
  console.log(stores, "stores+++++++++++++++++")

  // Load all companies on mount
  useEffect(() => {
    axios.get("/api/companies")
      .then((res) => setCompanies(res.data))
      .catch((err) => console.error("Error loading companies:", err));
  }, []);

  // Load stores for selected company
  useEffect(() => {
    if (selectedCompany) {
      axios.get(`http://localhost:4003/api/stores?company_id=${selectedCompany}`)
        .then((res) => setStores(res.data))
        .catch((err) => console.error("Error loading stores:", err));
    } else {
      setStores([]); // Clear if no company selected
    }
  }, [selectedCompany]);

  // Set selectedStore from pendingStoreId after stores are loaded
  useEffect(() => {
    if (pendingStoreId && stores.some(store => store.id?.toString() === pendingStoreId)) {
      setSelectedStore(pendingStoreId);
      setPendingStoreId(null);
    }
  }, [stores, pendingStoreId]);

  useEffect(() => {
    filterRiders();
    setPage(0); // Reset to first page on filter/search change
  }, [riders, searchTerm, statusFilter, performanceFilter, vehicleFilter]);

  // Fetch riders from API (no dummy data)
  const fetchRiders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4003/api/riders');
      setRiders(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching riders:', error);
      setRiders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:4003/api/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  console.log(stores, "stores---------------------")

  const fetchStores = async () => {
    try {
      const response = await axios.get('http://localhost:4003/api/stores');
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const calculateStats = (ridersData: Rider[]) => {
    const totalRiders = ridersData.length;
    const activeRiders = ridersData.filter(rider => rider.status === 'Active').length;
    const topPerformers = ridersData.filter(rider => rider.performance_tier === 'high').length;
    const totalDeliveries = 2485; // This should come from API

    setStats({
      totalRiders,
      activeRiders,
      topPerformers,
      totalDeliveries
    });
  };

  const filterRiders = () => {
    let filtered = riders.filter(rider => {
      const matchesSearch = rider.rider_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rider.account_holder_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rider.emergency_contact?.includes(searchTerm);
      const matchesStatus = !statusFilter || rider.status === statusFilter;
      const matchesPerformance = !performanceFilter || rider.performance_tier === performanceFilter;
      const matchesVehicle = !vehicleFilter || rider.vehicle_type === vehicleFilter;
      return matchesSearch && matchesStatus && matchesPerformance && matchesVehicle;
    });
    setFilteredRiders(filtered);
  };

  // Enhanced pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDenseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  // Get paginated data
  const paginatedRiders = filteredRiders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleEdit = (rider: Rider) => {
    navigate(`/riders/edit/${rider.id}`);
  };

  const handleDelete = async (riderId: number) => {
    if (window.confirm('Are you sure you want to delete this rider?')) {
      try {
        await axios.delete(`http://localhost:4003/api/riders/${riderId}`);
        fetchRiders();
      } catch (error) {
        console.error('Error deleting rider:', error);
      }
    }
  };

  // When opening the assign dialog, fetch the latest assignment for the selected rider
  const handleAssign = async (rider: Rider) => {
    setSelectedRider(rider);
    try {
      const res = await axios.get(`http://localhost:4003/api/rider-assignments/by-rider/${rider.id}`);
      const assignment = Array.isArray(res.data) ? res.data[0] : res.data;
      if (assignment) {
        setSelectedCompany(assignment.company_id?.toString() || '');
        setPendingStoreId(assignment.store_id?.toString() || '');
        setCompanyRiderId(assignment.company_rider_id || '');
      } else {
        setSelectedCompany('');
        setPendingStoreId('');
        setCompanyRiderId('');
      }
      setAssignDialogOpen(true);
    } catch (err) {
      setSelectedCompany('');
      setPendingStoreId('');
      setCompanyRiderId('');
      setAssignDialogOpen(true);
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedRider || !selectedCompany || !selectedStore || !companyRiderId) return;
    try {
      await axios.post('http://localhost:4003/api/rider-assignments', {
        rider_id: selectedRider.id,
        company_id: selectedCompany,
        store_id: selectedStore,
        company_rider_id: companyRiderId
      });
      setAssignDialogOpen(false);
      setSelectedCompany('');
      setSelectedStore('');
      setSelectedRider(null);
      setCompanyRiderId('');
      setAssignSuccess('Rider assigned successfully!');
      setTimeout(() => setAssignSuccess(''), 3000);
    } catch (error) {
      console.error('Error assigning rider:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPerformanceFilter('');
    setVehicleFilter('');
  };

  const getPerformanceColor = (tier: string) => {
    switch (tier) {
      case 'high':
        return 'success';
      case 'medium':
        return 'warning';
      case 'low':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'success' : 'error';
  };

  if (showRegistrationForm) {
    return (
      <Box sx={{ p: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
            Add New Rider
          </Typography>
          <Button variant="outlined" onClick={() => setShowRegistrationForm(false)}>
            Back to List
          </Button>
        </Box>
        <RiderRegistrationForm />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center', 
        mb: 3,
        width: '100%',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          flex: 1,
          minWidth: 0,
          gap: 1,
        }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ color: '#1976d2', fontWeight: 'bold' }}
          >
            Rider Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage delivery riders, their profiles, documents, and assignments
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowRegistrationForm(true)}
          sx={{ px: 3, py: 1.5, flexShrink: 0 }}
        >
          ADD NEW RIDER
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats.totalRiders}
                  </Typography>
                  <Typography variant="body1">Total Riders</Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats.activeRiders}
                  </Typography>
                  <Typography variant="body1">Active Riders</Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats.topPerformers}
                  </Typography>
                  <Typography variant="body1">Top Performers</Typography>
                </Box>
                <StarIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats.totalDeliveries}
                  </Typography>
                  <Typography variant="body1">Total Deliveries</Typography>
                </Box>
                <BikeIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search riders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Performance</InputLabel>
                <Select
                  value={performanceFilter}
                  onChange={(e: SelectChangeEvent) => setPerformanceFilter(e.target.value)}
                  label="Performance"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Vehicle</InputLabel>
                <Select
                  value={vehicleFilter}
                  onChange={(e: SelectChangeEvent) => setVehicleFilter(e.target.value)}
                  label="Vehicle"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="2_wheeler">2 Wheeler</MenuItem>
                  <MenuItem value="4_wheeler">4 Wheeler</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={clearFilters}
                sx={{ mr: 1 }}
              >
                CLEAR FILTERS
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="div">
          Riders List ({filteredRiders.length} total)
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={dense}
              onChange={handleDenseChange}
              color="primary"
            />
          }
          label="Dense padding"
        />
      </Box>

      {/* Riders Table */}
      <Card sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer 
          component={Paper} 
          sx={{ 
            width: '100%',
            maxHeight: dense ? 400 : 600,
            overflow: 'auto'
          }}
        >
          <Table 
            stickyHeader
            size={dense ? 'small' : 'medium'}
            sx={{ 
              minWidth: 1200, // Ensure minimum width for proper layout
              width: '100%',
              tableLayout: 'fixed' // Fixed layout for consistent column widths
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '20%', minWidth: 200 }}>Rider</TableCell>
                <TableCell sx={{ width: '15%', minWidth: 150 }}>Contact</TableCell>
                <TableCell sx={{ width: '15%', minWidth: 120 }}>Vehicle</TableCell>
                <TableCell sx={{ width: '15%', minWidth: 120 }}>Performance</TableCell>
                <TableCell sx={{ width: '10%', minWidth: 100 }}>Status</TableCell>
                <TableCell sx={{ width: '15%', minWidth: 120 }}>Stats</TableCell>
                <TableCell sx={{ width: '10%', minWidth: 120 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRiders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No riders found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedRiders.map((rider) => (
                <TableRow key={rider.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: '#1976d2', width: dense ? 32 : 40, height: dense ? 32 : 40 }}>
                        {rider.account_holder_name?.charAt(0) || rider.rider_code.charAt(0)}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography 
                          variant={dense ? "body2" : "subtitle2"} 
                          fontWeight="bold"
                          noWrap
                          title={rider.account_holder_name || 'N/A'}
                        >
                          {rider.account_holder_name || 'N/A'}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="textSecondary"
                          noWrap
                          title={`${rider.rider_code} • ${rider.rider_id}`}
                        >
                          {rider.rider_code} • {rider.rider_id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant={dense ? "caption" : "body2"} noWrap>
                        📞 {rider.emergency_contact}
                      </Typography>
                      <Typography variant={dense ? "caption" : "body2"} noWrap>
                        ✉️ {rider.upi_id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BikeIcon sx={{ mr: 1, fontSize: dense ? 16 : 20 }} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant={dense ? "caption" : "body2"} noWrap>
                          {rider.vehicle_type}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" noWrap>
                          {rider.vehicle_number}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Chip
                        label={rider.performance_tier}
                        color={getPerformanceColor(rider.performance_tier) as any}
                        size="small"
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon sx={{ fontSize: 14, color: '#ffa726', mr: 0.5 }} />
                        <Typography variant="caption">4.6</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={rider.status}
                      color={getStatusColor(rider.status) as any}
                      size="small"
                      icon={rider.status === 'Active' ? <CheckCircleIcon /> : undefined}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant={dense ? "caption" : "body2"} fontWeight="bold">
                        1250 deliveries
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Since {new Date(rider.joining_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleAssign(rider)}
                        title="Assign"
                      >
                        <AssignmentIcon fontSize={dense ? "small" : "medium"} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(rider)}
                        title="Edit"
                      >
                        <EditIcon fontSize={dense ? "small" : "medium"} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(rider.id)}
                        color="error"
                        title="Delete"
                      >
                        <DeleteIcon fontSize={dense ? "small" : "medium"} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Enhanced Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={filteredRiders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
          showFirstButton
          showLastButton
          sx={{
            borderTop: '1px solid rgba(224, 224, 224, 1)',
            '& .MuiTablePagination-toolbar': {
              paddingLeft: 2,
              paddingRight: 2,
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              margin: 0,
            }
          }}
        />
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Rider to Company & Store</DialogTitle>
        <DialogContent>
          {assignSuccess && (
            <Typography color="success.main" sx={{ mb: 2 }}>{assignSuccess}</Typography>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Company</InputLabel>
              <Select
                value={selectedCompany}
                onChange={(e: SelectChangeEvent) => {
                  setSelectedCompany(e.target.value);
                  setSelectedStore(''); // Reset store when company changes
                }}
                label="Company"
              >
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company?.company_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!selectedCompany}>
              <InputLabel>Store</InputLabel>
              <Select
                value={selectedStore}
                onChange={(e: SelectChangeEvent) => setSelectedStore(e.target.value)}
                label="Store"
              >
                {/* Show available stores */}
                {stores.length > 0 ? (
                  stores.map((store) => (
                    <MenuItem key={store.id} value={store.id}>
                      {store?.store_name || "Unnamed Store"}
                    </MenuItem>
                  ))
                ) : (
                  // Show when no stores are available
                  <MenuItem disabled value="">
                    <em>No stores available</em>
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Company Rider ID"
              name="company_rider_id"
              variant="outlined"
              placeholder="Company Provided Rider Id"
              value={companyRiderId}
              onChange={e => setCompanyRiderId(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignSubmit} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RiderListingPage;