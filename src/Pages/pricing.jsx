import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardHeader, Button, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
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

const PriceTypography = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));


const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      title: 'Basic',
      price: '$99',
      period: '/month',
      features: [
        'Access to all basic deals',
        'Standard support',
        'Basic analytics',
        'Up to 5 team members',
        'Email notifications',
      ],
      buttonText: 'Get Started',
      headerColor: 'default',
    },
    {
      title: 'Professional',
      price: '$199',
      period: '/month',
      features: [
        'Access to all deals',
        'Priority support',
        'Advanced analytics',
        'Up to 15 team members',
        'Real-time notifications',
        'Custom branding',
      ],
      buttonText: 'Get Started',
      headerColor: 'primary',
      recommended: true,
    },
    {
      title: 'Enterprise',
      price: '$399',
      period: '/month',
      features: [
        'Access to all deals',
        '24/7 Premium support',
        'Enterprise analytics',
        'Unlimited team members',
        'API access',
        'Custom integration',
        'Dedicated account manager',
      ],
      buttonText: 'Contact Sales',
      headerColor: 'default',
    },
  ];

  const handleSubscribe = (plan) => {
    // Handle subscription logic here
    navigate('/register', { state: { plan } });
  };



  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Pricing Plans
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Choose the Perfect Plan for Your Business
          </Typography>
        </Box>

        {/* Pricing Cards */}
        <Grid container spacing={4} alignItems="stretch">
          {plans.map((plan, index) => (
            <Grid item xs={12} md={4} key={index}>
              <StyledCard>
                <CardHeader
                  title={plan.title}
                  titleTypography={{ align: 'center', variant: 'h4' }}
                  sx={{
                    backgroundColor: plan.headerColor === 'primary' ? 'primary.main' : 'grey.100',
                    color: plan.headerColor === 'primary' ? 'common.white' : 'text.primary',
                  }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <PriceTypography variant="h3" component="div">
                      {plan.price}
                      <Typography variant="subtitle1" component="span" color="text.secondary">
                        {plan.period}
                      </Typography>
                    </PriceTypography>
                  </Box>

                  <List sx={{ mb: 2, flexGrow: 1 }}>
                    {plan.features.map((feature, featureIndex) => (
                      <ListItem key={featureIndex}>
                        <ListItemIcon>
                          <CheckIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    variant={plan.headerColor === 'primary' ? 'contained' : 'outlined'}
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={() => handleSubscribe(plan)}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        {/* Additional Information */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Enterprise Solutions
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Need a custom solution? Contact our sales team to create a plan that perfectly fits your
            organization's needs.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Pricing;