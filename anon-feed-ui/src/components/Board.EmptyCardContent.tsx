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

import React, { useState } from 'react';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { Box, Button, CardContent, Typography, alpha } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import AddLinkIcon from '@mui/icons-material/AddLinkOutlined';
import { TextPromptDialog } from './TextPromptDialog';

export interface EmptyCardContentProps {
  onCreateBoardCallback: () => void;
  onJoinBoardCallback: (contractAddress: ContractAddress) => void;
}

export const EmptyCardContent: React.FC<Readonly<EmptyCardContentProps>> = ({
  onCreateBoardCallback,
  onJoinBoardCallback,
}) => {
  const [textPromptOpen, setTextPromptOpen] = useState(false);

  return (
    <React.Fragment>
      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0,201,255,0.15), rgba(146,254,157,0.15))',
              border: '1px solid rgba(0,201,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <AddCircleOutlineIcon sx={{ color: '#00C9FF', fontSize: 24 }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 0.5, fontSize: '1rem' }}>
            Start a Board
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', lineHeight: 1.6 }}>
            Deploy a new anonymous feedback board or join an existing one using its contract address.
          </Typography>
        </Box>

        <Button
          data-testid="board-deploy-btn"
          variant="contained"
          fullWidth
          startIcon={<AddCircleOutlineIcon />}
          onClick={onCreateBoardCallback}
          sx={{
            background: 'linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)',
            color: '#000',
            fontWeight: 700,
            py: 1.2,
            '&:hover': { background: 'linear-gradient(90deg, #00b8e8 0%, #7de888 100%)' },
          }}
        >
          Deploy New Board
        </Button>

        <Button
          data-testid="board-join-btn"
          variant="outlined"
          fullWidth
          startIcon={<AddLinkIcon />}
          onClick={() => setTextPromptOpen(true)}
          sx={{
            borderColor: 'rgba(0,201,255,0.3)',
            color: '#00C9FF',
            fontWeight: 600,
            py: 1.2,
            '&:hover': { borderColor: '#00C9FF', bgcolor: alpha('#00C9FF', 0.06) },
          }}
        >
          Join Existing Board
        </Button>
      </CardContent>

      <TextPromptDialog
        prompt="Enter contract address"
        isOpen={textPromptOpen}
        onCancel={() => setTextPromptOpen(false)}
        onSubmit={(text) => {
          setTextPromptOpen(false);
          onJoinBoardCallback(text);
        }}
      />
    </React.Fragment>
  );
};
