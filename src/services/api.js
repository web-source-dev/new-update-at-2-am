import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'https://nmga-rtn-backend-xcky.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // Increased to 60 second timeout for complex discount tier operations
});

export default api;