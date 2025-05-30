import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  Container,
  Avatar,
  Stack,
  AppBar,
  Toolbar,
  Switch,
  FormControlLabel,
  useMediaQuery,
  Fade,
  Slide,
  Zoom
} from '@mui/material';
import {
  CloudUpload,
  Download,
  Visibility,
  Delete,
  Settings,
  TrendingUp,
  Inventory,
  Business,
  DarkMode,
  LightMode,
  CheckCircle,
  Schedule,
  Error,
  FileUpload,
  Dashboard
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import * as XLSX from 'xlsx';
import apiService from '../../../services/apiService';

// Types for company and store
interface Company {
  id: number;
  name: string;
}
interface Store {
  id: number;
  name: string;
}

function TabPanel({ children, value, index, ...other }: { children: React.ReactNode, value: number, index: number }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={value === index} timeout={500}>
          <Box sx={{ p: 3 }}>{children}</Box>
        </Fade>
      )}
    </div>
  );
}

export default function OrderManagementSystem() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [company, setCompany] = useState<string>('');
  const [store, setStore] = useState<string>('');
  const [orderDate, setOrderDate] = useState('2025-05-25');
  const [defaultAmount, setDefaultAmount] = useState(40);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [excelData, setExcelData] = useState<any[] | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const isMobile = useMediaQuery('(max-width:600px)');

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#3b82f6' : '#1976d2',
        light: darkMode ? '#60a5fa' : '#42a5f5',
        dark: darkMode ? '#1e40af' : '#1565c0',
      },
      secondary: {
        main: darkMode ? '#8b5cf6' : '#9c27b0',
        light: darkMode ? '#a78bfa' : '#ba68c8',
        dark: darkMode ? '#7c3aed' : '#7b1fa2',
      },
      success: {
        main: darkMode ? '#10b981' : '#2e7d32',
      },
      warning: {
        main: darkMode ? '#f59e0b' : '#ed6c02',
      },
      error: {
        main: darkMode ? '#ef4444' : '#d32f2f',
      },
      background: {
        default: darkMode ? '#0f172a' : '#f8fafc',
        paper: darkMode ? '#1e293b' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h3: {
        fontWeight: 800,
        background: darkMode 
          ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
          : 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: darkMode 
              ? '0 10px 25px rgba(0, 0, 0, 0.3)'
              : '0 10px 25px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: darkMode 
                ? '0 20px 40px rgba(0, 0, 0, 0.4)'
                : '0 20px 40px rgba(0, 0, 0, 0.12)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 24px',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 12,
            margin: '0 4px',
            minHeight: 48,
          },
        },
      },
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'text/csv')) {
      setSelectedFile(file);
      setShowAlert(false);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (!e.target) return;
          const data = new Uint8Array(e.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          setExcelData(jsonData);
          console.log('Excel Data:', jsonData);
          console.log('Excel Headers:', Object.keys(jsonData[0] || {}));
          console.log('Total Rows:', jsonData.length);
        } catch (error) {
          console.error('Error reading Excel file:', error);
          setShowAlert(true);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setShowAlert(true);
      if (event.target) event.target.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !company || !orderDate) {
      setShowAlert(true);
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    setShowAlert(false);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('company_id', company);
      formData.append('order_date', orderDate);
      if (store) formData.append('store_id', store);

      // Use apiService for file upload (pass FormData and set headers)
      await apiService.post('/orders/upload-daily', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent: ProgressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });
      setUploadProgress(100);
      setIsUploading(false);
      alert('Upload successful!');
      setSelectedFile(null);
      setExcelData(null);
      setCompany('');
      setStore('');
      // Clear file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setIsUploading(false);
      setShowAlert(true);
      alert('Upload failed. Please check your file and try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processed': return 'success';
      case 'Processing': return 'warning';
      case 'Failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Processed': return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'Processing': return <Schedule sx={{ fontSize: 16 }} />;
      case 'Failed': return <Error sx={{ fontSize: 16 }} />;
      default: return <Schedule sx={{ fontSize: 16 }} />;
    }
  };

  const StatCard = ({ title, value, icon: Icon, gradient, delay = 0 }: { title: string, value: number, icon: any, gradient: string, delay?: number }) => (
    <Zoom in={true} timeout={500} style={{ transitionDelay: `${delay}ms` }}>
      <Card 
        sx={{ 
          height: { xs: '120px', sm: '140px' },
          background: gradient,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover::before': {
            opacity: 1,
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1, p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ height: '100%' }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h4"
                component="div" 
                fontWeight="bold" 
                sx={{ mb: 0.5, color: 'white', fontSize: { xs: '1.5rem', sm: '2rem' } }}
              >
                {value}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ color: 'rgba(255,255,255,0.9)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                {title}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
              <Icon sx={{ fontSize: { xs: 20, sm: 24 }, color: 'white' }} />
            </Avatar>
          </Stack>
        </CardContent>
      </Card>
    </Zoom>
  );

  // Fetch companies on mount
  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  // Fetch stores when company changes
  useEffect(() => {
    if (company) {
      (async () => {
        try {
          const data = await apiService.get(`/stores`, { company_id: company });
          if (!Array.isArray(data)) throw new Error('Malformed stores response');
          const transformedData = data.map((store: any) => ({
            id: store.id,
            name: store.store_name
          }));
          setStores(transformedData);
        } catch (error) {
          console.error('Error fetching stores:', error);
          setStores([]);
        }
      })();
    } else {
      setStores([]);
    }
    setStore(''); // Reset store selection when company changes
  }, [company]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', 
        transition: 'all 0.3s ease', minWidth: '77vw' }}>
        {/* App Bar */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            background: darkMode 
              ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
              : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            borderRadius: 0,
          }}
        >
          <Toolbar>
            <Dashboard sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Order Management System
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  icon={<LightMode />}
                  checkedIcon={<DarkMode />}
                />
              }
              label=""
            />
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Stats Cards - Adjusted for smaller size */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Total Uploads"
                value={orders.length}
                icon={Inventory}
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                delay={0}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Total Orders"
                value={orders.reduce((sum, order) => sum + order.orders, 0)}
                icon={TrendingUp}
                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                delay={100}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <StatCard
                title="Active Companies"
                value={new Set(orders.map(order => order.company)).size}
                icon={Business}
                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                delay={200}
              />
            </Grid>
          </Grid>

          {/* Main Content */}
          <Slide direction="up" in={true} timeout={600}>
            <Card elevation={0} sx={{ borderRadius: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  sx={{ px: 2 }}
                  variant={isMobile ? "scrollable" : "standard"}
                  scrollButtons="auto"
                >
                  <Tab 
                    icon={<CloudUpload />} 
                    label="Upload Orders" 
                    iconPosition="start"
                    sx={{ minHeight: 64 }}
                  />
                  <Tab 
                    icon={<Inventory />} 
                    label="Order History" 
                    iconPosition="start"
                    sx={{ minHeight: 64 }}
                  />
                  <Tab 
                    icon={<Settings />} 
                    label="Settings" 
                    iconPosition="start"
                    sx={{ minHeight: 64 }}
                  />
                </Tabs>
              </Box>

              {/* Upload Tab */}
              <TabPanel value={activeTab} index={0}>
                <Box sx={{ maxWidth: 800 }}>
                  <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
                    Upload Daily Orders
                  </Typography>
                  
                  {showAlert && (
                    <Slide direction="down" in={showAlert} timeout={300}>
                      <Alert 
                        severity="error" 
                        sx={{ mb: 3, borderRadius: 2 }}
                        onClose={() => setShowAlert(false)}
                      >
                        Please fill all required fields and select a valid Excel file (.xlsx)
                      </Alert>
                    </Slide>
                  )}
                  
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        fullWidth
                        label="Company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      >
                        {companies.map((comp) => (
                          <MenuItem key={comp.id} value={comp.id.toString()}>
                            {comp.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        fullWidth
                        label="Store (Optional)"
                        value={store}
                        onChange={(e) => setStore(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        disabled={!company}
                      >
                        {stores.map((st) => (
                          <MenuItem key={st.id} value={st.id.toString()}>
                            {st.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Order Date"
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <input
                        id="file-input"
                        type="file"
                        accept=".csv, .xlsx"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="file-input">
                        <Button
                          variant="outlined"
                          component="span"
                          fullWidth
                          startIcon={<FileUpload />}
                          sx={{ 
                            height: 56, 
                            justifyContent: 'flex-start',
                            borderRadius: 2,
                            borderWidth: 2,
                            '&:hover': { borderWidth: 2 }
                          }}
                        >
                          {selectedFile ? selectedFile.name : 'Choose Excel/CSV File'}
                        </Button>
                      </label>
                    </Grid>
                  </Grid>

                  {/* Display Excel Data Preview */}
                  {excelData && (
                    <Alert 
                      severity="success" 
                      sx={{ mb: 4, borderRadius: 2 }}
                    >
                      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                        Excel File Loaded Successfully!
                      </Typography>
                      <Typography variant="body2">
                        • Total Records: {excelData.length}<br/>
                        • Columns: {Object.keys(excelData[0] || {}).join(', ')}<br/>
                        • Data logged to console for inspection
                      </Typography>
                    </Alert>
                  )}

                  <Alert 
                    severity="info" 
                    sx={{ mb: 4, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)' }}
                  >
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      File Format Requirements:
                    </Typography>
                    <Typography variant="body2" component="div">
                      • File must be in Excel (.xlsx) or CSV format<br/>
                      • First row must contain column headers<br/>
                      • Must include columns: company_rider_id and order_count<br/>
                      • Rider Name column is optional for display purposes
                    </Typography>
                  </Alert>

                  {isUploading && (
                    <Fade in={isUploading}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Processing upload... {uploadProgress}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={uploadProgress} 
                          sx={{ borderRadius: 1, height: 8 }}
                        />
                      </Box>
                    </Fade>
                  )}

                  <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={handleUpload}
                    disabled={isUploading}
                    size="large"
                    sx={{ 
                      py: 1.5,
                      px: 4,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      }
                    }}
                  >
                    {isUploading ? 'Processing...' : 'Upload Orders'}
                  </Button>
                </Box>
              </TabPanel>

              {/* History Tab */}
              <TabPanel value={activeTab} index={1}>
                <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
                  Daily Orders Upload History
                </Typography>
                
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                        <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>File Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Upload Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Order Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Store</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Riders</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Orders</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order, index) => (
                        <Fade in={true} timeout={300} style={{ transitionDelay: `${index * 50}ms` }} key={order.id}>
                          <TableRow hover sx={{ '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }}>
                            <TableCell>
                              <Chip label={order.id} size="small" color="primary" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontFamily="monospace" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {order.fileName}
                              </Typography>
                            </TableCell>
                            <TableCell>{order.uploadDate}</TableCell>
                            <TableCell>{order.orderDate}</TableCell>
                            <TableCell>
                              <Chip 
                                label={order.company} 
                                color="primary" 
                                variant="filled" 
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                            <TableCell>{order.store}</TableCell>
                            <TableCell>
                              <Chip 
                                label={order.ridersCount} 
                                variant="outlined" 
                                size="small"
                                color="secondary"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1" fontWeight="600">
                                {order.orders}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={order.status} 
                                color={getStatusColor(order.status)} 
                                size="small"
                                icon={getStatusIcon(order.status)}
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                <IconButton 
                                  size="small" 
                                  color="primary" 
                                  sx={{ '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' } }}
                                  onClick={() => order.excelData && console.log('View Data:', order.excelData)}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="success" sx={{ '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.1)' } }}>
                                  <Download fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" sx={{ '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' } }}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        </Fade>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              {/* Settings Tab */}
              <TabPanel value={activeTab} index={2}>
                <Box sx={{ maxWidth: 600 }}>
                  <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
                    Order Settings
                  </Typography>
                  
                  <Card 
                    elevation={0} 
                    sx={{ 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.02)',
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`,
                      borderRadius: 3
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.main', 
                            width: 56, 
                            height: 56,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          }}
                        >
                          <Settings sx={{ fontSize: 28 }} />
                        </Avatar>
                        <Typography variant="h5" fontWeight={600}>
                          Default Order Amount
                        </Typography>
                      </Stack>
                      
                      <TextField
                        fullWidth
                        type="number"
                        label="Amount Per Order (₹)"
                        value={defaultAmount}
                        onChange={(e) => setDefaultAmount(Number(e.target.value))}
                        sx={{ 
                          mb: 3,
                          '& .MuiOutlinedInput-root': { borderRadius: 2 }
                        }}
                      />
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                        This default amount is used when calculating rider earnings during daily order uploads 
                        if no specific rate is defined elsewhere.
                      </Typography>
                      
                      <Button
                        variant="contained"
                        startIcon={<Settings />}
                        sx={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                          }
                        }}
                      >
                        Update Amount
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              </TabPanel>
            </Card>
          </Slide>
        </Container>
      </Box>
    </ThemeProvider>
  );
}