import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Divider,
} from "@mui/material";
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
  Warning,
  Assignment,
  Upload,
} from "@mui/icons-material";
import apiService from "../../../services/apiService";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import type { SelectChangeEvent } from '@mui/material/Select';
import type { AlertColor } from '@mui/material/Alert';

interface RiderRegistrationFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

interface RiderDocument {
  file: File | null;
  preview: string;
}

interface RiderDocuments {
  id_proof: RiderDocument;
  address_proof: RiderDocument;
  vehicle_registration: RiderDocument;
  driving_license: RiderDocument;
  insurance: RiderDocument;
  other: RiderDocument;
}

interface FormData {
  rider_id: string;
  user_id: string;
  rider_code: string;
  id_proof: string;
  emergency_contact: string;
  date_of_birth: string;
  blood_group: string;
  joining_date: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  upi_id: string;
  id_card_path: string;
  performance_tier: 'low' | 'medium' | 'high';
  last_certificate_date: string;
  created_by: string;
  id_card_number: string;
  id_card_issue_date: string;
  id_card_expiry_date: string;
  documents: any[];
  status: 'Active' | 'Inactive';
  vehicle_type: '2_wheeler' | '3_wheeler' | '4_wheeler';
  vehicle_number: string;
  rider_documents: RiderDocuments;
  // User fields
  full_name: string;
  phone_number: string;
  email: string;
  username: string;
  password: string;
  address: string;
}

interface FormErrors {
  [key: string]: string;
}

interface SubmitStatus {
  type: AlertColor;
  message: string;
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    {icon}
    <Typography variant="h6" sx={{ ml: 1 }}>
      {title}
    </Typography>
  </Box>
);

