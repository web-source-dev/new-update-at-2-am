import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Stack,
  Typography,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Card,
  CardContent,
  Grid,
  Container,
  IconButton,
  Tooltip,
  Modal,
  Fade,
  Backdrop,
  FormControl,
  FormLabel,
  InputLabel,
  Divider
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

// Get the API URL directly
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 1
};

const AddMembers = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    contactPerson: '',
    phone: '',
    address: ''
  });
  const [addedStores, setAddedStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Get user data from localStorage
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('user_role');

    if (userId) {
      setUserId(userId);
      setUserRole(userRole);

      // Load added stores
      fetchAddedStores(userId);
    }
  }, []);

  const fetchAddedStores = async (userId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/newmembers/members/${userId}`);
      if (response.data.success) {
        setAddedStores(response.data.members);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      enqueueSnackbar('Failed to load added stores', {
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      enqueueSnackbar('Name and email are required', {
        variant: 'error',
      });
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        ...formData,
        parentUserId: userId // Send the parent user ID from localStorage
      };

      console.log("Making API call to:", `${API_URL}/newmembers/add`);
      console.log("With payload:", payload);

      const response = await axios.post(`${API_URL}/newmembers/add`, payload);

      if (response.data.success) {
        enqueueSnackbar('Store added successfully and invitation sent', {
          variant: 'success',
        });

        // Reset formUpdate 
        setFormData({
          name: '',
          email: '',
          businessName: '',
          contactPerson: '',
          phone: '',
          address: ''
        });

        // Refresh store list
        fetchAddedStores(userId);

        // Close modal
        setOpen(false);
      }
    } catch (error) {
      console.error('Error adding store:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to add store', {
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle viewing store details
  const handleViewStore = (storeId) => {
    navigate(`/dashboard/co-op-member/store-commitment-details/${storeId}`);
  };

  // Only allow adding stores if the user is a distributor or admin
  const canAddStores = userRole === 'distributor' || userRole === 'admin';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Manage Stores</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon color="primary.contrastText" />}
          onClick={() => setOpen(true)}
        >
          Add New Store
        </Button>
      </Box>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Your Added Stores
          </Typography>

          {addedStores.length === 0 ? (
            <Typography variant="body1">You haven't added any stores yet.</Typography>
          ) : (
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Store Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {addedStores.map((store) => (
                    <TableRow key={store._id}>
                      <TableCell>{store.name}</TableCell>
                      <TableCell>{store.email}</TableCell>
                      <TableCell>{store.businessName}</TableCell>
                      <TableCell>{store.phone}</TableCell>
                      <TableCell>
                        <Tooltip title="View Commitments">
                          <IconButton
                            size="small"
                            color="primary.contrastText"
                            aria-label="View store commitments"
                            onClick={() => handleViewStore(store._id)}
                          >
                            <VisibilityIcon color="primary.contrastText" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Add Store Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box sx={modalStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                Add New Store
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton
                size="small"
                onClick={() => setOpen(false)}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3} component="form" onSubmit={handleSubmit}>
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                fullWidth
                required
              />

              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                fullWidth
                required
              />

              <TextField
                label="Store Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Store Name"
                fullWidth
              />

              <TextField
                label="Contact Person"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="Contact Person"
                fullWidth
              />

              <TextField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                fullWidth
              />

              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                fullWidth
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  onClick={() => setOpen(false)}
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  Add Store
                </Button>
              </Box>
            </Stack>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default AddMembers;
