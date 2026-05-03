import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  ActivityIndicator,
  ScrollView,
  BackHandler,
  Animated,
  Easing,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

// ============================================================================
// CONFIGURATION — Netflix/Plex-inspired TV design tokens
// ============================================================================
const LOADING_TIMEOUT = 30000;
const FOCUS_SCALE_CARD = 1.12;       // Card zoom on focus (Netflix uses ~1.10)
const FOCUS_SCALE_TAG = 1.15;        // Tag chip zoom on focus
const FOCUS_BORDER_WIDTH = 4;        // Border thickness (Android TV guideline)
const LONG_PRESS_DURATION = 500;     // Long-press threshold (ms)
const ANIM_DURATION = 200;           // Animation duration (ms)
const CARD_BORDER_RADIUS = 14;

const { width, height } = Dimensions.get('window');
const IS_TV = Platform.isTV || false;

// ============================================================================
// DESIGN TOKENS — Inspired by Netflix (#E50914) / Plex (#E5A00D)
// ============================================================================
const COLORS = {
  bg: '#0A0A0A',               // Deep black background
  surface: '#141414',           // Card/surface background
  surfaceLight: '#1E1E1E',      // Elevated surface
  surfaceHover: '#2A2A2A',      // Hover/focus surface
  primary: '#E50914',           // Netflix red accent
  primaryLight: '#FF4D58',      // Lighter red for glow
  gold: '#FFD700',              // Rating gold
  white: '#FFFFFF',
  textPrimary: '#F5F5F5',       // Primary text
  textSecondary: '#A0A0A0',     // Secondary text
  textMuted: '#666666',         // Muted text
  border: '#333333',            // Subtle border
  selected: '#E50914',          // Selected state
  multiSelect: '#1CE783',       // Hulu green for multi-select mode
  multiSelectBg: 'rgba(28,231,131,0.12)',
};

// ============================================================================
// TEST DATA
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
  {
    id: '6',
    title: ' Overflow Ep. 1',
    slug: 'overflow-1',
    tags: ['comedy', 'harem', 'school', 'romance'],
    views: 720000,
    rating: 8.5,
  },
  {
    id: '7',
    title: 'Redo of Healer Ep. 1',
    slug: 'redo-of-healer-1',
    tags: ['action', 'fantasy', 'dark-fantasy'],
    views: 950000,
    rating: 8.9,
  },
  {
    id: '8',
    title: 'Interspecies Reviewers Ep. 1',
    slug: 'interspecies-reviewers-1',
    tags: ['comedy', 'fantasy', 'demons'],
    views: 680000,
    rating: 8.3,
  },
];

const ALL_TAGS = [
  'ntr', 'milf', 'fantasy', 'harem', 'classic', 'school',
  'action', 'dark', 'comedy', 'horror', 'romance', 'demons',
  'gangbang', 'cheating', 'occult', 'dark-fantasy', 'dark-skin', 'housewife',
];

type Video = typeof TEST_VIDEOS[0];

// ============================================================================
// ANIMATED HOOK — Reusable spring animation for focus states
// ============================================================================
function useFocusAnimation(scaleTo: number) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: scaleTo,
        duration: ANIM_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: ANIM_DURATION,
        useNativeDriver: false,
      }),
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: ANIM_DURATION,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleTo, scaleAnim, shadowAnim, borderAnim]);

  const animateOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: ANIM_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0,
        duration: ANIM_DURATION,
        useNativeDriver: false,
      }),
      Animated.timing(borderAnim, {
        toValue: 0,
        duration: ANIM_DURATION,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, shadowAnim, borderAnim]);

  return { scaleAnim, shadowAnim, borderAnim, animateIn, animateOut };
}

// ============================================================================
// TAG CHIP COMPONENT — Netflix-style pill chips with multi-select long-press
// ============================================================================
interface TagChipProps {
  tag: string;
  selected: boolean;
  multiSelectMode: boolean;
  onToggle: () => void;
  onLongPress: () => void;
}

