import React, { useState } from 'react';
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
  Grid
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  ArrowBack,
  Login as LoginIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
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
    username: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard')
    
    if (validateForm()) {
      // Simulate login process
      console.log('Login attempted with:', formData);
      setLoginSuccess(true);
      
      // Reset form after successful login simulation
      setTimeout(() => {
        setLoginSuccess(false);
        setFormData({
          username: '',
          password: '',
          rememberMe: false
        });
      }, 2000);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: { xs: 2, sm: 3 },
          minWidth:'100vw'
        }}
      >
        {/* Back to Home Button */}
        <IconButton
          sx={{
            position: 'absolute',
            top: { xs: 16, sm: 24 },
            left: { xs: 16, sm: 24 },
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <ArrowBack />
        </IconButton>

        <Container maxWidth="xs">
          <Paper
            elevation={24}
            sx={{
              p: { xs: 3, sm: 4 },
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            {/* Logo Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto 16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '2rem',
                }}
              >
                <Person fontSize="large" />
              </Avatar>
              
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: '#333',
                  mb: 1,
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                }}
              >
                Welcome Back!
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: '#666',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                }}
              >
                Sign in to ManPower Project Delivery
              </Typography>
            </Box>

            {/* Success Alert */}
            {loginSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Login successful! Redirecting to dashboard...
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                error={!!errors.username}
                helperText={errors.username}
                sx={{ mb: 3 }}
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
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                error={!!errors.password}
                helperText={errors.password}
                sx={{ mb: 3 }}
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
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                sx={{
                  mb: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                }}
              >
                Sign In
              </Button>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="text"
                    color="primary"
                    sx={{ fontSize: '0.9rem' }}
                  >
                    Forgot Password?
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="text"
                    color="primary"
                    sx={{ fontSize: '0.9rem' }}
                  >
                    Create Account
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body2" sx={{ color: '#888' }}>
                © 2024 ManPower Project Delivery
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}