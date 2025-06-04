import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Button,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Person,
  Phone,
  CalendarToday,
  AccountBalance,
  CreditCard,
  DirectionsCar,
  Assignment,
  Download,
  Visibility,
  Bloodtype,
  Business,
  Numbers,
  ArrowBack
} from '@mui/icons-material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// TypeScript interfaces
interface RiderDocument {
  type: string;
  url: string;
  uploadDate: string;
  fileName: string;
}

interface Rider {
  id: number;
  rider_id: string;
  user_id: number;
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
  created_by: number;
  id_card_number: string;
  id_card_issue_date: string;
  id_card_expiry_date: string;
  documents: RiderDocument[];
  status: 'Active' | 'Inactive';
  vehicle_type: '2_wheeler' | '3_wheeler' | '4_wheeler';
  vehicle_number: string;
  // Additional fields for display
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  full_name?: string;
  phone_number?: string;
}

const RiderView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rider, setRider] = useState<Rider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRider = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/riders/${id}`);
        console.log('Rider data received:', response.data);
        setRider(response.data);
      } catch (err) {
        console.error('Error fetching rider:', err);
        setError('Failed to load rider data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRider();
    }
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!rider) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Rider not found</Alert>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'success' : 'error';
  };

  const getPerformanceTierColor = (tier: string) => {
    switch (tier) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'error';
      default: return 'default';
    }
  };

  const getVehicleTypeLabel = (type: string) => {
    switch (type) {
      case '2_wheeler': return '2 Wheeler';
      case '3_wheeler': return '3 Wheeler';
      case '4_wheeler': return '4 Wheeler';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return 'N/A';
    return accountNumber.slice(0, 4) + '****' + accountNumber.slice(-4);
  };

  const handleDocumentView = (document: RiderDocument) => {
    // Simulate document view
    alert(`Opening document: ${document.fileName}`);
  };

  const handleDocumentDownload = (document: RiderDocument) => {
    // Simulate document download
    alert(`Downloading document: ${document.fileName}`);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto', position: 'relative' }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/riders')}
        sx={{ mb: 3 }}
      >
        Back to Riders
      </Button>

      {/* Header Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}
              >
                {(rider.full_name || rider.account_holder_name || 'R').charAt(0)}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                {rider.full_name || rider.account_holder_name || 'Unknown Rider'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip
                  label={rider.status}
                  color={getStatusColor(rider.status)}
                  size="small"
                />
                <Chip
                  label={`Performance: ${rider.performance_tier.toUpperCase()}`}
                  color={getPerformanceTierColor(rider.performance_tier)}
                  size="small"
                />
                <Chip
                  label={getVehicleTypeLabel(rider.vehicle_type)}
                  variant="outlined"
                  size="small"
                />
              </Box>
              <Typography variant="body1" color="text.secondary">
                Rider ID: {rider.rider_id} | Code: {rider.rider_code}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1 }} />
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{rider.email || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{rider.phone_number || rider.emergency_contact || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date of Birth</Typography>
                  <Typography variant="body1">{formatDate(rider.date_of_birth)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Blood Group</Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Bloodtype sx={{ mr: 0.5, fontSize: '1rem' }} />
                    {rider.blood_group || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Emergency Contact</Typography>
                  <Typography variant="body1">{rider.emergency_contact || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Joining Date</Typography>
                  <Typography variant="body1">{formatDate(rider.joining_date)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                  <Typography variant="body1">{rider.address || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ID & Documents */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Assignment sx={{ mr: 1 }} />
                ID & Documents
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">ID Proof Type</Typography>
                  <Typography variant="body1">{rider.id_proof || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">ID Card Number</Typography>
                  <Typography variant="body1">{rider.id_card_number || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Issue Date</Typography>
                  <Typography variant="body1">{formatDate(rider.id_card_issue_date)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Expiry Date</Typography>
                  <Typography variant="body1">{formatDate(rider.id_card_expiry_date)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Last Certificate Date</Typography>
                  <Typography variant="body1">{formatDate(rider.last_certificate_date)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Vehicle Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <DirectionsCar sx={{ mr: 1 }} />
                Vehicle Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Vehicle Type</Typography>
                  <Typography variant="body1">{getVehicleTypeLabel(rider.vehicle_type)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Vehicle Number</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {rider.vehicle_number || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Banking Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalance sx={{ mr: 1 }} />
                Banking Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Bank Name</Typography>
                  <Typography variant="body1">{rider.bank_name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Account Holder Name</Typography>
                  <Typography variant="body1">{rider.account_holder_name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="subtitle2" color="text.secondary">Account Number</Typography>
                  <Typography variant="body1">{maskAccountNumber(rider.account_number)}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">IFSC Code</Typography>
                  <Typography variant="body1">{rider.ifsc_code || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">UPI ID</Typography>
                  <Typography variant="body1">{rider.upi_id || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Documents */}
        {/* <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CreditCard sx={{ mr: 1 }} />
                Uploaded Documents
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {rider?.documents && rider?.documents.length > 0 ? (
                <Grid container spacing={2}>
                  {rider?.documents?.map((document, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {document.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {document.fileName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          Uploaded: {formatDate(document.uploadDate)}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleDocumentView(document)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleDocumentDownload(document)}
                          >
                            <Download fontSize="small" />
                          </IconButton>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">No documents uploaded</Alert>
              )}
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>
    </Box>
  );
};

export default RiderView;