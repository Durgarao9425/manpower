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
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

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
  actions = [],
  onAdd,
  addButtonText = "Add New",
  filters = [], // Array of filter objects { field, label, options }
  showAddButton = true
}) => {
  const [items, setItems] = useState(data);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    setItems(data);
  }, [data]);

  // Filter items based on search, tab, and additional filters
  const filteredItems = items.filter(item => {
    const matchesSearch = searchFields.length === 0 || searchFields.some(field => 
      item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const currentTab = tabs[selectedTab]?.value;
    const matchesTab = !currentTab || currentTab === 'all' || item[statusField] === currentTab;
    
    const matchesFilters = Object.entries(activeFilters).every(([filterField, filterValue]) => {
      if (!filterValue || filterValue === 'all') return true;
      return item[filterField] === filterValue;
    });
    
    return matchesSearch && matchesTab && matchesFilters;
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

  const handleFilterChange = (filterField, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterField]: value
    }));
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        {showAddButton && onAdd && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{ 
              backgroundColor: 'primary.main',
              '&:hover': { backgroundColor: 'primary.dark' }
            }}
          >
            {addButtonText}
          </Button>
        )}
      </Box>

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

        {/* Search, Filters and Actions */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
                  placeholder={`Search ${searchFields.join(', ')}...`}
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

          {/* Filters */}
          {filters.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FilterListIcon color="action" />
              {filters.map((filter) => (
                <FormControl key={filter.field} size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>{filter.label}</InputLabel>
                  <Select
                    value={activeFilters[filter.field] || 'all'}
                    label={filter.label}
                    onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    {filter.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Box>
          )}
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

export default ReusableTable;