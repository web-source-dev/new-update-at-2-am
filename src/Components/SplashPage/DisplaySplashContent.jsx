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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import axios from 'axios';
import { styled } from '@mui/material/styles';

// Styled components for better design
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: theme.shadows[10],
    background: theme.palette.background.default,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  borderRadius: '30px',
  padding: theme.spacing(1.5, 4),
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'translateY(-2px)',
    transition: 'transform 0.2s ease-in-out',
    boxShadow: theme.shadows[4],
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
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: theme.shadows[3],
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[6],
  },
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
}));

const DisplaySplashContent = ({ content = [], preview = false, onClose }) => {
  const [currentContent, setCurrentContent] = useState(content[0] || {});
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    if (content.length > 0) {
      setCurrentContent(content[0]);
    }
  }, [content]);

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

  if (!currentContent || !currentContent.cards) {
    return <CircularProgress />;
  }

  const currentCard = currentContent.cards[currentCardIndex];

  return (
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
                    <MediaCard key={index}>
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

          {currentContent.cards.length > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 2,
              mt: 4 
            }}>
              <NavigationButton 
                onClick={handlePrevious} 
                disabled={currentCardIndex === 0}
                aria-label="previous card"
              >
                <NavigateBeforeIcon />
              </NavigationButton>
              <NavigationButton 
                onClick={handleNext} 
                disabled={currentCardIndex === currentContent.cards.length - 1}
                aria-label="next card"
              >
                <NavigateNextIcon />
              </NavigationButton>
            </Box>
          )}
        </Box>
      </Paper>
    </StyledDialog>
  );
};

export default DisplaySplashContent;
