import React, { useState, useEffect } from 'react';
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
  Pagination
} from '@mui/material';
  // Pagination state

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
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [stores, setStores] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  useEffect(() => {
    fetchRiders();
    fetchCompanies();
    fetchStores();
  }, []);

  useEffect(() => {
    filterRiders();
    setPage(1); // Reset to first page on filter/search change
  }, [riders, searchTerm, statusFilter, performanceFilter, vehicleFilter]);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4003/api/riders');
      setRiders(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching riders:', error);
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

  console.log(stores,"stores---------------------")

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

  // Pagination logic
  const paginatedRiders = filteredRiders.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  console.log(paginatedRiders,"paginatedRiders")

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

  const handleAssign = (rider: Rider) => {
    setSelectedRider(rider);
    setAssignDialogOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedRider || !selectedCompany || !selectedStore) return;

    try {
      await axios.post('http://localhost:4003/api/rider-assignments', {
        rider_id: selectedRider.id,
        company_id: selectedCompany,
        store_id: selectedStore
      });
      
      setAssignDialogOpen(false);
      setSelectedCompany('');
      setSelectedStore('');
      setSelectedRider(null);
      // Show success message
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
            Rider Management
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Manage delivery riders, their profiles, documents, and assignments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/riders/create')}
          sx={{ px: 3, py: 1.5 }}
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

      {/* Riders Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rider</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Performance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Stats</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRiders.map((rider) => (
                <TableRow key={rider.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: '#1976d2' }}>
                        {rider.account_holder_name?.charAt(0) || rider.rider_code.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {rider.account_holder_name || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {rider.rider_code} • {rider.rider_id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">📞 {rider.emergency_contact}</Typography>
                      <Typography variant="body2">✉️ {rider.upi_id}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BikeIcon sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2">{rider.vehicle_type}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {rider.vehicle_number}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        label={rider.performance_tier}
                        color={getPerformanceColor(rider.performance_tier) as any}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon sx={{ fontSize: 16, color: '#ffa726', mr: 0.5 }} />
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
                      <Typography variant="body2" fontWeight="bold">1250 deliveries</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Since {new Date(rider.joining_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleAssign(rider)}
                        sx={{ mr: 1 }}
                      >
                        <AssignmentIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(rider)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(rider.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Pagination Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
          <Pagination
            count={Math.ceil(filteredRiders.length / rowsPerPage)}
            page={page}
            onChange={(_e, value) => setPage(value)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </Box>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Rider to Company & Store</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Company</InputLabel>
              <Select
                value={selectedCompany}
                onChange={(e: SelectChangeEvent) => setSelectedCompany(e.target.value)}
                label="Company"
              >
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Store</InputLabel>
              <Select
                value={selectedStore}
                onChange={(e: SelectChangeEvent) => setSelectedStore(e.target.value)}
                label="Store"
              >
                {stores.map((store) => (
                  <MenuItem key={store.id} value={store.id}>
                    {store.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignSubmit} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RiderListingPage;