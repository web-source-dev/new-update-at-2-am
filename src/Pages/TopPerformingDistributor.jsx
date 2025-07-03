import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import VisibilityIcon from '@mui/icons-material/Visibility';

const TopMembers = () => {
  const [topMembers, setTopMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopMembers = async () => {
      try {
        const userRole = localStorage.getItem('user_role');
        if (!userRole) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/distributors/top-distributors/${userRole}`);

        setTopMembers(response.data.topMembers);
      } catch (error) {
        console.error('Error fetching top members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMembers();
  }, [navigate]);

  // Function to get medal color based on rank
  const getMedalColor = (index) => {
    switch (index) {
      case 0: return '#000000a2'; // Gold
      case 1: return '#000000a2'; // Silver
      case 2: return '#000000a2'; // Bronze
      case 3: return '#000000a2'; // Bronze
      case 4: return '#000000a2'; // Bronze
      default: return '#9e9e9e'; // Grey for others

    }
  };

  const handleViewMember = (memberId) => {
    navigate(`/dashboard/admin/profile-management/${memberId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (topMembers.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Top Members
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No member data available yet.
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" component="h2">
              Top Performing Distributors
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <TableContainer>
          <Table aria-label="top distributors table">
            <TableHead>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell>Distributor</TableCell>
                <TableCell>Business Name</TableCell>
                <TableCell align="center">Total Deals</TableCell>
                <TableCell align="center">Active Deals</TableCell>
                <TableCell align="center">All Commitments</TableCell>
                <TableCell align="center">Total Revenue</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topMembers.map((member, index) => (
                <TableRow 
                  key={member._id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'inherit',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                >
                  <TableCell>
                    <Box 
                      sx={{ 
                        bgcolor: getMedalColor(index), 
                        color: 'white',
                        width: 35,
                        height: 35,
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontWeight: 'bold'
                      }}
                    >
                      {index + 1}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        src={member.logo}
                        alt={member.name}
                        sx={{ 
                          width: 45, 
                          height: 45,
                          border: `2px solid ${getMedalColor(index)}`,
                          bgcolor:'primary.main',
                          color:'primary.contrastText'
                        }}
                      >
                        {member.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {member.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{member.businessName || 'N/A'}</TableCell>
                  <TableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {member.stats.totalDeals}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body1" color="success.main" sx={{ fontWeight: 500 }}>
                      {member.stats.activeDeals}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {member.stats.totalCommitments}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      ${member.stats.totalSpent.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<VisibilityIcon color='primary.contrastText'/>}
                      onClick={() => handleViewMember(member._id)}
                      sx={{ 
                        borderRadius: 2,
                        backgroundColor: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        }
                      }}
                    >
                      View
                    </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
  );
};

export default TopMembers;
