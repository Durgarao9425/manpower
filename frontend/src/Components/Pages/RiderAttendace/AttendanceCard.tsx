import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Divider,
  Stack,
  Box,
  Grid,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import {
  Person,
  CheckCircle,
  Cancel,
  AccessTime,
  CalendarToday
} from '@mui/icons-material';

const AttendanceCard = ({ data }) => {
  const theme = useTheme();

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'early leave': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'present': return <CheckCircle />;
      case 'absent': return <Cancel />;
      default: return <AccessTime />;
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        background: theme.palette.background.paper,
        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.05)}`,
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          
          {/* Header Section */}
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <Person fontSize="medium" />
            </Avatar>

            <Box display="flex" flexDirection="column" justifyContent="center" gap={1}>
              <Typography variant="h6" fontWeight="600">
                {data.riderName}
              </Typography>

              <Chip
                icon={getStatusIcon(data.status)}
                label={data.status}
                color={getStatusColor(data.status)}
                size="small"
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  width: 'fit-content',
                  '& .MuiChip-icon': { fontSize: 16 },
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.1) }} />

          {/* Date */}
          <Box display="flex" alignItems="center" gap={1.5}>
            <CalendarToday fontSize="small" color="primary" />
            <Typography variant="body2" fontWeight={500} color="text.primary">
              {new Date(data.date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Typography>
          </Box>

          {/* Punch In / Out */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: alpha(theme.palette.success.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  borderRadius: 3,
                }}
              >
                <Typography variant="caption" color="success.main" fontWeight={600}>
                  Punch In
                </Typography>
                <Typography variant="body1" fontWeight={700} color="success.dark">
                  {data.punchIn}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: alpha(theme.palette.error.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  borderRadius: 3,
                }}
              >
                <Typography variant="caption" color="error.main" fontWeight={600}>
                  Punch Out
                </Typography>
                <Typography variant="body1" fontWeight={700} color="error.dark">
                  {data.punchOut}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Total Hours */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 3,
              textAlign: 'center',
              mt: 1,
            }}
          >
            <Typography variant="caption" color="primary.main" fontWeight={600}>
              Total Hours
            </Typography>
            <Typography variant="h6" fontWeight={800} color="primary.main">
              {data.totalHours}
            </Typography>
          </Paper>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AttendanceCard;
