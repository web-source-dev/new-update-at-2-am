import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Box, Button, IconButton, InputLabel, Skeleton, MenuItem, Card, CardContent, CardMedia, CardActions, Tooltip, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Menu, MenuItem as DropdownMenuItem, Badge, Collapse, Chip, Divider, InputAdornment, TablePagination, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Edit, Delete, Search, Clear, Visibility, ViewModule, ViewList, ViewComfy, Add, GetApp, FilterAlt, ExpandLess, ExpandMore, ContentCopy, MoreVert } from '@mui/icons-material';
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

  const location = useLocation();
  const [filter, setFilter] = useState({
    category: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sortBy: ''
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
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/deals/fetch/${userId}`);
        const dealsData = response.data.deals || response.data;
        setDeals(Array.isArray(dealsData) ? dealsData : []);
      } catch (error) {
        console.error('Error fetching deals:', error);
        setToast({
          open: true,
          message: 'Error refreshing deals list',
          severity: 'error'
        });
      }
    };

    if (userId) {  // Only fetch if userId is available
      fetchDeals();
    }
  }, [userId, location.key]);

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
          await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/deals/delete/${dealId}`);
          setDeals(deals.filter(deal => deal._id !== dealId));
          setToast({
            open: true,
            message: 'Deal deleted successfully',
            severity: 'success'
          });
        } catch (error) {
          throw error;
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
    setFilter({ category: '', status: '', minPrice: '', maxPrice: '', search: '', sortBy: '' });
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
    const filteredData = deals.map(deal => ({
      'Name': deal.name,
      'Description': deal.description,
      'Size': deal.size,
      'Original Cost': deal.originalCost,
      'Discount Price': deal.discountPrice,
      'Min Qty for Discount': deal.minQtyForDiscount,
      'Category': deal.category,
      'Status': deal.status,
      'Total Sold': deal.totalSold,
      'Total Revenue': deal.totalRevenue,
      'Views': deal.views,
      'Impressions': deal.impressions
    }));

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

                <Grid item xs={12} md={6}>
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

                <Grid item xs={12} md={6}>
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
    <Container>
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
        </Box>
      </Box>

      <FiltersContent />

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
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Price: <span style={{ textDecoration: 'line-through' }}>${deal.originalCost}</span> / ${deal.discountPrice}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Views: {deal.views}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Min Qty for Deal: {deal.minQtyForDiscount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Commits: {deal.commitments.length}
                      </Typography>

                    </Grid>
                  </Grid>
           <Typography variant="body2" color="text.secondary">
                        Deal Progress : {deal.totalCommitmentQuantity} / {deal.minQtyForDiscount}
                      </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 2, mt: 2, gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, ((deal.totalCommitmentQuantity || 0) / deal.minQtyForDiscount) * 100)}
                      sx={{ height: 6, borderRadius: 2, width: '90%' }}
                    />

                    {((deal.totalCommitmentQuantity || 0) / deal.minQtyForDiscount) * 100 >= 100 && (
                      <CheckCircleIcon
                        sx={{
                          color: 'success.main'
                        }}
                      />
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Ends: {new Date(deal.dealEndsAt).toLocaleString()}
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
                  <Tooltip title={deal.status === 'active' ? 'Deactivate' : 'Activate'}>
                    <Switch
                      checked={deal.status === 'active'}
                      onChange={() => handleToggleChange(deal._id, deal.status)}
                      color="primary"
                    />
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(deal._id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
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
                      <Typography variant="body2" color="text.secondary">
                        Price: <span style={{ textDecoration: 'line-through' }}>${deal.originalCost}</span> / ${deal.discountPrice}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Min Qty for Deal: {deal.minQtyForDiscount}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Deal Progress : {deal.totalCommitmentQuantity} / {deal.minQtyForDiscount}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '70%', mb: 2, mt: 2, gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, ((deal.totalCommitmentQuantity || 0) / deal.minQtyForDiscount) * 100)}
                          sx={{ height: 6, borderRadius: 2, width: '90%' }}
                        />
                        {((deal.totalCommitmentQuantity || 0) / deal.minQtyForDiscount) * 100 >= 100 && (
                          <CheckCircleIcon
                            sx={{
                              color: 'success.main'
                            }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Ends: {new Date(deal.dealEndsAt).toLocaleString()}
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
                  <MenuItem onClick={() => { handleToggleChange(deal._id, deal.status); handleMenuClose(deal._id); }}>
                    <Switch
                      checked={deal.status === 'active'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {deal.status === 'active' ? 'Deactivate' : 'Activate'}
                  </MenuItem>
                  <MenuItem onClick={() => { handleDelete(deal._id); handleMenuClose(deal._id); }}>
                    <Delete sx={{ mr: 1 }} fontSize="small" color="error" /> Delete
                  </MenuItem>
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
                  <TableCell> <span style={{ textDecoration: 'line-through' }}>${deal.originalCost}</span> / ${deal.discountPrice}</TableCell>
                  <TableCell>{deal.minQtyForDiscount}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '70%', mb: 2, mt: 2, gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, ((deal.totalCommitmentQuantity || 0) / deal.minQtyForDiscount) * 100)}
                        sx={{ height: 6, borderRadius: 2, width: '90%' }}
                      />
                      {((deal.totalCommitmentQuantity || 0) / deal.minQtyForDiscount) * 100 >= 100 && (
                        <CheckCircleIcon
                          sx={{
                            color: 'success.main'
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>


                  <TableCell>{new Date(deal.dealEndsAt).toLocaleString().split(',')[0]}</TableCell>
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
                      <MenuItem onClick={() => { handleToggleChange(deal._id, deal.status); handleMenuClose(deal._id); }}>
                        <Switch
                          checked={deal.status === 'active'}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        {deal.status === 'active' ? 'Deactivate' : 'Activate'}
                      </MenuItem>
                      <MenuItem onClick={() => { handleDelete(deal._id); handleMenuClose(deal._id); }}>
                        <Delete sx={{ mr: 1 }} fontSize="small" color="error" /> Delete
                      </MenuItem>
                    </Menu>
                  </TableCell>


                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination Component */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredDeals.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

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
