import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'https://nmga-rtn-backend-xcky.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 120000 // Increased to 2 minutes timeout for complex filtering and sorting operations
});

export default api;