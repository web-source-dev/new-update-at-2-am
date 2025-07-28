import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import AllCoopMembers from '../Components/AllCoopMembers';

const CoopMembersPage = () => {
  const navigate = useNavigate();
  
  // Check if user is logged in and is a distributor
  useEffect(() => {
    const user = localStorage.getItem('user_id');
    const user_role = localStorage.getItem('user_role');
    if (!user) {
      navigate('/login');
    } else if (user_role !== 'distributor' && user_role !== 'admin') {
      navigate(-1);
    }
  }, [navigate]);

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <AllCoopMembers />
    </Container>
  );
};

export default CoopMembersPage; 