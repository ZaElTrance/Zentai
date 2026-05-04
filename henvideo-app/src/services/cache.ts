// ============================================================================
// HenVideo — Cache Service
// In-memory cache for tags, search history
// No external dependencies — plug & play on Google TV
// ============================================================================

import type { VideoItem } from '../types';

// ============================================================================
// Types
// ============================================================================
interface CachedTags {
  tags: { name: string; count: number }[];
  total: number;
  cachedAt: number;
}

const TAG_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_SEARCH_HISTORY = 20;

// ============================================================================
// In-memory storage
// ============================================================================
const memoryStore: Record<string, string> = {};

function memGet(key: string): string | null {
  return memoryStore[key] || null;
}

function memSet(key: string, value: string): void {
  memoryStore[key] = value;
}

function memGetJSON<T>(key: string): T | null {
  const raw = memGet(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function memSetJSON<T>(key: string, value: T): void {
  memSet(key, JSON.stringify(value));
}

// ============================================================================
// Tag Cache
// ============================================================================

export async function getCachedTags(): Promise<CachedTags | null> {
  const cached = memGetJSON<CachedTags>('henvideo_tag_cache');
  if (!cached) return null;

  const age = Date.now() - cached.cachedAt;
  if (age > TAG_CACHE_DURATION) {
    delete memoryStore['henvideo_tag_cache'];
    return null;
  }

  return cached;
}

export async function setCachedTags(
  tags: { name: string; count: number }[],
  total: number,
): Promise<void> {
  memSetJSON('henvideo_tag_cache', {
    tags,
    total,
    cachedAt: Date.now(),
  });
}

// ============================================================================
// Search History
// ============================================================================

export async function getSearchHistory(): Promise<string[]> {
  return memGetJSON<string[]>('henvideo_search_history') || [];
}

export async function addToSearchHistory(query: string): Promise<void> {
  if (!query || query.trim().length === 0) return;
  const trimmed = query.trim();

  const history = await getSearchHistory();
  const filtered = history.filter(h => h !== trimmed);
  filtered.unshift(trimmed);
  memSetJSON('henvideo_search_history', filtered.slice(0, MAX_SEARCH_HISTORY));
}

export async function clearSearchHistory(): Promise<void> {
  delete memoryStore['henvideo_search_history'];
}

// ============================================================================
// Favorites
// ============================================================================

export async function getFavoriteIds(): Promise<string[]> {
  return memGetJSON<string[]>('henvideo_favorites') || [];
}

export async function isFavorite(videoId: string): Promise<boolean> {
  const ids = await getFavoriteIds();
  return ids.includes(videoId);
}

export async function toggleFavorite(videoId: string): Promise<boolean> {
  const ids = await getFavoriteIds();
  const index = ids.indexOf(videoId);

  if (index >= 0) {
    ids.splice(index, 1);
    memSetJSON('henvideo_favorites', ids);
    return false;
  } else {
    if (ids.length >= 100) ids.pop();
    ids.unshift(videoId);
    memSetJSON('henvideo_favorites', ids);
    return true;
  }
}
