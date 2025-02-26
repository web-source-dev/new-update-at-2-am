import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Grid, Box, Paper, CircularProgress, Skeleton, InputAdornment, IconButton } from '@mui/material';
import axios from 'axios';
import Toast from '../Components/Toast/Toast';
import { useParams, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const ResetPasswordSkeleton = () => (
  <Container maxWidth="sm" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 3, textAlign: 'center' }} />
      <Paper sx={{ p: 3, width: '100%' }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={56} />
        </Box>
        <Skeleton variant="rectangular" height={42} />
      </Paper>
    </Box>
  </Container>
);

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [loading, setLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 3000); // Show skeleton for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setPassword(e.target.value);
    setError(''); // Clear error on input change
  };

  const validatePassword = (password) => {
    // Example validation: at least 8 characters
    return password.length >= 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true immediately on button click
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long.');
      setLoading(false); // Reset loading if validation fails
      return;
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/reset-password/${token}`, { password });
      setToast({ open: true, message: response.data.message, severity: 'success' });
      setTimeout(() => {
        navigate('/login'); // Navigate to login page after 3 seconds
      }, 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Server error, please try again.';
      setToast({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      // Show loading for 2 seconds before resetting
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const handleClose = () => {
    setToast({ ...toast, open: false });
  };

  if (showSkeleton) {
    return <ResetPasswordSkeleton />;
  }

  return (
    <Container maxWidth="sm" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reset Password
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="New Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handleChange}
                fullWidth
                required
                error={!!error}
                helperText={error}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Reset Password"}
              </Button>
            </Grid>
          </Grid>
        </form>
        <Toast open={toast.open} message={toast.message} severity={toast.severity} handleClose={handleClose} />
      </div>
    </Container>
  );
};

export default ResetPassword;
