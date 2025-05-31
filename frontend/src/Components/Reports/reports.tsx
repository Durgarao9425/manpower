import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  TablePagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
  Send as SendIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon,
  AttachMoney as AttachMoneyIcon,
  Assignment as AssignmentIcon,
  LocalShipping as LocalShippingIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';

// Enhanced interfaces for better type safety
interface Column {
  field: string;
  headerName: string;
  type?: 'text' | 'status' | 'avatar' | 'custom';
  width?: string | number;
  minWidth?: number;
  render?: (value: any, item: any) => React.ReactNode;
}

interface CardData {
  title: string;
  value: string | number;
  color: string;
  icon: React.ReactElement;
}

interface TabData {
  label: string;
  value: string;
  count?: number;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

interface FilterField {
  field: string;
  label: string;
  type: 'text' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface ActionButton {
  label: string;
  icon?: React.ReactElement;
  color?: 'inherit' | 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  variant?: 'text' | 'outlined' | 'contained';
  onClick: () => void;
}

interface RowAction {
  icon: React.ReactElement;
  title: string;
  color?: 'inherit' | 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  onClick: (item: any) => void;
}

const ReusableListingPage: React.FC<any> = ({
  title = "Data Listing",
  subtitle,
  data = [],
  columns = [],
  loading = false,
  onDataChange,
  cardData = [],
  tabs = [],
  defaultTab = 0,
  searchFields = [],
  searchPlaceholder = "Search...",
  filterFields = [],
  statusField = 'status',
  statusColors = {},
  actionButtons = [],
  rowActions = [],
  enableSelection = false,
  enablePagination = true,
  enableDensePadding = true,
  defaultRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50, 100],
  renderCustomCell,
  renderEmptyState,
  showDateFilters = false,
  onDateFilterChange
}) => {
  // State management
  const [items, setItems] = useState(data);
  const [selectedTab, setSelectedTab] = useState(defaultTab);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [dense, setDense] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Update items when data changes
  useEffect(() => {
    setItems(data);
  }, [data]);

  // Filter logic
  const filteredItems = items.filter(item => {
    // Search filter
    const matchesSearch = searchFields.length === 0 || searchFields.some(field => 
      item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Tab filter
    const currentTab = tabs[selectedTab]?.value;
    const matchesTab = !currentTab || currentTab === 'all' || item[statusField] === currentTab;
    
    // Custom filters
    const matchesFilters = Object.entries(filters).every(([field, value]) => 
      !value || item[field] === value
    );

    // Date filters
    let matchesDateRange = true;
    if (startDate || endDate) {
      const itemDate = new Date(item.date);
      if (startDate) {
        matchesDateRange = itemDate >= new Date(startDate);
      }
      if (endDate && matchesDateRange) {
        matchesDateRange = itemDate <= new Date(endDate);
      }
    }
    
    return matchesSearch && matchesTab && matchesFilters && matchesDateRange;
  });

  // Pagination
  const paginatedItems = enablePagination 
    ? filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : filteredItems;

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, filters, selectedTab, startDate, endDate]);

  // Selection handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedItems(paginatedItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Bulk delete
  const handleDeleteSelected = () => {
    if (selectedItems.length > 0 && window.confirm(`Delete ${selectedItems.length} selected items?`)) {
      const newItems = items.filter(item => !selectedItems.includes(item.id));
      setItems(newItems);
      setSelectedItems([]);
      onDataChange?.(newItems);
    }
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter handlers
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({});
    setStartDate('');
    setEndDate('');
    setSelectedTab(0);
    onDateFilterChange?.('', '');
  };

