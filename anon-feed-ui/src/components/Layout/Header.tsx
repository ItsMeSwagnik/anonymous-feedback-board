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
import { setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import semver from 'semver';

// Type for the wallet API
interface WalletAPI {
  apiVersion: string;
  rdns?: string;
  name?: string;
  icon?: string;
  connect: (networkId: string) => Promise<any>;
}

/**
 * A simple application level header for the bulletin board application.
 */
export const Header: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Set network ID on mount
  useEffect(() => {
    const networkId = import.meta.env.VITE_NETWORK_ID as NetworkId;
    setNetworkId(networkId);
  }, []);

  const getWallet = (): WalletAPI | undefined => {
    // @ts-ignore - midnight wallet API
    if (!window.midnight) return undefined;
    
    // @ts-ignore
    return Object.values(window.midnight).find(
      (wallet): wallet is WalletAPI =>
        !!wallet &&
        typeof wallet === 'object' &&
        'apiVersion' in wallet &&
        semver.satisfies(wallet.apiVersion, '4.x')
    );
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    try {
      // Get the wallet using the same method as BrowserDeployedBoardManager
      const wallet = getWallet();
      
      if (!wallet) {
        throw new Error('No Midnight wallet extension found. Please install Lace or 1AM wallet.');
      }

      // Connect to the wallet
      const networkId = import.meta.env.VITE_NETWORK_ID as NetworkId;
      const connectedAPI = await wallet.connect(networkId);
      
      // Get the connected accounts
      const accounts = await connectedAPI.getShieldedAddresses();
      
      if (accounts && accounts.length > 0) {
        setWalletConnected(true);
        setWalletAddress(`${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      } else {
        throw new Error('No accounts found in wallet. Please unlock your wallet.');
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      let errorMsg = 'Failed to connect wallet.\n\n';
      
      if (err.message?.includes('sync') || err.message?.includes('Sync')) {
        errorMsg = '⏳ Wallet is syncing...\n\n' +
          'Please:\n' +
          '1. Open your 1AM/Lace wallet\n' +
          '2. Wait for sync to complete\n' +
          '3. Try connecting again\n\n' +
          'This is normal for first-time connections.';
      } else if (err.message?.includes('User rejected') || err.message?.includes('rejected by user')) {
        errorMsg = 'Connection rejected. Please try again.';
      } else if (err.message?.includes('No Midnight wallet')) {
        errorMsg = 'No wallet extension found.\n\nPlease install:\n• Lace: https://www.lace.io/\n• 1AM: https://1amwallet.com/';
      } else if (err.message?.includes('Network ID')) {
        errorMsg = 'Network not configured.\n\nPlease ensure:\n• Proof server is running (http://localhost:6300)\n• Midnight Preprod is configured in wallet';
      } else if (err.message?.includes('Lace') || err.message?.includes('wallet')) {
        errorMsg = 'Wallet connection failed.\n\nPlease ensure:\n• Wallet extension is installed\n• Wallet is unlocked\n• Proof server is running\n• Preprod network is configured';
      } else {
        errorMsg += err.message || 'Unknown error';
      }
      
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
