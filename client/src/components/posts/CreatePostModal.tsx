import { motion } from 'framer-motion';
import { X, Globe, ImageIcon, Video, Smile, Loader2 } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

import { type Post } from '@/types/post.types';
import { type User } from '@/types/user.types';
import apiClient from '@/utils/api/axios';
import { resizeImage, resizeVideo } from '@/utils/media';

interface UploadingFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  status: 'compressing' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
}

interface CreatePostModalProps {
  user: {
    id?: string;
    name: string;
    email?: string;
    avatar?: string;
  } | null;
  onClose: () => void;
  onPostCreated: (newPost: {
    _id: string;
    content?: string;
    media?: {
      type: 'image' | 'video';
      url: string;
      width?: number;
      height?: number;
      duration?: number;
      thumbnail?: string;
    }[];
  }) => void;
  initialUploadTrigger?: 'image' | 'video' | null;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  user,
  onClose,
  onPostCreated,
  initialUploadTrigger,
}) => {
  const [postText, setPostText] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  // Trigger file selection if user clicked specific media buttons on Feed Card
  useEffect(() => {
    if (isFirstRender.current && initialUploadTrigger) {
      isFirstRender.current = false;
      setTimeout(() => {
        if (initialUploadTrigger === 'image') {
          fileInputRef.current?.click();
        } else if (initialUploadTrigger === 'video') {
          videoInputRef.current?.click();
        }
      }, 200);
    }
  }, [initialUploadTrigger]);

  const uploadFiles = async (files: FileList) => {
    const filesArray = Array.from(files);

    for (const file of filesArray) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        alert('Unsupported file type. Only images and videos are supported.');
        continue;
      }

      // 5MB limit for images, 20MB for videos
      const limit = isImage ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
      const fileId = Math.random().toString(36).substring(2, 9);

      const newUploadingFile: UploadingFile = {
        id: fileId,
        name: file.name,
        type: isImage ? 'image' : 'video',
        status: 'compressing',
      };

      setUploadingFiles((prev) => [...prev, newUploadingFile]);

      if (file.size > limit) {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: 'error',
                  error: `Size limit exceeded (${isImage ? '5MB' : '20MB'})`,
                }
              : f,
          ),
        );
        continue;
      }

      let fileToUpload: File = file;

      try {
        if (isImage) {
          fileToUpload = await resizeImage(file);
        } else if (isVideo) {
          fileToUpload = await resizeVideo(file);
        }
      } catch (compressionError) {
        console.warn('Client-side compression failed, sending original file:', compressionError);
      }

      setUploadingFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: 'uploading' } : f)),
      );

      try {
        const formData = new FormData();
        formData.append('file', fileToUpload);

        const response = await apiClient.post('/posts/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const uploadedMedia = response.data;

        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: 'success',
                  url: uploadedMedia.url,
                  width: uploadedMedia.width,
                  height: uploadedMedia.height,
                  duration: uploadedMedia.duration,
                  thumbnail: uploadedMedia.thumbnail,
                }
              : f,
          ),
        );
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        const errMsg = e.response?.data?.message || 'Upload failed';
        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: 'error', error: errMsg } : f)),
        );
      }
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    const isUploading = uploadingFiles.some(
      (f) => f.status === 'uploading' || f.status === 'compressing',
    );
    if (isUploading) {
      alert('Please wait for files to finish processing.');
      return;
    }

    const successfulMedia = uploadingFiles
      .filter((f) => f.status === 'success')
      .map((f) => ({
        type: f.type,
        url: f.url!,
        width: f.width,
        height: f.height,
        duration: f.duration,
        thumbnail: f.thumbnail,
      }));

    if (!postText.trim() && successfulMedia.length === 0) return;

    try {
      const response = await apiClient.post('/posts', {
        content: postText,
        media: successfulMedia,
        visibility: 'public',
      });

      onPostCreated(response.data);
      setPostText('');
      setUploadingFiles([]);
    } catch {
      alert('Failed to complete post submission.');
    }
  };

  // Helper method to render grid gallery for successfully uploaded files
  const renderMediaPreview = (mediaList: UploadingFile[]) => {
    if (mediaList.length === 0) return null;

    const count = mediaList.length;

    const removeMedia = (id: string) => {
      setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
    };

    // 1 file: full width (1/1)
    if (count === 1) {
      const item = mediaList[0];
      return (
        <div className="relative mb-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-[300px] bg-black">
          {item.type === 'video' ? (
            <video
              src={item.url}
              controls
              poster={item.thumbnail}
              className="w-full h-auto max-h-[300px] object-contain"
            />
          ) : (
            <img
              src={item.url}
              alt="Uploaded attachment"
              className="w-full h-auto max-h-[300px] object-cover"
            />
          )}
          <button
            type="button"
            onClick={() => removeMedia(item.id)}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      );
    }

    // 2 files: split screen layout (1/2 each)
    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-1 mb-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 h-[220px] bg-zinc-50 dark:bg-zinc-950">
          {mediaList.map((item) => (
            <div key={item.id} className="relative h-full bg-black">
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  poster={item.thumbnail}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={item.url}
                  alt="Uploaded attachment"
                  className="w-full h-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => removeMedia(item.id)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors cursor-pointer z-10"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      );
    }

    // 3 files: grid layout of 3 (1/3 or 1 large, 2 smaller)
    if (count === 3) {
      return (
        <div className="grid grid-cols-3 gap-1 mb-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 h-[220px] bg-zinc-50 dark:bg-zinc-950">
          {mediaList.map((item) => (
            <div key={item.id} className="relative h-full bg-black">
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  poster={item.thumbnail}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={item.url}
                  alt="Uploaded attachment"
                  className="w-full h-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => removeMedia(item.id)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors cursor-pointer z-10"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      );
    }

    // 4 or more files: show 4 items in grid, with count overlay (1/8+) on 4th item if remaining files exist
    const visibleMedia = mediaList.slice(0, 4);
    const remainingCount = count - 4;

    return (
      <div className="grid grid-cols-2 gap-1 mb-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 h-[260px] bg-zinc-50 dark:bg-zinc-950">
        {visibleMedia.map((item, index) => {
          const isLastVisible = index === 3;
          return (
            <div key={item.id} className="relative h-[128px] bg-black">
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  poster={item.thumbnail}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={item.url}
                  alt="Uploaded attachment"
                  className="w-full h-full object-cover"
                />
              )}
              {isLastVisible && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg select-none">
                  +{remainingCount}
                </div>
              )}
              <button
                type="button"
                onClick={() => removeMedia(item.id)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors cursor-pointer z-10"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const successFiles = uploadingFiles.filter((f) => f.status === 'success');
  const pendingOrFailedFiles = uploadingFiles.filter((f) => f.status !== 'success');

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
          {renderMediaPreview(successFiles)}

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
                    onClick={() =>
                      setUploadingFiles((prev) => prev.filter((f) => f.id !== file.id))
                    }
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
              (!postText.trim() &&
                uploadingFiles.filter((f) => f.status === 'success').length === 0) ||
              uploadingFiles.some((f) => f.status === 'uploading' || f.status === 'compressing')
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
