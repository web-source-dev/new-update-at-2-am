import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, Container, Typography, Grid, Box, Paper, Skeleton, 
  CircularProgress, IconButton, Divider, Card, CardContent, List, ListItem, 
  ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, 
  InputAdornment, Select, MenuItem, FormControl, InputLabel, FormHelperText,
  Avatar, Chip, Fade, Tooltip, Zoom, alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CloudinaryUpload from '../../../Components/cloudinary/cloudinary';
import Toast from '../../../Components/Toast/Toast';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SaveIcon from '@mui/icons-material/Save';
import StraightenIcon from '@mui/icons-material/Straighten';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import CategoryIcon from '@mui/icons-material/Category';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import MediaManager, { MediaSelector, MediaUploader } from '../../../Components/MediaManager';

// Styled components for enhanced design
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.12)',
  }
}));

const SectionHeading = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(3),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: -8,
    width: '40px',
    height: '3px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '10px',
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& svg': {
    color: theme.palette.primary.main,
  }
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  transition: 'all 0.3s ease',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  }
}));

const StyledIconButton = styled(IconButton)(({ theme, color = 'primary' }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  marginLeft: theme.spacing(1),
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(1, 3),
  boxShadow: 'none',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)'
  }
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: 30,
  padding: theme.spacing(1.5, 4),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  transition: 'all 0.3s',
  '&:hover': {
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-3px)'
  }
}));

const SavingsChip = styled(Chip)(({ theme, saving }) => ({
  backgroundColor: saving > 25 
    ? alpha(theme.palette.success.main, 0.15)
    : alpha(theme.palette.primary.main, 0.15),
  color: saving > 25 ? theme.palette.success.dark : theme.palette.primary.dark,
  fontWeight: 600,
  border: 'none',
  borderRadius: 16,
}));

const TierItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  marginBottom: theme.spacing(1.5),
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
    borderColor: alpha(theme.palette.primary.main, 0.3),
  }
}));

