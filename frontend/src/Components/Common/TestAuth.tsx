import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { useAuth } from '../Pages/Dashboard/Login/authcontext';
import authService from '../../services/authService';
import apiService from '../../services/apiService';

/**
 * Test component to verify authentication is working
 */
const TestAuth: React.FC = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Test the health endpoint
  const testHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get('/health');
      setTestResult(JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error('Health test error:', err);
      setError('Failed to connect to health endpoint');
    } finally {
      setLoading(false);
    }
  };

  // Test the auth status
  const testAuth = () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const expiration = localStorage.getItem('tokenExpiration');
      const user = localStorage.getItem('user');
      
      setTestResult(JSON.stringify({
        isAuthenticated,
        currentUser,
        token: token ? `${token.substring(0, 20)}...` : null,
        tokenExpiration: expiration ? new Date(parseInt(expiration)).toISOString() : null,
        user: user ? JSON.parse(user) : null
      }, null, 2));
    } catch (err) {
      console.error('Auth test error:', err);
      setError('Failed to test auth status');
    } finally {
      setLoading(false);
    }
  };

  // Test the protected endpoint
  const testProtected = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get('/test');
      setTestResult(JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error('Protected test error:', err);
      setError('Failed to access protected endpoint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Authentication Test
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </Typography>
        
        {currentUser && (
          <Typography variant="body2" gutterBottom>
            User: {currentUser.username} ({currentUser.user_type})
          </Typography>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={testHealth} disabled={loading}>
            Test Health
          </Button>
          <Button variant="contained" onClick={testAuth} disabled={loading}>
            Test Auth
          </Button>
          <Button variant="contained" onClick={testProtected} disabled={loading}>
            Test Protected
          </Button>
          {isAuthenticated && (
            <Button variant="outlined" color="error" onClick={logout} disabled={loading}>
              Logout
            </Button>
          )}
        </Box>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        
        {testResult && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, overflow: 'auto' }}>
            <pre>{testResult}</pre>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default TestAuth;