import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Container,
  AppBar,
  Toolbar,
  Avatar,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  TablePagination,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search,
  ViewList,
  ViewModule,
  Schedule,
  Person,
  CheckCircle,
  Cancel,
  AccessTime,
  CalendarToday
} from '@mui/icons-material';

interface AttendanceListingPageProps {
  data: any[];
  columns: any[];
  CardComponent: React.ComponentType<any>;
  searchFields?: string[];
  filters?: Record<string, any>;
  title?: string;
  description?: string;
  emptyMessage?: string;
}

const ReusableListingPage = ({
  data,
  columns,
  CardComponent,
  searchFields = [],
  filters = {},
  title = "Data Listing",
  description,
  emptyMessage
}: AttendanceListingPageProps) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [filterValues, setFilterValues] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter and search logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Search filter
      const matchesSearch = searchFields.length === 0 || searchFields.some(field =>
        item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Custom filters
      const matchesFilters = Object.entries(filterValues).every(([key, value]) => {
        if (!value || value === 'all' || value === '') return true;

        // Special handling for date filters
        if (key === 'month') {
          const itemDate = new Date(item.date);
          return itemDate.getMonth() + 1 === parseInt(value);
        }

        if (key === 'year') {
          const itemDate = new Date(item.date);
          return itemDate.getFullYear() === parseInt(value);
        }

        // Regular field matching
        return item[key]?.toString().toLowerCase() === value.toLowerCase();
      });

      return matchesSearch && matchesFilters;
    });
  }, [data, searchTerm, filterValues, searchFields]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleFilterChange = (filterKey, value) => {
    setFilterValues(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setPage(0); // Reset to first page when filter changes
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when search changes
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
      setPage(0); // Reset pagination when switching views
      // Adjust rows per page for card view
      if (newMode === 'card' && rowsPerPage === 10) {
        setRowsPerPage(8);
      } else if (newMode === 'list' && rowsPerPage === 8) {
        setRowsPerPage(10);
      }
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', minWidth: '77vw', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <AppBar
        position="static"
        sx={{
          mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
        }}
      >
        <Toolbar sx={{ py: 2 }}>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl">
        {/* Search and Filters */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`
          }}
        >
          <Grid container spacing={3} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search riders, dates, or status..."
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Filters */}
            {Object.entries(filters).map(([key, filterConfig]) => (
              <Grid item xs={12} md={2} key={key}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                    },
                  }}
                >
                  <InputLabel>{filterConfig.label}</InputLabel>
                  <Select
                    value={filterValues[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    label={filterConfig.label}
                  >
                    <MenuItem value="">All</MenuItem>
                    {filterConfig.options.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ))}

            {/* View Toggle */}
            <Grid item xs={12} md={2}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': {
                    borderRadius: 2,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="list">
                  <ViewList />
                </ToggleButton>
                <ToggleButton value="card">
                  <ViewModule />
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Paper>

        {/* Results Count */}


        {/* List View */}
        {viewMode === 'list' && (
          <Paper
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`
                    }}
                  >
                    {columns.map(column => (
                      <TableCell
                        key={column.key}
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.95rem',
                          color: theme.palette.primary.main,
                          borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                        }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((item, index) => (
                    <TableRow
                      key={item.id || index}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          transform: 'scale(1.001)'
                        },
                        '&:nth-of-type(even)': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.02)
                        },
                        transition: 'all 0.2s ease-in-out',
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                      }}
                    >
                      {columns.map(column => (
                        <TableCell
                          key={column.key}
                          sx={{
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                            py: 2
                          }}
                        >
                          {column.render ? column.render(item[column.key], item) : item[column.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

            </TableContainer>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
              Showing {Math.min(filteredData.length, rowsPerPage)} of {filteredData.length} results
              {filteredData.length !== data.length && ` (filtered from ${data.length} total)`}
            </Typography>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={filteredData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                backgroundColor: alpha(theme.palette.primary.main, 0.02)
              }}
            />
          </Paper>
        )}

        {/* Card View */}
        {viewMode === 'card' && (
          <>
            <Grid container spacing={4}>
              {paginatedData.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id || index}>
                  <CardComponent data={item} />
                </Grid>
                
              ))}
            </Grid>

            {/* Card View Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Paper
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <TablePagination
                  component="div"
                  count={filteredData.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[8, 16, 24, 32]}
                  labelRowsPerPage="Cards per page:"
                />
              </Paper>
            </Box>
          </>
        )}

        {filteredData.length === 0 && (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
            }}
          >
            <Typography variant="h5" color="text.secondary" fontWeight="600">
              No records found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your search or filter criteria
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default ReusableListingPage;
