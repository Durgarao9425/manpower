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
  CircularProgress,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon,
  AttachMoney as AttachMoneyIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import OrderFormModal from './OrderForm';
import OrderViewModal from './OrderView';
import apiService from '../../../services/apiService';
import { useNavigate } from 'react-router-dom';

// Updated Types based on actual API response
export interface OrderStatement {
  id: number;
  company_id: number;
  week_number: number;
  year: number;
  total_amount: string; // API returns string
  payment_date?: string;
  start_date?: string;
  end_date?: string;
  status?: 'pending' | 'processing' | 'completed' | 'rejected';
  file_path?: string;
  notes?: string;
  mapping_status?: 'pending' | 'processing' | 'completed' | 'rejected';
  created_at?: string;
  updated_at?: string;
  // Display fields (computed)
  period?: string;
  submitted?: string;
  lastUpdated?: string;
  rider?: string;
  phone?: string;
  company?: string;
  role?: string;
  amount?: number; // Computed from total_amount
}

export interface Company {
  id: string;
  name: string;
}

const OrdersList = () => {
  const navigate = useNavigate();

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
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderStatement | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // New modal states for mapping status
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [mappingStatus, setMappingStatus] = useState<'pending' | 'processing' | 'completed' | 'rejected'>('pending');
  const [updatingMapping, setUpdatingMapping] = useState(false);

  // Helper function to convert string amount to number
  const parseAmount = (amount: string | number): number => {
    if (typeof amount === 'number') return amount;
    const parsed = parseFloat(amount || '0');
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper function to format week period
  const getWeekPeriod = (weekNumber: number, year: number): string => {
    if (!weekNumber || !year) return 'N/A';
    return `Week ${weekNumber}, ${year}`;
  };

  // Helper function to get company name by ID
  const getCompanyName = (companyId: number): string => {
    const company = companies.find(c => c.id === companyId.toString());
    return company?.name || `Company ${companyId}`;
  };

  // Transform raw orders data for display
  const transformOrders = (rawOrders: any[]): OrderStatement[] => {
    return rawOrders.map(order => ({
      ...order,
      amount: parseAmount(order.total_amount),
      period: getWeekPeriod(order.week_number, order.year),
      company: getCompanyName(order.company_id),
      status: order.status || 'pending',
      mapping_status: order.mapping_status || 'pending',
      submitted: order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A',
      lastUpdated: order.updated_at ? new Date(order.updated_at).toLocaleDateString() : 'N/A'
    }));
  };

  // Dynamic tabs based on actual order counts
  const processedOrders = transformOrders(orders);
  const tabs = [
    { label: 'All', value: 'all', count: processedOrders.length },
    { label: 'Pending', value: 'pending', count: processedOrders.filter(o => o.status === 'pending').length },
    { label: 'Processing', value: 'processing', count: processedOrders.filter(o => o.status === 'processing').length },
    { label: 'Completed', value: 'completed', count: processedOrders.filter(o => o.status === 'completed').length },
    { label: 'Rejected', value: 'rejected', count: processedOrders.filter(o => o.status === 'rejected').length }
  ];

  // Calculate total amount safely
  const totalAmount = processedOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

  const cardData = [
    { title: 'Total Orders', value: processedOrders.length.toString(), icon: <AssignmentIcon />, color: '#1976d2' },
    { title: 'Total Riders', value: '0', icon: <PersonIcon />, color: '#388e3c' },
    { title: 'Total KMs', value: '0.00', icon: <DirectionsCarIcon />, color: '#f57c00' },
    { title: 'Total Amount', value: `₹${totalAmount.toFixed(2)}`, icon: <AttachMoneyIcon />, color: '#d32f2f' }
  ];

  useEffect(() => {
    fetchOrders();
    fetchCompanies();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/company_payments');
      console.log(response, "response");
      
      // Handle different response structures
      let ordersData = [];
      if (Array.isArray(response)) {
        ordersData = response;
      } else if (response && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response) {
        ordersData = [response];
      }
      
      setOrders(ordersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await apiService.get('/companies');
      if (!Array.isArray(data)) throw new Error('Malformed companies response');
      const transformedData = data.map((company: any) => ({
        id: company.id,
        name: company.company_name
      }));
      setCompanies(transformedData);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    }
  };

  // Modified edit function to open mapping status modal
  const openEditModal = (order: OrderStatement) => {
    setSelectedOrder(order);
    setMappingStatus(order.mapping_status || 'pending');
    setMappingModalOpen(true);
  };

  // Handle mapping status update
  const handleMappingStatusUpdate = async () => {
    if (!selectedOrder) return;
    
    setUpdatingMapping(true);
    try {
      const updateData = {
        mapping_status: mappingStatus
      };
      
      await apiService.put(`/company_payments/${selectedOrder.id}`, updateData);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, mapping_status: mappingStatus }
          : order
      ));
      
      setMappingModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating mapping status:', error);
      alert('Error updating mapping status. Please try again.');
    } finally {
      setUpdatingMapping(false);
    }
  };

  const openViewModal = (order: OrderStatement) => {
    navigate(`/weekly-order-view?uploadId=${order.id}`);
  };

  const openAddModal = () => {
    setSelectedOrder(null);
    setFormModalOpen(true);
  };

  // Modified delete functions
  const handleDeleteSelected = () => {
    if (selectedOrders.length === 0) return;
    setDeleteModalOpen(true);
  };

  const handleDeleteSingle = (orderId: number) => {
    setSelectedOrders([orderId]);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete all selected orders
      for (const orderId of selectedOrders) {
        await apiService.delete(`/company_payments/${orderId}`);
      }
      
      // Update local state
      setOrders(prev => prev.filter(order => !selectedOrders.includes(order.id)));
      setSelectedOrders([]);
      setDeleteModalOpen(false);
      
      alert(`${selectedOrders.length} order(s) deleted successfully!`);
    } catch (error) {
      console.error('Error deleting orders:', error);
      alert('Error deleting orders. Please try again.');
      setDeleteModalOpen(false);
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

  const filteredOrders = processedOrders.filter(order => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      order.company?.toLowerCase().includes(searchLower) ||
      order.period?.toLowerCase().includes(searchLower) ||
      order.id.toString().includes(searchLower) ||
      order.status?.toLowerCase().includes(searchLower);
    
    // Tab filter
    const currentTab = tabs[selectedTab].value;
    const matchesTab = currentTab === 'all' || order.status === currentTab;
    
    // Date filters - using created_at or year/week_number for filtering
    let matchesStartDate = true;
    let matchesEndDate = true;
    
    if (startDateFilter || endDateFilter) {
      // If we have actual dates
      if (order.created_at) {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        matchesStartDate = !startDateFilter || orderDate >= startDateFilter;
        matchesEndDate = !endDateFilter || orderDate <= endDateFilter;
      } else {
        // Fallback to year-based filtering
        const orderYear = order.year;
        const startYear = startDateFilter ? new Date(startDateFilter).getFullYear() : null;
        const endYear = endDateFilter ? new Date(endDateFilter).getFullYear() : null;
        
        matchesStartDate = !startYear || orderYear >= startYear;
        matchesEndDate = !endYear || orderYear <= endYear;
      }
    }
    
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

  const paginatedOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFormSuccess = () => {
    fetchOrders();
  };

  // Fixed download function
  const handleDownload = async (order: OrderStatement) => {
    try {
      if (!order.file_path) {
        alert('No file available for download');
        return;
      }

      console.log('Starting download for order:', order.id, 'File path:', order.file_path);

      let response;
      let blob;

      // Method 1: If file_path is a complete URL
      if (order.file_path.startsWith('http://') || order.file_path.startsWith('https://')) {
        console.log('Downloading from URL:', order.file_path);
        response = await fetch(order.file_path, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        blob = await response.blob();
      } 
      // Method 2: Use API service with proper configuration
      else {
        console.log('Downloading via API service');
        
        // Try different API endpoints
        const possibleEndpoints = [
          `/company_payments/${order.id}/download`,
          `/files/download?path=${encodeURIComponent(order.file_path)}`,
          `/download/${order.file_path}`,
          order.file_path // Sometimes file_path might be the endpoint itself
        ];

        let downloadSuccess = false;
        
        for (const endpoint of possibleEndpoints) {
          try {
            console.log('Trying endpoint:', endpoint);
            
            // Configure the request properly for file download
            const config = {
              responseType: 'blob' as const,
              headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream, */*'
              }
            };

            response = await apiService.get(endpoint, config);
            
            // Check if response is actually a blob
            if (response instanceof Blob) {
              blob = response;
            } else if (response.data instanceof Blob) {
              blob = response.data;
            } else {
              // Convert response to blob
              blob = new Blob([response], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
              });
            }
            
            downloadSuccess = true;
            console.log('Download successful via:', endpoint);
            break;
          } catch (endpointError) {
            console.log('Failed with endpoint:', endpoint, 'Error:', endpointError);
            continue;
          }
        }

        if (!downloadSuccess) {
          throw new Error('All download endpoints failed');
        }
      }

      // Check if blob is valid and has content
      if (!blob || blob.size === 0) {
        throw new Error('Downloaded file is empty or invalid');
      }

      console.log('Blob created, size:', blob.size, 'type:', blob.type);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get file extension from file_path or default to .xlsx
      const fileName = order.file_path.split('/').pop() || `order_statement_${order.id}.xlsx`;
      const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : 'xlsx';
      
      link.download = `order_statement_${order.id}.${fileExtension}`;
      link.style.display = 'none';
      
      // Add to DOM, click, and cleanup
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      console.log('Download initiated successfully');

    } catch (error) {
      console.error('Download error details:', error);
      
      // More specific error messages
      let errorMessage = 'Error downloading file. ';
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage += 'File not found on server.';
        } else if (error.message.includes('403')) {
          errorMessage += 'Access denied to file.';
        } else if (error.message.includes('network')) {
          errorMessage += 'Network error occurred.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
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

        {/* Search, Filters and Actions */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openAddModal}
                  sx={{ minWidth: 120 }}
                >
                  Add
                </Button>
                {selectedOrders.length > 0 && (
                  <Tooltip title={`Delete ${selectedOrders.length} selected`}>
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
                  </Tooltip>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  placeholder="Search by ID, company, period, or status..."
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
                <TableCell><strong>MAPPING STATUS</strong></TableCell>
                <TableCell><strong>SUBMITTED</strong></TableCell>
                <TableCell><strong>ACTIONS</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {orders.length === 0 ? 'No orders available' : 'No orders match your filters'}
                    </Typography>
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
                    <TableCell>{order.company_id || order.company_id}</TableCell>
                    <TableCell>{order.period}</TableCell>
                    <TableCell>₹{(order.amount || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status?.toUpperCase() || 'PENDING'} 
                        color={getStatusColor(order.status || 'pending') as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={order.mapping_status?.toUpperCase() || 'PENDING'} 
                        color={getStatusColor(order.mapping_status || 'pending') as any}
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
                        <Tooltip title="Edit Mapping Status">
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
                          <IconButton size="small" color="error" onClick={() => handleDeleteSingle(order.id)}>
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

      {/* Add Order Modal */}
      <OrderFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={handleFormSuccess}
        order={null}
        companies={companies}
        isEditing={false}
      />

      {/* View Order Modal */}
      {/* <OrderViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        order={selectedOrder}
        onEdit={openEditModal}
        onDownload={handleDownload}
      /> */}

      {/* Mapping Status Edit Modal */}
      <Dialog 
        open={mappingModalOpen} 
        onClose={() => setMappingModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Mapping Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Mapping Status</InputLabel>
              <Select
                value={mappingStatus}
                label="Mapping Status"
                onChange={(e) => setMappingStatus(e.target.value as any)}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMappingModalOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleMappingStatusUpdate}
            variant="contained"
            disabled={updatingMapping}
          >
            {updatingMapping ? <CircularProgress size={20} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>No</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrdersList;