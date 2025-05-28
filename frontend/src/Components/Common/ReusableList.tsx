// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Tabs,
//   Tab,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Checkbox,
//   IconButton,
//   Chip,
//   TextField,
//   InputAdornment,
//   Avatar,
//   Grid,
//   Container,
//   TablePagination,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel
// } from '@mui/material';
// import {
//   Search as SearchIcon,
//   Delete as DeleteIcon,
//   Visibility as VisibilityIcon,
//   GetApp as GetAppIcon,
//   Send as SendIcon,
//   Assessment as AssessmentIcon,
//   Person as PersonIcon,
//   DirectionsCar as DirectionsCarIcon,
//   AttachMoney as AttachMoneyIcon,
//   Assignment as AssignmentIcon
// } from '@mui/icons-material';

// // Reusable Listing Page Component
// export const ReusableListingPage = ({
//   title = "Data Listing",
//   data = [],
//   columns = [],
//   cardData = [],
//   tabs = [],
//   loading = false,
//   onDataChange,
//   searchFields = [],
//   statusField = 'status',
//   statusColors = {},
//   actions = []
// }) => {
//   const [items, setItems] = useState(data);
//   const [selectedTab, setSelectedTab] = useState(0);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);

//   useEffect(() => {
//     setItems(data);
//   }, [data]);

//   // Filter items based on search and tab
//   const filteredItems = items.filter(item => {
//     const matchesSearch = searchFields.length === 0 || searchFields.some(field => 
//       item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
//     );
    
//     const currentTab = tabs[selectedTab]?.value;
//     const matchesTab = !currentTab || currentTab === 'all' || item[statusField] === currentTab;
    
//     return matchesSearch && matchesTab;
//   });

//   // Paginated items
//   const paginatedItems = filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

//   const handleSelectAll = (event) => {
//     if (event.target.checked) {
//       setSelectedItems(paginatedItems.map(item => item.id));
//     } else {
//       setSelectedItems([]);
//     }
//   };

//   const handleSelectItem = (itemId) => {
//     setSelectedItems(prev => 
//       prev.includes(itemId) 
//         ? prev.filter(id => id !== itemId)
//         : [...prev, itemId]
//     );
//   };

