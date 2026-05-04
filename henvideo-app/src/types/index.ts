// ============================================================================
// HenVideo — Type definitions
// ============================================================================

/** Video returned by /api/videos (full data) */
export interface Video {
  id: string;
  name: string;
  slug: string;
  url: string;
  views: number;
  brand: string;
  tags: string;       // comma-separated: "big tits,blowjob,uncensored"
  source: string;     // "Hanime.tv" | "Eporner"
  typeVideo: string;  // "Série" | "Film"
  isUncensored: number;
  durationMin: number | null;
  synopsis: string;
  releaseDate: string;
  studio: string;
  rating: number;
  episodes: number;
  language: string;
  posterUrl: string;
  coverUrl: string;
  comments: string;   // JSON string array
  implicitTags: string; // JSON string array
}

/** Search result returned by /api/search (simplified) */
export interface SearchResult {
  id: string;
  name: string;
  imageUrl: string;
  views: number;
  rating: number;
  typeVideo: string;
  source: string;
  matchField: string;
  contextBefore: string;
  contextMatch: string;
  contextAfter: string;
}

/** Tag returned by /api/tags */
export interface Tag {
  name: string;
  count: number;
}

/** Pagination metadata from /api/videos */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** API response shapes */
export interface VideosResponse {
  videos: Video[];
  pagination: Pagination;
}

export interface TagsResponse {
  tags: Tag[];
  total: number;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
}

/** Parsed tag array from video.tags string */
export type ParsedTags = string[];

/** Normalized video item used in the UI (tags as array) */
export interface VideoItem {
  id: string;
  name: string;
  slug: string;
  url: string;
  views: number;
  tags: string[];
  source: string;
  typeVideo: string;
  isUncensored: boolean;
  durationMin: number | null;
  synopsis: string;
  releaseDate: string;
  studio: string;
  rating: number;
  episodes: number;
  language: string;
  posterUrl: string;
  coverUrl: string;
}
