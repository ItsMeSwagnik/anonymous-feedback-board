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
import { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-network-id';

/**
 * A simple application level header for the bulletin board application.
 */
export const Header: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');

  // Set network ID on mount
  useEffect(() => {
    const networkId = import.meta.env.VITE_NETWORK_ID as NetworkId;
    setNetworkId(networkId);
  }, []);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      // Check if wallet extension is available
      // @ts-ignore - midnight connector API
      if (!window.midnight) {
        throw new Error('No Midnight wallet extension found. Please install Lace or 1AM wallet.');
      }

      // Connect using the Midnight dApp connector API
      const networkId = import.meta.env.VITE_NETWORK_ID as NetworkId;
      const connectedAPI = await ConnectedAPI.connect(networkId);
      
      // Get the connected account
      const accounts = await connectedAPI.getShieldedAddresses();
      
      if (accounts && accounts.length > 0) {
        setWalletConnected(true);
        setWalletAddress(`${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      } else {
        throw new Error('No accounts found in wallet');
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      let errorMsg = 'Failed to connect wallet.\n\n';
      
      if (err.message?.includes('User rejected')) {
        errorMsg = 'Connection rejected. Please try again.';
      } else if (err.message?.includes('No Midnight wallet')) {
        errorMsg = 'No wallet extension found.\n\nPlease install:\n• Lace: https://www.lace.io/\n• 1AM: https://1amwallet.com/';
      } else if (err.message?.includes('Network ID')) {
        errorMsg = 'Network not configured.\n\nPlease ensure:\n• Proof server is running\n• Midnight Preprod is configured';
      } else {
        errorMsg += err.message || 'Unknown error';
      }
      
      setError(errorMsg);
      alert(errorMsg);
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
    </React.Fragment>
  );
};
