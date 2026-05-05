import { NextRequest, NextResponse } from 'next/server';
import videosData from '@/data/videos.json';

const allVideos = videosData as any[];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').toLowerCase();
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!q) return NextResponse.json({ results: [], query: '' });

    const results: any[] = [];

    for (const v of allVideos) {
      if (results.length >= limit) break;

      const nameMatch = v.name?.toLowerCase().includes(q);
      const tagsMatch = v.tags?.toLowerCase().includes(q);
      const synopsisMatch = v.synopsis?.toLowerCase().includes(q);
      const brandMatch = v.brand?.toLowerCase().includes(q);

      if (nameMatch || tagsMatch || synopsisMatch || brandMatch) {
        let matchField = '';
        if (nameMatch) matchField = 'name';
        else if (tagsMatch) matchField = 'tags';
        else if (synopsisMatch) matchField = 'synopsis';
        else matchField = 'brand';

        results.push({
          id: v.id,
          name: v.name,
          imageUrl: v.coverUrl || v.posterUrl || '',
          views: v.views,
          rating: v.rating,
          typeVideo: v.typeVideo,
          source: v.source,
          matchField,
        });
      }
    }

    return NextResponse.json({ results, query: q });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
