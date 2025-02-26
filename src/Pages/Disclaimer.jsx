import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';

import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
}));

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
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
  

const Disclaimer = () => {
  // ... existing state ...


  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 6 }}>
          Disclaimer
        </Typography>
        <StyledPaper elevation={1}>
  <Section>
    <SectionTitle variant="h4" gutterBottom>
      1. General Disclaimer
    </SectionTitle>
    <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
      The information provided on the NMGA platform is for general informational purposes only. By using our platform, you acknowledge that:
    </Typography>
    <ul>
      <li>NMGA does not guarantee the accuracy, reliability, or completeness of any information provided.</li>
      <li>Users rely on platform content at their own risk.</li>
      <li>NMGA is not responsible for decisions made based on platform content.</li>
    </ul>
  </Section>

  <Section>
    <SectionTitle variant="h4" gutterBottom>
      2. No Business or Legal Advice
    </SectionTitle>
    <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
      The NMGA platform does not provide business, financial, or legal advice. Users should:
    </Typography>
    <ul>
      <li>Consult with professional advisors before making business decisions.</li>
      <li>Independently verify any information before taking action.</li>
      <li>Understand that NMGA is not liable for any losses resulting from reliance on platform content.</li>
    </ul>
  </Section>

  <Section>
    <SectionTitle variant="h4" gutterBottom>
      3. Third-Party Content & Links
    </SectionTitle>
    <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
      The platform may include links to third-party websites or content. NMGA:
    </Typography>
    <ul>
      <li>Does not endorse or control third-party content.</li>
      <li>Is not responsible for the accuracy or reliability of external links.</li>
      <li>Recommends users review third-party terms and policies before engaging.</li>
    </ul>
  </Section>

  <Section>
    <SectionTitle variant="h4" gutterBottom>
      4. No Warranties
    </SectionTitle>
    <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
      The NMGA platform is provided on an "as-is" and "as-available" basis. NMGA makes no warranties, including but not limited to:
    </Typography>
    <ul>
      <li>The platform being uninterrupted, error-free, or secure.</li>
      <li>The accuracy, completeness, or reliability of platform content.</li>
      <li>Freedom from viruses or harmful components.</li>
    </ul>
  </Section>

  <Section>
    <SectionTitle variant="h4" gutterBottom>
      5. Limitation of Liability
    </SectionTitle>
    <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
      NMGA and its affiliates shall not be liable for any direct, indirect, or consequential damages arising from:
    </Typography>
    <ul>
      <li>Use or inability to use the platform.</li>
      <li>Errors or omissions in platform content.</li>
      <li>Unauthorized access to user accounts or data.</li>
    </ul>
  </Section>

  <Section>
    <SectionTitle variant="h4" gutterBottom>
      6. Changes to this Disclaimer
    </SectionTitle>
    <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
      NMGA reserves the right to update this Disclaimer at any time. Users:
    </Typography>
    <ul>
      <li>Will be notified of significant changes.</li>
      <li>Agree to review the Disclaimer periodically.</li>
      <li>Accept modifications by continuing to use the platform.</li>
    </ul>
  </Section>
</StyledPaper>


        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Disclaimer;