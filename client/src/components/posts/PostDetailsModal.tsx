import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Send, Loader2, MessageSquare, ThumbsUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchCommentsAsync, createCommentAsync } from '@/redux/features/postThunks';
import { type RootState, type AppDispatch } from '@/redux/store';
import { type Post } from '@/types/post.types';

interface PostDetailsModalProps {
  post: Post;
  onClose: () => void;
  onLike: (id: string) => void;
}

export const PostDetailsModal: React.FC<PostDetailsModalProps> = ({ post, onClose, onLike }) => {
  const dispatch = useDispatch<AppDispatch>();
  const comments = useSelector((state: RootState) => state.post.commentsByPostId[post.id] || []);
  const commentsStatus = useSelector(
    (state: RootState) => state.post.commentsStatus[post.id] || 'idle',
  );

  const [commentText, setCommentText] = useState('');
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchCommentsAsync(post.id));
  }, [dispatch, post.id]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await dispatch(createCommentAsync({ postId: post.id, content: commentText })).unwrap();
      setCommentText('');
    } catch {
      alert('Failed to send comment.');
    }
  };

  const hasMedia = post.media && post.media.length > 0;
  const mediaCount = post.media ? post.media.length : 0;
  const currentMedia = hasMedia && post.media ? post.media[activeMediaIndex] : null;

  const handlePrevMedia = () => {
    setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : mediaCount - 1));
  };

  const handleNextMedia = () => {
    setActiveMediaIndex((prev) => (prev < mediaCount - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        className="relative flex h-full w-full max-w-[1100px] flex-col overflow-hidden bg-white shadow-2xl dark:bg-zinc-900 sm:h-[85vh] sm:rounded-2xl sm:flex-row border border-zinc-200/50 dark:border-zinc-800/50"
      >
        {/* Close Button (for small screen / overlays) */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/75 transition-colors cursor-pointer sm:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Side: Media Carousel Viewer */}
        {hasMedia ? (
          <div className="relative flex flex-1 items-center justify-center bg-black h-[40vh] sm:h-full group">
            {currentMedia?.type === 'video' ? (
              <video
                src={currentMedia.url}
                controls
                poster={currentMedia.thumbnail}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <img
                src={currentMedia?.url}
                alt="Post attachment detail"
                className="max-h-full max-w-full object-contain"
              />
            )}

            {/* Navigation buttons */}
            {mediaCount > 1 && (
              <>
                <button
                  onClick={handlePrevMedia}
                  className="absolute left-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNextMedia}
                  className="absolute right-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                {/* Image index badge */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                  {activeMediaIndex + 1} / {mediaCount}
                </div>
              </>
            )}
          </div>
        ) : null}

        {/* Right Side: Details & Comments */}
        <div
          className={`flex flex-col bg-white dark:bg-zinc-900 h-[60vh] sm:h-full ${hasMedia ? 'w-full sm:w-[400px] border-t sm:border-t-0 sm:border-l' : 'flex-1'} border-zinc-200 dark:border-zinc-800`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 p-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-10 w-10 rounded-full object-cover border border-zinc-100 dark:border-zinc-800"
              />
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {post.author.name}
                </h4>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{post.time}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="hidden sm:block rounded-full bg-zinc-100 p-1.5 text-zinc-500 hover:bg-zinc-200 transition-colors dark:bg-zinc-850 dark:text-zinc-400 dark:hover:bg-zinc-850 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Post Content & Comments Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Content text */}
            <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>

            {/* Interaction Buttons row */}
            <div className="flex items-center justify-between border-y border-zinc-150 dark:border-zinc-800 py-2.5 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
              <button
                onClick={() => onLike(post.id)}
                className={`flex flex-1 items-center justify-center gap-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg cursor-pointer transition-colors ${
                  post.hasLiked ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
                }`}
              >
                <ThumbsUp className={`h-4.5 w-4.5 ${post.hasLiked ? 'fill-current' : ''}`} />
                <span>{post.likes} Like</span>
              </button>
              <div className="flex flex-1 items-center justify-center gap-2 py-1">
                <MessageSquare className="h-4.5 w-4.5" />
                <span>{post.commentsCount} Comment</span>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3 pt-2">
              <h5 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Comments
              </h5>

              {commentsStatus === 'loading' && comments.length === 0 ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-center text-zinc-400 dark:text-zinc-500 py-6">
                  No comments yet. Start the conversation!
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2 items-start text-sm">
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        className="h-8 w-8 rounded-full object-cover shrink-0 border border-zinc-100 dark:border-zinc-800"
                      />
                      <div className="flex-1 rounded-2xl bg-zinc-100 px-3 py-2 dark:bg-zinc-850">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                            {comment.author.name}
                          </span>
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500">
                            {comment.createdAt}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-750 dark:text-zinc-300 leading-normal">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Comment Input Footer */}
          <form
            onSubmit={handleSendComment}
            className="border-t border-zinc-150 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-950 shrink-0"
          >
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-full border border-zinc-250 bg-white px-4 py-2 text-xs text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-zinc-250 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-650 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
export default PostDetailsModal;
