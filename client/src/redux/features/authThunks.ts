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

export const sendVerificationCodeAsync = createAsyncThunk(
  'auth/sendVerificationCodeAsync',
  async ({ email }: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/send-code', {
        email,
      });
      return response.data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = e.response?.data?.message ?? e.message ?? 'Failed to send code';
      return rejectWithValue(errorMessage);
    }
  },
);

export const loginWithCodeAsync = createAsyncThunk(
  'auth/loginWithCodeAsync',
  async ({ email, code }: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/login-with-code', {
        email,
        code,
      });
      return response.data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = e.response?.data?.message ?? e.message ?? 'Login failed';
      return rejectWithValue(errorMessage);
    }
  },
);

export const sendForgotPasswordCodeAsync = createAsyncThunk(
  'auth/sendForgotPasswordCodeAsync',
  async ({ email }: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ message: string }>(
        '/auth/forgot-password/send-code',
        {
          email,
        },
      );
      return response.data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = e.response?.data?.message ?? e.message ?? 'Failed to send code';
      return rejectWithValue(errorMessage);
    }
  },
);

export const resetPasswordAsync = createAsyncThunk(
  'auth/resetPasswordAsync',
  async ({ email, code, newPassword }: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/forgot-password/reset', {
        email,
        code,
        newPassword,
      });
      return response.data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = e.response?.data?.message ?? e.message ?? 'Password reset failed';
      return rejectWithValue(errorMessage);
    }
  },
);
