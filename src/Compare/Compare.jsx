import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Button, Card, CardHeader, CardContent, Chip, CircularProgress, 
  Alert, Dialog, DialogTitle, DialogContent, Table, TableBody, 
  TableCell, TableHead, TableRow, Typography, IconButton, Snackbar,
} from '@mui/material';
import { 
  CloudDownload as DownloadIcon, 
  Upload as UploadIcon, 
  History as HistoryIcon, 
  Visibility as EyeIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import UploadForCompare from './UploadForCompare';

// Create an axios instance with default configs
const api = axios.create({
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

const Compare = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [comparisonHistory, setComparisonHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState(null);
  const [showComparisonDetails, setShowComparisonDetails] = useState(false);
  const [comparisonDetails, setComparisonDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  
  const navigate = useNavigate();
  
  // Get user info from localStorage
  const userId = localStorage.getItem('user_id') || '';
  const userRole = localStorage.getItem('user_role') || '';
  
  useEffect(() => {
    // Only distributors should access this page
    if (userRole !== 'distributor') {
      navigate('/dashboard');
      return;
    }
    
    fetchDeals();
  }, [userRole, navigate]);
  
  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      const response = await api.get(`${process.env.REACT_APP_BACKEND_URL}/api/compare/${userId}`);
      setDeals(response.data);
    } catch (err) {
      console.error('Error fetching deals:', err);
      let errorMessage = 'Failed to fetch deals. Please try again later.';
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = 'You are not authorized to view these deals.';
      } else if (err.message === 'Network Error') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The server may be busy.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadTemplate = async (dealId) => {
    try {
      showSnackbar('Preparing template for download...', 'info');
      
      // First check if the template is available
      await api.get(`${process.env.REACT_APP_BACKEND_URL}/api/compare/template/${dealId}`, { responseType: 'blob' });
      
      // If the check is successful, open the download in a new window
      window.open(`${process.env.REACT_APP_BACKEND_URL}/api/compare/template/${dealId}`, '_blank');
      
      showSnackbar('Template download started successfully', 'success');
    } catch (err) {
      console.error('Error downloading template:', err);
      
      let errorMessage = 'Failed to download template. Please try again.';
      
      if (err.response?.status === 404) {
        errorMessage = 'No commitments found for this deal.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You are not authorized to download this template.';
      }
      
      showSnackbar(errorMessage, 'error');
    }
  };
  
  const handleUploadClick = (deal) => {
    setSelectedDeal(deal);
    setShowUploadModal(true);
  };
  
  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    // Refresh deals after upload
    fetchDeals();
  };
  
  const fetchComparisonHistory = async (dealId) => {
    try {
      setLoadingHistory(true);
      setComparisonHistory([]);
      
      const response = await api.get(`${process.env.REACT_APP_BACKEND_URL}/api/compare/history/${dealId}/${userId}`);
      
      if (response.data.length === 0) {
        showSnackbar('No comparison history found for this deal', 'info');
      }
      
      setComparisonHistory(response.data);
      setShowHistoryModal(true);
    } catch (err) {
      console.error('Error fetching comparison history:', err);
      
      let errorMessage = 'Failed to fetch comparison history. Please try again.';
      
      if (err.response?.status === 404) {
        errorMessage = 'No comparison history found.';
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoadingHistory(false);
    }
  };
  
  const handleViewComparison = async (comparisonId) => {
    try {
      setLoadingDetails(true);
      setComparisonDetails(null);
      
      const response = await api.get(`${process.env.REACT_APP_BACKEND_URL}/api/compare/details/${comparisonId}`);
      
      setComparisonDetails(response.data);
      setShowComparisonDetails(true);
      setShowHistoryModal(false);
    } catch (err) {
      console.error('Error fetching comparison details:', err);
      
      let errorMessage = 'Failed to fetch comparison details. Please try again.';
      
      if (err.response?.status === 404) {
        errorMessage = 'Comparison details not found.';
      }
      
      showSnackbar(errorMessage, 'error');
      setShowHistoryModal(true);  // Keep history modal open if details fetch fails
    } finally {
      setLoadingDetails(false);
    }
  };
  
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString || 'Unknown date';
    }
  };
  
  const formatCurrency = (amount) => {
    try {
      if (amount === undefined || amount === null) return '$0.00';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    } catch (err) {
      console.error('Error formatting currency:', err);
      return `$${amount || 0}`;
    }
  };
  
  // Show loading spinner while fetching deals
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Supply vs Commitment Comparison</Typography>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <>
              <Button 
                color="inherit" 
                size="small" 
                onClick={fetchDeals}
                startIcon={<RefreshIcon />}
              >
                RETRY
              </Button>
              <Button 
                color="inherit" 
                size="small"
                onClick={() => setError(null)}
              >
                DISMISS
              </Button>
            </>
          }
        >
          <Typography variant="body1" fontWeight="medium">{error}</Typography>
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Typography>
          This tool allows you to compare what members committed to versus what they actually received. 
          Follow these steps:
        </Typography>
        <Box component="ol" sx={{ mt: 2 }}>
          <li>Download the CSV template for the deal you want to compare</li>
          <li>Fill in the actual quantities and prices delivered to members</li>
          <li>Upload the completed CSV to see the comparison results</li>
        </Box>
      </Box>
      
      <Card>
        <CardHeader 
          title="Your Deals" 
          action={
            <Button
              onClick={fetchDeals}
              startIcon={<RefreshIcon />}
              size="small"
            >
              Refresh
            </Button>
          }
        />
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Deal Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Compared</TableCell>
                <TableCell>Summary</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No deals found</TableCell>
                </TableRow>
              ) : (
                deals.map((deal) => (
                  <TableRow key={deal._id}>
                    <TableCell>{deal.name || 'Unnamed Deal'}</TableCell>
                    <TableCell>
                      <Chip 
                        color={deal.status === 'active' ? 'success' : 'default'}
                        label={deal.status || 'unknown'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{deal.lastCompared ? formatDate(deal.lastCompared) : 'Never'}</TableCell>
                    <TableCell>
                      {deal.comparisonSummary ? (
                        <Box>
                          <Typography variant="body2">
                            Qty Diff: <strong>{deal.comparisonSummary.quantityDifferenceTotal || 0}</strong>
                            <br />
                            Price Diff: <strong>{formatCurrency(deal.comparisonSummary.priceDifferenceTotal || 0)}</strong>
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No data</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => handleDownloadTemplate(deal._id)}
                          title="Download CSV Template"
                          startIcon={<DownloadIcon />}
                        >
                          Template
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => handleUploadClick(deal)}
                          title="Upload Comparison Data"
                          startIcon={<UploadIcon />}
                          color="primary"
                        >
                          Upload
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => fetchComparisonHistory(deal._id)}
                          title="View Comparison History"
                          disabled={!deal.hasComparison}
                          startIcon={<HistoryIcon />}
                          color="info"
                        >
                          History
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Upload Dialog */}
      <Dialog 
        open={showUploadModal} 
        onClose={handleCloseUploadModal} 
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Upload Comparison Data
          <IconButton
            onClick={handleCloseUploadModal}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedDeal && (
            <UploadForCompare 
              dealId={selectedDeal._id} 
              dealName={selectedDeal.name} 
              distributorId={userId} 
              onUploadComplete={handleCloseUploadModal} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* History Dialog */}
      <Dialog open={showHistoryModal} onClose={() => setShowHistoryModal(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Comparison History
          <IconButton
            onClick={() => setShowHistoryModal(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {loadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>File Name</TableCell>
                  <TableCell>Summary</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisonHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No comparison history found</TableCell>
                  </TableRow>
                ) : (
                  comparisonHistory.map((comparison) => (
                    <TableRow key={comparison._id}>
                      <TableCell>{formatDate(comparison.createdAt)}</TableCell>
                      <TableCell>{comparison.fileName || 'Unknown file'}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          Qty Diff: <strong>{comparison.summary?.quantityDifferenceTotal || 0}</strong>
                          <br />
                          Price Diff: <strong>{formatCurrency(comparison.summary?.priceDifferenceTotal || 0)}</strong>
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => handleViewComparison(comparison._id)}
                          startIcon={<EyeIcon />}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Comparison Details Dialog */}
      <Dialog 
        open={showComparisonDetails} 
        onClose={() => {
          setShowComparisonDetails(false);
          setShowHistoryModal(true);
        }} 
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          Comparison Details
          <IconButton
            onClick={() => {
              setShowComparisonDetails(false);
              setShowHistoryModal(true);
            }}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {loadingDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : comparisonDetails ? (
            <Box>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6">{comparisonDetails.dealName || 'Unnamed Deal'}</Typography>
                <Typography variant="body2">
                  Uploaded on: {formatDate(comparisonDetails.uploadDate || comparisonDetails.createdAt)}
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
                    <CardHeader title="Summary" />
                    <CardContent>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Total Committed Quantity</TableCell>
                            <TableCell>{comparisonDetails.summary?.totalCommittedQuantity || 0}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Total Actual Quantity</TableCell>
                            <TableCell>{comparisonDetails.summary?.totalActualQuantity || 0}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Quantity Difference</TableCell>
                            <TableCell sx={{ 
                              color: comparisonDetails.summary?.quantityDifferenceTotal > 0 
                                ? 'success.main' 
                                : comparisonDetails.summary?.quantityDifferenceTotal < 0 
                                  ? 'error.main' 
                                  : 'inherit'
                            }}>
                              {comparisonDetails.summary?.quantityDifferenceTotal || 0}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Total Committed Price</TableCell>
                            <TableCell>{formatCurrency(comparisonDetails.summary?.totalCommittedPrice || 0)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Total Actual Price</TableCell>
                            <TableCell>{formatCurrency(comparisonDetails.summary?.totalActualPrice || 0)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Price Difference</TableCell>
                            <TableCell sx={{ 
                              color: comparisonDetails.summary?.priceDifferenceTotal > 0 
                                ? 'success.main' 
                                : comparisonDetails.summary?.priceDifferenceTotal < 0 
                                  ? 'error.main' 
                                  : 'inherit'
                            }}>
                              {formatCurrency(comparisonDetails.summary?.priceDifferenceTotal || 0)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
              
              <Typography variant="h6" sx={{ mb: 2 }}>Detailed Comparison</Typography>
              
              {comparisonDetails.comparisonItems?.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Member</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell align="right">Committed Qty</TableCell>
                      <TableCell align="right">Actual Qty</TableCell>
                      <TableCell align="right">Diff</TableCell>
                      <TableCell align="right">Committed Price</TableCell>
                      <TableCell align="right">Actual Price</TableCell>
                      <TableCell align="right">Total Committed</TableCell>
                      <TableCell align="right">Total Actual</TableCell>
                      <TableCell align="right">Total Diff</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comparisonDetails.comparisonItems.map((item, index) => {
                      const committedTotal = (item.committedQuantity || 0) * (item.committedPrice || 0);
                      const actualTotal = (item.actualQuantity || 0) * (item.actualPrice || 0);
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>{item.memberName || 'Unknown Member'}</TableCell>
                          <TableCell>{item.size || 'Unknown'}</TableCell>
                          <TableCell align="right">{item.committedQuantity || 0}</TableCell>
                          <TableCell align="right">{item.actualQuantity || 0}</TableCell>
                          <TableCell 
                            align="right" 
                            sx={{ 
                              color: (item.quantityDifference || 0) > 0 
                                ? 'success.main' 
                                : (item.quantityDifference || 0) < 0 
                                  ? 'error.main' 
                                  : 'inherit'
                            }}
                          >
                            {item.quantityDifference || 0}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(item.committedPrice || 0)}</TableCell>
                          <TableCell align="right">{formatCurrency(item.actualPrice || 0)}</TableCell>
                          <TableCell align="right">{formatCurrency(committedTotal)}</TableCell>
                          <TableCell align="right">{formatCurrency(actualTotal)}</TableCell>
                          <TableCell 
                            align="right" 
                            sx={{ 
                              color: (item.priceDifference || 0) > 0 
                                ? 'success.main' 
                                : (item.priceDifference || 0) < 0 
                                  ? 'error.main' 
                                  : 'inherit'
                            }}
                          >
                            {formatCurrency(item.priceDifference || 0)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <Alert severity="warning">No comparison items found</Alert>
              )}
            </Box>
          ) : (
            <Alert severity="error">Could not load comparison details</Alert>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Compare;
