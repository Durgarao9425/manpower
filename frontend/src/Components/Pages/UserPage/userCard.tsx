import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  Chip,
  Box,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';

const ReusableCard = ({ 
  data = [], 
  onEdit, 
  onDelete,
  cardConfig = {
    primaryField: 'full_name',
    secondaryField: 'username',
    avatarField: 'full_name',
    emailField: 'email',
    typeField: 'user_type',
    statusField: 'status',
    companyField: 'company_id'
  },
  labels = {
    email: 'Email',
    company_id: 'Company ID',
    user_type: 'Role',
    status: 'Status'
  }
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  if (!data || data.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
        bgcolor="grey.50"
        borderRadius={2}
        p={4}
      >
        <Typography variant="h6" color="text.secondary">
          No users found.
        </Typography>
      </Box>
    );
  }

  const getUserTypeColor = (type) => {
    const colorMap = {
      'admin': 'error',
      'company': 'primary',
      'rider': 'secondary',
      'store_manager': 'success'
    };
    return colorMap[type] || 'default';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'active': 'success',
      'inactive': 'warning',
      'suspended': 'error'
    };
    return colorMap[status] || 'default';
  };

  const getGridSize = () => {
    if (isMobile) return 12; // 1 card per row on mobile
    if (isTablet) return 6;  // 2 cards per row on tablet
    return 4; // 3 cards per row on desktop
  };

  const renderFieldValue = (user, fieldKey) => {
    const value = user[fieldKey];
    if (!value) return null;

    // Special handling for certain field types
    if (fieldKey === cardConfig.typeField) {
      return (
        <Chip
          label={value.replace('_', ' ').toUpperCase()}
          color={getUserTypeColor(value)}
          size="small"
          variant="outlined"
        />
      );
    }

    if (fieldKey === cardConfig.statusField) {
      return (
        <Chip
          label={value.toUpperCase()}
          color={getStatusColor(value)}
          size="small"
        />
      );
    }

    return (
      <Typography variant="body2" color="text.secondary">
        {value}
      </Typography>
    );
  };

  return (
    <Grid container spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
      {data.map((user, index) => (
        <Grid item xs={getGridSize()} key={user.id || index}>
          <Card
            elevation={2}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                elevation: 6,
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8]
              },
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              {/* Header Section with Avatar and Primary Info */}
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: theme.palette.primary.main,
                    mr: 2,
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}
                >
                  {user[cardConfig.avatarField]?.charAt(0)?.toUpperCase() || <PersonIcon />}
                </Avatar>
                <Box flexGrow={1}>
                  <Typography
                    variant="h6"
                    component="h3"
                    fontWeight="600"
                    color="text.primary"
                    sx={{ mb: 0.5 }}
                  >
                    {user[cardConfig.primaryField] || 'Unknown User'}
                  </Typography>
                  {user[cardConfig.secondaryField] && (
                    <Typography variant="body2" color="text.secondary">
                      @{user[cardConfig.secondaryField]}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Details Section */}
              <Box sx={{ mb: 2 }}>
                {/* Email Field */}
                {user[cardConfig.emailField] && (
                  <Box mb={1.5}>
                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                      {labels.email || 'Email'}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {user[cardConfig.emailField]}
                    </Typography>
                  </Box>
                )}

                {/* Company Field */}
                {user[cardConfig.companyField] && (
                  <Box mb={1.5}>
                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                      {labels.company_id || 'Company ID'}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {user[cardConfig.companyField]}
                    </Typography>
                  </Box>
                )}

           
              </Box>

              {/* Status and Type Chips */}
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                {user[cardConfig.typeField] && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" mb={0.5}>
                      {labels.user_type || 'Role'}
                    </Typography>
                    <Chip
                      label={user[cardConfig.typeField].replace('_', ' ').toUpperCase()}
                      color={getUserTypeColor(user[cardConfig.typeField])}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                )}
                {user[cardConfig.statusField] && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" mb={0.5}>
                      {labels.status || 'Status'}
                    </Typography>
                    <Chip
                      label={user[cardConfig.statusField].toUpperCase()}
                      color={getStatusColor(user[cardConfig.statusField])}
                      size="small"
                    />
                  </Box>
                )}
              </Box>
            </CardContent>

            {/* Action Buttons */}
            <CardActions
              sx={{
                p: 2,
                pt: 0,
                justifyContent: 'space-between',
                borderTop: `1px solid ${theme.palette.divider}`
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => onEdit?.(user)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3
                }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => onDelete?.(user)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3
                }}
              >
                Delete
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ReusableCard;