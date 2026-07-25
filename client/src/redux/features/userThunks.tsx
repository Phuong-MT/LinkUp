import { createAsyncThunk } from '@reduxjs/toolkit';

import { type User } from '@/types/user.types';
import { type Role } from '@/types/user.types';
import apiClient from '@/utils/api/axios';

export const getUserMeAsync = createAsyncThunk(
  'user/getUserMeAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{ user: User; role: Role }>('/user/me');
      return response.data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = e.response?.data?.message || e.message || 'Failed to get user';
      return rejectWithValue(errorMessage);
    }
  },
);

interface SearchUserResponse {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
}

export const searchFriendsAsync = createAsyncThunk(
  'user/searchFriendsAsync',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<SearchUserResponse[]>(`/user/search?q=${query}`);
      return response.data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = e.response?.data?.message || e.message || 'Failed to search friends';
      return rejectWithValue(errorMessage);
    }
  },
);
