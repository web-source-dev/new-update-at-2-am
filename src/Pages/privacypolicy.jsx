import React from 'react';
import { Box, Container, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
}));

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const PrivacyPolicy = () => {
  // ... existing state ...


  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 6 }}>
          Privacy Policy
        </Typography>
        <StyledPaper elevation={1}>
          <Section>
            <Typography variant="h4" gutterBottom>
              1. Information We Collect
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Personal Information: Name, email address, phone number, and business details provided during registration and account management." />
              </ListItem>
              <ListItem>
                <ListItemText primary="Transaction Data: Information related to deals and commitments made through our platform." />
              </ListItem>
              <ListItem>
                <ListItemText primary="Usage Data: Information about how you interact with our platform, including access times, pages viewed, and features used." />
              </ListItem>
            </List>
          </Section>

          <Section>
            <Typography variant="h4" gutterBottom>
              2. How We Use Your Information
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="To facilitate communications between distributors and Coop members." />
              </ListItem>
              <ListItem>
                <ListItemText primary="To improve our platform's functionality and user experience." />
              </ListItem>
              <ListItem>
                <ListItemText primary="To send important updates about your account and platform features." />
              </ListItem>
              <ListItem>
                <ListItemText primary="To comply with legal obligations and enforce our terms of service." />
              </ListItem>
            </List>
          </Section>

          <Section>
            <Typography variant="h4" gutterBottom>
              3. Information Sharing
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="We may share data with trusted service providers who assist in operating our platform." />
              </ListItem>
              <ListItem>
                <ListItemText primary="We do not sell or rent your personal information to third parties." />
              </ListItem>
            </List>
          </Section>

          <Section>
            <Typography variant="h4" gutterBottom>
              4. Data Security
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="We implement appropriate technical and organizational measures to protect your data." />
              </ListItem>
              <ListItem>
                <ListItemText primary="We regularly review and update our security practices to maintain data protection." />
              </ListItem>
              <ListItem>
                <ListItemText primary="We use industry-standard encryption for data transmission and storage." />
              </ListItem>
            </List>
          </Section>

          <Section>
            <Typography variant="h4" gutterBottom>
              5. Your Rights
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="You have the right to access, correct, or delete your personal information." />
              </ListItem>
              <ListItem>
                <ListItemText primary="You can opt out of marketing communications while maintaining essential service notifications." />
              </ListItem>
              <ListItem>
                <ListItemText primary="You can request a copy of your data or ask questions about our privacy practices." />
              </ListItem>
            </List>
          </Section>

          <Section>
            <Typography variant="h4" gutterBottom>
              6. Payment Information
            </Typography>
            <Typography variant="body1" paragraph>
              Our platform does not process payments. Members and distributors are responsible for coordinating payments externally.
            </Typography>
          </Section>
          <Section>
            <Typography variant="h4" gutterBottom>
              7. Contact Us
            </Typography>
            <Typography variant="body1" paragraph>
              If you have any questions about this Privacy Policy or our data practices, please contact us at <a href="http://info@nmga.com">info@nmga.com</a> or through our <a href={`/support`}>support channel.</a>      .
            </Typography>
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

export default PrivacyPolicy;