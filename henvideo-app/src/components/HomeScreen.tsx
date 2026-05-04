// ============================================================================
// HenVideo — Home Screen (Redesigned)
// Top half: Selected video poster as background (80% opacity) + text overlay
// Bottom half: 6 cards in a SINGLE ROW, side by side
// Hanime.tv ONLY — images via CdnImage with Referer header
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  BackHandler,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { COLORS, IS_TV } from '../theme';
import { fetchVideoItems, fetchTags } from '../services/api';
import { getCachedTags, setCachedTags } from '../services/cache';
import VideoCard from './VideoCard';
import TagChip from './TagChip';
import CdnImage from './CdnImage';
import type { VideoItem } from '../types';

interface HomeScreenProps {
  onSelectVideo: (video: VideoItem) => void;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const TOP_HALF_HEIGHT = Math.floor(SCREEN_HEIGHT * 0.50);
const BOTTOM_HALF_HEIGHT = SCREEN_HEIGHT - TOP_HALF_HEIGHT;

const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectVideo }) => {
  // ---- Video state (paginated) ----
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // ---- Tag state (dynamic from API) ----
  const [tags, setTags] = useState<{ name: string; count: number }[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // ---- Selected video (for top half detail) ----
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [bgImgError, setBgImgError] = useState(false);
  const [thumbImgError, setThumbImgError] = useState(false);

  // ---- Tags pagination (3 rows) ----
  const tagsPerRow = 14;
  const [tagsPage, setTagsPage] = useState(0);
  const visibleTags = useMemo(() => {
    const start = tagsPage * tagsPerRow * 3;
    return tags.slice(start, start + tagsPerRow * 3);
  }, [tags, tagsPage, tagsPerRow]);
  const maxTagsPage = Math.ceil(tags.length / (tagsPerRow * 3)) - 1;

  // ---- Card pagination: 6 cards per page, in a single row ----
  const cardsPerPage = 6;
  const [cardsPage, setCardsPage] = useState(0);

  const filteredVideos = useMemo(() => {
    if (selectedTags.length === 0) return videos;
    return videos.filter(v =>
      selectedTags.some(tag =>
        v.tags.some(vt => vt.toLowerCase() === tag.toLowerCase()),
      ),
    );
  }, [videos, selectedTags]);

  const visibleCards = useMemo(() => {
    const start = cardsPage * cardsPerPage;
    return filteredVideos.slice(start, start + cardsPerPage);
  }, [filteredVideos, cardsPage]);

  const maxCardsPage = Math.max(0, Math.ceil(filteredVideos.length / cardsPerPage) - 1);

  // ---- Fetch tags (with cache) ----
  useEffect(() => {
    (async () => {
      try {
        const cached = await getCachedTags();
        if (cached) {
          setTags(cached.tags);
          setLoadingTags(false);
          return;
        }
        const data = await fetchTags(200);
        setTags(data.tags);
        await setCachedTags(data.tags, data.total);
      } catch (err: any) {
        console.warn('[HomeScreen] Failed to load tags:', err.message);
      } finally {
        setLoadingTags(false);
      }
    })();
  }, []);

  // ---- Fetch videos (paginated) ----
  const loadVideos = useCallback(async (pageNum: number, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoadingVideos(true);
      setVideoError(null);
    }

    try {
      const data = await fetchVideoItems(pageNum, 30);
      const newVideos = append
        ? [...videos, ...data.videos]
        : data.videos;
      setVideos(newVideos);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setTotalVideos(data.pagination.total);
      if (!append && data.videos.length > 0 && !selectedVideo) {
        setSelectedVideo(data.videos[0]);
      }
    } catch (err: any) {
      setVideoError(err.message || 'Erreur de chargement');
    } finally {
      setLoadingVideos(false);
      setLoadingMore(false);
    }
  }, [selectedVideo, videos]);

  useEffect(() => {
    loadVideos(1, false);
  }, []);

  // ---- Handle card select ----
  const handleCardSelect = (video: VideoItem) => {
    setSelectedVideo(video);
    setBgImgError(false);
    setThumbImgError(false);
    onSelectVideo(video);
  };

  // ---- Tag toggling ----
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
    setCardsPage(0);
  };

  useEffect(() => {
    setCardsPage(0);
    if (filteredVideos.length > 0) {
      setSelectedVideo(filteredVideos[0]);
      setBgImgError(false);
      setThumbImgError(false);
    }
  }, [selectedTags]);

  // ---- D-pad: Back button goes to previous card page ----
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (cardsPage > 0) {
        setCardsPage(p => p - 1);
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [cardsPage]);

  // ---- Render ----
  const displayVideo = selectedVideo || (filteredVideos.length > 0 ? filteredVideos[0] : null);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar style="light" />

      {/* ==================== TOP HALF: Poster Background + Text Overlay ==================== */}
      <View style={{ height: TOP_HALF_HEIGHT, position: 'relative' }}>
        {/* Poster as full background using CdnImage (with Referer header) */}
        {displayVideo && displayVideo.coverUrl && !bgImgError ? (
          <CdnImage
            uri={displayVideo.coverUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: SCREEN_WIDTH,
              height: TOP_HALF_HEIGHT,
            }}
            resizeMode="cover"
            onError={() => setBgImgError(true)}
          />
        ) : displayVideo && displayVideo.posterUrl && !bgImgError ? (
          <CdnImage
            uri={displayVideo.posterUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: SCREEN_WIDTH,
              height: TOP_HALF_HEIGHT,
            }}
            resizeMode="cover"
            onError={() => setBgImgError(true)}
          />
        ) : null}

        {/* Dark overlay at 80% opacity */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.80)',
        }} />

        {/* Content overlay: text left + poster thumb right */}
        {displayVideo ? (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: 'row',
            padding: 24,
          }}>
            {/* Left side: Text info */}
            <View style={{ flex: 1, justifyContent: 'center', paddingRight: 20 }}>
              <Text style={{
                color: COLORS.white,
                fontSize: 28,
                fontWeight: '900',
                lineHeight: 34,
                marginBottom: 10,
                textShadowColor: 'rgba(0,0,0,0.8)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 3,
              }} numberOfLines={3}>
                {displayVideo.name}
              </Text>

              {/* Meta badges */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                {displayVideo.rating > 0 && (
                  <View style={{
                    backgroundColor: 'rgba(255,215,0,0.2)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: COLORS.gold,
                  }}>
                    <Text style={{ color: COLORS.gold, fontSize: 13, fontWeight: '800' }}>
                      ★ {displayVideo.rating}/10
                    </Text>
                  </View>
                )}
                {displayVideo.isUncensored && (
                  <View style={{
                    backgroundColor: 'rgba(28,231,131,0.15)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: COLORS.multiSelect,
                  }}>
                    <Text style={{ color: COLORS.multiSelect, fontSize: 12, fontWeight: '800' }}>
                      UNCENSORED
                    </Text>
                  </View>
                )}
                <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' }}>
                  {displayVideo.typeVideo || 'Serie'}
                </Text>
                {displayVideo.durationMin && (
                  <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                    {displayVideo.durationMin} min
                  </Text>
                )}
              </View>

              {/* Views + studio + date */}
              <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginBottom: 6 }}>
                {displayVideo.views >= 1_000_000
                  ? (displayVideo.views / 1_000_000).toFixed(1) + 'M vues'
                  : displayVideo.views >= 1_000
                    ? (displayVideo.views / 1_000).toFixed(0) + 'K vues'
                    : displayVideo.views + ' vues'}
                {displayVideo.studio ? `  •  ${displayVideo.studio}` : ''}
                {displayVideo.releaseDate ? `  •  ${displayVideo.releaseDate}` : ''}
              </Text>

              {/* Synopsis */}
              {displayVideo.synopsis && (
                <Text style={{
                  color: COLORS.textSecondary,
                  fontSize: 12,
                  lineHeight: 16,
                  marginBottom: 8,
                }} numberOfLines={4}>
                  {displayVideo.synopsis}
                </Text>
              )}

              {/* Tags */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                {displayVideo.tags.slice(0, 8).map((tag, i) => (
                  <View key={i} style={{
                    backgroundColor: 'rgba(229, 9, 20, 0.25)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: 'rgba(229, 9, 20, 0.5)',
                  }}>
                    <Text style={{ color: COLORS.primaryLight, fontSize: 11, fontWeight: '600' }}>
                      {tag}
                    </Text>
                  </View>
                ))}
                {displayVideo.tags.length > 8 && (
                  <Text style={{ color: COLORS.textMuted, fontSize: 11, lineHeight: 22, paddingLeft: 4 }}>
                    +{displayVideo.tags.length - 8}
                  </Text>
                )}
              </View>
            </View>

            {/* Right side: Poster thumbnail with CdnImage */}
            <View style={{
              width: Math.min(180, SCREEN_WIDTH * 0.18),
              borderRadius: 12,
              overflow: 'hidden',
              borderWidth: 3,
              borderColor: COLORS.primary,
              elevation: 8,
              shadowColor: COLORS.primary,
              shadowOpacity: 0.4,
              shadowRadius: 15,
            }}>
              {displayVideo.posterUrl && !thumbImgError ? (
                <CdnImage
                  uri={displayVideo.posterUrl}
                  style={{ width: '100%', aspectRatio: 3 / 4 }}
                  resizeMode="cover"
                  onError={() => setThumbImgError(true)}
                />
              ) : (
                <Image
                  source={require('../../assets/icon.png')}
                  style={{ width: '100%', aspectRatio: 3 / 4, opacity: 0.3 }}
                  resizeMode="contain"
                />
              )}
            </View>
          </View>
        ) : loadingVideos ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ color: COLORS.textMuted, marginTop: 12, fontSize: 14 }}>
              Chargement...
            </Text>
          </View>
        ) : null}

        {/* Header bar at very top */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 8,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
          <Text style={{ color: COLORS.primary, fontSize: 22, fontWeight: '900', letterSpacing: 1 }}>
            HenVideo
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>
              {totalVideos > 0 ? `${totalVideos} videos` : ''}
            </Text>
            {IS_TV && (
              <View style={{
                backgroundColor: COLORS.surfaceLight,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: COLORS.multiSelect,
              }}>
                <Text style={{ color: COLORS.multiSelect, fontSize: 10, fontWeight: '700' }}>TV</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ==================== TAGS SECTION ==================== */}
      <View style={{
        backgroundColor: COLORS.surface,
        paddingTop: 6,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 24,
          marginBottom: 4,
        }}>
          <Text style={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: '700' }}>
            Tags
            {selectedTags.length > 0 && (
              <Text style={{ color: COLORS.primary, fontSize: 11 }}> ({selectedTags.length})</Text>
            )}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {tagsPage > 0 && (
              <TouchableOpacity onPress={() => setTagsPage(p => p - 1)} style={{
                paddingHorizontal: 10, paddingVertical: 3,
                backgroundColor: COLORS.surfaceLight, borderRadius: 4,
                borderWidth: 1, borderColor: COLORS.border,
              }}>
                <Text style={{ color: COLORS.textSecondary, fontSize: 10 }}>◀ Prev</Text>
              </TouchableOpacity>
            )}
            {tagsPage < maxTagsPage && (
              <TouchableOpacity onPress={() => setTagsPage(p => p + 1)} style={{
                paddingHorizontal: 10, paddingVertical: 3,
                backgroundColor: COLORS.surfaceLight, borderRadius: 4,
                borderWidth: 1, borderColor: COLORS.border,
              }}>
                <Text style={{ color: COLORS.textSecondary, fontSize: 10 }}>Next ▶</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loadingTags ? (
          <View style={{ paddingHorizontal: 24, paddingVertical: 4 }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16 }}>
            {[0, 1, 2].map(row => {
              const rowTags = visibleTags.slice(row * tagsPerRow, (row + 1) * tagsPerRow);
              if (rowTags.length === 0) return null;
              return (
                <ScrollView
                  key={`tag-row-${row}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 2 }}
                  contentContainerStyle={{ alignItems: 'center' }}
                >
                  {rowTags.map((tag) => (
                    <TagChip
                      key={tag.name}
                      tag={tag.name}
                      count={tag.count}
                      selected={selectedTags.includes(tag.name)}
                      multiSelectMode={true}
                      onToggle={() => toggleTag(tag.name)}
                      onLongPress={() => toggleTag(tag.name)}
                    />
                  ))}
                  {selectedTags.length > 0 && row === 2 && (
                    <TouchableOpacity
                      onPress={() => setSelectedTags([])}
                      style={{
                        height: 32, paddingHorizontal: 12, borderRadius: 16,
                        backgroundColor: COLORS.surfaceHover, marginRight: 10,
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 1, borderColor: COLORS.border,
                      }}
                    >
                      <Text style={{ color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' }}>
                        Effacer tout
                      </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              );
            })}
          </View>
        )}
      </View>

      {/* ==================== BOTTOM HALF: 6 Cards Side by Side ==================== */}
      <View style={{ height: BOTTOM_HALF_HEIGHT, backgroundColor: COLORS.bg }}>
        {/* Page navigation bar */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 4,
          backgroundColor: COLORS.surface,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}>
          <Text style={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: '700' }}>
            {selectedTags.length > 0
              ? `Filtre: ${selectedTags.join(', ')} (${filteredVideos.length})`
              : `Tendances (${filteredVideos.length})`}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {cardsPage > 0 && (
              <TouchableOpacity onPress={() => setCardsPage(p => p - 1)} style={{
                paddingHorizontal: 10, paddingVertical: 3,
                backgroundColor: COLORS.surfaceLight, borderRadius: 6,
                borderWidth: 1, borderColor: COLORS.border,
              }}>
                <Text style={{ color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' }}>
                  ◀ Page {cardsPage}
                </Text>
              </TouchableOpacity>
            )}
            {cardsPage < maxCardsPage && (
              <TouchableOpacity onPress={() => setCardsPage(p => p + 1)} style={{
                paddingHorizontal: 10, paddingVertical: 3,
                backgroundColor: COLORS.primary, borderRadius: 6,
              }}>
                <Text style={{ color: COLORS.white, fontSize: 11, fontWeight: '600' }}>
                  Page {cardsPage + 2} ▶
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 6 cards in a SINGLE ROW, side by side, covering full width */}
        {loadingVideos ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ color: COLORS.textMuted, marginTop: 12, fontSize: 14 }}>
              Chargement des videos...
            </Text>
          </View>
        ) : videoError ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 48, color: COLORS.primary, marginBottom: 12 }}>!</Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 16, marginBottom: 16 }}>{videoError}</Text>
            <TouchableOpacity
              onPress={() => loadVideos(1, false)}
              style={{ paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 8 }}
            >
              <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: '700' }}>Reessayer</Text>
            </TouchableOpacity>
          </View>
        ) : filteredVideos.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 48, color: COLORS.textMuted, marginBottom: 12 }}>?</Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 16 }}>Aucune video trouvee</Text>
          </View>
        ) : (
          <View style={{
            flex: 1,
            flexDirection: 'row',
            padding: 6,
            gap: 4,
          }}>
            {visibleCards.map((video, index) => (
              <VideoCard
                key={`${cardsPage}-${video.id}`}
                video={video}
                onSelect={() => handleCardSelect(video)}
                index={index}
                style={{
                  flex: 1,
                  // Each card takes equal width in the row
                }}
              />
            ))}

            {/* Load more if needed */}
            {filteredVideos.length <= cardsPerPage && page < totalPages && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 24,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: COLORS.primary,
                  borderRadius: 8,
                }}
                onPress={() => loadVideos(page + 1, true)}
              >
                <Text style={{ color: COLORS.white, fontSize: 13, fontWeight: '700' }}>
                  {loadingMore ? 'Chargement...' : 'Charger plus'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Page indicator */}
        {!loadingVideos && filteredVideos.length > 0 && (
          <View style={{
            position: 'absolute',
            bottom: 6,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}>
            <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>
              Page {cardsPage + 1}/{maxCardsPage + 1}  |  D-pad naviguer  |  OK lire  |  RETOUR page prec.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default HomeScreen;
