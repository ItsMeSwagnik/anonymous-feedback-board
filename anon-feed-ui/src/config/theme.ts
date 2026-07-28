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

import { createTheme, alpha } from '@mui/material';

const accent = '#00C9FF';
const accentGreen = '#92FE9D';

export const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Helvetica", sans-serif',
    allVariants: { color: 'white' },
    h4: { fontWeight: 700, letterSpacing: '-0.5px' },
    h6: { fontWeight: 600 },
    body2: { lineHeight: 1.7 },
  },
  palette: {
    primary: {
      main: accent,
      light: alpha(accent, 0.6),
      dark: alpha(accent, 0.9),
    },
    secondary: {
      main: accentGreen,
    },
    background: {
      default: '#0a0a0f',
      paper: '#12121a',
    },
    text: {
      primary: '#ffffff',
      secondary: alpha('#ffffff', 0.6),
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #12121a 0%, #1a1a2e 100%)',
          border: `1px solid ${alpha(accent, 0.2)}`,
          borderRadius: 16,
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { color: alpha('#ffffff', 0.7), '&:hover': { color: accent } },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': { borderColor: alpha(accent, 0.3) },
            '&:hover fieldset': { borderColor: alpha(accent, 0.6) },
            '&.Mui-focused fieldset': { borderColor: accent },
          },
        },
      },
    },
  },
});
