import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link as MuiLink, 
  IconButton, 
  Divider,
  useTheme
} from '@mui/material';
import Link from 'next/link';
import TwitterIcon from '@mui/icons-material/Twitter';
import TelegramIcon from '@mui/icons-material/Telegram';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.paper',
        py: 6,
        mt: 'auto',
        borderTop: `1px solid ${theme.palette.divider}`
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              Perpetua
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Sustainable Real-World Asset Investment Ecosystem on Solana blockchain.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton 
                component="a" 
                href="https://x.com/PerpetuaLtd/" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <TwitterIcon />
              </IconButton>
              <IconButton 
                component="a" 
                href="https://t.me/perpetua" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Telegram"
              >
                <TelegramIcon />
              </IconButton>
              <IconButton 
                component="a" 
                href="https://github.com/Perpetua-tech/Perpetua" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <GitHubIcon />
              </IconButton>
              <IconButton 
                component="a" 
                href="https://linkedin.com/company/perpetua" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Platform
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} href="/invest" color="text.secondary" underline="hover">
                  Invest
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} href="/assets" color="text.secondary" underline="hover">
                  Assets
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} href="/dashboard" color="text.secondary" underline="hover">
                  Dashboard
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} href="/referral" color="text.secondary" underline="hover">
                  Referral Program
                </MuiLink>
              </Box>
            </Box>
          </Grid>

          {/* Resources */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} href="/docs" color="text.secondary" underline="hover">
                  Documentation
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} href="/whitepaper" color="text.secondary" underline="hover">
                  Whitepaper
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} href="/faq" color="text.secondary" underline="hover">
                  FAQ
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} href="/blog" color="text.secondary" underline="hover">
                  Blog
                </MuiLink>
              </Box>
            </Box>
          </Grid>

          {/* Company */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Company
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} href="/about" color="text.secondary" underline="hover">
                  About Us
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} href="/team" color="text.secondary" underline="hover">
                  Team
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} href="/careers" color="text.secondary" underline="hover">
                  Careers
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} href="/contact" color="text.secondary" underline="hover">
                  Contact
                </MuiLink>
              </Box>
            </Box>
          </Grid>

          {/* Legal */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} href="/terms" color="text.secondary" underline="hover">
                  Terms of Service
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} href="/privacy" color="text.secondary" underline="hover">
                  Privacy Policy
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} href="/risk" color="text.secondary" underline="hover">
                  Risk Disclosure
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} href="/compliance" color="text.secondary" underline="hover">
                  Compliance
                </MuiLink>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 6, mb: 4 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Perpetua. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <MuiLink href="https://Perpetua.ltd" color="inherit" underline="hover">
              Perpetua.ltd
            </MuiLink>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 