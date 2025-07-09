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
      // Clear main site's token
      localStorage.removeItem('token');

      // Try to reach the login iframe embedded in Wix (if still open in browser)
      const wixIframeURL = 'https://www.nmgrocers.com/nmgrocercoop'; // The Wix site where the iframe lives
      const loginIframeOrigin = 'https://nmga.rtnglobal.site'; // Your own domain

      // Step 1: Open a hidden iframe to the login page (which is embedded in Wix)
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `${loginIframeOrigin}/login`; // Direct link to your login page
      document.body.appendChild(iframe);

      // Step 2: After iframe loads, send logout message
      iframe.onload = () => {
        iframe.contentWindow?.postMessage('logout', loginIframeOrigin);
      };

      // Step 3: Listen for logout confirmation (optional)
      window.addEventListener('message', (event) => {
        if (event.origin === loginIframeOrigin && event.data === 'logout-complete') {
          console.log('✅ Embedded login also logged out.');
          // Optional: redirect or update UI
          window.location.href = '/login';
        }
      });

    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Button onClick={handleLogout} color="primary.contrastText" sx={{
      fontSize: '16px',
      fontWeight: '500',
      borderLeft: '4px solid',
      borderColor: 'primary.contrastText',
      borderRadius: 0
    }}>
      Logout
    </Button>
  );
};

export default Logout;
