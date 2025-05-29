import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Avatar,
  IconButton,
  InputAdornment,
  Alert,
  Grid,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  ArrowBack,
  Login as LoginIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const theme = createTheme({
  palette: {
    primary: {
      main: "#667eea",
    },
    secondary: {
      main: "#764ba2",
    },
    background: {
      default: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 12,
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
  },
});

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    // Clear any previous login errors
    if (loginError) setLoginError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!validateForm()) return;

    setIsSubmitting(true);
    console.log(formData,"formDataformData")
try {
  // Send login credentials to backend for authentication
  const response = await fetch("http://localhost:4003/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: formData.username,
      password: formData.password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    setLoginError(data.message || "Invalid username or password");
    return;
  }

  // If login successful, store user data
  if (data.user) {
    const userId = data.user.id;

    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userRole", data.user.user_type);
    localStorage.setItem("userId", userId.toString());
    localStorage.setItem("userName", data.user.full_name);
    localStorage.setItem("userEmail", data.user.email);

    if (formData.rememberMe) {
      localStorage.setItem("rememberedUser", formData.username);
    } else {
      localStorage.removeItem("rememberedUser");
    }

    // Additional APIs after successful login
    const [userRes, notificationsRes, tasksRes] = await Promise.all([
      fetch(`http://localhost:4003/api/users/${userId}`),
      fetch(`http://localhost:4003/api/notifications/${userId}`),
      fetch(`http://localhost:4003/api/tasks/${userId}`),
    ]);

    const userDetails = await userRes.json();
    const notifications = await notificationsRes.json();
    const tasks = await tasksRes.json();

    console.log("User Details:", userDetails);
    console.log("Notifications:", notifications);
    console.log("Tasks:", tasks);

    // Navigate based on user type
    if (data.user.user_type === "admin") {
      navigate("/dashboard");
    } else if (data.user.user_type === "rider") {
      navigate("/rider-dashboard");
    } else {
      setLoginError("Access denied. Invalid user type.");
    }
  } else {
    setLoginError("Invalid response from server");
  }
} catch (error) {
  console.error("Login error:", error);
  setLoginError("Unable to connect to server. Please try again.");
}
  };
  

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleCreateAccount = () => {
    navigate("/rider-form");
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          overflow: "hidden",
        }}
      >
        <IconButton
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            color: "white",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            },
          }}
          onClick={() => navigate("/")}
        >
          <ArrowBack />
        </IconButton>

        <Paper
          elevation={24}
          sx={{
            width: { xs: "90%", sm: 400, md: 400 },
            maxWidth: 400,
            p: 3,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            mx: 2,
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                margin: "0 auto 12px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <Person fontSize="medium" />
            </Avatar>

            <Typography variant="h5" fontWeight={600}>
              Welcome Back!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to ManPower Project Delivery
            </Typography>
          </Box>

          {loginError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              size="small"
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              error={!!errors.username}
              helperText={errors.username}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  color="primary"
                />
              }
              label="Remember me"
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              fullWidth
              size="medium"
              variant="contained"
              startIcon={<LoginIcon />}
              disabled={isSubmitting}
              sx={{
                mb: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                },
              }}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>

            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="text"
                  size="small"
                  onClick={() => {}}
                >
                  Forgot Password?
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="text"
                  size="small"
                  onClick={handleCreateAccount}
                >
                  Create Account
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              © 2024 ManPower Project Delivery
            </Typography>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}