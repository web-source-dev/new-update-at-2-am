import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  CircularProgress,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Skeleton,
  Alert,
  Snackbar,
  TextField,
  Grid,
  InputAdornment,
  Menu, MenuItem
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { 
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Payment as PaymentIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MemberCommitments = ({ userId }) => {
  const [commitments, setCommitments] = useState([]);
  const [filteredCommitments, setFilteredCommitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [selectedCommitment, setSelectedCommitment] = useState(null);
  const [modifiedQuantity, setModifiedQuantity] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({
    dealName: '',
    quantity: '',
    startDate: new Date(new Date().setDate(1)), // First day of current month
    endDate: new Date()
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommitments();
  }, [userId]);

  useEffect(() => {
    filterCommitments();
  }, [commitments, filters]);

  const filterCommitments = () => {
    let filtered = [...commitments];

    if (filters.dealName) {
      filtered = filtered.filter(c => 
        c.dealId.name.toLowerCase().includes(filters.dealName.toLowerCase())
      );
    }

    if (filters.quantity) {
      filtered = filtered.filter(c => 
        c.quantity.toString().includes(filters.quantity)
      );
    }

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(c => {
        const commitmentDate = new Date(c.createdAt);
        return commitmentDate >= filters.startDate && 
               commitmentDate <= filters.endDate;
      });
    }

    setFilteredCommitments(filtered);
  };

  const handleModifyQuantity = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/member/commitments/${selectedCommitment._id}/modify`,
        { quantity: parseInt(modifiedQuantity) }
      );

      setCommitments(commitments.map(c => 
        c._id === selectedCommitment._id 
          ? { ...c, quantity: parseInt(modifiedQuantity) }
          : c
      ));

      setSnackbar({
        open: true,
        message: 'Quantity modified successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error modifying quantity',
        severity: 'error'
      });
    } finally {
      setModifyDialogOpen(false);
      setSelectedCommitment(null);
      setModifiedQuantity('');
    }
  };

  const fetchCommitments = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/member/commitments/${userId}`);
      setCommitments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching commitments:', error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Error loading commitments',
        severity: 'error'
      });
    }
  };

  const handleCancelCommitment = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/member/commitments/${selectedCommitment._id}/cancel`);
      setCommitments(commitments.map(c => 
        c._id === selectedCommitment._id 
          ? { ...c, status: 'cancelled' }
          : c
      ));
      setSnackbar({
        open: true,
        message: 'Commitment cancelled successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error cancelling commitment:', error);
      setSnackbar({
        open: true,
        message: 'Error cancelling commitment',
        severity: 'error'
      });
    } finally {
      setCancelDialogOpen(false);
      setSelectedCommitment(null);
    }
  };

  const handleViewCommitment = (commitment) => {
    navigate(`/commitment-details/${commitment._id}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'declined':
      case 'cancelled':
        return <CancelIcon sx={{ color: 'error.main' }} />;
      case 'pending':
        return <PendingIcon sx={{ color: 'warning.main' }} />;
      default:
        return null;
    }
  };

  const getPaymentStatusChip = (status) => {
    const colors = {
      pending: 'warning',
      paid: 'success',
      failed: 'error'
    };

    return (
      <Chip
        icon={<PaymentIcon />}
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={colors[status]}
        size="small"
      />
    );
  };
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDownload = (format) => {
    const filteredData = filteredCommitments.map(commitment => ({
      'Deal Name': commitment.dealId.name,
      'Quantity': commitment.quantity,
      'Total Price': `$${commitment.totalPrice}`,
      'Status': commitment.status.charAt(0).toUpperCase() + commitment.status.slice(1),
      'Distributor Response': commitment.distributorResponse || '-',
      'Date': new Date(commitment.createdAt).toLocaleDateString(),
    }));

    if (format === 'csv') {
      const headers = Object.keys(filteredData[0]);
      const csvContent = [
        headers.join(','),
        ...filteredData.map(row => headers.map(header =>
          typeof row[header] === 'string' && row[header].includes(',')
            ? `"${row[header]}"`
            : row[header]
        ).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'commitments.csv');
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text('Commitments Report', 14, 15);

      doc.autoTable({
        head: [Object.keys(filteredData[0])],
        body: filteredData.map(row => Object.values(row)),
        startY: 20,
        margin: { top: 15 },
        styles: { overflow: 'linebreak' },
        columnStyles: {
          'Deal Name': { cellWidth: 40 },
          'Distributor Response': { cellWidth: 40 },
        },
      });

      doc.save('commitments.pdf');
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2 }} />
        <Paper sx={{ width: '100%', mb: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Deal Name', 'Quantity', 'Total Price', 'Status', 'Payment Status', 'Date', 'Actions']
                    .map((header, index) => (
                      <TableCell key={index}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    {[...Array(7)].map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        My Commitments
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Deal Name"
              value={filters.dealName}
              onChange={(e) => setFilters({ ...filters, dealName: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={filters.quantity}
              onChange={(e) => setFilters({ ...filters, quantity: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => setFilters({ ...filters, startDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => setFilters({ ...filters, endDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mr: 2 }}>
      <Button variant="outlined" color="primary" onClick={handleClick}>
        Download
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => { handleDownload('csv'); handleClose(); }}>
          Download CSV
        </MenuItem>
        <MenuItem onClick={() => { handleDownload('pdf'); handleClose(); }}>
          Download PDF
        </MenuItem>
      </Menu>
    </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Deal Name</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Total Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Distributor Response</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCommitments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((commitment) => (
                  <TableRow key={commitment._id}>
                    <TableCell>{commitment.dealId.name}</TableCell>
                    <TableCell align="right">
                      {commitment.modifiedByDistributor 
                        ? <span style={{ textDecoration: 'line-through' }}>{commitment.quantity}</span>
                        : commitment.quantity}
                      {commitment.modifiedQuantity && 
                        <span style={{ color: 'green' }}> → {commitment.modifiedQuantity}</span>
                      }
                    </TableCell>
                    <TableCell align="right">
                      ${commitment.modifiedByDistributor 
                        ? <span style={{ textDecoration: 'line-through' }}>{commitment.totalPrice}</span>
                        : commitment.totalPrice}
                      {commitment.modifiedTotalPrice && 
                        <span style={{ color: 'green' }}> → ${commitment.modifiedTotalPrice}</span>
                      }
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(commitment.status)}
                        {commitment.status.charAt(0).toUpperCase() + commitment.status.slice(1)}
                      </Box>
                    </TableCell>
                    <TableCell>{commitment.distributorResponse || '-'}</TableCell>
                    <TableCell>
                      {new Date(commitment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                      {commitment.status === 'pending' && (
                        <>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => {
                              setSelectedCommitment(commitment);
                              setModifiedQuantity(commitment.quantity.toString());
                              setModifyDialogOpen(true);
                            }}
                            startIcon={<EditIcon />}
                          >
                            Modify
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => {
                              setSelectedCommitment(commitment);
                              setCancelDialogOpen(true);
                            }}
                            startIcon={<CancelIcon />}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleViewCommitment(commitment)}
                          startIcon={<VisibilityIcon />}
                        >
                          View
                        </Button>
                       </Box>

                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCommitments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Cancel Commitment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this commitment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No, Keep It</Button>
          <Button onClick={handleCancelCommitment} color="error" variant="contained">
            Yes, Cancel It
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modify Quantity Dialog */}
      <Dialog
        open={modifyDialogOpen}
        onClose={() => setModifyDialogOpen(false)}
      >
        <DialogTitle>Modify Quantity</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please enter the new quantity for this commitment.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="New Quantity"
            type="number"
            fullWidth
            value={modifiedQuantity}
            onChange={(e) => setModifiedQuantity(e.target.value)}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModifyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleModifyQuantity} color="primary" variant="contained">
            Modify
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MemberCommitments;