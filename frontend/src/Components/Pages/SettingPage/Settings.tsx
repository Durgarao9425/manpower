import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  PhotoCamera,
  Business,
  Phone,
  Email,
  LocationOn,
  Save,
  Refresh,
  Percent,
  AttachMoney,
  TrendingUp
} from '@mui/icons-material';

const CompanySettings = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_mobile: '',
    company_gst: '',
    company_address: '',
    industry: 'Man Power Delivery',
    logo: '',
    tax_rate: '',
    commission_rate: '',
    advance_limit: '',
    payment_terms: 7
  });

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [logoPreview, setLogoPreview] = useState('');

  // Simulate fetching company data
  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual axios call
      // const response = await axios.get('http://localhost:4003/companies');
      // setFormData(response.data);
      
      // For demo purposes, setting some default values
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          company_name: 'Man Power Solutions Ltd.',
          company_email: 'info@manpowerdelivery.com',
          company_phone: '+1-555-0123',
          company_mobile: '+1-555-0124',
          tax_rate: '18',
          commission_rate: '12',
          advance_limit: '40'
        }));
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
      showNotification('Error fetching company data', 'error');
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
        setFormData({
          ...formData,
          logo: file.name // In real app, you'd upload to server and get URL
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      // Replace with actual axios call
      // await axios.put('http://localhost:4003/companies', formData);
      
      // Simulate API call
      setTimeout(() => {
        setSaveLoading(false);
        showNotification('Company settings saved successfully!', 'success');
      }, 1500);
    } catch (error) {
      setSaveLoading(false);
      showNotification('Error saving settings. Please try again.', 'error');
    }
  };

  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto', bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          mb: 3
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Company Settings
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Manage your man power delivery company information and business settings
        </Typography>
        <Chip 
          label="Man Power Delivery Platform" 
          sx={{ 
            mt: 2, 
            bgcolor: 'rgba(255,255,255,0.2)', 
            color: 'white',
            fontWeight: 'bold'
          }} 
        />
      </Paper>

      <Grid container spacing={3}>
        {/* Company Profile Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                Company Logo
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                <Avatar
                  src={logoPreview || '/api/placeholder/120/120'}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto',
                    border: '4px solid #667eea',
                    boxShadow: '0 8px 24px rgba(102,126,234,0.3)'
                  }}
                >
                  <Business sx={{ fontSize: 60 }} />
                </Avatar>
                <IconButton
                  color="primary"
                  component="label"
                  sx={{ 
                    position: 'absolute', 
                    bottom: -5, 
                    right: -5,
                    bgcolor: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <PhotoCamera />
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleLogoUpload}
                  />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Upload company logo (JPG, PNG)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Company Information */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold" sx={{ mb: 3 }}>
                <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                Company Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={formData.company_name}
                    onChange={handleInputChange('company_name')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.company_email}
                    onChange={handleInputChange('company_email')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="GST Number"
                    value={formData.company_gst}
                    onChange={handleInputChange('company_gst')}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.company_phone}
                    onChange={handleInputChange('company_phone')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    value={formData.company_mobile}
                    onChange={handleInputChange('company_mobile')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Address"
                    multiline
                    rows={3}
                    value={formData.company_address}
                    onChange={handleInputChange('company_address')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <LocationOn color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Business Settings */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold" sx={{ mb: 3 }}>
                <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                Business Settings
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Tax Rate (%)"
                    type="number"
                    value={formData.tax_rate}
                    onChange={handleInputChange('tax_rate')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Percent color="primary" />
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, max: 100 }
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Commission Rate (%)"
                    type="number"
                    value={formData.commission_rate}
                    onChange={handleInputChange('commission_rate')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney color="primary" />
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, max: 100 }
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Advance Limit (% of weekly earnings)"
                    type="number"
                    value={formData.advance_limit}
                    onChange={handleInputChange('advance_limit')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Percent color="primary" />
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, max: 100 }
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchCompanyData}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 'bold'
              }}
            >
              Reset Changes
            </Button>
            <Button
              variant="contained"
              startIcon={saveLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
              onClick={handleSave}
              disabled={saveLoading}
              sx={{ 
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                boxShadow: '0 4px 16px rgba(102,126,234,0.4)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(102,126,234,0.6)',
                }
              }}
            >
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanySettings;