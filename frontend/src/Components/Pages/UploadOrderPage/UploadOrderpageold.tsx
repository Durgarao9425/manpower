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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Input,
  TextareaAutosize,
  Divider,
  Stack,
  Tooltip,
  Alert,
  CircularProgress
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
  Assignment as AssignmentIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import axios from 'axios';

// Types
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
  // Display fields
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

const OrdersListingPage = () => {
  const [orders, setOrders] = useState<OrderStatement[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderStatement | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    company_id: '',
    start_date: '',
    end_date: '',
    amount: 0,
    notes: '',
    file: null as File | null
  });

  // Mock companies data
  const mockCompanies: Company[] = [
    { id: '1', name: 'Big Basket' },
    { id: '2', name: 'Wuckert Inc' },
    { id: '3', name: 'Feest Group' },
    { id: '4', name: 'Wilson Automotive' },
    { id: '5', name: 'Tech Solutions' }
  ];

  // Mock orders data with backend structure
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
    {
      id: 39,
      company_id: '2',
      payment_date: '2025-05-22',
      start_date: '2025-05-15',
      end_date: '2025-05-21',
      amount: 250.00,
      status: 'processing',
      file_path: '/uploads/order_39.xlsx',
      notes: 'Weekly processing batch',
      mapping_status: 'processing',
      period: 'May 15 - May 21',
      submitted: 'May 22, 2025',
      lastUpdated: 'May 24, 2025',
      rider: 'Ariana Lang',
      phone: '+54 11 1234-5678',
      company: 'Wuckert Inc',
      role: 'IT Administrator'
    },
    {
      id: 40,
      company_id: '3',
      payment_date: '2025-05-15',
      start_date: '2025-05-08',
      end_date: '2025-05-14',
      amount: 180.50,
      status: 'completed',
      file_path: '/uploads/order_40.xlsx',
      notes: 'Completed successfully',
      mapping_status: 'completed',
      period: 'May 08 - May 14',
      submitted: 'May 15, 2025',
      lastUpdated: 'May 16, 2025',
      rider: 'Aspen Schmitt',
      phone: '+91 98765 43210',
      company: 'Wilson Automotive',
      role: 'Sales Executive'
    },
    {
      id: 41,
      company_id: '4',
      payment_date: '2025-05-08',
      start_date: '2025-05-01',
      end_date: '2025-05-07',
      amount: 320.75,
      status: 'rejected',
      file_path: '/uploads/order_41.xlsx',
      notes: 'Rejected due to data inconsistency',
      mapping_status: 'failed',
      period: 'May 01 - May 07',
      submitted: 'May 08, 2025',
      lastUpdated: 'May 09, 2025',
      rider: 'John Doe',
      phone: '+1 555 123 4567',
      company: 'Tech Solutions',
      role: 'Developer'
    }
  ];

  // Dynamic tabs based on actual order counts
  const tabs = [
    { label: 'All', value: 'all', count: orders.length },
    { label: 'Pending', value: 'pending', count: orders.filter(o => o.status === 'pending').length },
    { label: 'Processing', value: 'processing', count: orders.filter(o => o.status === 'processing').length },
    { label: 'Completed', value: 'completed', count: orders.filter(o => o.status === 'completed').length },
    { label: 'Rejected', value: 'rejected', count: orders.filter(o => o.status === 'rejected').length }
  ];

  const cardData = [
    { title: 'Total Orders', value: orders.length.toString(), icon: <AssignmentIcon />, color: '#1976d2' },
    { title: 'Total Riders', value: '0', icon: <PersonIcon />, color: '#388e3c' },
    { title: 'Total KMs', value: '0.00', icon: <DirectionsCarIcon />, color: '#f57c00' },
    { title: 'Total Amount', value: `₹${orders.reduce((sum, order) => sum + order.amount, 0).toFixed(2)}`, icon: <AttachMoneyIcon />, color: '#d32f2f' }
  ];

  useEffect(() => {
    fetchOrders();
    fetchCompanies();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await axios.get('/api/orders/weekly-orders');
      // setOrders(response.data);
      
      // Using mock data for now
      setTimeout(() => {
        setOrders(mockOrders);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      // Replace with actual API call
      // const response = await axios.get('/api/companies');
      // setCompanies(response.data);
      
      // Using mock data for now
      setCompanies(mockCompanies);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleUpload = async () => {
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('company_id', formData.company_id);
      uploadFormData.append('start_date', formData.start_date);
      uploadFormData.append('end_date', formData.end_date);
      uploadFormData.append('amount', formData.amount.toString());
      uploadFormData.append('notes', formData.notes);
      if (formData.file) {
        uploadFormData.append('file', formData.file);
      }

      // Replace with actual API call
      // const response = await axios.post('/orders/weekly-orders', uploadFormData);
      
      // Mock success response
      console.log('Upload data:', Object.fromEntries(uploadFormData));
      alert('Order statement uploaded successfully!');
      
      setUploadModalOpen(false);
      resetForm();
      fetchOrders();
    } catch (error) {
      console.error('Error uploading order statement:', error);
      alert('Error uploading order statement');
    }
  };

  const handleEdit = async () => {
    if (!selectedOrder) return;
    
    try {
      const updateData = {
        company_id: formData.company_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        amount: formData.amount,
        notes: formData.notes
      };

      // Replace with actual API call
      // const response = await axios.put(`/orders/weekly-orders/${selectedOrder.id}`, updateData);
      
      // Mock success response
      console.log('Update data:', updateData);
      alert('Order statement updated successfully!');
      
      setEditModalOpen(false);
      resetForm();
      fetchOrders();
    } catch (error) {
      console.error('Error updating order statement:', error);
      alert('Error updating order statement');
    }
  };

  const handleDelete = async (orderId: number) => {
    if (window.confirm('Are you sure you want to delete this order statement?')) {
      try {
        // Replace with actual API call
        // await axios.delete(`/orders/weekly-orders/${orderId}`);
        
        // Mock delete
        setOrders(prev => prev.filter(order => order.id !== orderId));
        alert('Order statement deleted successfully!');
      } catch (error) {
        console.error('Error deleting order statement:', error);
        alert('Error deleting order statement');
      }
    }
  };

  const handleDownload = async (order: OrderStatement) => {
    try {
      // Replace with actual API call
      // const response = await axios.get(`/orders/download/${order.id}`, { responseType: 'blob' });
      
      // Mock download
      const link = document.createElement('a');
      link.href = '#'; // Replace with actual file URL
      link.download = `order_statement_${order.id}.xlsx`;
      link.click();
      
      console.log('Downloading file:', order.file_path);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file');
    }
  };

  const resetForm = () => {
    setFormData({
      company_id: '',
      start_date: '',
      end_date: '',
      amount: 0,
      notes: '',
      file: null
    });
    setIsEditing(false);
    setSelectedOrder(null);
  };

  const openEditModal = (order: OrderStatement) => {
    setSelectedOrder(order);
    setFormData({
      company_id: order.company_id,
      start_date: order.start_date,
      end_date: order.end_date,
      amount: order.amount,
      notes: order.notes,
      file: null
    });
    setIsEditing(true);
    setEditModalOpen(true);
  };

  const openViewModal = (order: OrderStatement) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
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
    
    const matchesStartDate = !startDateFilter || order.start_date >= startDateFilter;
    const matchesEndDate = !endDateFilter || order.end_date <= endDateFilter;
    
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

        {/* Search, Filters and Actions */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setUploadModalOpen(true)}
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
                          <IconButton size="small" color="primary" onClick={() => openViewModal(order)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="warning" onClick={() => openEditModal(order)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton size="small" color="success" onClick={() => handleDownload(order)}>
                            <DownloadIcon fontSize="small" />
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
        
        {/* Pagination */}
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

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Upload Order Statement
          <IconButton onClick={() => setUploadModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Company</InputLabel>
                  <Select
                    value={formData.company_id}
                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                    label="Company"
                  >
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Select the company this payment statement belongs to.
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Total Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center' }}>
                  <Input
                    type="file"
                    inputProps={{ accept: '.xlsx,.xls,.csv' }}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      const file = target.files?.[0] || null;
                      setFormData({ ...formData, file });
                    }}
                    sx={{ display: 'none' }}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mb: 2 }}
                    >
                      Choose File
                    </Button>
                  </label>
                  <Typography variant="body2" color="text.secondary">
                    {formData.file ? formData.file.name : 'No file chosen'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Upload your company's order details for the selected period.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setUploadModalOpen(false)}>
            Close
          </Button>
          <Button variant="contained" onClick={handleUpload} startIcon={<UploadIcon />}>
            Upload Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Order Statement
          <IconButton onClick={() => setEditModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Company</InputLabel>
                  <Select
                    value={formData.company_id}
                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                    label="Company"
                  >
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Total Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleEdit} startIcon={<EditIcon />}>
            Update Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Order Statement Details
          <IconButton onClick={() => setViewModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                {/* Order Information Card */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssignmentIcon color="primary" />
                        Order Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Order ID</Typography>
                          <Typography variant="body1" fontWeight="bold">#{selectedOrder.id}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Company</Typography>
                          <Typography variant="body1">{selectedOrder.company}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Period</Typography>
                          <Typography variant="body1">{selectedOrder.period}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                          <Typography variant="h6" color="primary">₹{selectedOrder.amount.toFixed(2)}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                          <Chip 
                            label={selectedOrder.status.toUpperCase()} 
                            color={getStatusColor(selectedOrder.status) as any}
                            size="small"
                          />
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Timeline Card */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssessmentIcon color="secondary" />
                        Timeline
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Submitted Date</Typography>
                          <Typography variant="body1">{selectedOrder.submitted}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                          <Typography variant="body1">{selectedOrder.lastUpdated}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Payment Date</Typography>
                          <Typography variant="body1">{new Date(selectedOrder.payment_date).toLocaleDateString()}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Mapping Status</Typography>
                          <Chip 
                            label={selectedOrder.mapping_status.toUpperCase()} 
                            color={selectedOrder.mapping_status === 'completed' ? 'success' : 
                                   selectedOrder.mapping_status === 'processing' ? 'info' : 
                                   selectedOrder.mapping_status === 'failed' ? 'error' : 'default'}
                            size="small"
                          />
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Rider Information Card */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="success" />
                        Rider Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Rider Name</Typography>
                          <Typography variant="body1">{selectedOrder.rider}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Phone Number</Typography>
                          <Typography variant="body1">{selectedOrder.phone}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Role</Typography>
                          <Typography variant="body1">{selectedOrder.role}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* File & Notes Card */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GetAppIcon color="info" />
                        Documents & Notes
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Uploaded Document</Typography>
                          <Box sx={{ mt: 1 }}>
                            <Button
                              variant="outlined"
                              startIcon={<DownloadIcon />}
                              onClick={() => handleDownload(selectedOrder)}
                              size="small"
                            >
                              Download Excel File
                            </Button>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            File: order_statement_{selectedOrder.id}.xlsx
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                          <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
                            <Typography variant="body2">
                              {selectedOrder.notes || 'No notes available'}
                            </Typography>
                          </Paper>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Status History Card (Full Width) */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Status History
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ pl: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: getStatusColor(selectedOrder.status) === 'success' ? 'success.main' : 
                                     getStatusColor(selectedOrder.status) === 'warning' ? 'warning.main' :
                                     getStatusColor(selectedOrder.status) === 'info' ? 'info.main' : 'error.main',
                            mr: 2 
                          }} />
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {selectedOrder.status.toUpperCase()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {selectedOrder.lastUpdated}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, opacity: 0.7 }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: 'grey.400',
                            mr: 2 
                          }} />
                          <Box>
                            <Typography variant="body2">
                              SUBMITTED
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {selectedOrder.submitted}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => selectedOrder && openEditModal(selectedOrder)}
            startIcon={<EditIcon />}
          >
            Edit Order
          </Button>
          <Button 
            variant="contained" 
            onClick={() => selectedOrder && handleDownload(selectedOrder)}
            startIcon={<DownloadIcon />}
          >
            Download File
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrdersListingPage;