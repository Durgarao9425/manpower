import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  Business,
  LocationOn,
  Badge,
  AccountCircle,
  Security,
} from "@mui/icons-material";
import axios from "axios";

interface User {
  id?: number;
  company_id?: number | string;
  username?: string;
  email?: string;
  user_type?: string;
  full_name?: string;
  phone?: string;
  address?: string;
  profile_image?: string;
  status?: "active" | "inactive" | "suspended";
  created_at?: string;
  updated_at?: string;
}

interface UserViewProps {
  selectedUserId: number | string;
}

interface ViewSection {
  title: string;
  items: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
}

const UserView: React.FC<UserViewProps> = ({ selectedUserId }) => {
  const [viewData, setViewData] = useState<ViewSection[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log(selectedUserId, "selectedUserId");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      case "suspended":
        return "error";
      default:
        return "default";
    }
  };

  const getUserTypeDisplay = (userType: string) => {
    switch (userType) {
      case "admin":
        return "Administrator";
      case "company":
        return "Company User";
      case "rider":
        return "Rider";
      case "store_manager":
        return "Store Manager";
      default:
        return userType || "Unknown";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!selectedUserId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `http://localhost:4003/api/users/${selectedUserId}`
        );
        const user = response.data;
        setUserData(user);

        // Create sections similar to your reference
        const sectionData: ViewSection[] = [
          {
            title: "Personal Information",
            items: [
              {
                label: "Full Name",
                value: user?.full_name || "-",
                icon: <Person fontSize="small" color="action" />,
              },
              {
                label: "Username",
                value: user?.username || "-",
                icon: <AccountCircle fontSize="small" color="action" />,
              },
              {
                label: "Email Address",
                value: user?.email || "-",
                icon: <Email fontSize="small" color="action" />,
              },
              {
                label: "Phone Number",
                value: user?.phone || "-",
                icon: <Phone fontSize="small" color="action" />,
              },
            ],
          },
          {
            title: "Account Information",
            items: [
              {
                label: "User Type",
                value: getUserTypeDisplay(user?.user_type || ""),
                icon: <Badge fontSize="small" color="action" />,
              },
              {
                label: "Status",
                value: user?.status?.toUpperCase() || "-",
                icon: <Security fontSize="small" color="action" />,
              },
              {
                label: "Company ID",
                value: user?.company_id || "-",
                icon: <Business fontSize="small" color="action" />,
              },
            ],
          },
        ];

        // Add address section if address exists
        if (user?.address) {
          sectionData.push({
            title: "Address Information",
            items: [
              {
                label: "Address",
                value: user.address,
                icon: <LocationOn fontSize="small" color="action" />,
              },
            ],
          });
        }

        // Add system information if available
        if (user?.created_at || user?.updated_at) {
          sectionData.push({
            title: "System Information",
            items: [
              ...(user?.created_at
                ? [
                    {
                      label: "Created Date",
                      value: formatDate(user.created_at),
                    },
                  ]
                : []),
              ...(user?.updated_at
                ? [
                    {
                      label: "Last Updated",
                      value: formatDate(user.updated_at),
                    },
                  ]
                : []),
            ],
          });
        }

        setViewData(sectionData);
      } catch (err) {
        setError("Failed to fetch user data. Please try again.");
        console.error("Error fetching user:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [selectedUserId]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 3 },
          mt: { xs: 2, sm: 4 },
        }}
      >
        {/* Profile Header */}
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                src={userData?.profile_image}
                sx={{
                  width: 78,
                  height: 80,
                  border: "3px solid",
                  borderColor: "primary.light",
                }}
              >
                {userData?.full_name
                  ? userData.full_name.charAt(0).toUpperCase()
                  : "U"}
              </Avatar>

              <Box flex={1}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {userData?.full_name || "Unknown User"}
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  @{userData?.username || "No username"}
                </Typography>

                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    label={getUserTypeDisplay(userData?.user_type || "")}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    label={userData?.status?.toUpperCase() || "UNKNOWN"}
                    color={getStatusColor(userData?.status || "")}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Information Sections */}
        <Box>
          {viewData.map((section, sectionIndex) => (
            <Card key={sectionIndex} elevation={1} sx={{ mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                {section?.title && (
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 3,
                      color: "primary.main",
                      borderBottom: "2px solid",
                      borderColor: "primary.light",
                      pb: 1,
                    }}
                  >
                    {section.title}
                  </Typography>
                )}

                <Grid
                  container
                  spacing={3}
                  sx={{
                    "& .MuiGrid-item": {
                      display: "flex",
                      flexDirection: "column",
                    },
                  }}
                >
                  {section?.items?.map((item, itemIndex) => (
                    <Grid item xs={12} sm={6} md={4} key={itemIndex}>
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: "grey.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.200",
                          height: "100%",
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          {item.icon}
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: "text.secondary",
                              fontSize: "0.875rem",
                            }}
                          >
                            {item.label}
                          </Typography>
                        </Box>

                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            wordBreak: "break-word",
                            color:
                              item.value === "-"
                                ? "text.disabled"
                                : "text.primary",
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
  );
};

export default UserView;
