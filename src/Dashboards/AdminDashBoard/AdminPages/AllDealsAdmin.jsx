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
  IconButton
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

  const handleDialogAction = async (action) => {
    if (selectedCommitments.length === 0 || actionInProgress) return;

    const actionText = action === 'approve' ? 'approve' : 'decline';
    handleConfirmDialogOpen(
      `Confirm ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      `Are you sure you want to ${actionText} ${selectedCommitments.length} selected commitment(s)?`,
      async () => {
        try {
          setActionInProgress(true);
          setSelectedActionType(action);
          const status = action === 'approve' ? 'approved' : 'declined';
          const response = action === 'approve' ? 'Approved by admin' : 'Declined by admin';

          await Promise.all(selectedCommitments.map(commitmentId => 
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/deals/allDeals/update-commitment-status`, {
              commitmentId,
              status,
              distributorResponse: response,
              adminAction: true,
              distributorId: selectedDeal.distributor._id
            })
          ));

          await fetchDeals();
          setOpenDialog(false);
          setSelectedCommitments([]);
          setSelectAll(false);
        } catch (err) {
          console.error(`Error processing selected commitments:`, err);
        } finally {
          setActionInProgress(false);
          setSelectedActionType(null);
        }
      },
      'commitment-action'
    );
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
      const filteredData = deals.map(deal => ({
        'Deal Name': deal.name,
        'Distributor': deal.distributor ? (deal.distributor.businessName || deal.distributor.name) : 'Unknown',
        'Category': deal.category,
        'Total Commitments': deal.totalCommitments,
        'Minimum Quantity': deal.minimumQuantity,
        'Quantity Committed': deal.totalQuantity,
        'Total Amount': `$${deal.totalAmount.toFixed(2)}`,
      }));

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
    <Box p={3}>
     <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}  alignItems="center">
        
        {/* Search Input */}
        <Grid item xs={12} sm={6} md={2.5}>
          <TextField
            fullWidth
            label="Search Deals"
            value={searchInput}
            onChange={handleSearch}
            placeholder="Type to search..."
            InputProps={{
              endAdornment: <SearchIcon />,
              sx: { borderRadius: 1 },
            }}
          />
        </Grid>

        {/* Month Filter */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              label="Month"
              disabled={!!(startDate || endDate)}
            >
              <MenuItem value="">All Months</MenuItem>
              {months.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Distributor Filter */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
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

        {/* Start Date Picker */}
        <Grid item xs={12} sm={6} md={1.7}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              sx={{ width: "100%" }}
              label="Start Date"
              value={startDate}
              onChange={(date) => handleDateChange(date, true)}
              disabled={!!selectedMonth}
            />
          </LocalizationProvider>
        </Grid>

        {/* End Date Picker */}
        <Grid item xs={12} sm={6} md={1.7}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              sx={{ width: "100%" }}
              label="End Date"
              value={endDate}
              onChange={(date) => handleDateChange(date, false)}
              disabled={!!selectedMonth}
              minDate={startDate}
            />
          </LocalizationProvider>
        </Grid>

      </Grid>
    </Paper>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">
          Admin - All Distributor Deals
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <IconButton
            color="primary"
            onClick={handleDownloadClick}
            disabled={!deals.length || exportLoading}
            title="Export Data"
          >
            <Tooltip title="Export Data">
              {exportLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <GetApp />
              )}
              <Typography variant="body2">Export</Typography>
            </Tooltip>
          </IconButton>
          {dealsWithPendingCommitments.length > 0 && (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectAllDeals}
                    onChange={(e) => setSelectAllDeals(e.target.checked)}
                    color="primary"
                  />
                }
                label="Select Pending Deals"
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={actionInProgress && selectedActionType === 'approve' ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                onClick={() => handleBulkDealsAction('approve')}
                disabled={actionInProgress || selectedDeals.length === 0}
              >
                {actionInProgress && selectedActionType === 'approve' ? 'Approving...' : `Approve Selected (${selectedDeals.length})`}
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={actionInProgress && selectedActionType === 'decline' ? <CircularProgress size={20} color="inherit" /> : <CloseIcon />}
                onClick={() => handleBulkDealsAction('decline')}
                disabled={actionInProgress || selectedDeals.length === 0}
              >
                {actionInProgress && selectedActionType === 'decline' ? 'Declining...' : `Decline Selected (${selectedDeals.length})`}
              </Button>
            </>
          )}
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ width:{ xs: '300px', md: 'auto' } }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                {dealsWithPendingCommitments.length > 0 && (
                  <Checkbox
                    checked={selectAllDeals}
                    onChange={(e) => setSelectAllDeals(e.target.checked)}
                  />
                )}
              </TableCell>
              <TableCell>Deal Name</TableCell>
              <TableCell>Distributor</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Total Commitments</TableCell>
              <TableCell>Minimum Quantity</TableCell>
              <TableCell>Quantity Committed</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deals.map((deal) => (
              <TableRow key={deal._id}>
                <TableCell padding="checkbox">
                  {deal.pendingCommitments > 0 && (
                    <Checkbox
                      checked={selectedDeals.includes(deal._id)}
                      onChange={() => handleDealSelect(deal._id)}
                    />
                  )}
                </TableCell>
                <TableCell>{deal.name}</TableCell>
                <TableCell>{deal.distributor ? (deal.distributor.businessName || deal.distributor.name) : 'Unknown'}</TableCell>
                <TableCell>{deal.category}</TableCell>
                <TableCell>{deal.totalCommitments}</TableCell>
                <TableCell>{deal.minimumQuantity}</TableCell>
                <TableCell>{deal.totalQuantity}</TableCell>
                <TableCell>${deal.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
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
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuClick(event,deal)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
            {pendingCommitmentsInDialog.length > 0 && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectAll}
                    onChange={(e) => setSelectAll(e.target.checked)}
                    color="primary"
                  />
                }
                label="Select All Pending"
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDeal?.detailedCommitments && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox"></TableCell>
                    <TableCell>Member</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Total Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedDeal.detailedCommitments.map((commitment) => (
                    <TableRow key={commitment._id}>
                      <TableCell padding="checkbox">
                        {commitment.status === 'pending' && (
                          <Checkbox
                            checked={selectedCommitments.includes(commitment._id)}
                            onChange={() => handleCommitmentSelect(commitment._id)}
                          />
                        )}
                      </TableCell>
                      <TableCell>{commitment.userId.businessName || commitment.userId.name}</TableCell>
                      <TableCell>{commitment.quantity}</TableCell>
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
        <DialogActions>
          <Box display="flex" gap={1} mx={2} mb={1}>
            {pendingCommitmentsInDialog.length > 0 && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={actionInProgress && selectedActionType === 'approve' ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                  onClick={() => handleDialogAction('approve')}
                  disabled={actionInProgress || selectedCommitments.length === 0}
                >
                  {actionInProgress && selectedActionType === 'approve' ? 'Approving...' : `Approve Selected (${selectedCommitments.length})`}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={actionInProgress && selectedActionType === 'decline' ? <CircularProgress size={20} color="inherit" /> : <CloseIcon />}
                  onClick={() => handleDialogAction('decline')}
                  disabled={actionInProgress || selectedCommitments.length === 0}
                >
                  {actionInProgress && selectedActionType === 'decline' ? 'Declining...' : `Decline Selected (${selectedCommitments.length})`}
                </Button>
              </>
            )}
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
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
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleConfirmDialogClose}
            color="inherit"
            variant="outlined"
            disabled={actionInProgress}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={confirmDialog.actionType.includes('decline') ? 'error' : 'primary'}
            variant="contained"
            autoFocus
            disabled={actionInProgress}
            startIcon={
              actionInProgress && (
                <CircularProgress size={20} color="inherit" />
              )
            }
          >
            {actionInProgress
              ? confirmDialog.actionType === 'approve'
                ? 'Processing...'
                : 'Processing...'
              : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDeal}>View</MenuItem>
        <MenuItem onClick={handleAnalyticsDeal}>Analytics</MenuItem>
      </Menu>
    </Box>
  );
};

export default AllDealsAdmin;
