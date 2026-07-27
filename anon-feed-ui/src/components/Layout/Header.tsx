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
import { AppBar, Box, Typography } from '@mui/material';

/**
 * A simple application level header for the bulletin board application.
 */
export const Header: React.FC = () => (
  <AppBar
    position="static"
    data-testid="header"
    sx={{
      backgroundColor: '#000',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 3,
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
      {/* Wallet connection is handled by the Board component via Midnight.js */}
    </Box>
  </AppBar>
);
