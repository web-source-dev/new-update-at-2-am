import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Box, Button, IconButton, InputLabel, Skeleton, MenuItem, Card, CardContent, CardMedia, CardActions, Tooltip, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Menu, MenuItem as DropdownMenuItem, Badge, Collapse, Chip, Divider, InputAdornment, TablePagination, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Edit, Delete, Search, Clear, Visibility, ViewModule, ViewList, ViewComfy, Add, GetApp, FilterAlt, ExpandLess, ExpandMore, ContentCopy, MoreVert, DeleteOutline } from '@mui/icons-material';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Toast from '../../../Components/Toast/Toast';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import useMediaQuery from '@mui/material/useMediaQuery';
import { FilterTextField, FilterSelect, FilterFormControl } from '../../DashBoardComponents/FilterStyles';
import { GridCardsSkeleton, TableSkeleton } from '../../../Components/Skeletons/LoadingSkeletons';
import LinearProgress from '@mui/material/LinearProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ManageDeals = () => {
  const [deals, setDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [layout, setLayout] = useState('grid');
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    content: '',
    action: null,
    dealId: null,
    dealName: '',
    actionType: ''
  });
  const [debugDialog, setDebugDialog] = useState({
    open: false,
    data: null
  });

  const location = useLocation();
  const [filter, setFilter] = useState({
    category: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sortBy: '',
    month: new Date().getMonth() + 1, // Initialize with current month
  });
  const { userId } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Set default rows per page

  // Add Menu state and handlers for download dropdown
  const [downloadAnchorEl, setDownloadAnchorEl] = useState(null);
  const downloadMenuOpen = Boolean(downloadAnchorEl);

  const [loading, setLoading] = useState(false);
  const [anchorElMap, setAnchorElMap] = useState({});

  useEffect(() => {
    if (location.pathname.includes("/admin/profile-management")) {
      localStorage.removeItem('user');

      console.log("Local storage cleared");
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/deals/fetch/${userId}`, {
          params: {
            ...filter,
            month: filter.month
          }
        });
        console.log('API Response:', response.data);
        
        // Store raw response for debugging
        setDebugDialog(prev => ({ ...prev, data: response.data }));
        
        // Get categories from response if available
        if (response.data && response.data.categories) {
          setCategories(response.data.categories);
        }
        
        // Check the structure of the response
        if (response.data && response.data.deals) {
          // If response has a 'deals' property, use it
          console.log(`Found ${response.data.deals.length} deals out of ${response.data.totalDeals} total`);
          
          // Debug commitments data
          if (response.data.deals.length > 0) {
            response.data.deals.forEach(deal => {
              console.log(`Deal "${deal.name}" has ${deal.commitments ? deal.commitments.length : 0} commitments`);
              
              // Log first commitment details if available
              if (deal.commitments && deal.commitments.length > 0) {
                console.log('Sample commitment data:', deal.commitments[0]);
              }
            });
          }
          
          setDeals(response.data.deals);
        } else if (Array.isArray(response.data)) {
          // If response is an array, use it directly
          console.log(`Found ${response.data.length} deals in array format`);
          setDeals(response.data);
        } else {
          // Fallback for unexpected response format
          console.warn('Unexpected response format:', response.data);
          setDeals([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching deals:', error);
        setToast({
          open: true,
          message: 'Error refreshing deals list',
          severity: 'error'
        });
        setLoading(false);
      }
    };

    if (userId) {  // Only fetch if userId is available
      fetchDeals();
    }
  }, [userId, location.key, filter]);

  // Confirmation dialog handlers
  const handleConfirmDialogOpen = (title, content, action, dealId, dealName, actionType) => {
    setConfirmDialog({
      open: true,
      title,
      content,
      action,
      dealId,
      dealName,
      actionType
    });
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({
      open: false,
      title: '',
      content: '',
      action: null,
      dealId: null,
      dealName: '',
      actionType: ''
    });
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmDialog.action) {
        await confirmDialog.action();
      }
      handleConfirmDialogClose();
    } catch (error) {
      console.error('Error executing action:', error);
      setToast({
        open: true,
        message: `Error ${confirmDialog.actionType} deal`,
        severity: 'error'
      });
    }
  };

  const handleDelete = async (dealId) => {
    const deal = deals.find(d => d._id === dealId);
    handleConfirmDialogOpen(
      'Confirm Delete',
      `Are you sure you want to delete the deal "${deal.name}"? This action cannot be undone.`,
      async () => {
        try {
          const response = await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/deals/delete/${dealId}`);
          if (response.data.success) {
            setDeals(deals.filter(deal => deal._id !== dealId));
            setToast({
              open: true,
              message: response.data.message,
              severity: 'success'
            });
          } else {
            setToast({
              open: true,
              message: response.data.message,
              severity: 'error'
            });
          }
        } catch (error) {
          setToast({
            open: true,
            message: error.response?.data?.message || 'Error deleting deal',
            severity: 'error'
          });
        }
      },
      dealId,
      deal.name,
      'deleting'
    );
  };

  const handleToggleChange = async (dealId, currentStatus) => {
    const deal = deals.find(d => d._id === dealId);
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    handleConfirmDialogOpen(
      `Confirm ${newStatus === 'active' ? 'Activation' : 'Deactivation'}`,
      `Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} the deal "${deal.name}"?`,
      async () => {
        try {
          const response = await axios.patch(`${process.env.REACT_APP_BACKEND_URL}/deals/update-status/${dealId}/status`, { status: newStatus });
          setDeals(deals.map(deal => deal._id === dealId ? response.data : deal));
          setToast({
            open: true,
            message: `Deal ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
            severity: 'success'
          });
        } catch (error) {
          throw error;
        }
      },
      dealId,
      deal.name,
      'updating status of'
    );
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleClearFilters = () => {
    setFilter({ category: '', status: '', minPrice: '', maxPrice: '', search: '', sortBy: '', month: new Date().getMonth() + 1 });
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const handleEdit = async (deal) => {
    try {
      navigate(`/dashboard/distributor/edit-deal/${deal._id}`, {
        state: { deal }
      });
    } catch (error) {
      console.error('Error navigating to edit:', error);
      setToast({
        open: true,
        message: 'Error accessing edit page',
        severity: 'error'
      });
    }
  };

  const handleView = (dealId) => {
    navigate(`/distributor/view-deal/${dealId}`);
  };

  const handleDownloadClick = (event) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleDownloadClose = () => {
    setDownloadAnchorEl(null);
  };

  const handleDownload = (format) => {
    const filteredData = deals.map(deal => {
      // Get price info considering new sizes structure
      const priceInfo = deal.sizes && deal.sizes.length > 0 
        ? {
            'Original Cost': `${Math.min(...deal.sizes.map(s => s.originalCost))} - ${Math.max(...deal.sizes.map(s => s.originalCost))}`,
            'Discount Price': `${Math.min(...deal.sizes.map(s => s.discountPrice))} - ${Math.max(...deal.sizes.map(s => s.discountPrice))}`
          }
        : {
            'Original Cost': deal.avgOriginalCost?.toFixed(2) || deal.originalCost,
            'Discount Price': deal.avgDiscountPrice?.toFixed(2) || deal.discountPrice
          };
      
      // Get sizes as comma-separated list
      const sizes = deal.sizes && deal.sizes.length > 0
        ? deal.sizes.map(s => s.size).join(', ')
        : 'Standard';
        
      // Get discount tiers as comma-separated list
      const discountTiers = deal.discountTiers && deal.discountTiers.length > 0
        ? deal.discountTiers.map(t => `${t.tierQuantity}+ = ${t.tierDiscount}%`).join(', ')
        : 'None';
        
      return {
        'Name': deal.name,
        'Description': deal.description,
        'Sizes': sizes,
        'Original Cost': priceInfo['Original Cost'],
        'Discount Price': priceInfo['Discount Price'],
        'Discount Tiers': discountTiers,
        'Min Qty for Discount': deal.minQtyForDiscount,
        'Category': deal.category,
        'Status': deal.status,
        'Total Sold': deal.totalSold,
        'Total Revenue': deal.totalRevenue,
        'Views': deal.views,
        'Impressions': deal.impressions
      };
    });

    if (format === 'csv') {
      const headers = Object.keys(filteredData[0]);
      const csvContent = [
        headers.join(','),
        ...filteredData.map(deal => headers.map(header =>
          typeof deal[header] === 'string' && deal[header].includes(',')
            ? `"${deal[header]}"`
            : deal[header]
        ).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'deals.csv');
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text('Deals Report', 14, 15);

      doc.autoTable({
        head: [Object.keys(filteredData[0])],
        body: filteredData.map(deal => Object.values(deal)),
        startY: 20,
        margin: { top: 15 },
        styles: { overflow: 'linebreak' },
        columnStyles: {
          Description: { cellWidth: 40 }
        }
      });

      doc.save('deals.pdf');
    }

    handleDownloadClose();
  };

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  const handleDuplicate = async (deal) => {
    handleConfirmDialogOpen(
      'Confirm Duplicate',
      `Are you sure you want to create a duplicate of "${deal.name}"? The new deal will be created as inactive.`,
      async () => {
        try {
          const duplicatedDeal = {
            ...deal,
            name: `${deal.name} (Copy)`,
            views: 0,
            impressions: 0,
            totalSold: 0,
            totalRevenue: 0,
            commitments: [],
            notificationHistory: new Map(),
            status: 'inactive'
          };
          delete duplicatedDeal._id;

          const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/deals/create`, duplicatedDeal);
          setDeals([...deals, response.data]);
          setToast({
            open: true,
            message: 'Deal duplicated successfully',
            severity: 'success'
          });
        } catch (error) {
          throw error;
        }
      },
      deal._id,
      deal.name,
      'duplicating'
    );
  };

  const filteredDeals = deals.filter(deal => {
    return (
      (filter.category ? deal.category === filter.category : true) &&
      (filter.status ? deal.status === filter.status : true) &&
      (filter.minPrice ? deal.discountPrice >= filter.minPrice : true) &&
      (filter.maxPrice ? deal.discountPrice <= filter.maxPrice : true) &&
      (filter.search ? deal.name.toLowerCase().includes(filter.search.toLowerCase()) : true)
    );
  }).sort((a, b) => {
    if (filter.sortBy === 'priceAsc') {
      return a.discountPrice - b.discountPrice;
    } else if (filter.sortBy === 'priceDesc') {
      return b.discountPrice - a.discountPrice;
    } else if (filter.sortBy === 'nameAsc') {
      return a.name.localeCompare(b.name);
    } else if (filter.sortBy === 'nameDesc') {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

  // Calculate the current page deals
  const currentDeals = filteredDeals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleMenuOpen = (event, dealId) => {
    setAnchorElMap(prev => ({ ...prev, [dealId]: event.currentTarget }));
  };

  const handleMenuClose = (dealId) => {
    setAnchorElMap(prev => ({ ...prev, [dealId]: null }));
  };

  const FiltersContent = () => {
    const [showFilters, setShowFilters] = useState(false);
    const activeFilters = Object.values(filter).filter(value => value !== '').length;

    return (
      <Box sx={{ width: '100%', mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<FilterAlt />}
              endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
              color="primary"
            >
              <Badge badgeContent={activeFilters} color="primary" sx={{ mr: 1 }}>
                Filters
              </Badge>
            </Button>
            {activeFilters > 0 && (
              <Button
                variant="text"
                startIcon={<Clear />}
                onClick={handleClearFilters}
                size="small"
              >
                Clear All
              </Button>
            )}
          </Box>

          <Collapse in={showFilters}>
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Quick Filters
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {categories.map((cat) => (
                        <Chip
                          key={cat}
                          label={cat}
                          onClick={() => handleFilterChange({ target: { name: 'category', value: cat } })}
                          variant="outlined"
                          color="primary"
                          sx={{
                            '&:hover': {
                              backgroundColor: 'primary.light',
                              color: 'primary.contrastText'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FilterTextField
                    label="Search Deals"
                    name="search"
                    value={filter.search}
                    onChange={handleFilterChange}
                    fullWidth
                    placeholder="Search by name..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FilterFormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <FilterSelect
                      value={filter.category}
                      onChange={handleFilterChange}
                      label="Category"
                      name="category"
                    >
                      <MenuItem value=""><em>All Categories</em></MenuItem>
                      {categories.map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </FilterSelect>
                  </FilterFormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FilterFormControl fullWidth>
                    <InputLabel>Month</InputLabel>
                    <FilterSelect
                      value={filter.month}
                      onChange={(e) => setFilter({ ...filter, month: e.target.value })}
                      label="Month"
                    >
                      <MenuItem value=""><em>All Months</em></MenuItem>
                      <MenuItem value={1}>January</MenuItem>
                      <MenuItem value={2}>February</MenuItem>
                      <MenuItem value={3}>March</MenuItem>
                      <MenuItem value={4}>April</MenuItem>
                      <MenuItem value={5}>May</MenuItem>
                      <MenuItem value={6}>June</MenuItem>
                      <MenuItem value={7}>July</MenuItem>
                      <MenuItem value={8}>August</MenuItem>
                      <MenuItem value={9}>September</MenuItem>
                      <MenuItem value={10}>October</MenuItem>
                      <MenuItem value={11}>November</MenuItem>
                      <MenuItem value={12}>December</MenuItem>
                    </FilterSelect>
                  </FilterFormControl>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Price Range
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FilterTextField
                        label="Min Price"
                        name="minPrice"
                        type="number"
                        value={filter.minPrice}
                        onChange={handleFilterChange}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FilterTextField
                        label="Max Price"
                        name="maxPrice"
                        type="number"
                        value={filter.maxPrice}
                        onChange={handleFilterChange}
                        fullWidth
                      />
                    </Grid>

                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Sort & Status
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FilterFormControl fullWidth>
                        <InputLabel>Sort By</InputLabel>
                        <FilterSelect
                          value={filter.sortBy}
                          onChange={handleFilterChange}
                          label="Sort By"
                          name="sortBy"
                        >
                          <MenuItem value=""><em>None</em></MenuItem>
                          <MenuItem value="priceAsc">Price: Low to High</MenuItem>
                          <MenuItem value="priceDesc">Price: High to Low</MenuItem>
                          <MenuItem value="nameAsc">Name: A to Z</MenuItem>
                          <MenuItem value="nameDesc">Name: Z to A</MenuItem>
                        </FilterSelect>
                      </FilterFormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FilterFormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <FilterSelect
                          value={filter.status}
                          onChange={handleFilterChange}
                          label="Status"
                          name="status"
                        >
                          <MenuItem value=""><em>All</em></MenuItem>
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                        </FilterSelect>
                      </FilterFormControl>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Paper>

        {activeFilters > 0 && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {filter.search && (
              <Chip
                label={`Search: ${filter.search}`}
                onDelete={() => handleFilterChange({ target: { name: 'search', value: '' } })}
                color="primary"
                variant="outlined"
              />
            )}
            {filter.month && (
              <Chip
                label={`Month: ${filter.month}`}
                onDelete={() => handleFilterChange({ target: { name: 'month', value: '' } })}
                color="primary"
                variant="outlined"
              />
            )}
            {filter.category && (
              <Chip
                label={`Category: ${filter.category}`}
                onDelete={() => handleFilterChange({ target: { name: 'category', value: '' } })}
                color="primary"
                variant="outlined"
              />
            )}
            {filter.status && (
              <Chip
                label={`Status: ${filter.status}`}
                onDelete={() => handleFilterChange({ target: { name: 'status', value: '' } })}
                color="primary"
                variant="outlined"
              />
            )}
            {filter.minPrice && (
              <Chip
                label={`Min Price: $${filter.minPrice}`}
                onDelete={() => handleFilterChange({ target: { name: 'minPrice', value: '' } })}
                color="primary"
                variant="outlined"
              />
            )}
            {filter.maxPrice && (
              <Chip
                label={`Max Price: $${filter.maxPrice}`}
                onDelete={() => handleFilterChange({ target: { name: 'maxPrice', value: '' } })}
                color="primary"
                variant="outlined"
              />
            )}
            {filter.sortBy && (
              <Chip
                label={`Sorted by: ${filter.sortBy.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                onDelete={() => handleFilterChange({ target: { name: 'sortBy', value: '' } })}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Box>
    );
  };

  // Add function to open debug dialog
  const handleOpenDebugDialog = () => {
    setDebugDialog(prev => ({ ...prev, open: true }));
  };

  // Add function to close debug dialog
  const handleCloseDebugDialog = () => {
    setDebugDialog(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return layout === 'grid' ? (
      <Container>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" sx={{ fontSize: '2rem', width: '40%' }} />
        </Box>
        <GridCardsSkeleton count={8} xs={12} sm={6} md={4} lg={3} />
      </Container>
    ) : (
      <TableSkeleton columnsNum={7} />
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4
      }}>
        <Typography variant="h4" fontWeight="bold">
          Manage Deals
        </Typography>
        <Box>
          <Tooltip title="Add New Deal">
            {(location.pathname.includes("distributor")) && (
              <IconButton color="primary" onClick={() => navigate('/dashboard/distributor/deal/create')}>
                <Add />
              </IconButton>
            )}
          </Tooltip>
          <Tooltip title="Download">
            <IconButton color="primary" onClick={handleDownloadClick}>
              <GetApp />
            </IconButton>
          </Tooltip>
          <Tooltip title="Grid View">
            <IconButton color={layout === 'grid' ? 'primary' : 'default'} onClick={() => setLayout('grid')}>
              <ViewModule />
            </IconButton>
          </Tooltip>
          <Tooltip title="List View">
            <IconButton color={layout === 'list' ? 'primary' : 'default'} onClick={() => setLayout('list')}>
              <ViewList />
            </IconButton>
          </Tooltip>
          {!isMobile && (
            <Tooltip title="Table View">
              <IconButton color={layout === 'table' ? 'primary' : 'default'} onClick={() => setLayout('table')}>
                <ViewComfy />
              </IconButton>
            </Tooltip>
          )}
          {/* Admin debug button */}
          {localStorage.getItem('user_role') === 'admin' && (
            <Tooltip title="Debug Data">
              <IconButton color="default" onClick={handleOpenDebugDialog}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="M12 16v.01"/>
                  <path d="M12 8v4"/>
                </svg>
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <FiltersContent />

      {loading ? (
        <Box sx={{ width: '100%', mt: 4, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Loading deals...
          </Typography>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      ) : deals.length === 0 ? (
        <Paper sx={{ p: 4, mt: 4, mb: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No deals found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {filter.status || filter.category || filter.search || filter.minPrice || filter.maxPrice 
              ? "Try adjusting your filters to see more results"
              : "Start by creating your first deal"}
          </Typography>
          {(location.pathname.includes("distributor")) && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Add />} 
              sx={{ mt: 2 }}
              onClick={() => navigate('/dashboard/distributor/deal/create')}
            >
              Create New Deal
            </Button>
          )}
        </Paper>
      ) : (
        <>
          {layout === 'grid' && (
            <Grid container spacing={3}>
              {currentDeals.map((deal) => (
                <Grid item xs={12} sm={6} md={4} key={deal._id}>
                  <Card sx={{
                    borderRadius: 3,
                    boxShadow: 4,
                    overflow: "hidden",
                    position: 'relative',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="180"
                        image={deal.images[0] || "https://via.placeholder.com/300"}
                        alt={deal.name}
                        sx={{ objectFit: "cover" }}
                      />
                      <Box sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap'
                      }}>
                        {deal.name.toLowerCase().includes('(copy)') && (
                          <Chip
                            label="Duplicate"
                            color="info"
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(33, 150, 243, 0.9)',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        )}
                        <Chip
                          label={deal.status}
                          color={deal.status === 'active' ? 'success' : 'default'}
                          size="small"
                          sx={{
                            backgroundColor: deal.status === 'active' ? 'rgba(46, 125, 50, 0.9)' : 'rgba(97, 97, 97, 0.9)',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    </Box>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                          {deal.name}
                        </Typography>
                        <Chip
                          label={deal.category}
                          color="primary"
                          size="small"
                          sx={{
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                      <Divider sx={{ my: 2 }} />

                      {/* Sizes Section */}
                      {deal.sizes && deal.sizes.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" fontWeight="bold" color="text.secondary" sx={{ mb: 1 }}>
                            Available Sizes:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {deal.sizes.map((sizeItem, idx) => (
                              <Chip 
                                key={idx} 
                                label={sizeItem.size} 
                                size="small" 
                                variant="outlined" 
                                sx={{ borderColor: 'primary.light' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          {deal.sizes && deal.sizes.length > 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              Price Range: <br />
                              <span style={{ textDecoration: 'line-through' }}>
                                ${Math.min(...deal.sizes.map(s => s.originalCost))} - ${Math.max(...deal.sizes.map(s => s.originalCost))}
                              </span><br />
                              <span style={{ color: 'green', fontWeight: 'bold' }}>
                                ${Math.min(...deal.sizes.map(s => s.discountPrice))} - ${Math.max(...deal.sizes.map(s => s.discountPrice))}
                              </span>
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Price: <span style={{ textDecoration: 'line-through' }}>${deal.avgOriginalCost?.toFixed(2) || deal.originalCost}</span> / ${deal.avgDiscountPrice?.toFixed(2) || deal.discountPrice}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            Views: {deal.views}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Min Qty for Deal: {deal.minQtyForDiscount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Members: {deal.totalCommitmentCount || 0}
                            {deal.pendingCommitmentCount > 0 && (
                              <Chip 
                                size="small"
                                label={`${deal.pendingCommitmentCount} pending`}
                                color="warning"
                                variant="outlined"
                                sx={{ ml: 1, fontSize: '0.7rem' }}
                              />
                            )}
                          </Typography>
                        </Grid>
                      </Grid>

                      {/* Discount Tiers Section */}
                      {deal.discountTiers && deal.discountTiers.length > 0 && (
                        <Box sx={{ mt: 2, mb: 2 }}>
                          <Typography variant="body2" fontWeight="bold" color="text.secondary" sx={{ mb: 1 }}>
                            Volume Discounts:
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {deal.discountTiers.map((tier, idx) => (
                              <Typography key={idx} variant="body2" color="text.secondary">
                                {tier.tierQuantity}+ units: {tier.tierDiscount}% off
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      )}

                      <Typography variant="body2" color="text.secondary">
                        Deal Progress : {deal.totalCommittedQuantity || 0} / {deal.minQtyForDiscount}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 2, mt: 2, gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, (((deal.totalCommittedQuantity || 0) / deal.minQtyForDiscount) * 100) || 0)}
                          sx={{ height: 6, borderRadius: 2, width: '90%' }}
                        />

                        {(((deal.totalCommittedQuantity || 0) / deal.minQtyForDiscount) * 100) >= 100 && (
                          <CheckCircleIcon
                            sx={{
                              color: 'success.main'
                            }}
                          />
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {deal.bulkAction ? "Expired" : `Ends: ${new Date(deal.dealEndsAt).toLocaleString()}`}
                      </Typography>

                    </CardContent>
                    <Divider />
                    <CardActions sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      padding: 2
                    }}>
                      {(location.pathname.includes("distributor")) && (
                        <>
                          <Tooltip title="Edit">
                            <IconButton color="primary" onClick={() => handleEdit(deal)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Duplicate">
                            <IconButton color="info" onClick={() => handleDuplicate(deal)}>
                              <ContentCopy />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="View">
                        <IconButton color="info" onClick={() => handleView(deal._id)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      {deal.bulkAction ? (
                        <Chip 
                          label={deal.bulkStatus} 
                          color={deal.bulkStatus === "approved" ? "success" : "error"} 
                          variant="outlined" 
                        />
                      ) : (
                        <Tooltip title={deal.status === 'active' ? 'Deactivate' : 'Activate'}>
                          <Switch
                            checked={deal.status === 'active'}
                            onChange={() => handleToggleChange(deal._id, deal.status)}
                            color="primary"
                          />
                        </Tooltip>
                      )}
                      {!deal.bulkAction && (
                        <Tooltip title='Delete'>
                          <Button
                            color="error"
                            onClick={() => handleDelete(deal._id)}
                            variant="outlined"
                          >
                            <DeleteOutline />
                          </Button>
                        </Tooltip>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          {layout === 'list' && (
            <Box>
              {currentDeals.map((deal) => (
                <Paper
                  key={deal._id}
                  sx={{
                    mb: 2,
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Box sx={{ position: 'relative', minWidth: 80 }}>
                      <CardMedia
                        component="img"
                        height="80"
                        image={deal.images[0] || "https://via.placeholder.com/300"}
                        alt={deal.name}
                        sx={{
                          objectFit: "cover",
                          width: 80,
                          mr: 2,
                          borderRadius: 1
                        }}
                      />
                      <Box sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5
                      }}>
                        {deal.name.toLowerCase().includes('(copy)') && (
                          <Chip
                            label="Duplicate"
                            color="info"
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(33, 150, 243, 0.9)',
                              color: 'white',
                              fontWeight: 'bold',
                              transform: 'scale(0.8)'
                            }}
                          />
                        )}
                        <Chip
                          label={deal.status}
                          color={deal.status === 'active' ? 'success' : 'default'}
                          size="small"
                          sx={{
                            backgroundColor: deal.status === 'active' ? 'rgba(46, 125, 50, 0.9)' : 'rgba(97, 97, 97, 0.9)',
                            color: 'white',
                            fontWeight: 'bold',
                            transform: 'scale(0.8)'
                          }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ ml: 3, flex: 1 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6" fontWeight="bold">
                            {deal.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Category: {deal.category}
                          </Typography>
                          
                          {/* Display Sizes */}
                          {deal.sizes && deal.sizes.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                Sizes: 
                              </Typography>
                              {deal.sizes.map((sizeItem, idx) => (
                                <Chip 
                                  key={idx} 
                                  label={sizeItem.size} 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ borderColor: 'primary.light' }}
                                />
                              ))}
                            </Box>
                          )}
                          
                          {/* Display Price */}
                          {deal.sizes && deal.sizes.length > 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              Price Range: 
                              <span style={{ textDecoration: 'line-through', color: '#f44336', marginLeft: '4px' }}>
                                ${Math.min(...deal.sizes.map(s => s.originalCost))} - ${Math.max(...deal.sizes.map(s => s.originalCost))}
                              </span> | 
                              <span style={{ color: 'green', fontWeight: 'bold', marginLeft: '4px' }}>
                                ${Math.min(...deal.sizes.map(s => s.discountPrice))} - ${Math.max(...deal.sizes.map(s => s.discountPrice))}
                              </span>
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Price: <span style={{ textDecoration: 'line-through' }}>${deal.avgOriginalCost?.toFixed(2) || deal.originalCost}</span> / ${deal.avgDiscountPrice?.toFixed(2) || deal.discountPrice}
                            </Typography>
                          )}

                          <Typography variant="body2" color="text.secondary">
                            Min Qty for Deal: {deal.minQtyForDiscount}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          {/* Discount Tiers Section */}
                          {deal.discountTiers && deal.discountTiers.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" fontWeight="bold" color="text.secondary" sx={{ mb: 1 }}>
                                Volume Discounts:
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {deal.discountTiers.map((tier, idx) => (
                                  <Typography key={idx} variant="body2" color="text.secondary">
                                    {tier.tierQuantity}+ units: {tier.tierDiscount}% off
                                  </Typography>
                                ))}
                              </Box>
                            </Box>
                          )}
                          
                          <Typography variant="body2" color="text.secondary">
                            Deal Progress : {deal.totalCommittedQuantity || 0} / {deal.minQtyForDiscount}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '70%', mb: 2, mt: 2, gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, (((deal.totalCommittedQuantity || 0) / deal.minQtyForDiscount) * 100) || 0)}
                              sx={{ height: 6, borderRadius: 2, width: '90%' }}
                            />
                            {(((deal.totalCommittedQuantity || 0) / deal.minQtyForDiscount) * 100) >= 100 && (
                              <CheckCircleIcon
                                sx={{
                                  color: 'success.main'
                                }}
                              />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {deal.bulkAction ? "Expired" : `Ends: ${new Date(deal.dealEndsAt).toLocaleString()}`}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={(e) => handleMenuOpen(e, deal._id)}>
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorElMap[deal._id]}
                      open={Boolean(anchorElMap[deal._id])}
                      onClose={() => handleMenuClose(deal._id)}
                    >
                      {location.pathname.includes("distributor") && [
                        <MenuItem key="edit" onClick={() => { handleEdit(deal); handleMenuClose(deal._id); }}>
                          <Edit sx={{ mr: 1 }} fontSize="small" /> Edit
                        </MenuItem>,
                        <MenuItem key="duplicate" onClick={() => { handleDuplicate(deal); handleMenuClose(deal._id); }}>
                          <ContentCopy sx={{ mr: 1 }} fontSize="small" /> Duplicate
                        </MenuItem>
                      ]}
                      <MenuItem onClick={() => { handleView(deal._id); handleMenuClose(deal._id); }}>
                        <Visibility sx={{ mr: 1 }} fontSize="small" /> View
                      </MenuItem>
                      {deal.bulkAction ? (
                        <MenuItem disabled>
                          <Chip 
                            label={deal.bulkStatus} 
                            color={deal.bulkStatus === "approved" ? "success" : "error"} 
                            variant="outlined" 
                          />
                        </MenuItem>
                      ) : (
                        <MenuItem onClick={() => { 
                          handleToggleChange(deal._id, deal.status); 
                          handleMenuClose(deal._id); 
                        }}>
                          <Switch
                            checked={deal.status === 'active'}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          {deal.status === 'active' ? 'Deactivate' : 'Activate'}
                        </MenuItem>
                      )}
                      {!deal.bulkAction && (
                        <MenuItem onClick={() => {handleDelete(deal._id); handleMenuClose(deal._id);}}>
                          <DeleteOutline sx={{ mr: 1 }} fontSize="small" /> Delete
                        </MenuItem>
                      )}
                    </Menu>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
          {layout === 'table' && (
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                    <TableCell>Image</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Sizes</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Min Qty for Deal</TableCell>
                    <TableCell>Deal Progress</TableCell>
                    <TableCell>Ends</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentDeals.map((deal) => (
                    <TableRow
                      key={deal._id}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.02)',
                          transition: 'background-color 0.3s ease-in-out'
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height="60"
                            image={deal.images[0] || "https://via.placeholder.com/300"}
                            alt={deal.name}
                            sx={{
                              objectFit: "cover",
                              width: 60,
                              borderRadius: 1
                            }}
                          />
                          {deal.name.toLowerCase().includes('(copy)') && (
                            <Chip
                              label="Duplicate"
                              color="info"
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                backgroundColor: 'rgba(33, 150, 243, 0.9)',
                                color: 'white',
                                fontWeight: 'bold',
                                transform: 'scale(0.8)'
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{deal.name}</TableCell>
                      <TableCell>{deal.category}</TableCell>
                      <TableCell>
                        {deal.sizes && deal.sizes.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {deal.sizes.map((sizeItem, idx) => (
                              <Chip 
                                key={idx} 
                                label={sizeItem.size} 
                                size="small" 
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        ) : (
                          "Standard"
                        )}
                      </TableCell>
                      <TableCell>
                        {deal.sizes && deal.sizes.length > 0 ? (
                          <Box>
                            <Typography variant="body2" color="error.main" sx={{ textDecoration: 'line-through' }}>
                              ${Math.min(...deal.sizes.map(s => s.originalCost))} - ${Math.max(...deal.sizes.map(s => s.originalCost))}
                            </Typography>
                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                              ${Math.min(...deal.sizes.map(s => s.discountPrice))} - ${Math.max(...deal.sizes.map(s => s.discountPrice))}
                            </Typography>
                          </Box>
                        ) : (
                          <>
                            <span style={{ textDecoration: 'line-through' }}>${deal.avgOriginalCost?.toFixed(2) || deal.originalCost}</span> / 
                            ${deal.avgDiscountPrice?.toFixed(2) || deal.discountPrice}
                          </>
                        )}
                      </TableCell>
                      <TableCell>{deal.minQtyForDiscount}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '70%', mb: 2, mt: 2, gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, (((deal.totalCommittedQuantity || 0) / deal.minQtyForDiscount) * 100) || 0)}
                            sx={{ height: 6, borderRadius: 2, width: '90%' }}
                          />
                          {(((deal.totalCommittedQuantity || 0) / deal.minQtyForDiscount) * 100) >= 100 && (
                            <CheckCircleIcon
                              sx={{
                                color: 'success.main'
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        {deal.bulkAction ? "Expired" : new Date(deal.dealEndsAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell sx={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
                        <IconButton onClick={(e) => handleMenuOpen(e, deal._id)}>
                          <MoreVert />
                        </IconButton>
                        <Menu
                          anchorEl={anchorElMap[deal._id]}
                          open={Boolean(anchorElMap[deal._id])}
                          onClose={() => handleMenuClose(deal._id)}
                        >
                          {location.pathname.includes("distributor") && [
                            <MenuItem key="edit" onClick={() => { handleEdit(deal); handleMenuClose(deal._id); }}>
                              <Edit sx={{ mr: 1 }} fontSize="small" /> Edit
                            </MenuItem>,
                            <MenuItem key="duplicate" onClick={() => { handleDuplicate(deal); handleMenuClose(deal._id); }}>
                              <ContentCopy sx={{ mr: 1 }} fontSize="small" /> Duplicate
                            </MenuItem>
                          ]}
                          <MenuItem onClick={() => { handleView(deal._id); handleMenuClose(deal._id); }}>
                            <Visibility sx={{ mr: 1 }} fontSize="small" /> View
                          </MenuItem>
                          {deal.bulkAction ? (
                            <MenuItem disabled>
                              <Chip 
                                label={deal.bulkStatus} 
                                color={deal.bulkStatus === "approved" ? "success" : "error"} 
                                variant="outlined" 
                              />
                            </MenuItem>
                          ) : (
                            <MenuItem onClick={() => { 
                              handleToggleChange(deal._id, deal.status); 
                              handleMenuClose(deal._id); 
                            }}>
                              <Switch
                                checked={deal.status === 'active'}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              {deal.status === 'active' ? 'Deactivate' : 'Activate'}
                            </MenuItem>
                          )}

                          {!deal.bulkAction && (
                            <MenuItem onClick={() => {handleDelete(deal._id); handleMenuClose(deal._id);}}>
                              <DeleteOutline sx={{ mr: 1 }} fontSize="small" /> Delete
                            </MenuItem>
                          )}
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
      
      {/* Only show pagination if we have deals */}
      {!loading && deals.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDeals.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Add Debug Dialog */}
      <Dialog
        open={debugDialog.open}
        onClose={handleCloseDebugDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>API Response Debug Data</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              This data shows the raw response from the API. Use it to troubleshoot issues with the deals display.
            </Typography>
          </Box>
          <Paper sx={{ p: 2, maxHeight: '400px', overflow: 'auto' }}>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {JSON.stringify(debugDialog.data, null, 2)}
            </pre>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDebugDialog} color="primary">
            Close
          </Button>
          <Button
            onClick={() => {
              // Create a Blob with the data
              const blob = new Blob([JSON.stringify(debugDialog.data, null, 2)], {
                type: 'application/json'
              });
              // Create a URL for the Blob
              const url = URL.createObjectURL(blob);
              // Create a temporary anchor element
              const a = document.createElement('a');
              a.href = url;
              a.download = 'deals-debug-data.json';
              // Trigger the download
              document.body.appendChild(a);
              a.click();
              // Clean up
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            color="primary"
          >
            Download JSON
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 'bold' }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {confirmDialog.content}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleConfirmDialogClose}
            color="inherit"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={confirmDialog.actionType === 'deleting' ? 'error' : 'primary'}
            variant="contained"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        handleClose={handleCloseToast}
      />

      {/* Add the Menu component for download options */}
      <Menu
        anchorEl={downloadAnchorEl}
        open={downloadMenuOpen}
        onClose={handleDownloadClose}
      >
        <MenuItem onClick={() => handleDownload('csv')}>Download as CSV</MenuItem>
        <MenuItem onClick={() => handleDownload('pdf')}>Download as PDF</MenuItem>
      </Menu>
    </Container>
  );
};

export default ManageDeals;
