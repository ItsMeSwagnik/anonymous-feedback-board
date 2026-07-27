// This file is part of midnightntwrk/anon-feed.
// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useState, useEffect } from 'react';
import { AppBar, Box, Typography, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Define wallet interfaces
interface WalletInfo {
  rdns: string;
  name: string;
  icon?: string;
}

/**
 * A simple application level header for the bulletin board application.
 */
export const Header: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);

  useEffect(() => {
    // Check if wallet is already connected
    const checkWallet = async () => {
      try {
        // @ts-ignore - midnight connector API
        if (window.midnight) {
          // @ts-ignore
          const accounts = await window.midnight.request({ method: 'getAccounts' });
          if (accounts && accounts.length > 0) {
            setWalletConnected(true);
            setWalletAddress(`${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
          }
        }
      } catch (error) {
        // Silently fail - wallet not connected yet
        console.log('Wallet not connected');
      }
    };

    checkWallet();
  }, []);

  const handleConnectWallet = async () => {
    // Check for available wallets
    // @ts-ignore
    if (window.midnight?.providers) {
      // @ts-ignore
      const providers = window.midnight.providers as WalletInfo[];
      if (providers.length > 0) {
        setAvailableWallets(providers);
        setWalletDialogOpen(true);
        return;
      }
    }
    
    // Fallback to direct connection if no provider list
    await connectToWallet();
  };

  const connectToWallet = async (walletRdns?: string) => {
    setIsConnecting(true);
    try {
      // @ts-ignore - midnight connector API
      if (!window.midnight) {
        alert('No Midnight wallet extension found. Please install a compatible wallet:\n\n• Lace: https://www.lace.io/\n• 1AM: https://1amwallet.com/');
        return;
      }

      // @ts-ignore
      const accounts = await window.midnight.request({ 
        method: 'enable',
        params: { 
          networkId: 'preprod',
          wallet: walletRdns // Specify wallet if selected
        }
      });
      
      if (accounts && accounts.length > 0) {
        setWalletConnected(true);
        setWalletAddress(`${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
        setWalletDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      if (error.message?.includes('User rejected')) {
        console.log('User rejected connection');
      } else {
        alert(`Failed to connect wallet.\n\nPlease ensure:\n1. A Midnight wallet extension is installed (Lace, 1AM, etc.)\n2. Proof server is running (http://localhost:6300)\n3. Midnight Preprod network is configured in your wallet`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <React.Fragment>
      <AppBar
        position="static"
        data-testid="header"
        sx={{
          backgroundColor: '#000',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
          data-testid="header-logo"
        >
          <img src="/midnight-logo.png" alt="Midnight logo" height={50} style={{ marginRight: 16 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#fff' }}>
            Anonymous Feedback Board
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {walletConnected ? (
            <Chip
              icon={<CheckCircleIcon />}
              label={`Connected: ${walletAddress}`}
              color="success"
              sx={{ 
                bgcolor: 'rgba(76, 175, 80, 0.2)',
                color: '#4CAF50',
                fontWeight: 'bold',
              }}
            />
          ) : (
            <Button
              variant="contained"
              onClick={handleConnectWallet}
              disabled={isConnecting}
              startIcon={<AccountBalanceWalletIcon />}
              sx={{
                background: 'linear-gradient(45deg, #00C9FF 30%, #92FE9D 90%)',
                color: '#000',
                fontWeight: 'bold',
                px: 3,
                py: 1,
                '&:hover': {
                  background: 'linear-gradient(45deg, #00C9FF 50%, #92FE9D 100%)',
                },
                '&:disabled': {
                  background: '#666',
                  color: '#999',
                },
              }}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
        </Box>
      </AppBar>

      {/* Wallet Selection Dialog */}
      <Dialog
        open={walletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: '#1a1a1a',
            color: '#fff',
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>Select Wallet</DialogTitle>
        <DialogContent>
          <List>
            {availableWallets.map((wallet) => (
              <ListItem key={wallet.rdns} disablePadding>
                <ListItemButton onClick={() => connectToWallet(wallet.rdns)}>
                  <ListItemIcon>
                    {wallet.icon ? (
                      <img src={wallet.icon} alt={wallet.name} width={32} height={32} />
                    ) : (
                      <AccountBalanceWalletIcon sx={{ color: '#00C9FF' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={wallet.name}
                    secondary={wallet.rdns}
                    sx={{
                      '& .MuiListItemText-primary': { color: '#fff' },
                      '& .MuiListItemText-secondary': { color: '#888' },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWalletDialogOpen(false)} sx={{ color: '#888' }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};
