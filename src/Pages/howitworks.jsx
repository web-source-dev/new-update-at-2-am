import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import { styled } from '@mui/system';
import { motion } from "framer-motion";
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SearchIcon from '@mui/icons-material/Search';
import HandshakeIcon from '@mui/icons-material/Handshake';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentsIcon from '@mui/icons-material/Payments';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { Link } from 'react-router-dom';

// Enhanced Styled Components matching home page theme
const GradientHeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  padding: '120px 0 80px 0',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 150%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)',
  }
}));

const AnimatedCard = styled(motion(Card))({
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
  }
});

const GlassCard = styled(Paper)({
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 16,
  padding: '24px',
  marginBottom: '24px',
});

const StepNumber = styled(Box)({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#1a237e',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
  fontSize: '1.25rem',
  fontWeight: 'bold',
});


const HowItWorks = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const steps = [
    {
      title: 'Create an Account',
      description: 'Sign up as either a distributor or Coop member. Complete your profile and verify your business credentials.',
      icon: <HowToRegIcon fontSize="large" />,
      for: 'both'
    },
    {
      title: 'Browse Deals',
      description: 'Explore available deals or create new ones. Use filters to find exactly what you need.',
      icon: <SearchIcon fontSize="large" />,
      for: 'member'
    },
    {
      title: 'Create Deals',
      description: 'List your products and create attractive deals for Coop members.',
      icon: <StorefrontIcon fontSize="large" />,
      for: 'distributor'
    },
    {
      title: 'Connect',
      description: 'Interact with potential partners, discuss terms, and establish business relationships.',
      icon: <HandshakeIcon fontSize="large" />,
      for: 'both'
    },
  ];

  const benefits = [
    {
      title: 'Verified Partners',
      description: 'All members and distributors are thoroughly vetted to ensure trustworthy transactions.',
      icon: <VerifiedUserIcon fontSize="large" />
    },
    {
      title: 'Growing Network',
      description: 'Join a thriving community of businesses and expand your reach.',
      icon: <GroupAddIcon fontSize="large" />
    },
    {
      "title": "Seamless Deal Management",
      "description": "Easily create, commit, and track deals with a user-friendly interface.",
      "icon": <BusinessCenterIcon fontSize="large" />
    }
    
  ];
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <GradientHeroSection>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography variant="h2" component="h1" 
              sx={{ 
                fontWeight: 700,
                mb: 3,
                fontSize: isMobile ? '2.5rem' : '3.5rem',
              }}>
              How It Works
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Your Guide to Success on NMGA
            </Typography>
          </Box>
        </Container>
      </GradientHeroSection>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Overview Section */}
        <GlassCard sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#1a237e' }}>
            Simple Steps to Get Started
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 4 }}>
            Whether you're a distributor or a Coop member, NMGA makes it easy to connect and do business.
            Follow these simple steps to start your journey.
          </Typography>
        </GlassCard>

        {/* Steps for Members */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#1a237e', mb: 4 }}>
            For Coop Members
          </Typography>
          <Grid container spacing={4}>
            {steps.filter(step => step.for === 'both' || step.for === 'member').map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <AnimatedCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <StepNumber>{index + 1}</StepNumber>
                    <Box sx={{ color: '#1a237e', mb: 2 }}>{step.icon}</Box>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {step.description}
                    </Typography>
                  </CardContent>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Steps for Distributors */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#1a237e', mb: 4 }}>
            For Distributors
          </Typography>
          <Grid container spacing={4}>
            {steps.filter(step => step.for === 'both' || step.for === 'distributor').map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <AnimatedCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <StepNumber>{index + 1}</StepNumber>
                    <Box sx={{ color: '#1a237e', mb: 2 }}>{step.icon}</Box>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {step.description}
                    </Typography>
                  </CardContent>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Benefits Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#1a237e', mb: 4 }}>
            Platform Benefits
          </Typography>
          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={4} key={index}>
                <AnimatedCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ color: '#1a237e', mb: 2 }}>{benefit.icon}</Box>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#1a237e' }}>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Join NMGA today and start growing your business.
          </Typography>
          <Button
            component={Link}
            to="/register"
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#1a237e',
              '&:hover': {
                bgcolor: '#0d47a1'
              },
              mr: 2
            }}
          >
            Sign Up Now
          </Button>
          <Button
            component={Link}
            to="/contact"
            variant="outlined"
            size="large"
            sx={{
              color: '#1a237e',
              borderColor: '#1a237e',
              '&:hover': {
                borderColor: '#0d47a1',
                bgcolor: 'rgba(26, 35, 126, 0.1)'
              }
            }}
          >
            Contact Us
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorks;