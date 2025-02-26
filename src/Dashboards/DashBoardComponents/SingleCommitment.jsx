import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Box, Chip, Grid, Skeleton } from '@mui/material';
import { Info, Visibility, Edit } from '@mui/icons-material';

const SingleCommitmentSkeleton = () => (
  <Card>
    <CardContent>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={8}>
          <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Skeleton variant="rectangular" width={80} height={24} />
            <Skeleton variant="rectangular" width={80} height={24} />
          </Box>
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} variant="text" sx={{ mb: 0.5 }} />
          ))}
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Skeleton variant="rectangular" height={36} />
            <Skeleton variant="rectangular" height={36} />
          </Box>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const SingleCommitment = ({ commitment, onStatusUpdate, loading }) => {
    const navigate = useNavigate();
    
    if (loading) {
        return <SingleCommitmentSkeleton />;
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: 'warning',
            approved: 'success',
            declined: 'error',
            cancelled: 'error'
        };
        return colors[status] || 'default';
    };
    
    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="h6">
                            {commitment.dealId.name}
                        </Typography>
                        <Chip
                            label={commitment.status.toUpperCase()}
                            color={getStatusColor(commitment.status)}
                            size="small"
                            sx={{ mt: 1 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                            Quantity: {commitment.modifiedQuantity || commitment.quantity}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Total Price: ${commitment.modifiedTotalPrice || commitment.totalPrice}
                        </Typography>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {commitment.status === 'pending' && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Edit />}
                            onClick={() => onStatusUpdate(commitment)}
                        >
                            Review
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/commitment-details/${commitment._id}`)}
                        color="info"
                    >
                        View Details
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default SingleCommitment;
