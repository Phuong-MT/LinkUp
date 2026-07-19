import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { resetPostsState } from '@/redux/features/postSlice';
import { fetchPostsAsync, toggleLikePostAsync } from '@/redux/features/postThunks';
import { type RootState, type AppDispatch } from '@/redux/store';

export const usePosts = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);
  const { posts, status, hasMore, skip } = useSelector((state: RootState) => state.post);

  // Modal visibility states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [initialUploadType, setInitialUploadType] = useState<'image' | 'video' | null>(null);

  // Refs for Infinite Scroll and AbortController
  const observerRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset post slice data on mount & clean up AbortController on unmount
  useEffect(() => {
    dispatch(resetPostsState());
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [dispatch]);

  // Infinite Scroll Trigger
  useEffect(() => {
    if (status === 'loading' || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Abort previous call if still running
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          abortControllerRef.current = new AbortController();

          dispatch(
            fetchPostsAsync({
              limit: 10,
              skip,
              signal: abortControllerRef.current.signal,
            }),
          );
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [dispatch, status, hasMore, skip]);

  const handleLike = (postId: string) => {
    dispatch(toggleLikePostAsync(postId));
  };

  const handleOpenCreateModal = (uploadType: 'image' | 'video' | null) => {
    setInitialUploadType(uploadType);
    setShowCreateModal(true);
  };

  const handlePostCreated = () => {
    setShowCreateModal(false);
  };

  return {
    user,
    posts,
    status,
    hasMore,
    showCreateModal,
    initialUploadType,
    observerRef,
    handleLike,
    handleOpenCreateModal,
    handlePostCreated,
    setShowCreateModal,
    setInitialUploadType,
  };
};
