import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const benefits = [
  {
    icon: <TrendingUpIcon fontSize="large" />,
    title: 'Stable Growth',
    description: 'Invest in real-world assets that provide stable and predictable returns.'
  },
  {
    icon: <AttachMoneyIcon fontSize="large" />,
    title: 'Passive Income',
    description: 'Earn continuous yield from high-quality real assets around the world.'
  },
  {
    icon: <SecurityIcon fontSize="large" />,
    title: 'Asset-Backed',
    description: 'All investments are backed by tangible real-world assets for security.'
  },
  {
    icon: <AccountBalanceIcon fontSize="large" />,
    title: 'Blockchain Transparency',
    description: 'All transactions and yields are transparently recorded on Solana blockchain.'
  }
];

// Featured assets data
const featuredAssets = [
  {
    id: '1',
    title: 'Luxury Villa in Bali',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
    type: 'Real Estate',
    yield: '8.2%',
    value: '$1,250,000',
    funded: 68,
  },
  {
    id: '2',
    title: 'Coffee Plantation',
    image: 'https://images.unsplash.com/photo-1591291263064-564b8556e295',
    type: 'Agriculture',
    yield: '7.5%',
    value: '$850,000',
    funded: 75,
  },
  {
    id: '3',
    title: 'Solar Farm Project',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276',
    type: 'Renewable Energy',
    yield: '9.1%',
    value: '$2,100,000',
    funded: 42,
  }
];

export default function Home() {
  const theme = useTheme();

  return (
    <>
      <Head>
        <title>Perpetua | Real-World Asset Investment Platform</title>
        <meta name="description" content="Invest in tokenized real-world assets and earn stable yield. Perpetua connects DeFi with real-world value." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: 'linear-gradient(to right, #4776E6, #8E54E9)',
          color: 'white',
          pt: { xs: 10, md: 15 },
          pb: { xs: 12, md: 20 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6} className="slide-up">
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  mb: 2,
                }}
              >
                Invest in Real Assets on Blockchain
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 400,
                  mb: 4,
                  opacity: 0.9,
                }}
              >
                Earn stable yield from tokenized real-world assets with transparent performance tracking and community governance.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  href="/assets"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Explore Assets
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  href="/about"
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              {/* Hero image/graphic could go here */}
            </Grid>
          </Grid>
        </Container>
        
        {/* Decoration elements */}
        <Box
          sx={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            top: '-100px',
            right: '-100px',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            bottom: '-50px',
            left: '-50px',
          }}
        />
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 10 }}>
        <Grid container spacing={3}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 25px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 3,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      mb: 2,
                    }}
                  >
                    {benefit.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Assets Section */}
      <Container maxWidth="lg" sx={{ mt: 10, mb: 15 }}>
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Featured Assets
          </Typography>
          <Typography
            variant="h6"
            component="p"
            color="text.secondary"
            sx={{ maxWidth: 800, mx: 'auto' }}
          >
            Explore our curated selection of high-quality real-world assets offering stable yields
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {featuredAssets.map((asset) => (
            <Grid item xs={12} md={4} key={asset.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 25px rgba(0,0,0,0.12)',
                  },
                  overflow: 'hidden',
                  borderRadius: 3,
                }}
              >
                <CardActionArea component={Link} href={`/assets/${asset.id}`}>
                  <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                    <Box
                      component="img"
                      src={asset.image}
                      alt={asset.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s',
                        '&:hover': { transform: 'scale(1.05)' },
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        bgcolor: 'secondary.main',
                        color: 'white',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 5,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {asset.type}
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      {asset.title}
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Annual Yield
                        </Typography>
                        <Typography variant="h6" component="p" color="primary.main" sx={{ fontWeight: 700 }}>
                          {asset.yield}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Asset Value
                        </Typography>
                        <Typography variant="h6" component="p" sx={{ fontWeight: 600 }}>
                          {asset.value}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {asset.funded}% Funded
                      </Typography>
                      <Box
                        sx={{
                          height: 8,
                          bgcolor: 'grey.200',
                          borderRadius: 5,
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: `${asset.funded}%`,
                            bgcolor: 'primary.main',
                            borderRadius: 5,
                          }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Button
            variant="contained"
            size="large"
            component={Link}
            href="/assets"
            endIcon={<ArrowForwardIcon />}
            sx={{ px: 4, py: 1.5 }}
          >
            View All Assets
          </Button>
        </Box>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}
          >
            How It Works
          </Typography>
          
          <Box sx={{ maxWidth: 700, mx: 'auto', textAlign: 'center', mb: 6 }}>
            <Typography variant="h6" component="p" color="text.secondary">
              Perpetua simplifies investing in real-world assets through tokenization,
              giving you access to exclusive opportunities with just a few clicks
            </Typography>
          </Box>
          
          <Grid container spacing={6} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 700,
                    mb: 3,
                    mx: 'auto',
                  }}
                >
                  1
                </Box>
                <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                  Browse Assets
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Explore our curated selection of tokenized real-world assets from various sectors, including real estate, agriculture, and renewable energy.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 700,
                    mb: 3,
                    mx: 'auto',
                  }}
                >
                  2
                </Box>
                <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                  Invest Securely
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Choose your investment amount and complete the transaction securely through our platform, powered by Solana blockchain technology.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 700,
                    mb: 3,
                    mx: 'auto',
                  }}
                >
                  3
                </Box>
                <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                  Earn Yield
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Receive regular yield payments from your investments and track performance with transparent on-chain reporting.
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              href="/how-it-works"
              sx={{ px: 4, py: 1.5 }}
            >
              Learn More About The Process
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Join Community CTA */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)',
          py: 10,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
            Join Our Community
          </Typography>
          <Typography variant="h6" component="p" sx={{ mb: 5, opacity: 0.9 }}>
            Become part of Perpetua's community and participate in governance decisions, earn referral rewards, and stay updated on new investment opportunities.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            href="/register"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
              px: 5,
              py: 2,
            }}
          >
            Sign Up Now
          </Button>
        </Container>
      </Box>
    </>
  );
} 