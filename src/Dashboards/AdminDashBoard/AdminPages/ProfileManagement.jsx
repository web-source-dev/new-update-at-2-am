import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, json, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button, Container, Typography, Paper, Grid, CircularProgress, Tabs, Tab, Box, Avatar, Card, CardContent, CardActions, Divider, TablePagination, Pagination, Skeleton } from '@mui/material';
import { Person, Block, LockOpen, ArrowBack, Login } from '@mui/icons-material';
import Toast from '../../../Components/Toast/Toast'; // Import Toast component
import AnnouncementToast from '../../../Components/Toast/announcmentToast';
import ManageDeals from '../../DistributerDashboard/DistributerPages/ManageDeals';
import Commitments from '../../DashBoardComponents/Commitment';
import useMediaQuery from '@mui/material/useMediaQuery';
import MemberSettings from '../../../Dashboards/ProcurementDashboard/memberPages/MemberSettings';

const ProfileSkeleton = () => (
  <Container>
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Skeleton variant="circular" width={150} height={150} />
            <Skeleton variant="text" sx={{ fontSize: '1.5rem', mt: 2, width: '80%' }} />
            <Skeleton variant="text" sx={{ width: '60%' }} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2 }} />
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} variant="text" sx={{ mb: 1 }} />
            ))}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  </Container>
);

const ProfileManagement = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const isMobile = useMediaQuery('(max-width:600px)');
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  console.log('userId', userId);

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast({ open: false, message: '', severity: 'success' });
  };

  useEffect(() => {
    if (!userId) {
      console.error('No userId provided');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/v2/profile/${userId}`);
        setUser(response.data);
        localStorage.setItem('commitmentRole', response.data.role);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
      }
    };

    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/common/logs/${userId}`);
        setLogs(response.data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    const user_role = localStorage.getItem('user_role');
    setUserRole(user_role);

    fetchUser();
    fetchLogs();

    // Check for the 'tab' query parameter
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'settings') {
      setTabIndex(3); // Set to the index of the Settings tab
    }
  }, [userId, location.search]);

  const handleBlockUser = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/block-user`, { userId });
      setUser({ ...user, isBlocked: true });
      showToast(response.data.message);
    } catch (error) {
      console.error('Error blocking user:', error);
      showToast(error.response.data.message, 'error');
    }
  };

  const handleUnblockUser = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/unblock-user`, { userId });
      setUser({ ...user, isBlocked: false });
      showToast(response.data.message);
    } catch (error) {
      console.error('Error unblocking user:', error);
      showToast(error.response.data.message, 'error');
    }
  };
  const commitmentRole = localStorage.getItem('commitmentRole');

  const handleLoginAsUser = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, { email: user.email, login_key: user.login_key });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user_id', response.data.user_id);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        showToast(response.data.message);
        switch (response.data.user.role) {
          case 'member':
            window.location.href = '/dashboard/co-op-member';
            break;
          case 'distributor':
            window.location.href = '/dashboard/distributor';
            break;
          case 'admin':
            window.location.href = '/dashboard/admin';
            break;
          default:
            break;
        }
      }
    } catch (error) {
      console.error('Error logging in as user:', error);
      showToast(error.response.data.message, 'error');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedLogs = logs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (!user || loading) {
    return <ProfileSkeleton />;
  }

  return (
    <Container>
        <AnnouncementToast event="signup" />
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
      <Card elevation={3} sx={{ mt: 2, p: 3, position: 'relative' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
                {user.logo ? <img src={user.logo} alt="User Logo" style={{ width: '100%' }} /> : getInitials(user.name)}
              </Avatar>
            </Grid>
            <Grid item>
              <Typography variant="h5" gutterBottom>{user.name || 'No Name'}</Typography>
              <Typography variant="body2" color="textSecondary">{user.email}</Typography>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} sx={{ mb: 2 }}>
          <Tab label="Profile" />
          <Tab label="Activity Logs" />
          <Tab label="Commitments" />
          <Tab label="Settings" />
          {commitmentRole !== 'member' && (
            <Tab label="Deals Managment" />
          )}
        </Tabs>
        <Box hidden={tabIndex !== 0} sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><Typography variant="body1"><strong>Business:</strong> {user.businessName || 'N/A'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="body1"><strong>Role:</strong> {user.role || 'N/A'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="body1"><strong>Contact:</strong> {user.contactPerson || 'N/A'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="body1"><strong>Phone:</strong> {user.phone || 'N/A'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="body1"><strong>Address:</strong> {user.address || 'N/A'}</Typography></Grid>
          </Grid>
        </Box>
        <Box hidden={tabIndex !== 1} sx={{ p: 2 }}>
          {logs.length > 0 ? (
            <>
              {paginatedLogs.map(log => (
                <Paper key={log._id} sx={{ p: 2, mb: 1 }}>
                  <Typography variant="body2"><strong>Message:</strong> {log.message}</Typography>
                  <Typography variant="body2"><strong>Type:</strong> {log.type}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(log.createdAt).toLocaleString()}
                  </Typography>
                </Paper>
              ))}
              <Box sx={{ 
                mt: 3, 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap'
              }}>
                <TablePagination
                  component="div"
                  count={logs.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                  sx={{
                    '.MuiTablePagination-select': {
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                    },
                    '.MuiTablePagination-selectIcon': {
                      color: 'primary.main',
                    },
                  }}
                />
                <Pagination
                  count={Math.ceil(logs.length / rowsPerPage)}
                  page={page + 1}
                  onChange={(e, p) => setPage(p - 1)}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 1,
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      },
                    },
                  }}
                />
              </Box>
            </>
          ) : (
            <Typography variant="body2">No logs found.</Typography>
          )}
        </Box>
        <Box hidden={tabIndex !== 2} sx={{ p: 2 }}>
          <Commitments userId={userId} />
        </Box>
        <Box hidden={tabIndex !== 3} sx={{ p: 2 }}> {/* New Settings Tab Content */}
          <MemberSettings userId={userId} /> {/* Call UserSettings component */}
        </Box>
        {userRole !== 'member' && (
        <Box hidden={tabIndex !== 4} sx={{ p: 2 }}> {/* New Settings Tab Content */}
          <ManageDeals userId={userId} /> {/* Call UserSettings component */}
        </Box>
        )}
        <CardActions sx={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          {localStorage.getItem('user') ? (
            ''
          ):(
            <>
              {userRole === 'admin' && (
                <>
                  {user.isBlocked ? (
                <Button startIcon={<LockOpen />} color="secondary" onClick={handleUnblockUser}>Unblock</Button>
              ) : (
                <Button startIcon={<Block />} color="error" onClick={handleBlockUser}>Block</Button>
              )}
                <Button startIcon={<Login />} onClick={handleLoginAsUser}>Login as User</Button>
            </>
          )}
            </>
          )}
        </CardActions>
      </Card>
      <Toast open={toast.open} message={toast.message} severity={toast.severity} handleClose={handleCloseToast} />
    </Container>
  );
};

export default ProfileManagement;
