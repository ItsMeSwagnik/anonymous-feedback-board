import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, List, ListItemButton,
  ListItemAvatar, ListItemText, Avatar, Typography, Box, alpha, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import type { InitialAPI } from '@midnight-ntwrk/dapp-connector-api';

interface WalletPickerDialogProps {
  open: boolean;
  wallets: InitialAPI[];
  onSelect: (wallet: InitialAPI) => void;
  onClose: () => void;
}

export const WalletPickerDialog: React.FC<WalletPickerDialogProps> = ({
  open, wallets, onSelect, onClose,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    slotProps={{
      paper: {
        sx: {
          bgcolor: '#12121a',
          border: '1px solid rgba(0,201,255,0.2)',
          borderRadius: 3,
          minWidth: 340,
        },
      },
    }}
  >
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
      <span style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
        Select Wallet
      </span>
      <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.4)' }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </DialogTitle>

    <DialogContent sx={{ pt: 0, pb: 2 }}>
      {wallets.length === 0 ? (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.2)', mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            No Midnight wallets detected.
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', display: 'block', mt: 0.5 }}>
            Install Lace (lace.io/midnight) or 1AM (1am.xyz) and enable Midnight Preview.
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {wallets.map((w) => (
            <ListItemButton
              key={w.rdns ?? w.name}
              onClick={() => onSelect(w)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                border: '1px solid rgba(0,201,255,0.1)',
                '&:hover': { bgcolor: alpha('#00C9FF', 0.08), borderColor: 'rgba(0,201,255,0.3)' },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{ bgcolor: alpha('#00C9FF', 0.1), width: 40, height: 40 }}
                >
                  {/* Render icon via <img> per docs — never innerHTML (XSS) */}
                  {w.icon ? (
                    <img src={w.icon} alt="" width={28} height={28} style={{ borderRadius: 4 }} />
                  ) : (
                    <AccountBalanceWalletIcon sx={{ color: '#00C9FF', fontSize: 22 }} />
                  )}
                </Avatar>
              </ListItemAvatar>
              {/* Render name via text node per docs — never dangerouslySetInnerHTML (XSS) */}
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                    {w.name}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
                    {w.rdns ?? 'unknown'}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </DialogContent>
  </Dialog>
);
