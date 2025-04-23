import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  useTheme,
  Fade,
} from "@mui/material";
import { styled } from "@mui/system";
import { motion } from "framer-motion";
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BarChartIcon from '@mui/icons-material/BarChart';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SearchIcon from '@mui/icons-material/Search';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Toast from '../Components/Toast/Toast';

// Enhanced Styled Components
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

const FeatureIcon = styled(Box)({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
  background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
  color: 'white',
});

const HomePage = () => {
      const [isVisible, setIsVisible] = useState({});
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-aos]');
      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < window.innerHeight * 0.75) {
          setIsVisible(prev => ({ ...prev, [section.id]: true }));
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigate = useNavigate();
  const handleToastClose = () => {
    setToast({
      open: false,
      message: '',
      severity: 'success'
    });
  };

  return (
    <>
      {/* Hero Section */}
      <GradientHeroSection>
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography variant="h2" fontWeight="800" gutterBottom>
                    Transform Your
                    <Box component="span" sx={{ color: '#64ffda' }}> Business</Box>
                    <br />
                    with Smart Deals
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                    Connect with distributors, create deals, and grow together in our collaborative marketplace
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/register')}
                        sx={{
                          bgcolor: '#64ffda',
                          color: '#1a237e',
                          '&:hover': {
                            bgcolor: '#00bfa5'
                          },
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem'
                        }}
                      >
                        Get Started Now
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/faq')}
                        sx={{
                          color: '#64ffda',
                          borderColor: '#64ffda',
                          '&:hover': {
                            borderColor: '#00bfa5',
                            bgcolor: 'rgba(100, 255, 218, 0.1)'
                          },
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem'
                        }}
                      >
                        Learn More
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800"
                alt="Hero Image"
                sx={{
                  width: '100%',
                  borderRadius: '20px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  transform: 'perspective(1000px) rotateY(-15deg)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'perspective(1000px) rotateY(-5deg)'
                  }
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </GradientHeroSection>

      {/* Quick Stats Section */}
      <Box sx={{ py: 8, bgcolor: '#f8f9fa' }}>
        <Container>
          <Grid container spacing={4}>
            {[
              { value: '$50M+', label: 'Total Deal Value', icon: <TrendingUpIcon /> },
              { value: '10,000+', label: 'Active Members', icon: <GroupsIcon /> },
              { value: '95%', label: 'Success Rate', icon: <HandshakeIcon /> },
              { value: '500+', label: 'Distributors', icon: <StorefrontIcon /> }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <AnimatedCard sx={{ p: 3, textAlign: 'center' }}>
                  <FeatureIcon>{stat.icon}</FeatureIcon>
                  <Typography variant="h3" fontWeight="bold" sx={{ my: 2 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {stat.label}
                  </Typography>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: 10, bgcolor: '#f8f9fa' }}>
        <Container>
          <Typography variant="h3" fontWeight="800" textAlign="center" gutterBottom>
            How It
            <Box component="span" sx={{ color: '#1a237e' }}> Works</Box>
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Your journey to successful group purchasing in 6 simple steps
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                step: 1,
                title: 'Join Our Network',
                description: 'Complete a simple registration process and verify your business credentials. Get instant access to our platform.',
                icon: <GroupAddIcon sx={{ fontSize: 40 }} />,
                details: ['Quick 5-minute signup', 'Business verification', 'Instant platform access']
              },
              {
                step: 2,
                title: 'Browse Active Deals',
                description: 'Explore current group purchasing opportunities across various categories. Filter by industry, location, or volume.',
                icon: <SearchIcon sx={{ fontSize: 40 }} />,
                details: ['Smart category filters', 'Real-time deal updates', 'Detailed product specs']
              },
              {
                step: 3,
                title: 'Join or Create Deals',
                description: 'Participate in existing deals or initiate new ones. Set your preferred quantity and specifications.',
                icon: <HandshakeIcon sx={{ fontSize: 40 }} />,
                details: ['Flexible quantity options', 'Custom specifications', 'Deal creation wizard']
              },

            ].map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <AnimatedCard
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                  sx={{ height: '100%', p: 3 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography
                      variant="h2"
                      sx={{
                        color: 'rgba(26, 35, 126, 0.1)',
                        fontWeight: 900,
                        mr: 2
                      }}
                    >
                      {step.step}
                    </Typography>
                    <FeatureIcon>{step.icon}</FeatureIcon>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {step.details.map((detail, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: '#00bfa5', mr: 1 }} />
                        <Typography variant="body2">{detail}</Typography>
                      </Box>
                    ))}
                  </Box>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Platform Features */}
      <Box sx={{ py: 10 }}>
        <Container>
          <Typography variant="h3" fontWeight="800" textAlign="center" gutterBottom>
            Platform
            <Box component="span" sx={{ color: '#1a237e' }}> Features</Box>
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Powerful tools and capabilities to enhance your group purchasing experience
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                title: 'Smart Deal Matching',
                description: 'AI-powered system that matches your business with relevant deals based on your purchase history and preferences.',
                icon: <AutoGraphIcon sx={{ fontSize: 40 }} />,
                benefits: [
                  '95% matching accuracy',
                  'Personalized recommendations',
                  'Category-based filtering',
                  'Real-time deal alerts'
                ]
              },
              {
                title: 'Deal Analytics',
                description: 'Comprehensive analytics dashboard to track and optimize your purchasing performance.',
                icon: <BarChartIcon sx={{ fontSize: 40 }} />,
                benefits: [
                  'Cost savings tracker',
                  'Volume analysis',
                  'Trend predictions',
                  'Custom reports'
                ]
              },
              {
                title: 'Communication Hub',
                description: 'Integrated messaging and notification system to facilitate seamless communication between all parties.',
                icon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
                benefits: [
                  'Real-time chat',
                  'Deal announcements',
                  'Member discussions',
                  'Support tickets'
                ]
              },
            ].map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <AnimatedCard
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                  sx={{ height: '100%', p: 3 }}
                >
                  <FeatureIcon>{feature.icon}</FeatureIcon>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {feature.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {feature.benefits.map((benefit, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: '#00bfa5', mr: 1 }} />
                        <Typography variant="body2">{benefit}</Typography>
                      </Box>
                    ))}
                  </Box>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: 10, bgcolor: '#f8f9fa' }}>
        <Container>
          <Typography variant="h3" fontWeight="800" textAlign="center" gutterBottom>
            Frequently Asked
            <Box component="span" sx={{ color: '#1a237e' }}> Questions</Box>
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Get answers to common questions about our platform
          </Typography>
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {[
                {
                  "question": "How can a distributor create a deal?",
                  "answer": "Distributors can log in to their dashboard, navigate to the 'Create Deal' section, and enter the necessary details such as product name, quantity, pricing, and expiration date. Once submitted, the deal will be available for coop members to commit."
                },
                {
                  "question": "How do coop members commit to a deal?",
                  "answer": "Coop members can browse available deals on their dashboard. When they find a deal they want to commit to, they can enter the quantity they wish to purchase and confirm their commitment."
                },
                {
                  "question": "Is payment processing available on the platform?",
                  "answer": "No, payment processing is not available on the platform. Members and distributors must arrange payments externally."
                },
                {
                  "question": "How do members and distributors handle payments?",
                  "answer": "Since payments are not processed on the platform, members and distributors must coordinate payments directly through their preferred methods."
                },
                {
                  "question": "Can a distributor edit or cancel a deal after it's created?",
                  "answer": "Yes, distributors can edit or cancel a deal as long as no commitments have been made. Once commitments are placed, the distributor may need to coordinate changes directly with committed members."
                },
                {
                  "question": "Can a member cancel their commitment to a deal?",
                  "answer": "Once a commitment is placed, members should reach out to the distributor directly to discuss any changes or cancellations."
                },
                {
                  "question": "How will members know if a deal is still available?",
                  "answer": "Members can see real-time availability on their dashboard. If a deal reaches its maximum commitments or expires, it will no longer be available."
                },
                {
                  "question": "What happens after a member commits to a deal?",
                  "answer": "After committing to a deal, the member's order is recorded. The distributor will then handle order fulfillment and coordinate payment and delivery."
                }
            ].map((faq, index) => (
              <Accordion key={index} sx={{ mb: 2, bgcolor: 'white' }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '&:hover': { bgcolor: 'rgba(100, 255, 218, 0.1)' }
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box sx={{ py: 10, bgcolor: '#1a237e', color: 'white' }}>
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" fontWeight="800" gutterBottom>
                Ready to Start Saving?
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
                Join thousands of businesses already saving through group purchasing
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: '#64ffda',
                  color: '#1a237e',
                  '&:hover': {
                    bgcolor: '#00bfa5'
                  },
                  px: 4,
                  py: 2
                }}
              >
                Join Now
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Toast 
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        handleClose={handleToastClose}
      />  
    </>
  );
};

export default HomePage;
