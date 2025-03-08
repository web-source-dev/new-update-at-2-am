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
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
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

        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/members/top-members/${userRole}`);

        setTopMembers(response.data.topMembers);
      } catch (error) {
        console.error('Error fetching top members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMembers();
  }, [navigate]);

  const handleViewMember = (memberId) => {
    navigate(`/member-details/${memberId}`);
  };

  const handleViewAllMembers = () => {
    navigate('/all-members');
  };

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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p:3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h5" component="h2">
              Top 5 Co-op Members
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            onClick={handleViewAllMembers}
            sx={{ borderRadius: 2 }}
          >
            View All
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }} aria-label="top members table">
            <TableHead>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell>Member</TableCell>
                <TableCell>Business Name</TableCell>
                <TableCell align="center">
                  <Tooltip title="Total Commitments">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2">Deals</Typography>
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Total Spent">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AttachMoneyIcon sx={{ mr: 0.5 }} />
                      <Typography variant="body2">Total Spent</Typography>
                    </Box>
                  </Tooltip>
                </TableCell>
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
                        width: 30,
                        height: 30,
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          mr: 2,
                          bgcolor: 'primary.main',
                          border: `2px solid ${getMedalColor(index)}`
                        }}
                      >
                        {member.logo ? (
                          <img 
                            src={member.logo} 
                            alt={member.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </Avatar>
                      <Typography variant="body1">{member.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{member.businessName || 'Individual Member'}</TableCell>
                  <TableCell align="center">{member.stats.totalCommitments}</TableCell>
                  <TableCell align="center">${member.stats.totalSpent.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewMember(member._id)}
                      sx={{ borderRadius: 2 }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default TopMembers;
