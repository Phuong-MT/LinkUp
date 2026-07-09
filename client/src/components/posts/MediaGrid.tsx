import { X } from 'lucide-react';
import React from 'react';

export interface MediaItem {
  id?: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
}

interface MediaGridProps {
  media: MediaItem[];
  onRemove?: (index: number) => void;
  isEditable?: boolean;
}

export const MediaGrid: React.FC<MediaGridProps> = ({ media, onRemove, isEditable = false }) => {
  if (!media || media.length === 0) return null;

  const count = media.length;

  const handleRemove = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(index);
    }
  };

  // 1 file: full width (1/1)
  if (count === 1) {
    const item = media[0];
    return (
      <div className="relative mb-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-[360px] bg-black">
        {item.type === 'video' ? (
          <video
            src={item.url}
            controls={!isEditable}
            poster={item.thumbnail}
            className="w-full h-auto max-h-[360px] object-contain"
          />
        ) : (
          <img
            src={item.url}
            alt="Media attachment"
            className="w-full h-auto max-h-[360px] object-cover"
          />
        )}
        {isEditable && onRemove && (
          <button
            type="button"
            onClick={(e) => handleRemove(e, 0)}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  // 2 files: split screen layout (1/2 each)
  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 mb-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 h-[220px] bg-zinc-50 dark:bg-zinc-950">
        {media.map((item, index) => (
          <div key={index} className="relative h-full bg-black">
            {item.type === 'video' ? (
              <video
                src={item.url}
                controls={!isEditable}
                poster={item.thumbnail}
                className="w-full h-full object-cover"
              />
            ) : (
              <img src={item.url} alt="Media attachment" className="w-full h-full object-cover" />
            )}
            {isEditable && onRemove && (
              <button
                type="button"
                onClick={(e) => handleRemove(e, index)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors cursor-pointer z-10"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  // 3 files: grid layout of 3 (1/3 or 1 large, 2 smaller)
  if (count === 3) {
    return (
      <div className="grid grid-cols-3 gap-1 mb-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 h-[220px] bg-zinc-50 dark:bg-zinc-950">
        {media.map((item, index) => (
          <div key={index} className="relative h-full bg-black">
            {item.type === 'video' ? (
              <video
                src={item.url}
                controls={!isEditable}
                poster={item.thumbnail}
                className="w-full h-full object-cover"
              />
            ) : (
              <img src={item.url} alt="Media attachment" className="w-full h-full object-cover" />
            )}
            {isEditable && onRemove && (
              <button
                type="button"
                onClick={(e) => handleRemove(e, index)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors cursor-pointer z-10"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  // 4 or more files: show 4 items in grid, with count overlay (1/8+) on 4th item if remaining files exist
  const visibleMedia = media.slice(0, 4);
  const remainingCount = count - 4;

  return (
    <div className="grid grid-cols-2 gap-1 mb-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 h-[260px] bg-zinc-50 dark:bg-zinc-950">
      {visibleMedia.map((item, index) => {
        const isLastVisible = index === 3;
        return (
          <div key={index} className="relative h-[128px] bg-black">
            {item.type === 'video' ? (
              <video
                src={item.url}
                controls={!isEditable}
                poster={item.thumbnail}
                className="w-full h-full object-cover"
              />
            ) : (
              <img src={item.url} alt="Media attachment" className="w-full h-full object-cover" />
            )}
            {isLastVisible && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg select-none">
                +{remainingCount}
              </div>
            )}
            {isEditable && onRemove && (
              <button
                type="button"
                onClick={(e) => handleRemove(e, index)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors cursor-pointer z-10"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default MediaGrid;
