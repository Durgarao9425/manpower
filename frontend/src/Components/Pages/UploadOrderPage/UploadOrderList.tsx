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
  Grid,
  Container,
  TablePagination,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OrderForm from './OrderForm';
import OrderView from './OrderView';

interface OrderStatement {
  id: number;
  company_id: string;
  payment_date: string;
  start_date: string;
  end_date: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  file_path: string;
  notes: string;
  mapping_status: string;
  period?: string;
  submitted?: string;
  lastUpdated?: string;
  rider?: string;
  phone?: string;
  company?: string;
  role?: string;
}

interface Company {
  id: string;
  name: string;
}

const OrdersList = () => {
  const [orders, setOrders] = useState<OrderStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [currentComponent, setCurrentComponent] = useState<string>('OrdersList');
  const navigate = useNavigate();

  // Mock data - replace with actual API calls
  const mockOrders: OrderStatement[] = [
    {
      id: 38,
      company_id: '1',
      payment_date: '2025-05-23',
      start_date: '2025-05-22',
      end_date: '2025-05-31',
      amount: 0.00,
      status: 'pending',
      file_path: '/uploads/order_38.xlsx',
      notes: 'Initial upload for May period',
      mapping_status: 'mapped',
      period: 'May 22 - May 31',
      submitted: 'May 23, 2025',
      lastUpdated: 'May 23, 2025',
      rider: 'Angelique Morse',
      phone: '+46 8 123 456',
      company: 'Big Basket',
      role: 'Content Creator'
    },
    // ... other mock orders
  ];

  const tabs = [
    { label: 'All', value: 'all', count: orders.length },
    { label: 'Pending', value: 'pending', count: orders.filter(o => o.status === 'pending').length },
    { label: 'Processing', value: 'processing', count: orders.filter(o => o.status === 'processing').length },
    { label: 'Completed', value: 'completed', count: orders.filter(o => o.status === 'completed').length },
    { label: 'Rejected', value: 'rejected', count: orders.filter(o => o.status === 'rejected').length }
  ];

  const cardData = [
    { title: 'Total Orders', value: orders.length.toString(), icon: 'assignment', color: '#1976d2' },
    { title: 'Total Riders', value: '0', icon: 'person', color: '#388e3c' },
    { title: 'Total KMs', value: '0.00', icon: 'directions_car', color: '#f57c00' },
    { title: 'Total Amount', value: `₹${orders.reduce((sum, order) => sum + order.amount, 0).toFixed(2)}`, icon: 'attach_money', color: '#d32f2f' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await axios.get('/api/orders/weekly-orders');
      // setOrders(response.data);
      
      setTimeout(() => {
        setOrders(mockOrders);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (orderId: number) => {
    if (window.confirm('Are you sure you want to delete this order statement?')) {
      try {
        // Replace with actual API call
        // await axios.delete(`/orders/weekly-orders/${orderId}`);
        
        setOrders(prev => prev.filter(order => order.id !== orderId));
      } catch (error) {
        console.error('Error deleting order statement:', error);
      }
    }
  };

  const handleDownload = async (order: OrderStatement) => {
    try {
      // Replace with actual API call
      const link = document.createElement('a');
      link.href = order.file_path;
      link.download = `order_statement_${order.id}.xlsx`;
      link.click();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'completed': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.rider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.period?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const currentTab = tabs[selectedTab].value;
    const matchesTab = currentTab === 'all' || order.status === currentTab;
    
    const matchesStartDate = !startDateFilter || new Date(order.start_date) >= new Date(startDateFilter);
    const matchesEndDate = !endDateFilter || new Date(order.end_date) <= new Date(endDateFilter);
    
    return matchesSearch && matchesTab && matchesStartDate && matchesEndDate;
  });

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedOrders(filteredOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedOrders.length > 0 && window.confirm(`Are you sure you want to delete ${selectedOrders.length} order statements?`)) {
      setOrders(prev => prev.filter(order => !selectedOrders.includes(order.id)));
      setSelectedOrders([]);
    }
  };

  const paginatedOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {currentComponent === 'OrdersList' && (
        <>
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
                    </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
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

            <Box sx={{ p: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setCurrentComponent('OrderForm')}
                      sx={{ minWidth: 120 }}
                    >
                      Add
                    </Button>
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
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Start Date"
                      type="date"
                      size="small"
                      value={startDateFilter}
                      onChange={(e) => setStartDateFilter(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="End Date"
                      type="date"
                      size="small"
                      value={endDateFilter}
                      onChange={(e) => setEndDateFilter(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>

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
                    <TableCell><strong>COMPANY</strong></TableCell>
                    <TableCell><strong>PERIOD</strong></TableCell>
                    <TableCell><strong>AMOUNT</strong></TableCell>
                    <TableCell><strong>STATUS</strong></TableCell>
                    <TableCell><strong>SUBMITTED</strong></TableCell>
                    <TableCell><strong>ACTIONS</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No orders found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOrders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => handleSelectOrder(order.id)}
                          />
                        </TableCell>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.company}</TableCell>
                        <TableCell>{order.period}</TableCell>
                        <TableCell>₹{order.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={order.status.toUpperCase()} 
                            color={getStatusColor(order.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{order.submitted}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View">
                              <IconButton size="small" color="primary" onClick={() => setCurrentComponent('OrderView')}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton size="small" color="warning" onClick={() => setCurrentComponent('OrderFormEdit')}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download">
                              <IconButton size="small" color="success" onClick={() => handleDownload(order)}>
                                <GetAppIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => handleDelete(order.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 2 }}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20, 50, 100]}
                component="div"
                count={filteredOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Rows per page:"
                showFirstButton
                showLastButton
              />
            </Box>
          </Paper>
        </>
      )}
      {currentComponent === 'OrderForm' && (
        <OrderForm setCurrentComponent={setCurrentComponent} />
      )}
      {currentComponent === 'OrderView' && (
        <OrderView setCurrentComponent={setCurrentComponent} />
      )}
      {currentComponent === 'OrderFormEdit' && (
        <OrderForm isEditing={true} setCurrentComponent={setCurrentComponent} />
      )}
    </Container>
  );
};

export default OrdersList;