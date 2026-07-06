'use client';

import { motion } from 'framer-motion';
import { Moon, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { logout } from '@/redux/features/authSlice';
import { clearUser } from '@/redux/features/userSlice';
import { type RootState } from '@/redux/store';
import apiClient from '@/utils/api/axios';

export default function ProfileDropdown() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const dispatch = useDispatch();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const toggleDarkMode = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      dispatch(logout());
      dispatch(clearUser());
      router.push('/login');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-855 dark:bg-zinc-900 z-50"
    >
      <div className="mb-2 flex items-center gap-3 rounded-lg p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">
        <img
          src={user?.avatar || 'https://i.pravatar.cc/150'}
          alt={user?.name || 'User'}
          className="h-12 w-12 rounded-full object-cover border border-zinc-100 dark:border-zinc-800"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm truncate">{user?.name || 'User'}</h4>
          <p className="text-xs text-zinc-500 truncate">{user?.email || ''}</p>
        </div>
      </div>

      <div className="border-t border-zinc-100 my-1 dark:border-zinc-800" />

      {/* Dark Mode toggle */}
      <button
        onClick={toggleDarkMode}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-300">
          <Moon className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1">
          <span className="block">Dark Mode</span>
          <span className="text-[10px] text-zinc-500 font-normal">Toggle theme</span>
        </div>
        <div
          className={`h-5 w-9 rounded-full p-0.5 transition-colors duration-250 cursor-pointer ${isDark ? 'bg-blue-600' : 'bg-zinc-300'}`}
        >
          <div
            className={`h-4 w-4 rounded-full bg-white shadow-xs transition-transform duration-250 ${isDark ? 'translate-x-4' : 'translate-x-0'}`}
          />
        </div>
      </button>

      {/* Settings */}
      <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-300">
          <Settings className="h-4.5 w-4.5" />
        </div>
        <div>
          <span className="block">Settings & Privacy</span>
          <span className="text-[10px] text-zinc-500 font-normal">Manage account settings</span>
        </div>
      </button>

      {/* Help */}
      <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-300">
          <HelpCircle className="h-4.5 w-4.5" />
        </div>
        <div>
          <span className="block">Help & Support</span>
          <span className="text-[10px] text-zinc-500 font-normal">FAQ and guide center</span>
        </div>
      </button>

      <div className="border-t border-zinc-100 my-1 dark:border-zinc-800" />

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 cursor-pointer transition-colors"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
          <LogOut className="h-4.5 w-4.5" />
        </div>
        <span>Log Out</span>
      </button>
    </motion.div>
  );
}