  // Date filter handlers
  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    onDateFilterChange?.(type === 'start' ? value : startDate, type === 'end' ? value : endDate);
  };

  // Cell content renderer
  const renderCellContent = (item: any, column: Column) => {
    const value = item[column.field];
    
    if (column.type === 'status') {
      return (
        <Chip 
          label={value?.toString().charAt(0).toUpperCase() + value?.toString().slice(1)} 
          color={statusColors[value] || 'default'}
          size="small"
        />
      );
    }
    
    if (column.type === 'avatar') {
      return <Avatar sx={{ width: 32, height: 32 }}>{value?.charAt(0)}</Avatar>;
    }
    
    if (column.render) {
      return column.render(value, item);
    }

    if (renderCustomCell) {
      return renderCustomCell(item, column);
    }
    
    return value;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'flex-start', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="h4" component="h1" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Stats Cards */}
      {cardData.length > 0 && (
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
      )}

      {/* Main Content */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {/* Tabs */}
        {tabs.length > 0 && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              
              {/* Right side action buttons after tabs */}
              {actionButtons.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {actionButtons.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || 'contained'}
                      color={action.color || 'primary'}
                      startIcon={action.icon}
                      onClick={action.onClick}
                      size="small"
                    >
                      {action.label}
                    </Button>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Filters Section */}
        <Box sx={{ p: 2 }}>
          <Accordion 
            expanded={filtersExpanded} 
            onChange={(e, isExpanded) => setFiltersExpanded(isExpanded)}
            sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterIcon />
                <Typography variant="subtitle1" fontWeight="bold">
                  Search & Filters
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2} alignItems="center">
                {/* Search Field */}
                {searchFields.length > 0 && (
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      placeholder={searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                )}

                {/* Date Filters */}
                {showDateFilters && (
                  <>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Start Date"
                        value={startDate}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarTodayIcon fontSize="small" />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="End Date"
                        value={endDate}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarTodayIcon fontSize="small" />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                  </>
                )}

                {/* Filter Fields */}
                {filterFields.map((filter, index) => (
                  <Grid item xs={12} md={2} key={index}>
                    {filter.type === 'select' ? (
                      <FormControl fullWidth size="small">
                        <InputLabel>{filter.label}</InputLabel>
                        <Select
                          value={filters[filter.field] || ''}
                          onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                          label={filter.label}
                        >
                          <MenuItem value="">All</MenuItem>
                          {filter.options?.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        label={filter.label}
                        placeholder={filter.placeholder}
                        value={filters[filter.field] || ''}
                        onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                      />
                    )}
                  </Grid>
                ))}

                {/* Clear Filters Button */}
                <Grid item xs={12} md={2}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={clearFilters}
                    size="small"
                    fullWidth
                  >
                    Clear All
                  </Button>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Table Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {enableSelection && selectedItems.length > 0 && (
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
            <Typography variant="body2" color="text.secondary">
              Showing {paginatedItems.length} of {filteredItems.length} entries
            </Typography>
          </Box>
          
          {enableDensePadding && (
            <FormControlLabel
              control={
                <Switch
                  checked={dense}
                  onChange={(e) => setDense(e.target.checked)}
                  size="small"
                />
              }
              label="Dense"
            />
          )}
        </Box>

        {/* Table */}
        <TableContainer sx={{ maxHeight: dense ? 400 : 600 }}>
          <Table stickyHeader size={dense ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                {enableSelection && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedItems.length > 0 && selectedItems.length < filteredItems.length}
                      checked={filteredItems.length > 0 && selectedItems.length === filteredItems.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell 
                    key={column.field}
                    sx={{ 
                      width: column.width,
                      minWidth: column.minWidth,
                      fontWeight: 'bold',
                      backgroundColor: '#f5f5f5'
                    }}
                  >
                    {column.headerName}
                  </TableCell>
                ))}
                {rowActions.length > 0 && (
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (enableSelection ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} align="center" sx={{ py: 4 }}>
                    <Typography>Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (enableSelection ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} align="center" sx={{ py: 4 }}>
                    {renderEmptyState ? renderEmptyState() : (
                      <Typography color="text.secondary">No delivery records found</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id} hover>
                    {enableSelection && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.field}>
                        {renderCellContent(item, column)}
                      </TableCell>
                    ))}
                    {rowActions.length > 0 && (
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {rowActions.map((action, index) => (
                            <IconButton 
                              key={index}
                              size="small" 
                              color={action.color || 'primary'}
                              onClick={() => action.onClick(item)}
                              title={action.title}
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
        {enablePagination && (
          <TablePagination
            rowsPerPageOptions={rowsPerPageOptions}
            component="div"
            count={filteredItems.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showFirstButton
            showLastButton
          />
        )}
      </Paper>
    </Container>
  );
};

// Rider Delivery Report Component
export const RiderDeliveryReport = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for rider deliveries
  const mockDeliveries = [
    {
      id: '#6010',
      orderId: 'ORD-001',
      customer: 'Jayvion Simon',
      customerEmail: 'jayvion.simon@example.com',
      riderName: 'Alex Johnson',
      riderPhone: '+91 98765 43210',
      date: '2025-05-30',
      time: '9:58 pm',
      items: 6,
      price: '$484.15',
      status: 'refunded',
      deliveryAddress: '123 Main St, Downtown',
      estimatedTime: '30 mins',
      actualTime: '35 mins',
      distance: '5.2 km'
    },
    {
      id: '#6011',
      orderId: 'ORD-002',
      customer: 'Lucian Obrien',
      customerEmail: 'lucian.obrien@example.com',
      riderName: 'Sarah Wilson',
      riderPhone: '+91 87654 32109',
      date: '2025-05-29',
      time: '8:58 pm',
      items: 1,
      price: '$83.74',
      status: 'completed',
      deliveryAddress: '456 Oak Ave, Midtown',
      estimatedTime: '25 mins',
      actualTime: '22 mins',
      distance: '3.8 km'
    },
    {
      id: '#6012',
      orderId: 'ORD-003',
      customer: 'Soren Durham',
      customerEmail: 'soren.durham@example.com',
      riderName: 'Mike Davis',
      riderPhone: '+91 76543 21098',
      date: '2025-05-28',
      time: '11:58 am',
      items: 5,
      price: '$400.41',
      status: 'pending',
      deliveryAddress: '789 Pine Rd, Uptown',
      estimatedTime: '40 mins',
      actualTime: null,
      distance: '7.5 km'
    },
    {
      id: '#6013',
      orderId: 'ORD-004',
      customer: 'Cortez Herring',
      customerEmail: 'cortez.herring@example.com',
      riderName: 'Emma Thompson',
      riderPhone: '+91 65432 10987',
      date: '2025-05-27',
      time: '10:58 am',
      items: 1,
      price: '$83.74',
      status: 'completed',
      deliveryAddress: '321 Elm St, Suburbs',
      estimatedTime: '35 mins',
      actualTime: '30 mins',
      distance: '6.1 km'
    },
    {
      id: '#6014',
      orderId: 'ORD-005',
      customer: 'Brycen Jimenez',
      customerEmail: 'brycen.jimenez@example.com',
      riderName: 'David Chen',
      riderPhone: '+91 54321 09876',
      date: '2025-05-26',
      time: '9:58 am',
      items: 6,
      price: '$484.15',
      status: 'cancelled',
      deliveryAddress: '654 Maple Dr, Eastside',
      estimatedTime: '45 mins',
      actualTime: null,
      distance: '8.3 km'
    }
  ];

  const columns = [
    { 
      field: 'id', 
      headerName: 'Order',
      width: 100,
      render: (value, item) => (
        <Box>
          <Typography variant="body2" fontWeight="bold" color="primary">
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.orderId}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'customer', 
      headerName: 'Customer',
      width: 200,
      render: (value, item) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>{value.charAt(0)}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.customerEmail}
            </Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'riderName', 
      headerName: 'Rider',
      width: 180,
      render: (value, item) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.riderPhone}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'date', 
      headerName: 'Date',
      width: 120,
      render: (value, item) => (
        <Box>
          <Typography variant="body2">
            {new Date(value).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.time}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'items', 
      headerName: 'Items',
      width: 80,
      render: (value) => (
        <Chip label={value} size="small" variant="outlined" />
      )
    },
    { 
      field: 'price', 
      headerName: 'Price',
      width: 100,
      render: (value) => (
        <Typography variant="body2" fontWeight="medium" color="success.main">
          {value}
        </Typography>
      )
    },
    { 
      field: 'distance', 
      headerName: 'Distance',
      width: 100,
      render: (value) => (
        <Chip label={value} size="small" color="info" variant="outlined" />
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      type: 'status',
      width: 120
    }
  ];

  const tabs = [
    { label: 'All', value: 'all', count: 50, color: 'default' as const },
    { label: 'Pending', value: 'pending', count: 8, color: 'warning' as const },
    { label: 'Completed', value: 'completed', count: 30, color: 'success' as const },
    { label: 'Cancelled', value: 'cancelled', count: 10, color: 'error' as const },
    { label: 'Refunded', value: 'refunded', count: 2, color: 'info' as const }
  ];

  const cardData = [
    { title: 'Total Deliveries', value: '1,258', icon: <LocalShippingIcon />, color: '#1976d2' },
    { title: 'Active Riders', value: '45', icon: <PersonIcon />, color: '#388e3c' },
    { title: 'Completed Today', value: '89', icon: <CheckCircleIcon />, color: '#f57c00' },
    { title: 'Total Revenue', value: '$12,450', icon: <AttachMoneyIcon />, color: '#d32f2f' }
  ];

  const statusColors = {
    pending: 'warning' as const,
    completed: 'success' as const,
    cancelled: 'error' as const,
    refunded: 'info' as const
  };

  const filterFields = [
    {
      field: 'riderName',
      label: 'Rider',
      type: 'select' as const,
      options: [
        { value: 'Alex Johnson', label: 'Alex Johnson' },
        { value: 'Sarah Wilson', label: 'Sarah Wilson' },
        { value: 'Mike Davis', label: 'Mike Davis' },
        { value: 'Emma Thompson', label: 'Emma Thompson' },
        { value: 'David Chen', label: 'David Chen' }
      ]
    },
    {
      field: 'deliveryAddress',
      label: 'Area',
      type: 'select' as const,
      options: [
      { value: 'Downtown', label: 'Downtown' },
        { value: 'Midtown', label: 'Midtown' },
        { value: 'Uptown', label: 'Uptown' },
        { value: 'Suburbs', label: 'Suburbs' },
        { value: 'Eastside', label: 'Eastside' }
      ]
    }
  ];

  const actionButtons = [
    {
      label: 'Export Report',
      icon: <GetAppIcon />,
      color: 'primary' as const,
      variant: 'contained' as const,
      onClick: () => {
        // Export functionality
        console.log('Exporting delivery report...');
        const csvData = deliveries.map(delivery => ({
          'Order ID': delivery.id,
          'Customer': delivery.customer,
          'Rider': delivery.riderName,
          'Date': delivery.date,
          'Items': delivery.items,
          'Price': delivery.price,
          'Status': delivery.status,
          'Distance': delivery.distance
        }));
        
        const csvContent = "data:text/csv;charset=utf-8," + 
          Object.keys(csvData[0]).join(",") + "\n" +
          csvData.map(row => Object.values(row).join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "rider_delivery_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    {
      label: 'Send Report',
      icon: <SendIcon />,
      color: 'secondary' as const,
      variant: 'outlined' as const,
      onClick: () => {
        console.log('Sending delivery report via email...');
        alert('Report sent successfully!');
      }
    }
  ];

  const rowActions = [
    {
      icon: <VisibilityIcon />,
      title: 'View Details',
      color: 'primary' as const,
      onClick: (delivery) => {
        console.log('Viewing delivery details:', delivery);
        alert(`Order Details:\nID: ${delivery.id}\nCustomer: ${delivery.customer}\nRider: ${delivery.riderName}\nStatus: ${delivery.status}`);
      }
    },
    {
      icon: <AssessmentIcon />,
      title: 'View Report',
      color: 'info' as const,
      onClick: (delivery) => {
        console.log('Viewing delivery report:', delivery);
        alert(`Delivery Report:\nEstimated Time: ${delivery.estimatedTime}\nActual Time: ${delivery.actualTime || 'N/A'}\nDistance: ${delivery.distance}`);
      }
    }
  ];

  const searchFields = ['customer', 'riderName', 'id', 'orderId'];

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setDeliveries(mockDeliveries);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDataChange = (newData) => {
    setDeliveries(newData);
  };

  const handleDateFilterChange = (startDate, endDate) => {
    console.log('Date filter changed:', { startDate, endDate });
    // Here you can implement additional date filtering logic if needed
  };

  const renderEmptyState = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <LocalShippingIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No delivery records found
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Try adjusting your search criteria or date range
      </Typography>
    </Box>
  );

  return (
    <ReusableListingPage
      title="Rider Delivery Report"
      subtitle="Track and manage all delivery orders and rider performance"
      data={deliveries}
      columns={columns}
      loading={loading}
      onDataChange={handleDataChange}
      cardData={cardData}
      tabs={tabs}
      defaultTab={0}
      searchFields={searchFields}
      searchPlaceholder="Search by customer, rider, or order ID..."
      filterFields={filterFields}
      statusField="status"
      statusColors={statusColors}
      actionButtons={actionButtons}
      rowActions={rowActions}
      enableSelection={true}
      enablePagination={true}
      enableDensePadding={true}
      defaultRowsPerPage={10}
      rowsPerPageOptions={[5, 10, 25, 50]}
      showDateFilters={true}
      onDateFilterChange={handleDateFilterChange}
      renderEmptyState={renderEmptyState}
    />
  );
};

export default RiderDeliveryReport;