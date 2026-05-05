import { NextRequest, NextResponse } from 'next/server';
import videosData from '@/data/videos.json';

const allVideos = videosData as any[];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '32');
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags') || '';
    const typeVideo = searchParams.get('typeVideo') || '';
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const id = searchParams.get('id') || '';
    const source = searchParams.get('source') || '';

    // Single video lookup
    if (id) {
      const video = allVideos.find(v => v.id === id);
      if (video) return NextResponse.json({ video });
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Filter
    let filtered = allVideos;
    if (source) filtered = filtered.filter(v => v.source === source);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(v =>
        v.name?.toLowerCase().includes(q) ||
        v.synopsis?.toLowerCase().includes(q) ||
        v.brand?.toLowerCase().includes(q) ||
        v.tags?.toLowerCase().includes(q)
      );
    }
    if (tags) {
      const tagList = tags.split(',').map(t => t.trim().toLowerCase());
      filtered = filtered.filter(v => {
        const videoTags = (v.tags || '').toLowerCase();
        return tagList.every(t => videoTags.includes(t));
      });
    }
    if (typeVideo) filtered = filtered.filter(v => v.typeVideo === typeVideo);
    if (minRating > 0) filtered = filtered.filter(v => (v.rating || 0) >= minRating);

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedVideos = filtered.slice(start, start + limit);

    return NextResponse.json({
      videos: paginatedVideos,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
