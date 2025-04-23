import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Grid, Box, Paper, Skeleton, CircularProgress, IconButton, Divider, Card, CardContent, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, Select, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CloudinaryUpload from '../../../Components/cloudinary/cloudinary';
import Toast from '../../../Components/Toast/Toast';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const CreateDealSkeleton = () => (
  <Container>
    <Box sx={{ mb: 4 }}>
      <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2 }} />
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {[...Array(4)].map((_, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1 }} />
                <Skeleton variant="rectangular" height={56} />
              </Box>
            ))}
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1 }} />
              <Skeleton variant="rectangular" height={200} />
            </Box>
            {[...Array(2)].map((_, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1 }} />
                <Skeleton variant="rectangular" height={56} />
              </Box>
            ))}
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Skeleton variant="rectangular" width={100} height={36} />
              <Skeleton variant="rectangular" width={100} height={36} />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  </Container>
);

// Size dialog component
const SizeDialog = ({ open, onClose, onSave, initialSize }) => {
  const [size, setSize] = useState('');
  const [originalCost, setOriginalCost] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [error, setError] = useState('');
  
  // Common bottle sizes
  const bottleSizes = [
    '100ml','187ml', '200ml', '350ml','375ml', '500ml', '700ml', '750ml', '1L', '1.5L', '1.75L', '3L', '5L'
  ];

  useEffect(() => {
    if (initialSize) {
      setSize(initialSize.size);
      setOriginalCost(initialSize.originalCost);
      setDiscountPrice(initialSize.discountPrice);
    } else {
      setSize('');
      setOriginalCost('');
      setDiscountPrice('');
    }
    setError('');
  }, [initialSize, open]);

  const handleSave = () => {
    // Validate
    if (!size || !originalCost || !discountPrice) {
      setError('All fields are required');
      return;
    }

    if (Number(discountPrice) >= Number(originalCost)) {
      setError('Discount price must be less than original cost');
      return;
    }

    onSave({
      size,
      originalCost: Number(originalCost),
      discountPrice: Number(discountPrice)
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialSize ? 'Edit Size' : 'Add Size'}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!error && !size}>
                <InputLabel id="size-select-label">Size</InputLabel>
                <Select
                  labelId="size-select-label"
                  id="size-select"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  label="Size"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 4.5, // 4 items + half item to indicate scrolling
                        overflow: 'auto',
                      },
                    },
                  }}
                >
                  {bottleSizes.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
                {!!error && !size && <FormHelperText>Size is required</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Original Cost"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                value={originalCost}
                onChange={(e) => setOriginalCost(e.target.value)}
                fullWidth
                required
                error={!!error && !originalCost}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Discount Price"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                fullWidth
                required
                error={!!error && (!discountPrice || Number(discountPrice) >= Number(originalCost))}
              />
            </Grid>
            {error && (
              <Grid item xs={12}>
                <Typography color="error" variant="body2">{error}</Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

// Discount tier dialog component
const DiscountTierDialog = ({ open, onClose, onSave, initialTier, minQty }) => {
  const [tierQuantity, setTierQuantity] = useState('');
  const [tierDiscount, setTierDiscount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTier) {
      setTierQuantity(initialTier.tierQuantity);
      setTierDiscount(initialTier.tierDiscount);
    } else {
      setTierQuantity('');
      setTierDiscount('');
    }
    setError('');
  }, [initialTier, open]);

  const handleSave = () => {
    // Validate
    if (!tierQuantity || !tierDiscount) {
      setError('All fields are required');
      return;
    }

    if (Number(tierQuantity) <= Number(minQty || 0)) {
      setError(`Tier quantity must be greater than minimum quantity (${minQty})`);
      return;
    }

    if (Number(tierDiscount) <= 0 || Number(tierDiscount) >= 100) {
      setError('Discount percentage must be between 0 and 100');
      return;
    }

    onSave({
      tierQuantity: Number(tierQuantity),
      tierDiscount: Number(tierDiscount)
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialTier ? 'Edit Discount Tier' : 'Add Discount Tier'}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tier Quantity"
                type="number"
                value={tierQuantity}
                onChange={(e) => setTierQuantity(e.target.value)}
                fullWidth
                required
                error={!!error && (!tierQuantity || Number(tierQuantity) <= Number(minQty || 0))}
                helperText={`Must be greater than ${minQty || 0}`}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Discount Percentage"
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                value={tierDiscount}
                onChange={(e) => setTierDiscount(e.target.value)}
                fullWidth
                required
                error={!!error && (!tierDiscount || Number(tierDiscount) <= 0 || Number(tierDiscount) >= 100)}
              />
            </Grid>
            {error && (
              <Grid item xs={12}>
                <Typography color="error" variant="body2">{error}</Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

const CreateDeal = ({ initialData, onClose, onSubmit }) => {
  const user_id = localStorage.getItem('user_id');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sizes: [],
    distributor: user_id,
    category: '',
    dealEndsAt: '',
    minQtyForDiscount: '',
    discountTiers: [],
    dealStartAt: '',
    singleStoreDeals: '',
    images: [],
  });
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dialogs state
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  // Define categories
  const categories = [
    'AMERICAN WHISKEY', 'BEER', 'BOURBAN', 'BRANDY COGNAC', 'CANADIAN', 'GIN', 'IRISH', 
    'LIQUEURS', 'MIXERS', 'NON-ALCOHOLIC', 'RTD', 'RUM', 'SCOTCH', 'SPARKLING WINE',
    'SPECIALTIES', 'TEQUILA', 'UNKNOWN', 'VODKA','WINE'
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        dealEndsAt: initialData.dealEndsAt ? new Date(initialData.dealEndsAt).toISOString().slice(0, 16) : '',
        dealStartAt: initialData.dealStartAt ? new Date(initialData.dealStartAt).toISOString().slice(0, 16) : '',
        sizes: initialData.sizes || [],
        discountTiers: initialData.discountTiers || []
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const handleImageUpload = (url) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      images: [...prevFormData.images, url]
    }));
  };

  const handleImageRemove = (indexToRemove) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      images: prevFormData.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Size management
  const handleAddSize = () => {
    setSelectedSize(null);
    setSizeDialogOpen(true);
  };

  const handleEditSize = (index) => {
    setSelectedSize({ ...formData.sizes[index], index });
    setSizeDialogOpen(true);
  };

  const handleDeleteSize = (index) => {
    setFormData(prevState => ({
      ...prevState,
      sizes: prevState.sizes.filter((_, i) => i !== index)
    }));
  };

  const handleSaveSize = (sizeData) => {
    if (selectedSize && selectedSize.index !== undefined) {
      // Edit existing size
      const updatedSizes = [...formData.sizes];
      updatedSizes[selectedSize.index] = sizeData;
      setFormData(prevState => ({
        ...prevState,
        sizes: updatedSizes
      }));
    } else {
      // Add new size
      setFormData(prevState => ({
        ...prevState,
        sizes: [...prevState.sizes, sizeData]
      }));
    }
  };

  // Discount tier management
  const handleAddTier = () => {
    setSelectedTier(null);
    setTierDialogOpen(true);
  };

  const handleEditTier = (index) => {
    setSelectedTier({ ...formData.discountTiers[index], index });
    setTierDialogOpen(true);
  };

  const handleDeleteTier = (index) => {
    setFormData(prevState => ({
      ...prevState,
      discountTiers: prevState.discountTiers.filter((_, i) => i !== index)
    }));
  };

  const handleSaveTier = (tierData) => {
    if (selectedTier && selectedTier.index !== undefined) {
      // Edit existing tier
      const updatedTiers = [...formData.discountTiers];
      updatedTiers[selectedTier.index] = tierData;
      
      // Sort by quantity
      const sortedTiers = updatedTiers.sort((a, b) => a.tierQuantity - b.tierQuantity);
      
      setFormData(prevState => ({
        ...prevState,
        discountTiers: sortedTiers
      }));
    } else {
      // Add new tier
      const newTiers = [...formData.discountTiers, tierData];
      
      // Sort by quantity
      const sortedTiers = newTiers.sort((a, b) => a.tierQuantity - b.tierQuantity);
      
      setFormData(prevState => ({
        ...prevState,
        discountTiers: sortedTiers
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // Validate
    if (formData.sizes.length === 0) {
      setToast({
        open: true,
        message: 'Please add at least one size for this deal',
        severity: 'error'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      setLoading(true);
      if (initialData) {
        const updateData = {
          ...formData,
          images: formData.images || [],
        };

        const response = await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/deals/update/${initialData._id}`,
          updateData
        );

        setToast({
          open: true,
          message: 'Deal updated successfully!',
          severity: 'success'
        });
        
        if (onSubmit) {
          onSubmit(response.data);
        }

        navigate(-1);
      } else {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/deals/create/create`, formData);
        setToast({
          open: true,
          message: 'Deal created successfully!',
          severity: 'success'
        });
        if(response.data) {
          navigate(-1);
        }
      }
    } catch (error) {
      setToast({
        open: true,
        message: error.response?.data?.message || 'Failed to save deal.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  if (loading) {
    return <CreateDealSkeleton />;
  }

  // Calculate average savings
  const calculateAverageSavings = () => {
    if (formData.sizes.length === 0) return { percent: 0, amount: 0 };
    
    let totalOriginal = 0;
    let totalDiscount = 0;
    
    formData.sizes.forEach(size => {
      totalOriginal += Number(size.originalCost);
      totalDiscount += Number(size.discountPrice);
    });
    
    const avgOriginal = totalOriginal / formData.sizes.length;
    const avgDiscount = totalDiscount / formData.sizes.length;
    const savingsAmount = avgOriginal - avgDiscount;
    const savingsPercent = ((savingsAmount / avgOriginal) * 100).toFixed(2);
    
    return { percent: savingsPercent, amount: savingsAmount.toFixed(2) };
  };

  const averageSavings = calculateAverageSavings();

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Button 
        variant="outlined" 
        color="primary" 
        onClick={() => navigate(-1)}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back
      </Button>
      
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
          {initialData ? 'Edit Deal' : 'Create New Deal'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Deal Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required size="small">
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 4.5, // 4 items + half item to indicate scrolling
                        overflow: 'auto',
                      },
                    },
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Special Comment"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                size="small"
              />
            </Grid>

            {/* Size Management Section */}
            <Grid item xs={12}>
              <Box sx={{ mb: 1, mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Size Options</Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  onClick={handleAddSize}
                >
                  Add Size
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {formData.sizes.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ my: 2, textAlign: 'center' }}>
                  No sizes added yet. Click "Add Size" to add size options for this deal.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {formData.sizes.map((sizeObj, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card variant="outlined">
                        <CardContent sx={{ pb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h6" component="div">{sizeObj.size}</Typography>
                            <Box>
                              <IconButton size="small" onClick={() => handleEditSize(index)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDeleteSize(index)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Original Cost: ${sizeObj.originalCost}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Discount Price: ${sizeObj.discountPrice}
                          </Typography>
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mt: 1 }}>
                            Savings: {(((sizeObj.originalCost - sizeObj.discountPrice) / sizeObj.originalCost) * 100).toFixed(2)}%
                            (${(sizeObj.originalCost - sizeObj.discountPrice).toFixed(2)})
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {formData.sizes.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.03)', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Average Savings Across All Sizes: {averageSavings.percent}% (${averageSavings.amount})
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Minimum Quantity for Deal"
                name="minQtyForDiscount"
                type="number"
                value={formData.minQtyForDiscount}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                helperText="Minimum total quantity required for deal approval"
              />
            </Grid>

            {/* Discount Tiers Section */}
            <Grid item xs={12}>
              <Box sx={{ mb: 1, mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Discount Tiers</Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  onClick={handleAddTier}
                  disabled={!formData.minQtyForDiscount}
                >
                  Add Tier
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {!formData.minQtyForDiscount && (
                <Typography variant="body2" color="error" sx={{ my: 2 }}>
                  Please set a minimum quantity first before adding discount tiers.
                </Typography>
              )}
              
              {formData.minQtyForDiscount && formData.discountTiers.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ my: 2, textAlign: 'center' }}>
                  No discount tiers added yet. Tiers allow for greater discounts at higher total commitment quantities.
                </Typography>
              ) : (
                <List>
                  {formData.discountTiers.map((tier, index) => (
                    <ListItem 
                      key={index}
                      secondaryAction={
                        <Box>
                          <IconButton edge="end" aria-label="edit" onClick={() => handleEditTier(index)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTier(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                      sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)', mb: 1, borderRadius: 1 }}
                    >
                      <ListItemText
                        primary={`Tier ${index + 1}: ${tier.tierDiscount}% discount at ${tier.tierQuantity}+ units`}
                        secondary={`All commitments will receive ${tier.tierDiscount}% off when total commitments reach ${tier.tierQuantity} units`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Deal Starts At"
                name="dealStartAt"
                type="datetime-local"
                value={formData.dealStartAt}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Deal Ends At"
                name="dealEndsAt"
                type="datetime-local"
                value={formData.dealEndsAt}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Single Store Deals"
                name="singleStoreDeals"
                value={formData.singleStoreDeals}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Upload Images</Typography>
              <CloudinaryUpload 
                onUpload={handleImageUpload} 
                onRemove={handleImageRemove}
                initialImages={formData.images}
              />
            </Grid>

            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={isSubmitting || formData.sizes.length === 0}
                sx={{ 
                  mt: 2,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  initialData ? 'Update Deal' : 'Create Deal'
                )}
              </Button>
              {formData.sizes.length === 0 && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Please add at least one size option before submitting
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Size Dialog */}
      <SizeDialog 
        open={sizeDialogOpen}
        onClose={() => setSizeDialogOpen(false)}
        onSave={handleSaveSize}
        initialSize={selectedSize}
      />
      
      {/* Discount Tier Dialog */}
      <DiscountTierDialog 
        open={tierDialogOpen}
        onClose={() => setTierDialogOpen(false)}
        onSave={handleSaveTier}
        initialTier={selectedTier}
        minQty={formData.minQtyForDiscount}
      />
      
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        handleClose={handleCloseToast}
      />
    </Container>
  );
};

export default CreateDeal;