const TagChip: React.FC<TagChipProps> = ({
  tag,
  selected,
  multiSelectMode,
  onToggle,
  onLongPress,
}) => {
  const [focused, setFocused] = useState(false);
  const { scaleAnim, animateIn, animateOut } = useFocusAnimation(FOCUS_SCALE_TAG);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  const handleFocus = () => {
    setFocused(true);
    animateIn();
  };

  const handleBlur = () => {
    setFocused(false);
    animateOut();
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePressIn = () => {
    // Start long-press timer
    longPressTimer.current = setTimeout(() => {
      onLongPress();
      longPressTimer.current = null;
    }, LONG_PRESS_DURATION);
  };

  const handlePressOut = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Dynamic colors based on state
  const chipBg = selected
    ? COLORS.primary
    : focused
      ? COLORS.surfaceHover
      : COLORS.surfaceLight;
  const chipBorder = multiSelectMode
    ? COLORS.multiSelect
    : focused
      ? COLORS.white
      : 'transparent';
  const chipBorderWidth = focused ? 3 : selected ? 2 : 1;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.tagChip,
          {
            backgroundColor: chipBg,
            borderColor: chipBorder,
            borderWidth: chipBorderWidth,
          },
          multiSelectMode && styles.tagChipMultiSelect,
          selected && styles.tagChipSelected,
        ]}
        onPress={onToggle}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        {/* Checkmark for multi-select + selected */}
        {multiSelectMode && selected && (
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
        <Text
          style={[
            styles.tagChipText,
            selected && styles.tagChipTextSelected,
            focused && styles.tagChipTextFocused,
            multiSelectMode && styles.tagChipTextMulti,
          ]}
        >
          {tag}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================================================
// VIDEO CARD COMPONENT — Netflix-style with prominent focus cadre
// ============================================================================
interface VideoCardProps {
  video: Video;
  onSelect: () => void;
  index: number;
  isFocused: boolean;
  onFocusIn: () => void;
  onFocusOut: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelect,
  index,
  isFocused,
  onFocusIn,
  onFocusOut,
}) => {
  const { scaleAnim, shadowAnim, borderAnim, animateIn, animateOut } = useFocusAnimation(FOCUS_SCALE_CARD);

  useEffect(() => {
    if (isFocused) {
      animateIn();
    } else {
      animateOut();
    }
  }, [isFocused]);

  // Interpolate shadow for smooth glow effect
  const shadowOpacity = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.9],
  });
  const shadowRadius = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 25],
  });
  const elevation = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 20],
  });

  const borderColorValue = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#222222', COLORS.primary],
  });

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [{ scale: scaleAnim }],
          shadowColor: COLORS.primary,
          shadowOpacity,
          shadowRadius,
          elevation,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.videoCard,
          {
            borderColor: borderColorValue,
          },
        ]}
        onPress={onSelect}
        onFocus={onFocusIn}
        onBlur={onFocusOut}
        activeOpacity={0.9}
        hasTVPreferredFocus={index === 0}
      >
        {/* Thumbnail */}
        <View style={styles.thumbnail}>
          <Text style={styles.thumbnailIcon}>🎬</Text>

          {/* Rating badge */}
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{video.rating}</Text>
          </View>

          {/* Duration badge placeholder */}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>HD</Text>
          </View>

          {/* Play overlay on focus */}
          {isFocused && (
            <Animated.View style={styles.playOverlay}>
              <View style={styles.playButtonCircle}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </Animated.View>
          )}
        </View>

        {/* Card Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {video.title}
          </Text>
          <Text style={styles.cardViews}>
            {(video.views / 1000000).toFixed(1)}M vues
          </Text>
          <View style={styles.cardTags}>
            {video.tags.slice(0, 3).map((tag, i) => (
              <View key={i} style={styles.miniTag}>
                <Text style={styles.miniTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* "Appuyez pour lire" label on focus — Netflix style bottom bar */}
        {isFocused && (
          <View style={styles.focusLabelBar}>
            <Text style={styles.focusLabelText}>OK ▶ Lire</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================================================
// MULTI-SELECT ACTION BAR — Plex-style bottom bar for batch actions
// ============================================================================
interface MultiSelectBarProps {
  selectedCount: number;
  onDeselectAll: () => void;
  onApply: () => void;
  onExit: () => void;
}

const MultiSelectBar: React.FC<MultiSelectBarProps> = ({
  selectedCount,
  onDeselectAll,
  onApply,
  onExit,
}) => {
  const [focusedBtn, setFocusedBtn] = useState<string | null>(null);

  return (
    <View style={styles.multiSelectBar}>
      <View style={styles.multiSelectBarInner}>
        <View style={styles.multiSelectInfo}>
          <View style={styles.multiSelectDot} />
          <Text style={styles.multiSelectInfoText}>
            Mode multi-sélection — {selectedCount} tag{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.multiSelectActions}>
          <TouchableOpacity
            style={[
              styles.msButton,
              focusedBtn === 'clear' && styles.msButtonFocused,
            ]}
            onPress={onDeselectAll}
            onFocus={() => setFocusedBtn('clear')}
            onBlur={() => setFocusedBtn(null)}
          >
            <Text style={styles.msButtonText}>Tout effacer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.msButton,
              styles.msButtonPrimary,
              focusedBtn === 'apply' && styles.msButtonPrimaryFocused,
            ]}
            onPress={onApply}
            onFocus={() => setFocusedBtn('apply')}
            onBlur={() => setFocusedBtn(null)}
          >
            <Text style={styles.msButtonPrimaryText}>Appliquer ({selectedCount})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.msButton,
              focusedBtn === 'exit' && styles.msButtonFocused,
            ]}
            onPress={onExit}
            onFocus={() => setFocusedBtn('exit')}
            onBlur={() => setFocusedBtn(null)}
          >
            <Text style={styles.msButtonText}>✕ Quitter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

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
  const [timeoutReached, setTimeoutReached] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backHandlerRef = useRef<any>(null);

  const videoUrl = `https://hanime.tv/videos/hentai/${video.slug}`;

  useEffect(() => {
    backHandlerRef.current = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => {
      backHandlerRef.current?.remove();
    };
  }, [onBack]);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        setTimeoutReached(true);
        setLoading(false);
        setError('Délai de chargement dépassé (30s)');
      }
    }, LOADING_TIMEOUT);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [loading]);

  const injectedJS = `
    (function() {
      const style = document.createElement('style');
      style.innerHTML = \`
        .ad-container, .popup, .modal-overlay, .banner, .adsbygoogle {
          display: none !important;
        }
        video { max-width: 100% !important; }
        body { overflow-x: hidden !important; }
      \`;
      document.head.appendChild(style);
      setTimeout(() => {
        const video = document.querySelector('video');
        if (video) video.play().catch(() => {});
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
      {/* Header */}
      <View style={styles.playerHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
          hasTVPreferredFocus
        >
          <Text style={styles.backButtonArrow}>←</Text>
          <Text style={styles.backButtonText}>RETOUR</Text>
        </TouchableOpacity>
        <View style={styles.playerHeaderInfo}>
          <Text style={styles.playerTitle} numberOfLines={1}>{video.title}</Text>
          <Text style={styles.playerSubtitle}>Hanime.tv</Text>
        </View>
      </View>

      {/* Loading */}
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

      {/* Error */}
      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorIcon}>!</Text>
          <Text style={styles.errorText}>Erreur de chargement</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backLink} onPress={onBack}>
            <Text style={styles.backLinkText}>← Retour</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WebView */}
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
          ← RETOUR pour revenir à la bibliothèque
        </Text>
      </View>
    </View>
  );
};

// ============================================================================
// MAIN HOME SCREEN — Netflix-style browsing
// ============================================================================
const HomeScreen: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null);

  // Filter videos based on selected tags
  const filteredVideos =
    selectedTags.length === 0
      ? TEST_VIDEOS
      : TEST_VIDEOS.filter((v) => selectedTags.some((tag) => v.tags.includes(tag)));

  // Toggle a single tag
  const toggleTag = (tag: string) => {
    if (multiSelectMode) {
      setSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
      );
    } else {
      // Single toggle mode (Netflix-style: one tap to select/deselect)
      setSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
      );
    }
  };

  // Long-press on a tag activates multi-select mode
  const activateMultiSelect = (tag: string) => {
    setMultiSelectMode(true);
    // Auto-select the long-pressed tag if not already selected
    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
  };

  // Exit multi-select mode
  const exitMultiSelect = () => {
    setMultiSelectMode(false);
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ================================================================== */}
      {/* HEADER — Netflix-style branded header                              */}
      {/* ================================================================== */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>HenVideo</Text>
            {IS_TV && (
              <View style={styles.tvBadge}>
                <Text style={styles.tvBadgeText}>TV</Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.videoCount}>
              {filteredVideos.length} vidéo{filteredVideos.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Multi-select mode banner */}
        {multiSelectMode && (
          <View style={styles.multiSelectBanner}>
            <Text style={styles.multiSelectBannerText}>
              Mode multi-sélection actif — Long-press OK sur un tag pour ajouter
            </Text>
          </View>
        )}
      </View>

      {/* ================================================================== */}
      {/* TAGS SECTION — Horizontal scrollable pill chips (Netflix "Chips")   */}
      {/* ================================================================== */}
      <View style={styles.tagsSection}>
        <View style={styles.tagsHeader}>
          <Text style={styles.sectionTitle}>
            Catégories
            {selectedTags.length > 0 && (
              <Text style={styles.tagCount}> ({selectedTags.length} active{selectedTags.length > 1 ? 's' : ''})</Text>
            )}
          </Text>
          {!multiSelectMode && (
            <TouchableOpacity
              style={styles.multiSelectBtn}
              onPress={() => setMultiSelectMode(true)}
            >
              <Text style={styles.multiSelectBtnText}>Multi-sélection</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsScroll}
          contentContainerStyle={styles.tagsScrollContent}
        >
          {ALL_TAGS.map((tag) => (
            <TagChip
              key={tag}
              tag={tag}
              selected={selectedTags.includes(tag)}
              multiSelectMode={multiSelectMode}
              onToggle={() => toggleTag(tag)}
              onLongPress={() => activateMultiSelect(tag)}
            />
          ))}

          {selectedTags.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSelectedTags([])}
            >
              <Text style={styles.clearButtonText}>✕ Effacer tout</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* ================================================================== */}
      {/* VIDEOS GRID — Poster card layout (Netflix/Plex style)               */}
      {/* ================================================================== */}
      <View style={styles.videosSection}>
        <Text style={styles.sectionTitle}>
          {selectedTags.length > 0
            ? `Résultats pour: ${selectedTags.join(', ')}`
            : 'Tendances'}
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
              isFocused={focusedCardId === item.id}
              onFocusIn={() => setFocusedCardId(item.id)}
              onFocusOut={() => {
                if (focusedCardId === item.id) setFocusedCardId(null);
              }}
            />
          )}
          contentContainerStyle={styles.videoGrid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>Aucune vidéo trouvée</Text>
              <Text style={styles.emptySubtext}>
                Essayez de modifier vos filtres
              </Text>
            </View>
          }
        />
      </View>

      {/* ================================================================== */}
      {/* MULTI-SELECT ACTION BAR — Plex-style bottom bar                     */}
      {/* ================================================================== */}
      {multiSelectMode && (
        <MultiSelectBar
          selectedCount={selectedTags.length}
          onDeselectAll={() => setSelectedTags([])}
          onApply={exitMultiSelect}
          onExit={exitMultiSelect}
        />
      )}

      {/* ================================================================== */}
      {/* FOOTER — Navigation hint                                           */}
      {/* ================================================================== */}
      {!multiSelectMode && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Flèches ◄►▲▼ naviguer  |  OK sélectionner  |  Long-press OK multi-sélection  |  RETOUR quitter
          </Text>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// STYLES — Netflix/Plex/Disney+ inspired 10-foot TV UI
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // ==================== HEADER ====================
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: Platform.OS === 'web' ? 16 : 48,
    paddingBottom: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {},
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  tvBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.multiSelect,
  },
  tvBadgeText: {
    color: COLORS.multiSelect,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  videoCount: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  multiSelectBanner: {
    marginTop: 10,
    backgroundColor: COLORS.multiSelectBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.multiSelect,
  },
  multiSelectBannerText: {
    color: COLORS.multiSelect,
    fontSize: 13,
    fontWeight: '600',
  },

  // ==================== TAGS ====================
  tagsSection: {
    backgroundColor: COLORS.surface,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tagsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  tagCount: {
    color: COLORS.primary,
    fontSize: 14,
  },
  multiSelectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  multiSelectBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  tagsScroll: {
    paddingHorizontal: 0,
  },
  tagsScrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },

  // Tag chip — Netflix "Chips and Facets" style
  tagChip: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,          // Pill shape
    backgroundColor: COLORS.surfaceLight,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  tagChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  tagChipMultiSelect: {
    borderWidth: 2,
    borderColor: COLORS.multiSelect,
  },
  tagChipFocused: {
    borderColor: COLORS.white,
  },
  tagChipText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  tagChipTextSelected: {
    color: COLORS.white,
    fontWeight: '700',
  },
  tagChipTextFocused: {
    fontWeight: '700',
  },
  tagChipTextMulti: {
    color: COLORS.multiSelect,
  },
  checkmarkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.multiSelect,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
  },
  clearButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceHover,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearButtonText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },

  // ==================== VIDEO CARDS ====================
  videosSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  videoGrid: {
    paddingBottom: 20,
  },
  cardWrapper: {
    margin: 6,
  },
  videoCard: {
    width: (width - 56) / 2,    // 2 columns with proper spacing
    borderRadius: CARD_BORDER_RADIUS,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
    borderWidth: FOCUS_BORDER_WIDTH,
    borderColor: '#222222',      // Default invisible-ish border for layout stability
  },
  thumbnail: {
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnailIcon: {
    fontSize: 40,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  durationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(229, 9, 20, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  playIcon: {
    fontSize: 22,
    color: COLORS.white,
    marginLeft: 3,
  },
  cardInfo: {
    padding: 12,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 18,
  },
  cardViews: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  miniTag: {
    backgroundColor: COLORS.surfaceHover,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  miniTagText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
  // Focus label bar at bottom of card — Netflix style
  focusLabelBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(229, 9, 20, 0.95)',
    paddingVertical: 7,
    alignItems: 'center',
  },
  focusLabelText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // ==================== MULTI-SELECT BAR ====================
  multiSelectBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 2,
    borderTopColor: COLORS.multiSelect,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  multiSelectBarInner: {
    gap: 12,
  },
  multiSelectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  multiSelectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.multiSelect,
  },
  multiSelectInfoText: {
    color: COLORS.multiSelect,
    fontSize: 14,
    fontWeight: '600',
  },
  multiSelectActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  msButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  msButtonFocused: {
    borderColor: COLORS.white,
    backgroundColor: COLORS.surfaceHover,
  },
  msButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  msButtonPrimaryFocused: {
    borderColor: COLORS.white,
    backgroundColor: COLORS.primaryLight,
  },
  msButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  msButtonPrimaryText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // ==================== EMPTY STATE ====================
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: 14,
  },

  // ==================== FOOTER ====================
  footer: {
    padding: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },

  // ==================== PLAYER ====================
  playerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 16 : 48,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    zIndex: 100,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    marginRight: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  backButtonArrow: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  playerHeaderInfo: {
    flex: 1,
  },
  playerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  playerSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
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
    color: COLORS.white,
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingSubtext: {
    color: COLORS.textMuted,
    marginTop: 8,
    fontSize: 11,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 2,
    marginTop: 20,
    overflow: 'hidden',
  },
  loadingBarInner: {
    width: '60%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
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
    fontSize: 50,
    color: COLORS.primary,
    fontWeight: '900',
    marginBottom: 15,
  },
  errorText: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  errorDetail: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginBottom: 15,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  backLink: {
    padding: 10,
  },
  backLinkText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  controlsHint: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 10,
    alignItems: 'center',
  },
  controlsText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});

// ============================================================================
// EXPORT
// ============================================================================
export default HomeScreen;
