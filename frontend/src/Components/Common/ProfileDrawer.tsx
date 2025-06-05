import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  useTheme,
  Paper,
  Grid,
  Button
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Business,
  Security,
  Logout,
  Close,
  Edit
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Get user details from localStorage
  const userDetails = {
    fullName: localStorage.getItem('fullName') || 'User Name',
    email: localStorage.getItem('email') || 'user@example.com',
    phone: localStorage.getItem('phone') || 'Not provided',
    address: localStorage.getItem('address') || 'Not provided',
    company: localStorage.getItem('companyName') || 'Not provided',
    role: localStorage.getItem('userType') || 'User',
    profileImage: localStorage.getItem('profileImage') || undefined
  };

  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.clear();
    // Redirect to login page
    navigate('/login');
  };

  const handleEditProfile = () => {
    // Navigate to profile edit page
    navigate('/profile/edit');
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          bgcolor: theme.palette.background.default,
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            Profile Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Profile Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            bgcolor: theme.palette.primary.main,
            color: 'white',
            borderRadius: 2
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              src={userDetails.profileImage}
              sx={{ 
                width: 80, 
                height: 80,
                border: '3px solid white'
              }}
            >
              {userDetails.fullName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {userDetails.fullName}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {userDetails.role}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* User Details */}
        <List>
          <ListItem>
            <ListItemIcon>
              <Email color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Email" 
              secondary={userDetails.email}
              secondaryTypographyProps={{ color: 'text.secondary' }}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Phone color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Phone" 
              secondary={userDetails.phone}
              secondaryTypographyProps={{ color: 'text.secondary' }}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LocationOn color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Address" 
              secondary={userDetails.address}
              secondaryTypographyProps={{ color: 'text.secondary' }}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Business color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Company" 
              secondary={userDetails.company}
              secondaryTypographyProps={{ color: 'text.secondary' }}
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Action Buttons */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEditProfile}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Edit Profile
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Logout
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Drawer>
  );
};

export default ProfileDrawer; 