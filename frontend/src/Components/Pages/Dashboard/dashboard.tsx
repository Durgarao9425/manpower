import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  Container,
  Paper,
  Avatar,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  DirectionsBike,
  Business,
  AttachMoney,
  People,
  Store,
  Person,
  TrendingUp,
  Schedule,
  LocalShipping,
  CheckCircle,
  Cancel,
  Timer,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// Import actual components
import RiderListingPage from "../RidersPage/riderList";
import CompanyPage from "../Company/companyPage";
import UserListing from "../UserPage/userList";

const DashboardNew = () => {
  const [selectedView, setSelectedView] = useState("Overview");

  // Sample data for charts
  const weeklyData = [
    { name: 'Mon', deliveries: 45, earnings: 2500 },
    { name: 'Tue', deliveries: 52, earnings: 2800 },
    { name: 'Wed', deliveries: 48, earnings: 2600 },
    { name: 'Thu', deliveries: 61, earnings: 3200 },
    { name: 'Fri', deliveries: 55, earnings: 2900 },
    { name: 'Sat', deliveries: 67, earnings: 3500 },
    { name: 'Sun', deliveries: 43, earnings: 2300 },
  ];

  const monthlyRevenue = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  const deliveryStatus = [
    { name: 'Completed', value: 156, color: '#4caf50' },
    { name: 'In Progress', value: 23, color: '#ff9800' },
    { name: 'Cancelled', value: 8, color: '#f44336' },
    { name: 'Pending', value: 12, color: '#2196f3' },
  ];

  const recentOrders = [
    { id: '#001', customer: 'John Doe', rider: 'Alex Smith', status: 'Delivered', amount: '₹450', time: '10:30 AM' },
    { id: '#002', customer: 'Jane Smith', rider: 'Mike Johnson', status: 'In Transit', amount: '₹320', time: '11:15 AM' },
    { id: '#003', customer: 'Bob Wilson', rider: 'Sarah Davis', status: 'Picked Up', amount: '₹280', time: '11:45 AM' },
    { id: '#004', customer: 'Alice Brown', rider: 'Tom Wilson', status: 'Pending', amount: '₹520', time: '12:00 PM' },
  ];

  const topRiders = [
    { name: 'Alex Smith', deliveries: 45, rating: 4.8, earnings: '₹12,500' },
    { name: 'Mike Johnson', deliveries: 38, rating: 4.7, earnings: '₹10,200' },
    { name: 'Sarah Davis', deliveries: 32, rating: 4.9, earnings: '₹8,900' },
    { name: 'Tom Wilson', deliveries: 28, rating: 4.6, earnings: '₹7,800' },
  ];

  const viewsData = {
    Overview: {
      cards: [
        {
          title: "Total Riders",
          value: "6",
          icon: <DirectionsBike sx={{ fontSize: 40, color: "#5470c6" }} />,
          bgColor: "#f0f4ff",
          borderColor: "#5470c6",
        },
        {
          title: "Total Companies",
          value: "1",
          icon: <Business sx={{ fontSize: 40, color: "#91cc75" }} />,
          bgColor: "#f0fff4",
          borderColor: "#91cc75",
        },
        {
          title: "Total Users",
          value: "15",
          icon: <Person sx={{ fontSize: 40, color: "#fac858" }} />,
          bgColor: "#fffbf0",
          borderColor: "#fac858",
        },
        {
          title: "Total Earnings",
          value: "₹0.00",
          icon: <AttachMoney sx={{ fontSize: 40, color: "#73c0de" }} />,
          bgColor: "#f0faff",
          borderColor: "#73c0de",
        },
      ],
    },
    Riders: {
      component: <RiderListingPage />,
      cards: [
        {
          title: "Total Riders",
          value: "6",
          icon: <People sx={{ fontSize: 40, color: "#5470c6" }} />,
          bgColor: "#f0f4ff",
          borderColor: "#5470c6",
        },
        {
          title: "Active Riders",
          value: "4",
          icon: <DirectionsBike sx={{ fontSize: 40, color: "#4caf50" }} />,
          bgColor: "#e8f5e9",
          borderColor: "#4caf50",
        },
        {
          title: "Inactive Riders",
          value: "2",
          icon: <People sx={{ fontSize: 40, color: "#f44336" }} />,
          bgColor: "#ffebee",
          borderColor: "#f44336",
        },
      ],
    },
    Companies: {
      component: <CompanyPage />,
      cards: [
        {
          title: "Total Companies",
          value: "1",
          icon: <Business sx={{ fontSize: 40, color: "#91cc75" }} />,
          bgColor: "#f0fff4",
          borderColor: "#91cc75",
        },
        {
          title: "Active Companies",
          value: "1",
          icon: <Store sx={{ fontSize: 40, color: "#4caf50" }} />,
          bgColor: "#e8f5e9",
          borderColor: "#4caf50",
        },
      ],
    },
    Users: {
      component: <UserListing />,
      cards: [
        {
          title: "Total Users",
          value: "15",
          icon: <Person sx={{ fontSize: 40, color: "#673ab7" }} />,
          bgColor: "#ede7f6",
          borderColor: "#673ab7",
        },
        {
          title: "Active Users",
          value: "12",
          icon: <Person sx={{ fontSize: 40, color: "#4caf50" }} />,
          bgColor: "#e8f5e9",
          borderColor: "#4caf50",
        },
        {
          title: "Admins",
          value: "3",
          icon: <Person sx={{ fontSize: 40, color: "#2196f3" }} />,
          bgColor: "#e3f2fd",
          borderColor: "#2196f3",
        },
      ],
    },
  };

  const handleViewChange = (event) => {
    setSelectedView(event.target.value);
  };

  const currentView = viewsData[selectedView] || viewsData.Overview;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#4caf50';
      case 'In Transit': return '#ff9800';
      case 'Picked Up': return '#2196f3';
      case 'Pending': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, backgroundColor: "#fafafa", minHeight: "100vh" }}
    >
      {/* Header Section */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 600, color: "#333" }}>
            {selectedView === "Overview"
              ? "Dashboard Overview"
              : `${selectedView} Management`}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControl sx={{ minWidth: 200 }}>
            <Select
              value={selectedView}
              onChange={handleViewChange}
              sx={{
                backgroundColor: "white",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e0e0e0",
                },
              }}
            >
              <MenuItem value="Overview">Overview</MenuItem>
              <MenuItem value="Riders">Riders</MenuItem>
              <MenuItem value="Companies">Companies</MenuItem>
              <MenuItem value="Users">Users</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#5470c6",
              color: "white",
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "#4563b8",
              },
            }}
          >
            {selectedView === "Overview"
              ? "Refresh Data"
              : `Manage ${selectedView}`}
          </Button>
        </Box>
      </Paper>

      {/* Dashboard Cards - Show only if not in component view */}
      {selectedView === "Overview" || currentView.cards ? (
        <Grid container spacing={3}>
          {(currentView.cards || viewsData.Overview.cards).map(
            (item, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    border: `2px solid ${item.borderColor}`,
                    backgroundColor: "white",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: `0 8px 25px rgba(0,0,0,0.15)`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        sx={{
                          backgroundColor: item.bgColor,
                          width: 60,
                          height: 60,
                          mr: 2,
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: "#333",
                            mb: 0.5,
                          }}
                        >
                          {item.value}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#666",
                            fontSize: "0.9rem",
                            fontWeight: 500,
                          }}
                        >
                          {item.title}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        height: 4,
                        backgroundColor: item.bgColor,
                        borderRadius: 2,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: "60%",
                          backgroundColor: item.borderColor,
                          borderRadius: 2,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          )}
        </Grid>
      ) : null}

      {/* Additional Dashboard Content - Only show in Overview */}
      {selectedView === "Overview" && (
        <>
          {/* Performance Metrics Cards */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>Today's Orders</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#333" }}>247</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                        <TrendingUp sx={{ fontSize: 16, color: "#4caf50", mr: 0.5 }} />
                        <Typography variant="caption" sx={{ color: "#4caf50" }}>+12% from yesterday</Typography>
                      </Box>
                    </Box>
                    <LocalShipping sx={{ fontSize: 40, color: "#5470c6", opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>Avg Delivery Time</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#333" }}>28 min</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                        <Timer sx={{ fontSize: 16, color: "#ff9800", mr: 0.5 }} />
                        <Typography variant="caption" sx={{ color: "#ff9800" }}>-5 min from last week</Typography>
                      </Box>
                    </Box>
                    <Schedule sx={{ fontSize: 40, color: "#91cc75", opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>Success Rate</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#333" }}>94.5%</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={94.5} 
                        sx={{ 
                          mt: 1, 
                          height: 6, 
                          borderRadius: 3,
                          '& .MuiLinearProgress-bar': { backgroundColor: '#4caf50' }
                        }} 
                      />
                    </Box>
                    <CheckCircle sx={{ fontSize: 40, color: "#4caf50", opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>Customer Rating</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#333" }}>4.7/5</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                        {[...Array(5)].map((_, i) => (
                          <Box key={i} sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            backgroundColor: i < 4 ? '#ffc107' : '#e0e0e0',
                            mr: 0.5 
                          }} />
                        ))}
                      </Box>
                    </Box>
                    <Person sx={{ fontSize: 40, color: "#fac858", opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* Weekly Performance Chart */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ borderRadius: 3, backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "#333" }}>
                    Weekly Performance
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: 8 
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="deliveries" 
                        stroke="#5470c6" 
                        fill="#5470c6" 
                        fillOpacity={0.3}
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Delivery Status Chart */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ borderRadius: 3, backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "#333" }}>
                    Delivery Status
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={deliveryStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {deliveryStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 2 }}>
                    {deliveryStatus.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          backgroundColor: item.color, 
                          mr: 1 
                        }} />
                        <Typography variant="body2" sx={{ color: '#666', flexGrow: 1 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Monthly Revenue Chart */}
            <Grid item xs={12} lg={6}>
              <Card sx={{ borderRadius: 3, backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "#333" }}>
                    Monthly Revenue
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: 8 
                        }} 
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="#91cc75" 
                        radius={[4, 4, 0, 0]}
                        name="Revenue (₹)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Top Riders */}
            <Grid item xs={12} lg={6}>
              <Card sx={{ borderRadius: 3, backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "#333" }}>
                    Top Performing Riders
                  </Typography>
                  {topRiders.map((rider, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2, 
                      p: 2, 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: 2 
                    }}>
                      <Avatar sx={{ 
                        backgroundColor: '#5470c6', 
                        color: 'white', 
                        width: 40, 
                        height: 40, 
                        mr: 2 
                      }}>
                        {rider.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {rider.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {rider.deliveries} deliveries • ⭐ {rider.rating}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                        {rider.earnings}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Orders */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "#333" }}>
                    Recent Orders
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Rider</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell sx={{ fontWeight: 600, color: '#5470c6' }}>
                              {order.id}
                            </TableCell>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell>{order.rider}</TableCell>
                            <TableCell>
                              <Chip 
                                label={order.status} 
                                size="small"
                                sx={{ 
                                  backgroundColor: getStatusColor(order.status), 
                                  color: 'white',
                                  fontWeight: 500
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{order.amount}</TableCell>
                            <TableCell sx={{ color: '#666' }}>{order.time}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Render either the component or additional content */}
      {currentView.component ? (
        <Box sx={{ mt: 4 }}>{currentView.component}</Box>
      ) : (
        currentView.content
      )}
    </Container>
  );
};

export default DashboardNew;