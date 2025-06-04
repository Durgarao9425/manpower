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
} from "@mui/material";
import {
  DirectionsBike,
  Business,
  AttachMoney,
  People,
  Store,
  Person,
} from "@mui/icons-material";
import RiderListingPage from "../RidersPage/riderList";
import CompanyPage from "../Company/companyPage";
import UserListing from "../UserPage/userList";

const DashboardNew = () => {
  const [selectedView, setSelectedView] = useState("Overview");

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