//   const handleDeleteSelected = () => {
//     if (selectedItems.length > 0) {
//       const newItems = items.filter(item => !selectedItems.includes(item.id));
//       setItems(newItems);
//       setSelectedItems([]);
//       onDataChange?.(newItems);
//     }
//   };

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const getStatusColor = (status) => {
//     return statusColors[status] || 'default';
//   };

//   const renderCellContent = (item, column) => {
//     const value = item[column.field];
    
//     if (column.type === 'status') {
//       return (
//         <Chip 
//           label={value?.toString().toUpperCase()} 
//           color={getStatusColor(value)}
//           size="small"
//         />
//       );
//     }
    
//     if (column.type === 'avatar') {
//       return <Avatar sx={{ width: 32, height: 32 }}>{value?.charAt(0)}</Avatar>;
//     }
    
//     if (column.render) {
//       return column.render(value, item);
//     }
    
//     return value;
//   };

//   return (
//     <Container maxWidth="xl" sx={{ py: 3 }}>
//       {/* Header Cards */}
//       {cardData.length > 0 && (
//         <Grid container spacing={3} sx={{ mb: 4 }}>
//           {cardData.map((card, index) => (
//             <Grid item xs={12} sm={6} md={3} key={index}>
//               <Card sx={{ 
//                 height: '100%',
//                 background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}25 100%)`,
//                 border: `1px solid ${card.color}40`
//               }}>
//                 <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                   <Box>
//                     <Typography variant="h4" component="div" fontWeight="bold" color={card.color}>
//                       {card.value}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//                       {card.title}
//                     </Typography>
//                   </Box>
//                   <Box sx={{ color: card.color, opacity: 0.7 }}>
//                     {React.cloneElement(card.icon, { fontSize: 'large' })}
//                   </Box>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       )}

//       {/* Main Content */}
//       <Paper sx={{ width: '100%', overflow: 'hidden' }}>
//         {/* Tabs */}
//         {tabs.length > 0 && (
//           <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
//             <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
//               {tabs.map((tab, index) => (
//                 <Tab 
//                   key={index}
//                   label={
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                       {tab.label}
//                       {tab.count !== undefined && (
//                         <Chip 
//                           label={tab.count} 
//                           size="small" 
//                           color={tab.color || 'default'} 
//                         />
//                       )}
//                     </Box>
//                   }
//                 />
//               ))}
//             </Tabs>
//           </Box>
//         )}

//         {/* Search and Actions */}
//         <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//             {selectedItems.length > 0 && (
//               <IconButton 
//                 color="error" 
//                 onClick={handleDeleteSelected}
//                 sx={{ 
//                   backgroundColor: 'error.light',
//                   color: 'error.contrastText',
//                   '&:hover': { backgroundColor: 'error.main' }
//                 }}
//               >
//                 <DeleteIcon />
//               </IconButton>
//             )}
//             {searchFields.length > 0 && (
//               <TextField
//                 placeholder="Search..."
//                 variant="outlined"
//                 size="small"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <SearchIcon />
//                     </InputAdornment>
//                   ),
//                 }}
//                 sx={{ minWidth: 300 }}
//               />
//             )}
//           </Box>
//         </Box>

//         {/* Table */}
//         <TableContainer>
//           <Table stickyHeader>
//             <TableHead>
//               <TableRow>
//                 <TableCell padding="checkbox">
//                   <Checkbox
//                     indeterminate={selectedItems.length > 0 && selectedItems.length < filteredItems.length}
//                     checked={filteredItems.length > 0 && selectedItems.length === filteredItems.length}
//                     onChange={handleSelectAll}
//                   />
//                 </TableCell>
//                 {columns.map((column) => (
//                   <TableCell key={column.field}>
//                     <strong>{column.headerName}</strong>
//                   </TableCell>
//                 ))}
//                 {actions.length > 0 && (
//                   <TableCell><strong>ACTIONS</strong></TableCell>
//                 )}
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={columns.length + 2} align="center" sx={{ py: 4 }}>
//                     <Typography>Loading...</Typography>
//                   </TableCell>
//                 </TableRow>
//               ) : filteredItems.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={columns.length + 2} align="center" sx={{ py: 4 }}>
//                     <Typography color="text.secondary">No data found</Typography>
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filteredItems.map((item) => (
//                   <TableRow key={item.id} hover>
//                     <TableCell padding="checkbox">
//                       <Checkbox
//                         checked={selectedItems.includes(item.id)}
//                         onChange={() => handleSelectItem(item.id)}
//                       />
//                     </TableCell>
//                     {columns.map((column) => (
//                       <TableCell key={column.field}>
//                         {renderCellContent(item, column)}
//                       </TableCell>
//                     ))}
//                     {actions.length > 0 && (
//                       <TableCell>
//                         <Box sx={{ display: 'flex', gap: 1 }}>
//                           {actions.map((action, index) => (
//                             <IconButton 
//                               key={index}
//                               size="small" 
//                               color={action.color || 'primary'}
//                               onClick={() => action.onClick?.(item)}
//                               title={action.title}
//                             >
//                               {action.icon}
//                             </IconButton>
//                           ))}
//                         </Box>
//                       </TableCell>
//                     )}
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>
//     </Container>
//   );
// };

// // Example Usage - Orders Listing Page
// export const OrdersListingPageNew = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Mock data
//   const mockData = [
//     {
//       id: 38,
//       period: 'May 22 - May 31',
//       amount: '₹0.00',
//       status: 'pending',
//       submitted: 'May 23, 2025',
//       lastUpdated: 'May 23, 2025',
//       rider: 'Angelique Morse',
//       phone: '+46 8 123 456',
//       company: 'Wuckert Inc',
//       role: 'Content Creator'
//     },
//     {
//       id: 39,
//       period: 'May 15 - May 21',
//       amount: '₹250.00',
//       status: 'processing',
//       submitted: 'May 22, 2025',
//       lastUpdated: 'May 24, 2025',
//       rider: 'Ariana Lang',
//       phone: '+54 11 1234-5678',
//       company: 'Feest Group',
//       role: 'IT Administrator'
//     },
//     {
//       id: 40,
//       period: 'May 08 - May 14',
//       amount: '₹180.50',
//       status: 'completed',
//       submitted: 'May 15, 2025',
//       lastUpdated: 'May 16, 2025',
//       rider: 'Aspen Schmitt',
//       phone: '+91 98765 43210',
//       company: 'Wilson Automotive',
//       role: 'Sales Executive'
//     },
//     {
//       id: 41,
//       period: 'May 01 - May 07',
//       amount: '₹320.75',
//       status: 'rejected',
//       submitted: 'May 08, 2025',
//       lastUpdated: 'May 09, 2025',
//       rider: 'John Doe',
//       phone: '+1 555 123 4567',
//       company: 'Tech Solutions',
//       role: 'Developer'
//     },
//     // Add more mock data to test pagination
//     ...Array.from({ length: 16 }, (_, i) => ({
//       id: 42 + i,
//       period: `Apr ${15 + i} - Apr ${22 + i}`,
//       amount: `₹${(Math.random() * 500).toFixed(2)}`,
//       status: ['pending', 'processing', 'completed', 'rejected'][Math.floor(Math.random() * 4)],
//       submitted: `Apr ${16 + i}, 2025`,
//       lastUpdated: `Apr ${17 + i}, 2025`,
//       rider: `User ${42 + i}`,
//       phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
//       company: `Company ${42 + i}`,
//       role: 'Employee'
//     }))
//   ];

//   const columns = [
//     { field: 'id', headerName: 'ID' },
//     { field: 'period', headerName: 'PERIOD' },
//     { field: 'amount', headerName: 'AMOUNT' },
//     { field: 'status', headerName: 'STATUS', type: 'status' },
//     { field: 'submitted', headerName: 'SUBMITTED' },
//     { field: 'lastUpdated', headerName: 'LAST UPDATED' }
//   ];

//   const tabs = [
//     { label: 'All', value: 'all', count: 20, color: 'default' },
//     { label: 'Pending', value: 'pending', count: 10, color: 'warning' },
//     { label: 'Processing', value: 'processing', count: 2, color: 'info' },
//     { label: 'Completed', value: 'completed', count: 6, color: 'success' },
//     { label: 'Rejected', value: 'rejected', count: 2, color: 'error' }
//   ];

//   const cardData = [
//     { title: 'Total Orders', value: '20', icon: <AssignmentIcon />, color: '#1976d2' },
//     { title: 'Total Riders', value: '20', icon: <PersonIcon />, color: '#388e3c' },
//     { title: 'Total KMs', value: '1,250.00', icon: <DirectionsCarIcon />, color: '#f57c00' },
//     { title: 'Total Amount', value: '₹3,251.25', icon: <AttachMoneyIcon />, color: '#d32f2f' }
//   ];

//   const statusColors = {
//     pending: 'warning',
//     processing: 'info',
//     completed: 'success',
//     rejected: 'error'
//   };

//   const actions = [
//     {
//       icon: <VisibilityIcon fontSize="small" />,
//       color: 'primary',
//       title: 'View',
//       onClick: (item) => console.log('View', item)
//     },
//     {
//       icon: <AssessmentIcon fontSize="small" />,
//       color: 'info',
//       title: 'Report',
//       onClick: (item) => console.log('Report', item)
//     },
//     {
//       icon: <SendIcon fontSize="small" />,
//       color: 'success',
//       title: 'Send',
//       onClick: (item) => console.log('Send', item)
//     },
//     {
//       icon: <GetAppIcon fontSize="small" />,
//       color: 'secondary',
//       title: 'Download',
//       onClick: (item) => console.log('Download', item)
//     }
//   ];

//   useEffect(() => {
//     // Simulate API call
//     const fetchOrders = async () => {
//       try {
//         setLoading(true);
//         setTimeout(() => {
//           setOrders(mockData);
//           setLoading(false);
//         }, 1000);
//       } catch (error) {
//         console.error('Error fetching orders:', error);
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   return (
//     <ReusableListingPage
//       title="Orders Listing"
//       data={orders}
//       columns={columns}
//       cardData={cardData}
//       tabs={tabs}
//       loading={loading}
//       onDataChange={setOrders}
//       searchFields={['rider', 'company', 'period']}
//       statusField="status"
//       statusColors={statusColors}
//       actions={actions}
//     />
//   );
// };

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
  
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

// Enhanced interfaces for better type safety
export interface Column {
  field: string;
  headerName: string;
  type?: 'text' | 'status' | 'avatar' | 'custom';
  width?: string | number;
  minWidth?: number;
  render?: (value: any, item: any) => React.ReactNode;
}

export interface CardData {
  title: string;
  value: string | number;
  color: string;
  icon: React.ReactElement;
}

export interface TabData {
  label: string;
  value: string;
  count?: number;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export interface FilterField {
  field: string;
  label: string;
  type: 'text' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface ActionButton {
  label: string;
  icon?: React.ReactElement;
  color?: 'inherit' | 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  variant?: 'text' | 'outlined' | 'contained';
  onClick: () => void;
}

export interface RowAction {
  icon: React.ReactElement;
  title: string;
  color?: 'inherit' | 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  onClick: (item: any) => void;
}

interface ReusableListingPageProps {
  // Basic props
  title?: string;
  subtitle?: string;
  data: any[];
  columns: Column[];
  loading?: boolean;
  onDataChange?: (data: any[]) => void;

  // Card stats
  cardData?: CardData[];

  // Tabs
  tabs?: TabData[];
  defaultTab?: number;

  // Search and filters
  searchFields?: string[];
  searchPlaceholder?: string;
  filterFields?: FilterField[];

  // Status handling
  statusField?: string;
  statusColors?: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'>;

  // Actions
  actionButtons?: ActionButton[];
  rowActions?: RowAction[];
  
  // Table settings
  enableSelection?: boolean;
  enablePagination?: boolean;
  enableDensePadding?: boolean;
  defaultRowsPerPage?: number;
  rowsPerPageOptions?: number[];

  // Custom render functions
  renderCustomCell?: (item: any, column: Column) => React.ReactNode;
  renderEmptyState?: () => React.ReactNode;
}

export const ReusableListingPage: React.FC<ReusableListingPageProps> = ({
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
  renderEmptyState
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
    
    return matchesSearch && matchesTab && matchesFilters;
  });

  // Pagination
  const paginatedItems = enablePagination 
    ? filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : filteredItems;

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, filters, selectedTab]);

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
    setSelectedTab(0);
  };

  // Cell content renderer
  const renderCellContent = (item: any, column: Column) => {
    const value = item[column.field];
    
    if (column.type === 'status') {
      return (
        <Chip 
          label={value?.toString().toUpperCase()} 
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

        {/* Action Buttons */}
        {/* {actionButtons.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {actionButtons.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'contained'}
                color={action.color || 'primary'}
                startIcon={action.icon}
                onClick={action.onClick}
                sx={{ px: 3, py: 1.5 }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )} */}
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

      {/* Filters Card */}
      {(searchFields.length > 0 || filterFields.length > 0) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              {/* Search Field */}
              {searchFields.length > 0 && (
                <Grid item xs={12} md={3}>
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

              {/* Filter Fields */}
              {filterFields.map((filter, index) => (
                <Grid item xs={12} md={2} key={index}>
                  {filter.type === 'select' ? (
                    <FormControl fullWidth size="small">
                      <InputLabel>{filter.label}</InputLabel>
                      <Select
                        value={filters[filter.field] || ''}
                        onChange={(e: SelectChangeEvent) => handleFilterChange(filter.field, e.target.value)}
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
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={clearFilters}
                  size="small"
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
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

        {/* Table Controls */}
        {(enableDensePadding || enableSelection) && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
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
                {filteredItems.length} total items
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
        )}

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
                      fontWeight: 'bold'
                    }}
                  >
                    {column.headerName}
                  </TableCell>
                ))}
                {rowActions.length > 0 && (
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
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
                      <Typography color="text.secondary">No data found</Typography>
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