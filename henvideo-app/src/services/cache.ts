// ============================================================================
// HenVideo — Cache Service
// Tag cache (AsyncStorage), search history, favorites
// Keeps memory footprint minimal for Firestick (1GB RAM)
// ============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VideoItem } from '../types';

// ============================================================================
// Storage Keys
// ============================================================================
const KEYS = {
  TAG_CACHE: 'henvideo_tag_cache',
  SEARCH_HISTORY: 'henvideo_search_history',
  FAVORITES: 'henvideo_favorites',
} as const;

// ============================================================================
// Types
// ============================================================================
interface CachedTags {
  tags: { name: string; count: number }[];
  total: number;
  cachedAt: number; // timestamp
}

const TAG_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_SEARCH_HISTORY = 20;
const MAX_FAVORITES = 100;

// ============================================================================
// Generic AsyncStorage helpers
// ============================================================================

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently fail
    console.warn(`[Cache] Failed to write ${key}`);
  }
}

// ============================================================================
// Tag Cache
// ============================================================================

/** Get cached tags if still valid (within 24h) */
export async function getCachedTags(): Promise<CachedTags | null> {
  const cached = await getItem<CachedTags>(KEYS.TAG_CACHE);
  if (!cached) return null;

  const age = Date.now() - cached.cachedAt;
  if (age > TAG_CACHE_DURATION) {
    // Cache expired — remove it
    await AsyncStorage.removeItem(KEYS.TAG_CACHE);
    return null;
  }

  return cached;
}

/** Store tags in cache */
export async function setCachedTags(
  tags: { name: string; count: number }[],
  total: number,
): Promise<void> {
  await setItem<CachedTags>(KEYS.TAG_CACHE, {
    tags,
    total,
    cachedAt: Date.now(),
  });
}

// ============================================================================
// Search History
// ============================================================================

/** Get recent search queries (most recent first) */
export async function getSearchHistory(): Promise<string[]> {
  const history = await getItem<string[]>(KEYS.SEARCH_HISTORY);
  return history || [];
}

/** Add a search query to history (deduplicated, most recent first) */
export async function addToSearchHistory(query: string): Promise<void> {
  if (!query || query.trim().length === 0) return;
  const trimmed = query.trim();

  const history = await getSearchHistory();
  // Remove if already exists (will re-add at top)
  const filtered = history.filter(h => h !== trimmed);
  // Add to front
  filtered.unshift(trimmed);
  // Limit size
  const limited = filtered.slice(0, MAX_SEARCH_HISTORY);
  await setItem(KEYS.SEARCH_HISTORY, limited);
}

/** Clear all search history */
export async function clearSearchHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.SEARCH_HISTORY);
}

// ============================================================================
// Favorites
// ============================================================================

/** Get favorite video IDs */
export async function getFavoriteIds(): Promise<string[]> {
  const favorites = await getItem<string[]>(KEYS.FAVORITES);
  return favorites || [];
}

/** Check if a video is in favorites */
export async function isFavorite(videoId: string): Promise<boolean> {
  const ids = await getFavoriteIds();
  return ids.includes(videoId);
}

/** Toggle favorite status for a video */
export async function toggleFavorite(videoId: string): Promise<boolean> {
  const ids = await getFavoriteIds();
  const index = ids.indexOf(videoId);

  if (index >= 0) {
    // Remove from favorites
    ids.splice(index, 1);
    await setItem(KEYS.FAVORITES, ids);
    return false;
  } else {
    // Add to favorites (limit total count)
    if (ids.length >= MAX_FAVORITES) {
      ids.pop(); // Remove oldest
    }
    ids.unshift(videoId);
    await setItem(KEYS.FAVORITES, ids);
    return true;
  }
}
