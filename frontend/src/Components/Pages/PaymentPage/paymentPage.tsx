import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Container,
  TablePagination,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
  Upload as UploadIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Store as StoreIcon,
  ShoppingCart as ShoppingCartIcon,
  Assignment as AssignmentIcon,
  RequestQuote as RequestQuoteIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Edit as EditIcon
} from '@mui/icons-material';

// Reusable Table Component (without cards)
const ReusableTable = ({
  title = "Data Listing",
  data = [],
  columns = [],
  tabs = [],
  loading = false,
  onDataChange,
  searchFields = [],
  statusField = 'status',
  statusColors = {},
  actions = []
}) => {
  const [items, setItems] = useState(data);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setItems(data);
  }, [data]);

  // Filter items based on search and tab
  const filteredItems = items.filter(item => {
    const matchesSearch = searchFields.length === 0 || searchFields.some(field => 
      item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const currentTab = tabs[selectedTab]?.value;
    const matchesTab = !currentTab || currentTab === 'all' || item[statusField] === currentTab;
    
    return matchesSearch && matchesTab;
  });

  // Paginated items
  const paginatedItems = filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedItems(paginatedItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length > 0) {
      const newItems = items.filter(item => !selectedItems.includes(item.id));
      setItems(newItems);
      setSelectedItems([]);
      onDataChange?.(newItems);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    return statusColors[status] || 'default';
  };

  const renderCellContent = (item, column) => {
    const value = item[column.field];
    
    if (column.type === 'status') {
      return (
        <Chip 
          label={value?.toString()} 
          color={getStatusColor(value)}
          size="small"
          sx={{ minWidth: 80 }}
        />
      );
    }
    
    if (column.type === 'currency') {
      return (
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {value}
        </Typography>
      );
    }
    
    if (column.render) {
      return column.render(value, item);
    }
    
    return value || 'N/A';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        {title}
      </Typography>

      {/* Main Content */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {/* Tabs */}
        {tabs.length > 0 && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
            <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
              {tabs.map((tab, index) => (
                <Tab 
                  key={index}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {tab.label}
                      {tab.count !== undefined && (
                        <Chip 
                          label={tab.count} 
                          size="small" 
                          color={tab.color || 'default'} 
                        />
                      )}
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>
        )}

        {/* Search and Actions */}
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedItems.length > 0 && (
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
            {searchFields.length > 0 && (
              <TextField
                placeholder="Search riders, company..."
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
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Total Records: {filteredItems.length}
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedItems.length > 0 && selectedItems.length < paginatedItems.length}
                    checked={paginatedItems.length > 0 && selectedItems.length === paginatedItems.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column.field} sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                    {column.headerName}
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>ACTIONS</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} align="center" sx={{ py: 4 }}>
                    <Typography>Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No data found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                      />
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={column.field}>
                        {renderCellContent(item, column)}
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {actions.map((action, index) => (
                            <IconButton 
                              key={index}
                              size="small" 
                              color={action.color || 'primary'}
                              onClick={() => action.onClick?.(item)}
                              title={action.title}
                              sx={{ minWidth: 'auto' }}
                            >
                              {action.icon}
                            </IconButton>
                          ))}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

// Payment Listing Page
const PaymentListingPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock payment data based on the image
  const mockPaymentData = [
    {
      id: 1,
      rider: 'veerdurgarao Goriparthi',
      company: 'N/A',
      store: 'N/A',
      dailyOrdersTotal: '₹0.00',
      weeklyStatement: 'not uploaded',
      advanceRequested: '₹0.00',
      tdsDeduction: '₹0.00',
      finalPayable: '₹0.00',
      status: 'pending'
    },
    {
      id: 2,
      rider: 'Mahendhra',
      company: 'N/A',
      store: 'N/A',
      dailyOrdersTotal: '₹6,059.25',
      weeklyStatement: 'uploaded',
      advanceRequested: '₹2,800.00',
      tdsDeduction: '₹0.00',
      finalPayable: '₹0.00',
      status: 'paid'
    },
    {
      id: 3,
      rider: 'veerdurgarao Goriparthi',
      company: 'N/A',
      store: 'N/A',
      dailyOrdersTotal: '₹0.00',
      weeklyStatement: 'not uploaded',
      advanceRequested: '₹0.00',
      tdsDeduction: '₹0.00',
      finalPayable: '₹0.00',
      status: 'pending'
    },
    {
      id: 4,
      rider: 'Rajesh Kumar',
      company: 'ABC Corp',
      store: 'Store A',
      dailyOrdersTotal: '₹3,250.75',
      weeklyStatement: 'uploaded',
      advanceRequested: '₹1,500.00',
      tdsDeduction: '₹325.08',
      finalPayable: '₹1,425.67',
      status: 'processing'
    },
    {
      id: 5,
      rider: 'Priya Sharma',
      company: 'XYZ Ltd',
      store: 'Store B',
      dailyOrdersTotal: '₹4,890.50',
      weeklyStatement: 'uploaded',
      advanceRequested: '₹2,000.00',
      tdsDeduction: '₹489.05',
      finalPayable: '₹2,401.45',
      status: 'paid'
    },
    {
      id: 6,
      rider: 'Amit Singh',
      company: 'Tech Solutions',
      store: 'Store C',
      dailyOrdersTotal: '₹2,156.25',
      weeklyStatement: 'not uploaded',
      advanceRequested: '₹800.00',
      tdsDeduction: '₹0.00',
      finalPayable: '₹0.00',
      status: 'rejected'
    }
  ];

  const columns = [
    { field: 'rider', headerName: 'RIDER' },
    { field: 'company', headerName: 'COMPANY' },
    { field: 'store', headerName: 'STORE' },
    { field: 'dailyOrdersTotal', headerName: 'DAILY ORDERS TOTAL', type: 'currency' },
    { 
      field: 'weeklyStatement', 
      headerName: 'WEEKLY STATEMENT',
      render: (value) => (
        <Chip 
          label={value} 
          color={value === 'uploaded' ? 'success' : 'warning'}
          size="small"
          sx={{ minWidth: 90 }}
        />
      )
    },
    { field: 'advanceRequested', headerName: 'ADVANCE REQUESTED', type: 'currency' },
    { field: 'tdsDeduction', headerName: 'TDS DEDUCTION (1%)', type: 'currency' },
    { field: 'finalPayable', headerName: 'FINAL PAYABLE', type: 'currency' },
    { field: 'status', headerName: 'STATUS', type: 'status' }
  ];

  const tabs = [
    { label: 'All Payments', value: 'all', count: mockPaymentData.length, color: 'default' },
    { label: 'Pending', value: 'pending', count: mockPaymentData.filter(p => p.status === 'pending').length, color: 'warning' },
    { label: 'Processing', value: 'processing', count: mockPaymentData.filter(p => p.status === 'processing').length, color: 'info' },
    { label: 'Paid', value: 'paid', count: mockPaymentData.filter(p => p.status === 'paid').length, color: 'success' },
    { label: 'Rejected', value: 'rejected', count: mockPaymentData.filter(p => p.status === 'rejected').length, color: 'error' }
  ];

  const statusColors = {
    pending: 'warning',
    processing: 'info',
    paid: 'success',
    rejected: 'error'
  };

  const actions = [
    {
      icon: <VisibilityIcon fontSize="small" />,
      color: 'primary',
      title: 'Details',
      onClick: (item) => console.log('View Details', item)
    },
    {
      icon: <UploadIcon fontSize="small" />,
      color: 'info',
      title: 'Upload Statement',
      onClick: (item) => console.log('Upload Statement', item)
    },
    {
      icon: <EditIcon fontSize="small" />,
      color: 'secondary',
      title: 'Settle',
      onClick: (item) => console.log('Settle Payment', item)
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          setPayments(mockPaymentData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching payments:', error);
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <ReusableTable
      title="Payment Listing"
      data={payments}
      columns={columns}
      tabs={tabs}
      loading={loading}
      onDataChange={setPayments}
      searchFields={['rider', 'company', 'store']}
      statusField="status"
      statusColors={statusColors}
      actions={actions}
    />
  );
};

export default PaymentListingPage;