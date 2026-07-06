'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Image as ImageIcon,
  Video,
  Smile,
  ThumbsUp,
  MessageSquare,
  Share2,
  MoreHorizontal,
  X,
  Globe,
  Lock,
  Heart,
} from 'lucide-react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { type RootState } from '@/redux/store';

// Mock Interfaces
interface Story {
  id: string;
  userName: string;
  avatar: string;
  storyImage: string;
  unread: boolean;
}

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    badge?: string;
  };
  time: string;
  content: string;
  image?: string;
  likes: number;
  commentsCount: number;
  shares: number;
  hasLiked?: boolean;
}

export default function FeedPage() {
  const { user } = useSelector((state: RootState) => state.user);

  // States
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'Sarah Connor',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      },
      time: '2 hours ago',
      content:
        "Just launched the new version of our product! Check out the updated design system. 🚀✨ Really proud of the team's hard work over the past few months. What do you think?",
      image:
        'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
      likes: 124,
      commentsCount: 18,
      shares: 5,
      hasLiked: false,
    },
    {
      id: '2',
      author: {
        name: 'Alex Mercer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
      time: '5 hours ago',
      content:
        'Early morning coffee runs make the debugging sessions so much better. Happy Tuesday everyone! ☕💻',
      image:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
      likes: 42,
      commentsCount: 3,
      shares: 1,
      hasLiked: true,
    },
    {
      id: '3',
      author: {
        name: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
      time: '1 day ago',
      content:
        'Beautiful sunset in Switzerland today. Feeling blessed to travel and work remotely! 🏔️✈️',
      image:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
      likes: 312,
      commentsCount: 45,
      shares: 24,
      hasLiked: false,
    },
  ]);

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

  const [postText, setPostText] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && !selectedImage) return;

    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        name: user?.name || 'CurrentUser',
        avatar: user?.avatar || 'https://i.pravatar.cc/150',
      },
      time: 'Just now',
      content: postText,
      image: selectedImage || undefined,
      likes: 0,
      commentsCount: 0,
      shares: 0,
      hasLiked: false,
    };

    setPosts([newPost, ...posts]);
    setPostText('');
    setSelectedImage(null);
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
            {/* Story Background */}
            <img
              src={story.storyImage}
              alt={`${story.userName}'s story`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            {/* Profile Avatar */}
            <div
              className={`absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border-2 ${story.unread ? 'border-blue-600' : 'border-zinc-300'} bg-zinc-250 overflow-hidden`}
            >
              <img src={story.avatar} alt={story.userName} className="h-full w-full object-cover" />
            </div>
            {/* Name */}
            <span className="absolute bottom-3 left-3 right-3 text-xs font-semibold text-white truncate drop-shadow-sm">
              {story.userName}
            </span>
          </div>
        ))}
      </div>

      {/* Create Post Component */}
      <div className="mb-5 rounded-xl bg-white p-4 shadow-xs border border-zinc-200/50 dark:bg-zinc-900 dark:border-zinc-800/50">
        <div className="flex gap-2 items-center">
          <img
            src={user?.avatar || 'https://i.pravatar.cc/150'}
            alt="My Profile"
            className="h-10 w-10 rounded-full object-cover border border-zinc-100 dark:border-zinc-800"
          />
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 rounded-full bg-zinc-100 px-4 py-2.5 text-left text-sm text-zinc-500 hover:bg-zinc-200/80 transition-colors dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/80 cursor-pointer"
          >
            What&apos;s on your mind, {user?.name?.split(' ')[0] || 'User'}?
          </button>
        </div>

        <div className="mt-3 border-t border-zinc-105 dark:border-zinc-800 pt-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-zinc-650 dark:text-zinc-400">
          <button
            onClick={() => {
              setSelectedImage(
                'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
              );
              setShowCreateModal(true);
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors"
          >
            <Video className="h-5 w-5 text-rose-500" />
            <span>Live video</span>
          </button>

          <button
            onClick={() => {
              setSelectedImage(
                'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800',
              );
              setShowCreateModal(true);
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors"
          >
            <ImageIcon className="h-5 w-5 text-emerald-500" />
            <span>Photo/video</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors"
          >
            <Smile className="h-5 w-5 text-amber-500" />
            <span>Feeling/activity</span>
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-xl bg-white p-4 shadow-xs border border-zinc-200/50 dark:bg-zinc-900 dark:border-zinc-800/50 transition-colors"
          >
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

            {/* Post Image */}
            {post.image && (
              <div className="relative mb-3 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 max-h-[480px]">
                <img
                  src={post.image}
                  alt="Post attachment"
                  className="w-full h-auto max-h-[480px] object-cover"
                />
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
                <span className="hover:underline cursor-pointer">
                  {post.commentsCount} comments
                </span>
                <span className="hover:underline cursor-pointer">{post.shares} shares</span>
              </div>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-sm font-semibold pt-1">
              <button
                onClick={() => handleLike(post.id)}
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
        ))}
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-[500px] overflow-hidden rounded-xl bg-white shadow-xl dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 p-4">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 text-center flex-1">
                  Create post
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedImage(null);
                  }}
                  className="rounded-full bg-zinc-100 p-1.5 text-zinc-500 hover:bg-zinc-200 transition-colors dark:bg-zinc-850 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleCreatePost} className="p-4">
                {/* Author Info */}
                <div className="flex items-center gap-2.5 mb-4">
                  <img
                    src={user?.avatar || 'https://i.pravatar.cc/150'}
                    alt="My profile"
                    className="h-10 w-10 rounded-full object-cover border border-zinc-100 dark:border-zinc-800"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                      {user?.name || 'User'}
                    </h4>
                    <div className="mt-1 flex items-center gap-1 rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400 w-fit">
                      <Lock className="h-2.5 w-2.5" />
                      <span>Only me</span>
                    </div>
                  </div>
                </div>

                {/* Text Input */}
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'User'}?`}
                  rows={4}
                  className="w-full resize-none border-0 bg-transparent text-base text-zinc-900 outline-none placeholder-zinc-450 dark:text-zinc-100 focus:ring-0"
                  autoFocus
                />

                {/* Image Preview */}
                {selectedImage && (
                  <div className="relative mb-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-[200px] bg-zinc-50 dark:bg-zinc-950">
                    <img
                      src={selectedImage}
                      alt="Post preview"
                      className="w-full h-auto max-h-[200px] object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Add to your post */}
                <div className="mb-4 flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Add to your post
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
                        )
                      }
                      className="rounded-full p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-emerald-500 cursor-pointer transition-colors"
                    >
                      <ImageIcon className="h-5.5 w-5.5" />
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-rose-500 cursor-pointer transition-colors"
                    >
                      <Video className="h-5.5 w-5.5" />
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-amber-500 cursor-pointer transition-colors"
                    >
                      <Smile className="h-5.5 w-5.5" />
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!postText.trim() && !selectedImage}
                  className="w-full rounded-lg bg-blue-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-650 transition-colors cursor-pointer"
                >
                  Post
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
