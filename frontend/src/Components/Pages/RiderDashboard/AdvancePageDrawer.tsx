import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  Button,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  Paper,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  Close,
  TrendingUp,
  AccountBalanceWallet,
  RequestQuote,
  Payment,
  Pending,
  MonetizationOn
} from '@mui/icons-material';
import axios from 'axios';

interface CardData {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
}

interface AdvanceFormData {
  amount: string;
  remarks: string;
}

const Orders: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState<AdvanceFormData>({
    amount: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Mock API data - replace with actual API call
  const advanceData = {
    dateRange: '2025-05-22 to 2025-05-31',
    totalOrders: 500,
    totalEarnings: 20000.00,
    maxAdvancePercentage: 70,
    maxAdvanceAmount: 14000.00,
    alreadyRequested: 0.00,
    remainingEligible: 14000.00
  };

  const orderCards: CardData[] = [
    { 
      title: 'Total Orders', 
      value: 45, 
      color: '#2196f3',
      icon: <TrendingUp />
    },
    { 
      title: 'Weekly Earnings', 
      value: '₹8,750', 
      color: '#4caf50',
      icon: <AccountBalanceWallet />
    },
    { 
      title: 'Advance Request', 
      value: '₹2,000', 
      color: '#ff9800',
      icon: <RequestQuote />
    },
    { 
      title: 'Advance Paid', 
      value: '₹1,500', 
      color: '#9c27b0',
      icon: <Payment />
    },
    { 
      title: 'Advance Pending', 
      value: '₹500', 
      color: '#f44336',
      icon: <Pending />
    },
    { 
      title: 'Due Amount', 
      value: '₹300', 
      color: '#795548',
      icon: <MonetizationOn />
    },
  ];

  const handleCardClick = (title: string) => {
    if (title === 'Advance Request') {
      setDrawerOpen(true);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setFormData({ amount: '', remarks: '' });
  };

  const handleInputChange = (field: keyof AdvanceFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Mock API call - replace with actual endpoint
      const response = await axios.post('/api/advance-request', {
        amount: parseFloat(formData.amount),
        remarks: formData.remarks,
        dateRange: advanceData.dateRange
      });
      
      console.log('Request submitted:', response.data);
      
      // Show success message and close drawer
      alert('Advance request submitted successfully!');
      handleCloseDrawer();
      
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const InfoCard: React.FC<CardData> = ({ title, value, color, icon }) => (
    <Card 
      sx={{ 
        cursor: title === 'Advance Request' ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': title === 'Advance Request' ? {
          transform: 'translateY(-4px)',
          boxShadow: 4
        } : {},
        height: '100%'
      }}
      onClick={() => handleCardClick(title)}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                color: color,
                fontWeight: 'bold',
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: color, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3, 
          fontWeight: 'bold', 
          color: '#333',
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}
      >
        Orders Overview
      </Typography>

      {/* Cards Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {orderCards.map((card, index) => (
          <Grid item xs={6} sm={4} md={2} key={index}>
            <InfoCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Advance Payment Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400 },
            maxWidth: '100vw'
          }
        }}
      >
        {/* Header */}
        <AppBar position="sticky" color="primary" elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseDrawer}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Request Advance Payment
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseDrawer}
            >
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Content */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Request advance for all uploaded orders this week:
          </Typography>

          {/* Order Summary */}
          <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Orders from {advanceData.dateRange}
            </Typography>
            
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Total Orders</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {advanceData.totalOrders}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Total Earnings</Typography>
                <Typography variant="body2" fontWeight="bold">
                  ₹{advanceData.totalEarnings.toFixed(2)}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">Max Advance</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip 
                    label={`${advanceData.maxAdvancePercentage}%`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="body2" fontWeight="bold">
                    ₹{advanceData.maxAdvanceAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Already Requested</Typography>
                <Typography variant="body2" fontWeight="bold">
                  ₹{advanceData.alreadyRequested.toFixed(2)}
                </Typography>
              </Box>
              
              <Divider />
              
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" fontWeight="bold">Remaining Eligible</Typography>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  ₹{advanceData.remainingEligible.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Form */}
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Amount to Request"
              type="number"
              value={formData.amount}
              onChange={handleInputChange('amount')}
              helperText={`Maximum amount: ₹${advanceData.maxAdvanceAmount.toFixed(2)}`}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
              }}
              inputProps={{
                max: advanceData.maxAdvanceAmount,
                min: 0,
                step: 0.01
              }}
            />

            <TextField
              fullWidth
              label="Remarks (Optional)"
              multiline
              rows={4}
              value={formData.remarks}
              onChange={handleInputChange('remarks')}
              placeholder="Add any additional comments..."
            />
          </Stack>
        </Box>

        {/* Footer Buttons */}
        <Box sx={{ p: 3, pt: 0 }}>
          <Stack spacing={2}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={!formData.amount || loading}
              sx={{ py: 1.5 }}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleCloseDrawer}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Orders;