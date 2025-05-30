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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Stack,
  Fade,
  Grow,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Restaurant,
  DeliveryDining,
  AttachMoney,
  Today,
  AccountBalanceWallet,
  DirectionsBike,
  Pending,
  ShoppingCart,
  Analytics,
  CheckCircle,
  Cancel,
  Schedule,
  AutoAwesome,
  Brightness4,
  FlashOn,
  Timeline,
} from '@mui/icons-material';

const FoodDeliveryDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [timeOfDay, setTimeOfDay] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Morning');
    else if (hour < 18) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');
    
    setMounted(true);
  }, []);

  // Enhanced mock data with gradients
  const mainStats = [
    {
      title: 'Total Active Users',
      value: '18,765',
      change: '+2.6%',
      trend: 'up',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: <Timeline />,
    },
    {
      title: 'Total Installed',
      value: '4,876',
      change: '+0.2%',
      trend: 'up',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      icon: <FlashOn />,
    },
    {
      title: 'Total Downloads',
      value: '678',
      change: '-0.1%',
      trend: 'down',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      icon: <Brightness4 />,
    },
    {
      title: 'Total Earnings',
      value: '$287,450',
      change: '+15.3%',
      trend: 'up',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      icon: <AttachMoney />,
    },
  ];

  const todayStats = [
    {
      title: "Today's Orders",
      value: '1,247',
      change: '+18%',
      trend: 'up',
      icon: <Today sx={{ fontSize: { xs: 28, sm: 36 } }} />,
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      shadowColor: 'rgba(168, 237, 234, 0.4)',
    },
    {
      title: "Today's Earnings",
      value: '$12,580',
      change: '+22%',
      trend: 'up',
      icon: <AccountBalanceWallet sx={{ fontSize: { xs: 28, sm: 36 } }} />,
      gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      shadowColor: 'rgba(210, 153, 194, 0.4)',
    },
    {
      title: 'Active Riders',
      value: '847',
      change: '-3%',
      trend: 'down',
      icon: <DirectionsBike sx={{ fontSize: { xs: 28, sm: 36 } }} />,
      gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
      shadowColor: 'rgba(137, 247, 254, 0.4)',
    },
    {
      title: 'Pending Payments',
      value: '$5,420',
      change: '-8%',
      trend: 'down',
      icon: <Pending sx={{ fontSize: { xs: 28, sm: 36 } }} />,
      gradient: 'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)',
      shadowColor: 'rgba(253, 187, 45, 0.4)',
    },
  ];

  const recentOrders = [
    { id: '#12847', restaurant: 'Pizza Palace', customer: 'John Doe', status: 'Delivered', amount: '$28.50', time: '2 min ago' },
    { id: '#12846', restaurant: 'Burger King', customer: 'Jane Smith', status: 'In Transit', amount: '$15.75', time: '5 min ago' },
    { id: '#12844', restaurant: 'Taco Bell', customer: 'Sarah Wilson', status: 'Cancelled', amount: '$12.20', time: '12 min ago' },
  ];

  const topRestaurants = [
    { name: 'Pizza Palace', orders: 234, revenue: '$5,670', rating: 4.8, growth: '+15%' },
    { name: 'Burger Express', orders: 198, revenue: '$4,250', rating: 4.6, growth: '+12%' },
    { name: 'Sushi Master', orders: 167, revenue: '$6,890', rating: 4.9, growth: '+18%' },
    { name: 'Taco Fiesta', orders: 145, revenue: '$3,420', rating: 4.5, growth: '+8%' },
    { name: 'Italian Corner', orders: 132, revenue: '$4,100', rating: 4.7, growth: '+10%' },
  ];

  // Advanced animated chart component
  const AnimatedChart = ({ gradient, trend }) => {
    const bars = [0.3, 0.2, 0.6, 0.8, 0.4, 0.9, 0.7, 1.0, 0.5, 0.8];
    
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'end', 
          height: 50, 
          gap: 1,
          ml: 2,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: gradient,
            opacity: 0.1,
            borderRadius: 2,
            transform: 'scale(0.9)',
          }
        }}
      >
        {bars.map((height, index) => (
          <Box
            key={index}
            sx={{
              width: 4,
              height: 0,
              background: gradient,
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              animation: `barGrow 2s ease-out ${index * 0.1}s forwards`,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
              },
              '@keyframes barGrow': {
                to: {
                  height: height * 50,
                }
              }
            }}
          />
        ))}
      </Box>
    );
  };

  // Premium stat card with advanced effects
  const PremiumStatCard = ({ stat, index }) => {
    return (
      <Grow in={mounted} timeout={1000 + index * 200}>
        <Card 
          sx={{ 
            height: '100%',
            background: stat.gradient,
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              transition: 'opacity 0.3s ease',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              transition: 'transform 0.6s ease',
              transform: 'scale(0)',
            },
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 25px rgba(0,0,0,0.1)',
              '&::before': {
                opacity: 0.8,
              },
              '&::after': {
                transform: 'scale(1)',
              }
            }
          }}
        >
          <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 3, 
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
              }}>
                {React.cloneElement(stat.icon, {
                  sx: { 
                    fontSize: 24, 
                    color: 'white',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }
                })}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {stat.trend === 'up' ? (
                  <TrendingUp sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 20 }} />
                ) : (
                  <TrendingDown sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 20 }} />
                )}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}
                >
                  {stat.change}
                </Typography>
              </Box>
            </Box>
            
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800,
                color: 'white',
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              {stat.value}
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 500,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                fontSize: '0.875rem'
              }}
            >
              {stat.title}
            </Typography>
            
            <Box sx={{ mt: 2, opacity: 0.8 }}>
              <AnimatedChart gradient="rgba(255,255,255,0.3)" trend={stat.trend} />
            </Box>
          </CardContent>
        </Card>
      </Grow>
    );
  };

  // Glass morphism today stat card
  const GlassStatCard = ({ stat, index }) => (
    <Fade in={mounted} timeout={1500 + index * 300}>
      <Card
        sx={{
          height: '100%',
          background: stat.gradient,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          },
          '&:hover': {
            transform: 'translateY(-12px) rotateX(5deg)',
            boxShadow: `0 25px 80px ${stat.shadowColor}, 0 12px 30px rgba(0,0,0,0.1)`,
            '&::before': {
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
            }
          }
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
              }}
            >
              {React.cloneElement(stat.icon, {
                sx: { color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }
              })}
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {stat.trend === 'up' ? (
                <TrendingUp sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 24 }} />
              ) : (
                <TrendingDown sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 24 }} />
              )}
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 700,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                {stat.change}
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="h3"
            fontWeight="800"
            color="white"
            mb={1}
            sx={{ 
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontSize: { xs: '1.75rem', sm: '2.5rem' }
            }}
          >
            {stat.value}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 600,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            {stat.title}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#10b981';
      case 'In Transit': return '#3b82f6';
      case 'Preparing': return '#f59e0b';
      case 'Cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle sx={{ fontSize: 18 }} />;
      case 'In Transit': return <DirectionsBike sx={{ fontSize: 18 }} />;
      case 'Preparing': return <Restaurant sx={{ fontSize: 18 }} />;
      case 'Cancelled': return <Cancel sx={{ fontSize: 18 }} />;
      default: return <Schedule sx={{ fontSize: 18 }} />;
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(100px)',
      }
    }}>
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        {/* Header Section */}
        <Fade in={mounted} timeout={800}>
          <Box mb={5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{
                width: 60,
                height: 60,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <AutoAwesome sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant={isMobile ? "h4" : "h3"}
                  fontWeight="800"
                  sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                  gutterBottom
                >
                  Good {timeOfDay}, Admin! ✨
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                  }}
                >
                  Welcome to your enhanced food delivery command center
                </Typography>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Main Stats with Premium Cards */}
        <Box mb={6}>
          <Typography
            variant="h5"
            fontWeight="700"
            sx={{ 
              color: 'white', 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            📊 Performance Overview
          </Typography>
          <Grid container spacing={3}>
            {mainStats.map((stat, index) => (
              <Grid item xs={6} sm={6} md={3} key={index}>
                <PremiumStatCard stat={stat} index={index} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Today's Stats with Glass Effect */}
        <Box mb={6}>
          <Typography
            variant="h5"
            fontWeight="700"
            sx={{ 
              color: 'white', 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            🚀 Today's Highlights
          </Typography>
          <Grid container spacing={3}>
            {todayStats.map((stat, index) => (
              <Grid item xs={6} sm={6} md={3} key={index}>
                <GlassStatCard stat={stat} index={index} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Grid container spacing={4}>
          {/* Recent Orders with Glass Effect */}
          <Grid item xs={12} lg={7}>
            <Fade in={mounted} timeout={2000}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.15)',
                  }
                }}
              >
                <Box sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Typography
                    variant="h6"
                    fontWeight="700"
                    sx={{ color: 'white' }}
                  >
                    🛵 Recent Orders
                  </Typography>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ 
                        background: 'rgba(255,255,255,0.05)',
                        '& .MuiTableCell-root': {
                          color: 'rgba(255,255,255,0.8)',
                          fontWeight: 600,
                          border: 'none'
                        }
                      }}>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Company</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.map((order, index) => (
                        <TableRow 
                          key={index} 
                          sx={{ 
                            '&:hover': { 
                              background: 'rgba(255,255,255,0.1)',
                            },
                            '& .MuiTableCell-root': {
                              color: 'white',
                              border: 'none'
                            }
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="600" color="primary">
                              {order.id}
                            </Typography>
                          </TableCell>
                          <TableCell>{order.restaurant}</TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(order.status)}
                              label={order.status}
                              size="small"
                              sx={{
                                background: `${getStatusColor(order.status)}20`,
                                color: getStatusColor(order.status),
                                fontWeight: 600,
                                border: `1px solid ${getStatusColor(order.status)}40`,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="600" color="#10b981">
                              {order.amount}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              {order.time}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Fade>
          </Grid>

          {/* Top Restaurants */}
          <Grid item xs={12} lg={5}>
            <Fade in={mounted} timeout={2200}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  height: 'fit-content',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.15)',
                  }
                }}
              >
                <Box sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Typography
                    variant="h6"
                    fontWeight="700"
                    sx={{ color: 'white' }}
                  >
                    🏆 Top Performing Restaurants
                  </Typography>
                </Box>
                <List sx={{ p: 0 }}>
                  {topRestaurants.map((restaurant, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        py: 3,
                        px: 3,
                        borderBottom: index < topRestaurants.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          background: 'rgba(255,255,255,0.1)',
                          transform: 'translateX(8px)'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            background: `linear-gradient(135deg, hsl(${index * 60}, 70%, 60%) 0%, hsl(${index * 60 + 30}, 70%, 50%) 100%)`,
                            width: 48,
                            height: 48,
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography fontWeight="700" sx={{ color: 'white' }}>
                              {restaurant.name}
                            </Typography>
                            <Chip
                              label={restaurant.growth}
                              size="small"
                              sx={{
                                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                color: 'white',
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={2}
                          >
                            <Typography
                              variant="body2"
                              sx={{ color: 'rgba(255,255,255,0.7)' }}
                            >
                              {restaurant.orders} orders • ⭐ {restaurant.rating}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight="700"
                              sx={{ color: '#10b981' }}
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
            </Fade>
          </Grid>
        </Grid>

        {/* Quick Actions with Enhanced Cards */}
        <Box mt={6}>
          <Typography
            variant="h5"
            fontWeight="700"
            sx={{ 
              color: 'white', 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            ⚡ Quick Actions
          </Typography>
          <Grid container spacing={3}>
            {[
              { 
                title: 'Manage Orders', 
                icon: <ShoppingCart />, 
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                desc: 'View and manage all orders',
                shadowColor: 'rgba(102, 126, 234, 0.4)'
              },
              { 
                title: 'Rider Management', 
                icon: <DeliveryDining />, 
                gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                desc: 'Track and assign riders',
                shadowColor: 'rgba(240, 147, 251, 0.4)'
              },
              { 
                title: 'Restaurant Partners', 
                icon: <Restaurant />, 
                gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                desc: 'Manage restaurant partnerships',
                shadowColor: 'rgba(79, 172, 254, 0.4)'
              },
              { 
                title: 'Analytics', 
                icon: <Analytics />, 
                gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                desc: 'View detailed reports',
                shadowColor: 'rgba(67, 233, 123, 0.4)'
              },
            ].map((action, index) => (
              <Grid item xs={6} sm={6} md={3} key={index}>
                <Grow in={mounted} timeout={2500 + index * 200}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 4,
                      background: action.gradient,
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                        transition: 'opacity 0.3s ease',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: -100,
                        left: -100,
                        width: 200,
                        height: 200,
                        background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                        borderRadius: '50%',
                        transition: 'all 0.6s ease',
                        transform: 'scale(0)',
                        opacity: 0,
                      },
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.05) rotateY(5deg)',
                        boxShadow: `0 25px 80px ${action.shadowColor}, 0 12px 30px rgba(0,0,0,0.15)`,
                        '&::before': {
                          opacity: 0.8,
                        },
                        '&::after': {
                          transform: 'scale(1)',
                          opacity: 1,
                        }
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 3,
                          background: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(10px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(255,255,255,0.3)',
                          mb: 3,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {React.cloneElement(action.icon, {
                          sx: { 
                            fontSize: 28, 
                            color: 'white',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                          }
                        })}
                      </Box>
                      <Typography
                        variant="h6"
                        fontWeight="700"
                        sx={{ 
                          color: 'white',
                          mb: 2,
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                      >
                        {action.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ 
                          color: 'rgba(255,255,255,0.8)',
                          lineHeight: 1.6,
                          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                          flexGrow: 1
                        }}
                      >
                        {action.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Floating Action Button */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 30,
            right: 30,
            zIndex: 1000,
          }}
        >
          <Grow in={mounted} timeout={3000}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  transform: 'scale(1.1) rotate(180deg)',
                  boxShadow: '0 12px 48px rgba(102, 126, 234, 0.6)',
                }
              }}
            >
              <AutoAwesome sx={{ color: 'white', fontSize: 28 }} />
            </Box>
          </Grow>
        </Box>
      </Container>
    </Box>
  );
};

export default FoodDeliveryDashboard;