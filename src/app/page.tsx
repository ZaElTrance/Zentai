'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Video {
  id: string;
  name: string;
  slug?: string;
  url?: string;
  views: number;
  brand?: string;
  tags: string;
  source: string;
  typeVideo?: string;
  isUncensored: number;
  durationMin?: number;
  synopsis?: string;
  rating?: number;
  episodes?: number;
  releaseDate?: string;
  studio?: string;
  language?: string;
  coverUrl?: string;
  posterUrl?: string;
  comments: string;
  implicitTags: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function formatViews(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return '' + n;
}

function VideoCard({ video, onSelect }: { video: Video; onSelect: (v: Video) => void }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = video.coverUrl || video.posterUrl || '';
  const proxyUrl = imgSrc ? `/api/image?url=${encodeURIComponent(imgSrc)}` : '';

  return (
    <button
      className="group shrink-0 w-44 rounded-lg overflow-hidden bg-neutral-800/50 hover:bg-neutral-800 text-left transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-500"
      onClick={() => onSelect(video)}
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-900">
        {!imgError && proxyUrl ? (
          <img
            src={proxyUrl}
            alt={video.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-600">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        )}
        {video.isUncensored === 1 && (
          <span className="absolute top-1.5 left-1.5 bg-green-600/90 text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase">
            Uncensored
          </span>
        )}
        {video.rating && video.rating > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-yellow-600/90 text-[9px] font-bold px-1.5 py-0.5 rounded">
            ★ {video.rating.toFixed(1)}
          </span>
        )}
        {video.typeVideo && (
          <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-[9px] px-1.5 py-0.5 rounded">
            {video.typeVideo}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="text-xs font-medium text-white/90 line-clamp-2 leading-tight mb-1">{video.name}</h3>
        <div className="flex items-center gap-2 text-[10px] text-white/40">
          {video.brand && <span className="text-violet-400/70">{video.brand}</span>}
          {video.views > 0 && <span>{formatViews(video.views)}</span>}
        </div>
      </div>
    </button>
  );
}

export default function DatabasePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 32, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [availableTags, setAvailableTags] = useState<{ name: string; count: number }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchVideos = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '32' });
      if (search) params.set('search', search);
      if (selectedTags.length) params.set('tags', selectedTags.join(','));
      const res = await fetch(`/api/videos?${params}`);
      const data = await res.json();
      setVideos(data.videos || []);
      setPagination(data.pagination || { page, limit: 32, total: 0, totalPages: 0 });
    } catch { setVideos([]); }
    setLoading(false);
  }, [search, selectedTags]);

  useEffect(() => { fetchVideos(1); }, [fetchVideos]);

  useEffect(() => {
    fetch('/api/tags?limit=50')
      .then(r => r.json())
      .then(d => setAvailableTags(d.tags || []))
      .catch(() => {});
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  if (selectedVideo) {
    const imgSrc = selectedVideo.posterUrl || selectedVideo.coverUrl || '';
    const proxyUrl = imgSrc ? `/api/image?url=${encodeURIComponent(imgSrc)}` : '';
    const tagList = (selectedVideo.tags || '').split(',').filter(Boolean);
    let comments: string[] = [];
    try { comments = JSON.parse(selectedVideo.comments || '[]'); } catch {}
    let implicitTags: string[] = [];
    try { implicitTags = JSON.parse(selectedVideo.implicitTags || '[]'); } catch {}

    return (
      <div className="min-h-screen bg-neutral-950">
        <button onClick={() => setSelectedVideo(null)} className="fixed top-4 left-4 z-50 bg-black/60 backdrop-blur px-4 py-2 rounded-lg text-sm hover:bg-black/80">
          ← Retour
        </button>
        <div className="relative h-[50vh] overflow-hidden">
          {proxyUrl && <div className="absolute inset-0 bg-cover bg-center blur-sm opacity-30" style={{ backgroundImage: `url(${proxyUrl})` }} />}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
        </div>
        <div className="relative -mt-40 z-10 px-8 pb-8 flex gap-8">
          {proxyUrl && <img src={proxyUrl} alt={selectedVideo.name} className="w-52 shrink-0 rounded-lg shadow-2xl aspect-[3/4] object-cover" />}
          <div className="flex-1 pt-4">
            <h1 className="text-3xl font-bold mb-3">{selectedVideo.name}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-white/60 mb-4">
              {selectedVideo.brand && <span className="text-violet-400 font-medium">{selectedVideo.brand}</span>}
              <span>{formatViews(selectedVideo.views)} vues</span>
              {selectedVideo.rating && <span className="text-yellow-500">★ {selectedVideo.rating.toFixed(1)}</span>}
              {selectedVideo.typeVideo && <span>{selectedVideo.typeVideo}</span>}
              {selectedVideo.episodes && <span>{selectedVideo.episodes} épisodes</span>}
              {selectedVideo.releaseDate && <span>{selectedVideo.releaseDate}</span>}
              {selectedVideo.language && <span>{selectedVideo.language}</span>}
            </div>
            {tagList.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tagList.map(tag => <span key={tag} className="bg-white/10 text-white/70 px-3 py-1 rounded-full text-xs">{tag}</span>)}
              </div>
            )}
            {selectedVideo.synopsis && <p className="text-white/60 text-sm leading-relaxed mb-4 max-w-2xl">{selectedVideo.synopsis}</p>}
            {comments.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 text-white/80">Commentaires ({comments.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {comments.slice(0, 10).map((c, i) => <span key={i} className="bg-neutral-800 text-white/60 px-3 py-1 rounded-full text-xs">&ldquo;{c}&rdquo;</span>)}
                </div>
              </div>
            )}
            {implicitTags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-white/80">Tags IA ({implicitTags.length})</h3>
                <div className="flex flex-wrap gap-1.5">
                  {implicitTags.slice(0, 20).map((t, i) => <span key={i} className="bg-violet-900/30 text-violet-300/70 px-2 py-0.5 rounded text-[10px]">{t}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-neutral-950/95 backdrop-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold">Hentai Library</h1>
              <p className="text-xs text-white/40">Bibliothèque multimédia — {pagination.total} vidéos Hanime.tv</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500 w-56"
              />
            </div>
          </div>
          {/* Tags */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {availableTags.slice(0, 20).map(tag => (
              <button
                key={tag.name}
                onClick={() => toggleTag(tag.name)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors ${
                  selectedTags.includes(tag.name)
                    ? 'bg-violet-600 text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {tag.name} <span className="opacity-50">({tag.count})</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Videos grid */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-44 animate-pulse">
                <div className="w-full aspect-[3/4] bg-neutral-800 rounded-lg" />
                <div className="mt-2 h-3 bg-neutral-800 rounded w-3/4" />
                <div className="mt-1 h-2 bg-neutral-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : videos.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-3">
              {videos.map(video => (
                <VideoCard key={video.id} video={video} onSelect={setSelectedVideo} />
              ))}
            </div>
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => fetchVideos(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-4 py-2 bg-white/5 rounded-lg text-sm disabled:opacity-30 hover:bg-white/10"
                >
                  ← Précédent
                </button>
                <span className="text-sm text-white/40">Page {pagination.page} / {pagination.totalPages}</span>
                <button
                  onClick={() => fetchVideos(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 bg-white/5 rounded-lg text-sm disabled:opacity-30 hover:bg-white/10"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-white/30">
            <p className="text-lg">Aucune vidéo trouvée</p>
          </div>
        )}
      </main>
    </div>
  );
}
