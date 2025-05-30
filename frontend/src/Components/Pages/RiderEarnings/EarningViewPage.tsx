import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  IconButton,
  Card,
  CardContent,
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  ShoppingCart as ShoppingCartIcon,
  AccountBalanceWallet as WalletIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  Done as ApprovedIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Timeline as TimelineIcon,
  LocalShipping as DeliveryIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

const EarningViewPage = ({ earningData, onBack, onEdit }) => {
  if (!earningData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="text.secondary" align="center">
          No earning data found
        </Typography>
      </Container>
    );
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <ApprovedIcon color="success" />;
      case 'rejected':
        return <CancelIcon color="error" />;
      case 'settled':
        return <CheckCircleIcon color="primary" />;
      default:
        return <PendingIcon color="warning" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'settled':
        return 'primary';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0.00';
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', flex: 1 }}>
          Earning Details
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            size="small"
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            size="small"
          >
            Email
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => onEdit(earningData)}
          >
            Edit
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Information Card */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Earning ID: #{earningData.id}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Created on {formatDate(earningData.createdDate || earningData.earningDate)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getStatusIcon(earningData.status)}
                <Chip
                  label={earningData.status?.toUpperCase() || 'PENDING'}
                  color={getStatusColor(earningData.status)}
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Rider and Company Information */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <PersonIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Rider Information
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Name:</strong> {earningData.rider || 'N/A'}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Contact:</strong> {earningData.riderContact || '+91 9876543210'}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Employee ID:</strong> {earningData.riderId || 'EMP001'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Company Information
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Name:</strong> {earningData.company || 'N/A'}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Location:</strong> {earningData.companyLocation || 'Hyderabad'}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Contract ID:</strong> {earningData.contractId || 'CON001'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* Earning Details */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Earning Breakdown
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                  <CalendarIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {formatDate(earningData.earningDate)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Earning Date
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                  <ShoppingCartIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {earningData.orderCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                  <WalletIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(earningData.amount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Additional Details */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Earning Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Base Rate:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(earningData.baseRate || earningData.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Incentives:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(earningData.incentives || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Deductions:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(earningData.deductions || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Working Hours:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {earningData.workingHours || 'N/A'} hours
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Payment Details */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Payment Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Payment Method
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {earningData.paymentMethod || 'Bank Transfer'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Settlement Date
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {formatDate(earningData.settlementDate) || 'Pending'}
                </Typography>
              </Grid>
            </Grid>

            {earningData.bankDetails && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Bank Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Account Number:
                    </Typography>
                    <Typography variant="body1">
                      {earningData.bankDetails.accountNumber || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Bank Name:
                    </Typography>
                    <Typography variant="body1">
                      {earningData.bankDetails.bankName || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Status Timeline */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Status Timeline
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Created
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(earningData.createdDate)}
                  </Typography>
                </Box>
              </Box>
              
              {earningData.status !== 'pending' && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getStatusIcon(earningData.status)}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {earningData.status?.charAt(0).toUpperCase() + earningData.status?.slice(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(earningData.statusDate)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Quick Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Quick Actions
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<DeliveryIcon />}
                fullWidth
                disabled={earningData.status === 'settled'}
              >
                Track Delivery
              </Button>
              <Button
                variant="outlined"
                startIcon={<PaymentIcon />}
                fullWidth
                disabled={earningData.status !== 'approved'}
              >
                Process Payment
              </Button>
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                fullWidth
              >
                Send Notification
              </Button>
            </Box>
          </Paper>

          {/* Notes */}
          {earningData.notes && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Notes
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {earningData.notes}
                </Typography>
              </Alert>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default EarningViewPage;