import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Box, Button, IconButton, InputLabel, Skeleton,MenuItem, Card, CardContent, CardMedia, CardActions, Tooltip, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Menu, MenuItem as DropdownMenuItem, Badge, Collapse, Chip, Divider, InputAdornment, TablePagination } from '@mui/material';
import { Edit, Delete, Search, Clear, Visibility, ViewModule, ViewList, ViewComfy, Add, GetApp, FilterAlt, ExpandLess, ExpandMore } from '@mui/icons-material';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Toast from '../../../Components/Toast/Toast';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import useMediaQuery from '@mui/material/useMediaQuery';
import { FilterTextField, FilterSelect, FilterFormControl } from '../../DashBoardComponents/FilterStyles';
import { GridCardsSkeleton, TableSkeleton } from '../../../Components/Skeletons/LoadingSkeletons';

const ManageDeals = () => {
  const [deals, setDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [layout, setLayout] = useState('grid');
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success'
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

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/deals/fetch/${userId}`);
        // Update to handle the new response structure
        const dealsData = response.data.deals || response.data;
        setDeals(Array.isArray(dealsData) ? dealsData : []);
        const uniqueCategories = [...new Set(dealsData.map(deal => deal.category))];
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

    if (userId) {  // Only fetch if userId is available
      fetchDeals();
    }
  }, [userId]);

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
                          onClick={() => handleFilterChange({ target: { name: 'category', value: cat }})}
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
                onDelete={() => handleFilterChange({ target: { name: 'search', value: '' }})}
                color="primary"
                variant="outlined"
              />
            )}
            {filter.category && (
              <Chip
                label={`Category: ${filter.category}`}
                onDelete={() => handleFilterChange({ target: { name: 'category', value: '' }})}
                color="primary"
                variant="outlined"
              />
            )}
            {filter.status && (
              <Chip
                label={`Status: ${filter.status}`}
                onDelete={() => handleFilterChange({ target: { name: 'status', value: '' }})}
                color="primary"
                variant="outlined"
              />
            )}
            {filter.minPrice && (
              <Chip
                label={`Min Price: $${filter.minPrice}`}
                onDelete={() => handleFilterChange({ target: { name: 'minPrice', value: '' }})}
                color="primary"
                variant="outlined"
              />
            )}
            {filter.maxPrice && (
              <Chip
                label={`Max Price: $${filter.maxPrice}`}
                onDelete={() => handleFilterChange({ target: { name: 'maxPrice', value: '' }})}
                color="primary"
                variant="outlined"
              />
            )}
            {filter.sortBy && (
              <Chip
                label={`Sorted by: ${filter.sortBy.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                onDelete={() => handleFilterChange({ target: { name: 'sortBy', value: '' }})}
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
              <Card sx={{ borderRadius: 3, boxShadow: 4, overflow: "hidden", position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={deal.images[0] || "https://via.placeholder.com/300"}
                  alt={deal.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {deal.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {deal.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Original: ${deal.originalCost}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ color: 'success.main' }}>
                    Discounted: ${deal.discountPrice}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Size: {deal.size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Min Qty for Discount: {deal.minQtyForDiscount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sold: {deal.totalSold} units
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue: ${deal.totalRevenue}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Views: {deal.views}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Impressions: {deal.impressions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ends at: {new Date(deal.dealEndsAt).toLocaleString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ display: "flex", justifyContent: "space-between" }}>
                  {(location.pathname.includes("distributor")) && (
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
            <Paper key={deal._id} sx={{ mb: 2, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CardMedia
                  component="img"
                  height="80"
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
                    Original: ${deal.originalCost}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ color: 'success.main' }}>
                    Discounted: ${deal.discountPrice}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Size: {deal.size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Min Qty for Discount: {deal.minQtyForDiscount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sold: {deal.totalSold} units
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue: ${deal.totalRevenue}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Views: {deal.views}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Impressions: {deal.impressions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ends at: {new Date(deal.dealEndsAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              {isMobile ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                  {(location.pathname.includes("distributor")) && (
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
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {(location.pathname.includes("distributor")) && (
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
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      )}
      {layout === 'table' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Original Cost</TableCell>
                <TableCell>Discounted Cost</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Min Qty for Discount</TableCell>
                <TableCell>Total Sold</TableCell>
                <TableCell>Total Revenue</TableCell>
                <TableCell>Views</TableCell>
                <TableCell>Impressions</TableCell>
                <TableCell>Ends At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentDeals.map((deal) => (
                <TableRow key={deal._id}>
                  <TableCell>
                    <CardMedia
                      component="img"
                      height="80"
                      image={deal.images[0] || "https://via.placeholder.com/300"}
                      alt={deal.name}
                      sx={{ objectFit: "cover", width: 80 }}
                    />
                  </TableCell>
                  <TableCell>{deal.name}</TableCell>
                  <TableCell>{deal.category}</TableCell>
                  <TableCell>${deal.originalCost}</TableCell>
                  <TableCell>${deal.discountPrice}</TableCell>
                  <TableCell>{deal.size}</TableCell>
                  <TableCell>{deal.minQtyForDiscount}</TableCell>
                  <TableCell>{deal.totalSold}</TableCell>
                  <TableCell>${deal.totalRevenue}</TableCell>
                  <TableCell>{deal.views}</TableCell>
                  <TableCell>{deal.impressions}</TableCell>
                  <TableCell>{new Date(deal.dealEndsAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Switch
                      checked={deal.status === 'active'}
                      onChange={() => handleToggleChange(deal._id, deal.status)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    {(location.pathname.includes("distributor")) && (
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