const CreateDealSkeleton = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Skeleton variant="text" width={100} height={40} sx={{ mb: 3 }} />
    
    <Fade in={true} timeout={800}>
      <StyledPaper>
        <Skeleton variant="text" width={240} height={40} sx={{ mb: 4 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
              <Skeleton variant="text" width={120} />
            </Box>
            <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2, mb: 3 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
              <Skeleton variant="text" width={150} />
            </Box>
            <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2, mb: 3 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
              <Skeleton variant="text" width={180} />
            </Box>
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2, mb: 3 }} />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
              <Skeleton variant="text" width={140} />
            </Box>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[...Array(3)].map((_, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
              <Skeleton variant="text" width={160} />
            </Box>
            <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2, mb: 3 }} />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
              <Skeleton variant="text" width={130} />
            </Box>
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2, mb: 4 }} />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Skeleton variant="rounded" width={200} height={56} sx={{ borderRadius: 30 }} />
            </Box>
          </Grid>
        </Grid>
      </StyledPaper>
    </Fade>
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

  // Calculate savings
  const calculateSavings = () => {
    if (!originalCost || !discountPrice) return { percent: 0, amount: 0 };
    
    const original = Number(originalCost);
    const discount = Number(discountPrice);
    
    if (isNaN(original) || isNaN(discount) || original <= 0 || discount <= 0 || discount >= original) {
      return { percent: 0, amount: 0 };
    }
    
    const savingsAmount = original - discount;
    const savingsPercent = ((savingsAmount / original) * 100).toFixed(2);
    
    return { percent: savingsPercent, amount: savingsAmount.toFixed(2) };
  };
  
  const savings = calculateSavings();
  const isValidInput = size && originalCost && discountPrice && Number(discountPrice) < Number(originalCost);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
      TransitionComponent={Zoom}
    >
      <DialogTitle sx={{ 
        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 2
      }}>
        <StraightenIcon color="primary" />
        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
          {initialSize ? 'Edit Size Option' : 'Add New Size Option'}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!error && !size}>
                <InputLabel id="size-select-label">Bottle Size</InputLabel>
                <Select
                  labelId="size-select-label"
                  id="size-select"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  label="Bottle Size"
                  sx={{ borderRadius: 2 }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 48 * 4.5,
                        borderRadius: 2,
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
                  sx: { borderRadius: 2 }
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
                  sx: { borderRadius: 2 }
                }}
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                fullWidth
                required
                error={!!error && (!discountPrice || Number(discountPrice) >= Number(originalCost))}
              />
            </Grid>
            
            {isValidInput && (
              <Grid item xs={12}>
                <Paper 
                  elevation={0}
                  sx={{
                    p: 2, 
                    mt: 1, 
                    borderRadius: 2,
                    backgroundColor: (theme) => alpha(theme.palette.success.light, 0.1),
                    border: (theme) => `1px dashed ${alpha(theme.palette.success.main, 0.3)}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Customer Savings:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <SavingsChip 
                        label={`${savings.percent}%`} 
                        saving={Number(savings.percent)}
                        size="small"
                        icon={<PriceChangeIcon />}
                      />
                      <SavingsChip 
                        label={`$${savings.amount}`} 
                        saving={Number(savings.percent)}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            )}
            
            {error && (
              <Grid item xs={12}>
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, bgcolor: 'background.paper' }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            px: 3
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          startIcon={<SaveIcon />}
          sx={{ 
            borderRadius: 2,
            px: 3
          }}
        >
          Save Size
        </Button>
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

    if (Number(tierDiscount) <= 0) {
      setError('Discount price must be greater than 0');
      return;
    }

    onSave({
      tierQuantity: Number(tierQuantity),
      tierDiscount: Number(tierDiscount)
    });
    onClose();
  };

  const isValidInput = tierQuantity && 
                     tierDiscount && 
                     Number(tierQuantity) > Number(minQty || 0) &&
                     Number(tierDiscount) > 0;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
      TransitionComponent={Zoom}
    >
      <DialogTitle sx={{ 
        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 2
      }}>
        <LocalOfferIcon color="primary" />
        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
          {initialTier ? 'Edit Discount Tier' : 'Add Volume Discount Tier'}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Volume discount tiers provide additional discounts when total order commitments reach specified quantities.
        </Typography>
        
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantity Threshold"
                type="number"
                value={tierQuantity}
                onChange={(e) => setTierQuantity(e.target.value)}
                fullWidth
                required
                InputProps={{
                  sx: { borderRadius: 2 },
                  endAdornment: <InputAdornment position="end">units</InputAdornment>,
                }}
                error={!!error && (!tierQuantity || Number(tierQuantity) <= Number(minQty || 0))}
                helperText={`Must be greater than ${minQty || 0} units`}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Discount Price"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  sx: { borderRadius: 2 }
                }}
                value={tierDiscount}
                onChange={(e) => setTierDiscount(e.target.value)}
                fullWidth
                required
                error={!!error && (!tierDiscount || Number(tierDiscount) <= 0)}
                helperText="Enter the absolute discount price for this tier"
              />
            </Grid>
            
            {isValidInput && (
              <Grid item xs={12}>
                <Paper 
                  elevation={0}
                  sx={{
                    p: 2, 
                    mt: 1, 
                    borderRadius: 2,
                    backgroundColor: (theme) => alpha(theme.palette.info.light, 0.1),
                    border: (theme) => `1px dashed ${alpha(theme.palette.info.main, 0.3)}`,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    When total order commitments reach <b>{tierQuantity} units</b> or more, 
                    all purchases will be priced at <b>${tierDiscount}</b> per unit.
                  </Typography>
                </Paper>
              </Grid>
            )}
            
            {error && (
              <Grid item xs={12}>
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, bgcolor: 'background.paper' }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            px: 3
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          startIcon={<SaveIcon />}
          sx={{ 
            borderRadius: 2,
            px: 3
          }}
        >
          Save Tier
        </Button>
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
  
  // Date constraints for timeframe pickers
  const [minEndDate, setMinEndDate] = useState('');
  const today = new Date().toISOString().slice(0, 16);
  
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
      
      // Set min end date if we have a start date from initialData
      if (initialData.dealStartAt) {
        setMinEndDate(new Date(initialData.dealStartAt).toISOString().slice(0, 16));
      }
    } else {
      // For new deals, set default start date to today
      setFormData(prevState => ({
        ...prevState,
        dealStartAt: today
      }));
      setMinEndDate(today);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    // Special handling for dealStartAt
    if (name === 'dealStartAt') {
      // Update the minimum allowed end date when start date changes
      setMinEndDate(value);
      
      // If end date is now before start date, clear it or set it to start date
      if (formData.dealEndsAt && new Date(formData.dealEndsAt) < new Date(value)) {
        setFormData({
          ...formData,
          [name]: value,
          dealEndsAt: '' // Clear the end date since it's now invalid
        });
        return;
      }
    }
    
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            borderRadius: 8,
            px: 3,
            py: 1,
            fontWeight: 500,
            textTransform: 'none',
          }}
        >
          Back to Deals
        </Button>
        
        <Typography variant="h4" component="h1" fontWeight={600} color="primary">
          {initialData ? 'Edit Deal' : 'Create New Deal'}
        </Typography>
      </Box>
      
      <Fade in={true} timeout={800}>
        <StyledPaper>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Basic Information Section */}
              <Grid item xs={12}>
                <SectionHeading>
                  <SectionTitle variant="h6">
                    <LocalOfferIcon />
                    Basic Information
                  </SectionTitle>
                </SectionHeading>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Deal Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      fullWidth
                      required
                      variant="outlined"
                      InputProps={{ sx: { borderRadius: 2 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel id="category-select-label">Category</InputLabel>
                      <Select
                        labelId="category-select-label"
                        id="category-select"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        label="Category"
                        sx={{ borderRadius: 2 }}
                        startAdornment={
                          <InputAdornment position="start">
                            <CategoryIcon fontSize="small" color="primary" />
                          </InputAdornment>
                        }
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              maxHeight: 48 * 4.5,
                              borderRadius: 2,
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
                      InputProps={{ sx: { borderRadius: 2 } }}
                      helperText="Add any special details or conditions for this deal"
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Size Options Section */}
              <Grid item xs={12}>
                <SectionHeading>
                  <SectionTitle variant="h6">
                    <StraightenIcon />
                    Size & Pricing Options
                  </SectionTitle>
                  
                  <ActionButton 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AddIcon />}
                    onClick={handleAddSize}
                  >
                    Add Size
                  </ActionButton>
                </SectionHeading>
                
                {formData.sizes.length === 0 ? (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      textAlign: 'center', 
                      py: 4, 
                      px: 2, 
                      backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
                      border: '1px dashed rgba(0, 0, 0, 0.12)',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      No sizes added yet. Click "Add Size" to add size options for this deal.
                    </Typography>
                    <ActionButton 
                      variant="outlined" 
                      onClick={handleAddSize}
                      startIcon={<AddIcon />}
                    >
                      Add First Size
                    </ActionButton>
                  </Paper>
                ) : (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {formData.sizes.map((sizeObj, index) => {
                      const savingsPercent = (((sizeObj.originalCost - sizeObj.discountPrice) / sizeObj.originalCost) * 100).toFixed(2);
                      const savingsAmount = (sizeObj.originalCost - sizeObj.discountPrice).toFixed(2);
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <StyledCard>
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                                  {sizeObj.size}
                                </Typography>
                                <Box>
                                  <StyledIconButton size="small" onClick={() => handleEditSize(index)}>
                                    <EditIcon fontSize="small" />
                                  </StyledIconButton>
                                  <StyledIconButton size="small" onClick={() => handleDeleteSize(index)} color="error">
                                    <DeleteIcon fontSize="small" />
                                  </StyledIconButton>
                                </Box>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">Original Cost:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  ${sizeObj.originalCost}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">Deal Price:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
                                  ${sizeObj.discountPrice}
                                </Typography>
                              </Box>
                              
                              <Divider sx={{ my: 1.5 }} />
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                                <Typography variant="subtitle2">Customer Savings:</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                  <SavingsChip 
                                    label={`${savingsPercent}%`} 
                                    saving={Number(savingsPercent)}
                                    size="small"
                                  />
                                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                                    Save ${savingsAmount}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </StyledCard>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}

                {formData.sizes.length > 0 && (
                  <Box 
                    sx={{ 
                      mt: 3, 
                      p: 2.5, 
                      borderRadius: 2,
                      backgroundColor: (theme) => alpha(theme.palette.success.light, 0.1),
                      border: '1px dashed rgba(76, 175, 80, 0.3)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 500, color: 'success.dark' }}>
                      Average Customer Savings
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <SavingsChip 
                        label={`${averageSavings.percent}%`} 
                        saving={Number(averageSavings.percent)}
                        icon={<PriceChangeIcon />}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.dark' }}>
                        ${averageSavings.amount}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Grid>

              {/* Deal Volume & Tiers Section */}
              <Grid item xs={12}>
                <SectionHeading>
                  <SectionTitle variant="h6">
                    <StorefrontIcon />
                    Volume Requirements & Tiers
                  </SectionTitle>
                </SectionHeading>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Minimum Quantity for Deal"
                      name="minQtyForDiscount"
                      type="number"
                      value={formData.minQtyForDiscount}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputProps={{ 
                        sx: { borderRadius: 2 },
                        endAdornment: <InputAdornment position="end">units</InputAdornment>,
                      }}
                      helperText="Minimum total quantity required for deal approval"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Single Store Deals"
                      name="singleStoreDeals"
                      value={formData.singleStoreDeals}
                      onChange={handleChange}
                      fullWidth
                      InputProps={{ sx: { borderRadius: 2 } }}
                      helperText="Special conditions for single store deals (optional)"
                    />
                  </Grid>
                </Grid>
              
                {/* Discount Tiers Section */}
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      Volume Discount Tiers
                    </Typography>
                    <ActionButton 
                      variant="outlined" 
                      color="primary" 
                      startIcon={<AddIcon />}
                      onClick={handleAddTier}
                      disabled={!formData.minQtyForDiscount}
                    >
                      Add Tier
                    </ActionButton>
                  </Box>
                  
                  {!formData.minQtyForDiscount && (
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        mb: 2, 
                        borderRadius: 2,
                        backgroundColor: (theme) => alpha(theme.palette.warning.light, 0.1),
                        border: '1px dashed rgba(255, 152, 0, 0.3)'
                      }}
                    >
                      <Typography variant="body2" color="warning.dark">
                        Please set a minimum quantity first before adding discount tiers.
                      </Typography>
                    </Paper>
                  )}
                  
                  {formData.minQtyForDiscount && formData.discountTiers.length === 0 ? (
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        textAlign: 'center', 
                        py: 3, 
                        px: 2, 
                        backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
                        border: '1px dashed rgba(0, 0, 0, 0.12)',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        No discount tiers added yet. Tiers allow for greater discounts at higher total commitment quantities.
                      </Typography>
                      <ActionButton 
                        variant="outlined" 
                        onClick={handleAddTier}
                        startIcon={<AddIcon />}
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Add First Tier
                      </ActionButton>
                    </Paper>
                  ) : (
                    <List sx={{ mt: 1 }}>
                      {formData.discountTiers.map((tier, index) => (
                        <TierItem 
                          key={index}
                          secondaryAction={
                            <Box>
                              <StyledIconButton edge="end" aria-label="edit" onClick={() => handleEditTier(index)}>
                                <EditIcon fontSize="small" />
                              </StyledIconButton>
                              <StyledIconButton edge="end" aria-label="delete" onClick={() => handleDeleteTier(index)} color="error">
                                <DeleteIcon fontSize="small" />
                              </StyledIconButton>
                            </Box>
                          }
                          disablePadding
                          sx={{ p: 2 }}
                        >
                          <Box sx={{ width: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Chip 
                                label={`Tier ${index + 1}`} 
                                size="small" 
                                color="primary" 
                                sx={{ mr: 1.5, fontWeight: 600 }}
                              />
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                ${tier.tierDiscount.toFixed(2)} price at {tier.tierQuantity}+ units
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              All purchases will be at ${tier.tierDiscount.toFixed(2)} per unit when total commitments reach {tier.tierQuantity} units
                            </Typography>
                          </Box>
                        </TierItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Grid>

              {/* Deal Timeframe Section */}
              <Grid item xs={12}>
                <SectionHeading>
                  <SectionTitle variant="h6">
                    <CalendarMonthIcon />
                    Deal Timeframe
                  </SectionTitle>
                </SectionHeading>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Deal Starts At"
                      name="dealStartAt"
                      type="date"
                      value={formData.dealStartAt}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                      InputProps={{ 
                        sx: { borderRadius: 2 },
                      }}
                      inputProps={{
                        min: today, // Restrict to today and future dates
                      }}
                      helperText="Select a date and time from today onwards"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Deal Ends At"
                      name="dealEndsAt"
                      type="date"
                      value={formData.dealEndsAt}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                      InputProps={{ 
                        sx: { borderRadius: 2 },
                      }}
                      inputProps={{
                        min: minEndDate, // Dynamically set based on start date
                      }}
                      helperText={formData.dealStartAt ? "Must be after the start date" : "Please select a start date first"}
                      disabled={!formData.dealStartAt} // Disable until start date is selected
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Images Section */}
              <Grid item xs={12}>
                <SectionHeading>
                  <SectionTitle variant="h6">
                    <InsertPhotoIcon />
                    Product Images
                  </SectionTitle>
                </SectionHeading>
                
                <Box sx={{ mt: 2, mb: 3 }}>
                  <MediaSelector
                    onSelect={handleImageUpload} 
                    onRemove={handleImageRemove}
                    selectedMedia={formData.images}
                  />
                </Box>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <SubmitButton 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={isSubmitting || formData.sizes.length === 0}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  >
                    {isSubmitting ? 'Saving...' : (initialData ? 'Update Deal' : 'Create Deal')}
                  </SubmitButton>
                </Box>
                {formData.sizes.length === 0 && (
                  <Typography variant="body2" color="error" sx={{ mt: 2, textAlign: 'center' }}>
                    Please add at least one size option before submitting
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </StyledPaper>
      </Fade>
      
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
