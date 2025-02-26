import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import { styled } from '@mui/system';
import { motion } from "framer-motion";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SecurityIcon from '@mui/icons-material/Security';
import PaymentsIcon from '@mui/icons-material/Payments';
import SupportIcon from '@mui/icons-material/Support';
import BusinessIcon from '@mui/icons-material/Business';
import GroupsIcon from '@mui/icons-material/Groups';

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

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px !important',
  marginBottom: '16px',
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: '0 0 16px 0',
  }
}));

const CategoryCard = styled(motion(Paper))({
  padding: '24px',
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
  }
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '28px',
    '&:hover fieldset': {
      borderColor: '#1a237e',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1a237e',
    },
  },
});

const FAQ = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'general', name: 'General', icon: <BusinessIcon fontSize="large" /> },
    { id: 'membership', name: 'Membership', icon: <GroupsIcon fontSize="large" /> },
    { id: 'platform', name: 'Platform', icon: <AccountBalanceIcon fontSize="large" /> },
    { id: 'security', name: 'Security', icon: <SecurityIcon fontSize="large" /> },
    { id: 'support', name: 'Support', icon: <SupportIcon fontSize="large" /> },
  ];

  const faqData = [
    {
      category: 'general',
      question: 'What is NMGA?',
      answer: 'NMGA is a cooperative purchasing platform that connects distributors with Coop members, enabling them to access exclusive deals and streamline their purchasing processes.'
    },
    {
      category: 'membership',
      question: 'How do I become a member?',
      answer: 'You can become a member by registering on our platform. Choose between a distributor or Coop member account type and follow the registration process.'
    },
    {
      category: 'platform',
      question: 'How does the platform work?',
      answer: 'Our platform facilitates connections between distributors and Coop members. Distributors can list their products and deals, while members can browse and purchase through our secure system.'
    },
    {
      category: 'security',
      question: 'How secure is my data?',
      answer: 'We implement industry-leading security measures to protect your data, including encryption, secure servers, and regular security audits.'
    },
    {
      category: 'support',
      question: 'How can I get help?',
      answer: 'Our support team is available 24/7 through multiple channels including email, phone, and live chat. You can also visit our support center for guides and documentation.'
    },
    {
      category: 'general',
      question: 'What are the benefits of joining NMGA?',
      answer: 'Members benefit from collective purchasing power, exclusive deals, streamlined processes, and a network of trusted partners.'
    },
    {
      category: 'platform',
      question: 'Can I use NMGA on mobile devices?',
      answer: 'Yes, NMGA is fully responsive and works on all devices including smartphones and tablets.'
    },
    {
      category: 'membership',
      question: 'Are there any membership fees?',
      answer: 'Membership fees vary based on your account type and level. Contact our sales team for detailed pricing information.'
    },
    {
      category: 'security',
      question: 'How do you verify members?',
      answer: 'We have a comprehensive verification process that includes business documentation review and identity verification.'
    }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              Frequently Asked Questions
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Find answers to common questions about NMGA
            </Typography>
            <StyledTextField
              fullWidth
              placeholder="Search FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ maxWidth: '600px', mb: 4 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Container>
      </GradientHeroSection>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Categories */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {categories.map((category, index) => (
            <Grid item xs={6} md={2} key={category.id}>
              <CategoryCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedCategory(category.id === selectedCategory ? 'all' : category.id)}
                sx={{
                  bgcolor: category.id === selectedCategory ? 'rgba(26, 35, 126, 0.1)' : 'rgba(255, 255, 255, 0.95)',
                }}
              >
                <Box sx={{ color: '#1a237e', mb: 1 }}>
                  {category.icon}
                </Box>
                <Typography variant="subtitle1" sx={{ color: '#1a237e' }}>
                  {category.name}
                </Typography>
              </CategoryCard>
            </Grid>
          ))}
        </Grid>

        {/* FAQ Accordions */}
        <Box>
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <StyledAccordion
                key={index}
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#1a237e' }} />}
                  sx={{ 
                    '&.Mui-expanded': {
                      minHeight: 64,
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#1a237e' }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </StyledAccordion>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No matching questions found
              </Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2, color: '#1a237e', borderColor: '#1a237e' }}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default FAQ;