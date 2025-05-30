import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  IconButton,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const AddEarningModal = ({ 
  open, 
  onClose, 
  onSave, 
  editData = null,
  riders = [],
  companies = []
}) => {
  const [formData, setFormData] = useState({
    rider: '',
    company: '',
    earningDate: '',
    orderCount: '',
    amount: '',
    status: 'pending'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        rider: editData.rider || '',
        company: editData.company || '',
        earningDate: editData.earningDate || '',
        orderCount: editData.orderCount || '',
        amount: editData.amount || '',
        status: editData.status || 'pending'
      });
    } else {
      setFormData({
        rider: '',
        company: '',
        earningDate: '',
        orderCount: '',
        amount: '',
        status: 'pending'
      });
    }
    setErrors({});
  }, [editData, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rider.trim()) {
      newErrors.rider = 'Rider is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    if (!formData.earningDate) {
      newErrors.earningDate = 'Earning date is required';
    }

    if (!formData.orderCount || formData.orderCount <= 0) {
      newErrors.orderCount = 'Order count must be greater than 0';
    }

    if (!formData.amount || parseFloat(formData.amount.replace(/[₹,]/g, '')) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const savedData = {
        ...formData,
        id: editData?.id || Date.now(),
        orderCount: parseInt(formData.orderCount),
        amount: formData.amount.startsWith('₹') ? formData.amount : `₹${formData.amount}`
      };
      
      onSave(savedData);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      rider: '',
      company: '',
      earningDate: '',
      orderCount: '',
      amount: '',
      status: 'pending'
    });
    setErrors({});
    onClose();
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'settled', label: 'Settled' }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
            {editData ? 'Edit Earning' : 'Add New Earning'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ py: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.rider}>
              <InputLabel>Rider *</InputLabel>
              <Select
                value={formData.rider}
                label="Rider *"
                onChange={(e) => handleChange('rider', e.target.value)}
              >
                {riders.map((rider) => (
                  <MenuItem key={rider.value} value={rider.value}>
                    {rider.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.rider && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                  {errors.rider}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.company}>
              <InputLabel>Company *</InputLabel>
              <Select
                value={formData.company}
                label="Company *"
                onChange={(e) => handleChange('company', e.target.value)}
              >
                {companies.map((company) => (
                  <MenuItem key={company.value} value={company.value}>
                    {company.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.company && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                  {errors.company}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Earning Date *"
              type="date"
              value={formData.earningDate}
              onChange={(e) => handleChange('earningDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!errors.earningDate}
              helperText={errors.earningDate}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Order Count *"
              type="number"
              value={formData.orderCount}
              onChange={(e) => handleChange('orderCount', e.target.value)}
              error={!!errors.orderCount}
              helperText={errors.orderCount}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Amount *"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              placeholder="₹0.00"
              error={!!errors.amount}
              helperText={errors.amount}
              InputProps={{
                startAdornment: !formData.amount.startsWith('₹') && formData.amount ? '₹' : ''
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={handleClose}
          startIcon={<CancelIcon />}
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<SaveIcon />}
          sx={{ minWidth: 100 }}
        >
          {editData ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEarningModal;