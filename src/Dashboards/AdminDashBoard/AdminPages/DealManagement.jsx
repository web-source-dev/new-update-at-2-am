import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Container, Typography, Grid, TextField, IconButton, FormControl, InputLabel, Select, MenuItem,
  Button, Box, Tooltip, Menu, Card, CardMedia, CardContent, CardActions, Paper, TableContainer,
  Table, TableHead, TableRow, TableCell, TableBody, Switch, Pagination, TablePagination, Badge, Collapse
} from '@mui/material';
import { Search, Clear, Add, GetApp, ViewModule, ViewList, ViewComfy, Edit, Visibility, Delete, FilterAlt, ExpandLess, ExpandMore } from '@mui/icons-material';
import Toast from '../../../Components/Toast/Toast';
import { FilterTextField, FilterSelect, FilterFormControl } from '../../DashBoardComponents/FilterStyles';
import { Chip, Divider } from '@mui/material';
import { InputAdornment } from '@mui/material';
import { LinearProgress } from '@mui/material';
import { GridCardsSkeleton, TableSkeleton } from '../../../Components/Skeletons/LoadingSkeletons';

const DealsManagment = () => {
  const [deals, setDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [layout, setLayout] = useState('grid');
  const [anchorEl, setAnchorEl] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [filter, setFilter] = useState({ category: '', status: '', minPrice: '', maxPrice: '', search: '', sortBy: '' });
  const { userId } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/deals/fetchAll`);
        setDeals(response.data);
        const uniqueCategories = [...new Set(response.data.map(deal => deal.category))];
        setCategories(uniqueCategories);
        setLoading(false);
      } catch (error) {
        setToast({
          open: true,
          message: 'Error fetching deals',
          severity: 'error'
        });
        console.error('Error fetching deals:', error);
        setLoading(false);
      }
    };

    fetchDeals();
  }, [userId]);

  useEffect(() => {
    const count = Object.values(filter).filter(value => value !== '').length;
    setActiveFilters(count);
  }, [filter]);

  const handleDelete = async (dealId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/deals/delete/${dealId}`);
      setDeals(deals.filter(deal => deal._id !== dealId));
      setToast({
        open: true,
        message: 'Deal deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setToast({
        open: true,
        message: 'Error deleting deal',
        severity: 'error'
      });
      console.error('Error deleting deal:', error);
    }
  };

  const handleToggleChange = async (dealId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await axios.patch(`${process.env.REACT_APP_BACKEND_URL}/deals/update-status/${dealId}/status`, { status: newStatus });
      setDeals(deals.map(deal => deal._id === dealId ? response.data : deal));
      setToast({
        open: true,
        message: `Deal ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
        severity: 'success'
      });
    } catch (error) {
      setToast({
        open: true,
        message: 'Error updating deal status',
        severity: 'error'
      });
      console.error('Error updating deal status:', error);
    }
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

  const handleEdit = (deal) => {
    navigate(`/dashboard/distributor/edit-deal/${deal._id}`, { state: { deal } });
  };

  const handleView = (dealId) => {
    navigate(`/distributor/view-deal/${dealId}`);
  };

  const handleDownloadClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDownloadClose = () => {
    setAnchorEl(null);
  };

  const user_role = localStorage.getItem('user_role');
  const handleDownload = (format) => {
    const filteredData = deals.filter(deal => {
      return (
        (filter.category ? deal.category === filter.category : true) &&
        (filter.status ? deal.status === filter.status : true) &&
        (filter.minPrice ? deal.discountPrice >= filter.minPrice : true) &&
        (filter.maxPrice ? deal.discountPrice <= filter.maxPrice : true) &&
        (filter.search ? deal.name.toLowerCase().includes(filter.search.toLowerCase()) : true)
      );
    }).sort((a, b) => {
      if (filter.sortBy === 'price') {
        if (filter.sortBy === 'asc') {
          return a.discountPrice - b.discountPrice;
        }
        return b.discountPrice - a.discountPrice;
      } else if (filter.sortBy === 'nameAsc') {
        return a.name.localeCompare(b.name);
      } else if (filter.sortBy === 'nameDesc') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    if (format === 'csv') {
      const csvContent = [
        ['Name', 'Description', 'Size', 'Original Cost', 'Discount Price', 'Category', 'Status', 'Min Qty For Discount', 'Total Sold', 'Total Revenue', 'Views', 'Impressions'],
        ...filteredData.map(deal => Object.values(deal)),
      ]
        .map(e => e.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'deals.csv');
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text('Deals', 20, 10);
      doc.autoTable({
        head: [['Name', 'Description', 'Size', 'Original Cost', 'Discount Price', 'Category', 'Status', 'Min Qty For Discount', 'Total Sold', 'Total Revenue', 'Views', 'Impressions']],
        body: filteredData.map(deal => Object.values(deal)),
      });
      doc.save('deals.pdf');
    }

    handleDownloadClose();
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
    if (filter.sortBy === 'price') {
      if (filter.sortBy === 'asc') {
        return a.discountPrice - b.discountPrice;
      }
      return b.discountPrice - a.discountPrice;
    } else if (filter.sortBy === 'nameAsc') {
      return a.name.localeCompare(b.name);
    } else if (filter.sortBy === 'nameDesc') {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

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

  if (loading) {
    return layout === 'grid' ? (
      <GridCardsSkeleton count={8} xs={12} sm={6} md={4} lg={3} />
    ) : (
      <TableSkeleton columnsNum={8} />
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Manage Deals
      </Typography>
      <Paper sx={{ mb: 3, p: 2 }}>
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
                    {['Active Deals', 'Inactive Deals', 'High Price', 'Low Price'].map((label) => (
                      <Chip
                        key={label}
                        label={label}
                        onClick={() => {
                          if (label === 'Active Deals') {
                            setFilter(prev => ({ ...prev, status: 'active' }));
                          } else if (label === 'Inactive Deals') {
                            setFilter(prev => ({ ...prev, status: 'inactive' }));
                          } else if (label === 'High Price') {
                            setFilter(prev => ({ ...prev, sortBy: 'price' }));
                          } else if (label === 'Low Price') {
                            setFilter(prev => ({ ...prev, sortBy: 'price', sortOrder: 'asc' }));
                          }
                        }}
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
                  placeholder="Search by name or description..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
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

              <Grid item xs={12} sm={6} md={4}>
                <FilterFormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <FilterSelect
                    value={filter.status}
                    onChange={handleFilterChange}
                    label="Status"
                    name="status"
                  >
                    <MenuItem value=""><em>All Status</em></MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </FilterSelect>
                </FilterFormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Price Range & Sorting
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FilterTextField
                      label="Min Price"
                      name="minPrice"
                      type="number"
                      value={filter.minPrice}
                      onChange={handleFilterChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FilterTextField
                      label="Max Price"
                      name="maxPrice"
                      type="number"
                      value={filter.maxPrice}
                      onChange={handleFilterChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FilterFormControl fullWidth>
                      <InputLabel>Sort By</InputLabel>
                      <FilterSelect
                        value={filter.sortBy}
                        onChange={handleFilterChange}
                        label="Sort By"
                        name="sortBy"
                      >
                        <MenuItem value=""><em>None</em></MenuItem>
                        <MenuItem value="price">Price</MenuItem>
                        <MenuItem value="nameAsc">Name: A to Z</MenuItem>
                        <MenuItem value="nameDesc">Name: Z to A</MenuItem>
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
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {filter.category && (
            <Chip
              label={`Category: ${filter.category}`}
              onDelete={() => setFilter(prev => ({ ...prev, category: '' }))}
              color="primary"
              variant="outlined"
            />
          )}
          {filter.status && (
            <Chip
              label={`Status: ${filter.status}`}
              onDelete={() => setFilter(prev => ({ ...prev, status: '' }))}
              color="primary"
              variant="outlined"
            />
          )}
          {filter.minPrice && (
            <Chip
              label={`Min Price: $${filter.minPrice}`}
              onDelete={() => setFilter(prev => ({ ...prev, minPrice: '' }))}
              color="primary"
              variant="outlined"
            />
          )}
          {filter.maxPrice && (
            <Chip
              label={`Max Price: $${filter.maxPrice}`}
              onDelete={() => setFilter(prev => ({ ...prev, maxPrice: '' }))}
              color="primary"
              variant="outlined"
            />
          )}
          {filter.search && (
            <Chip
              label={`Search: ${filter.search}`}
              onDelete={() => setFilter(prev => ({ ...prev, search: '' }))}
              color="primary"
              variant="outlined"
            />
          )}
          {filter.sortBy && (
            <Chip
              label={`Sort: ${filter.sortBy === 'price' ? 'Price' : 
                             filter.sortBy === 'nameAsc' ? 'Name A to Z' : 'Name Z to A'}`}
              onDelete={() => setFilter(prev => ({ ...prev, sortBy: '' }))}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      )}
      <Grid container spacing={2} style={{ marginBottom: '1rem' }}>
        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'end' }}>
          <Box>
            <Tooltip title="Add New Deal">
              {user_role === 'distributor' && (
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
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleDownloadClose}
            >
              <MenuItem onClick={() => handleDownload('csv')}>Download CSV</MenuItem>
              <MenuItem onClick={() => handleDownload('pdf')}>Download PDF</MenuItem>
            </Menu>
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
        </Grid>
      </Grid>
      {layout === 'grid' && (
  <Grid container spacing={3}>
    {paginatedDeals.map((deal) => (
      <Grid item xs={12} sm={6} md={4} key={deal._id}>
        <Card sx={{ 
          borderRadius: 5, 
          boxShadow: 6, 
          overflow: "hidden", 
          position: 'relative', 
          transition: 'transform 0.3s, box-shadow 0.3s', 
          '&:hover': { 
            transform: 'scale(1.03)', 
            boxShadow: 10 
          }, 
          bgcolor: '#ffffff' 
        }}>
          {/* Product Image */}
          <CardMedia
            component="img"
            image={deal.images[0] || "https://via.placeholder.com/300"}
            alt={deal.name}
            sx={{ width: '100%', height: 180, objectFit: "cover", borderRadius: '10px 10px 0 0' }}
          />

          <CardContent sx={{ p: 3, bgcolor: 'linear-gradient(135deg, #eef2ff 0%, #d9e2ff 100%)' }}>
            {/* Distributor Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {deal.distributor.logo ? (
                <CardMedia
                  component="img"
                  height="45"
                  image={deal.distributor.logo}
                  alt={deal?.distributor?.name}
                  sx={{ width: 45, borderRadius: '50%', mr: 2, border: '2px solid #ddd' }}
                />
              ) : (
                <Box
                  sx={{
                    width: 45,
                    height: 45,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: 20,
                  }}
                >
                  {deal.distributor?.name ? deal.distributor.name.charAt(0) : 'N/A'}
                </Box>
              )}
              <Tooltip title={deal.distributor.email}>
                <Typography variant="body2" color="text.secondary">
                  {deal?.distributor?.name}
                </Typography>
              </Tooltip>
            </Box>

            {/* Product Name */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {deal.name}
            </Typography>

            {/* Description */}
            <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', WebkitLineClamp: 2, mb: 2 }}>
              {deal.description}
            </Typography>

            {/* Pricing Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="error.main" sx={{ textDecoration: 'line-through', fontSize: 14, mr: 1 }}>
                ${deal.originalCost}
              </Typography>
              <Typography variant="body2" color="green" fontWeight="bold" sx={{ fontSize: 16 }}>
                ${deal.discountPrice}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 14, ml: 1, bgcolor: 'green', color: 'white', px: 1, borderRadius: 1 }}>
                -{Math.round(((deal.originalCost - deal.discountPrice) / deal.originalCost) * 100)}%
              </Typography>
            </Box>

            {/* Extra Deal Info */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Min Qty: {deal.minQtyForDiscount}</Typography>
              <Typography variant="body2" color="text.secondary">Sold: {deal.totalSold} units</Typography>
              <Typography variant="body2" color="text.secondary">Revenue: ${deal.totalRevenue}</Typography>
              <Typography variant="body2" color="text.secondary">Views: {deal.views}</Typography>
              <Typography variant="body2" color="text.secondary">Impressions: {deal.impressions}</Typography>
            </Box>

            {/* Progress Bar for Sold Units */}
            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Deal Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(deal.totalSold / deal.minQtyForDiscount) * 100}
                sx={{ height: 6, borderRadius: 2 }}
              />
            </Box>

            {/* Deal Expiry */}
            <Typography variant="body2" color="error.main" fontWeight="bold">
              Ends at: {new Date(deal.dealEndsAt).toLocaleString()}
            </Typography>
          </CardContent>

          {/* Action Buttons */}
          <CardActions sx={{ display: "flex", justifyContent: "center", p: 2, gap: 2 }}>
            {user_role === 'distributor' && (
              <Tooltip title="Edit">
                <Button variant="contained" color="primary" size="small" onClick={() => handleEdit(deal)}>
                  <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
                </Button>
              </Tooltip>
            )}
            <Tooltip title="View">
              <Button variant="outlined" color="info" size="small" onClick={() => handleView(deal._id)}>
                <Visibility fontSize="small" sx={{ mr: 1 }} /> View
              </Button>
            </Tooltip>
            <Tooltip title={deal.status === 'active' ? 'Deactivate' : 'Activate'}>
              <Switch
                checked={deal.status === 'active'}
                onChange={() => handleToggleChange(deal._id, deal.status)}
                color="primary"
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button variant="contained" color="error" size="small" onClick={() => handleDelete(deal._id)}>
                <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
              </Button>
            </Tooltip>
          </CardActions>
        </Card>
      </Grid>
    ))}
  </Grid>
)}

      {layout === 'list' && (
        <Box>
          {paginatedDeals.map((deal) => (
            <Paper key={deal._id} sx={{ mb: 2, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 2, transition: 'background-color 0.2s', '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CardMedia
                  component="img"
                  height={80}
                  image={deal.images[0] || "https://via.placeholder.com/300"}
                  alt={deal.name}
                  sx={{ objectFit: "cover", width: 80, mr: 2 }}
                />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {deal.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {deal.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Original Price: ${deal.originalCost} | Discounted Price: ${deal.discountPrice}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title="View">
                  <IconButton color="info" onClick={() => handleView(deal._id)}>
                    <Visibility />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton color="error" onClick={() => handleDelete(deal._id)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
      {layout === 'table' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow bgcolor="info.main">
                <TableCell sx={{ color: '#fff' }}><strong>Image</strong></TableCell>
                <TableCell sx={{ color: '#fff' }}><strong>Name</strong></TableCell>
                <TableCell sx={{ color: '#fff' }}><strong>Description</strong></TableCell>
                <TableCell sx={{ color: '#fff' }}><strong>Size</strong></TableCell>
                <TableCell sx={{ color: '#fff' }}><strong>Original Cost</strong></TableCell>
                <TableCell sx={{ color: '#fff' }}><strong>Discount Price</strong></TableCell>
                <TableCell sx={{ color: '#fff' }}><strong>Min Qty For Discount</strong></TableCell>
                <TableCell sx={{ color: '#fff' }}><strong>Category</strong></TableCell>
                <TableCell sx={{ color: '#fff' }}><strong>Status</strong></TableCell>
                <TableCell sx={{ color: '#fff' }}><strong>Total Sold</strong></TableCell>
                <TableCell sx={{ color: '#fff' }}><strong>Total Revenue</strong></TableCell>
                <TableCell sx={{ color: '#fff' }}><strong>Views</strong></TableCell>
                <TableCell sx={{ color: '#fff' }}><strong>Impressions</strong></TableCell>
                <TableCell sx={{ color: '#fff' }}><strong>Ends At</strong></TableCell>
                <TableCell sx={{ color: '#fff' }}><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDeals.map((deal, index) => (
                <TableRow key={deal._id} sx={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white', '&:hover': { backgroundColor: '#e0e0e0' }, height: '60px' }}>
                  <TableCell sx={{ padding: '16px', border: '1px solid #e0e0e0' }}>
                    <CardMedia
                      component="img"
                      height="80"
                      image={deal.images[0] || "https://via.placeholder.com/300"}
                      alt={deal.name}
                      sx={{ objectFit: "cover", width: 80 }}
                    />
                  </TableCell>
                  <TableCell sx={{ padding: '16px', border: '1px solid #e0e0e0' }}>{deal.name}</TableCell>
                  <TableCell sx={{ padding: '16px', border: '1px solid #e0e0e0', display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', WebkitLineClamp: 2 }}>
                    {deal.description}
                  </TableCell>
                  <TableCell sx={{ padding: '16px', border: '1px solid #e0e0e0' }}>{deal.size}</TableCell>
                  <TableCell sx={{ padding: '16px', border: '1px solid #e0e0e0' }}>${deal.originalCost}</TableCell>
                  <TableCell sx={{ padding: '16px', border: '1px solid #e0e0e0' }}>${deal.discountPrice}</TableCell>
                  <TableCell sx={{ padding: '16px', border: '1px solid #e0e0e0' }}>{deal.minQtyForDiscount}</TableCell>
                  <TableCell sx={{ padding: '16px', border: '1px solid #e0e0e0' }}>{deal.category}</TableCell>
                  <TableCell sx={{ padding: '16px', border: '1px solid #e0e0e0' }}>{deal.status}</TableCell>
                  <TableCell sx={{ padding: '16px', border: '1px solid #e0e0e0' }}>{deal.totalSold}</TableCell>
                  <TableCell sx={{ padding: '16px', border: '1px solid #e0e0e0' }}>${deal.totalRevenue}</TableCell>
                  <TableCell sx={{ padding: '16px', border: '1px solid #e0e0e0' }}>{deal.views}</TableCell>
                  <TableCell sx={{ padding: '16px', border: '1px solid #e0e0e0' }}>{deal.impressions}</TableCell>
                  <TableCell sx={{ padding: '16px', border: '1px solid #e0e0e0' }}>{new Date(deal.dealEndsAt).toLocaleString()}</TableCell>
                  <TableCell sx={{ padding: '16px', border: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {user_role === 'distributor' && (
                        <Tooltip title="Edit">
                          <IconButton color="primary" onClick={() => handleEdit(deal)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="View">
                        <IconButton color="info" onClick={() => handleView(deal._id)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDelete(deal._id)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box sx={{ 
        mt: 4, 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
        bgcolor: 'background.paper',
        p: 2,
        borderRadius: 2,
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      }}>
        <TablePagination
          component="div"
          count={filteredDeals.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20, 30, 40, 50]}
          labelRowsPerPage="Items per page:"
          sx={{
            '.MuiTablePagination-select': {
              borderRadius: 1,
              bgcolor: 'background.paper',
            },
            '.MuiTablePagination-selectIcon': {
              color: 'primary.main',
            },
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
              borderRadius: 1,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
            },
          }}
        />
      </Box>
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        handleClose={handleCloseToast}
      />
    </Container>
  );
};

export default DealsManagment;