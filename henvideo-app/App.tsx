import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  BackHandler,
  Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

// ============================================================================
// CONFIGURATION
// ============================================================================
const LOADING_TIMEOUT = 30000; // 30 secondes max pour le chargement
const FOCUS_SCALE = 1.05; // Légère augmentation au focus
const FOCUS_BORDER_WIDTH = 4; // Bordure épaisse pour TV

// ============================================================================
// TEST DATA - 5 videos for validation
// ============================================================================
const TEST_VIDEOS = [
  {
    id: '1',
    title: 'Mistreated Bride Ep. 1',
    slug: 'mistreated-bride-1',
    tags: ['ntr', 'milf', 'cheating', 'housewife'],
    views: 1250000,
    rating: 9.2,
  },
  {
    id: '2',
    title: 'Taimanin Asagi Ep. 1',
    slug: 'taimanin-asagi-1',
    tags: ['action', 'demons', 'dark-skin', 'fantasy'],
    views: 980000,
    rating: 9.0,
  },
  {
    id: '3',
    title: 'Kuroinu Kedakaki Ep. 1',
    slug: 'kuroinu-kedakaki-seijo-no-hakugin-dakuten-1',
    tags: ['fantasy', 'gangbang', 'dark-fantasy'],
    views: 1100000,
    rating: 9.1,
  },
  {
    id: '4',
    title: 'Modaete yo Adam-kun',
    slug: 'modaete-yo-adam-kun-1',
    tags: ['comedy', 'harem', 'school'],
    views: 850000,
    rating: 8.8,
  },
  {
    id: '5',
    title: 'Bible Black Ep. 1',
    slug: 'bible-black-1',
    tags: ['horror', 'occult', 'classic', 'school'],
    views: 1500000,
    rating: 9.4,
  },
];

const TEST_TAGS = ['ntr', 'milf', 'fantasy', 'harem', 'classic', 'school', 'action', 'dark'];

type Video = typeof TEST_VIDEOS[0];

const { width, height } = Dimensions.get('window');
const IS_TV = Platform.isTV || false;

// ============================================================================
// FOCUSABLE WRAPPER - Composant avec focus TV ultra-visible
// ============================================================================
interface FocusableProps {
  children: React.ReactNode;
  style?: any;
  onFocus?: () => void;
  onBlur?: () => void;
  onPress: () => void;
  testID?: string;
}

const Focusable: React.FC<FocusableProps> = ({
  children,
  style,
  onFocus,
  onBlur,
  onPress,
  testID
}) => {
  const [focused, setFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? FOCUS_SCALE : 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        style,
        focused && styles.focusableFocused,
      ]}
      onPress={onPress}
      onFocus={() => {
        setFocused(true);
        onFocus?.();
      }}
      onBlur={() => {
        setFocused(false);
        onBlur?.();
      }}
      activeOpacity={0.9}
      hasTVPreferredFocus={false}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {children}
      </Animated.View>
      {/* Indicateur de focus visible */}
      {focused && <View style={styles.focusIndicator} />}
    </TouchableOpacity>
  );
};

// ============================================================================
// WEBVIEW PLAYER SCREEN - Avec bouton retour accessible
// ============================================================================
interface WebViewPlayerProps {
  video: Video;
  onBack: () => void;
}

