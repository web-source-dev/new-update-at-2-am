import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Grid, MenuItem, Paper, Box, CircularProgress, Skeleton, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import Toast from '../Components/Toast/Toast';
import { Link } from 'react-router-dom';
import Links from '../Components/Buttons/Links';

const SignupFormSkeleton = () => (
  <Container maxWidth="sm">
    <Box sx={{ mt: 4 }}>
      <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 3, textAlign: 'center' }} />
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={index < 2 ? 6 : 12} key={index}>
              <Skeleton variant="text" sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={56} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Box sx={{ mt: 1 }}>
              <Skeleton variant="rectangular" width={24} height={24} sx={{ display: 'inline-block', mr: 1 }} />
              <Skeleton variant="text" width={200} sx={{ display: 'inline-block' }} />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={42} />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Skeleton variant="text" width={200} sx={{ mx: 'auto' }} />
        </Box>
      </Paper>
    </Box>
  </Container>
);

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
    businessName: '',
    contactPerson: '',
    phone: '',
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
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/register`, formData);
      setToast({ open: true, message: response.data.message, severity: 'success' });
      window.location.href = '/login';
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
    <Container maxWidth="sm" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '20px' }}>
      <div style={{ width: '100%' }}>
        {showSkeleton ? (
          <SignupFormSkeleton />
        ) : (
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              Sign Up
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
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
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Business Name"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Contact Person"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    fullWidth
                    required
                  >
                    <MenuItem value="member">Member</MenuItem>
                    <MenuItem value="distributor">Distributor</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ '&:hover': { backgroundColor: '#1976d2' } }}>
                    {loading ? <CircularProgress size={24} /> : "Sign Up"}
                  </Button>
                </Grid>
              </Grid>
            </form>
            <Toast open={toast.open} message={toast.message} severity={toast.severity} handleClose={handleClose} />
            <Typography mt={2} align="center" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', gap: '10px' }}>
              Already have an account? <Links link="/login" linkText="Login Now" />
            </Typography>
          </>
        )}
      </div>
    </Container>
  );
};

export default SignupForm;