import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  Button,
  Pagination,
  Stack,
  Skeleton
} from '@mui/material';
import { ArrowBack, CheckCircle, Cancel, Pending, AttachMoney } from '@mui/icons-material';
import { TableSkeleton } from '../../Components/Skeletons/LoadingSkeletons';

const SingleDealCommitments = () => {
  const navigate = useNavigate();
  const { dealId } = useParams();
  const [commitments, setCommitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCommitments = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/deals/singleCommitment/deal/${dealId}?page=${page}&limit=10`
        );
        setCommitments(response.data.commitments);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error fetching commitments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (dealId) {
      fetchCommitments();
    }
  }, [dealId, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'warning', icon: <Pending sx={{ mr: 1 }} /> },
      approved: { color: 'success', icon: <CheckCircle sx={{ mr: 1 }} /> },
      declined: { color: 'error', icon: <Cancel sx={{ mr: 1 }} /> },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Chip
        icon={config.icon}
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={config.color}
        variant="outlined"
      />
    );
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 1 }} />
          <Skeleton variant="text" width="60%" />
        </Box>
        <TableSkeleton columnsNum={6} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Back to Deal
        </Button>
        <Typography variant="h4" component="h1">
          Deal Commitments
        </Typography>
      </Box>

      {commitments.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography>No commitments found for this deal.</Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Buyer</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell align="right">Commited Quantity</TableCell>
                  <TableCell align="right">Total Price</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commitments.map((commitment) => (
                  <TableRow key={commitment._id}>
                    <TableCell>
                      <Typography variant="body2">{commitment.userId.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {commitment.userId.businessName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{commitment.userId.email}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {commitment.userId.phone}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{commitment.quantity}</TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        <AttachMoney sx={{ fontSize: 14 }} />
                        {commitment.totalPrice}
                      </Box>
                    </TableCell>
                    <TableCell align="center">{getStatusChip(commitment.status)}</TableCell>
                    <TableCell align="center">
                        <Button variant="contained" color="primary" onClick={() => navigate(`/distributor/view/deals/${dealId}/commitments/${commitment._id}`)}>View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack spacing={2} alignItems="center">
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Stack>
        </>
      )}
    </Container>
  );
};

export default SingleDealCommitments;