const RiderRegistrationForm: React.FC<RiderRegistrationFormProps> = ({
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<FormData>({
    rider_id: '',
    user_id: '',
    rider_code: '',
    id_proof: '',
    emergency_contact: '',
    date_of_birth: '',
    blood_group: '',
    joining_date: new Date().toISOString().split('T')[0],
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
    upi_id: '',
    id_card_path: '',
    performance_tier: 'low',
    last_certificate_date: '',
    created_by: '',
    id_card_number: '',
    id_card_issue_date: '',
    id_card_expiry_date: '',
    documents: [],
    status: 'Active',
    vehicle_type: '2_wheeler',
    vehicle_number: '',
    rider_documents: {
      id_proof: { file: null, preview: '' },
      address_proof: { file: null, preview: '' },
      vehicle_registration: { file: null, preview: '' },
      driving_license: { file: null, preview: '' },
      insurance: { file: null, preview: '' },
      other: { file: null, preview: '' }
    },
    // User fields
    full_name: '',
    phone_number: '',
    email: '',
    username: '',
    password: '',
    address: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ type: 'info', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch rider data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchRiderData(id);
    }
  }, [id, isEditMode]);

  const fetchRiderData = async (riderId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching rider data for ID:', riderId);
      
      const response = await apiService.get(`/riders/${riderId}`);
      console.log('Rider data received:', response.data);
      
      const riderData = response.data;
      
      // Helper function to format date
      const formatDate = (dateValue: any): string => {
        if (!dateValue) return '';
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return '';
          return date.toISOString().split('T')[0];
        } catch (e) {
          console.error('Error formatting date:', dateValue, e);
          return '';
        }
      };

      // Create the new form data object
      const newFormData = {
        rider_id: riderData.rider_id || '',
        user_id: riderData.user_id || '',
        rider_code: riderData.rider_code || '',
        id_proof: riderData.id_proof || '',
        emergency_contact: riderData.emergency_contact || '',
        date_of_birth: formatDate(riderData.date_of_birth),
        blood_group: riderData.blood_group || '',
        joining_date: formatDate(riderData.joining_date) || new Date().toISOString().split('T')[0],
        bank_name: riderData.bank_name || '',
        account_number: riderData.account_number || '',
        ifsc_code: riderData.ifsc_code || '',
        account_holder_name: riderData.account_holder_name || '',
        upi_id: riderData.upi_id || '',
        id_card_path: riderData.id_card_path || '',
        performance_tier: riderData.performance_tier || 'low',
        last_certificate_date: formatDate(riderData.last_certificate_date),
        created_by: riderData.created_by || '',
        id_card_number: riderData.id_card_number || '',
        id_card_issue_date: formatDate(riderData.id_card_issue_date),
        id_card_expiry_date: formatDate(riderData.id_card_expiry_date),
        documents: riderData.documents || [],
        status: riderData.status || 'Active',
        vehicle_type: riderData.vehicle_type || '2_wheeler',
        vehicle_number: riderData.vehicle_number || '',
        rider_documents: {
          id_proof: { 
            file: null, 
            preview: riderData.id_proof || '' 
          },
          address_proof: { 
            file: null, 
            preview: riderData.address_proof || '' 
          },
          vehicle_registration: { 
            file: null, 
            preview: riderData.vehicle_registration || '' 
          },
          driving_license: { 
            file: null, 
            preview: riderData.driving_license || '' 
          },
          insurance: { 
            file: null, 
            preview: riderData.insurance || '' 
          },
          other: { 
            file: null, 
            preview: riderData.other || '' 
          }
        },
        // User fields
        full_name: riderData.full_name || '',
        phone_number: riderData.phone_number || '',
        email: riderData.email || '',
        username: riderData.username || '',
        password: '', // Don't populate password in edit mode
        address: riderData.address || ''
      };

      console.log('Setting new form data:', newFormData);
      setFormData(newFormData);
      console.log('Form data after setting:', formData);

    } catch (error: any) {
      console.error('Error fetching rider data:', error);
      setError(
        error.response?.data?.message || 
        'Failed to load rider data. Please try again.'
      );
      setSubmitStatus({
        type: 'error',
        message: 'Failed to load rider data. Please check the rider ID and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const preview = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        rider_documents: {
          ...prev.rider_documents,
          [name]: { file, preview }
        }
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Required fields validation - adjusted for edit mode
    const requiredFields = [
      'full_name',
      'phone_number',
      'emergency_contact',
      'blood_group',
      'bank_name',
      'account_number',
      'ifsc_code',
      'account_holder_name',
      'vehicle_type',
      'vehicle_number'
    ];

    // Add username and email as required only in create mode
    if (!isEditMode) {
      requiredFields.push('username', 'email');
    }

    // Password is required only in create mode
    if (!isEditMode && !formData.password) {
      newErrors.password = 'Password is required';
    }

    requiredFields.forEach(field => {
      const value = formData[field as keyof FormData];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field] = `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
      }
    });

    // Email validation (if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone number validation
    if (formData.phone_number && !/^\d{10}$/.test(formData.phone_number.replace(/\D/g, ''))) {
      newErrors.phone_number = 'Phone number must be 10 digits';
    }

    // Emergency contact validation
    if (formData.emergency_contact && !/^\d{10}$/.test(formData.emergency_contact.replace(/\D/g, ''))) {
      newErrors.emergency_contact = 'Emergency contact must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateUsername = () => {
    const baseName = formData.full_name
      .toLowerCase()
      .replace(/\s+/g, "")
      .substring(0, 8);
    const timestamp = Date.now().toString().slice(-4);
    const username = baseName
      ? `${baseName}_${timestamp}`
      : `rider_${timestamp}`;

    setFormData((prev) => ({
      ...prev,
      username: username,
    }));
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({
      ...prev,
      password: password,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all required fields correctly.'
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'rider_documents' && value !== null && value !== undefined) {
          if (key === 'password' && isEditMode && !value) {
            // Skip empty password in edit mode
            return;
          }
          submitData.append(key, value.toString());
        }
      });

      // Append document files if they exist
      Object.entries(formData.rider_documents).forEach(([key, value]) => {
        if (value.file) {
          submitData.append(`document_${key}`, value.file);
        }
      });

      let response;
      if (isEditMode) {
        // Update existing rider
        response = await apiService.put(`/riders/${id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSubmitStatus({
          type: 'success',
          message: 'Rider updated successfully!'
        });
      } else {
        // Create new rider
        response = await apiService.post('/riders', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSubmitStatus({
          type: 'success',
          message: 'Rider registered successfully!'
        });
      }

      console.log('Submit response:', response.data);

      // Navigate after successful submission
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/riders');
        }
      }, 1500);

    } catch (error: any) {
      console.error('Error submitting form:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} rider data. Please try again.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <Box sx={{ 
        minHeight: "100vh", 
        bgcolor: "#f5f5f5",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* Header */}
      <AppBar
        position="static"
        sx={{ bgcolor: "white", color: "text.primary", boxShadow: 1 }}
      >
        <Toolbar>
          <Button
            startIcon={<ChevronLeft />}
            sx={{
              color: "#0891b2",
              mr: 1,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(8, 145, 178, 0.08)",
              },
            }}
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                navigate("/riders");
              }
            }}
          >
            Back to Riders
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {isEditMode ? "Edit Rider" : "Add New Rider"}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ overflow: "hidden" }}>
          {/* Title */}
          <Box
            sx={{
              p: 3,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "white",
            }}
          >
            <Typography
              variant="h4"
              sx={{ display: "flex", alignItems: "center", fontWeight: "bold" }}
            >
              <Person sx={{ mr: 2, color: "#0891b2" }} />
              {isEditMode ? "Edit Rider" : "Add New Rider"}
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Status Messages */}
            {submitStatus.message && (
              <Alert
                severity={submitStatus.type}
                sx={{ mb: 3 }}
                onClose={() => setSubmitStatus({ type: 'info', message: '' })}
              >
                {submitStatus.message}
              </Alert>
            )}

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <SectionHeader
                icon={<Person sx={{ color: "#0891b2" }} />}
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
                    helperText={errors.phone_number}
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
                  <FormControl fullWidth variant="outlined" error={!!errors.blood_group}>
                    <InputLabel>Blood Group</InputLabel>
                    <Select
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleSelectChange}
                      label="Blood Group"
                      required
                    >
                      <MenuItem value="">Select Blood Group</MenuItem>
                      {bloodGroups.map((group) => (
                        <MenuItem key={group} value={group}>
                          {group}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.blood_group && (
                      <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                        {errors.blood_group}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Account Information */}
              <SectionHeader
                icon={<Email sx={{ color: "#0891b2" }} />}
                title="Account Information"
              />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required={!isEditMode}
                      variant="outlined"
                      error={!!errors.username}
                      helperText={errors.username}
                      placeholder="Enter username"
                      disabled={isEditMode} // Disable username editing in edit mode
                    />
                    {!isEditMode && (
                      <Button
                        variant="contained"
                        onClick={generateUsername}
                        disabled={!formData.full_name.trim()}
                        sx={{
                          bgcolor: "#0891b2",
                          "&:hover": { bgcolor: "#0e7490" },
                          minWidth: 100,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Generate
                      </Button>
                    )}
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
                    required={!isEditMode}
                    variant="outlined"
                    error={!!errors.email}
                    helperText={errors.email}
                    placeholder="Enter email address"
                  />
                </Grid>
                {!isEditMode && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: "flex", gap: 1 }}>
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
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={generatePassword}
                        sx={{
                          bgcolor: "#0891b2",
                          "&:hover": { bgcolor: "#0e7490" },
                          minWidth: 100,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Generate
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Bank Details */}
              <SectionHeader
                icon={<CreditCard sx={{ color: "#0891b2" }} />}
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
                    required
                    variant="outlined"
                    error={!!errors.bank_name}
                    helperText={errors.bank_name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Account Number"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    error={!!errors.account_number}
                    helperText={errors.account_number}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="IFSC Code"
                    name="ifsc_code"
                    value={formData.ifsc_code}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    error={!!errors.ifsc_code}
                    helperText={errors.ifsc_code}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Account Holder Name"
                    name="account_holder_name"
                    value={formData.account_holder_name}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    error={!!errors.account_holder_name}
                    helperText={errors.account_holder_name}
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

              <Divider sx={{ my: 4 }} />

              {/* Vehicle Information */}
              <SectionHeader
                icon={<DirectionsCar sx={{ color: "#0891b2" }} />}
                title="Vehicle Information"
              />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined" error={!!errors.vehicle_type}>
                    <InputLabel>Vehicle Type</InputLabel>
                    <Select
                      name="vehicle_type"
                      value={formData.vehicle_type}
                      onChange={handleSelectChange}
                      label="Vehicle Type"
                      required
                    >
                      <MenuItem value="">Select Vehicle Type</MenuItem>
                      <MenuItem value="2_wheeler">2 Wheeler</MenuItem>
                      <MenuItem value="3_wheeler">3 Wheeler</MenuItem>
                      <MenuItem value="4_wheeler">4 Wheeler</MenuItem>
                    </Select>
                    {errors.vehicle_type && (
                      <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                        {errors.vehicle_type}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Vehicle Number"
                    name="vehicle_number"
                    value={formData.vehicle_number}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    error={!!errors.vehicle_number}
                    helperText={errors.vehicle_number}
                    placeholder="XX00XX0000"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Additional Information */}
              <SectionHeader
                icon={<CalendarToday sx={{ color: "#0891b2" }} />}
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
                      onChange={handleSelectChange}
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
                      onChange={handleSelectChange}
                      label="Status"
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ID Card Number"
                    name="id_card_number"
                    value={formData.id_card_number}
                    onChange={handleInputChange}
                    variant="outlined"
                    placeholder="Enter ID card number"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ID Card Issue Date"
                    name="id_card_issue_date"
                    type="date"
                    value={formData.id_card_issue_date}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ID Card Expiry Date"
                    name="id_card_expiry_date"
                    type="date"
                    value={formData.id_card_expiry_date}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Created By"
                    name="created_by"
                    value={formData.created_by}
                    onChange={handleInputChange}
                    variant="outlined"
                    placeholder="Enter creator name"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Document Uploads */}
              <SectionHeader
                icon={<Upload sx={{ color: "#0891b2" }} />}
                title="Document Uploads"
              />
              <Grid container spacing={3}>
                {Object.entries(formData.rider_documents).map(([docType, docData]) => (
                  <Grid item xs={12} md={6} key={docType}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ mb: 2, textTransform: 'capitalize' }}>
                          {docType.replace('_', ' ')}
                        </Typography>
                        <input
                          accept="image/*,.pdf"
                          style={{ display: 'none' }}
                          id={`document-${docType}`}
                          type="file"
                          name={docType}
                          onChange={handleDocumentChange}
                        />
                        <label htmlFor={`document-${docType}`}>
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<Upload />}
                            fullWidth
                            sx={{ mb: 1 }}
                          >
                            Upload {docType.replace('_', ' ')}
                          </Button>
                        </label>
                        {docData.preview && (
                          <Typography variant="caption" color="text.secondary">
                            File selected: {docData.file?.name || 'Existing file'}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Submit Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (onClose) {
                      onClose();
                    } else {
                      navigate("/riders");
                    }
                  }}
                  disabled={isSubmitting}
                  sx={{
                    borderColor: "#0891b2",
                    color: "#0891b2",
                    "&:hover": {
                      borderColor: "#0e7490",
                      backgroundColor: "rgba(8, 145, 178, 0.08)",
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    bgcolor: "#0891b2",
                    "&:hover": { bgcolor: "#0e7490" },
                    minWidth: 120,
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    isEditMode ? "Update Rider" : "Register Rider"
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