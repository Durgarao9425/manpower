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
  Numbers
} from '@mui/icons-material';
import axios from 'axios';

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
}



import { useParams } from 'react-router-dom';

interface RiderViewProps {
  rider?: Rider;
  onClose?: () => void;
}

const RiderView: React.FC<RiderViewProps> = ({ rider: propRider, onClose }) => {
  const { id } = useParams();
  const [rider, setRider] = useState<Rider | null>(propRider || null);
  const [loading, setLoading] = useState(!propRider && !!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propRider) return; // If rider is passed as prop, don't fetch
    if (!id) return;
    setLoading(true);
    axios.get(`/api/riders/${id}`)
      .then(res => setRider(res.data))
      .catch(err => setError('Failed to load rider'))
      .finally(() => setLoading(false));
  }, [id, propRider]);

  if (loading) return <Box p={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!rider) return <Alert severity="info">Rider not found</Alert>;

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
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return '';
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
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
          aria-label="Close"
        >
          <span style={{ fontSize: 28, fontWeight: 'bold' }}>&times;</span>
        </IconButton>
      )}
      {/* Header Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}
              >
                {rider.name?.charAt(0) || 'R'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                {rider.name || 'Unknown Rider'}
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
                  <Typography variant="body1">{rider.phone || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date of Birth</Typography>
                  <Typography variant="body1">{formatDate(rider.date_of_birth)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Blood Group</Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Bloodtype sx={{ mr: 0.5, fontSize: '1rem' }} />
                    {rider.blood_group}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Emergency Contact</Typography>
                  <Typography variant="body1">{rider.emergency_contact}</Typography>
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
                  <Typography variant="body1">{rider.id_proof}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">ID Card Number</Typography>
                  <Typography variant="body1">{rider.id_card_number}</Typography>
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
                    {rider.vehicle_number}
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
                  <Typography variant="body1">{rider.bank_name}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Account Holder Name</Typography>
                  <Typography variant="body1">{rider.account_holder_name}</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="subtitle2" color="text.secondary">Account Number</Typography>
                  <Typography variant="body1">{maskAccountNumber(rider.account_number)}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">IFSC Code</Typography>
                  <Typography variant="body1">{rider.ifsc_code}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">UPI ID</Typography>
                  <Typography variant="body1">{rider.upi_id}</Typography>
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