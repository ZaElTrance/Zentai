// ============================================================================
// HenVideo — API Service
// Hanime.tv ONLY — Eporner removed
// Fetch wrapper with pagination, error handling, rate limit respect
// ============================================================================

import type {
  VideosResponse,
  TagsResponse,
  SearchResponse,
  VideoItem,
  Video,
} from '../types';

const API_BASE = 'https://hentai-database.vercel.app/api';

// ============================================================================
// Configuration
// ============================================================================
const DEFAULT_PAGE_SIZE = 20;
const MIN_REQUEST_INTERVAL = 500;  // ms between requests (rate limit safety)
let lastRequestTime = 0;

// ============================================================================
// Helpers
// ============================================================================

/** Rate limiter: ensures minimum interval between API calls */
async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - elapsed)
    );
  }
  lastRequestTime = Date.now();
  return fetch(url);
}

/** Parse comma-separated tags string into array */
function parseTags(tagsStr: string | undefined): string[] {
  if (!tagsStr) return [];
  return tagsStr.split(',').map(t => t.trim()).filter(Boolean);
}

/** Convert raw Video from API to normalized VideoItem — Hanime.tv only */
function normalizeVideo(v: Video): VideoItem | null {
  // Filter: only keep Hanime.tv videos
  if (v.source && v.source !== 'Hanime.tv') {
    return null;
  }
  return {
    ...v,
    tags: parseTags(v.tags),
    isUncensored: v.isUncensored === 1,
  };
}

/** Format views for display */
export function formatViews(views: number): string {
  if (views >= 1_000_000) return (views / 1_000_000).toFixed(1) + 'M';
  if (views >= 1_000) return (views / 1_000).toFixed(0) + 'K';
  return views.toString();
}

// ============================================================================
// Error handling
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function handleResponse(response: Response, endpoint: string): void {
  if (!response.ok) {
    if (response.status === 429) {
      throw new ApiError(
        'Trop de requetes. Veuillez patienter.',
        429,
        endpoint,
      );
    }
    if (response.status === 404) {
      throw new ApiError('Ressource non trouvee.', 404, endpoint);
    }
    throw new ApiError(
      `Erreur API: ${response.status} ${response.statusText}`,
      response.status,
      endpoint,
    );
  }
}

// ============================================================================
// API Methods
// ============================================================================

/**
 * Fetch paginated videos from the API.
 * Returns ONLY Hanime.tv videos (Eporner filtered out).
 * Server-side pagination — fetches more than needed to compensate for filtering.
 */
export async function fetchVideos(
  page: number = 1,
  limit: number = DEFAULT_PAGE_SIZE,
): Promise<VideosResponse> {
  // Fetch extra to compensate for Eporner filtering
  const fetchLimit = Math.ceil(limit * 1.5);
  const endpoint = `${API_BASE}/videos?page=${page}&limit=${fetchLimit}`;

  try {
    const response = await rateLimitedFetch(endpoint);
    handleResponse(response, endpoint);

    const data: VideosResponse = await response.json();
    // Filter out non-Hanime.tv videos
    const hanimeVideos = data.videos.filter(
      (v) => !v.source || v.source === 'Hanime.tv'
    );
    return {
      videos: hanimeVideos,
      pagination: {
        ...data.pagination,
        total: Math.floor(data.pagination.total * 0.7), // approximate Hanime-only count
      },
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      `Erreur de connexion: ${error instanceof Error ? error.message : 'Inconnue'}`,
      undefined,
      endpoint,
    );
  }
}

/**
 * Fetch a single page of videos and normalize them for UI use.
 * Hanime.tv only — Eporner completely removed.
 */
export async function fetchVideoItems(
  page: number = 1,
  limit: number = DEFAULT_PAGE_SIZE,
): Promise<{ videos: VideoItem[]; pagination: VideosResponse['pagination'] }> {
  const data = await fetchVideos(page, limit);
  const normalized = data.videos
    .map(normalizeVideo)
    .filter((v): v is VideoItem => v !== null)
    .slice(0, limit); // respect the original limit after filtering
  return {
    videos: normalized,
    pagination: data.pagination,
  };
}

/**
 * Search videos by query string.
 * Returns ONLY Hanime.tv results.
 */
export async function searchVideos(
  query: string,
  limit: number = DEFAULT_PAGE_SIZE,
): Promise<SearchResponse> {
  if (!query || query.trim().length === 0) {
    return { results: [], query: '' };
  }

  const endpoint = `${API_BASE}/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`;

  try {
    const response = await rateLimitedFetch(endpoint);
    handleResponse(response, endpoint);

    const data: SearchResponse = await response.json();
    // Filter: only Hanime.tv results
    const hanimeResults = data.results.filter(
      (r) => !r.source || r.source === 'Hanime.tv'
    );
    return { ...data, results: hanimeResults };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      `Erreur de recherche: ${error instanceof Error ? error.message : 'Inconnue'}`,
      undefined,
      endpoint,
    );
  }
}

/**
 * Fetch all tags sorted by count (most popular first).
 * Returns top N tags to avoid memory issues on TV.
 */
export async function fetchTags(
  limit: number = 50,
): Promise<{ tags: { name: string; count: number }[]; total: number }> {
  const endpoint = `${API_BASE}/tags`;

  try {
    const response = await rateLimitedFetch(endpoint);
    handleResponse(response, endpoint);

    const data: TagsResponse = await response.json();
    return {
      tags: data.tags.slice(0, limit),
      total: data.total,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      `Erreur tags: ${error instanceof Error ? error.message : 'Inconnue'}`,
      undefined,
      endpoint,
    );
  }
}
