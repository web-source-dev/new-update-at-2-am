import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  IconButton,
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  MobileStepper,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import axios from 'axios';
import { styled } from '@mui/material/styles';

// Styled components for better design
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '8px',
    background: theme.palette.background.default
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  borderRadius: '4px',
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease-in-out',
  },
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const MediaScrollContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  overflowX: 'auto',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  '&::-webkit-scrollbar': {
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.paper,
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.primary.main,
    borderRadius: '4px',
    '&:hover': {
      background: theme.palette.primary.dark,
    },
  },
}));

const MediaCard = styled(Card)(({ theme }) => ({
  minWidth: '300px',
  borderRadius: '4px',
  overflow: 'hidden',
  cursor: 'pointer'
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
    transform: 'scale(1.1)',
    transition: 'all 0.2s ease-in-out',
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
}));

const DisplaySplashContent = ({ content = [], preview = false, onClose}) => {
  // Store the original content array in state to prevent it from changing
  const [contentArray, setContentArray] = useState([]);
  const [contentIndex, setContentIndex] = useState(0);
  const [currentContent, setCurrentContent] = useState({});
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  const [selectedMedia, setSelectedMedia] = useState(null);

  // Initialize contentArray from props when component mounts or content changes
  useEffect(() => {
    if (content && content.length > 0) {
      console.log('Content length received:', content.length);
      setContentArray(content);
      setCurrentContent(content[contentIndex] || {});
    }
  }, [content]); // Only depend on content prop changes, not contentIndex
  
const EnlargedMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.common.white,
  padding: theme.spacing(2),
  borderRadius: '8px',
  '& img, & video': {
    maxWidth: '800px',
    maxHeight: '600px',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
    borderRadius: '4px',
    backgroundColor: theme.palette.common.white,
  },
}));

const handleMediaClick = (media) => {
  setSelectedMedia(media);
};

