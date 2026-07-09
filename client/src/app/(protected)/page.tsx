'use client';

import { AnimatePresence } from 'framer-motion';
import { Plus, Video, Image as ImageIcon, Smile, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { PostCard } from '@/components/posts/PostCard';
import { type RootState } from '@/redux/store';
import { type Post, type PostMedia } from '@/types/post.types';
import apiClient from '@/utils/api/axios';

// Interfaces
interface Story {
  id: string;
  userName: string;
  avatar: string;
  storyImage: string;
  unread: boolean;
}

export default function FeedPage() {
  const { user } = useSelector((state: RootState) => state.user);

  // States
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [initialUploadType, setInitialUploadType] = useState<'image' | 'video' | null>(null);

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

  // Fetch all posts on load
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);
        const response = await apiClient.get('/posts');
        const fetchedPosts = response.data.map(
          (p: {
            _id: string;
            authorId?: {
              username?: string;
              profile?: {
                fullName?: string;
                avatar?: string;
              };
            };
            publishedAt?: string;
            createdAt?: string;
            content?: string;
            media?: PostMedia[];
            likeCount?: number;
            commentCount?: number;
            shareCount?: number;
          }) => ({
            id: p._id,
            author: {
              name: p.authorId?.profile?.fullName || p.authorId?.username || 'User',
              avatar: p.authorId?.profile?.avatar || 'https://i.pravatar.cc/150',
            },
            time: new Date(p.publishedAt || p.createdAt || '').toLocaleString('vi-VN'),
            content: p.content || '',
            media: p.media || [],
            likes: p.likeCount || 0,
            commentsCount: p.commentCount || 0,
            shares: p.shareCount || 0,
            hasLiked: false,
          }),
        );
        setPosts(fetchedPosts);
      } catch (err) {
        console.error('Failed to fetch posts', err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            hasLiked: !p.hasLiked,
            likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
          };
        }
        return p;
      }),
    );
  };

  const handleOpenCreateModal = (uploadType: 'image' | 'video' | null) => {
    setInitialUploadType(uploadType);
    setShowCreateModal(true);
  };

  const handlePostCreated = (newPostRaw: {
    _id: string;
    content?: string;
    media?: PostMedia[];
  }) => {
    const newPost = {
      id: newPostRaw._id,
      author: {
        name: user?.name || 'CurrentUser',
        avatar: user?.avatar || 'https://i.pravatar.cc/150',
      },
      time: 'Just now',
      content: newPostRaw.content || '',
      media: newPostRaw.media || [],
      likes: 0,
      commentsCount: 0,
      shares: 0,
      hasLiked: false,
    };
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    setShowCreateModal(false);
  };

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
      <div className="mb-5 rounded-xl bg-white p-4 shadow-xs border border-zinc-200/50 dark:bg-zinc-900 dark:border-zinc-800/50">
        <div className="flex gap-2 items-center">
          <img
            src={user?.avatar || 'https://i.pravatar.cc/150'}
            alt="My Profile"
            className="h-10 w-10 rounded-full object-cover border border-zinc-100 dark:border-zinc-800"
          />
          <button
            onClick={() => handleOpenCreateModal(null)}
            className="flex-1 rounded-full bg-zinc-100 px-4 py-2.5 text-left text-sm text-zinc-500 hover:bg-zinc-200/80 transition-colors dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/80 cursor-pointer"
          >
            What&apos;s on your mind, {user?.name?.split(' ')[0] || 'User'}?
          </button>
        </div>

        <div className="mt-3 border-t border-zinc-105 dark:border-zinc-800 pt-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-zinc-650 dark:text-zinc-400">
          <button
            onClick={() => handleOpenCreateModal('video')}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors"
          >
            <Video className="h-5 w-5 text-rose-500" />
            <span>Live video</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal('image')}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors"
          >
            <ImageIcon className="h-5 w-5 text-emerald-500" />
            <span>Photo/video</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal(null)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors"
          >
            <Smile className="h-5 w-5 text-amber-500" />
            <span>Feeling/activity</span>
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {loadingPosts ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-500">
            No posts found. Create the first one!
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} onLike={handleLike} />)
        )}
      </div>

      {/* Create Post Modal */}
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
      </AnimatePresence>
    </div>
  );
}
