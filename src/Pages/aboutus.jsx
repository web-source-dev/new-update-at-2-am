import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Avatar,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/system';
import { motion } from "framer-motion";
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HandshakeIcon from '@mui/icons-material/Handshake';
import TimelineIcon from '@mui/icons-material/Timeline';
import SecurityIcon from '@mui/icons-material/Security';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

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

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  marginBottom: 2,
  backgroundColor: '#1a237e',
}));


const AboutUs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const benefits = [
    {
      title: 'For Distributors',
      description: 'Access a wide network of Coop members, streamline your sales process, and grow your business with our platform.',
      icon: <BusinessIcon fontSize="large" />,
    },
    {
      title: 'For Coop Members',
      description: 'Benefit from collective purchasing power, access exclusive deals, and save money on your purchases.',
      icon: <GroupIcon fontSize="large" />,
    },
    {
      title: 'Growth Opportunities',
      description: 'Join a growing community of businesses and members working together for mutual benefit.',
      icon: <TrendingUpIcon fontSize="large" />,
    },
  ];

  const values = [
    {
      title: 'Trust & Security',
      description: 'We prioritize the security and trust of our members with robust verification processes.',
      icon: <SecurityIcon fontSize="large" />,
    },
    {
      title: 'Innovation',
      description: 'Continuously evolving our platform to meet the changing needs of our community.',
      icon: <TimelineIcon fontSize="large" />,
    },
    {
      title: 'Partnership',
      description: 'Building strong, lasting relationships between distributors and members.',
      icon: <HandshakeIcon fontSize="large" />,
    },
  ];

  const achievements = [
    {
      stat: '10K+',
      label: 'Active Members',
      icon: <GroupIcon fontSize="large" />,
    },
    {
      stat: '$50M+',
      label: 'Total Savings',
      icon: <EmojiEventsIcon fontSize="large" />,
    },
    {
      stat: '95%',
      label: 'Satisfaction Rate',
      icon: <VerifiedUserIcon fontSize="large" />,
    },
  ];

  const testimonials = [
    {
      name: 'John Smith',
      role: 'Distributor',
      content: 'The NMGA platform has transformed how we connect with Coop members. Our sales have increased significantly since joining.',
      avatar: 'JS',
    },
    {
      name: 'Sarah Johnson',
      role: 'Coop Member',
      content: 'Being part of NMGA has given us access to great deals and savings we couldn\'t find anywhere else.',
      avatar: 'SJ',
    },
    {
      name: 'Michael Brown',
      role: 'Distributor',
      content: 'The platform makes it easy to reach potential customers and manage deals efficiently.',
      avatar: 'MB',
    },
  ];


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
              About NMGA
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Empowering Businesses Through Cooperative Purchasing
            </Typography>
          </Box>
        </Container>
      </GradientHeroSection>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Mission Statement */}
        <GlassCard>
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#1a237e' }}>
            Our Mission
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 4 }}>
            NMGA is dedicated to revolutionizing cooperative purchasing by creating a powerful network that connects 
            distributors with Coop members. We strive to foster mutual growth and success through innovative solutions 
            and collaborative opportunities.
          </Typography>
        </GlassCard>

        {/* Achievements Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#1a237e', mb: 4 }}>
            Our Impact
          </Typography>
          <Grid container spacing={4}>
            {achievements.map((achievement, index) => (
              <Grid item xs={12} md={4} key={index}>
                <AnimatedCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ color: '#1a237e', mb: 2 }}>{achievement.icon}</Box>
                    <Typography variant="h3" sx={{ color: '#1a237e', mb: 1 }}>
                      {achievement.stat}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {achievement.label}
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
            Benefits
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

        {/* Values Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#1a237e', mb: 4 }}>
            Our Values
          </Typography>
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} md={4} key={index}>
                <AnimatedCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ color: '#1a237e', mb: 2 }}>{value.icon}</Box>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      {value.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {value.description}
                    </Typography>
                  </CardContent>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Testimonials Section */}
        <Box>
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#1a237e', mb: 4 }}>
            What Our Members Say
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <AnimatedCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <StyledAvatar>{testimonial.avatar}</StyledAvatar>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                      {testimonial.role}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      "{testimonial.content}"
                    </Typography>
                  </CardContent>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutUs;