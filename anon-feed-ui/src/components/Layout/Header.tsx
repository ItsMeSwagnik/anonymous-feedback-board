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
import { AppBar, Box, Typography, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

/**
 * A simple application level header for the bulletin board application.
 */
export const Header: React.FC = () => {
  const [walletDetected, setWalletDetected] = useState(false);
  const [walletName, setWalletName] = useState<string>('');

  useEffect(() => {
    // Detect if any Midnight wallet extension is installed
    const detectWallet = async () => {
      try {
        // @ts-ignore - midnight connector API
        if (window.midnight && window.midnight.providers) {
          // @ts-ignore
          const providers = window.midnight.providers;
          if (providers && providers.length > 0) {
            setWalletDetected(true);
            // Get the first available wallet name
            const firstWallet = providers[0];
            setWalletName(firstWallet.name || 'Wallet');
          }
        } else if (window.midnight) {
          // Fallback for older API
          setWalletDetected(true);
          setWalletName('Wallet');
        }
      } catch (error) {
        console.log('Wallet detection failed:', error);
        setWalletDetected(false);
      }
    };

    detectWallet();
  }, []);

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
        {walletDetected ? (
          <Chip
            icon={<CheckCircleIcon />}
            label={`${walletName} Detected`}
            sx={{ 
              bgcolor: 'rgba(76, 175, 80, 0.2)',
              color: '#4CAF50',
              fontWeight: 'bold',
            }}
          />
        ) : (
          <Chip
            icon={<WarningIcon />}
            label="No Wallet Detected"
            sx={{ 
              bgcolor: 'rgba(255, 152, 0, 0.2)',
              color: '#FF9800',
              fontWeight: 'bold',
            }}
          />
        )}
      </Box>
    </AppBar>
  );
};
