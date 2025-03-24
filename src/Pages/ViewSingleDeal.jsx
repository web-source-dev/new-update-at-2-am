import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Stack,
  Card,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  NavigateBefore,
  NavigateNext,
  Email,
  Phone,
  Store,
  Person,
  Schedule,
  LocalOffer,
  Groups,
  Visibility,
  QueryStats,
} from '@mui/icons-material';
import axios from 'axios';
import Toast from '../Components/Toast/Toast';
import { io } from 'socket.io-client';


const ViewSingleDeal = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [getDealOpen, setGetDealOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [isCommitting, setIsCommitting] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  const user_id = localStorage.getItem("user_id");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Create socket connection
    const newSocket = io(process.env.REACT_APP_BACKEND_URL);
    setSocket(newSocket);

    // Handle connection events
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    // Clean up socket connection on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Listen for real-time deal updates
  useEffect(() => {
    if (!socket) return;

    // Listen for general deal updates
    socket.on('deal-update', (data) => {
      if (data.deal._id === dealId) {
        // Update the deal if it's the one we're viewing and not deleted
        if (data.type === 'updated') {
          setDeal(data.deal);
        } else if (data.type === 'deleted') {
          // Handle deleted deal - maybe show a message and redirect
          setToast({
            open: true,
            message: "This deal has been deleted by the distributor",
            severity: "warning"
          });
          // You could redirect after a timeout:
          setTimeout(() => window.location.href = '/buy', 3000);
        }
      }
    });

    // Listen for specific updates to this deal
    socket.on('single-deal-update', (data) => {
      if (data.dealId === dealId) {
        console.log('Received specific deal update:', data);
        setDeal(data.dealData);
      }
    });

    return () => {
      socket.off('deal-update');
      socket.off('single-deal-update');
    };
  }, [socket, dealId]);

  useEffect(() => {
  
    const fetchDeal = async () => {
      try {
        if(localStorage.getItem("user_role") !== "member") {
          setToast({
            open: true,
            message: 'Only Co-op members can view deals',
            severity: 'warning'
          });
          setTimeout(() =>
            setRedirectLoading(true), 2000);
        
          setTimeout(() => navigate(-1), 3000);
          return;
        }
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/deals/fetch-single/deal/${dealId}`);
        setDeal(response.data);
        
        // Check if deal is in favorites
        if (user_id) {
        const favResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/deals/favorite`,
          { params: { user_id } }
        );
        setIsFavorite(favResponse.data.some(fav => fav.dealId === dealId));
      }
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching deal details');
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
    // No need for interval-based polling anymore
  }, [dealId]);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === deal.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? deal.images.length - 1 : prev - 1
    );
  };

  const handleGetDeal = () => {
    if (!user_id) {
      setToast({
        open: true,
        message: 'Please login to get deal',
        severity: 'error'
      });
      setTimeout(() => 
        setRedirectLoading(true), 2000);
      const currentPath = window.location.pathname;
      localStorage.setItem('redirectPath', currentPath);
      setTimeout(() => window.location.href = '/login', 3000);
      return;
    }
    const user_role = localStorage.getItem('user_role');
    if (user_role !== 'member') {
      setToast({
        open: true,
        message: 'Only Co-op members can commit to deals',
        severity: 'warning'
      });
      return;
    }
    setGetDealOpen(true);
    setQuantity(1);
  };
  
  const handleCloseGetDeal = () => {
    setGetDealOpen(false);
    setQuantity(1);
  };

  const [redirectLoading, setRedirectLoading] = useState(false);

  const toggleFavorite = async () => {
    if (isFavoriteLoading) return;
    if (!user_id) {
      setToast({
        open: true,
        message: 'Please login to add to favorites',
        severity: 'error'
      });
      setTimeout(() => 
        setRedirectLoading(true), 2000);
      const currentPath = window.location.pathname;
      localStorage.setItem('redirectPath', currentPath);
      setTimeout(() => window.location.href = '/login', 3000);
      return;
    }
    
    const user_role = localStorage.getItem('user_role');
    if (user_role !== 'member') {
      setToast({
        open: true,
        message: 'Only  Co-op members can add deals to favorites',
        severity: 'warning'
      });
      return;
    }
    try {
      setIsFavoriteLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/deals/favorite/toggle`,
        { dealId, user_id }
      );
      setIsFavorite(!isFavorite);
      setToast({
        open: true,
        message: response.data.message,
        severity: 'success'
      });
    } catch (error) {
      setToast({
        open: true,
        message: error.response?.data?.message || 'Error updating favorites',
        severity: 'error'
      });
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleCommitDeal = async () => {
    if (!deal || isCommitting) return;
    if (!user_id) {
      setToast({
        open: true,
        message: 'Please login to commit a deal',
        severity: 'error'
      });
      setTimeout(() => 
        setRedirectLoading(true), 2000);
      const currentPath = window.location.pathname;
      localStorage.setItem('redirectPath', currentPath);
      setTimeout(() => window.location.href = '/login', 3000);
      return;
    }
    
    const user_role = localStorage.getItem('user_role');
    if (user_role !== 'member') {
      setToast({
        open: true,
        message: 'Only Co-op members can commit to deals',
        severity: 'warning'
      });
      return;
    }
    
    const totalPrice = quantity * deal.discountPrice;

    try {
      setIsCommitting(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/deals/commit/buy/${dealId}`,
        {
          dealId,
          userId: user_id,
          quantity,
          totalPrice,
        }
      );

      setToast({
        open: true,
        message: "Deal commitment submitted successfully!",
        severity: 'success'
      });
      handleCloseGetDeal();
      
      // Refresh deal data after commitment
      const updatedDealResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/deals/fetch-single/deal/${dealId}`);
      setDeal(updatedDealResponse.data);
    } catch (error) {
      setToast({
        open: true,
        message: error.response?.data?.message || "Error submitting deal commitment",
        severity: 'error'
      });
    } finally {
      setIsCommitting(false);
    }
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (redirectLoading) {
    return <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <CircularProgress size={40} />
    </Box>
  }
  
  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        mt: { xs: 2, md: 4 }, 
        mb: { xs: 4, md: 8 },
        px: { xs: 2, sm: 3, md: 4 },
        bgcolor: 'grey.50',
        minHeight: '100vh'
      }}
    >
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'grey.50',
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          mb: { xs: 2, md: 4 }
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/deals-catlog')}
          sx={{ 
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          Back to Deals
        </Button>
      </Box>

      <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mb: 4 }}>
        {/* Image Gallery Section */}
        <Grid item xs={12} md={6} lg={7}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: { xs: 1, md: 2 },
            height: '100%',
            position: 'sticky',
            top: 80
          }}>
            {/* Main Image */}
            <Paper
              sx={{
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                height: { xs: 300, sm: 400, md: 500, lg: 600 },
                bgcolor: 'grey.50',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 6
                }
              }}
            >
              {deal?.images?.length > 0 ? (
                <>
                  <Box
                    component="img"
                    src={deal.images[currentImageIndex]}
                    alt={deal.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      p: 2,
                    }}
                  />
                  {deal.images.length > 1 && (
                    <>
                      <IconButton
                        onClick={handlePrevImage}
                        sx={{
                          position: 'absolute',
                          left: { xs: 4, md: 8 },
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.9)',
                          '&:hover': { 
                            bgcolor: 'rgba(255,255,255,1)',
                            transform: 'translateY(-50%) scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                          boxShadow: 2,
                        }}
                      >
                        <NavigateBefore />
                      </IconButton>
                      <IconButton
                        onClick={handleNextImage}
                        sx={{
                          position: 'absolute',
                          right: { xs: 4, md: 8 },
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.9)',
                          '&:hover': { 
                            bgcolor: 'rgba(255,255,255,1)',
                            transform: 'translateY(-50%) scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                          boxShadow: 2,
                        }}
                      >
                        <NavigateNext />
                      </IconButton>
                    </>
                  )}
                </>
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography color="text.secondary">
                    No images available
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Thumbnails */}
            {deal?.images?.length > 1 && (
              <Paper
                sx={{
                  p: 1,
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  boxShadow: 1
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    overflowX: 'auto',
                    px: 0.5,
                    py: 1,
                    '&::-webkit-scrollbar': {
                      height: 6,
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'grey.100',
                      borderRadius: 3,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'grey.400',
                      borderRadius: 3,
                      '&:hover': {
                        backgroundColor: 'grey.500',
                      },
                    },
                  }}
                >
                  {deal.images.map((image, index) => (
                    <Box
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      sx={{
                        width: { xs: 60, sm: 80 },
                        height: { xs: 60, sm: 80 },
                        flexShrink: 0,
                        borderRadius: 2,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: currentImageIndex === index ? 'primary.main' : 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: 3
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={image}
                        alt={`${deal.name} - ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}
          </Box>
        </Grid>

        {/* Deal Details */}
        <Grid item xs={12} md={6} lg={5}>
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: { xs: 2, md: 3 },
            position: 'sticky',
            top: 80
          }}>
            {/* Deal Title and Price */}
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                bgcolor: 'background.paper',
                boxShadow: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                <Typography 
                  variant="h4" 
                  fontWeight="bold" 
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
                    lineHeight: 1.2,
                    flex: 1
                  }}
                >
                  {deal?.name}
                </Typography>
                <Chip 
                  label={`Save ${Math.round(((deal?.originalCost - deal?.discountPrice) / deal?.originalCost) * 100)}%`}
                  color="error"
                  size="large"
                  sx={{ 
                    borderRadius: 1,
                    '& .MuiChip-label': {
                      px: 2,
                      py: 0.5,
                      fontSize: '1rem',
                      fontWeight: 600
                    }
                  }}
                />
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'baseline', 
                gap: 2,
                flexWrap: 'wrap',
                mb: 2
              }}>
                <Typography 
                  variant="h5" 
                  color="primary" 
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                  }}
                >
                  ${deal?.discountPrice}
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  sx={{ 
                    textDecoration: 'line-through', 
                    opacity: 0.7,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  ${deal?.originalCost}
                </Typography>
                <Typography
                  variant="body1"
                  color="success.main"
                  sx={{ 
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Save ${(deal?.originalCost - deal?.discountPrice).toFixed(2)} per unit
                </Typography>
              </Box>

              {/* Category and Status Chips */}
              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ 
                  flexWrap: 'wrap', 
                  gap: 1,
                  '& > *': {
                    marginTop: '4px !important',
                    marginLeft: '0px !important',
                    marginRight: '8px !important',
                  }
                }}
              >
                <Chip 
                  icon={<LocalOffer />} 
                  label={deal?.category} 
                  color="primary" 
                  variant="outlined"
                  sx={{
                    borderRadius: 1,
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
                {deal?.size && (
                  <Chip 
                    label={`Size: ${deal.size}`}
                    color="default"
                    variant="outlined"
                    sx={{
                      borderRadius: 1,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                )}
                <Chip 
                  icon={<Schedule />}
                  label={`Ends ${new Date(deal?.dealEndsAt).toLocaleDateString()}`} 
                  color="warning" 
                  variant="outlined"
                  sx={{
                    borderRadius: 1,
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
                <Chip
                  label={`Min Qty: ${deal?.minQtyForDiscount}`}
                  color="info" 
                  variant="outlined"
                  sx={{
                    borderRadius: 1,
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
                
                <Chip 
                  label={`Remeaning Quantity: ${deal?.minQtyForDiscount - deal?.totalCommittedQuantity}`}
                  color="success" 
                  variant="outlined"
                  sx={{
                    borderRadius: 1,
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
                {deal?.totalSold > 0 && (
                  <Chip 
                    icon={<ShoppingCart />}
                    label={`${deal.totalSold} units sold`}
                    color="success" 
                    variant="outlined"
                    sx={{
                      borderRadius: 1,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                )}
              </Stack>
            </Paper>

            {/* Description */}
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                bgcolor: 'background.paper',
                boxShadow: 1
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Description
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{
                  lineHeight: 1.6,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  whiteSpace: 'pre-line' // Preserve line breaks in description
                }}
              >
                {deal?.description}
              </Typography>
            </Paper>

            {/* Deal Info Card */}
            <Paper 
              sx={{ 
                p: { xs: 2, sm: 3 }, 
                borderRadius: 3,
                bgcolor: 'background.paper',
                boxShadow: 1
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Deal Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalOffer color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Original Price
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        ${deal?.originalCost} per unit
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCart color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Discount Price
                      </Typography>
                      <Typography variant="body1" fontWeight="500" color="primary">
                        ${deal?.discountPrice} per unit
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Groups color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Minimum Quantity
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {deal?.minQtyForDiscount} units
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Deal Ends
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {new Date(deal?.dealEndsAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCart color="success" fontSize="small" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Commitments
                      </Typography>
                      <Typography variant="body1" fontWeight="500" color="success.main">
                        {deal?.totalCommittedQuantity || 0} commitments
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Visibility color="info" fontSize="small" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Engagement
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {deal?.views || 0} views • {deal?.impressions || 0} impressions
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Distributor Info Card */}
            <Paper 
              sx={{ 
                p: { xs: 2, sm: 3 }, 
                borderRadius: 3,
                bgcolor: 'background.paper',
                boxShadow: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                {deal?.distributor?.logo ? (
                  <Avatar 
                    src={deal.distributor.logo} 
                    alt={deal.distributor.businessName}
                    sx={{ width: 64, height: 64 }}
                  />
                ) : (
                  <Avatar 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      bgcolor: 'primary.main',
                      fontSize: '1.5rem'
                    }}
                  >
                    {deal?.distributor?.businessName?.charAt(0) || 'D'}
                  </Avatar>
                )}
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {deal?.distributor?.businessName || 'Unknown Business'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verified Distributor
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={2}>
                {deal?.distributor?.contactPerson && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person color="primary" fontSize="small" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Contact Person
                        </Typography>
                        <Typography variant="body1">
                          {deal.distributor.contactPerson}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {deal?.distributor?.email && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email color="primary" fontSize="small" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {deal.distributor.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {deal?.distributor?.phone && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone color="primary" fontSize="small" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">
                          {deal.distributor.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Action Buttons */}
            <Box sx={{ 
              mt: 'auto', 
              display: 'flex', 
              gap: 2,
              position: 'sticky',
              bottom: 0,
              bgcolor: 'background.paper',
              py: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              zIndex: 1
            }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleGetDeal}
                disabled={isCommitting}
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 2,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    boxShadow: 4,
                    background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)'
                  }
                }}
              >
                Make Commitment
              </Button>
              <IconButton
                color="error"
                onClick={toggleFavorite}
                disabled={isFavoriteLoading}
                sx={{
                  border: '1px solid',
                  borderRadius: 2,
                  width: 56,
                  height: 56,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 2
                  }
                }}
              >
                {isFavoriteLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  isFavorite ? <Favorite /> : <FavoriteBorder />
                )}
              </IconButton>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Get Deal Dialog */}
      <Dialog 
        open={getDealOpen} 
        onClose={handleCloseGetDeal} 
        fullWidth 
        maxWidth="sm"
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Get Deal: {deal?.name}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom>
              Price Information
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>

            <Typography variant="body2" color="text.secondary">
              Original Price: ${deal?.originalCost}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Discount Price: ${deal?.discountPrice}
            </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Total Commitments: {deal?.totalCommitments || 0}
            </Typography>

<Typography variant="body2" color="text.secondary">
              Min Quantity For Deal: {deal?.minQtyForDiscount || 0}
            </Typography>
            </Box>

            <TextField
              label="Quantity"
              type="number"
              fullWidth
              variant="outlined"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3
                }
              }}
            />
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                bgcolor: 'primary.main',
                color: 'white',
                p: 2,
                borderRadius: 2,
                mt: 2
              }}
            >
              <Typography variant="h6">Total Price:</Typography>
              <Typography variant="h6">
                ${(quantity * (deal?.discountPrice || 0)).toFixed(2)}
              </Typography>
            </Box>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                bgcolor: 'success.light',
                color: 'white',
                p: 2,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6">You Save:</Typography>
              <Typography variant="h6">
                ${(quantity * ((deal?.originalCost || 0) - (deal?.discountPrice || 0))).toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={handleCloseGetDeal} 
            color="secondary"
            disabled={isCommitting}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCommitDeal}
            disabled={isCommitting}
            sx={{ borderRadius: 2 }}
          >
            {isCommitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Confirm Commitment'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Toast 
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        handleClose={handleToastClose}
      />
    </Container>
  );
};

export default ViewSingleDeal;
