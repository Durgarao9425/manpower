import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, Card, CardContent, Typography,
  Box, Avatar, Chip, Divider, Tab, Tabs
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AccountBalance as BankIcon,
  TwoWheeler as BikeIcon,
  Description as DocumentIcon,
  Star as StarIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Event as DateIcon
} from '@mui/icons-material';
import { Rider, RiderDocument } from './types';

interface RiderDetailsViewProps {
  open: boolean;
  onClose: () => void;
  rider: Rider | null;
  documents: RiderDocument | null;
  onEditDocuments: () => void;
}

const RiderDetailsView: React.FC<RiderDetailsViewProps> = ({ 
  open, onClose, rider, documents, onEditDocuments 
}) => {
  const [tabValue, setTabValue] = React.useState(0);

  if (!rider) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <Avatar 
            src={documents?.profile_image} 
            sx={{ bgcolor: 'primary.main', mr: 2 }}
          >
            {rider.name?.charAt(0) || rider.rider_code?.charAt(0) || 'R'}
          </Avatar>
          <Box>
            <Typography variant="h6" component="div">
              {rider.name || rider.rider_code}
              <Chip
                label={rider.status}
                color={rider.status === 'Active' ? 'success' : 'default'}
                size="small"
                icon={rider.status === 'Active' ? <ActiveIcon /> : <InactiveIcon />}
                sx={{ ml: 2 }}
              />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {rider.rider_id} • {rider.vehicle_type?.replace('_', ' ')} • {rider.vehicle_number}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label="Profile" />
        <Tab label="Documents" />
        <Tab label="Activity" />
      </Tabs>

      <DialogContent dividers>
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    Personal Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography>
                      <strong>Name:</strong> {rider.name || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Email:</strong> {rider.email || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Phone:</strong> {rider.phone || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Emergency Contact:</strong> {rider.emergency_contact || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Date of Birth:</strong> {rider.date_of_birth || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Blood Group:</strong> {rider.blood_group || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Address:</strong> {rider.address || 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <BankIcon color="primary" sx={{ mr: 1 }} />
                    Bank Details
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography>
                      <strong>Bank Name:</strong> {rider.bank_name || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Account Number:</strong> {rider.account_number || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>IFSC Code:</strong> {rider.ifsc_code || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Account Holder:</strong> {rider.account_holder_name || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>UPI ID:</strong> {rider.upi_id || 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <BikeIcon color="primary" sx={{ mr: 1 }} />
                    Vehicle Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography>
                      <strong>Vehicle Type:</strong> {rider.vehicle_type?.replace('_', ' ') || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Vehicle Number:</strong> {rider.vehicle_number || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Performance Tier:</strong> 
                      <Chip
                        label={rider.performance_tier}
                        color={
                          rider.performance_tier === 'high' ? 'success' :
                          rider.performance_tier === 'medium' ? 'warning' : 'default'
                        }
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    {rider.joining_date && (
                      <Typography>
                        <strong>Joining Date:</strong> {rider.joining_date}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button 
                  variant="contained" 
                  startIcon={<DocumentIcon />}
                  onClick={onEditDocuments}
                >
                  Edit Documents
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Aadhar Card
                  </Typography>
                  {documents?.aadhar_card_image ? (
                    <Box>
                      <img 
                        src={documents.aadhar_card_image} 
                        alt="Aadhar Card" 
                        style={{ maxWidth: '100%', maxHeight: 200, marginBottom: 16 }}
                      />
                      <Typography>
                        <strong>Aadhar Number:</strong> {documents.aadhar_number || 'N/A'}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No Aadhar uploaded</Typography>
                  )}
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    PAN Card
                  </Typography>
                  {documents?.pan_card_image ? (
                    <Box>
                      <img 
                        src={documents.pan_card_image} 
                        alt="PAN Card" 
                        style={{ maxWidth: '100%', maxHeight: 200, marginBottom: 16 }}
                      />
                      <Typography>
                        <strong>PAN Number:</strong> {documents.pan_number || 'N/A'}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No PAN uploaded</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Driving License
                  </Typography>
                  {documents?.driving_license_image ? (
                    <Box>
                      <img 
                        src={documents.driving_license_image} 
                        alt="Driving License" 
                        style={{ maxWidth: '100%', maxHeight: 200, marginBottom: 16 }}
                      />
                      <Typography>
                        <strong>License Number:</strong> {documents.license_number || 'N/A'}
                      </Typography>
                      <Typography>
                        <strong>Expiry Date:</strong> {documents.license_expiry_date || 'N/A'}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No License uploaded</Typography>
                  )}
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Vehicle Insurance
                  </Typography>
                  {documents?.insurance_image ? (
                    <Box>
                      <img 
                        src={documents.insurance_image} 
                        alt="Insurance" 
                        style={{ maxWidth: '100%', maxHeight: 200, marginBottom: 16 }}
                      />
                      <Typography>
                        <strong>Expiry Date:</strong> {documents.insurance_expiry_date || 'N/A'}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No Insurance uploaded</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Rider Activity
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Deliveries
                    </Typography>
                    <Typography variant="h4">
                      {rider.total_deliveries || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Average Rating
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Typography variant="h4">
                        {rider.rating?.toFixed(1) || 'N/A'}
                      </Typography>
                      {rider.rating && (
                        <StarIcon color="warning" sx={{ ml: 1 }} />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Joined On
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <DateIcon color="action" sx={{ mr: 1 }} />
                      <Typography>
                        {rider.joining_date || 'N/A'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Active
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <DateIcon color="action" sx={{ mr: 1 }} />
                      <Typography>
                        {rider.updated_at || 'N/A'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Recent Deliveries
              </Typography>
              <Typography color="text.secondary">
                Delivery history will be displayed here
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RiderDetailsView;