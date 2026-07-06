import { createSlice } from '@reduxjs/toolkit';

import {
  loginAsync,
  sendVerificationCodeAsync,
  loginWithCodeAsync,
  sendForgotPasswordCodeAsync,
  resetPasswordAsync,
  sendRegisterCodeAsync,
  registerConfirmAsync,
  resendRegisterCodeAsync,
} from './authThunks';

interface AuthState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  codeStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  forgotPasswordCodeStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  resetPasswordStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  registerCodeStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  registerConfirmStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  status: 'idle',
  codeStatus: 'idle',
  forgotPasswordCodeStatus: 'idle',
  resetPasswordStatus: 'idle',
  registerCodeStatus: 'idle',
  registerConfirmStatus: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // state.role = "POC";
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(sendVerificationCodeAsync.pending, (state) => {
        state.codeStatus = 'loading';
        state.error = null;
      })
      .addCase(sendVerificationCodeAsync.fulfilled, (state) => {
        state.codeStatus = 'succeeded';
      })
      .addCase(sendVerificationCodeAsync.rejected, (state, action) => {
        state.codeStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(loginWithCodeAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginWithCodeAsync.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(loginWithCodeAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(sendForgotPasswordCodeAsync.pending, (state) => {
        state.forgotPasswordCodeStatus = 'loading';
        state.error = null;
      })
      .addCase(sendForgotPasswordCodeAsync.fulfilled, (state) => {
        state.forgotPasswordCodeStatus = 'succeeded';
      })
      .addCase(sendForgotPasswordCodeAsync.rejected, (state, action) => {
        state.forgotPasswordCodeStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(resetPasswordAsync.pending, (state) => {
        state.resetPasswordStatus = 'loading';
        state.error = null;
      })
      .addCase(resetPasswordAsync.fulfilled, (state) => {
        state.resetPasswordStatus = 'succeeded';
      })
      .addCase(resetPasswordAsync.rejected, (state, action) => {
        state.resetPasswordStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(sendRegisterCodeAsync.pending, (state) => {
        state.registerCodeStatus = 'loading';
        state.error = null;
      })
      .addCase(sendRegisterCodeAsync.fulfilled, (state) => {
        state.registerCodeStatus = 'succeeded';
      })
      .addCase(sendRegisterCodeAsync.rejected, (state, action) => {
        state.registerCodeStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(registerConfirmAsync.pending, (state) => {
        state.registerConfirmStatus = 'loading';
        state.error = null;
      })
      .addCase(registerConfirmAsync.fulfilled, (state) => {
        state.registerConfirmStatus = 'succeeded';
        state.status = 'succeeded'; // Logged in
      })
      .addCase(registerConfirmAsync.rejected, (state, action) => {
        state.registerConfirmStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(resendRegisterCodeAsync.pending, (state) => {
        state.registerCodeStatus = 'loading';
        state.error = null;
      })
      .addCase(resendRegisterCodeAsync.fulfilled, (state) => {
        state.registerCodeStatus = 'succeeded';
      })
      .addCase(resendRegisterCodeAsync.rejected, (state, action) => {
        state.registerCodeStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
