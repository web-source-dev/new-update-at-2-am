import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  IconButton,
  Stack,
  Divider,
  Button,
  TextField
} from '@mui/material';
import { Link } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const Footer = () => {
  const footerLinks = {
    company: [
      { title: 'About Us', path: '/about' },
      { title: 'Contact', path: '/contact' },
    ],
    resources: [
      { title: 'How It Works', path: '/howitworks' },
      { title: 'Support', path: '/support' },
      { title: 'FAQ', path: '/faq' }
    ],
    legal: [
      { title: 'Privacy Policy', path: '/privacypolicy' },
      { title: 'Terms of Service', path: '/termsofservice' },
      { title: 'Disclaimer', path: '/disclaimer' }
    ]
  };

  const socialLinks = [
    { icon: <FacebookIcon />, url: 'https://facebook.com' },
    { icon: <TwitterIcon />, url: 'https://twitter.com' },
    { icon: <LinkedInIcon />, url: 'https://linkedin.com' },
    { icon: <InstagramIcon />, url: 'https://instagram.com' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a237e',
        color: 'white',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              NMGA
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
              Transforming group purchasing through innovative solutions and trusted partnerships.
            </Typography>
            <Stack direction="row" spacing={1}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(100, 255, 218, 0.2)',
                    }
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Company
                </Typography>
                <Stack spacing={1}>
                  {footerLinks.company.map((link, index) => (
                    <MuiLink
                      key={index}
                      component={Link}
                      to={link.path}
                      sx={{
                        color: 'white',
                        opacity: 0.8,
                        textDecoration: 'none',
                        '&:hover': {
                          opacity: 1,
                          color: '#64ffda'
                        }
                      }}
                    >
                      {link.title}
                    </MuiLink>
                  ))}
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Resources
                </Typography>
                <Stack spacing={1}>
                  {footerLinks.resources.map((link, index) => (
                    <MuiLink
                      key={index}
                      component={Link}
                      to={link.path}
                      sx={{
                        color: 'white',
                        opacity: 0.8,
                        textDecoration: 'none',
                        '&:hover': {
                          opacity: 1,
                          color: '#64ffda'
                        }
                      }}
                    >
                      {link.title}
                    </MuiLink>
                  ))}
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Legal
                </Typography>
                <Stack spacing={1}>
                  {footerLinks.legal.map((link, index) => (
                    <MuiLink
                      key={index}
                      component={Link}
                      to={link.path}
                      sx={{
                        color: 'white',
                        opacity: 0.8,
                        textDecoration: 'none',
                        '&:hover': {
                          opacity: 1,
                          color: '#64ffda'
                        }
                      }}
                    >
                      {link.title}
                    </MuiLink>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
              Subscribe to our newsletter for updates and exclusive offers.
            </Typography>
            <Box component="form" noValidate>
              <TextField
                fullWidth
                placeholder="Enter your email"
                variant="outlined"
                size="small"
                sx={{
                  mb: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#64ffda',
                    },
                  },
                }}
              />
              <Button
                fullWidth
                variant="contained"
                sx={{
                  bgcolor: '#64ffda',
                  color: '#1a237e',
                  '&:hover': {
                    bgcolor: '#00bfa5'
                  }
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {new Date().getFullYear()} NMGA. All rights reserved.
          </Typography>
          <Box sx={{ mt: { xs: 2, sm: 0 } }}>
            <Stack direction="row" spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ fontSize: 20, mr: 0.5 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  New Mexico, USA
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ fontSize: 20, mr: 0.5 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  +1 (505) 200-0000
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ fontSize: 20, mr: 0.5 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  info@nmga.com
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;