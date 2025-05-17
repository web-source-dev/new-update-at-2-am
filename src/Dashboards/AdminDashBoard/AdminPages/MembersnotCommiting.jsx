import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Box, 
  Alert, 
  Snackbar, 
  CircularProgress, 
  Chip, 
  Tooltip, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  Card,
  CardContent,
  Grid,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Badge
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BlockIcon from '@mui/icons-material/Block';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format } from 'date-fns';

const MembersnotCommiting = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, userId: null, userName: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [statistics, setStatistics] = useState({
    total: 0,
    neverCommitted: 0,
    recentInactive: 0,
    mediumTermInactive: 0,
    longTermInactive: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch inactive members
  const fetchInactiveMembers = async () => {
    setLoading(true);
    try {
      const adminId = localStorage.getItem('admin_id');
      const userRole = localStorage.getItem('user_role');
      
      // Check if user is admin
      if (userRole !== 'admin') {
        throw new Error('You do not have permission to view this page');
      }
      
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/inactive/not-committing/${adminId}`
      );
      
      if (response.data.success) {
        setMembers(response.data.inactiveMembers);
        setFilteredMembers(response.data.inactiveMembers);
        setStatistics(response.data.statistics || {
          total: response.data.inactiveMembers.length,
          neverCommitted: response.data.inactiveMembers.filter(m => !m.lastCommitmentDate).length,
          recentInactive: response.data.inactiveMembers.filter(m => m.lastCommitmentDate && m.inactiveDays <= 60).length,
          mediumTermInactive: response.data.inactiveMembers.filter(m => m.lastCommitmentDate && m.inactiveDays > 60 && m.inactiveDays <= 90).length,
          longTermInactive: response.data.inactiveMembers.filter(m => m.lastCommitmentDate && m.inactiveDays > 90).length
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch inactive members');
      }
    } catch (err) {
      console.error('Error fetching inactive members:', err);
      setError(err.message || 'An error occurred while fetching inactive members');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInactiveMembers();
  }, []);

  // Refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchInactiveMembers();
  };

  // Filter members based on search query and active tab
  useEffect(() => {
    let filtered = [...members];
    
    // First filter by tab
    if (activeTab === 'never_committed') {
      filtered = filtered.filter(member => !member.lastCommitmentDate);
    } else if (activeTab === 'recent') {
      filtered = filtered.filter(member => 
        member.lastCommitmentDate && member.inactiveDays <= 60);
    } else if (activeTab === 'medium') {
      filtered = filtered.filter(member => 
        member.lastCommitmentDate && member.inactiveDays > 60 && member.inactiveDays <= 90);
    } else if (activeTab === 'long_term') {
      filtered = filtered.filter(member => 
        member.lastCommitmentDate && member.inactiveDays > 90);
    }
    
    // Then filter by search query
    if (searchQuery.trim() !== '') {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(member => 
        member.name?.toLowerCase().includes(lowercaseQuery) ||
        member.email?.toLowerCase().includes(lowercaseQuery) ||
        member.businessName?.toLowerCase().includes(lowercaseQuery) ||
        member.phone?.includes(searchQuery)
      );
    }
    
    setFilteredMembers(filtered);
  }, [searchQuery, members, activeTab]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  // Inactivate a member
  const handleInactivateMember = async (userId) => {
    try {
      const adminId = localStorage.getItem('admin_id');
      const userRole = localStorage.getItem('user_role');
      
      // Check if user is admin
      if (userRole !== 'admin') {
        throw new Error('You do not have permission to perform this action');
      }
      
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/inactive/inactivate/${userId}/${adminId}`
      );
      
      if (response.data.success) {
        // Update local state to remove inactivated member
        setMembers(prevMembers => prevMembers.filter(member => member._id !== userId));
        setFilteredMembers(prevFiltered => prevFiltered.filter(member => member._id !== userId));
        
        // Update statistics
        setStatistics(prev => ({
          ...prev,
          total: prev.total - 1,
          neverCommitted: members.find(m => m._id === userId && !m.lastCommitmentDate) 
            ? prev.neverCommitted - 1 
            : prev.neverCommitted,
          recentInactive: members.find(m => m._id === userId && m.lastCommitmentDate && m.inactiveDays <= 60) 
            ? prev.recentInactive - 1 
            : prev.recentInactive,
          mediumTermInactive: members.find(m => m._id === userId && m.lastCommitmentDate && m.inactiveDays > 60 && m.inactiveDays <= 90) 
            ? prev.mediumTermInactive - 1 
            : prev.mediumTermInactive,
          longTermInactive: members.find(m => m._id === userId && m.lastCommitmentDate && m.inactiveDays > 90) 
            ? prev.longTermInactive - 1 
            : prev.longTermInactive
        }));
        
        setSnackbar({
          open: true,
          message: 'Member inactivated successfully',
          severity: 'success'
        });
      } else {
        throw new Error(response.data.message || 'Failed to inactivate member');
      }
    } catch (err) {
      console.error('Error inactivating member:', err);
      setSnackbar({
        open: true,
        message: err.message || 'An error occurred while inactivating the member',
        severity: 'error'
      });
    }
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  // Open confirm dialog before inactivating
  const openConfirmDialog = (userId, userName) => {
    setConfirmDialog({
      open: true,
      userId,
      userName
    });
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Function to get severity based on inactiveDays
  const getInactivitySeverity = (days, hasCommitted) => {
    if (!hasCommitted) return { color: 'secondary', icon: <NewReleasesIcon />, label: 'Never Committed' };
    if (days > 90) return { color: 'error', icon: <ErrorOutlineIcon />, label: 'Critical' };
    if (days > 60) return { color: 'warning', icon: <WarningAmberIcon />, label: 'Warning' };
    return { color: 'info', icon: <HourglassEmptyIcon />, label: 'Recent' };
  };

  if (loading && !isRefreshing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading inactive members...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          <PersonOffIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
          Members Not Committing
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2.4}>
          <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {statistics.total}
              </Typography>
              <Typography color="text.secondary">
                Total Inactive
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={2.4}>
          <Card sx={{ bgcolor: '#f3e5f5', height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {statistics.neverCommitted}
              </Typography>
              <Typography color="text.secondary">
                Never Committed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={2.4}>
          <Card sx={{ bgcolor: '#e0f7fa', height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {statistics.recentInactive}
              </Typography>
              <Typography color="text.secondary">
                Recent (30-60 days)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={2.4}>
          <Card sx={{ bgcolor: '#fffde7', height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {statistics.mediumTermInactive}
              </Typography>
              <Typography color="text.secondary">
                Warning (60-90 days)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={2.4}>
          <Card sx={{ bgcolor: '#ffebee', height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {statistics.longTermInactive}
              </Typography>
              <Typography color="text.secondary">
                Critical (90+ days)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="inactive members tabs">
          <Tab 
            label={
              <Badge badgeContent={statistics.total} color="primary">
                All Members
              </Badge>
            } 
            value="all" 
          />
          <Tab 
            label={
              <Badge badgeContent={statistics.neverCommitted} color="secondary">
                Never Committed
              </Badge>
            } 
            value="never_committed" 
          />
          <Tab 
            label={
              <Badge badgeContent={statistics.recentInactive} color="info">
                Recent (30-60 days)
              </Badge>
            } 
            value="recent" 
          />
          <Tab 
            label={
              <Badge badgeContent={statistics.mediumTermInactive} color="warning">
                Warning (60-90 days)
              </Badge>
            } 
            value="medium" 
          />
          <Tab 
            label={
              <Badge badgeContent={statistics.longTermInactive} color="error">
                Critical (90+ days)
              </Badge>
            } 
            value="long_term" 
          />
        </Tabs>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <TextField
          label="Search Members"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        {isRefreshing && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 1, bgcolor: '#e3f2fd' }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2">Refreshing data...</Typography>
          </Box>
        )}
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Member Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Business Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Last Commitment</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Inactive Period</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="subtitle1" sx={{ py: 5 }}>
                      No inactive members found matching your criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((member) => {
                    const severity = getInactivitySeverity(member.inactiveDays, member.lastCommitmentDate);
                    
                    return (
                      <TableRow key={member._id} hover>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.businessName || 'N/A'}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone || 'N/A'}</TableCell>
                        <TableCell>
                          {member.lastCommitmentDate ? 
                            format(new Date(member.lastCommitmentDate), 'MMM dd, yyyy') : 
                            <Chip 
                              size="small" 
                              label="Never committed" 
                              color="secondary"
                              variant="outlined"
                            />
                          }
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`${member.inactiveDays} days`}
                            color={severity.color}
                            size="small"
                            icon={severity.icon}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={severity.label} 
                            color={severity.color}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Inactivate Member">
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<BlockIcon />}
                              onClick={() => openConfirmDialog(member._id, member.name)}
                              sx={{ borderRadius: 2 }}
                            >
                              Inactivate
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredMembers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <BlockIcon color="error" sx={{ verticalAlign: 'middle', mr: 1 }} />
          {"Confirm Member Inactivation"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to inactivate <strong>{confirmDialog.userName}</strong>? 
            This will prevent them from accessing the platform until they are reactivated.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleInactivateMember(confirmDialog.userId)}
            color="error" 
            variant="contained"
            autoFocus
          >
            Inactivate
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MembersnotCommiting;
