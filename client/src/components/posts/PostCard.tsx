import { Globe, MoreHorizontal, ThumbsUp, Heart, MessageSquare, Share2 } from 'lucide-react';
import React from 'react';

import { type Post } from '@/types/post.types';

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike }) => {
  return (
    <article className="rounded-xl bg-white p-4 shadow-xs border border-zinc-200/50 dark:bg-zinc-900 dark:border-zinc-800/50 transition-colors animate-fade-in">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2.5 items-center">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="h-10 w-10 rounded-full object-cover border border-zinc-105 dark:border-zinc-800"
          />
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
              {post.author.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              <span>{post.time}</span>
              <span>•</span>
              <Globe className="h-3 w-3" />
            </div>
          </div>
        </div>
        <button className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 rounded-full transition-colors cursor-pointer">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Post Content */}
      <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed mb-3 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Post Media Attachments */}
      {post.media && post.media.length > 0 && (
        <div className="grid gap-2 grid-cols-1 mb-3">
          {post.media.map((med, index) => {
            if (med.type === 'video') {
              return (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-lg bg-black max-h-[480px]"
                >
                  <video
                    src={med.url}
                    controls
                    poster={med.thumbnail}
                    className="w-full h-auto max-h-[480px]"
                  />
                </div>
              );
            }
            return (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 max-h-[480px]"
              >
                <img
                  src={med.url}
                  alt="Post media attachment"
                  className="w-full h-auto max-h-[480px] object-cover"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Post Metrics */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pb-2 border-b border-zinc-100 dark:border-zinc-800 mb-2">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white border-2 border-white dark:border-zinc-900">
              <ThumbsUp className="h-2.5 w-2.5 fill-current" />
            </span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white border-2 border-white dark:border-zinc-900">
              <Heart className="h-2.5 w-2.5 fill-current" />
            </span>
          </div>
          <span className="ml-1 hover:underline cursor-pointer">{post.likes}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hover:underline cursor-pointer">{post.commentsCount} comments</span>
          <span className="hover:underline cursor-pointer">{post.shares} shares</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-sm font-semibold pt-1">
        <button
          onClick={() => onLike(post.id)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors ${
            post.hasLiked ? 'text-blue-600 dark:text-blue-400' : ''
          }`}
        >
          <ThumbsUp className={`h-5 w-5 ${post.hasLiked ? 'fill-current' : ''}`} />
          <span>Like</span>
        </button>

        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors">
          <MessageSquare className="h-5 w-5" />
          <span>Comment</span>
        </button>

        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors">
          <Share2 className="h-5 w-5" />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
};
