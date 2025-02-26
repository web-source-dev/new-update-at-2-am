import React from 'react';
import { Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const user_id = localStorage.getItem('user_id');
    const admin_id = localStorage.getItem('admin_id');
    const id = user_id || admin_id;
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/logout`, { id });
      localStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Button onClick={handleLogout} color="secondary">
      Logout
    </Button>
  );
};

export default Logout;
