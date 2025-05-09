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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
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
  TrendingUp,
  AddShoppingCart,
  CheckCircle,
  PlayArrow,
} from '@mui/icons-material';
import axios from 'axios';
import Toast from '../Components/Toast/Toast';
import { io } from 'socket.io-client';

// Helper function to determine if the media is a video
const isVideoUrl = (url) => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

const ViewSingleDeal = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
  const [selectedSizes, setSelectedSizes] = useState({});
  const [activeTier, setActiveTier] = useState(null);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  
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

  // State to track if user has already committed to this deal
  const [userCommitment, setUserCommitment] = useState(null);

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
        console.log(response.data);
        
        // Initialize selected sizes with 0 quantity for each available size
        if (response.data && response.data.sizes) {
          const initialSizes = {};
          response.data.sizes.forEach(size => {
            initialSizes[size.size] = 0;
          });
          setSelectedSizes(initialSizes);
        }
        
        // Check if deal is in favorites and get user commitments only if user is logged in
        if (user_id) {
          try {
            const favResponse = await axios.get(
              `${process.env.REACT_APP_BACKEND_URL}/deals/favorite`,
              { params: { user_id } }
            );
            // Compare either string to string or object id to string
            setIsFavorite(favResponse.data.some(fav => 
              fav.dealId === dealId || 
              fav.dealId?._id === dealId || 
              String(fav.dealId) === String(dealId)
            ));
          } catch (favError) {
            console.error('Error fetching favorites:', favError);
            // Continue with the app even if favorites check fails
          }
          
          try {
            // Check if user has already committed to this deal
            const commitmentsResponse = await axios.get(
              `${process.env.REACT_APP_BACKEND_URL}/deals/commit/fetch/${user_id}`
            );
            // Add defensive coding to handle possible missing data
            if (commitmentsResponse.data && Array.isArray(commitmentsResponse.data)) {
              const existingCommitment = commitmentsResponse.data.find(
                commitment => 
                  commitment.dealId?._id === dealId || 
                  String(commitment.dealId) === String(dealId)
              );
              setUserCommitment(existingCommitment || null);
              
              // If user has existing commitment, set the selected sizes
              if (existingCommitment && existingCommitment.sizeCommitments) {
                const userSizes = {};
                existingCommitment.sizeCommitments.forEach(sc => {
                  if (sc && sc.size) {
                    userSizes[sc.size] = sc.quantity || 0;
                  }
                });
                setSelectedSizes(userSizes);
              }
            }
          } catch (commitError) {
            console.error('Error fetching user commitments:', commitError);
            // Continue with the app even if commitments check fails
          }
        }
      } catch (err) {
        console.error('Error in fetchDeal:', err);
        setError(err.response?.data?.message || 'Error fetching deal details');
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
    // No need for interval-based polling anymore
  }, [dealId, navigate, user_id]);

  // Calculate total quantity, price, and determine active discount tier
  useEffect(() => {
    if (!deal) return;
    
    // Calculate total quantity across all sizes
    let newTotalQuantity = 0;
    let newTotalPrice = 0;
    let newTotalSavings = 0;
    
    // Calculate totals based on selected sizes
    Object.entries(selectedSizes).forEach(([sizeName, quantity]) => {
      if (quantity > 0) {
        const sizeData = deal.sizes.find(s => s.size === sizeName);
        if (sizeData) {
          newTotalQuantity += quantity;
          newTotalPrice += quantity * sizeData.discountPrice;
          newTotalSavings += quantity * (sizeData.originalCost - sizeData.discountPrice);
        }
      }
    });
    
    setTotalQuantity(newTotalQuantity);
    setTotalPrice(newTotalPrice);
    setTotalSavings(newTotalSavings);
    
    // Determine if any discount tier applies
    if (deal.discountTiers && deal.discountTiers.length > 0) {
      // Sort tiers by quantity (highest first) to find the highest applicable tier
      const sortedTiers = [...deal.discountTiers].sort((a, b) => b.tierQuantity - a.tierQuantity);
      const applicableTier = sortedTiers.find(tier => newTotalQuantity >= tier.tierQuantity);
      
      // If a tier applies, adjust the price with the tier discount
      if (applicableTier) {
        setActiveTier(applicableTier);
        // Use the fixed price directly from the tier
        const newTierPrice = newTotalQuantity * applicableTier.tierDiscount;
        // Calculate additional savings from the tier price
        const additionalSavings = newTotalPrice - newTierPrice;
        setTotalPrice(newTierPrice);
        setTotalSavings(newTotalSavings + additionalSavings);
      } else {
        setActiveTier(null);
      }
    }
  }, [deal, selectedSizes]);

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
    
    // If user has already committed to this deal, pre-populate with existing quantities
    if (userCommitment && userCommitment.sizeCommitments) {
      const existingSizes = {};
      userCommitment.sizeCommitments.forEach(sc => {
        existingSizes[sc.size] = sc.quantity;
      });
      setSelectedSizes(existingSizes);
    } else {
      // Reset all sizes to 0
      const resetSizes = {};
      deal?.sizes.forEach(size => {
        resetSizes[size.size] = 0;
      });
      setSelectedSizes(resetSizes);
    }
    
    setGetDealOpen(true);
  };
  
  const handleCloseGetDeal = () => {
    setGetDealOpen(false);
  };

  const handleSizeQuantityChange = (size, quantity) => {
    setSelectedSizes(prev => ({
      ...prev,
      [size]: Math.max(0, parseInt(quantity) || 0)
    }));
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
      console.error('Error toggling favorite:', error);
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
    
    // Validate that at least one size has a quantity greater than 0
    const hasQuantity = Object.values(selectedSizes).some(qty => qty > 0);
    if (!hasQuantity) {
      setToast({
        open: true,
        message: 'Please select a quantity for at least one size',
        severity: 'error'
      });
      return;
    }
    
    // Prepare size commitments data
    const sizeCommitments = [];
    let totalCommitPrice = 0;
    
    Object.entries(selectedSizes).forEach(([sizeName, quantity]) => {
      if (quantity > 0) {
        const sizeData = deal.sizes.find(s => s.size === sizeName);
        if (sizeData) {
          const pricePerUnit = sizeData.discountPrice;
          const sizeTotal = pricePerUnit * quantity;
          totalCommitPrice += sizeTotal;
          
          sizeCommitments.push({
            size: sizeName,
            quantity,
            pricePerUnit,
            totalPrice: sizeTotal
          });
        }
      }
    });
    
    // Apply any applicable discount tier
    let finalTotalPrice = totalCommitPrice;
    let appliedDiscountTier = null;
    
    if (activeTier) {
      // Use the fixed price from the tier instead of calculating a percentage
      finalTotalPrice = totalQuantity * activeTier.tierDiscount;
      appliedDiscountTier = {
        tierQuantity: activeTier.tierQuantity,
        tierDiscount: activeTier.tierDiscount
      };
    }

    try {
      setIsCommitting(true);
      const commitmentData = {
        dealId,
        userId: user_id,
        sizeCommitments,
        totalPrice: finalTotalPrice,
      };
      
      if (appliedDiscountTier) {
        commitmentData.appliedDiscountTier = appliedDiscountTier;
      }
      
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/deals/commit/buy/${dealId}`,
        commitmentData
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
      window.location.reload()
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
                  {isVideoUrl(deal.images[currentImageIndex]) ? (
                    <Box
                      component="video"
                      src={deal.images[currentImageIndex]}
                      controls
                      autoPlay
                      muted
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        p: 2,
                        bgcolor: 'black'
                      }}
                    />
                  ) : (
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
                  )}
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
                  {deal.images.map((mediaUrl, index) => (
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
                        position: 'relative'
                      }}
                    >
                      {isVideoUrl(mediaUrl) ? (
                        <>
                          <Box
                            component="video"
                            src={mediaUrl}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            }}
                          >
                            <PlayArrow sx={{ color: 'white', fontSize: 24 }} />
                          </Box>
                        </>
                      ) : (
                        <Box
                          component="img"
                          src={mediaUrl}
                          alt={`${deal.name} - ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
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
                {deal?.sizes && deal.sizes.length > 0 && (
                  <Chip 
                    label={
                      deal.sizes.length === 1 
                        ? `Save ${Math.round(((deal.sizes[0].originalCost - deal.sizes[0].discountPrice) / deal.sizes[0].originalCost) * 100)}%`
                        : `Save up to ${Math.max(...deal.sizes.map(size => 
                            Math.round(((size.originalCost - size.discountPrice) / size.originalCost) * 100)
                          ))}%`
                    }
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
                )}
              </Box>
              
              {/* Size options and prices */}
              {deal?.sizes && deal.sizes.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Available Sizes
                  </Typography>
                  <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ mb: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell>Size</TableCell>
                          <TableCell align="right">Original Price</TableCell>
                          <TableCell align="right">Discount Price</TableCell>
                          <TableCell align="right">Savings</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {deal.sizes.map((size, index) => {
                          const savingsAmount = size.originalCost - size.discountPrice;
                          const savingsPercent = ((savingsAmount / size.originalCost) * 100).toFixed(1);
                          
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography variant="body1" fontWeight="medium">
                                  {size.size}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                  ${size.originalCost.toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body1" color="primary" fontWeight="medium">
                                  ${size.discountPrice.toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={`${savingsPercent}%`} 
                                  size="small"
                                  color="success"
                                  sx={{ fontWeight: 'medium' }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

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
                {deal?.sizes && deal.sizes.length > 1 && (
                  <Chip 
                    label="Mix & Match" 
                    size="medium"
                    sx={{ 
                      fontWeight: 'bold',
                      background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
                      color: 'white',
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
                  label={`Remaining Quantity: ${deal?.minQtyForDiscount - (deal?.totalCommittedQuantity || 0)}`}
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
              
              {/* Discount Tiers */}
              {deal?.discountTiers && deal.discountTiers.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Volume Discount Tiers
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: 1,
                      mt: 1
                    }}
                  >
                    {deal.discountTiers.map((tier, index) => (
                      <Paper
                        key={index}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: activeTier === tier ? 'success.light' : 'background.paper',
                          color: activeTier === tier ? 'white' : 'inherit',
                          borderColor: activeTier === tier ? 'success.main' : 'divider'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {activeTier === tier ? (
                            <CheckCircle color="inherit" fontSize="small" />
                          ) : (
                            <TrendingUp color="primary" fontSize="small" />
                          )}
                          <Typography variant="body1">
                            ${tier.tierDiscount.toFixed(2)} fixed price at {tier.tierQuantity}+ units
                          </Typography>
                        </Box>
                        {activeTier === tier && (
                          <Chip 
                            label="Active" 
                            color="success" 
                            size="small"
                            sx={{ bgcolor: 'white', color: 'success.dark', fontWeight: 'bold' }}
                          />
                        )}
                      </Paper>
                    ))}
                  </Box>
                </Box>
              )}
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
                Special Content
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
            {deal?.singleStoreDeals && (
  <Paper
    sx={{
      p: { xs: 2, sm: 3 },
      borderRadius: 3,
      bgcolor: 'background.paper',
      boxShadow: 1
    }}
  >
    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      Single Store Deals
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
      {deal.singleStoreDeals}
    </Typography>
  </Paper>
)}

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
                  background: userCommitment ? 'linear-gradient(45deg,rgb(17, 128, 26) 30%,rgba(6, 78, 18, 0.68) 90%)' : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    boxShadow: 4,
                  background: userCommitment ? 'linear-gradient(45deg,rgb(17, 128, 26) 30%,rgba(6, 78, 18, 0.68) 90%)' : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  }
                }}
              >
                {userCommitment ? 'Edit Commitment' : 'Make Commitment'}
              </Button>
              {/* <IconButton
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
              </IconButton> */}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Get Deal Dialog */}
      <Dialog 
        open={getDealOpen} 
        onClose={handleCloseGetDeal} 
        fullWidth 
        maxWidth="md"
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            {userCommitment ? 'Edit Commitment' : 'Make Commitment'}: {deal?.name}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Size & Quantity Selection
              </Typography>
              
              {/* Size selection with quantity inputs */}
              {deal?.sizes && (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell>Size</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deal.sizes.map((size, index) => {
                        const quantity = selectedSizes[size.size] || 0;
                        const subtotal = quantity * size.discountPrice;
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body1" fontWeight="medium">
                                {size.size}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" color="primary">
                                ${size.discountPrice.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                variant="outlined"
                                size="small"
                                value={quantity}
                                onChange={(e) => handleSizeQuantityChange(size.size, e.target.value)}
                                inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" fontWeight="medium">
                                ${subtotal.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell colSpan={2}>
                          <Typography variant="body1" fontWeight="bold">
                            Total
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold">
                            {totalQuantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold">
                            ${totalPrice.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              {/* Discount tiers */}
              {deal?.discountTiers && deal.discountTiers.length > 0 && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
                    Volume Discount Tiers
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {deal.discountTiers.map((tier, index) => (
                      <Paper
                        key={index}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: activeTier === tier ? 'success.light' : 'background.paper',
                          color: activeTier === tier ? 'white' : 'inherit',
                          borderColor: activeTier === tier ? 'success.main' : 'divider'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {activeTier === tier ? (
                            <CheckCircle color="inherit" fontSize="small" />
                          ) : (
                            <TrendingUp color="primary" fontSize="small" />
                          )}
                          <Typography variant="body1">
                            ${tier.tierDiscount.toFixed(2)} fixed price at {tier.tierQuantity}+ units
                          </Typography>
                        </Box>
                        {activeTier === tier && (
                          <Chip 
                            label="Applied" 
                            color="success" 
                            size="small"
                            sx={{ 
                              bgcolor: 'white', 
                              color: 'success.dark', 
                              fontWeight: 'bold' 
                            }}
                          />
                        )}
                      </Paper>
                    ))}
                  </Box>
                </>
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'white', color: 'black', borderRadius: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                
                <Divider sx={{ borderColor: 'rgba(0,0,0,0.2)', my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Items Subtotal:</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    ${(totalPrice + totalSavings).toFixed(2)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Total Savings:</Typography>
                  <Typography variant="body1" fontWeight="medium" color="success.light">
                    -${totalSavings.toFixed(2)}
                  </Typography>
                </Box>
                
                {activeTier && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Volume Discount:</Typography>
                    <Typography variant="body1" fontWeight="medium" color="success.light">
                      Fixed price: ${activeTier.tierDiscount.toFixed(2)}/unit
                    </Typography>
                  </Box>
                )}
                
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">Total Price:</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ${totalPrice.toFixed(2)}
                  </Typography>
                </Box>
              </Paper>
              
              <Alert 
                severity="info" 
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">
                  Your commitment will be sent to the distributor. If approved, you'll be notified to complete the purchase.
                </Typography>
              </Alert>
              
              {totalQuantity > 0 && (
                <Alert 
                  severity="success" 
                  icon={<AddShoppingCart />}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="body2" fontWeight="medium">
                    You're ordering {totalQuantity} units across {Object.values(selectedSizes).filter(qty => qty > 0).length} size options.
                  </Typography>
                </Alert>
              )}
              
              {deal?.minQtyForDiscount && (
                <Alert 
                  severity={totalQuantity >= deal.minQtyForDiscount ? "success" : "warning"}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="body2">
                    {totalQuantity >= deal.minQtyForDiscount
                      ? `You've met the minimum quantity of ${deal.minQtyForDiscount} units required for this deal!`
                      : `This deal requires a minimum of ${deal.minQtyForDiscount} units from all members combined. Current total: ${deal?.totalCommittedQuantity || 0} units.`}
                  </Typography>
                </Alert>
              )}
            </Grid>
          </Grid>
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
            color={userCommitment ? "warning" : "primary"}
            onClick={handleCommitDeal}
            disabled={isCommitting || totalQuantity === 0}
            sx={{ 
              borderRadius: 2,
              background: userCommitment ? 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)' : undefined,
              '&:hover': {
                background: userCommitment ? 'linear-gradient(45deg, #F57C00 30%, #FF9800 90%)' : undefined
              }
            }}
          >
            {isCommitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              userCommitment ? 'Update Commitment' : 'Confirm Commitment'
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
