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

import React, { useCallback, useEffect, useState } from 'react';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import {
  Backdrop,
  CircularProgress,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Skeleton,
  Typography,
  TextField,
  Box,
  Tooltip,
  alpha,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import WriteIcon from '@mui/icons-material/EditNoteOutlined';
import CopyIcon from '@mui/icons-material/ContentPasteOutlined';
import StopIcon from '@mui/icons-material/HighlightOffOutlined';
import { type AnonFeedDerivedState, type DeployedAnonFeedAPI } from '../../../api/src/index';
import { useDeployedBoardContext } from '../hooks';
import { type BoardDeployment } from '../contexts';
import { type Observable } from 'rxjs';
import { State } from '../../../contract/src/index';
import { EmptyCardContent } from './Board.EmptyCardContent';

export interface BoardProps {
  boardDeployment$?: Observable<BoardDeployment>;
}

export const Board: React.FC<Readonly<BoardProps>> = ({ boardDeployment$ }) => {
  const boardApiProvider = useDeployedBoardContext();
  const [boardDeployment, setBoardDeployment] = useState<BoardDeployment>();
  const [deployedBoardAPI, setDeployedBoardAPI] = useState<DeployedAnonFeedAPI>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [boardState, setBoardState] = useState<AnonFeedDerivedState>();
  const [messagePrompt, setMessagePrompt] = useState<string>();
  const [isWorking, setIsWorking] = useState(!!boardDeployment$);

  const onCreateBoard = useCallback(() => boardApiProvider.resolve(), [boardApiProvider]);
  const onJoinBoard = useCallback(
    (contractAddress: ContractAddress) => boardApiProvider.resolve(contractAddress),
    [boardApiProvider],
  );

  const onPostMessage = useCallback(async () => {
    if (!messagePrompt) return;
    try {
      if (deployedBoardAPI) {
        setIsWorking(true);
        await deployedBoardAPI.post(messagePrompt);
      }
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsWorking(false);
    }
  }, [deployedBoardAPI, messagePrompt]);

  const onDeleteMessage = useCallback(async () => {
    try {
      if (deployedBoardAPI) {
        setIsWorking(true);
        await deployedBoardAPI.takeDown();
      }
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsWorking(false);
    }
  }, [deployedBoardAPI]);

  const onCopyContractAddress = useCallback(async () => {
    if (deployedBoardAPI) {
      await navigator.clipboard.writeText(deployedBoardAPI.deployedContractAddress);
    }
  }, [deployedBoardAPI]);

  useEffect(() => {
    if (!boardDeployment$) return;
    const subscription = boardDeployment$.subscribe(setBoardDeployment);
    return () => subscription.unsubscribe();
  }, [boardDeployment$]);

  useEffect(() => {
    if (!boardDeployment) return;
    if (boardDeployment.status === 'in-progress') return;
    setIsWorking(false);
    if (boardDeployment.status === 'failed') {
      setErrorMessage(
        boardDeployment.error.message.length ? boardDeployment.error.message : 'Encountered an unexpected error.',
      );
      return;
    }
    setDeployedBoardAPI(boardDeployment.api);
    const subscription = boardDeployment.api.state$.subscribe(setBoardState);
    return () => subscription.unsubscribe();
  }, [boardDeployment]);

  const isOccupied = boardState?.state === State.OCCUPIED;
  const isOwner = boardState?.isOwner;
  const isVacant = boardState?.state === State.VACANT;

  return (
    <Card
      sx={{
        position: 'relative',
        width: 380,
        minWidth: 320,
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: `0 0 30px ${alpha('#00C9FF', 0.15)}`,
        },
      }}
    >
      {!boardDeployment$ && (
        <EmptyCardContent onCreateBoardCallback={onCreateBoard} onJoinBoardCallback={onJoinBoard} />
      )}

      {boardDeployment$ && (
        <React.Fragment>
          {/* Working overlay */}
          <Backdrop
            sx={{ position: 'absolute', color: '#00C9FF', zIndex: (theme) => theme.zIndex.drawer + 1, borderRadius: 4, flexDirection: 'column', gap: 2 }}
            open={isWorking}
          >
            <CircularProgress data-testid="board-working-indicator" color="inherit" size={36} />
            <Typography variant="caption" sx={{ color: '#00C9FF', fontWeight: 700, fontSize: '0.8rem' }}>Generating ZK proof…</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textAlign: 'center', px: 2 }}>
              Your identity stays private
            </Typography>
          </Backdrop>

          {/* Error overlay */}
          <Backdrop
            sx={{ position: 'absolute', zIndex: (theme) => theme.zIndex.drawer + 1, borderRadius: 4, flexDirection: 'column', gap: 1, px: 3 }}
            open={!!errorMessage}
            onClick={() => setErrorMessage(undefined)}
          >
            <StopIcon sx={{ color: '#ff4444', fontSize: 40 }} />
            <Typography variant="body2" data-testid="board-error-message" sx={{ color: '#ff6666', textAlign: 'center' }}>
              {errorMessage}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Click to dismiss</Typography>
          </Backdrop>

          {/* Header */}
          <CardHeader
            avatar={
              boardState ? (
                isVacant || (isOccupied && isOwner) ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', bgcolor: alpha('#92FE9D', 0.15), border: '1px solid rgba(146,254,157,0.3)' }}>
                    <LockOpenIcon data-testid="post-unlocked-icon" sx={{ color: '#92FE9D', fontSize: 18 }} />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', bgcolor: alpha('#00C9FF', 0.15), border: '1px solid rgba(0,201,255,0.3)' }}>
                    <LockIcon data-testid="post-locked-icon" sx={{ color: '#00C9FF', fontSize: 18 }} />
                  </Box>
                )
              ) : (
                <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
              )
            }
            title={
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {toShortFormatContractAddress(deployedBoardAPI?.deployedContractAddress) ?? (
                  <Skeleton width={140} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
                )}
              </Typography>
            }
            subheader={
              boardState ? (
                <Typography variant="caption" sx={{ color: isOccupied ? '#92FE9D' : 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>
                  {isOccupied ? (isOwner ? '● Your message' : '● Occupied') : '○ Vacant — ready for a message'}
                </Typography>
              ) : null
            }
            action={
              deployedBoardAPI?.deployedContractAddress ? (
                <Tooltip title="Copy contract address">
                  <IconButton onClick={onCopyContractAddress} size="small">
                    <CopyIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              ) : (
                <Skeleton variant="circular" width={24} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
              )
            }
            sx={{ pb: 0 }}
          />

          {/* Content */}
          <CardContent sx={{ pt: 1.5 }}>
            {boardState ? (
              isOccupied ? (
                <Box
                  sx={{
                    minHeight: 160,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha('#00C9FF', 0.04),
                    border: '1px solid rgba(0,201,255,0.12)',
                    position: 'relative',
                  }}
                >
                  <Typography
                    data-testid="board-posted-message"
                    variant="body2"
                    sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {boardState.message}
                  </Typography>
                  {isOwner && (
                    <Typography variant="caption" sx={{ position: 'absolute', bottom: 8, right: 10, color: 'rgba(146,254,157,0.5)', fontSize: '0.65rem' }}>
                      ✓ yours
                    </Typography>
                  )}
                </Box>
              ) : (
                <TextField
                  id="message-prompt"
                  data-testid="board-message-prompt"
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={6}
                  maxRows={6}
                  placeholder="Write your anonymous message here..."
                  size="small"
                  onChange={(e) => setMessagePrompt(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: '0.9rem',
                    },
                  }}
                />
              )
            ) : (
              <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)' }} />
            )}
          </CardContent>

          {/* Actions */}
          <CardActions sx={{ px: 2, pb: 1, gap: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
            {/* Privacy proof badge — always visible, shows ZK ownership verification */}
            {boardState && (
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.8,
                  borderRadius: 2,
                  bgcolor: alpha('#00C9FF', 0.04),
                  border: '1px solid rgba(0,201,255,0.12)',
                  mb: 0.5,
                }}
              >
                <LockIcon sx={{ fontSize: 13, color: alpha('#00C9FF', 0.7) }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem', lineHeight: 1.4 }}>
                  {isOccupied && isOwner
                    ? 'ZK proof: ownership verified — key never disclosed'
                    : isOccupied
                      ? 'ZK proof: owner identity is private'
                      : 'Post anonymously — only a ZK proof links you to your message'}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 1 }}>
            {deployedBoardAPI ? (
              <React.Fragment>
                <Tooltip title={isOccupied ? 'Board is occupied' : !messagePrompt?.length ? 'Enter a message first' : 'Post anonymously'}>
                  <span>
                    <IconButton
                      data-testid="board-post-message-btn"
                      disabled={isOccupied || !messagePrompt?.length}
                      onClick={onPostMessage}
                      sx={{
                        bgcolor: alpha('#00C9FF', 0.1),
                        border: '1px solid rgba(0,201,255,0.2)',
                        borderRadius: 2,
                        px: 1.5,
                        gap: 0.5,
                        '&:not(:disabled):hover': { bgcolor: alpha('#00C9FF', 0.2) },
                        '&:disabled': { opacity: 0.3 },
                      }}
                    >
                      <WriteIcon sx={{ fontSize: 18, color: '#00C9FF' }} />
                      <Typography variant="caption" sx={{ color: '#00C9FF', fontWeight: 600 }}>Post</Typography>
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={isVacant ? 'Nothing to remove' : !isOwner ? 'Not your message — ZK proof required' : 'Remove your message'}>
                  <span>
                    <IconButton
                      data-testid="board-take-down-message-btn"
                      disabled={isVacant || (isOccupied && !isOwner)}
                      onClick={onDeleteMessage}
                      sx={{
                        bgcolor: alpha('#ff4444', 0.08),
                        border: '1px solid rgba(255,68,68,0.2)',
                        borderRadius: 2,
                        px: 1.5,
                        gap: 0.5,
                        '&:not(:disabled):hover': { bgcolor: alpha('#ff4444', 0.18) },
                        '&:disabled': { opacity: 0.3 },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 18, color: '#ff6666' }} />
                      <Typography variant="caption" sx={{ color: '#ff6666', fontWeight: 600 }}>Remove</Typography>
                    </IconButton>
                  </span>
                </Tooltip>
              </React.Fragment>
            ) : (
              <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)' }} />
            )}
            </Box>
          </CardActions>
        </React.Fragment>
      )}
    </Card>
  );
};

const toShortFormatContractAddress = (contractAddress: ContractAddress | undefined): React.ReactElement | undefined =>
  contractAddress ? (
    <span data-testid="board-address">
      0x{contractAddress?.replace(/^[A-Fa-f0-9]{6}([A-Fa-f0-9]{8}).*([A-Fa-f0-9]{8})$/g, '$1...$2')}
    </span>
  ) : undefined;
