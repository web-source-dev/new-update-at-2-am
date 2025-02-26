import React from 'react';
import { Box, Container, Typography, Paper, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)'
  }
}));

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(5),
  '&:last-child': {
    marginBottom: 0
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: 0,
    width: '60px',
    height: '3px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px'
  }
}));


const TermsOfService = () => {


  return (
    <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <Fade in={true} timeout={1000}>
          <div>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              sx={{ 
                textAlign: 'center', 
                mb: 8,
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Terms of Service
            </Typography>
            <StyledPaper elevation={1}>
  <Section>
    <SectionTitle variant="h4" gutterBottom>
      1. Acceptance of Terms
    </SectionTitle>
    <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
      By accessing and using the NMGA platform, you agree to:
    </Typography>
    <ul>
      <li>Be bound by these Terms of Service and all applicable laws and regulations.</li>
      <li>Refrain from using or accessing the platform if you disagree with any of these terms.</li>
    </ul>
  </Section>

  <Section>
    <SectionTitle variant="h4" gutterBottom>
      2. Platform Usage
    </SectionTitle>
    <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
      Users must:
    </Typography>
    <ul>
      <li>Use the NMGA platform to connect distributors and Coop members for business opportunities.</li>
      <li>Provide accurate and complete information.</li>
      <li>Maintain the security of their account credentials.</li>
    </ul>
  </Section>

  <Section>
    <SectionTitle variant="h4" gutterBottom>
      3. Deal Commitments
    </SectionTitle>
    <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
      Users agree that:
    </Typography>
    <ul>
      <li>All commitments made through the platform are binding agreements.</li>
      <li>They must honor their commitments and fulfill deals as agreed.</li>
    </ul>
  </Section>

  <Section>
    <SectionTitle variant="h4" gutterBottom>
      4. Payments and Fees
    </SectionTitle>
    <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
      Note: NMGA does not process or facilitate payments through the platform. Users are responsible for handling payments independently.
    </Typography>
    <ul>
      <li>No transaction fees are charged by NMGA.</li>
      <li>Users must negotiate and manage payments externally.</li>
      <li>All financial obligations must be settled outside the platform.</li>
    </ul>
  </Section>

  <Section>
    <SectionTitle variant="h4" gutterBottom>
      5. Privacy and Data
    </SectionTitle>
    <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
      User data is protected under our Privacy Policy:
    </Typography>
    <ul>
      <li>Users retain ownership of their content.</li>
      <li>NMGA is granted the necessary licenses to operate the platform.</li>
    </ul>
  </Section>

  <Section>
    <SectionTitle variant="h4" gutterBottom>
      6. Modifications
    </SectionTitle>
    <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
      NMGA reserves the right to modify these terms at any time. Users will:
    </Typography>
    <ul>
      <li>Be notified of significant changes.</li>
      <li>Accept modified terms by continuing to use the platform.</li>
    </ul>
  </Section>
</StyledPaper>

            <Box sx={{ mt: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Last updated: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </div>
        </Fade>
      </Container>
    </Box>
  );
};

export default TermsOfService;