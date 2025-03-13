import React, { useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Box, Button, Typography, Tooltip, Chip, Menu, MenuItem, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const WalletConnect: React.FC = () => {
  const { publicKey, disconnect, connected } = useWallet();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // 处理地址复制
  const handleCopyAddress = useCallback(async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString());
      // 可以添加提示复制成功的逻辑
      handleMenuClose();
    }
  }, [publicKey]);

  // 处理断开连接
  const handleDisconnect = useCallback(() => {
    disconnect();
    handleMenuClose();
  }, [disconnect]);

  // 截断地址显示
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!connected) {
    return (
      <Box sx={{ ml: 2 }}>
        <WalletMultiButton className="wallet-button" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleMenuClick}
        endIcon={<KeyboardArrowDownIcon />}
        startIcon={<AccountBalanceWalletIcon />}
        sx={{ borderRadius: '20px' }}
      >
        {publicKey && shortenAddress(publicKey.toString())}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{ 'aria-labelledby': 'wallet-button' }}
      >
        <MenuItem onClick={handleCopyAddress}>
          <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
          复制地址
        </MenuItem>
        <MenuItem onClick={handleDisconnect}>
          <ExitToAppIcon fontSize="small" sx={{ mr: 1 }} />
          断开连接
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default WalletConnect; 