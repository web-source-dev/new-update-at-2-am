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
     
      localStorage.clear();
     // Send logout message to Wix embedded iframe if it exists
const iframe = document.querySelector('iframe'); // Adjust selector to your embedded login iframe
if (iframe && iframe.contentWindow) {
  iframe.contentWindow.postMessage('logout', 'https://www.nmgrocers.com/nmgrocercoop'); // Match the exact origin
}

// Then redirect or update UI
window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Button onClick={handleLogout} color="primary.contrastText" sx={{
      fontSize:'16px',
      fontWeight:'500',
      borderLeft:'4px solid',
      borderColor:'primary.contrastText',
      borderRadius:0
    }}>
      Logout
    </Button>
  );
};

export default Logout;
