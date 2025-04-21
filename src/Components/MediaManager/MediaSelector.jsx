import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardActions, 
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import MovieIcon from '@mui/icons-material/Movie';
import MediaSelectorWrapper from './MediaSelectorWrapper';

/**
 * MediaSelector component for selecting media from MediaManager
 * @param {Object} props Component props
 * @param {Array} props.selectedMedia Array of selected media URLs
 * @param {Function} props.onSelect Callback when media is selected (receives media URL)
 * @param {Function} props.onRemove Callback when media is removed (receives index)
 */
const MediaSelector = ({ selectedMedia = [], onSelect, onRemove }) => {
  const [open, setOpen] = useState(false);
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };

  // Used to determine if the media is an image or video
  const getMediaType = (url) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext)) ? 'video' : 'image';
  };
  
  // Handle media selection from the MediaManager
  const handleMediaSelect = (media) => {
    if (media && media.url) {
      // If the onSelect expects just the URL (backward compatibility)
      if (onSelect.length <= 1) {
        onSelect(media.url);
      } else {
        // If onSelect can handle more metadata
        onSelect(media);
      }
      handleClose();
    }
  };
  
  return (
    <Box>
      <Grid container spacing={2}>
        {/* Display selected media */}
        {selectedMedia.map((url, index) => (
          <Grid item xs={6} sm={4} md={3} key={index}>
            <Card variant="outlined" sx={{ 
              position: 'relative',
              height: '100%',
              display: 'flex',
              flexDirection: 'column' 
            }}>
              <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                {getMediaType(url) === 'image' ? (
                  <CardMedia
                    component="img"
                    image={url}
                    alt={`Selected media ${index + 1}`}
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.1)'
                    }}
                  >
                    <video
                      src={url}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                )}
                
                <Chip
                  icon={getMediaType(url) === 'image' ? <ImageIcon /> : <MovieIcon />}
                  label={getMediaType(url) === 'image' ? 'Image' : 'Video'}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    fontSize: '0.7rem',
                    height: 24
                  }}
                />
              </Box>
              
              <CardActions sx={{ p: 0.5, justifyContent: 'flex-end', mt: 'auto' }}>
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => onRemove(index)}
                  aria-label="delete"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
        
        {/* Add media button */}
        <Grid item xs={6} sm={4} md={3}>
          <Button
            onClick={handleOpen}
            variant="outlined"
            sx={{
              height: '100%',
              minHeight: 120,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderStyle: 'dashed',
              borderWidth: 2,
              borderRadius: 1,
              p: 2,
              textAlign: 'center'
            }}
          >
            <AddPhotoAlternateIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="body2">
              Add Media from Library
            </Typography>
          </Button>
        </Grid>
      </Grid>
      
      {/* Media Manager Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, height: '90vh' }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2
        }}>
          <Typography variant="h6">Select Media</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={{ p: 0 }}>
          <MediaSelectorWrapper 
            onMediaSelect={handleMediaSelect} 
            onCancel={handleClose} 
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MediaSelector; 