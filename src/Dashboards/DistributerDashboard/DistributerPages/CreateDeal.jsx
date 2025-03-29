import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Grid, Box, Paper, Skeleton, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CloudinaryUpload from '../../../Components/cloudinary/cloudinary';
import Toast from '../../../Components/Toast/Toast';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CreateDealSkeleton = () => (
  <Container>
    <Box sx={{ mb: 4 }}>
      <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2 }} />
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {[...Array(4)].map((_, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1 }} />
                <Skeleton variant="rectangular" height={56} />
              </Box>
            ))}
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1 }} />
              <Skeleton variant="rectangular" height={200} />
            </Box>
            {[...Array(2)].map((_, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1 }} />
                <Skeleton variant="rectangular" height={56} />
              </Box>
            ))}
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Skeleton variant="rectangular" width={100} height={36} />
              <Skeleton variant="rectangular" width={100} height={36} />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  </Container>
);

const CreateDeal = ({ initialData, onClose, onSubmit }) => {
  const user_id = localStorage.getItem('user_id');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    size: '',
    distributor: user_id,
    category: '',
    dealEndsAt: '',
    originalCost: '',
    discountPrice: '',
    minQtyForDiscount: '',
    dealStartAt: '',
    singleStoreDeals: '',
    images: [],
  });
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        dealEndsAt: initialData.dealEndsAt ? new Date(initialData.dealEndsAt).toISOString().slice(0, 16) : '',
        dealStartAt: initialData.dealStartAt? new Date(initialData.dealStartAt).toISOString().slice(0, 16) : '',
      });

    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const handleImageUpload = (url) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      images: [...prevFormData.images, url]
    }));
  };

  const handleImageRemove = (indexToRemove) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      images: prevFormData.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setLoading(true);
      if (initialData) {
        const updateData = {
          ...formData,
          images: formData.images || [],
        };

        const response = await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/deals/update/${initialData._id}`,
          updateData
        );

        setToast({
          open: true,
          message: 'Deal updated successfully!',
          severity: 'success'
        });
        
        if (onSubmit) {
          onSubmit(response.data);
        }

        navigate(-1);
      } else {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/deals/create`, formData);
        setToast({
          open: true,
          message: 'Deal created successfully!',
          severity: 'success'
        });
        if(response.data) {
          navigate(-1);
        }
      }
    } catch (error) {
      setToast({
        open: true,
        message: error.response?.data?.message || 'Failed to save deal.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <CreateDealSkeleton />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Button 
        variant="outlined" 
        color="primary" 
        onClick={() => navigate(-1)}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back
      </Button>
      
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
          {initialData ? 'Edit Deal' : 'Create New Deal'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                fullWidth
                required
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                fullWidth
                required
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Special Comment"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Original Cost"
                name="originalCost"
                type="number"
                value={formData.originalCost}
                onChange={handleChange}
                fullWidth
                required
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Discount Price"
                name="discountPrice"
                type="number"
                value={formData.discountPrice}
                onChange={handleChange}
                fullWidth
                required
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Minimum Quantity for Deal"
                name="minQtyForDiscount"
                type="number"
                value={formData.minQtyForDiscount}
                onChange={handleChange}
                fullWidth
                required
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Deal Starts At"
                name="dealStartAt"
                type="datetime-local"
                value={formData.dealStartAt}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Deal Ends At"
                name="dealEndsAt"
                type="datetime-local"
                value={formData.dealEndsAt}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Single Store Deals"
                name="singleStoreDeals"
                value={formData.singleStoreDeals}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Upload Images</Typography>
              <CloudinaryUpload 
                onUpload={handleImageUpload} 
                onRemove={handleImageRemove}
                initialImages={formData.images}
              />
            </Grid>

            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={isSubmitting}
                sx={{ 
                  mt: 2,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  initialData ? 'Update Deal' : 'Create Deal'
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        handleClose={handleCloseToast}
      />
    </Container>
  );
};

export default CreateDeal;
