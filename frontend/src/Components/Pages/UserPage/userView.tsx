import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import apiService from "../../../services/apiService";

interface User {
  id: number;
  company_id: number | null;
  username: string;
  email: string;
  user_type: string;
  full_name: string;
  phone: string;
  address: string;
  profile_image: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UserViewProps {
  userId: number;
  onClose: () => void;
  onEdit: (user: User) => void;
}

const UserView: React.FC<UserViewProps> = ({ userId, onClose, onEdit }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
console.log(user,"user-----------------------")
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiService.get(`/users/${userId}`);
        setUser(response?.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <Typography>Loading user details...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <Typography color="error">User not found</Typography>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      case "suspended":
        return "error";
      default:
        return "default";
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "admin":
        return "error";
      case "company":
        return "primary";
      case "rider":
        return "success";
      case "store_manager":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" component="h1">
            User Details
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => onEdit(user)}
            >
              Edit User
            </Button>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Paper elevation={0} sx={{ p: 3, bgcolor: "#f8f9fa", borderRadius: 2 }}>
          <Grid container spacing={4}>
            {/* Profile Section */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <Avatar
                  src={user.profile_image}
                  sx={{ width: 150, height: 150, border: "2px solid #e0e0e0" }}
                />
                <Typography variant="h5" component="h2" align="center">
                  {user.full_name}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Chip
                    label={user.user_type?.toUpperCase()}
                    color={getUserTypeColor(user.user_type) as any}
                    size="small"
                  />
                  <Chip
                    label={user.status?.toUpperCase()}
                    color={getStatusColor(user.status) as any}
                    size="small"
                  />
                </Box>
              </Box>
            </Grid>

            {/* Details Section */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
                    Basic Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <PersonIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Username
                      </Typography>
                      <Typography variant="body1">{user.username}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <EmailIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Email Address
                      </Typography>
                      <Typography variant="body1">{user.email}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <PhoneIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Phone Number
                      </Typography>
                      <Typography variant="body1">{user?.phone || "Not provided"}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <BusinessIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Company ID
                      </Typography>
                      <Typography variant="body1">
                        {user.company_id || "Not assigned"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2 }}>
                    <LocationIcon color="action" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {user.address || "Not provided"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
                    Account Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <SecurityIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Account Type
                      </Typography>
                      <Typography variant="body1" sx={{ textTransform: "capitalize" }}>
                        {user?.user_type?.replace("_", " ")}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <SecurityIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Account Status
                      </Typography>
                      <Typography variant="body1" sx={{ textTransform: "capitalize" }}>
                        {user.status}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <SecurityIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Created At
                      </Typography>
                      <Typography variant="body1">
                        {new Date(user.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <SecurityIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body1">
                        {new Date(user.updated_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserView;
