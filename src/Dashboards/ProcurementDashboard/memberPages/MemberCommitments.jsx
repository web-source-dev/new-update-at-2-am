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
  Snackbar
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Payment as PaymentIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const MemberCommitments = ({ userId }) => {
  const [commitments, setCommitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedCommitment, setSelectedCommitment] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommitments();
  }, [userId]);

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
              {commitments
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
          count={commitments.length}
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