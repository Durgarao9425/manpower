import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Avatar,
  Grid,
  Container,
  Toolbar,
  AppBar
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
  Send as SendIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon,
  AttachMoney as AttachMoneyIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

const OrdersListingPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API call
  const mockData = [
    {
      id: 38,
      period: 'May 22 - May 31',
      amount: '₹0.00',
      status: 'pending',
      submitted: 'May 23, 2025',
      lastUpdated: 'May 23, 2025',
      rider: 'Angelique Morse',
      phone: '+46 8 123 456',
      company: 'Wuckert Inc',
      role: 'Content Creator'
    },
    {
      id: 39,
      period: 'May 15 - May 21',
      amount: '₹250.00',
      status: 'processing',
      submitted: 'May 22, 2025',
      lastUpdated: 'May 24, 2025',
      rider: 'Ariana Lang',
      phone: '+54 11 1234-5678',
      company: 'Feest Group',
      role: 'IT Administrator'
    },
    {
      id: 40,
      period: 'May 08 - May 14',
      amount: '₹180.50',
      status: 'completed',
      submitted: 'May 15, 2025',
      lastUpdated: 'May 16, 2025',
      rider: 'Aspen Schmitt',
      phone: '+91 98765 43210',
      company: 'Wilson Automotive',
      role: 'Sales Executive'
    },
    {
      id: 41,
      period: 'May 01 - May 07',
      amount: '₹320.75',
      status: 'rejected',
      submitted: 'May 08, 2025',
      lastUpdated: 'May 09, 2025',
      rider: 'John Doe',
      phone: '+1 555 123 4567',
      company: 'Tech Solutions',
      role: 'Developer'
    }
  ];

  const tabs = [
    { label: 'All', value: 'all', count: 20 },
    { label: 'Pending', value: 'pending', count: 10 },
    { label: 'Processing', value: 'processing', count: 2 },
    { label: 'Completed', value: 'completed', count: 6 },
    { label: 'Rejected', value: 'rejected', count: 2 }
  ];

  const cardData = [
    { title: 'Total Orders', value: '0', icon: <AssignmentIcon />, color: '#1976d2' },
    { title: 'Total Riders', value: '0', icon: <PersonIcon />, color: '#388e3c' },
    { title: 'Total KMs', value: '0.00', icon: <DirectionsCarIcon />, color: '#f57c00' },
    { title: 'Total Amount', value: '₹0.00', icon: <AttachMoneyIcon />, color: '#d32f2f' }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Replace with actual API call
        // const response = await fetch('http://localhost:4003/api/orders/daily-uploads');
        // const data = await response.json();
        
        // Using mock data for now
        setTimeout(() => {
          setOrders(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'completed': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.rider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.period.toLowerCase().includes(searchTerm.toLowerCase());
    
    const currentTab = tabs[selectedTab].value;
    const matchesTab = currentTab === 'all' || order.status === currentTab;
    
    return matchesSearch && matchesTab;
  });

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedOrders(filteredOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedOrders.length > 0) {
      setOrders(prev => prev.filter(order => !selectedOrders.includes(order.id)));
      setSelectedOrders([]);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cardData.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              height: '100%',
              background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}25 100%)`,
              border: `1px solid ${card.color}40`
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" fontWeight="bold" color={card.color}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {card.title}
                  </Typography>
                </Box>
                <Box sx={{ color: card.color, opacity: 0.7 }}>
                  {React.cloneElement(card.icon, { fontSize: 'large' })}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
            {tabs.map((tab, index) => (
              <Tab 
                key={index}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.label}
                    <Chip 
                      label={tab.count} 
                      size="small" 
                      color={index === 0 ? 'default' : 
                             tab.value === 'pending' ? 'warning' :
                             tab.value === 'processing' ? 'info' :
                             tab.value === 'completed' ? 'success' : 'error'} 
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* Search and Actions */}
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedOrders.length > 0 && (
              <IconButton 
                color="error" 
                onClick={handleDeleteSelected}
                sx={{ 
                  backgroundColor: 'error.light',
                  color: 'error.contrastText',
                  '&:hover': { backgroundColor: 'error.main' }
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}
            <TextField
              placeholder="Search..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
          </Box>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedOrders.length > 0 && selectedOrders.length < filteredOrders.length}
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>PERIOD</strong></TableCell>
                <TableCell><strong>AMOUNT</strong></TableCell>
                <TableCell><strong>STATUS</strong></TableCell>
                <TableCell><strong>SUBMITTED</strong></TableCell>
                <TableCell><strong>LAST UPDATED</strong></TableCell>
                <TableCell><strong>ACTIONS</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography>Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No orders found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                      />
                    </TableCell>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.period}</TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status.toUpperCase()} 
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{order.submitted}</TableCell>
                    <TableCell>{order.lastUpdated}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" color="primary">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="info">
                          <AssessmentIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="success">
                          <SendIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="secondary">
                          <GetAppIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default OrdersListingPage;