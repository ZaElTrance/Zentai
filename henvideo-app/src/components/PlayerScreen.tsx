// ============================================================================
// HenVideo — WebView Player Screen
// Streams video from hanime.tv via WebView with custom UA
// ============================================================================

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS, LOADING_TIMEOUT } from '../theme';
import styles from '../styles';
import type { VideoItem } from '../types';

interface PlayerScreenProps {
  video: VideoItem;
  onBack: () => void;
}

const PlayerScreen: React.FC<PlayerScreenProps> = ({ video, onBack }) => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [backFocused, setBackFocused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build video URL from slug
  const videoUrl = video.slug
    ? `https://hanime.tv/videos/hentai/${video.slug}`
    : video.url || '';

  // Handle hardware back button
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => handler.remove();
  }, [onBack]);

  // Loading timeout
  useEffect(() => {
    if (!loading) return;
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        setTimeoutReached(true);
        setLoading(false);
        setError('Delai de chargement depasse (30s)');
      }
    }, LOADING_TIMEOUT);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [loading]);

  // Injected JS: hide ads, autoplay video
  const injectedJS = `
    (function() {
      try {
        var style = document.createElement('style');
        style.innerHTML = '.ad-container, .popup, .modal-overlay, .banner, .adsbygoogle, [class*="ad-"], [id*="ad-"] { display: none !important; } video { max-width: 100% !important; } body { overflow-x: hidden !important; background: #000 !important; }';
        document.head.appendChild(style);
        setTimeout(function() {
          var v = document.querySelector('video');
          if (v) { v.play().catch(function(){}); v.removeAttribute('controls'); }
        }, 2000);
      } catch(e) {}
    })();
    true;
  `;

  const handleRetry = () => {
    setError(null);
    setTimeoutReached(false);
    setLoading(true);
    webViewRef.current?.reload();
  };

  const handleBackFromPlayer = useCallback(() => onBack(), [onBack]);

  return (
    <View style={styles.playerContainer}>
      {/* Header */}
      <View style={styles.playerHeader}>
        <TouchableOpacity
          style={[styles.backButton, backFocused && styles.backButtonFocused]}
          onPress={handleBackFromPlayer}
          onFocus={() => setBackFocused(true)}
          onBlur={() => setBackFocused(false)}
          activeOpacity={0.7}
          hasTVPreferredFocus
        >
          <Text style={styles.backButtonArrow}>RETOUR</Text>
        </TouchableOpacity>
        <View style={styles.playerHeaderInfo}>
          <Text style={styles.playerTitle} numberOfLines={1}>{video.name}</Text>
          <Text style={styles.playerSubtitle}>
            {video.studio || video.source} {video.rating ? `| ${video.rating}/10` : ''}
          </Text>
        </View>
      </View>

      {/* Loading overlay */}
      {loading && !timeoutReached && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
          <Text style={styles.loadingSubtext}>{videoUrl}</Text>
          <View style={styles.loadingBar}>
            <View style={styles.loadingBarInner} />
          </View>
        </View>
      )}

      {/* Error overlay */}
      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorIcon}>!</Text>
          <Text style={styles.errorText}>Erreur de chargement</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Reessayer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backLink} onPress={handleBackFromPlayer}>
            <Text style={styles.backLinkText}>RETOUR</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WebView (native only) */}
      {Platform.OS !== 'web' ? (
        <WebView
          ref={webViewRef}
          source={{ uri: videoUrl }}
          style={styles.webView}
          onLoadStart={() => {
            setLoading(true);
            setTimeoutReached(false);
          }}
          onLoadEnd={() => {
            setLoading(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          onError={(e: any) => {
            setError(e.nativeEvent.description);
            setLoading(false);
          }}
          onHttpError={(e: any) => {
            if (e.nativeEvent.statusCode === 404) {
              setError('Page non trouvee (404)');
            } else {
              setError('Erreur HTTP: ' + e.nativeEvent.statusCode);
            }
            setLoading(false);
          }}
          injectedJavaScript={injectedJS}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo={true}
          startInLoadingState={true}
          userAgent="Mozilla/5.0 (Linux; Android 11; Android TV) AppleWebKit/537.36 Chrome/91.0.4472.120 Safari/537.36"
          cacheEnabled={true}
          incognito={false}
        />
      ) : (
        <View style={styles.webView}>
          <iframe
            src={videoUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </View>
      )}

      {/* Controls hint */}
      <View style={styles.controlsHint}>
        <Text style={styles.controlsText}>
          RETOUR pour revenir a la bibliotheque
        </Text>
      </View>
    </View>
  );
};

export default PlayerScreen;
