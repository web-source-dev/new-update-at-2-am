import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Box, Grid, Button, Card, CardContent, CardMedia, Divider, Chip, Skeleton, CircularProgress } from '@mui/material';
import { ArrowBack, ShoppingCart, FavoriteBorder, Info } from '@mui/icons-material';
import Carousel from 'react-material-ui-carousel';
import Toast from '../../../Components/Toast/Toast';

const ViewDealSkeleton = () => (
  <Container>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
      </Grid>
      <Grid item xs={12} md={6}>
        <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2 }} />
        <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
        <Skeleton variant="text" sx={{ width: '60%', mb: 3 }} />
        <Box sx={{ mb: 3 }}>
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} variant="text" sx={{ mb: 1 }} />
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="rectangular" width={120} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} />
        </Box>
      </Grid>
    </Grid>
  </Container>
);

const ViewDeal = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/deals/fetch-single/deal/${dealId}`);
        setDeal(response.data);
      } catch (error) {
        console.error('Error fetching deal:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [dealId]);

  const toggleDealStatus = async () => {
    if (isStatusUpdating) return;
    try {
      setIsStatusUpdating(true);
      const newStatus = deal.status === 'active' ? 'inactive' : 'active';
      const response = await axios.patch(`${process.env.REACT_APP_BACKEND_URL}/deals/update-status/${dealId}/status`, { status: newStatus });
      setDeal(response.data);
      setToast({ open: true, message: 'Deal status updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error updating deal status:', error);
      setToast({ open: true, message: 'Failed to update deal status', severity: 'error' });
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleViewCommitments = async () => {
    if (isNavigating) return;
    try {
      setIsNavigating(true);
      navigate(`/distributor/view/deals/${dealId}/commitments`);
    } catch (error) {
      console.error('Error navigating to commitments:', error);
      setToast({ open: true, message: 'Failed to navigate to commitments', severity: 'error' });
    } finally {
      setIsNavigating(false);
    }
  };

  if (loading) {
    return <ViewDealSkeleton />;
  }

  if (!deal) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ marginTop: 4, marginBottom: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ marginBottom: 2 }}>Back</Button>
      <Card sx={{ borderRadius: 3, boxShadow: 6, padding: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Carousel animation="slide" navButtonsAlwaysVisible>
              {deal.images.map((image, index) => (
                <CardMedia
                  key={index}
                  component="img"
                  height="450"
                  image={image || "https://via.placeholder.com/450"}
                  alt={deal.name}
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Carousel>
          </Grid>
          <Grid item xs={12} md={6}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {deal.name}
              </Typography>
              <Chip label={deal.category} color="primary" sx={{ marginBottom: 2 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {deal.description}
              </Typography>
              <Divider sx={{ marginY: 2 }} />
              <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
                ${deal.discountPrice} <Typography component="span" variant="body2" color="text.secondary">(Discount Price)</Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Original Price: <strong>${deal.originalCost}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Minimum Quantity for Discount: <strong>{deal.minQtyForDiscount}</strong>
              </Typography>
              <Typography variant="body1">
                Total Sold: <strong>{deal.totalSold}</strong> units
              </Typography>
              <Typography variant="body1">
                Total Revenue: <strong>${deal.totalRevenue}</strong>
              </Typography>
              <Typography variant="body1">
                Views: <strong>{deal.views}</strong>
              </Typography>
              <Typography variant="body1">
                Impressions: <strong>{deal.impressions}</strong>
              </Typography>
              <Typography variant="body2" color="error" fontWeight="bold">
                Deal Ends At: {new Date(deal.dealEndsAt).toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, marginTop: 3 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={isNavigating ? <CircularProgress size={20} color="inherit" /> : <ShoppingCart />}
                  fullWidth
                  onClick={handleViewCommitments}
                  disabled={isNavigating}
                >
                  {isNavigating ? 'Loading...' : 'View Commitments'}
                </Button>
                <Button
                  variant="outlined"
                  color={deal.status === 'active' ? 'secondary' : 'primary'}
                  startIcon={isStatusUpdating ? <CircularProgress size={20} color="inherit" /> : <FavoriteBorder />}
                  fullWidth
                  onClick={toggleDealStatus}
                  disabled={isStatusUpdating}
                >
                  {isStatusUpdating ? 'Updating...' : (deal.status === 'active' ? 'Deactivate' : 'Activate')}
                </Button>
              </Box>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
      <Toast open={toast.open} message={toast.message} severity={toast.severity} handleClose={handleToastClose} />
    </Container>
  );
};

export default ViewDeal;