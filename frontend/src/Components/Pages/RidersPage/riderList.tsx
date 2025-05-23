import React, { useState } from 'react';
import { 
  Add as PlusIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVerticalIcon,
  Phone as PhoneIcon,
  Email as MailIcon,
  LocationOn as MapPinIcon,
  Star as StarIcon,
  LocalShipping as TruckIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Avatar
} from '@mui/material';

const RiderListingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dummy data for riders
  const riders = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 234 567 8901",
      status: "active",
      rating: 4.8,
      totalDeliveries: 156,
      location: "New York, NY",
      joinDate: "2024-01-15",
      vehicleType: "Motorcycle",
      lastActive: "2 hours ago"
    },
    {
      id: 2,
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com",
      phone: "+1 234 567 8902",
      status: "active",
      rating: 4.9,
      totalDeliveries: 243,
      location: "Los Angeles, CA",
      joinDate: "2023-11-20",
      vehicleType: "Car",
      lastActive: "5 minutes ago"
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@email.com",
      phone: "+1 234 567 8903",
      status: "inactive",
      rating: 4.6,
      totalDeliveries: 89,
      location: "Chicago, IL",
      joinDate: "2024-02-10",
      vehicleType: "Bicycle",
      lastActive: "2 days ago"
    },
    {
      id: 4,
      name: "Emily Chen",
      email: "emily.chen@email.com",
      phone: "+1 234 567 8904",
      status: "active",
      rating: 4.7,
      totalDeliveries: 201,
      location: "San Francisco, CA",
      joinDate: "2023-12-05",
      vehicleType: "Motorcycle",
      lastActive: "1 hour ago"
    },
    {
      id: 5,
      name: "David Brown",
      email: "david.brown@email.com",
      phone: "+1 234 567 8905",
      status: "pending",
      rating: 0,
      totalDeliveries: 0,
      location: "Miami, FL",
      joinDate: "2024-05-20",
      vehicleType: "Car",
      lastActive: "Never"
    }
  ];

  const filteredRiders = riders.filter(rider => {
    const matchesSearch = rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rider.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rider.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusChip = (status) => {
    const statusStyles = {
      active: { bgcolor: 'success.light', color: 'success.dark' },
      inactive: { bgcolor: 'grey.100', color: 'grey.800' },
      pending: { bgcolor: 'warning.light', color: 'warning.dark' }
    };
    
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        sx={statusStyles[status]}
        size="small"
      />
    );
  };

  const totalActiveRiders = riders.filter(r => r.status === 'active').length;
  const totalRiders = riders.length;
  const avgRating = (riders.filter(r => r.rating > 0).reduce((sum, r) => sum + r.rating, 0) / 
                    riders.filter(r => r.rating > 0).length);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
                Riders Management
              </Typography>
              <Typography variant="body1" color="text.secondary" mt={1}>
                Manage and monitor all delivery riders
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<PlusIcon />}
              sx={{ px: 3, py: 1.5, fontWeight: 'medium' }}
            >
              Add Rider
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', mr: 2 }}>
                    <TruckIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Riders</Typography>
                    <Typography variant="h5" fontWeight="bold">{totalRiders}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', mr: 2 }}>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      bgcolor: 'success.main',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Box sx={{ 
                        width: 4, 
                        height: 4, 
                        bgcolor: 'common.white',
                        borderRadius: '50%'
                      }} />
                    </Box>
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Active Riders</Typography>
                    <Typography variant="h5" fontWeight="bold">{totalActiveRiders}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main', mr: 2 }}>
                    <StarIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Average Rating</Typography>
                    <Typography variant="h5" fontWeight="bold">{avgRating.toFixed(1)}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main', mr: 2 }}>
                    <MapPinIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Deliveries</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {riders.reduce((sum, r) => sum + (r.totalDeliveries || 0), 0)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2 
            }}>
              <TextField
                fullWidth
                placeholder="Search riders by name, email, or location..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flex: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
                <Button 
                  variant="outlined" 
                  startIcon={<FilterIcon />}
                >
                  More Filters
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Riders Table */}
        <Card>
          <CardContent sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 2 }}>
            <Typography variant="h6" component="h2" fontWeight="medium">
              Riders List ({filteredRiders.length})
            </Typography>
          </CardContent>
          
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell>Rider</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Deliveries</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Last Active</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRiders.map((rider) => (
                  <TableRow 
                    key={rider.id} 
                    hover 
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.main',
                            color: 'common.white',
                            mr: 2
                          }}
                        >
                          {rider.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight="medium">{rider.name}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <MapPinIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            {rider.location}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          <MailIcon sx={{ fontSize: 14, mr: 1 }} />
                          {rider.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ fontSize: 14, mr: 1 }} />
                          {rider.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(rider.status)}
                    </TableCell>
                    <TableCell>
                      {rider.rating > 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarIcon sx={{ color: 'warning.main', fontSize: 16 }} />
                          <Typography fontWeight="medium">{rider.rating}</Typography>
                        </Box>
                      ) : (
                        <Typography color="text.disabled">No rating</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">{rider.totalDeliveries || 0}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{rider.vehicleType}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{rider.lastActive}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton>
                        <MoreVerticalIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredRiders.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Box sx={{ color: 'text.disabled', mb: 2 }}>
                <SearchIcon sx={{ fontSize: 48 }} />
              </Box>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                No riders found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
            </Box>
          )}
        </Card>
      </Container>
    </Box>
  );
};

export default RiderListingPage;