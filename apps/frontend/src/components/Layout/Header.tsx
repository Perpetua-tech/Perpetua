import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWallet } from '@contexts/WalletContext';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Invest', path: '/invest' },
  { name: 'Assets', path: '/assets' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'About', path: '/about' },
];

const Header = () => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { connected, connect, disconnect, publicKey } = useWallet();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleWalletMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleWalletMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleDisconnect = () => {
    disconnect();
    handleWalletMenuClose();
  };
  
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Perpetua
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton 
              component={Link}
              href={item.path}
              sx={{ 
                textAlign: 'center',
                color: router.pathname === item.path ? 'primary.main' : 'inherit',
                fontWeight: router.pathname === item.path ? 'bold' : 'normal',
              }}
            >
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton 
            onClick={connected ? handleWalletMenuOpen : connect}
            sx={{ textAlign: 'center' }}
          >
            <ListItemText 
              primary={connected ? truncateAddress(publicKey?.toString() || '') : 'Connect Wallet'} 
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo */}
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              mr: 2,
              display: 'flex',
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
            }}
          >
            Perpetua
          </Typography>

          {/* Mobile menu button */}
          {isMobile ? (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            </>
          ) : (
            <>
              {/* Desktop navigation */}
              <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    component={Link}
                    href={item.path}
                    sx={{ 
                      color: 'text.primary',
                      mx: 1,
                      '&:hover': { color: 'primary.main' },
                      ...(router.pathname === item.path && {
                        color: 'primary.main',
                        fontWeight: 'bold',
                      }),
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
              </Box>

              {/* Wallet connection button */}
              {connected ? (
                <>
                  <Button
                    onClick={handleWalletMenuOpen}
                    startIcon={<AccountBalanceWalletIcon />}
                    variant="outlined"
                    color="primary"
                  >
                    {truncateAddress(publicKey?.toString() || '')}
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleWalletMenuClose}
                  >
                    <MenuItem onClick={() => router.push('/profile')}>My Profile</MenuItem>
                    <MenuItem onClick={() => router.push('/dashboard')}>Dashboard</MenuItem>
                    <MenuItem onClick={handleDisconnect}>Disconnect</MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  onClick={connect}
                  startIcon={<AccountBalanceWalletIcon />}
                  variant="contained"
                  color="primary"
                >
                  Connect Wallet
                </Button>
              )}
            </>
          )}
        </Toolbar>
      </Container>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header; 