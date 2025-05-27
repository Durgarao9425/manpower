import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Modal,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Grid,
  Chip,
  LinearProgress,
  IconButton,
  Paper,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  KeyboardArrowDown as ArrowDownIcon,
  LocalShipping as DeliveryIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Restaurant as RestaurantIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendIcon
} from '@mui/icons-material';

const CompactDashboardCard = () => {
  const [selectedChart, setSelectedChart] = useState('deliveries');
  const [modalOpen, setModalOpen] = useState(false);

  // Sample data for different charts
  const data = {
    deliveries: {
      daily: [12, 15, 8, 20, 18, 25, 22],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    earnings: {
      weekly: [450, 520, 380, 600, 580, 720, 650]
    },
    ratings: {
      breakdown: [
        { rating: 5, count: 85, percentage: 68 },
        { rating: 4, count: 25, percentage: 20 },
        { rating: 3, count: 10, percentage: 8 },
        { rating: 2, count: 3, percentage: 2.4 },
        { rating: 1, count: 2, percentage: 1.6 }
      ]
    },
    restaurants: [
      { name: 'Pizza Palace', orders: 45, revenue: '$890', rating: 4.8, growth: '+15%' },
      { name: 'Burger Barn', orders: 38, revenue: '$760', rating: 4.6, growth: '+12%' },
      { name: 'Sushi Spot', orders: 32, revenue: '$1200', rating: 4.9, growth: '+18%' }
    ],
    performance: {
      totalDeliveries: 156,
      avgRating: 4.7,
      totalEarnings: 3420,
      onTimeRate: 94
    },
    timeline: [
      { time: '2:30 PM', restaurant: 'Pizza Palace', status: 'Delivered', amount: '$45' },
      { time: '1:15 PM', restaurant: 'Burger Barn', status: 'Delivered', amount: '$32' },
      { time: '12:45 PM', restaurant: 'Sushi Spot', status: 'Delivered', amount: '$58' },
      { time: '11:30 AM', restaurant: 'Taco Time', status: 'Delivered', amount: '$28' },
      { time: '10:20 AM', restaurant: 'Coffee Corner', status: 'Delivered', amount: '$15' }
    ],
    trends: {
      weeklyChange: '+12%',
      monthlyChange: '+8%',
      bestDay: 'Saturday',
      peakHour: '7-8 PM'
    }
  };

  const chartTypes = [
    {
      id: 'deliveries',
      name: 'Daily Deliveries',
      icon: <DeliveryIcon />,
      description: 'Track your daily delivery count'
    },
    {
      id: 'earnings',
      name: 'Earnings Chart',
      icon: <MoneyIcon />,
      description: 'Monitor your earnings over time'
    },
    {
      id: 'ratings',
      name: 'Ratings Breakdown',
      icon: <StarIcon />,
      description: 'View customer rating distribution'
    },
    {
      id: 'restaurants',
      name: 'Top Restaurants',
      icon: <RestaurantIcon />,
      description: 'Most ordered restaurants'
    },
    {
      id: 'performance',
      name: 'Performance KPIs',
      icon: <AnalyticsIcon />,
      description: 'Key performance indicators'
    },
    {
      id: 'timeline',
      name: 'Delivery Timeline',
      icon: <TimelineIcon />,
      description: 'Recent delivery timeline'
    },
    {
      id: 'trends',
      name: 'Trend Analysis',
      icon: <TrendIcon />,
      description: 'Performance trends'
    }
  ];

  const renderChart = () => {
    switch (selectedChart) {
      case 'deliveries':
        return (
          <Box>
            <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
              {data.performance.totalDeliveries}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Total deliveries this week
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'space-between', mt: 2 }}>
              {data.deliveries.daily.map((value, index) => (
                <Box key={index} sx={{ flex: 1, textAlign: 'center' }}>
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      borderRadius: 0.5,
                      mb: 0.5,
                      minHeight: 8,
                      height: `${(value / Math.max(...data.deliveries.daily)) * 40 + 10}px`
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {data.deliveries.labels[index].slice(0, 1)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        );

      case 'earnings':
        return (
          <Box>
            <Typography variant="h4" color="success.main" fontWeight="bold" gutterBottom>
              ${data.performance.totalEarnings}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Total earnings this month
            </Typography>
            <Box sx={{ mt: 2 }}>
              {data.earnings.weekly.slice(0, 4).map((value, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">Week {index + 1}</Typography>
                    <Typography variant="caption" fontWeight="bold">${value}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(value / Math.max(...data.earnings.weekly)) * 100}
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        );

      case 'ratings':
        return (
          <Box>
            <Typography variant="h4" color="warning.main" fontWeight="bold" gutterBottom>
              {data.performance.avgRating}⭐
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Average customer rating
            </Typography>
            <Box sx={{ mt: 2 }}>
              {data.ratings.breakdown.slice(0, 5).map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="caption" sx={{ width: 20 }}>{item.rating}★</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={item.percentage}
                    sx={{ flex: 1, height: 4, borderRadius: 2 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ width: 20 }}>
                    {item.count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        );

      case 'restaurants':
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Top Partner Restaurants
            </Typography>
            <Box sx={{ mt: 2 }}>
              {data.restaurants.slice(0, 3).map((restaurant, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" fontWeight="bold" display="block">
                        {restaurant.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {restaurant.orders} orders • {restaurant.rating}⭐
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" fontWeight="bold" color="success.main">
                        {restaurant.revenue}
                      </Typography>
                      <Chip
                        label={restaurant.growth}
                        size="small"
                        color="success"
                        sx={{ ml: 0.5, height: 16, fontSize: '0.7rem' }}
                      />
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        );

      case 'performance':
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Performance Overview
            </Typography>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {data.performance.totalDeliveries}
                  </Typography>
                  <Typography variant="caption">Deliveries</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <Typography variant="body2" fontWeight="bold">
                    ${data.performance.totalEarnings}
                  </Typography>
                  <Typography variant="caption">Earnings</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {data.performance.avgRating}⭐
                  </Typography>
                  <Typography variant="caption">Avg Rating</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {data.performance.onTimeRate}%
                  </Typography>
                  <Typography variant="caption">On-Time</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 'timeline':
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Recent Deliveries
            </Typography>
            <Box sx={{ mt: 2 }}>
              {data.timeline.map((delivery, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight="bold">
                      {delivery.restaurant}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {delivery.time}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={delivery.status}
                      size="small"
                      color="success"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                    <Typography variant="caption" fontWeight="bold" color="success.main">
                      {delivery.amount}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        );

      case 'trends':
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Performance Trends
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Paper sx={{ p: 1.5, bgcolor: 'success.light' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption">Weekly Growth</Typography>
                  <Typography variant="caption" fontWeight="bold" color="success.main">
                    {data.trends.weeklyChange}
                  </Typography>
                </Box>
              </Paper>
              <Paper sx={{ p: 1.5, bgcolor: 'primary.light' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption">Monthly Growth</Typography>
                  <Typography variant="caption" fontWeight="bold" color="primary.main">
                    {data.trends.monthlyChange}
                  </Typography>
                </Box>
              </Paper>
              <Paper sx={{ p: 1.5, bgcolor: 'secondary.light' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption">Best Day</Typography>
                  <Typography variant="caption" fontWeight="bold" color="secondary.main">
                    {data.trends.bestDay}
                  </Typography>
                </Box>
              </Paper>
              <Paper sx={{ p: 1.5, bgcolor: 'warning.light' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption">Peak Hour</Typography>
                  <Typography variant="caption" fontWeight="bold" color="warning.main">
                    {data.trends.peakHour}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        );

      default:
        return <Typography>Select a chart to view data</Typography>;
    }
  };

  const currentChart = chartTypes.find(chart => chart.id === selectedChart);

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto' }}>
      <Card sx={{ boxShadow: 3 }}>
        {/* Header */}
        <CardHeader
          title="Driver Dashboard"
          subheader="Track your delivery performance"
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
            color: 'white',
            '& .MuiCardHeader-subheader': {
              color: 'rgba(255, 255, 255, 0.8)'
            }
          }}
        />

        {/* Chart Display */}
        <CardContent sx={{ minHeight: 200, p: 3 }}>
          {renderChart()}
        </CardContent>

        {/* Chart Selector */}
        <Box sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50', p: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setModalOpen(true)}
            startIcon={currentChart?.icon}
            endIcon={<ArrowDownIcon />}
            sx={{
              justifyContent: 'space-between',
              textTransform: 'none',
              bgcolor: 'white'
            }}
          >
            <Typography variant="body2" fontWeight="medium">
              {currentChart?.name}
            </Typography>
          </Button>
        </Box>
      </Card>

      {/* Small Modal in Top Right */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="chart-selection-modal"
      >
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 320,
            maxHeight: '80vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: 1,
              borderColor: 'divider'
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Select Chart
            </Typography>
            <IconButton
              onClick={() => setModalOpen(false)}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <List sx={{ p: 0, maxHeight: 'calc(80vh - 64px)', overflow: 'auto' }}>
            {chartTypes.map((chart, index) => (
              <React.Fragment key={chart.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setSelectedChart(chart.id);
                      setModalOpen(false);
                    }}
                    selected={selectedChart === chart.id}
                    sx={{
                      py: 1.5,
                      '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        '&:hover': {
                          bgcolor: 'primary.light'
                        }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {chart.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={chart.name}
                      secondary={chart.description}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 'medium'
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                {index < chartTypes.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Modal>
    </Box>
  );
};

export default CompactDashboardCard;