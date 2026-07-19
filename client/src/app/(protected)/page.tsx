'use client';

import { AnimatePresence } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { CreatePostTrigger } from '@/components/posts/CreatePostTrigger';
import { PostCard } from '@/components/posts/PostCard';
import { SharePostModal } from '@/components/posts/SharePostModal';
import { usePosts } from '@/hooks/post/usePosts';

// Interfaces
interface Story {
  id: string;
  userName: string;
  avatar: string;
  storyImage: string;
  unread: boolean;
}

export default function FeedPage() {
  const {
    user,
    posts,
    status,
    hasMore,
    showCreateModal,
    initialUploadType,
    observerRef,
    sharingPost,
    isSharingSubmitting,
    handleLike,
    handleOpenCreateModal,
    handlePostCreated,
    handleShareTrigger,
    handleShareSubmit,
    setShowCreateModal,
    setInitialUploadType,
    setSharingPost,
  } = usePosts();

  const [stories] = useState<Story[]>([
    {
      id: '1',
      userName: 'Sarah Connor',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      storyImage: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=300',
      unread: true,
    },
    {
      id: '2',
      userName: 'Alex Mercer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      storyImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300',
      unread: true,
    },
    {
      id: '3',
      userName: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      storyImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300',
      unread: false,
    },
    {
      id: '4',
      userName: 'David Miller',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      storyImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=300',
      unread: false,
    },
  ]);

  return (
    <div className="mx-auto w-full max-w-[680px] px-2 py-4 md:px-4">
      {/* Stories Section */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* Create Story Card */}
        <div className="relative h-48 w-32 shrink-0 overflow-hidden rounded-xl bg-white shadow-xs transition-transform duration-200 hover:scale-[1.02] dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50">
          <div className="h-32 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-850">
            <img
              src={user?.avatar || 'https://i.pravatar.cc/150'}
              alt="My Avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 px-2 pb-2 text-center flex flex-col justify-end items-center">
            <button className="absolute -top-5 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white hover:bg-blue-700 dark:border-zinc-900 transition-colors">
              <Plus className="h-5 w-5" />
            </button>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Create story
            </span>
          </div>
        </div>

        {/* Dynamic Stories */}
        {stories.map((story) => (
          <div
            key={story.id}
            className="relative h-48 w-32 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-zinc-200 shadow-xs transition-all duration-200 hover:scale-[1.02] dark:bg-zinc-805 border border-zinc-200/50 dark:border-zinc-800/50 group"
          >
            <img
              src={story.storyImage}
              alt={`${story.userName}'s story`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div
              className={`absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border-2 ${story.unread ? 'border-blue-600' : 'border-zinc-300'} bg-zinc-250 overflow-hidden`}
            >
              <img src={story.avatar} alt={story.userName} className="h-full w-full object-cover" />
            </div>
            <span className="absolute bottom-3 left-3 right-3 text-xs font-semibold text-white truncate drop-shadow-sm">
              {story.userName}
            </span>
          </div>
        ))}
      </div>

      {/* Create Post Component Trigger */}
      <CreatePostTrigger user={user} onClickTrigger={handleOpenCreateModal} />

      {/* Feed List */}
      <div className="space-y-4">
        {posts.length === 0 && status !== 'loading' ? (
          <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-500">
            No posts found. Create the first one!
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} onShare={handleShareTrigger} />
          ))
        )}

        {/* Intersection Observer Target Trigger */}
        <div ref={observerRef} className="h-12 flex justify-center items-center">
          {status === 'loading' && <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />}
          {!hasMore && posts.length > 0 && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold py-2">
              You&apos;ve reached the end of the feed.
            </span>
          )}
        </div>
      </div>

      {/* Create & Share Post Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreatePostModal
            user={user}
            onClose={() => {
              setShowCreateModal(false);
              setInitialUploadType(null);
            }}
            onPostCreated={handlePostCreated}
            initialUploadTrigger={initialUploadType}
          />
        )}

        {sharingPost && (
          <SharePostModal
            post={sharingPost}
            user={user}
            onClose={() => setSharingPost(null)}
            onShare={handleShareSubmit}
            isSubmitting={isSharingSubmitting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
