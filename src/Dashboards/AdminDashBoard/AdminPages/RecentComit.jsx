import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Grid,
  Skeleton
} from '@mui/material';
import { format } from 'date-fns';
import { TableSkeleton } from '../../../Components/Skeletons/LoadingSkeletons';

const RecentComit = () => {
  const [value, setValue] = useState(0);
  const [recentData, setRecentData] = useState({ recentDeals: [], recentCommitments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentData();
  }, []);

  const fetchRecentData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/deals/get/recent`);
      setRecentData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recent data:', error);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'error',
      pending: 'warning',
      approved: 'success',
      declined: 'error',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 2 }} />
            <TableSkeleton columnsNum={5} rowsNum={3} />
          </Grid>
        </Grid>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Recent Activity
      </Typography>

      <Grid container spacing={2}>
        {/* Left side - Deals Table */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Recent Deals</Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Deal Name</TableCell>
                  <TableCell>Distributor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentData.recentDeals.map((deal) => (
                  <TableRow key={deal._id}>
                    <TableCell>{deal.name}</TableCell>
                    <TableCell>
                      {deal.distributor?.businessName || deal.distributor?.name}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={deal.status} 
                        color={getStatusColor(deal.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(deal.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Right side - Commitments Table */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Recent Commitments</Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Deal Name</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentData.recentCommitments.map((commitment) => (
                  <TableRow key={commitment._id}>
                    <TableCell>{commitment.dealId?.name}</TableCell>
                    <TableCell>
                      {commitment.userId?.businessName || commitment.userId?.name}
                    </TableCell>
                    <TableCell>
                      {commitment.sizeCommitments && commitment.sizeCommitments.length > 0 ? (
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            Total: {commitment.sizeCommitments.reduce((sum, item) => sum + item.quantity, 0)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {commitment.sizeCommitments.slice(0, 2).map((sc, idx) => (
                              <span key={idx}>
                                {sc.size}: {sc.quantity}{idx < Math.min(commitment.sizeCommitments.length - 1, 1) ? ', ' : ''}
                              </span>
                            ))}
                            {commitment.sizeCommitments.length > 2 && ` +${commitment.sizeCommitments.length - 2} more`}
                          </Typography>
                        </Box>
                      ) : (
                        commitment.quantity
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={commitment.status} 
                        color={getStatusColor(commitment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(commitment.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RecentComit;
