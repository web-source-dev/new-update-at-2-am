import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import AssignSuppliers from '../Components/AssignSuppliers';

const AssignSupplierPage = () => {
  const navigate = useNavigate();
  const { memberId } = useParams();
  
  // Check if user is logged in and is a distributor
  useEffect(() => {
    const user = localStorage.getItem('user_id');
    const user_role = localStorage.getItem('user_role');
    if (!user) {
      navigate('/login');
    } else if (user_role !== 'distributor') {
      navigate(-1);
    }
  }, [navigate]);

  // Ensure memberId is available
  useEffect(() => {
    if (!memberId) {
      navigate(-1);
    }
  }, [memberId, navigate]);

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <AssignSuppliers />
    </Container>
  );
};

export default AssignSupplierPage; 