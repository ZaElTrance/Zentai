// ============================================================================
// HenVideo — Design Tokens
// Netflix/Plex-inspired TV design system
// ============================================================================

import { Platform } from 'react-native';

export const IS_TV = Platform.isTV || false;
export const LOADING_TIMEOUT = 30000;
export const LONG_PRESS_DURATION = 500;
export const DEFAULT_PAGE_SIZE = 20;

export const COLORS = {
  bg: '#0A0A0A',
  surface: '#141414',
  surfaceLight: '#1E1E1E',
  surfaceHover: '#2A2A2A',
  primary: '#E50914',
  primaryLight: '#FF4D58',
  gold: '#FFD700',
  white: '#FFFFFF',
  textPrimary: '#F5F5F5',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  border: '#333333',
  multiSelect: '#1CE783',
  multiSelectBg: 'rgba(28,231,131,0.12)',
};
