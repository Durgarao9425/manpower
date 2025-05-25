import React, { useState } from 'react';
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
  Divider
} from '@mui/material';
import {
  CloudUpload,
  Download,
  Visibility,
  Delete,
  Settings,
  TrendingUp,
  Inventory,
  Business
} from '@mui/icons-material';

// Dummy data for demonstration
const dummyOrders = [
  {
    id: 1,
    fileName: 'daily_orders_2025-05-25_001439.xlsx',
    uploadDate: '2025-05-25 18:44',
    orderDate: '2025-05-25',
    company: 'Big Basket',
    store: 'Kukatpally',
    ridersCount: 15,
    orders: 250,
    status: 'Processed'
  },
  {
    id: 2,
    fileName: 'daily_orders_2025-05-24_224947.xlsx',
    uploadDate: '2025-05-24 17:19',
    orderDate: '2025-05-24',
    company: 'Big Basket',
    store: 'Kukatpally',
    ridersCount: 12,
    orders: 180,
    status: 'Processed'
  },
  {
    id: 3,
    fileName: 'daily_orders_2025-05-23_112233.xlsx',
    uploadDate: '2025-05-23 14:30',
    orderDate: '2025-05-23',
    company: 'Swiggy',
    store: 'Gachibowli',
    ridersCount: 20,
    orders: 320,
    status: 'Processing'
  }
];

const companies = ['Big Basket', 'Swiggy', 'Zomato', 'Amazon Fresh'];
const stores = ['Kukatpally', 'Gachibowli', 'Madhapur', 'Kondapur', 'Miyapur'];

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function OrderManagementSystem() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [company, setCompany] = useState('');
  const [store, setStore] = useState('');
  const [orderDate, setOrderDate] = useState('2025-05-25');
  const [defaultAmount, setDefaultAmount] = useState(40);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [orders, setOrders] = useState(dummyOrders);
  const [showAlert, setShowAlert] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setSelectedFile(file);
      setShowAlert(false);
    } else {
      setShowAlert(true);
      event.target.value = '';
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !company || !orderDate) {
      setShowAlert(true);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setShowAlert(false);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          const newOrder = {
            id: orders.length + 1,
            fileName: selectedFile.name,
            uploadDate: new Date().toLocaleString(),
            orderDate,
            company,
            store: store || 'Not specified',
            ridersCount: Math.floor(Math.random() * 20) + 5,
            orders: Math.floor(Math.random() * 200) + 100,
            status: 'Processing'
          };
          
          setOrders([newOrder, ...orders]);
          
          setSelectedFile(null);
          setCompany('');
          setStore('');
          document.getElementById('file-input').value = '';
          
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processed': return 'success';
      case 'Processing': return 'warning';
      case 'Failed': return 'error';
      default: return 'default';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: `${color}.100`, color: `${color}.600` }}>
            <Icon />
          </Avatar>
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4
      ,
      minWidth:'77vw'
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
          Order Management System
        </Typography>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Total Uploads"
              value={orders.length}
              icon={Inventory}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Total Orders"
              value={orders.reduce((sum, order) => sum + order.orders, 0)}
              icon={TrendingUp}
              color="success"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Active Companies"
              value={new Set(orders.map(order => order.company)).size}
              icon={Business}
              color="secondary"
            />
          </Grid>
        </Grid>

        {/* Main Content */}
        <Card elevation={3}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{ px: 2 }}
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
              <Typography variant="h5" gutterBottom>
                Upload Daily Orders
              </Typography>
              
              {showAlert && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  Please fill all required fields and select a valid Excel file (.xlsx)
                </Alert>
              )}
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  >
                    {companies.map((comp) => (
                      <MenuItem key={comp} value={comp}>
                        {comp}
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
                  >
                    {stores.map((st) => (
                      <MenuItem key={st} value={st}>
                        {st}
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
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <input
                    id="file-input"
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="file-input">
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                      startIcon={<CloudUpload />}
                      sx={{ height: 56, justifyContent: 'flex-start' }}
                    >
                      {selectedFile ? selectedFile.name : 'Choose Excel File'}
                    </Button>
                  </label>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  File Format Requirements:
                </Typography>
                <Typography variant="body2" component="div">
                  • File must be in Excel (.xlsx) format<br/>
                  • First row must contain column headers<br/>
                  • Must include columns: company_rider_id and order_count<br/>
                  • Rider Name column is optional for display purposes
                </Typography>
              </Alert>

              {isUploading && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Uploading... {uploadProgress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
              )}

              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={handleUpload}
                disabled={isUploading}
                size="large"
              >
                {isUploading ? 'Processing...' : 'Upload Orders'}
              </Button>
            </Box>
          </TabPanel>

          {/* History Tab */}
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h5" gutterBottom>
              Daily Orders Upload History
            </Typography>
            
            <TableContainer component={Paper} elevation={1}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>ID</TableCell>
                    <TableCell>File Name</TableCell>
                    <TableCell>Upload Date</TableCell>
                    <TableCell>Order Date</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Store</TableCell>
                    <TableCell>Riders</TableCell>
                    <TableCell>Orders</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {order.fileName}
                        </Typography>
                      </TableCell>
                      <TableCell>{order.uploadDate}</TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.company} 
                          color="primary" 
                          variant="outlined" 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{order.store}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.ridersCount} 
                          variant="outlined" 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {order.orders}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={order.status} 
                          color={getStatusColor(order.status)} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                          <IconButton size="small" color="success">
                            <Download />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Settings Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ maxWidth: 600 }}>
              <Typography variant="h5" gutterBottom>
                Order Settings
              </Typography>
              
              <Card elevation={1} sx={{ bgcolor: 'grey.50' }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'primary.100', color: 'primary.600' }}>
                      <Settings />
                    </Avatar>
                    <Typography variant="h6">
                      Default Order Amount
                    </Typography>
                  </Stack>
                  
                  <TextField
                    fullWidth
                    type="number"
                    label="Amount Per Order (₹)"
                    value={defaultAmount}
                    onChange={(e) => setDefaultAmount(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    This default amount is used when calculating rider earnings during daily order uploads 
                    if no specific rate is defined elsewhere.
                  </Typography>
                  
                  <Button
                    variant="contained"
                    startIcon={<Settings />}
                  >
                    Update Amount
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>
        </Card>
      </Container>
    </Box>
  );
}