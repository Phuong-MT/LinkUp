import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { createPostAsync } from '@/redux/features/postThunks';
import { type AppDispatch } from '@/redux/store';
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

interface UseCreatePostProps {
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

export const useCreatePost = ({
  user,
  onPostCreated,
  initialUploadTrigger,
}: UseCreatePostProps) => {
  const dispatch = useDispatch<AppDispatch>();
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
      const limit = isImage ? 20 * 1024 * 1024 : 100 * 1024 * 1024;
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
      await dispatch(
        createPostAsync({
          content: postText,
          media: successfulMedia,
          visibility: 'public',
          currentUser: {
            name: user?.name || 'User',
            avatar: user?.avatar || 'https://i.pravatar.cc/150',
          },
        }),
      ).unwrap();

      onPostCreated();
      setPostText('');
      setUploadingFiles([]);
    } catch {
      alert('Failed to complete post submission.');
    }
  };

  const removeMedia = (id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const successFiles = uploadingFiles.filter((f) => f.status === 'success');
  const pendingOrFailedFiles = uploadingFiles.filter((f) => f.status !== 'success');

  return {
    postText,
    setPostText,
    uploadingFiles,
    fileInputRef,
    videoInputRef,
    uploadFiles,
    handleCreatePost,
    removeMedia,
    successFiles,
    pendingOrFailedFiles,
  };
};
export default useCreatePost;
