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

import React from 'react';
import { AppBar, Box, Typography, Button } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

/**
 * A simple application level header for the bulletin board application.
 * 
 * Note: Wallet connection is handled by the Board component through Midnight.js
 * infrastructure. Users connect their wallet when creating or joining a board.
 */
export const Header: React.FC = () => {
  const handleConnectWallet = () => {
    // Wallet connection is triggered through the Board component
    // This button serves as a visual indicator and help prompt
    alert(
      'Wallet Connection\n\n' +
      'To connect your wallet:\n\n' +
      '1. Click "Create a new Board" or "Join an existing one"\n' +
      '2. Your wallet extension will automatically prompt for connection\n' +
      '3. Approve the connection in your wallet\n\n' +
      'Supported wallets: Lace, 1AM, and other Midnight-compatible wallets\n\n' +
      'Make sure:\n' +
      '• Wallet extension is installed\n' +
      '• Proof server is running (http://localhost:6300)\n' +
      '• Midnight Preprod network is configured'
    );
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

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button
          variant="outlined"
          onClick={handleConnectWallet}
          startIcon={<AccountBalanceWalletIcon />}
          sx={{
            color: '#00C9FF',
            borderColor: '#00C9FF',
            fontWeight: 'bold',
            px: 2,
            py: 0.8,
            '&:hover': {
              borderColor: '#92FE9D',
              color: '#92FE9D',
              backgroundColor: 'rgba(0, 201, 255, 0.1)',
            },
          }}
        >
          Connect Wallet
        </Button>
      </Box>
    </AppBar>
  );
};
