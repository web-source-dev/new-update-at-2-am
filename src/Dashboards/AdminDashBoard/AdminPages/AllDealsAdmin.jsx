import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Table,
  Tooltip,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Pagination,
  Stack,
  Grid,
  Menu,
  IconButton,
  ListItemIcon,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { 
  Check as CheckIcon, 
  Close as CloseIcon, 
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  GetApp,
  Analytics as AnalyticsIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material';

// Add debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Add the StyledTableCell component
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    padding: '8px 4px',
    '&:first-of-type': {
      paddingLeft: 8,
    },
    '&:last-of-type': {
      paddingRight: 8,
    },
  },
}));

const AllDealsAdmin = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [selectedCommitments, setSelectedCommitments] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [selectAllDeals, setSelectAllDeals] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState(null);
  const downloadMenuOpen = Boolean(downloadAnchorEl);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    content: '',
    action: null,
    actionType: '',
    data: null
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDealId, setSelectedDealId] = useState(null);
  
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];
  const currentMonthValue = new Date().getMonth() + 1;

  // Find the corresponding month object
  const currentMonth = months.find(month => month.value === currentMonthValue) || months[0];

  // State for filters and pagination
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.value);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [distributors, setDistributors] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState('');

  const navigate = useNavigate();

  // Create a debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setSearchTerm(searchValue);
    }, 500),  // 500ms delay
    []
  );

  useEffect(() => {
    fetchDeals();
    fetchDistributors();
  }, [page, searchTerm, selectedMonth, selectedStatus, startDate, endDate, selectedDistributor]);

  // Update selectedDeals when selectAllDeals changes
  useEffect(() => {
    if (deals.length > 0) {
      if (selectAllDeals) {
        setSelectedDeals(deals.filter(deal => deal.pendingCommitments > 0).map(deal => deal._id));
      } else {
        setSelectedDeals([]);
      }
    }
  }, [selectAllDeals, deals]);

  // Update selectedCommitments when selectAll changes
  useEffect(() => {
    if (selectedDeal?.detailedCommitments) {
      if (selectAll) {
        const pendingCommitmentIds = selectedDeal.detailedCommitments
          .filter(c => c.status === 'pending')
          .map(c => c._id);
        setSelectedCommitments(pendingCommitmentIds);
      } else {
        setSelectedCommitments([]);
      }
    }
  }, [selectAll, selectedDeal]);

  const fetchDistributors = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/distributor-list`);
      setDistributors(response.data.distributors || []);
    } catch (err) {
      console.error('Error fetching distributors:', err);
    }
  };

  const fetchDeals = async () => {
    try {
      setLoading(true);
      let url = `${process.env.REACT_APP_BACKEND_URL}/deals/allDeals/admin-all-deals?page=${page}&limit=${limit}`;

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      if (selectedMonth) {
        url += `&month=${selectedMonth}`;
      } else {
        // Explicitly add empty month parameter when "All Months" is selected
        url += `&month=`;
      }

      if (selectedStatus) {
        url += `&commitmentStatus=${selectedStatus}`;
      }

      if (startDate && endDate) {
        url += `&startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`;
      }

      if (selectedDistributor) {
        url += `&distributorId=${selectedDistributor}`;
      }

      const response = await axios.get(url);
      setDeals(response.data.deals);
      console.log("response of all deals" , response)
      setTotalPages(response.data.pagination.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch deals. Please try again later.');
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update the search handler
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchInput(value);  // Update the input field immediately
    debouncedSearch(value);  // Debounce the actual search
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    setPage(1);
    setStartDate(null);
    setEndDate(null);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
    setPage(1);
  };

  const handleDistributorChange = (event) => {
    setSelectedDistributor(event.target.value);
    setPage(1);
  };

  const handleDateChange = (date, isStart) => {
    if (isStart) {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
    setSelectedMonth('');
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleViewCommitments = async (deal) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/deals/allDeals/deal-commitments/${deal._id}`);
      setSelectedDeal({
        ...deal,
        detailedCommitments: response.data.commitments
      });
      setOpenDialog(true);
      setSelectedCommitments([]);
      setSelectAll(false);
    } catch (err) {
      console.error('Error fetching commitments:', err);
    }
  };

  const handleBulkAction = async (dealId, action) => {
    if (actionInProgress) return;
    
    const deal = deals.find(d => d._id === dealId);
    const actionText = action === 'approve' ? 'approve' : 'decline';
    
    handleConfirmDialogOpen(
      `Confirm ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      `Are you sure you want to ${actionText} all pending commitments for "${deal.name}"?`,
      async () => {
        try {
          setActionInProgress(true);
          setSelectedActionType(action);
          const endpoint = action === 'approve' ? 'bulk-approve-commitments' : 'bulk-decline-commitments';
          
          await axios.post(`${process.env.REACT_APP_BACKEND_URL}/deals/allDeals/${endpoint}`, {
            dealId,
            distributorId: deal.distributor._id
          });

          await fetchDeals();
        } catch (err) {
          console.error(`Error ${action}ing commitments:`, err);
        } finally {
          setActionInProgress(false);
          setSelectedActionType(null);
          setOpenDialog(false);
        }
      },
      'single-deal-action'
    );
  };

  const handleBulkDealsAction = async (action) => {
    if (selectedDeals.length === 0 || actionInProgress) return;

    const actionText = action === 'approve' ? 'approve' : 'decline';
    handleConfirmDialogOpen(
      `Confirm Bulk ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      `Are you sure you want to ${actionText} all selected deals? This will affect ${selectedDeals.length} deals.`,
      async () => {
        try {
          setActionInProgress(true);
          setSelectedActionType(action);
          const endpoint = action === 'approve' ? 'bulk-approve-commitments' : 'bulk-decline-commitments';

          await Promise.all(selectedDeals.map(dealId => {
            const deal = deals.find(d => d._id === dealId);
            return axios.post(`${process.env.REACT_APP_BACKEND_URL}/deals/allDeals/${endpoint}`, {
              dealId,
              distributorId: deal.distributor._id
            });
          }));

          await fetchDeals();
          setSelectedDeals([]);
          setSelectAllDeals(false);
        } catch (err) {
          console.error(`Error processing selected deals:`, err);
        } finally {
          setActionInProgress(false);
          setSelectedActionType(null);
        }
      },
      'bulk-action'
    );
  };

  const handleDealSelect = (dealId) => {
    setSelectedDeals(prev => {
      const isSelected = prev.includes(dealId);
      if (isSelected) {
        return prev.filter(id => id !== dealId);
      } else {
        return [...prev, dealId];
      }
    });
  };

  const handleCommitmentSelect = (commitmentId) => {
    setSelectedCommitments(prev => {
      const isSelected = prev.includes(commitmentId);
      if (isSelected) {
        return prev.filter(id => id !== commitmentId);
      } else {
        return [...prev, commitmentId];
      }
    });
  };


  const handleDownloadClick = (event) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleDownloadClose = () => {
    setDownloadAnchorEl(null);
  };

  const handleExport = async (format) => {
    if (exportLoading) return;
    setExportLoading(true);
    try {
      const filteredData = deals.map(deal => {
        // Get size info if available
        const sizeInfo = deal.sizes && deal.sizes.length > 0 
          ? deal.sizes.map(s => `${s.size}: $${s.discountPrice}`).join(', ')
          : 'N/A';
        
        // Get discount tier info if available
        const discountInfo = deal.discountTiers && deal.discountTiers.length > 0
          ? deal.discountTiers.map(dt => `${dt.tierDiscount}% at ${dt.tierQuantity}+ units`).join(', ')
          : 'N/A';

        return {
          'Deal Name': deal.name,
          'Distributor': deal.distributor ? (deal.distributor.businessName || deal.distributor.name) : 'Unknown',
          'Category': deal.category,
          'Size Options': sizeInfo,
          'Discount Tiers': discountInfo,
          'Total Commitments': deal.totalCommitments,
          'Minimum Quantity': deal.minimumQuantity,
          'Quantity Committed': deal.totalQuantity,
          'Total Amount': `$${deal.totalAmount.toFixed(2)}`,
        };
      });

      if (format === 'csv') {
        await exportToCSV(filteredData);
      } else if (format === 'pdf') {
        await exportToPDF(filteredData);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setExportLoading(false);
      handleDownloadClose();
    }
  };

  const exportToCSV = (data) => {
    // Create CSV headers
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values that contain commas by wrapping in quotes
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        }).join(',')
      )
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `all-distributor-deals-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    saveAs(blob, fileName);
  };

  const exportToPDF = (data) => {
    const doc = new jsPDF();
    const fileName = `all-distributor-deals-${format(new Date(), 'yyyy-MM-dd')}.pdf`;

    // Add title
    doc.setFontSize(16);
    doc.text('All Distributor Deals Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, 22);

    // Add filters information if any are active
    let yPos = 30;
    if (searchTerm || selectedMonth || selectedStatus || (startDate && endDate) || selectedDistributor) {
      doc.setFontSize(12);
      doc.text('Applied Filters:', 14, yPos);
      yPos += 7;
      doc.setFontSize(10);

      if (searchTerm) {
        doc.text(`Search: ${searchTerm}`, 14, yPos);
        yPos += 5;
      }
      if (selectedMonth) {
        const monthName = months.find(m => m.value === selectedMonth)?.label;
        doc.text(`Month: ${monthName}`, 14, yPos);
        yPos += 5;
      }
      if (startDate && endDate) {
        doc.text(`Date Range: ${format(startDate, 'PP')} - ${format(endDate, 'PP')}`, 14, yPos);
        yPos += 5;
      }
      if (selectedDistributor) {
        const distributor = distributors.find(d => d._id === selectedDistributor);
        const distributorName = distributor ? (distributor.businessName || distributor.name) : 'Unknown';
        doc.text(`Distributor: ${distributorName}`, 14, yPos);
        yPos += 5;
      }
      yPos += 5;
    }

    // Add the table
    doc.autoTable({
      head: [Object.keys(data[0])],
      body: data.map(row => Object.values(row)),
      startY: yPos,
      theme: 'grid',
      styles: { 
        fontSize: 8,
        cellPadding: 1,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    doc.save(fileName);
  };

  // Add confirmation dialog handlers
  const handleConfirmDialogOpen = (title, content, action, actionType, data = null) => {
    setConfirmDialog({
      open: true,
      title,
      content,
      action,
      actionType,
      data
    });
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({
      open: false,
      title: '',
      content: '',
      action: null,
      actionType: '',
      data: null
    });
  };

  const handleConfirmAction = async () => {
    try {
      setActionInProgress(true); // Set loading state to true
      if (confirmDialog.action) {
        await confirmDialog.action(confirmDialog.data);
      }
      handleConfirmDialogClose();
    } catch (error) {
      console.error('Error executing action:', error);
    } finally {
      setActionInProgress(false); // Reset loading state
    }
  };

  // Add handler to clear all filters
  const handleClearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setSelectedMonth(currentMonth.value);
    setSelectedStatus('');
    setSelectedDistributor('');
    setStartDate(null);
    setEndDate(null);
    setPage(1);
  };

  const handleMenuClick = (event, deal) => {
    setAnchorEl(event.currentTarget);
    setSelectedDealId(deal);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDeal = () => {
    handleViewCommitments(selectedDealId);
    handleMenuClose();
  };

  const handleAnalyticsDeal = () => {
    navigate(`/admin/deal-analytics/${selectedDealId._id}`);
    handleMenuClose();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const pendingCommitmentsInDialog = selectedDeal?.detailedCommitments?.filter(c => c.status === 'pending') || [];
  const dealsWithPendingCommitments = deals.filter(deal => deal.pendingCommitments > 0);

  return (
    <Box p={{ xs: 1, sm: 3 }}>
      {/* Filters Section */}
      <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
        <Grid 
          container 
          spacing={{ xs: 1, sm: 2 }} 
          direction={{ xs: 'column', sm: 'row' }}
        >
          <Grid item xs={12} sm={10}>
            <Grid 
              container 
              spacing={{ xs: 1, sm: 2 }}
              direction={{ xs: 'column', sm: 'row' }}
            >
              <Grid item xs={12} sm={2.4}>
                <TextField
                  fullWidth
                  label="Search Deals"
                  value={searchInput}
                  onChange={handleSearch}
                  placeholder="Type to search..."
                  size="small"
                  InputProps={{
                    endAdornment: <SearchIcon />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    label="Month"
                    disabled={!!(startDate || endDate)}
                  >
                    <MenuItem value="">All Months</MenuItem>
                    {months.map(month => (
                      <MenuItem key={month.value} value={month.value}>
                        {month.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Distributor</InputLabel>
                  <Select
                    value={selectedDistributor}
                    onChange={handleDistributorChange}
                    label="Distributor"
                  >
                    <MenuItem value="">All Distributors</MenuItem>
                    {distributors.map((distributor) => (
                      <MenuItem key={distributor._id} value={distributor._id}>
                        {distributor.businessName || distributor.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(date) => handleDateChange(date, true)}
                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    disabled={!!selectedMonth}
                    sx={{
                      '& .MuiInputBase-root': {
                        height: '40px',
                        width: { xs: '350px', sm: 'auto' },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={2}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(date) => handleDateChange(date, false)}
                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    disabled={!!selectedMonth}
                    minDate={startDate}
                    sx={{
                      '& .MuiInputBase-root': {
                        height: '40px',
                        width: { xs: '350px', sm: 'auto' },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleClearFilters}
              fullWidth
              size="small"
              startIcon={<CloseIcon />}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Header Section */}
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', sm: 'center' }} 
        gap={2}
        mb={2}
      >
        <Box display="flex" flexDirection={{ xs: 'row', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2}>
          <Typography variant="h5" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
            Admin - All Distributor Deals
          </Typography>
          <IconButton
            color="primary"
            onClick={handleDownloadClick}
            disabled={!deals.length || exportLoading}
          >
            {exportLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (<>
              <GetApp />
            </>)}
          </IconButton>
        </Box>
        <Box 
          display="flex" 
          flexDirection={{ xs: 'row', sm: 'row' }}
          gap={1} 
          alignItems="center"
        >
          {dealsWithPendingCommitments.length > 0 && (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectAllDeals}
                    onChange={(e) => setSelectAllDeals(e.target.checked)}
                    size="small"
                    color="primary.contrastText"
                  />
                }
                label={<Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>All</Typography>}
              />
              <Box 
                display="flex" 
                gap={1} 
                flexDirection={{ xs: 'row', sm: 'row' }}
                width={{ xs: '100%', sm: 'auto' }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  fullWidth
                  startIcon={actionInProgress && selectedActionType === 'approve' ? 
                    <CircularProgress size={20} color="inherit" /> : 
                    <CheckIcon />
                  }
                  onClick={() => handleBulkDealsAction('approve')}
                  disabled={actionInProgress || selectedDeals.length === 0}
                >
                  {actionInProgress && selectedActionType === 'approve' ? 
                    'Approving...' : 
                    `Approve (${selectedDeals.length})`
                  }
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  fullWidth
                  startIcon={actionInProgress && selectedActionType === 'decline' ? 
                    <CircularProgress size={20} color="inherit" /> : 
                    <CloseIcon />
                  }
                  onClick={() => handleBulkDealsAction('decline')}
                  disabled={actionInProgress || selectedDeals.length === 0}
                >
                  {actionInProgress && selectedActionType === 'decline' ? 
                    'Declining...' : 
                    `Decline (${selectedDeals.length})`
                  }
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Responsive Table */}
      <TableContainer 
        component={Paper}
        sx={{
          overflowX: 'auto',
          '.MuiTable-root': {
            minWidth: { xs: '100%', sm: 650 }
          }
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell padding="checkbox" sx={{ display: { xs: 'table-cell', sm: 'table-cell' } }}>
                {dealsWithPendingCommitments.length > 0 && (
                  <Checkbox
                    checked={selectAllDeals}
                    onChange={(e) => setSelectAllDeals(e.target.checked)}
                    size="small"
                    color='primary.contrastText'
                  />
                )}
              </StyledTableCell>
              <StyledTableCell>Deal Name</StyledTableCell>
              <StyledTableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Distributor</StyledTableCell>
              <StyledTableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Category</StyledTableCell>
              <StyledTableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Min Qty</StyledTableCell>
              <StyledTableCell>Total Commitments</StyledTableCell>
              <StyledTableCell>Total Amount</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deals.length > 0 ? (
              deals.map((deal) => (
                <TableRow key={deal._id}>
                  <StyledTableCell padding="checkbox" sx={{ display: { xs: 'table-cell', sm: 'table-cell' } }}>
                    {deal.pendingCommitments > 0 && (
                      <Checkbox
                        checked={selectedDeals.includes(deal._id)}
                        onChange={() => handleDealSelect(deal._id)}
                        size="small"
                        color='primary.contrastText'
                      />
                    )}
                  </StyledTableCell>
                  <StyledTableCell sx={{ maxWidth: { xs: '100px', sm: 'none' } }}>
                    <Typography noWrap>{deal.name}</Typography>
                    <Tooltip title={deal.sizes && deal.sizes.length > 0 
                      ? deal.sizes.map(s => `${s.size}: $${s.discountPrice}`).join(', ')
                      : 'No sizes available'
                    }>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {deal.sizes && deal.sizes.length > 0 
                          ? `${deal.sizes.length} size option${deal.sizes.length > 1 ? 's' : ''}`
                          : 'No size options'
                        }
                      </Typography>
                    </Tooltip>
                  </StyledTableCell>
                  <StyledTableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {deal.distributor ? (deal.distributor.businessName || deal.distributor.name) : 'Unknown'}
                  </StyledTableCell>
                  <StyledTableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{deal.category}</StyledTableCell>
                  <StyledTableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{deal.minimumQuantity}</StyledTableCell>
                  <StyledTableCell>
                    {deal.totalQuantity !== 0 ? deal.totalQuantity : deal.totalPQuantity}
                    {deal.minimumQuantity > 0 && (
                      <Box sx={{ mt: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, ((deal.totalQuantity || deal.totalPQuantity || 0) / deal.minimumQuantity) * 100)}
                              color={(deal.totalQuantity || deal.totalPQuantity || 0) >= deal.minimumQuantity ? 'success' : 'primary'}
                              sx={{ height: 4, borderRadius: 5 }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {Math.min(100, Math.round(((deal.totalQuantity || deal.totalPQuantity || 0) / deal.minimumQuantity) * 100))}%
                          </Typography>
                        </Box>
                        {(deal.totalQuantity || deal.totalPQuantity || 0) >= deal.minimumQuantity ? (
                          <Chip 
                            label="100%" 
                            color="success" 
                            size="small"
                            sx={{ fontSize: '0.625rem', height: 18, mt: 0.5 }}
                          />
                        ) : (
                          <Typography variant="caption" color="warning.main" sx={{ display: 'block' }}>
                            {Math.max(0, deal.minimumQuantity - (deal.totalQuantity || deal.totalPQuantity || 0))} more to go
                          </Typography>
                        )}
                      </Box>
                    )}
                  </StyledTableCell>
                  <StyledTableCell>
                    ${deal.totalAmount !== 0 ? deal.totalAmount.toFixed(2) : deal.totalPAmount.toFixed(2)}
                  </StyledTableCell>
                  <StyledTableCell>
                    <Box sx={{display:'flex',gap:2}}>
                      {deal.bulkAction ? (
                        <Chip 
                          label={deal.bulkStatus} 
                          color={deal.bulkStatus === "approved" ? "success" : "error"} 
                          variant="outlined" 
                        />
                      ) : (
                        <Box 
                          display="flex" 
                          gap={1}
                          sx={{
                            flexDirection: { xs: 'column', sm: 'row' },
                            '.MuiButton-root': {
                              minWidth: { xs: '70px', sm: 'auto' },
                              padding: { xs: '4px 8px', sm: '6px 16px' },
                            }
                          }}
                        >
                          {/* Show buttons on larger screens */}
                          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => handleBulkAction(deal._id, 'approve')}
                              disabled={actionInProgress || deal.pendingCommitments === 0}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => handleBulkAction(deal._id, 'decline')}
                              disabled={actionInProgress || deal.pendingCommitments === 0}
                            >
                              Decline
                            </Button>
                          </Box>
                        </Box>
                      )}
                      {/* Show only menu on mobile */}
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuClick(event, deal)}
                        sx={{ 
                          display: { xs: 'flex', sm: 'none' },
                          alignSelf: 'center'
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      {/* Show menu on desktop too */}
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuClick(event, deal)}
                        sx={{ display: { xs: 'none', sm: 'flex' } }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </StyledTableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <StyledTableCell colSpan={8} align="center">
                  <Box sx={{ py: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No deals available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchInput || selectedMonth || startDate || endDate || selectedDistributor ? 
                        "No deals match your filter criteria" : 
                        "No deals found in the system"}
                    </Typography>
                    {(searchInput || selectedMonth || startDate || endDate || selectedDistributor) && (
                      <Button
                        sx={{ mt: 2 }}
                        variant="outlined"
                        color="primary.contrastText"
                        onClick={handleClearFilters}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </Box>
                </StyledTableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Update Menu component */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            width: { xs: '200px', sm: 'auto' }
          }
        }}
      >
        {/* Show Approve/Decline only on mobile */}
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          <MenuItem 
            onClick={() => {
              handleBulkAction(selectedDealId._id, 'approve');
              handleMenuClose();
            }}
            disabled={actionInProgress || !selectedDealId?.pendingCommitments}
          >
            <ListItemIcon>
              <CheckIcon fontSize="small" color="primary.contrastText" />
            </ListItemIcon>
            Approve
          </MenuItem>
          <MenuItem 
            onClick={() => {
              handleBulkAction(selectedDealId._id, 'decline');
              handleMenuClose();
            }}
            disabled={actionInProgress || !selectedDealId?.pendingCommitments}
          >
            <ListItemIcon>
              <CloseIcon fontSize="small" color="primary.contrastText" />
            </ListItemIcon>
            Decline
          </MenuItem>
          <Divider />
        </Box>
        <MenuItem onClick={handleViewDeal}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" color="primary.contrastText" />
          </ListItemIcon>
          View
        </MenuItem>
        <MenuItem onClick={handleAnalyticsDeal}>
          <ListItemIcon>
            <AnalyticsIcon fontSize="small" color="primary.contrastText" />
          </ListItemIcon>
          Analytics
        </MenuItem>
      </Menu>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Stack>
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Commitment Details - {selectedDeal?.name}
              {selectedDeal?.distributor && (
                <Typography variant="subtitle2" color="text.secondary">
                  Distributor: {selectedDeal.distributor.businessName || selectedDeal.distributor.name}
                </Typography>
              )}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDeal?.detailedCommitments && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Size Details</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Discount Tier</TableCell>
                    <TableCell>Total Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedDeal.detailedCommitments.map((commitment) => (
                    <TableRow key={commitment._id}>
                      <TableCell>{commitment.userId.businessName || commitment.userId.name}</TableCell>
                      <TableCell>
                        {commitment.sizeCommitments && commitment.sizeCommitments.length > 0 ? (
                          <Box>
                            {commitment.sizeCommitments.map((sizeCommit, idx) => (
                              <Typography variant="body2" key={idx} sx={{ mb: 0.5 }}>
                                {sizeCommit.size}: {sizeCommit.quantity} × ${sizeCommit.pricePerUnit.toFixed(2)}
                              </Typography>
                            ))}
                          </Box>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>{commitment.quantity || 
                        (commitment.sizeCommitments ? 
                          commitment.sizeCommitments.reduce((sum, item) => sum + item.quantity, 0) : 
                          0)
                      }</TableCell>
                      <TableCell>
                        {commitment.sizeCommitments && commitment.sizeCommitments.some(sc => sc.appliedDiscountTier) ? (
                          <Box>
                            {commitment.sizeCommitments
                              .filter(sc => sc.appliedDiscountTier)
                              .map((sizeCommit, idx) => (
                                <Chip 
                                  key={idx}
                                  label={`${sizeCommit.size}: $${sizeCommit.appliedDiscountTier.tierDiscount} at ${sizeCommit.appliedDiscountTier.tierQuantity}+ units`} 
                                  color="primary" 
                                  size="small"
                                  variant="outlined"
                                  sx={{ mb: 0.5, fontSize: '0.7rem' }}
                                />
                              ))}
                          </Box>
                        ) : commitment.appliedDiscountTier && commitment.appliedDiscountTier.tierQuantity ? (
                          <Chip 
                            label={`$${commitment.appliedDiscountTier.tierDiscount} at ${commitment.appliedDiscountTier.tierQuantity}+ units`} 
                            color="primary" 
                            size="small"
                            variant="outlined"
                          />
                        ) : "No discount applied"}
                      </TableCell>
                      <TableCell>${commitment.totalPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            color: commitment.status === 'approved' ? 'success.main' :
                                  commitment.status === 'declined' ? 'error.main' :
                                  'warning.main'
                          }}
                        >
                          {commitment.status.charAt(0).toUpperCase() + commitment.status.slice(1)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(commitment.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

<DialogActions sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
  <Box sx={{ display: 'flex', gap: 1 }}>
    <Button
      variant="outlined"
      color="primary"
      onClick={() => {
        // Export only the commitments from the current dialog
        const csvData = selectedDeal.detailedCommitments.map(commitment => ({
          'Member Name': commitment.userId.businessName || commitment.userId.name,
          'Size Details': commitment.sizeCommitments ? 
            commitment.sizeCommitments.map(sc => `${sc.size}: ${sc.quantity}`).join(', ') : 'N/A',
          'Total Quantity': commitment.sizeCommitments ? 
            commitment.sizeCommitments.reduce((sum, item) => sum + item.quantity, 0) : 0,
          'Discount Applied': commitment.appliedDiscountTier && commitment.appliedDiscountTier.tierDiscount ? 
            `${commitment.appliedDiscountTier.tierDiscount}%` : 'None',
          'Total Price': `$${commitment.totalPrice.toFixed(2)}`,
          'Status': commitment.status.charAt(0).toUpperCase() + commitment.status.slice(1),
          'Date': format(new Date(commitment.createdAt), 'PP')
        }));

        // Create CSV content
        const headers = Object.keys(csvData[0]);
        const csvContent = [
          headers.join(','),
          ...csvData.map(row => 
            headers.map(header => {
              const value = row[header];
              return typeof value === 'string' && value.includes(',') 
                ? `"${value}"` 
                : value
            }).join(',')
          )
        ].join('\n');

        // Download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const fileName = `${selectedDeal.name}-commitments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        saveAs(blob, fileName);
      }}
      startIcon={<GetApp />}
    >
      Export CSV
    </Button>
  </Box>
  <Box sx={{ display: 'flex', gap: 1 }}>
    <Button
      variant="contained"
      color="error"
      onClick={() => setOpenDialog(false)}
    >
      Close
    </Button>
  </Box>
</DialogActions>
      </Dialog>

      {/* Export Menu */}
      <Menu
        anchorEl={downloadAnchorEl}
        open={downloadMenuOpen}
        onClose={handleDownloadClose}
      >
        <MenuItem onClick={() => handleExport('csv')}>
          Export as CSV
        </MenuItem>
        <MenuItem onClick={() => handleExport('pdf')}>
          Export as PDF
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1,
            minWidth: '300px'
          }
        }}
      >
        <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 'bold' }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography id="confirm-dialog-description">
            {confirmDialog.content}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmDialogClose}
            color="inherit"
            disabled={actionInProgress}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color="primary"
            variant="contained"
            disabled={actionInProgress}
            startIcon={actionInProgress ? <CircularProgress size={20} /> : null}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllDealsAdmin;