const WebViewPlayer: React.FC<WebViewPlayerProps> = ({ video, onBack }) => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backHandlerRef = useRef<any>(null);

  const videoUrl = `https://hanime.tv/videos/hentai/${video.slug}`;

  // Gestion du bouton Back matériel (télécommande)
  useEffect(() => {
    backHandlerRef.current = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true; // Empêche la fermeture de l'app
    });

    return () => {
      backHandlerRef.current?.remove();
    };
  }, [onBack]);

  // Timeout pour le chargement
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        setTimeoutReached(true);
        setLoading(false);
        setError('Délai de chargement dépassé (30s)');
      }
    }, LOADING_TIMEOUT);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading]);

  // Inject JavaScript for better TV experience
  const injectedJS = `
    (function() {
      // Hide distracting elements
      const style = document.createElement('style');
      style.innerHTML = \`
        .ad-container, .popup, .modal-overlay, .banner, .adsbygoogle {
          display: none !important;
        }
        video {
          max-width: 100% !important;
        }
        body {
          overflow-x: hidden !important;
        }
      \`;
      document.head.appendChild(style);

      // Auto-play video if possible
      setTimeout(() => {
        const video = document.querySelector('video');
        if (video) {
          video.play().catch(() => {});
        }
      }, 2000);
    })();
    true;
  `;

  const handleRetry = () => {
    setError(null);
    setTimeoutReached(false);
    setLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <View style={styles.playerContainer}>
      {/* Header toujours visible */}
      <View style={styles.playerHeader}>
        <TouchableOpacity
          style={[styles.backButton, styles.backButtonFocused]}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← RETOUR BIBLIOTHÈQUE</Text>
        </TouchableOpacity>
        <Text style={styles.playerTitle} numberOfLines={1}>{video.title}</Text>
      </View>

      {/* Loading avec indicateur de progression */}
      {loading && !timeoutReached && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#e50914" />
          <Text style={styles.loadingText}>Chargement Hanime.tv...</Text>
          <Text style={styles.loadingSubtext}>{videoUrl}</Text>
          <View style={styles.loadingBar}>
            <View style={styles.loadingBarInner} />
          </View>
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Erreur de chargement</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backLink}
            onPress={onBack}
          >
            <Text style={styles.backLinkText}>← Retour à la bibliothèque</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WebView - Only renders on native (not web) */}
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
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
          onError={(e) => {
            setError(e.nativeEvent.description);
            setLoading(false);
          }}
          onHttpError={(e) => {
            if (e.nativeEvent.statusCode === 404) {
              setError('Page non trouvée (404)');
            } else {
              setError(`Erreur HTTP: ${e.nativeEvent.statusCode}`);
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
        /* Web fallback - iframe for browser testing */
        <View style={styles.webView}>
          <iframe
            src={videoUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </View>
      )}

      {/* Controls hint - Toujours visible en bas */}
      <View style={styles.controlsHint}>
        <View style={styles.controlsHintInner}>
          <Text style={styles.controlsText}>
            🎮 Télécommande: Bouton ← RETOUR pour revenir | OK pour sélectionner
          </Text>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// VIDEO CARD COMPONENT - Avec focus TV ultra-visible
// ============================================================================
interface VideoCardProps {
  video: Video;
  onSelect: () => void;
  index: number;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect, index }) => {
  const [focused, setFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.08 : 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <TouchableOpacity
      style={[
        styles.videoCard,
        focused && styles.videoCardFocused
      ]}
      onPress={onSelect}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      activeOpacity={0.9}
      hasTVPreferredFocus={index === 0}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {/* Thumbnail */}
        <View style={styles.thumbnail}>
          <Text style={styles.thumbnailIcon}>🎬</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {video.rating}</Text>
          </View>
          {focused && (
            <View style={styles.playOverlay}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>{video.title}</Text>
          <Text style={styles.cardViews}>{(video.views / 1000000).toFixed(1)}M vues</Text>
          <View style={styles.cardTags}>
            {video.tags.slice(0, 2).map((tag, i) => (
              <View key={i} style={styles.miniTag}>
                <Text style={styles.miniTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Indicateur de focus ultra-visible */}
      {focused && (
        <View style={styles.cardFocusGlow} pointerEvents="none">
          <Text style={styles.focusedLabel}>APPUYEZ POUR LIRE</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ============================================================================
// TAG CHIP COMPONENT - Avec focus visible
// ============================================================================
interface TagChipProps {
  tag: string;
  selected: boolean;
  onToggle: () => void;
}

const TagChip: React.FC<TagChipProps> = ({ tag, selected, onToggle }) => {
  const [focused, setFocused] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.tagChip,
        selected && styles.tagChipSelected,
        focused && styles.tagChipFocused,
      ]}
      onPress={onToggle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.tagChipText,
        selected && styles.tagChipTextSelected,
        focused && { fontWeight: 'bold' }
      ]}>
        {tag}
      </Text>
    </TouchableOpacity>
  );
};

// ============================================================================
// MAIN HOME SCREEN
// ============================================================================
const HomeScreen: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filter videos
  const filteredVideos = selectedTags.length === 0
    ? TEST_VIDEOS
    : TEST_VIDEOS.filter(v => selectedTags.some(tag => v.tags.includes(tag)));

  // Toggle tag
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // If video selected, show player
  if (selectedVideo) {
    return (
      <WebViewPlayer
        video={selectedVideo}
        onBack={() => setSelectedVideo(null)}
      />
    );
  }

  // Main screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🎬 HenVideo</Text>
        <Text style={styles.subtitle}>
          {filteredVideos.length} vidéo{filteredVideos.length > 1 ? 's' : ''} disponible{filteredVideos.length > 1 ? 's' : ''}
        </Text>
        {IS_TV && (
          <View style={styles.tvBadge}>
            <Text style={styles.tvBadgeText}>📺 Mode TV</Text>
          </View>
        )}
      </View>

      {/* Tags */}
      <View style={styles.tagsSection}>
        <Text style={styles.sectionTitle}>Catégories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsScroll}
        >
          {TEST_TAGS.map((tag) => (
            <TagChip
              key={tag}
              tag={tag}
              selected={selectedTags.includes(tag)}
              onToggle={() => toggleTag(tag)}
            />
          ))}
          {selectedTags.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSelectedTags([])}
            >
              <Text style={styles.clearButtonText}>✕ Effacer</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Videos Grid */}
      <View style={styles.videosSection}>
        <Text style={styles.sectionTitle}>
          {selectedTags.length > 0 ? 'Résultats' : 'Populaire'}
        </Text>
        <FlatList
          data={filteredVideos}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item, index }) => (
            <VideoCard
              video={item}
              onSelect={() => setSelectedVideo(item)}
              index={index}
            />
          )}
          contentContainerStyle={styles.videoGrid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>Aucune vidéo trouvée</Text>
            </View>
          }
        />
      </View>

      {/* Footer avec instructions TV */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🎮 Navigation: Flèches pour bouger | OK pour sélectionner | RETOUR pour quitter
        </Text>
        <Text style={styles.footerSubtext}>
          {Platform.OS === 'web' ? '🌐 Web' : Platform.OS === 'android' ? '🤖 Android' : '📱 iOS'}
          {IS_TV && ' • 📺 TV Optimisé'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES - Optimisés pour TV
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },

  // Focus styles
  focusableFocused: {
    borderColor: '#e50914',
    borderWidth: FOCUS_BORDER_WIDTH,
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  focusIndicator: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#e50914',
  },

  // Header
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e50914',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  tvBadge: {
    position: 'absolute',
    right: 20,
    top: 25,
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  tvBadgeText: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Tags
  tagsSection: {
    paddingVertical: 15,
    backgroundColor: '#141414',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tagsScroll: {
    paddingLeft: 15,
  },
  tagChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#333',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tagChipSelected: {
    backgroundColor: '#e50914',
    borderColor: '#ff6b6b',
  },
  tagChipFocused: {
    borderColor: '#fff',
    backgroundColor: '#444',
    transform: [{ scale: 1.1 }],
  },
  tagChipText: {
    color: '#fff',
    fontSize: 14,
  },
  tagChipTextSelected: {
    fontWeight: 'bold',
  },
  clearButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#444',
    marginRight: 15,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
  },

  // Videos
  videosSection: {
    flex: 1,
    padding: 10,
  },
  videoGrid: {
    paddingBottom: 20,
  },
  videoCard: {
    width: (width - 30) / 2,
    margin: 5,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  videoCardFocused: {
    borderColor: '#e50914',
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  thumbnail: {
    aspectRatio: 16 / 9,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnailIcon: {
    fontSize: 45,
  },
  ratingBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ratingText: {
    color: '#ffd700',
    fontSize: 11,
    fontWeight: 'bold',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(229, 9, 20, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 50,
    color: '#fff',
  },
  cardInfo: {
    padding: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardViews: {
    color: '#666',
    fontSize: 12,
    marginBottom: 6,
  },
  cardTags: {
    flexDirection: 'row',
  },
  miniTag: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 4,
  },
  miniTagText: {
    color: '#888',
    fontSize: 10,
  },
  cardFocusGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  focusedLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
  },

  // Footer
  footer: {
    padding: 15,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  footerText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    color: '#555',
    fontSize: 11,
  },

  // Player
  playerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderBottomWidth: 2,
    borderBottomColor: '#e50914',
    zIndex: 100,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#333',
    marginRight: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  backButtonFocused: {
    borderColor: '#e50914',
    backgroundColor: '#444',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingSubtext: {
    color: '#666',
    marginTop: 8,
    fontSize: 11,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginTop: 20,
    overflow: 'hidden',
  },
  loadingBarInner: {
    width: '60%',
    height: '100%',
    backgroundColor: '#e50914',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    padding: 30,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  errorText: {
    color: '#e50914',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorDetail: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: '#e50914',
    borderRadius: 8,
    marginBottom: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backLink: {
    padding: 10,
  },
  backLinkText: {
    color: '#888',
    fontSize: 14,
  },
  controlsHint: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    zIndex: 100,
  },
  controlsHintInner: {
    alignItems: 'center',
  },
  controlsText: {
    color: '#aaa',
    fontSize: 13,
    textAlign: 'center',
  },
});

// ============================================================================
// EXPORT
// ============================================================================
export default HomeScreen;
