import { motion } from 'framer-motion';
import { X, Globe, Share2 } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { type Post } from '@/types/post.types';

interface SharePostModalProps {
  post: Post;
  user: {
    name?: string;
    avatar?: string;
  } | null;
  onClose: () => void;
  onShare: (caption: string) => void;
  isSubmitting?: boolean;
}

export const SharePostModal: React.FC<SharePostModalProps> = ({
  post,
  user,
  onClose,
  onShare,
  isSubmitting = false,
}) => {
  const [caption, setCaption] = useState('');

  const targetPost = useMemo(() => {
    return post.isShared && post.originalPost ? post.originalPost : post;
  }, [post]);

  const handleShareClick = () => {
    onShare(caption);
  };

  // Memoize the entire preview card to prevent re-rendering when caption updates
  const previewCard = useMemo(() => {
    if (!targetPost) return null;
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 p-3.5 space-y-2">
        <div className="flex items-center gap-2">
          <img
            src={targetPost.author.avatar}
            alt={targetPost.author.name}
            className="h-7 w-7 rounded-full object-cover"
          />
          <div>
            <h5 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
              {targetPost.author.name}
            </h5>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{targetPost.time}</span>
          </div>
        </div>

        {targetPost.content && (
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed line-clamp-3">
            {targetPost.content}
          </p>
        )}

        {targetPost.media && targetPost.media.length > 0 && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
            {targetPost.media[0].type === 'video' ? (
              <img
                key={targetPost.media[0].thumbnail || 'video-thumb'}
                src={
                  targetPost.media[0].thumbnail ||
                  'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400'
                }
                alt="Video thumbnail"
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                key={targetPost.media[0].url}
                src={targetPost.media[0].url}
                alt="Shared post attachment"
                className="h-full w-full object-cover"
              />
            )}
            {targetPost.media.length > 1 && (
              <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                +{targetPost.media.length - 1} more
              </div>
            )}
          </div>
        )}
      </div>
    );
  }, [targetPost]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative flex w-full max-w-[550px] flex-col rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold">
            <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Share Post</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-zinc-100 p-1.5 text-zinc-500 hover:bg-zinc-200 transition-colors dark:bg-zinc-850 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[70vh]">
          {/* User Info */}
          <div className="flex gap-2.5 items-center">
            <img
              src={user?.avatar || 'https://i.pravatar.cc/150'}
              alt={user?.name || 'User'}
              className="h-10 w-10 rounded-full object-cover border border-zinc-100 dark:border-zinc-800"
            />
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                {user?.name || 'User'}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                <Globe className="h-3 w-3" />
                <span>Share to Feed</span>
              </div>
            </div>
          </div>

          {/* Caption Input (Fixed height to prevent layout shifts) */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Say something about this..."
            className="w-full h-24 resize-none border-0 bg-transparent text-sm text-zinc-800 outline-none placeholder-zinc-400 dark:text-zinc-200 dark:placeholder-zinc-500 overflow-y-auto"
          />

          {/* Nested Post Preview */}
          {previewCard}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-zinc-150 dark:border-zinc-800 p-3 bg-zinc-50/50 dark:bg-zinc-950/20">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-850 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleShareClick}
            disabled={isSubmitting}
            className="flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer disabled:opacity-50 min-w-[80px]"
          >
            {isSubmitting ? 'Sharing...' : 'Share Now'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
export default SharePostModal;
