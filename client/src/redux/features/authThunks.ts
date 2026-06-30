import { createAsyncThunk } from '@reduxjs/toolkit';

import apiClient from '@/utils/api/axios';

export const loginAsync = createAsyncThunk(
  'auth/loginAsync',
  async ({ username, password }: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
      });
      return response.data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = e.response?.data?.message ?? e.message ?? 'Login failed';
      return rejectWithValue(errorMessage);
    }
  },
);
