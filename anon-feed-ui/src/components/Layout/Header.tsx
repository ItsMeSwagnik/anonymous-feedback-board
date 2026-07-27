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
import { AppBar, Box, Typography, Button, Chip } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/**
 * A simple application level header for the bulletin board application.
 */
export const Header: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

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
        console.log('Wallet not connected:', error);
      }
    };

    checkWallet();
    
    // Listen for account changes
    // @ts-ignore
    if (window.midnight) {
      // @ts-ignore
      window.midnight.on('accountChanged', (account: string) => {
        if (account) {
          setWalletConnected(true);
          setWalletAddress(`${account.slice(0, 6)}...${account.slice(-4)}`);
        } else {
          setWalletConnected(false);
          setWalletAddress('');
        }
      });
    }
  }, []);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      // @ts-ignore - midnight connector API
      if (!window.midnight) {
        alert('Please install the Midnight Lace wallet extension from:\n\nChrome: https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk\n\nEdge: https://microsoftedge.microsoft.com/addons/detail/lace/efeiemlfnahiidnjglmehaihacglceia');
        return;
      }

      // @ts-ignore
      const accounts = await window.midnight.request({ 
        method: 'enable',
        params: { networkId: 'preprod' }
      });
      
      if (accounts && accounts.length > 0) {
        setWalletConnected(true);
        setWalletAddress(`${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      if (error.message?.includes('User rejected')) {
        console.log('User rejected connection');
      } else {
        alert('Failed to connect wallet. Please make sure:\n1. Lace wallet is installed\n2. Proof server is running (http://localhost:6300)\n3. Midnight Preprod network is configured');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
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
  );
};
