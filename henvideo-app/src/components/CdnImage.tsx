// ============================================================================
// HenVideo — CDN Image Component
// Routes ALL hanime-cdn.com images through the website's /api/image proxy
// Proxy returns access-control-allow-origin: * — works on ANY client
// No headers needed, no Referer needed, plug & play on Google TV
// ============================================================================

import React from 'react';
import { Image as RNImage, Platform } from 'react-native';

const IMAGE_PROXY = 'https://hentai-database.vercel.app/api/image?url=';

interface CdnImageProps {
  uri: string;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  onError?: () => void;
  children?: React.ReactNode;
}

/**
 * CdnImage — Loads images through the website's image proxy.
 * hanime-cdn.com blocks direct access (403) from non-browser clients.
 * The proxy at /api/image bypasses this completely.
 * 
 * How it works:
 *   Original: https://hanime-cdn.com/images/posters/xyz.png  → 403
 *   Proxied:  https://hentai-database.vercel.app/api/image?url=https%3A%2F%2F...  → 200
 * 
 * No custom headers needed. No Referer needed. Works everywhere.
 */
const CdnImage: React.FC<CdnImageProps> = ({
  uri,
  style,
  resizeMode = 'cover',
  onError,
  children,
}) => {
  if (!uri) return null;

  // Route through proxy — this is the ONLY reliable way
  const proxyUrl = IMAGE_PROXY + encodeURIComponent(uri);

  return (
    <RNImage
      source={{ uri: proxyUrl }}
      style={style}
      resizeMode={resizeMode}
      onError={onError}
    >
      {children}
    </RNImage>
  );
};

export default CdnImage;
