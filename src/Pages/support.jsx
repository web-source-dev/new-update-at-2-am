import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import HelpIcon from '@mui/icons-material/Help';
import ChatIcon from '@mui/icons-material/Chat';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  '& .MuiSvgIcon-root': {
    fontSize: '3rem',
    color: theme.palette.primary.main,
  },
}));


const Support = () => {
  const navigate = useNavigate();

  const supportOptions = [
    {
      title: 'FAQ',
      description: 'Find answers to commonly asked questions about our platform, deals, and services.',
      icon: <HelpIcon />,
      action: () => navigate('/faq'),
      buttonText: 'View FAQs',
    },
    {
      title: 'Email Support',
      description: 'Send us an email for detailed inquiries. We typically respond within 24 hours.',
      icon: <EmailIcon />,
      action: () => navigate('/contact-us'),
      buttonText: 'Send Email',
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our support team during business hours (9 AM - 5 PM EST).',
      icon: <PhoneIcon />,
      action: () => window.location.href = 'tel:+1-555-123-4567',
      buttonText: 'Call Us',
    },
  ];
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Support Center
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            We're Here to Help You Succeed
          </Typography>
        </Box>

        {/* Support Options */}
        <Grid container spacing={4}>
          {supportOptions.map((option, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <StyledCard>
                <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                  <IconWrapper>
                    {option.icon}
                  </IconWrapper>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {option.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {option.description}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={option.action}
                    sx={{ mt: 2 }}
                  >
                    {option.buttonText}
                  </Button>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        {/* Additional Support Information */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Need More Help?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Our dedicated support team is committed to providing you with the best possible assistance.
            Don't hesitate to reach out through any of the channels above.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Business Hours: Monday - Friday, 9 AM - 5 PM EST
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Support;