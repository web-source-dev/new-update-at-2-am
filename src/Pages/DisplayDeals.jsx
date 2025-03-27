import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Slider,
  useTheme,
  useMediaQuery,
  Avatar,
  TablePagination,
  Pagination,
  Paper,
  Chip,
  InputAdornment,
  Stack,
  ButtonGroup,
  FormControlLabel,
  Switch,
  Tooltip,
} from "@mui/material";
import { Favorite, ShoppingCart, FavoriteBorder, Visibility, FilterList, ExpandLess, ExpandMore, Clear, Search, ProductionQuantityLimits, PowerOffOutlined, Person } from "@mui/icons-material";
import axios from "axios";
import { styled } from '@mui/material/styles';
import Toast from '../Components/Toast/Toast';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import InfoIcon from '@mui/icons-material/Info';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DisplaySplashContent from "../Components/SplashPage/DisplaySplashContent";


const StyledSlider = styled(Slider)(({ theme }) => ({
  height: 8,
  '& .MuiSlider-track': {
    border: 'none',
    borderRadius: 4,
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
    '&:before': {
      display: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: theme.palette.primary.main,
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&:before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },
}));

const DisplayDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [getDealOpen, setGetDealOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [userFavorites, setUserFavorites] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [userCommitments, setUserCommitments] = useState([]);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [splashContent, setSplashContent] = useState([]);

  useEffect(() => {
    const fetchSplashContent = async () => {
      const userRole = localStorage.getItem('user_role');
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/splash`, {
        headers: { 'user-role': userRole }
      });
      console.log('Splash content response:', response.data);
      console.log('Splash content length:', response.data.length);
      setSplashContent(response.data);
    };

    fetchSplashContent();
  }, []);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(24);

  const fetchDeals = async () => {
    try {
      if (localStorage.getItem("user_role") !== "member") {
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
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/deals/fetchAll/buy`);
      console.log('deals received', response.data);
      setDeals(response.data);
      setFilteredDeals(response.data);

      const uniqueCategories = [...new Set(response.data.map(deal => deal.category))];
      const uniqueDistributors = [...new Set(response.data
        .map(deal => deal.distributor?.businessName)
        .filter(name => name))];
      setCategories(uniqueCategories);
      setDistributors(uniqueDistributors);
    } catch (error) {
      setError("Error fetching deals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [filter, setFilter] = useState({
    searchQuery: '',
    category: '',
    distributor: '',
    priceRange: [0, 1000],
    minQuantity: [0, 500],
    favoritesOnly: false,
    committedOnly: false
  });

  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const filterDebounceTimeout = useRef(null);

  const [isCommitting, setIsCommitting] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const [socket, setSocket] = useState(null);

  const user_id = localStorage.getItem("user_id");

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

    // Handle updates for all deals
    socket.on('deal-update', (data) => {
      console.log('Received deal update:', data);

      if (data.type === 'created') {
        fetchDeals();
      }
      else if (data.type === 'updated') {
        fetchDeals();
      }
      else if (data.type === 'deleted') {
        fetchDeals();
      }

    });

    return () => {
      socket.off('deal-update');
    };
  }, [socket, categories]);

  useEffect(() => {

    fetchDeals();

    // Also refresh user data when component mounts
    refreshUserData();
  }, []);

  useEffect(() => {
    setIsFilterLoading(true);
    if (filterDebounceTimeout.current) {
      clearTimeout(filterDebounceTimeout.current);
    }

    filterDebounceTimeout.current = setTimeout(() => {
      let filtered = [...deals];

      // Apply search query filter
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        filtered = filtered.filter(deal =>
          deal.name.toLowerCase().includes(query) ||
          deal.description.toLowerCase().includes(query)
        );
      }

      // Apply category filter
      if (filter.category) {
        filtered = filtered.filter(deal => deal.category === filter.category);
      }

      // Apply distributor filter
      if (filter.distributor) {
        filtered = filtered.filter(deal =>
          deal.distributor?.businessName === filter.distributor
        );
      }

      // Apply price range filter
      filtered = filtered.filter(deal =>
        deal.discountPrice >= filter.priceRange[0] &&
        deal.discountPrice <= filter.priceRange[1]
      );

      // Apply min quantity filter
      filtered = filtered.filter(deal =>
        deal.minQtyForDiscount >= filter.minQuantity[0] &&
        deal.minQtyForDiscount <= filter.minQuantity[1]
      );

      // Apply favorites filter
      if (filter.favoritesOnly) {
        filtered = filtered.filter(deal => userFavorites.includes(deal._id));
      }

      // Apply committed deals filter
      if (filter.committedOnly) {
        filtered = filtered.filter(deal => userCommitments.includes(deal._id));
      }

      setFilteredDeals(filtered);
      setIsFilterLoading(false);
    }, 500);

    return () => {
      if (filterDebounceTimeout.current) {
        clearTimeout(filterDebounceTimeout.current);
      }
    };
  }, [deals, filter, userFavorites, userCommitments]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const user_role = localStorage.getItem('user_role');
    const user_id = localStorage.getItem('user_id');

    if (!token || !user_role || !user_id) {
      setToast({
        open: true,
        message: 'Please login to perform this action',
        severity: 'warning'
      });
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleOpenView = async (deal) => {
    if (isViewLoading) return;
    try {
      setIsViewLoading(true);
      navigate(`/deals-catlog/deals/${deal._id}`);
    } catch (error) {
      console.error('Error navigating to view:', error);
    } finally {
      setIsViewLoading(false);
    }
  };
  const handleCloseView = () => setSelectedDeal(null);

  const handleOpenGetDeal = async (deal) => {
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

    setSelectedDeal(deal);

    // Check if user already has a commitment for this deal
    if (userCommitments.includes(deal._id)) {
      try {
        // Fetch the user's existing commitments to get the quantity
        const commitmentsResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/deals/commit/fetch/${user_id}`
        );

        // Find the commitment for this specific deal
        const existingCommitment = commitmentsResponse.data.find(
          commitment => commitment.dealId._id === deal._id
        );

        // Pre-populate the quantity field with the existing commitment quantity
        if (existingCommitment) {
          setQuantity(existingCommitment.quantity);
        }
      } catch (error) {
        console.error("Error fetching existing commitment:", error);
      }
    } else {
      // Reset quantity to 1 for new commitments
      setQuantity(1);
    }

    setGetDealOpen(true);
  };

  const handleCloseGetDeal = () => {
    setGetDealOpen(false);
    setQuantity(1);
  };

  // Function to refresh user data (favorites and commitments)
  const refreshUserData = async () => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) return;

    try {
      // Fetch favorites
      const favoritesResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/deals/favorite`,
        { params: { user_id } }
      );
      setUserFavorites(favoritesResponse.data.map((fav) => fav.dealId));

      // Fetch commitments
      const commitmentsResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/deals/commit/fetch/${user_id}`
      );
      setUserCommitments(commitmentsResponse.data.map(commitment => commitment.dealId._id));
    } catch (error) {
      console.error("Error refreshing user data", error);
    }
  };

  const [redirectLoading, setRedirectLoading] = useState(false);

  const toggleFavorite = async (dealId) => {
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
        message: 'Only Co-op members can add deals to favorites',
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

      // Refresh user data to update favorites
      await refreshUserData();

      setToast({
        open: true,
        message: response.data.message,
        severity: 'success'
      });
    } catch (error) {
      console.error("Error updating favorites", error);
      setToast({
        open: true,
        message: "Error updating favorites",
        severity: 'error'
      });
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleCommitDeal = async () => {
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

    if (!checkAuth() || !selectedDeal || isCommitting) return;

    const totalPrice = quantity * selectedDeal.discountPrice;

    try {
      setIsCommitting(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/deals/commit/buy/${selectedDeal._id}`,
        {
          dealId: selectedDeal._id,
          userId: user_id,
          quantity,
          totalPrice,
        }
      );

      // Refresh user data to update commitments
      await refreshUserData();

      setToast({
        open: true,
        message: "Deal commitment submitted successfully!",
        severity: 'success'
      });
      handleCloseGetDeal();

      // Refresh deals list after commitment
      const dealsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/deals/fetchAll/buy`);
      setDeals(dealsResponse.data);
      setFilteredDeals(dealsResponse.data);
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

  const handleFilterChange = (name, value) => {
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilter({
      searchQuery: '',
      category: '',
      priceRange: [0, 1000],
      minQuantity: [0, 500],
      favoritesOnly: false,
      committedOnly: false
    });
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedDeals = filteredDeals.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

    <>
      {splashContent.length > 0 && <DisplaySplashContent content={splashContent} />}

      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f3f4f6, #ffffff)',
        pb: 4
      }}>
        <Box sx={{
          background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
          color: 'white',
          py: { xs: 4, md: 4 },
          px: { xs: 2, sm: 4 },
          mb: 4
        }}>
          <Container maxWidth="xl">
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 3
            }}>
              <Box>
                <Typography
                  variant="h3"
                  fontWeight="800"
                  sx={{
                    fontSize: { xs: '1.3rem', sm: '1.6rem', md: '2rem' },
                    mb: 1,
                    background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                  }}
                >
                  Exclusive Deals
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.9,
                    fontWeight: 400,
                    fontSize: { xs: '0.7rem', sm: '0.9rem' }
                  }}
                >
                  Discover amazing products at unbeatable prices
                </Typography>
              </Box>
              <Button
                onClick={() => navigate(`/dashboard/co-op-member/offers/view/splash-content?id=${user_id}&session=${user_id}&role=distributor?offer=true`)}
                sx={{
                  border: '2px solid #007bff',
                  color: '#007bff',
                  backgroundColor: 'white',
                  padding: { xs: '4px 4px', md: '10px 10px' },
                  cursor: 'pointer',
                  borderRadius: 25,
                  fontSize: { xs: '12px', md: '16px' },
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  transition: 'background-color 0.3s ease',
                  marginRight: '4px',
                  '&:hover': {
                    backgroundColor: '#0056b3',
                    color: 'white',
                  },
                }}
              >
                View Offers
              </Button>

              {isMobile && (
                <Box sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap'
                }}>
                  {!isMobile && (
                    <ButtonGroup
                      variant="contained"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        overflow: 'hidden',
                        '& .MuiButton-root': {
                          borderColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          px: 3,
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.2)',
                          },
                          '&.Mui-selected': {
                            bgcolor: 'rgba(255,255,255,0.3)',
                          }
                        }
                      }}
                    >

                    </ButtonGroup>
                  )}
                  {isMobile && (
                    <Button
                      variant="contained"
                      onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                      startIcon={<FilterList />}
                      endIcon={mobileFiltersOpen ? <ExpandLess /> : <ExpandMore />}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        borderRadius: 3,
                        px: 3,
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)',
                        }
                      }}
                    >
                      Filters {filteredDeals.length > 0 && `(${filteredDeals.length})`}

                    </Button>
                  )}
                </Box>
              )}

            </Box>

          </Container>
        </Box>

        <Container maxWidth="100%">
          <Box sx={{
            display: 'flex',
            gap: 1,
            flexDirection: { xs: 'column', lg: 'row' }
          }}>
            {/* Filters Panel */}
            <Paper
              elevation={0}
              sx={{
                width: { xs: '100%', lg: '290px' },
                flexShrink: 0,
                borderRadius: 4,
                overflow: 'hidden',
                bgcolor: 'white',
                border: '1px solid',
                borderColor: 'divider',
                position: { xs: 'static', lg: 'sticky' },
                top: 24,
                height: { lg: 'calc(100vh - 50px)' },
                display: { xs: mobileFiltersOpen ? 'block' : 'none', lg: 'block' }
              }}
            >
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Filter Products
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    placeholder="Search products..."
                    value={filter.searchQuery}
                    size="small"
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: 'grey.50',
                        '&:hover': {
                          bgcolor: 'grey.100',
                        },
                        '& fieldset': {
                          borderColor: 'transparent'
                        },
                        '&:hover fieldset': {
                          borderColor: 'primary.main'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main'
                        }
                      }
                    }}
                  />

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Categories
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1
                    }}>
                      {categories.map((cat) => (
                        <Chip
                          key={cat}
                          label={cat}
                          onClick={() => handleFilterChange('category', cat === filter.category ? '' : cat)}
                          variant={filter.category === cat ? "filled" : "outlined"}
                          color="primary"
                          sx={{
                            borderRadius: 2,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 1
                            },
                            transition: 'all 0.2s ease'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Distributor
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={filter.distributor}
                        onChange={(e) => handleFilterChange('distributor', e.target.value)}
                        displayEmpty
                        sx={{ borderRadius: 3 }}
                      >
                        <MenuItem value="">All Distributors</MenuItem>
                        {distributors.map((dist) => (
                          <MenuItem key={dist} value={dist}>{dist}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Price Range: ${filter.priceRange[0]} - ${filter.priceRange[1]}
                    </Typography>
                    <StyledSlider
                      value={filter.priceRange}
                      onChange={(e, newValue) => handleFilterChange('priceRange', newValue)}
                      min={0}
                      max={1000}
                      valueLabelDisplay="auto"
                      sx={{
                        color: 'primary.main',
                        '& .MuiSlider-thumb': {
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)'
                          }
                        }
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Minimum Quantity: {filter.minQuantity[0]} - {filter.minQuantity[1]} units
                    </Typography>
                    <StyledSlider
                      value={filter.minQuantity}
                      onChange={(e, newValue) => handleFilterChange('minQuantity', newValue)}
                      min={1}
                      max={100}
                      valueLabelDisplay="auto"
                      sx={{
                        color: 'primary.main',
                        '& .MuiSlider-thumb': {
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)'
                          }
                        }
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      My Deals
                    </Typography>
                    <Stack direction="column" spacing={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={filter.favoritesOnly}
                            onChange={(e) => handleFilterChange('favoritesOnly', e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Favorite fontSize="small" color={filter.favoritesOnly ? "error" : "action"} />
                            Favorites Only
                          </Typography>
                        }
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={filter.committedOnly}
                            onChange={(e) => handleFilterChange('committedOnly', e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ShoppingCart fontSize="small" color={filter.committedOnly ? "primary" : "action"} />
                            Committed Only
                          </Typography>
                        }
                      />
                    </Stack>
                  </Box>

                  {Object.values(filter).some(value =>
                    value !== '' &&
                    value !== false &&
                    (Array.isArray(value) ?
                      (value[0] !== 0 && value[1] !== 1000) || (value[0] !== 1 && value[1] !== 100)
                      : true)
                  ) && (
                      <Button
                        variant="outlined"
                        startIcon={<Clear />}
                        onClick={clearFilters}
                        color="error"
                        sx={{
                          borderRadius: 3,
                          textTransform: 'none'
                        }}
                      >
                        Clear All Filters
                      </Button>
                    )}
                </Stack>
              </Box>
            </Paper>

            {/* Main Content */}
            <Box sx={{ flexGrow: 1 }}>
              {loading || isFilterLoading ? (
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '400px',
                  gap: 2
                }}>
                  <CircularProgress size={40} />
                  <Typography color="text.secondary">
                    {loading ? 'Loading deals...' : 'Applying filters...'}
                  </Typography>
                </Box>
              ) : error ? (
                <Alert
                  severity="error"
                  sx={{ borderRadius: 3 }}
                >
                  {error}
                </Alert>
              ) : filteredDeals.length > 0 ? (
                <Grid
                  container
                  spacing={3}
                  columns={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
                  sx={{
                    width: '100%',
                    margin: 0,
                    '& .MuiGrid-item': {
                      width: { xs: '100%', sm: '50%', md: '300px' },
                      padding: 1.5,
                    }
                  }}
                >
                  {paginatedDeals.map((deal) => (
                    <Grid item key={deal._id}>
                      <Card
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 4,
                          overflow: 'hidden',
                          transition: "all 0.3s ease",
                          bgcolor: 'white',
                          position: 'relative',
                          "&:hover": {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
                          },
                        }}
                      >
                        {/* Discount Badge */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            bgcolor: 'error.main',
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            zIndex: 1,
                            boxShadow: 2
                          }}
                        >
                          Save {Math.round(((deal.originalCost - deal.discountPrice) / deal.originalCost) * 100)}%
                        </Box>

                        {/* Image Section */}
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            pt: '60%'
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={deal.images[0]}
                            alt={deal.name}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                              p: 1.5,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: 1
                            }}
                          >
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip
                                label={deal.category}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.9)',
                                  color: 'text.primary',
                                  fontWeight: 500,
                                  fontSize: '0.75rem',
                                  height: '24px'
                                }}
                              />
                              <Chip
                                label={deal.totalCommitments || 0} // Ensure only text inside label
                                icon={<Person />} // Use icon prop to display the user profile icon
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.9)',
                                  color: 'success.main',
                                  fontWeight: 500,
                                  fontSize: '0.75rem',
                                  height: '24px'
                                }}
                              />;
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'white',
                                bgcolor: 'rgba(0,0,0,0.5)',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }}
                            >
                              Ends {new Date(deal.dealEndsAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Content Section */}
                        <CardContent
                          sx={{
                            p: 2,
                            '&:last-child': { pb: 2 }
                          }}
                        >
                          <Box sx={{ mb: 1.5 }}>
                            {/* Title and Price Row */}
                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: 1,
                              mb: 1
                            }}>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  lineHeight: 1.2,
                                  flex: 1
                                }}
                              >
                                {deal.name}
                              </Typography>
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                <Typography
                                  variant="subtitle1"
                                  color="primary"
                                  fontWeight="bold"
                                >
                                  ${deal.discountPrice}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ textDecoration: 'line-through' }}
                                >
                                  ${deal.originalCost}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Distributor Info */}
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 1.5,
                              p: 1,
                              bgcolor: 'grey.200',
                              borderRadius: 1
                            }}>
                              <Avatar
                                src={deal.distributor?.logo}
                                alt={deal.distributor?.businessName || deal.distributor?.name}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: 'primary.main',
                                  mr: 1,
                                  borderRadius: '50%',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                }}
                              >
                                {(deal.distributor?.businessName || deal.distributor?.name)?.charAt(0) || 'D'}
                              </Avatar>
                              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                <Typography
                                  variant="caption"
                                  color="text.primary"
                                  sx={{
                                    display: 'block',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {deal.distributor?.businessName || 'Unknown Business'}
                                </Typography>
                                {deal.distributor?.name && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      display: 'block',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      fontSize: '0.7rem'
                                    }}
                                  >
                                    {deal.distributor.name}
                                  </Typography>
                                )}
                              </Box>
                            </Box>

                            {/* Quick Stats */}
                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'start',
                              gap: 1,
                              p: 1,
                              bgcolor: 'grey.50',
                              borderRadius: 1,
                              mb: 1.5
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Visibility sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {deal.views || 0}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <ProductionQuantityLimits sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  Min Qty: {deal.minQtyForDiscount || 0}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="caption" color="success.main">
                                  {deal.minQtyForDiscount - deal.totalCommitmentQuantity || 0} remaining
                                  {deal.minQtyForDiscount - deal.totalCommitmentQuantity === 0 && (
                                    <Tooltip
                                      title={
                                        <Typography sx={{ fontSize: "16px", color: "white" }}>
                                          You can commit more, but this one has completed its requirements
                                        </Typography>
                                      }
                                      placement="top"
                                      arrow
                                      PopperProps={{
                                        modifiers: [
                                          {
                                            name: "preventOverflow",
                                            options: {
                                              boundary: "window",
                                            },
                                          },
                                        ],
                                      }}
                                      sx={{
                                        '& .MuiTooltip-tooltip': {
                                          backgroundColor: "#333",
                                          color: "white",
                                          fontSize: "16px", // Increase font size
                                          padding: "10px",
                                          borderRadius: "8px",
                                          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
                                        },
                                      }}
                                    >
                                      <InfoIcon fontSize="small" sx={{ verticalAlign: "middle", color: "info.main" }} />
                                    </Tooltip>
                                  )}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Status Indicators */}
                            {(userFavorites.includes(deal._id) || userCommitments.includes(deal._id)) && (
                              <Box sx={{
                                display: 'flex',
                                gap: 1,
                                mb: 1.5
                              }}>
                                {userFavorites.includes(deal._id) && (
                                  <Chip
                                    icon={<Favorite fontSize="small" />}
                                    label="Favorite"
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                    sx={{ borderRadius: 1 }}
                                  />
                                )}
                                {userCommitments.includes(deal._id) && (
                                  <Chip
                                  
                                    label="Committed"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{ borderRadius: 1 }}
                                  />
                                )}
                              </Box>
                            )}

                            {/* Description Preview */}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: 1.3,
                                mb: 1.5,
                                fontSize: '0.75rem'
                              }}
                            >
                              {deal.description}
                            </Typography>

                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="contained"
                                size="small"
                                fullWidth
                                onClick={() => handleOpenGetDeal(deal)}
                                disabled={isCommitting}
                                sx={{
                                  borderRadius: 1,
                                  py: 0.5,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  background: userCommitments.includes(deal._id) ? 'linear-gradient(45deg,rgb(17, 128, 26) 30%,rgba(6, 78, 18, 0.68) 90%)' : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                                  '&:hover': {
                                  background: userCommitments.includes(deal._id) ? 'linear-gradient(45deg,rgb(48, 158, 15) 30%,rgb(14, 133, 33) 90%)' : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
                                  }
                                }}
                              >
                                {isCommitting ? (
                                  <CircularProgress size={24} color="inherit" />
                                ) : (
                                  userCommitments.includes(deal._id) ? 'Edit Commitment' : 'Make Commitment'
                                )}
                              </Button>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenView(deal)}
                                disabled={isViewLoading}
                                sx={{
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  p: 0.5
                                }}
                              >
                                {isViewLoading ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <Visibility sx={{ fontSize: '1.25rem' }} />
                                )}
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => toggleFavorite(deal._id)}
                                disabled={isFavoriteLoading}
                                sx={{
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  p: 0.5,
                                  color: userFavorites.includes(deal._id) ? 'error.main' : 'inherit'
                                }}
                              >
                                {isFavoriteLoading ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  userFavorites.includes(deal._id) ?
                                    <Favorite sx={{ fontSize: '1.25rem' }} /> :
                                    <FavoriteBorder sx={{ fontSize: '1.25rem' }} />
                                )}
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : deals.length > 0 ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    bgcolor: 'white',
                    borderRadius: 4,
                    border: '1px dashed',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No deals match your current filters
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Try adjusting your search criteria
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    bgcolor: 'white',
                    borderRadius: 4,
                    border: '1px dashed',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    No active deals available
                  </Typography>
                </Box>
              )}

              {/* Pagination */}
              {filteredDeals.length > 0 && (
                <Box sx={{
                  mt: 4,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 2,
                  flexWrap: 'wrap'
                }}>
                  <TablePagination
                    component="div"
                    count={filteredDeals.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[12, 24, 36, 48]}
                    labelRowsPerPage="Items per page:"
                    sx={{
                      '.MuiTablePagination-select': {
                        borderRadius: 2,
                        bgcolor: 'white',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }
                    }}
                  />
                  <Pagination
                    count={Math.ceil(filteredDeals.length / rowsPerPage)}
                    page={page + 1}
                    onChange={(e, p) => setPage(p - 1)}
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: 2,
                        '&.Mui-selected': {
                          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark'
                          }
                        }
                      }
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </Container>

        {/* Dialogs */}
        <Dialog
          open={getDealOpen}
          onClose={handleCloseGetDeal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              bgcolor: 'background.paper'
            }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              Get Deal: {selectedDeal?.name}
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ pt: 2 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                p: 2,
                bgcolor: 'primary.lighter',
                borderRadius: 3
              }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar
                    src={selectedDeal?.images[0]}
                    alt={selectedDeal?.name}
                    variant="rounded"
                    sx={{ width: 80, height: 80 }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {selectedDeal?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDeal?.distributor?.businessName || 'Unknown Business'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'left', flexDirection: 'column' }}>
                  <Chip label={`Min Qty: ${selectedDeal?.minQtyForDiscount || 0}`} color="primary" />
                  <Chip
                    label={`Remaining Quantity: ${selectedDeal?.minQtyForDiscount && selectedDeal?.totalCommitmentQuantity !== undefined
                        ? selectedDeal.minQtyForDiscount - selectedDeal.totalCommitmentQuantity
                        : "N/A"
                      }`}
                    color="success"
                  />
                </Box>
              </Box>

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 2
              }}>
                <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Original Price
                  </Typography>
                  <Typography variant="h6" sx={{ textDecoration: 'line-through', opacity: 0.7 }}>
                    ${selectedDeal?.originalCost}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'primary.lighter' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Discount Price
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    ${selectedDeal?.discountPrice}
                  </Typography>
                </Paper>
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

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'primary.lighter'
                }}
              >
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 2
                }}>
                  <Typography variant="subtitle1">Subtotal:</Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    ${(quantity * (selectedDeal?.discountPrice || 0)).toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'success.main'
                }}>
                  <Typography variant="subtitle1">You Save:</Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    ${(quantity * ((selectedDeal?.originalCost || 0) - (selectedDeal?.discountPrice || 0))).toFixed(2)}
                  </Typography>
                </Box>
              </Paper>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button
              onClick={handleCloseGetDeal}
              variant="outlined"
              disabled={isCommitting}
              sx={{
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCommitDeal}
              disabled={isCommitting}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                boxShadow: '0 3px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)'
                }
              }}
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
      </Box>
    </>
  );
};

export default DisplayDeals;