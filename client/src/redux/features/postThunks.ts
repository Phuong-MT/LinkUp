import { createAsyncThunk } from '@reduxjs/toolkit';

import { type Post, type PostMedia, type Comment, type MentionUser } from '@/types/post.types';
import apiClient from '@/utils/api/axios';

interface RawPostMedia {
  type: 'image' | 'video';
  url: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
}

interface RawMentionResponse {
  _id: string;
  username?: string;
  profile?: {
    fullName?: string;
    avatar?: string;
  };
}

interface RawPostResponse {
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
  media?: RawPostMedia[];
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  hasLiked?: boolean;
  isShared?: boolean;
  originalPostId?: RawPostResponse | null;
  mentions?: RawMentionResponse[];
}

interface RawCommentResponse {
  commentId: string;
  authorId?: {
    username?: string;
    profile?: {
      fullName?: string;
      avatar?: string;
    };
  };
  content?: string;
  createdAt?: string;
  mentions?: RawMentionResponse[];
}

export const mapRawMention = (m: RawMentionResponse): MentionUser => ({
  id: m._id,
  username: m.username || '',
  fullName: m.profile?.fullName || '',
  avatar: m.profile?.avatar || '',
});

export const mapRawPost = (p: RawPostResponse): Post => ({
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
  hasLiked: p.hasLiked || false,
  isShared: p.isShared || false,
  originalPost: p.originalPostId ? mapRawPost(p.originalPostId) : null,
  mentions: p.mentions ? p.mentions.map(mapRawMention) : [],
});

export const fetchPostsAsync = createAsyncThunk(
  'post/fetchPosts',
  async (arg: { limit: number; skip: number; signal?: AbortSignal }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<RawPostResponse[]>('/posts', {
        params: { limit: arg.limit, skip: arg.skip },
        signal: arg.signal,
      });
      const fetchedPosts: Post[] = response.data.map((p) => mapRawPost(p));
      return fetchedPosts;
    } catch (err: unknown) {
      const e = err as {
        name?: string;
        response?: { data?: { message?: string } };
        message?: string;
      };
      if (e.name === 'CanceledError' || e.name === 'AbortError') {
        return rejectWithValue('ABORTED');
      }
      return rejectWithValue(e.response?.data?.message || e.message || 'Failed to fetch posts');
    }
  },
);

export const createPostAsync = createAsyncThunk(
  'post/createPost',
  async (
    payload: {
      content: string;
      media: PostMedia[];
      visibility: string;
      currentUser: { name: string; avatar: string };
    },
    { rejectWithValue },
  ) => {
    try {
      const { currentUser, ...apiPayload } = payload;
      const response = await apiClient.post<RawPostResponse>('/posts', apiPayload);
      return {
        post: response.data,
        currentUser,
      };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(e.response?.data?.message || e.message || 'Failed to create post');
    }
  },
);

export const fetchCommentsAsync = createAsyncThunk(
  'post/fetchComments',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<RawCommentResponse[]>(`/posts/${postId}/comments`);
      const comments: Comment[] = response.data.map((c) => ({
        id: c.commentId,
        author: {
          name: c.authorId?.profile?.fullName || c.authorId?.username || 'User',
          avatar: c.authorId?.profile?.avatar || 'https://i.pravatar.cc/150',
        },
        content: c.content || '',
        createdAt: new Date(c.createdAt || '').toLocaleString('vi-VN'),
        mentions: c.mentions ? c.mentions.map(mapRawMention) : [],
      }));
      return { postId, comments };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(e.response?.data?.message || e.message || 'Failed to fetch comments');
    }
  },
);

export const createCommentAsync = createAsyncThunk(
  'post/createComment',
  async (arg: { postId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<RawCommentResponse>(`/posts/${arg.postId}/comments`, {
        content: arg.content,
      });
      const comment: Comment = {
        id: response.data.commentId,
        author: {
          name:
            response.data.authorId?.profile?.fullName || response.data.authorId?.username || 'User',
          avatar: response.data.authorId?.profile?.avatar || 'https://i.pravatar.cc/150',
        },
        content: response.data.content || '',
        createdAt: new Date(response.data.createdAt || '').toLocaleString('vi-VN'),
        mentions: response.data.mentions ? response.data.mentions.map(mapRawMention) : [],
      };
      return { postId: arg.postId, comment };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(e.response?.data?.message || e.message || 'Failed to create comment');
    }
  },
);

export const toggleLikePostAsync = createAsyncThunk(
  'post/toggleLikePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ hasLiked: boolean; likeCount: number }>(
        `/posts/${postId}/like`,
      );
      return {
        postId,
        hasLiked: response.data.hasLiked,
        likeCount: response.data.likeCount,
      };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(e.response?.data?.message || e.message || 'Failed to toggle like');
    }
  },
);

export const sharePostAsync = createAsyncThunk(
  'post/sharePost',
  async (arg: { postId: string; content?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{
        sharedPost: RawPostResponse;
        targetPostId: string;
        sharesCount: number;
      }>(`/posts/${arg.postId}/share`, { content: arg.content });
      return {
        sharedPost: mapRawPost(response.data.sharedPost),
        targetPostId: response.data.targetPostId,
        sharesCount: response.data.sharesCount,
      };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(e.response?.data?.message || e.message || 'Failed to share post');
    }
  },
);