const handleCloseMedia = () => {
  setSelectedMedia(null);
};

  // Update current content when contentIndex changes
  useEffect(() => {
    if (contentArray && contentArray.length > 0) {
      setCurrentContent(contentArray[contentIndex]);
    }
  }, [contentArray, contentIndex]);

  useEffect(() => {
    if (!preview && currentContent && currentContent.isActive) {
      const sessionId = localStorage.getItem('token');
      const viewedSplashKey = `splash_viewed_${currentContent._id}_${sessionId}`;
      const hasViewed = localStorage.getItem(viewedSplashKey);

      if (hasViewed) {
        setOpen(false);
      } else {
        localStorage.setItem(viewedSplashKey, 'true');
        if (currentContent.scheduling.showOnlyOnce) {
          localStorage.setItem(`splash_last_viewed_${currentContent._id}`, new Date().toISOString());
        }
      }
    }
  }, [currentContent, preview]);

  const handleClose = useCallback(() => {
    setOpen(false);
    if (onClose) onClose();
  }, [onClose]);

  const handleNext = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex === currentContent.cards.length - 1 ? 0 : prevIndex + 1));
  };

  const handlePrevious = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex === 0 ? currentContent.cards.length - 1 : prevIndex - 1));
  };

  const handleNextSplash = () => {
    if (contentArray && contentArray.length > 1) {
      const nextIndex = contentIndex === contentArray.length - 1 ? 0 : contentIndex + 1;
      setContentIndex(nextIndex);
      setCurrentCardIndex(0); // Reset card index when moving to next splash
      // Force update current content to ensure immediate UI update
      setCurrentContent(contentArray[nextIndex]);
    }
  };

  if (!currentContent || !currentContent.cards) {
    return <CircularProgress />;
  }

  const currentCard = currentContent.cards[currentCardIndex];

  return (
  <Box sx={{ position: 'relative' }}>
    <StyledDialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
    >
      <Paper elevation={3} sx={{ position: 'relative', bgcolor: 'background.paper', borderRadius: '16px' }}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            zIndex: 1,
            color: 'text.primary',
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'primary.light',
              color: 'common.white',
            },
          }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StyledTypography variant="h4" sx={{ mb: 1 }}>
                {currentCard.title}
              </StyledTypography>
              {currentCard.subheading && (
                <StyledTypography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                  {currentCard.subheading}
                </StyledTypography>
              )}
            </Grid>
            
            {currentCard.media && currentCard.media.length > 0 && (
              <Grid item xs={12}>
                <MediaScrollContainer>
                  {currentCard.media.map((media, index) => (
                    <MediaCard key={index} onClick={() => handleMediaClick(media)} sx={{ cursor: 'pointer' }}>
                      {media.type === 'video' ? (
                        <video
                          src={media.url}
                          controls
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <CardMedia
                          component="img"
                          image={media.url}
                          alt={`Media ${index + 1}`}
                          sx={{
                            height: 200,
                            objectFit: 'cover',
                          }}
                        />
                      )}
                    </MediaCard>
                  ))}
                </MediaScrollContainer>
              </Grid>
            )}

            <Grid item xs={12}>
              <Card sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: '12px',
                boxShadow: 3,
              }}>
                <CardContent>
                  <StyledTypography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                    {currentCard.content}
                  </StyledTypography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mt: 3,
                    flexWrap: 'wrap',
                    justifyContent: 'flex-start'
                  }}>
                    {currentCard.ctaButtons?.map((button, index) => (
                      <StyledButton
                        key={index}
                        variant="contained"
                        onClick={() => window.location.href = button.link}
                      >
                        {button.text}
                      </StyledButton>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 2,
              mt: 4 
            }}>
              {currentContent.cards.length > 0 && (
                <>
                  <Tooltip title="Previous card" arrow placement="top">
                    <span> {/* Wrapper needed for disabled buttons */}
                      <NavigationButton 
                        onClick={handlePrevious} 
                        disabled={currentCardIndex === 0}
                        aria-label="previous card"
                      >
                        <NavigateBeforeIcon />
                      </NavigationButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Next card" arrow placement="top">
                    <span> {/* Wrapper needed for disabled buttons */}
                      <NavigationButton 
                        onClick={handleNext} 
                        disabled={currentCardIndex === currentContent.cards.length - 1}
                        aria-label="next card"
                      >
                        <NavigateNextIcon />
                      </NavigationButton>
                    </span>
                  </Tooltip>
                </>
              )}
            </Box>
        </Box>
      </Paper>
    </StyledDialog>

    <MediaModal open={Boolean(selectedMedia)} onClose={handleCloseMedia} onClick={handleCloseMedia}>
      <EnlargedMedia>
        {selectedMedia?.type === 'video' ? (
          <video
            src={selectedMedia?.url}
            controls
            autoPlay
            style={{ maxWidth: '100%', maxHeight: '90vh' }}
          />
        ) : (
          <img
            src={selectedMedia?.url}
            alt="Enlarged media"
            style={{ maxWidth: '100%', maxHeight: '90vh' }}
          />
        )}
        <IconButton
          onClick={handleCloseMedia}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'background.paper',
            color: 'text.primary',
            '&:hover': {
              bgcolor: 'primary.light',
              color: 'common.white',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </EnlargedMedia>
    </MediaModal>
    {contentArray.length > 1 && (
      <Box
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: (theme) => theme.zIndex.modal + 1,
          display: open ? 'block' : 'none'
        }}
      >
        <Tooltip title={`View splash ${contentIndex === contentArray.length - 1 ? 1 : contentIndex + 2} of ${contentArray.length}`} arrow placement="left">
          <NextSplashButton
            variant="contained"
            onClick={handleNextSplash}
            startIcon={<NavigateNextIcon />}
            sx={{
              minWidth: '180px',
              height: '48px',
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(33, 150, 243, 0.9)'
            }}
          >
            Next ({contentIndex + 1}/{contentArray.length})
          </NextSplashButton>
        </Tooltip>
      </Box>
    )}
  </Box>
  );
};

export default DisplaySplashContent;


const MediaModal = styled(Dialog)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  '& .MuiDialog-paper': {
    backgroundColor: theme.palette.common.white,
    maxWidth: '900px',
    maxHeight: '700px',
    width: '90vw',
    height: '90vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '12px',
    overflow: 'hidden'
  },
}));

const NextSplashButton = styled(StyledButton)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 25%, ${theme.palette.primary.light} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: '12px 24px',
  fontSize: '1rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(33, 203, 243, 0.3)',
  transition: 'all 0.4s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'rgba(255, 255, 255, 0.2)',
    transition: 'left 0.4s ease-in-out',
  },
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 100%)`,
    boxShadow: '0 8px 15px rgba(33, 203, 243, 0.5)',
    transform: 'translateY(-4px) scale(1.05)',
    '&:before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(2px)',
    boxShadow: '0 3px 6px rgba(33, 203, 243, 0.3)',
  },
}));
