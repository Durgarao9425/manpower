import React from "react";
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
  useMediaQuery,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";

const ReusableCard = ({
  data = [],
  onEdit,
  onDelete,
  cardConfig = {
    primaryField: "full_name",
    secondaryField: "username",
    avatarField: "full_name",
    emailField: "email",
    typeField: "user_type",
    statusField: "status",
    companyField: "company_id",
  },
  labels = {
    email: "Email",
    company_id: "Company ID",
    user_type: "Role",
    status: "Status",
  },
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

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
      admin: "error",
      company: "primary",
      rider: "secondary",
      store_manager: "success",
    };
    return colorMap[type] || "default";
  };

  const getStatusColor = (status) => {
    const colorMap = {
      active: "success",
      inactive: "warning",
      suspended: "error",
    };
    return colorMap[status] || "default";
  };

  const getGridSize = () => {
    if (isMobile) return 12; // 1 card per row on mobile
    if (isTablet) return 6; // 2 cards per row on tablet
    return 4; // 3 cards per row on desktop
  };

  const renderFieldValue = (user, fieldKey) => {
    const value = user[fieldKey];
    if (!value) return null;

    // Special handling for certain field types
    if (fieldKey === cardConfig.typeField) {
      return (
        <Chip
          label={value.replace("_", " ").toUpperCase()}
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
    <Grid container spacing={3} sx={{ p: { xs: 0, sm: 0 } }}>
      {data.map((user, index) => (
        <Grid item xs={getGridSize()} key={user.id || index}>
          <Card
            elevation={3}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              transition: "all 0.3s ease-in-out",
              borderRadius: 3,
              overflow: "hidden",
              position: "relative",
              backgroundColor: "#fafafa",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              {/* Avatar and User Info */}
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: theme.palette.primary.main,
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    mr: 2,
                  }}
                >
                  {user[cardConfig.avatarField]?.charAt(0)?.toUpperCase() || (
                    <PersonIcon />
                  )}
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ mb: 0.3 }}
                  >
                    {user[cardConfig.primaryField] || "Unknown User"}
                  </Typography>
                  {user[cardConfig.secondaryField] && (
                    <Typography variant="body2" color="text.secondary">
                      @{user[cardConfig.secondaryField]}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Email & Company */}
              <Box sx={{ mb: 2 }}>
                {user[cardConfig.emailField] && (
                  <Box mb={1.5}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="text.secondary"
                    >
                      {labels.email || "Email"}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {user[cardConfig.emailField]}
                    </Typography>
                  </Box>
                )}

                {user[cardConfig.companyField] && (
                  <Box mb={1.5}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="text.secondary"
                    >
                      {labels.company_id || "Company ID"}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {user[cardConfig.companyField]}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Chips: Role & Status */}
              <Box display="flex" flexWrap="wrap" gap={2}>
                {user[cardConfig.typeField] && (
                  <Chip
                    label={user[cardConfig.typeField]
                      .replace("_", " ")
                      .toUpperCase()}
                    color={getUserTypeColor(user[cardConfig.typeField])}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      letterSpacing: 0.5,
                    }}
                  />
                )}
                {user[cardConfig.statusField] && (
                  <Chip
                    label={user[cardConfig.statusField].toUpperCase()}
                    color={getStatusColor(user[cardConfig.statusField])}
                    size="small"
                    sx={{
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>
            </CardContent>

            {/* Action Buttons */}
            <CardActions
              sx={{
                px: 3,
                pb: 2,
                pt: 1,
                justifyContent: "space-between",
                borderTop: `1px solid ${theme.palette.divider}`,
                backgroundColor: "#f5f5f5",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => onEdit?.(user)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2.5,
                  fontWeight: 500,
                  backgroundColor: "#1976d2",
                  ":hover": {
                    backgroundColor: "#115293",
                  },
                }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => onDelete?.(user)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2.5,
                  fontWeight: 500,
                  borderColor: "#f44336",
                  color: "#f44336",
                  ":hover": {
                    backgroundColor: "#ffebee",
                    borderColor: "#d32f2f",
                  },
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
