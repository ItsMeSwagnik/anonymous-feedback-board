import React from 'react';
import { AppBar, Box, Typography, Button, Chip, CircularProgress, Tooltip, alpha } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import SyncIcon from '@mui/icons-material/Sync';
import { useWallet } from '../../contexts/WalletContext';
import { WalletPickerDialog } from '../WalletPickerDialog';

export const Header: React.FC = () => {
  const { status, address, walletName, error, availableWallets, connect, selectWallet, disconnect } = useWallet();

  const walletButton = () => {
    if (status === 'connected') {
      return (
        <Tooltip title="Click to disconnect" arrow>
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: '1rem !important', color: '#92FE9D !important' }} />}
            label={`${walletName}: ${address}`}
            onClick={disconnect}
            sx={{
              bgcolor: alpha('#92FE9D', 0.1),
              color: '#92FE9D',
              border: '1px solid rgba(146,254,157,0.3)',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              '&:hover': { bgcolor: alpha('#92FE9D', 0.18) },
            }}
          />
        </Tooltip>
      );
    }

    if (status === 'syncing') {
      return (
        <Chip
          icon={<SyncIcon sx={{ fontSize: '1rem !important', color: '#00C9FF !important', animation: 'spin 1.5s linear infinite', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } }} />}
          label="Wallet syncing…"
          sx={{
            bgcolor: alpha('#00C9FF', 0.08),
            color: '#00C9FF',
            border: '1px solid rgba(0,201,255,0.25)',
            fontWeight: 600,
            fontSize: '0.78rem',
          }}
        />
      );
    }

    if (status === 'connecting' || status === 'picking') {
      return (
        <Button
          variant="contained"
          disabled
          startIcon={<CircularProgress size={14} sx={{ color: '#000' }} />}
          sx={{ background: '#333', color: '#666', fontWeight: 700, px: 2.5, py: 0.8, fontSize: '0.85rem' }}
        >
          {status === 'picking' ? 'Select wallet…' : 'Connecting…'}
        </Button>
      );
    }

    if (status === 'error') {
      return (
        <Tooltip title={error} arrow>
          <Button
            variant="outlined"
            onClick={connect}
            startIcon={<ErrorOutlineIcon />}
            sx={{
              borderColor: 'rgba(255,100,100,0.5)',
              color: '#ff6666',
              fontWeight: 600,
              px: 2.5,
              py: 0.8,
              fontSize: '0.85rem',
              '&:hover': { borderColor: '#ff6666', bgcolor: alpha('#ff4444', 0.08) },
            }}
          >
            Retry Connect
          </Button>
        </Tooltip>
      );
    }

    // disconnected
    return (
      <Button
        variant="contained"
        onClick={connect}
        startIcon={<AccountBalanceWalletIcon />}
        sx={{
          background: 'linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)',
          color: '#000',
          fontWeight: 700,
          px: 2.5,
          py: 0.8,
          fontSize: '0.85rem',
          '&:hover': { background: 'linear-gradient(90deg, #00b8e8 0%, #7de888 100%)' },
        }}
      >
        Connect Wallet
      </Button>
    );
  };

  return (
    <>
      <AppBar
        position="static"
        data-testid="header"
        elevation={0}
        sx={{
          background: 'rgba(10, 10, 15, 0.95)',
          borderBottom: '1px solid rgba(0, 201, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          py: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }} data-testid="header-logo">
          <img src="/midnight-logo.png" alt="Midnight logo" height={36} />
          <Box sx={{ width: '1px', height: 28, bgcolor: 'rgba(0,201,255,0.3)' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
            Anonymous Feedback Board
          </Typography>
          <Chip
            label="Preview"
            size="small"
            sx={{
              bgcolor: alpha('#00C9FF', 0.1),
              color: '#00C9FF',
              border: '1px solid rgba(0,201,255,0.3)',
              fontSize: '0.65rem',
              height: 20,
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>{walletButton()}</Box>
      </AppBar>

      {/* Wallet picker dialog — shown when multiple wallets are detected */}
      <WalletPickerDialog
        open={status === 'picking'}
        wallets={availableWallets}
        onSelect={selectWallet}
        onClose={() => {
          // User dismissed — go back to disconnected
          disconnect();
        }}
      />
    </>
  );
};
