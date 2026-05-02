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
} from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

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
// WEBVIEW PLAYER SCREEN
// ============================================================================
interface WebViewPlayerProps {
  video: Video;
  onBack: () => void;
}

const WebViewPlayer: React.FC<WebViewPlayerProps> = ({ video, onBack }) => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const videoUrl = `https://hanime.tv/videos/hentai/${video.slug}`;

  // Inject JavaScript for better TV experience
  const injectedJS = `
    (function() {
      // Hide distracting elements
      const style = document.createElement('style');
      style.innerHTML = \`
        .ad-container, .popup, .modal-overlay, .banner {
          display: none !important;
        }
        video {
          max-width: 100% !important;
        }
      \`;
      document.head.appendChild(style);
    })();
    true;
  `;

  return (
    <View style={styles.playerContainer}>
      {/* Header */}
      <View style={styles.playerHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.playerTitle} numberOfLines={1}>{video.title}</Text>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#e50914" />
          <Text style={styles.loadingText}>Chargement Hanime.tv...</Text>
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>❌ Erreur</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              webViewRef.current?.reload();
            }}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WebView - Only renders on native (not web) */}
      {Platform.OS !== 'web' ? (
        <WebView
          ref={webViewRef}
          source={{ uri: videoUrl }}
          style={styles.webView}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={(e) => setError(e.nativeEvent.description)}
          injectedJavaScript={injectedJS}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo={true}
          startInLoadingState={true}
          userAgent="Mozilla/5.0 (Linux; Android 11; Android TV) AppleWebKit/537.36 Chrome/91.0.4472.120 Safari/537.36"
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

      {/* Controls hint */}
      <View style={styles.controlsHint}>
        <Text style={styles.controlsText}>
          🎮 Appuyez sur ← Retour pour revenir à la bibliothèque
        </Text>
      </View>
    </View>
  );
};

// ============================================================================
// VIDEO CARD COMPONENT
// ============================================================================
interface VideoCardProps {
  video: Video;
  onSelect: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect }) => {
  const [focused, setFocused] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.videoCard, focused && styles.videoCardFocused]}
      onPress={onSelect}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      activeOpacity={0.8}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnail}>
        <Text style={styles.thumbnailIcon}>🎬</Text>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {video.rating}</Text>
        </View>
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
    </TouchableOpacity>
  );
};

// ============================================================================
// TAG CHIP COMPONENT
// ============================================================================
interface TagChipProps {
  tag: string;
  selected: boolean;
  onToggle: () => void;
}

const TagChip: React.FC<TagChipProps> = ({ tag, selected, onToggle }) => {
  return (
    <TouchableOpacity
      style={[styles.tagChip, selected && styles.tagChipSelected]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Text style={[styles.tagChipText, selected && styles.tagChipTextSelected]}>
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
          renderItem={({ item }) => (
            <VideoCard
              video={item}
              onSelect={() => setSelectedVideo(item)}
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

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {Platform.OS === 'web' ? '🌐 Web' : Platform.OS === 'android' ? '🤖 Android' : '📱 iOS'}
          {IS_TV && ' • 📺 TV Optimisé'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
    fontSize: 28,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  tvBadgeText: {
    color: '#4ade80',
    fontSize: 12,
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
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tagsScroll: {
    paddingLeft: 15,
  },
  tagChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 8,
  },
  tagChipSelected: {
    backgroundColor: '#e50914',
  },
  tagChipText: {
    color: '#fff',
    fontSize: 14,
  },
  tagChipTextSelected: {
    fontWeight: 'bold',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  videoCardFocused: {
    borderColor: '#e50914',
  },
  thumbnail: {
    aspectRatio: 16 / 9,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnailIcon: {
    fontSize: 40,
  },
  ratingBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: '#ffd700',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardInfo: {
    padding: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardViews: {
    color: '#666',
    fontSize: 11,
    marginBottom: 6,
  },
  cardTags: {
    flexDirection: 'row',
  },
  miniTag: {
    backgroundColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  miniTagText: {
    color: '#888',
    fontSize: 10,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },

  // Footer
  footer: {
    padding: 10,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  footerText: {
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
    padding: 15,
    paddingTop: Platform.OS === 'web' ? 15 : 45,
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#333',
    marginRight: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  playerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  webView: {
    flex: 1,
    marginTop: Platform.OS === 'web' ? 0 : 70,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 14,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    padding: 20,
  },
  errorText: {
    color: '#e50914',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorDetail: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    backgroundColor: '#e50914',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  controlsHint: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  controlsText: {
    color: '#666',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
});

// ============================================================================
// EXPORT
// ============================================================================
export default HomeScreen;
