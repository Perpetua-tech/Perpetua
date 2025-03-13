import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Container,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import WalletConnect from '../wallet/WalletConnect';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = async () => {
    await logout();
    handleProfileMenuClose();
    router.push('/login');
  };

  const navItems = [
    { title: '首页', path: '/' },
    { title: '投资项目', path: '/investments' },
    { title: '交易记录', path: '/transactions' },
    { title: '社区治理', path: '/governance' },
  ];

  const renderNavItems = () => {
    return navItems.map((item) => (
      <Button
        key={item.path}
        color="inherit"
        component={Link}
        href={item.path}
        sx={{
          mx: 1,
          fontWeight: router.pathname === item.path ? 'bold' : 'normal',
          borderBottom: router.pathname === item.path ? '2px solid white' : 'none',
          borderRadius: 0,
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
      >
        {item.title}
      </Button>
    ));
  };

  const renderDrawerItems = () => {
    return (
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.path}
            component={Link}
            href={item.path}
            onClick={handleDrawerToggle}
            selected={router.pathname === item.path}
          >
            <ListItemText primary={item.title} />
          </ListItem>
        ))}
        {!isAuthenticated && (
          <>
            <ListItem button component={Link} href="/login" onClick={handleDrawerToggle}>
              <ListItemText primary="登录" />
            </ListItem>
            <ListItem button component={Link} href="/register" onClick={handleDrawerToggle}>
              <ListItemText primary="注册" />
            </ListItem>
          </>
        )}
      </List>
    );
  };

  return (
    <AppBar position="static" color="primary">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography variant="h6" component={Link} href="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
            Perpetua
          </Typography>

          {!isMobile && <Box sx={{ display: 'flex' }}>{renderNavItems()}</Box>}

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* 钱包连接组件 */}
            <WalletConnect />
            
            {isAuthenticated ? (
              <>
                <Tooltip title="账户设置">
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    size="large"
                    edge="end"
                    color="inherit"
                    sx={{ ml: 2 }}
                  >
                    {user?.name ? (
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                        {user.name[0]}
                      </Avatar>
                    ) : (
                      <AccountCircleIcon />
                    )}
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  keepMounted
                >
                  <MenuItem component={Link} href="/profile" onClick={handleProfileMenuClose}>
                    个人资料
                  </MenuItem>
                  <MenuItem component={Link} href="/dashboard" onClick={handleProfileMenuClose}>
                    控制面板
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>退出登录</MenuItem>
                </Menu>
              </>
            ) : (
              !isMobile && (
                <>
                  <Button color="inherit" component={Link} href="/login" sx={{ ml: 1 }}>
                    登录
                  </Button>
                  <Button color="secondary" variant="contained" component={Link} href="/register" sx={{ ml: 1 }}>
                    注册
                  </Button>
                </>
              )
            )}

            {isMobile && (
              <IconButton edge="end" color="inherit" onClick={handleDrawerToggle} sx={{ ml: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle}>
        <Box sx={{ width: 250 }} role="presentation">
          {renderDrawerItems()}
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar; 