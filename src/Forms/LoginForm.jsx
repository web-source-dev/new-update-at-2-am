import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Grid, Paper, Box, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import axios from 'axios';
import Toast from '../Components/Toast/Toast';
import { Link } from 'react-router-dom';
import Links from '../Components/Buttons/Links';
import { Skeleton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const LoginFormSkeleton = () => (
  <Container maxWidth="sm">
    <Box sx={{ mt: 4 }}>
      <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 3, textAlign: 'center' }} />
      <Paper sx={{ p: 3 }}>
        {[...Array(2)].map((_, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Skeleton variant="text" sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={56} />
          </Box>
        ))}
        <Skeleton variant="rectangular" height={42} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Skeleton variant="text" width={120} />
          <Skeleton variant="text" width={120} />
        </Box>
      </Paper>
    </Box>
  </Container>
);

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [loading, setLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 3000); // Show skeleton for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, formData);
      const { token, user, message } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user_role', user.role);
      setToast({ open: true, message, severity: 'success' });
      if (user.role === 'admin') {
        localStorage.setItem('admin_id', user.id);
        window.location.href = '/dashboard/admin';
      } else if (user.role === 'distributor') {
        localStorage.setItem('user_id', user.id);
        window.location.href = '/dashboard/distributor';
      } else {
        localStorage.setItem('user_id', user.id);
        window.location.href = '/deals-catlog';
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Server error, please try again.';
      setToast({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setToast({ ...toast, open: false });
  };

  return (
    <Container maxWidth="sm" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '100%' }}>
        {showSkeleton ? (
          <LoginFormSkeleton />
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Login
              </Typography>
              <Typography mt={2} align="center" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', gap: '10px' }}>
                Don't have an account? <Links link="/register" linkText="Sign Up" />
              </Typography>
            </div>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    fullWidth
                    required
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
                    {loading ? <CircularProgress size={24} /> : "Login"}
                  </Button>
                </Grid>
              </Grid>
            </form>
            <Toast open={toast.open} message={toast.message} severity={toast.severity} handleClose={handleClose} />
            <Typography mt={2} align="center" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', gap: '10px' }}>
              Forget Your Password? <Links link="/forget-password" linkText="Click Here" />
            </Typography>
          </>
        )}
      </div>
    </Container>
  );
};

export default LoginForm;
