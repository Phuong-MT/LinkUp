'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  sendRegisterCodeAsync,
  registerConfirmAsync,
  resendRegisterCodeAsync,
} from '@/redux/features/authThunks';
import { type AppDispatch, type RootState } from '@/redux/store';

export function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { registerCodeStatus, registerConfirmStatus, error } = useSelector(
    (state: RootState) => state.auth,
  );

  const validateStep1 = () => {
    setValidationError('');
    if (!username.trim() || username.length < 3) {
      setValidationError('Username must be at least 3 characters long');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{7,}$/;
    if (!passwordRegex.test(password)) {
      setValidationError(
        'Password must be greater than 6 characters and contain both letters and numbers',
      );
      return false;
    }
    return true;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    const resultAction = await dispatch(sendRegisterCodeAsync({ username, email, password }));
    if (sendRegisterCodeAsync.fulfilled.match(resultAction)) {
      setStep(2);
    }
  };

  const handleRegisterConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (code.length !== 6) {
      setValidationError('Verification code must be 6 digits');
      return;
    }

    const resultAction = await dispatch(registerConfirmAsync({ email, code }));
    if (registerConfirmAsync.fulfilled.match(resultAction)) {
      router.push('/dashboard');
    }
  };

  const handleResendCode = async () => {
    setValidationError('');
    setSuccessMessage('');
    const resultAction = await dispatch(resendRegisterCodeAsync({ email }));
    if (resendRegisterCodeAsync.fulfilled.match(resultAction)) {
      setSuccessMessage('Verification code resent successfully!');
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-800">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Create a new account
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {step === 1 ? 'Enter your details to get started.' : 'Enter the code sent to your email.'}
        </p>
      </div>

      {step === 1 ? (
        <form className="space-y-6" onSubmit={handleSendCode}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="dark:text-gray-300">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={registerCodeStatus === 'loading'}
                required
                className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={registerCodeStatus === 'loading'}
                required
                className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={registerCodeStatus === 'loading'}
                required
                className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-gray-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Password must be greater than 6 characters and contain both letters and numbers.
              </p>
            </div>
          </div>

          {(validationError || error) && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 text-sm p-3 rounded-md">
              {validationError || error}
            </div>
          )}

          <button
            type="submit"
            disabled={registerCodeStatus === 'loading'}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {registerCodeStatus === 'loading' ? 'Sending Code...' : 'Send Verification Code'}
          </button>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={handleRegisterConfirm}>
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm p-3 rounded-md text-center">
              {successMessage}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="dark:text-gray-300">
                Verification Code
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="code"
                  type="text"
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={registerConfirmStatus === 'loading'}
                  required
                  maxLength={6}
                  className="flex-1 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={registerCodeStatus === 'loading' || registerConfirmStatus === 'loading'}
                  className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {registerCodeStatus === 'loading' ? 'Resending...' : 'Resend Code'}
                </button>
              </div>
            </div>
          </div>

          {(validationError || error) && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 text-sm p-3 rounded-md">
              {validationError || error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-zinc-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={registerConfirmStatus === 'loading'}
              className="flex-1 flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {registerConfirmStatus === 'loading' ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      )}

      <div className="text-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Sign in
          </Link>
        </span>
      </div>
    </div>
  );
}
