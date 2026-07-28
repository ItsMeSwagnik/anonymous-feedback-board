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
import { Box, Typography, Chip, alpha } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { Header } from './Header';

const privacyItems = [
  { label: 'ZK Proofs', desc: 'Ownership verified without revealing identity' },
  { label: 'Anonymous', desc: 'No wallet address linked to your message' },
  { label: 'Self-sovereign', desc: 'Only you can remove your own message' },
];

export const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 20% 50%, rgba(0,201,255,0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(146,254,157,0.04) 0%, transparent 50%), #0a0a0f',
      }}
    >
      <Header />

      {/* Hero */}
      <Box sx={{ textAlign: 'center', pt: 8, pb: 4, px: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0,201,255,0.2), rgba(146,254,157,0.2))',
              border: '1px solid rgba(0,201,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LockIcon sx={{ color: '#00C9FF', fontSize: 28 }} />
          </Box>
        </Box>
        <Typography
          variant="h4"
          sx={{
            background: 'linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1.5,
          }}
        >
          Anonymous Feedback Board
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.55)', maxWidth: 480, mx: 'auto', mb: 3 }}>
          Post messages anonymously on the Midnight Network. Only you can remove what you post — proven by zero-knowledge proofs.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {privacyItems.map((item) => (
            <Chip
              key={item.label}
              label={
                <Box sx={{ display: 'flex', flexDirection: 'column', py: 0.5 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#00C9FF', lineHeight: 1.2 }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.3 }}>
                    {item.desc}
                  </Typography>
                </Box>
              }
              sx={{
                height: 'auto',
                bgcolor: alpha('#00C9FF', 0.06),
                border: '1px solid rgba(0,201,255,0.2)',
                borderRadius: 2,
                px: 1,
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Boards */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 3,
          px: 4,
          pb: 8,
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          borderTop: '1px solid rgba(0,201,255,0.1)',
          py: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)' }}>
          Built on{' '}
          <Box component="span" sx={{ color: 'rgba(0,201,255,0.6)' }}>Midnight Network</Box>
          {' '}· Privacy-preserving by design
        </Typography>
      </Box>
    </Box>
  );
};
