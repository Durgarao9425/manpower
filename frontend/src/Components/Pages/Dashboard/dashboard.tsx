import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  AppBar,
  Toolbar,
  Badge,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Drawer,
  Hidden,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Restaurant,
  DeliveryDining,
  Business,
  AttachMoney,
  Today,
  AccountBalanceWallet,
  DirectionsBike,
  Pending,
  Notifications,
  Search,
  Menu,
  Dashboard,
  ShoppingCart,
  People,
  Analytics,
  Settings,
  CheckCircle,
  Cancel,
  Schedule,
  Close,
} from '@mui/icons-material';

const FoodDeliveryDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [timeOfDay, setTimeOfDay] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Morning');
    else if (hour < 18) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');
  }, []);

  // Mock data
 const mainStats = [
    {
      title: 'Total active users',
      value: '18,765',
      change: '+2.6%',
      trend: 'up',
      color: '#4CAF50',
    },
    {
      title: 'Total installed',
      value: '4,876',
      change: '+0.2%',
      trend: 'up',
      color: '#2196F3',
    },
    {
      title: 'Total downloads',
      value: '678',
      change: '-0.1%',
      trend: 'down',
      color: '#FF5722',
    },
    {
      title: 'Total Earnings',
      value: '$287,450',
      change: '+15.3%',
      trend: 'up',
      color: '#4CAF50',
    },
  ];


  const MiniChartNew = ({ color, trend }) => {
  const bars = [0.3, 0.2, 0.5, 0.7, 0.4, 0.8, 0.6, 0.9, 0.5, 0.7];
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'end', 
        height: 40, 
        gap: 0.5,
        ml: 2
      }}
    >
      {bars.map((height, index) => (
        <Box
          key={index}
          sx={{
            width: 3,
            height: height * 40,
            backgroundColor: color,
            borderRadius: 0.5,
            opacity: 0.8
          }}
        />
      ))}
    </Box>
  );
};

