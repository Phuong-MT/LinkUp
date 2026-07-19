import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type Post, type Comment } from '@/types/post.types';

import {
  fetchPostsAsync,
  createPostAsync,
  fetchCommentsAsync,
  createCommentAsync,
  toggleLikePostAsync,
} from './postThunks';

interface PostState {
  posts: Post[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  hasMore: boolean;
  skip: number;
  commentsByPostId: Record<string, Comment[]>;
  commentsStatus: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed'>;
}

const initialState: PostState = {
  posts: [],
  status: 'idle',
  error: null,
  hasMore: true,
  skip: 0,
  commentsByPostId: {},
  commentsStatus: {},
};

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    toggleLikePost: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      const existingPost = state.posts.find((p) => p.id === postId);
      if (existingPost) {
        existingPost.hasLiked = !existingPost.hasLiked;
        existingPost.likes = existingPost.hasLiked
          ? existingPost.likes + 1
          : existingPost.likes - 1;
      }
    },
    addNewPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
      state.skip += 1;
    },
    resetPostsState: (state) => {
      state.posts = [];
      state.status = 'idle';
      state.error = null;
      state.hasMore = true;
      state.skip = 0;
      state.commentsByPostId = {};
      state.commentsStatus = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostsAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPostsAsync.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.status = 'succeeded';
        const newPosts = action.payload;
        // Append new items avoiding duplicates
        const existingIds = new Set(state.posts.map((p) => p.id));
        const filteredNewPosts = newPosts.filter((p) => !existingIds.has(p.id));

        state.posts = [...state.posts, ...filteredNewPosts];
        state.skip += filteredNewPosts.length;

        // If returned page is less than limit, no more pages are available on backend
        if (newPosts.length < 10) {
          state.hasMore = false;
        }
      })
      .addCase(fetchPostsAsync.rejected, (state, action) => {
        if (action.payload === 'ABORTED') {
          return;
        }
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(createPostAsync.fulfilled, (state, action) => {
        const rawPost = action.payload.post;
        const currentUser = action.payload.currentUser;
        const newPost: Post = {
          id: rawPost._id,
          author: {
            name: currentUser.name,
            avatar: currentUser.avatar,
          },
          time: 'Just now',
          content: rawPost.content || '',
          media: rawPost.media || [],
          likes: 0,
          commentsCount: 0,
          shares: 0,
          hasLiked: false,
        };
        state.posts.unshift(newPost);
        state.skip += 1;
      })
      .addCase(fetchCommentsAsync.pending, (state, action) => {
        const postId = action.meta.arg;
        state.commentsStatus[postId] = 'loading';
      })
      .addCase(fetchCommentsAsync.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        state.commentsStatus[postId] = 'succeeded';
        state.commentsByPostId[postId] = comments;
      })
      .addCase(fetchCommentsAsync.rejected, (state, action) => {
        const postId = action.meta.arg;
        state.commentsStatus[postId] = 'failed';
      })
      .addCase(createCommentAsync.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        if (!state.commentsByPostId[postId]) {
          state.commentsByPostId[postId] = [];
        }
        state.commentsByPostId[postId].unshift(comment);
        // Increment comment count inside feed posts
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          post.commentsCount += 1;
        }
      })
      .addCase(toggleLikePostAsync.pending, (state, action) => {
        const postId = action.meta.arg;
        const existingPost = state.posts.find((p) => p.id === postId);
        if (existingPost) {
          existingPost.hasLiked = !existingPost.hasLiked;
          existingPost.likes = existingPost.hasLiked
            ? existingPost.likes + 1
            : existingPost.likes - 1;
        }
      })
      .addCase(toggleLikePostAsync.fulfilled, (state, action) => {
        const { postId, hasLiked, likeCount } = action.payload;
        const existingPost = state.posts.find((p) => p.id === postId);
        if (existingPost) {
          existingPost.hasLiked = hasLiked;
          existingPost.likes = likeCount;
        }
      })
      .addCase(toggleLikePostAsync.rejected, (state, action) => {
        const postId = action.meta.arg;
        const existingPost = state.posts.find((p) => p.id === postId);
        if (existingPost) {
          existingPost.hasLiked = !existingPost.hasLiked;
          existingPost.likes = existingPost.hasLiked
            ? existingPost.likes + 1
            : existingPost.likes - 1;
        }
      });
  },
});

export const { toggleLikePost, addNewPost, resetPostsState } = postSlice.actions;
export default postSlice.reducer;
