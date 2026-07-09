import { motion } from 'framer-motion';
import { X, Globe, ImageIcon, Video, Smile, Loader2 } from 'lucide-react';
import React from 'react';

import { MediaGrid } from '@/components/posts/MediaGrid';
import { useCreatePost } from '@/hooks/post/useCreatePost';

interface CreatePostModalProps {
  user: {
    id?: string;
    name: string;
    email?: string;
    avatar?: string;
  } | null;
  onClose: () => void;
  onPostCreated: () => void;
  initialUploadTrigger?: 'image' | 'video' | null;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  user,
  onClose,
  onPostCreated,
  initialUploadTrigger,
}) => {
  const {
    postText,
    setPostText,
    fileInputRef,
    videoInputRef,
    uploadFiles,
    handleCreatePost,
    removeMedia,
    successFiles,
    pendingOrFailedFiles,
  } = useCreatePost({ user, onClose, onPostCreated, initialUploadTrigger });

  return (
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
            onClick={onClose}
            type="button"
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
                <Globe className="h-2.5 w-2.5" />
                <span>Public</span>
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

          {/* Media Grid Gallery Preview (Only for successfully uploaded items) */}
          <MediaGrid
            media={successFiles.map((f) => ({
              id: f.id,
              type: f.type,
              url: f.url || '',
              thumbnail: f.thumbnail,
            }))}
            isEditable={true}
            onRemove={(index) => removeMedia(successFiles[index].id)}
          />

          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
            accept="image/*"
            multiple
            className="hidden"
          />
          <input
            type="file"
            ref={videoInputRef}
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
            accept="video/*"
            className="hidden"
          />

          {/* Media Attachment Upload Status List (For compressing, uploading, or errors) */}
          {pendingOrFailedFiles.length > 0 && (
            <div className="mb-4 space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {pendingOrFailedFiles.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center justify-between rounded-lg border p-2.5 bg-zinc-50 dark:bg-zinc-950 ${
                    file.status === 'error'
                      ? 'border-rose-300 dark:border-rose-950 bg-rose-50/20 dark:bg-rose-950/10'
                      : 'border-zinc-100 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex flex-1 items-center gap-2 min-w-0">
                    {file.status === 'uploading' || file.status === 'compressing' ? (
                      <Loader2 className="h-5 w-5 shrink-0 text-blue-500 animate-spin" />
                    ) : file.type === 'video' ? (
                      <Video className="h-5 w-5 shrink-0 text-rose-500" />
                    ) : (
                      <ImageIcon className="h-5 w-5 shrink-0 text-emerald-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                        {file.name}
                      </p>
                      {file.status === 'compressing' && (
                        <span className="text-[10px] text-blue-500 font-medium animate-pulse">
                          Compressing file...
                        </span>
                      )}
                      {file.status === 'uploading' && (
                        <span className="text-[10px] text-zinc-400">Uploading...</span>
                      )}
                      {file.status === 'error' && (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold truncate block">
                          Error: {file.error}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedia(file.id)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add to your post panel */}
          <div className="mb-4 flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Add to your post
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-emerald-500 cursor-pointer transition-colors"
                title="Upload photos"
              >
                <ImageIcon className="h-5.5 w-5.5" />
              </button>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="rounded-full p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-rose-500 cursor-pointer transition-colors"
                title="Upload video"
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
            disabled={
              (!postText.trim() && successFiles.length === 0) ||
              pendingOrFailedFiles.some(
                (f) => f.status === 'uploading' || f.status === 'compressing',
              )
            }
            className="w-full rounded-lg bg-blue-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-zinc-250 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-650 transition-colors cursor-pointer"
          >
            Post
          </button>
        </form>
      </motion.div>
    </div>
  );
};
export default CreatePostModal;