const StatCardNew = ({ stat }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.06)',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 1,
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              {stat.title}
            </Typography>
            
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2rem' }
              }}
            >
              {stat.value}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {stat.trend === 'up' ? (
                <TrendingUp sx={{ fontSize: 16, color: '#4CAF50' }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16, color: '#f44336' }} />
              )}
              <Typography 
                variant="body2" 
                sx={{ 
                  color: stat.trend === 'up' ? '#4CAF50' : '#f44336',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              >
                {stat.change} last 7 days
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MiniChartNew color={stat.color} trend={stat.trend} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

  const todayStats = [
    {
      title: 'Today Orders',
      value: '1,247',
      change: '+18%',
      trend: 'up',
      icon: <Today sx={{ fontSize: { xs: 32, sm: 40 } }} />,
      color: '#9C27B0',
      bgColor: 'rgba(156, 39, 176, 0.1)',
    },
    {
      title: 'Today Earnings',
      value: '$12,580',
      change: '+22%',
      trend: 'up',
      icon: <AccountBalanceWallet sx={{ fontSize: { xs: 32, sm: 40 } }} />,
      color: '#00BCD4',
      bgColor: 'rgba(0, 188, 212, 0.1)',
    },
    {
      title: 'Active Riders',
      value: '847',
      change: '-3%',
      trend: 'down',
      icon: <DirectionsBike sx={{ fontSize: { xs: 32, sm: 40 } }} />,
      color: '#4CAF50',
      bgColor: 'rgba(76, 175, 80, 0.1)',
    },
    {
      title: 'Pending Payments',
      value: '$5,420',
      change: '-8%',
      trend: 'down',
      icon: <Pending sx={{ fontSize: { xs: 32, sm: 40 } }} />,
      color: '#F44336',
      bgColor: 'rgba(244, 67, 54, 0.1)',
    },
  ];

  const recentOrders = [
    { id: '#12847', restaurant: 'Pizza Palace', customer: 'John Doe', status: 'Delivered', amount: '$28.50', time: '2 min ago' },
    { id: '#12846', restaurant: 'Burger King', customer: 'Jane Smith', status: 'In Transit', amount: '$15.75', time: '5 min ago' },
    { id: '#12845', restaurant: 'Sushi House', customer: 'Mike Johnson', status: 'Preparing', amount: '$42.30', time: '8 min ago' },
    { id: '#12844', restaurant: 'Taco Bell', customer: 'Sarah Wilson', status: 'Cancelled', amount: '$12.20', time: '12 min ago' },
    { id: '#12843', restaurant: 'Chinese Garden', customer: 'Tom Brown', status: 'Delivered', amount: '$35.80', time: '15 min ago' },
  ];

  const topRestaurants = [
    { name: 'Pizza Palace', orders: 234, revenue: '$5,670', rating: 4.8, growth: '+15%' },
    { name: 'Burger Express', orders: 198, revenue: '$4,250', rating: 4.6, growth: '+12%' },
    { name: 'Sushi Master', orders: 167, revenue: '$6,890', rating: 4.9, growth: '+18%' },
    { name: 'Taco Fiesta', orders: 145, revenue: '$3,420', rating: 4.5, growth: '+8%' },
    { name: 'Italian Corner', orders: 132, revenue: '$4,100', rating: 4.7, growth: '+10%' },
  ];

  const StatCard = ({ stat }) => (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, #fff 0%, #f8f9ff 100%)',
        border: '1px solid rgba(0,0,0,0.05)',
        borderRadius: { xs: 2, sm: 3 },
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              width: { xs: 50, sm: 60 },
              height: { xs: 50, sm: 60 },
              borderRadius: 2,
              backgroundColor: stat.bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: stat.color,
            }}
          >
            {stat.icon}
          </Box>
          <Box display="flex" alignItems="center">
            {stat.trend === 'up' ? (
              <TrendingUp sx={{ color: '#4CAF50', mr: 0.5, fontSize: { xs: 18, sm: 24 } }} />
            ) : (
              <TrendingDown sx={{ color: '#F44336', mr: 0.5, fontSize: { xs: 18, sm: 24 } }} />
            )}
            <Typography
              variant="body2"
              sx={{
                color: stat.trend === 'up' ? '#4CAF50' : '#F44336',
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              {stat.change}
            </Typography>
          </Box>
        </Box>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight="700"
          color="text.primary"
          mb={1}
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          {stat.value}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight="500"
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          {stat.title}
        </Typography>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#4CAF50';
      case 'In Transit': return '#2196F3';
      case 'Preparing': return '#FF9800';
      case 'Cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle sx={{ fontSize: { xs: 16, sm: 20 } }} />;
      case 'In Transit': return <DirectionsBike sx={{ fontSize: { xs: 16, sm: 20 } }} />;
      case 'Preparing': return <Restaurant sx={{ fontSize: { xs: 16, sm: 20 } }} />;
      case 'Cancelled': return <Cancel sx={{ fontSize: { xs: 16, sm: 20 } }} />;
      default: return <Schedule sx={{ fontSize: { xs: 16, sm: 20 } }} />;
    }
  };

  // Mobile Order Card Component
  const MobileOrderCard = ({ order }) => (
    <Card
      elevation={0}
      sx={{
        mb: 2,
        border: '1px solid rgba(0,0,0,0.05)',
        borderRadius: 2,
        '&:hover': { bgcolor: '#f8f9ff' }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="body2" fontWeight="600" color="primary">
            {order.id}
          </Typography>
          <Chip
            icon={getStatusIcon(order.status)}
            label={order.status}
            size="small"
            sx={{
              bgcolor: `${getStatusColor(order.status)}15`,
              color: getStatusColor(order.status),
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </Box>
        <Typography variant="body2" fontWeight="600" mb={1}>
          {order.restaurant}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1}>
          Customer: {order.customer}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" fontWeight="600" color="success.main">
            {order.amount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {order.time}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{bgcolor: 'white', minHeight: '100vh',width: '100%',marginTop:'0px'}}>
      <Container >
        <Box mb={{ xs: 3, sm: 4 }}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            fontWeight="700"
            color="text.primary"
            gutterBottom
          >
            Good {timeOfDay}, Admin! 👋
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Here's what's happening with your food delivery platform today
          </Typography>
        </Box>

        {/* Main Stats */}
       <Typography
        variant={isMobile ? "body1" : "h6"}
        fontWeight="600"
        color="text.primary"
        mb={2}
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        📊 Overview Statistics
      </Typography>
      
      <Grid container spacing={{ xs: 2, sm: 3 }} mb={{ xs: 3, sm: 5 }}>
        {mainStats.map((stat, index) => (
          <Grid item xs={6} sm={6} md={3} key={index}>
            <StatCardNew stat={stat} />
          </Grid>
        ))}
      </Grid>

        {/* Today's Stats */}
        <Typography
          variant={isMobile ? "body1" : "h6"}
          fontWeight="600"
          color="text.primary"
          mb={2}
        >
          📈 Today's Performance
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 3 }} mb={{ xs: 3, sm: 5 }}>
          {todayStats.map((stat, index) => (
            <Grid item xs={6} sm={6} md={3} key={index}>
              <StatCard stat={stat} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={{ xs: 3, sm: 4 }}>
          {/* Recent Orders */}
          <Grid item xs={12} lg={7}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: { xs: 2, sm: 3 },
                border: '1px solid rgba(0,0,0,0.05)',
                overflow: 'hidden'
              }}
            >
              <Box sx={{
                p: { xs: 2, sm: 3 },
                bgcolor: '#fafbff',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
              }}>
                <Typography
                  variant={isMobile ? "body1" : "h6"}
                  fontWeight="600"
                  color="text.primary"
                >
                  🛵 Recent Orders
                </Typography>
              </Box>

              {/* Mobile View - Cards */}
              {isMobile ? (
                <Box sx={{ p: 2 }}>
                  {recentOrders.map((order, index) => (
                    <MobileOrderCard key={index} order={order} />
                  ))}
                </Box>
              ) : (
                /* Desktop/Tablet View - Table */
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Order ID
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Restaurant
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Customer
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Amount
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Time
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.map((order, index) => (
                        <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f8f9ff' } }}>
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight="600"
                              color="primary"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                              {order.id}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {order.restaurant}
                          </TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {order.customer}
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(order.status)}
                              label={order.status}
                              size="small"
                              sx={{
                                bgcolor: `${getStatusColor(order.status)}15`,
                                color: getStatusColor(order.status),
                                fontWeight: 600,
                                fontSize: { xs: '0.6rem', sm: '0.75rem' },
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              fontWeight="600"
                              color="success.main"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                              {order.amount}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                              {order.time}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>

          {/* Top Restaurants */}
          <Grid item xs={12} lg={5}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: { xs: 2, sm: 3 },
                border: '1px solid rgba(0,0,0,0.05)',
                height: 'fit-content'
              }}
            >
              <Box sx={{
                p: { xs: 2, sm: 3 },
                bgcolor: '#fafbff',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
              }}>
                <Typography
                  variant={isMobile ? "body1" : "h6"}
                  fontWeight="600"
                  color="text.primary"
                >
                  🏆 Top Performing Restaurants
                </Typography>
              </Box>
              <List sx={{ p: 0 }}>
                {topRestaurants.map((restaurant, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      py: { xs: 2, sm: 2.5 },
                      px: { xs: 2, sm: 3 },
                      borderBottom: index < topRestaurants.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                      '&:hover': { bgcolor: '#f8f9ff' }
                    }}
                  >
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          bgcolor: `hsl(${index * 60}, 70%, 50%)`,
                          width: { xs: 32, sm: 40 },
                          height: { xs: 32, sm: 40 },
                          fontWeight: 600,
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                          <Typography
                            fontWeight="600"
                            color="text.primary"
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                          >
                            {restaurant.name}
                          </Typography>
                          <Chip
                            label={restaurant.growth}
                            size="small"
                            sx={{
                              bgcolor: '#e8f5e8',
                              color: '#4CAF50',
                              fontWeight: 600,
                              fontSize: { xs: '0.6rem', sm: '0.75rem' }
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          spacing={1}
                          sx={{ mt: 1 }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            {restaurant.orders} orders • ⭐ {restaurant.rating}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="600"
                            color="success.main"
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            {restaurant.revenue}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box mt={{ xs: 3, sm: 5 }}>
          <Typography
            variant={isMobile ? "body1" : "h6"}
            fontWeight="600"
            color="text.primary"
            mb={2}
          >
            ⚡ Quick Actions
          </Typography>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {[
              { title: 'Manage Orders', icon: <ShoppingCart />, color: '#2196F3', desc: 'View and manage all orders' },
              { title: 'Rider Management', icon: <DeliveryDining />, color: '#4CAF50', desc: 'Track and assign riders' },
              { title: 'Restaurant Partners', icon: <Restaurant />, color: '#FF9800', desc: 'Manage restaurant partnerships' },
              { title: 'Analytics', icon: <Analytics />, color: '#9C27B0', desc: 'View detailed reports' },
            ].map((action, index) => (
              <Grid item xs={6} sm={6} md={3} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: { xs: 2, sm: 3 },
                    border: '1px solid rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 40, sm: 50 },
                      height: { xs: 40, sm: 50 },
                      borderRadius: 2,
                      backgroundColor: `${action.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: action.color,
                      mb: { xs: 1.5, sm: 2 },
                    }}
                  >
                    {React.cloneElement(action.icon, {
                      sx: { fontSize: { xs: 20, sm: 24 } }
                    })}
                  </Box>
                  <Typography
                    variant={isMobile ? "body2" : "h6"}
                    fontWeight="600"
                    color="text.primary"
                    mb={1}
                    sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }}
                  >
                    {action.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {action.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default FoodDeliveryDashboard;
