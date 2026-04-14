'use client';

import { useState } from 'react';
import { extractYoutubeId } from '@/lib/utils';
import { Play } from 'lucide-react';

interface Props {
  url: string;
}

export function YoutubeEmbed({ url }: Props) {
  const [playing, setPlaying] = useState(false);
  const videoId = extractYoutubeId(url);

  if (!videoId) return null;

  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  if (playing) {
    return (
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
      onClick={() => setPlaying(true)}
    >
      <img src={thumbnail} alt="YouTube video" className="w-full h-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
        <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Play className="h-6 w-6 text-white fill-white ml-1" />
        </div>
      </div>
    </div>
  );
}
