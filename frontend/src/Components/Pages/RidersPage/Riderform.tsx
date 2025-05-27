import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ChevronLeft,
  Person,
  Phone,
  Email,
  CalendarToday,
  LocationOn,
  CreditCard,
  Description,
  DirectionsCar,
  Visibility,
  VisibilityOff,
  Warning
} from '@mui/icons-material';

const RiderRegistrationForm = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    date_of_birth: '',
    phone_number: '',
    emergency_contact: '',
    address: '',
    blood_group: '',
    
    // Account Information
    username: '',
    email: '',
    password: '',
    
    // Bank Details
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
    upi_id: '',
    
    // ID & Documents
    id_proof: '',
    id_card_number: '',
    id_card_issue_date: '',
    id_card_expiry_date: '',
    documents: '',
    
    // Vehicle Information
    vehicle_type: '',
    vehicle_number: '',
    
    // Performance & Status
    performance_tier: 'medium',
    status: 'Active',
    joining_date: new Date().toISOString().split('T')[0], // Default to today
    last_certificate_date: '',
    created_by: 1,

    // Rider Documents
    rider_documents: [{
      document_type: '',
      document_number: '',
      document_file: null,
      expiry_date: '',
      verification_status: 'pending',
      remarks: '',
      verified_by: '',
      verification_date: ''
    }]
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear submit status
    if (submitStatus.message) {
      setSubmitStatus({ type: '', message: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.emergency_contact.trim()) newErrors.emergency_contact = 'Emergency contact is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone number validation (basic)
    if (formData.phone_number && !/^\d{10}$/.test(formData.phone_number.replace(/\s+/g, ''))) {
      newErrors.phone_number = 'Please enter a valid 10-digit phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateUsername = () => {
    const baseName = formData.full_name.toLowerCase().replace(/\s+/g, '').substring(0, 8);
    const timestamp = Date.now().toString().slice(-4);
    const username = baseName ? `${baseName}_${timestamp}` : `rider_${timestamp}`;
    
    setFormData(prev => ({
      ...prev,
      username: username
    }));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({
      ...prev,
      password: password
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fix the validation errors before submitting.'
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });
    
    try {
  // First create the user
  const userData = {
    username: formData.username,
    password: formData.password,
    email: formData.email,
    user_type: 'rider',
    full_name: formData.full_name,
    phone: formData.phone_number,
    address: formData.address,
    status: 'active',
    created_by: 1
  };

  if (!userData.password || userData.password.trim() === '') {
    setSubmitStatus({
      type: 'error',
      message: 'Password cannot be empty. Please enter or generate a password.'
    });
    setIsSubmitting(false);
    return;
  }

  console.log('Creating user:', userData);
  
  const userResponse = await fetch('http://localhost:4003/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!userResponse.ok) {
    const userError = await userResponse.json();
    setSubmitStatus({
      type: 'error',
      message: userError.error || 'Failed to create user',
    });
    setIsSubmitting(false);
    return;
  }

  const userResult = await userResponse.json();
  const userId = userResult.id;
  if (!userId) {
    setSubmitStatus({
      type: 'error',
      message: 'User creation failed: No user ID returned.',
    });
    setIsSubmitting(false);
    return;
  }

  let documentsValue = formData.documents;
  if (!documentsValue || documentsValue.trim() === '') {
    documentsValue = '{}';
  } else {
    try {
      JSON.parse(documentsValue);
    } catch (e) {
      setSubmitStatus({
        type: 'error',
        message: 'Documents field must be valid JSON.'
      });
      setIsSubmitting(false);
      return;
    }
  }

  const riderData = {
    user_id: userId, // Link to the created user
    rider_id: formData.full_name,
    rider_code: formData.username,
    address: formData.address,
    id_proof: formData.id_proof,
    emergency_contact: formData.emergency_contact,
    date_of_birth: formData.date_of_birth || null,
    blood_group: formData.blood_group,
    joining_date: formData.joining_date || null,
    bank_name: formData.bank_name,
    account_number: formData.account_number,
    ifsc_code: formData.ifsc_code,
    account_holder_name: formData.account_holder_name,
    upi_id: formData.upi_id,
    performance_tier: formData.performance_tier,
    last_certificate_date: formData.last_certificate_date || null,
    created_by: 1, // Add this like in Company form
    id_card_number: formData.id_card_number,
    id_card_issue_date: formData.id_card_issue_date || null,
    id_card_expiry_date: formData.id_card_expiry_date || null,
    documents: documentsValue,
    status: formData.status,
    vehicle_type: formData.vehicle_type,
    vehicle_number: formData.vehicle_number,
    id_card_path: '',
  };

  console.log('Creating rider:', riderData);
  
  const riderResponse = await fetch('http://localhost:4003/api/riders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(riderData),
  });

  const riderResult = await riderResponse.json();

  if (riderResponse.ok) {
    setSubmitStatus({
      type: 'success',
      message: `Rider registered successfully! User ID: ${userId}, Rider ID: ${riderResult.rider_id || riderResult.id}`
    });
    // Save rider_documents after rider is created
    if (formData.rider_documents && formData.rider_documents.length > 0) {
      for (const doc of formData.rider_documents) {
        // Prepare FormData for file upload if needed
        let payload;
        if (doc.document_file instanceof File) {
          payload = new FormData();
          payload.append('rider_id', riderResult.rider_id || riderResult.id);
          payload.append('document_type', doc.document_type);
          payload.append('document_number', doc.document_number);
          payload.append('expiry_date', doc.expiry_date);
          payload.append('verification_status', doc.verification_status);
          payload.append('remarks', doc.remarks);
          payload.append('verified_by', doc.verified_by);
          payload.append('verification_date', doc.verification_date);
          payload.append('document_file', doc.document_file);
        } else {
          payload = {
            rider_id: riderResult.rider_id || riderResult.id,
            document_type: doc.document_type,
            document_number: doc.document_number,
            document_file: doc.document_file || '',
            expiry_date: doc.expiry_date,
            verification_status: doc.verification_status,
            remarks: doc.remarks,
            verified_by: doc.verified_by,
            verification_date: doc.verification_date
          };
        }
        await fetch('http://localhost:4003/api/rider-documents', {
          method: 'POST',
          headers: payload instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
          body: payload instanceof FormData ? payload : JSON.stringify(payload)
        });
      }
    }
    // ... rest of success handling
  } else {
    throw new Error(riderResult.error || 'Failed to create rider');
  }
} catch (error) {
      console.error('Error:', error);
      setSubmitStatus({
        type: 'error',
        message: `Error: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentChange = (index, e) => {
    const { name, value, files } = e.target;
    setFormData(prev => {
      const docs = [...prev.rider_documents];
      docs[index][name] = name === 'document_file' ? files[0] : value;
      return { ...prev, rider_documents: docs };
    });
  };

  const SectionHeader = ({ icon, title }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 4 }}>
      {icon}
      <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
        {title}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: 1 }}>
        <Toolbar>
          <IconButton sx={{ color: '#0891b2', mr: 1 }}>
            <ChevronLeft />
          </IconButton>
          <Typography sx={{ color: '#0891b2', cursor: 'pointer' }}>
            Back to Riders
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Rider Information
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ overflow: 'hidden' }}>
          {/* Title */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
            <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
              <Person sx={{ mr: 2, color: '#0891b2' }} />
              Add New Rider
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Status Messages */}
            {submitStatus.message && (
              <Alert 
                severity={submitStatus.type} 
                sx={{ mb: 3 }}
                onClose={() => setSubmitStatus({ type: '', message: '' })}
              >
                {submitStatus.message}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <SectionHeader 
                icon={<Person sx={{ color: '#0891b2' }} />} 
                title="Personal Information" 
              />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    error={!!errors.full_name}
                    helperText={errors.full_name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    error={!!errors.phone_number}
                    helperText={errors.phone_number || "Enter 10-digit phone number"}
                    placeholder="9876543210"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    error={!!errors.emergency_contact}
                    helperText={errors.emergency_contact}
                    placeholder="Emergency contact number"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    variant="outlined"
                    placeholder="Enter full address"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Blood Group</InputLabel>
                    <Select
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleInputChange}
                      label="Blood Group"
                    >
                      <MenuItem value="">Select Blood Group</MenuItem>
                      {bloodGroups.map(group => (
                        <MenuItem key={group} value={group}>{group}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Account Information */}
              <SectionHeader 
                icon={<Email sx={{ color: '#0891b2' }} />} 
                title="Account Information" 
              />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      error={!!errors.username}
                      helperText={errors.username}
                      placeholder="Enter username"
                    />
                    <Button
                      variant="contained"
                      onClick={generateUsername}
                      disabled={!formData.full_name.trim()}
                      sx={{ 
                        bgcolor: '#0891b2', 
                        '&:hover': { bgcolor: '#0e7490' }, 
                        minWidth: 100,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Generate
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    error={!!errors.email}
                    helperText={errors.email}
                    placeholder="Enter email address"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      error={!!errors.password}
                      helperText={errors.password}
                      placeholder="Enter password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={generatePassword}
                      sx={{ 
                        bgcolor: '#0891b2', 
                        '&:hover': { bgcolor: '#0e7490' }, 
                        minWidth: 100,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Generate
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {/* Bank Details */}
              <SectionHeader 
                icon={<CreditCard sx={{ color: '#0891b2' }} />} 
                title="Bank Details" 
              />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Bank Name"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Account Number"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="IFSC Code"
                    name="ifsc_code"
                    value={formData.ifsc_code}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Account Holder Name"
                    name="account_holder_name"
                    value={formData.account_holder_name}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="UPI ID"
                    name="upi_id"
                    value={formData.upi_id}
                    onChange={handleInputChange}
                    variant="outlined"
                    placeholder="example@paytm"
                  />
                </Grid>
              </Grid>

           

              {/* Vehicle Information */}
              <SectionHeader 
                icon={<DirectionsCar sx={{ color: '#0891b2' }} />} 
                title="Vehicle Information" 
              />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Vehicle Type</InputLabel>
                    <Select
                      name="vehicle_type"
                      value={formData.vehicle_type}
                      onChange={handleInputChange}
                      label="Vehicle Type"
                    >
                      <MenuItem value="">Select Vehicle Type</MenuItem>
                      <MenuItem value="2_wheeler">2 Wheeler</MenuItem>
                      <MenuItem value="3_wheeler">3 Wheeler</MenuItem>
                      <MenuItem value="4_wheeler">4 Wheeler</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Vehicle Number"
                    name="vehicle_number"
                    value={formData.vehicle_number}
                    onChange={handleInputChange}
                    variant="outlined"
                    placeholder="XX00XX0000"
                  />
                </Grid>
              </Grid>

              {/* Additional Information */}
              <SectionHeader 
                icon={<CalendarToday sx={{ color: '#0891b2' }} />} 
                title="Additional Information" 
              />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Joining Date"
                    name="joining_date"
                    type="date"
                    value={formData.joining_date}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Certificate Date"
                    name="last_certificate_date"
                    type="date"
                    value={formData.last_certificate_date}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Performance Tier</InputLabel>
                    <Select
                      name="performance_tier"
                      value={formData.performance_tier}
                      onChange={handleInputChange}
                      label="Performance Tier"
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      label="Status"
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Rider Documents */}
              <SectionHeader 
                icon={<Description sx={{ color: '#0891b2' }} />} 
                title="Rider Documents" 
              />
              {formData.rider_documents.map((doc, idx) => (
                <Grid container spacing={3} key={idx} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Document Type</InputLabel>
                      <Select
                        name="document_type"
                        value={doc.document_type}
                        onChange={e => handleDocumentChange(idx, e)}
                        label="Document Type"
                      >
                        <MenuItem value="aadhar_card">Aadhar Card</MenuItem>
                        <MenuItem value="pan_card">PAN Card</MenuItem>
                        <MenuItem value="driving_license">Driving License</MenuItem>
                        <MenuItem value="insurance">Insurance</MenuItem>
                        <MenuItem value="bank_details">Bank Details</MenuItem>
                        <MenuItem value="upi_id">UPI ID</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Document Number"
                      name="document_number"
                      value={doc.document_number}
                      onChange={e => handleDocumentChange(idx, e)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="contained"
                      component="label"
                      sx={{ width: '100%' }}
                    >
                      Upload File
                      <input
                        type="file"
                        name="document_file"
                        hidden
                        onChange={e => handleDocumentChange(idx, e)}
                      />
                    </Button>
                    {doc.document_file && <Typography variant="caption">{doc.document_file.name}</Typography>}
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      name="expiry_date"
                      type="date"
                      value={doc.expiry_date}
                      onChange={e => handleDocumentChange(idx, e)}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Verification Status</InputLabel>
                      <Select
                        name="verification_status"
                        value={doc.verification_status}
                        onChange={e => handleDocumentChange(idx, e)}
                        label="Verification Status"
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                      
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Remarks"
                      name="remarks"
                      value={doc.remarks}
                      onChange={e => handleDocumentChange(idx, e)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Verified By (User ID)"
                      name="verified_by"
                      value={doc.verified_by}
                      onChange={e => handleDocumentChange(idx, e)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Verification Date"
                      name="verification_date"
                      type="date"
                      value={doc.verification_date}
                      onChange={e => handleDocumentChange(idx, e)}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              ))}
              <Button variant="outlined" onClick={() => setFormData(prev => ({ ...prev, rider_documents: [...prev.rider_documents, { document_type: '', document_number: '', document_file: null, expiry_date: '', verification_status: 'pending', remarks: '', verified_by: '', verification_date: '' }] }))} sx={{ mb: 2 }}>
                Add Another Document
              </Button>

              {/* Submit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  sx={{ 
                    bgcolor: '#0891b2', 
                    '&:hover': { bgcolor: '#0e7490' },
                    px: 4,
                    py: 1.5,
                    fontWeight: 500,
                    position: 'relative'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                      Registering...
                    </>
                  ) : (
                    'Register Rider'
                  )}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
};

export default RiderRegistrationForm;