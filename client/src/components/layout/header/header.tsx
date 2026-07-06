'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Home,
  Tv,
  Store,
  Group,
  Compass,
  Plus,
  MessageCircle,
  Bell,
  Menu,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { type RootState } from '@/redux/store';

import MessagesDropdown from './messages-dropdown';
import NotificationsDropdown from './notifications-dropdown';
import ProfileDropdown from './profile-dropdown';

interface HeaderProps {
  onToggleLeftSidebar: () => void;
}

export default function Header({ onToggleLeftSidebar }: HeaderProps) {
  const { user } = useSelector((state: RootState) => state.user);
  const pathname = usePathname();
  const router = useRouter();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="relative z-40 flex h-14 w-full items-center justify-between border-b border-zinc-200/80 bg-white/95 px-4 py-2 shadow-xs backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/95 shrink-0">
      {/* Left Side: Logo & Search */}
      <div className="flex items-center gap-2 flex-1 md:flex-initial">
        <div
          onClick={() => router.push('/')}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white font-black text-2xl tracking-tighter shadow-md hover:bg-blue-700 transition-colors"
        >
          L
        </div>
        <div className="relative hidden sm:block">
          <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search LinkUp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-60 rounded-full bg-zinc-100 pl-10 pr-4 text-sm text-zinc-800 outline-hidden border border-transparent focus:border-blue-500 focus:bg-white transition-all dark:bg-zinc-800 dark:text-zinc-100 dark:focus:bg-zinc-850"
          />
        </div>
        <button className="flex h-10 w-10 sm:hidden items-center justify-center rounded-full bg-zinc-100 text-zinc-655 hover:bg-zinc-200 transition-colors dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
          <Search className="h-5 w-5" />
        </button>
      </div>

      {/* Center Side: Navigation Tabs */}
      <nav className="hidden md:flex h-full items-center justify-center gap-1 max-w-xl flex-1 px-8">
        {[
          { href: '/', icon: Home, label: 'Home' },
          { href: '/watch', icon: Tv, label: 'Watch' },
          { href: '/marketplace', icon: Store, label: 'Marketplace' },
          { href: '/groups', icon: Group, label: 'Groups' },
          { href: '/explore', icon: Compass, label: 'Explore' },
        ].map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={`relative flex h-full flex-1 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100/80 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800/60 cursor-pointer ${
                isActive ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
              title={tab.label}
            >
              <tab.icon className="h-6 w-6" />
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-500 rounded-t-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Side: Actions & Profile */}
      <div className="flex items-center gap-2">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-850 hover:bg-zinc-200 transition-colors dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 cursor-pointer">
          <Plus className="h-5 w-5" />
        </button>

        {/* Messages Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMessages(!showMessages);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer ${
              showMessages
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-zinc-100 text-zinc-850 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>

          <AnimatePresence>{showMessages && <MessagesDropdown />}</AnimatePresence>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowMessages(false);
              setShowProfileMenu(false);
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer ${
              showNotifications
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-zinc-100 text-zinc-850 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              5
            </span>
          </button>

          <AnimatePresence>{showNotifications && <NotificationsDropdown />}</AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
              setShowMessages(false);
            }}
            className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-full border border-zinc-200 hover:opacity-90 transition-opacity dark:border-zinc-800 cursor-pointer"
          >
            <img
              src={user?.avatar || 'https://i.pravatar.cc/150'}
              alt="My Profile"
              className="h-full w-full object-cover"
            />
          </button>

          <AnimatePresence>{showProfileMenu && <ProfileDropdown />}</AnimatePresence>
        </div>

        {/* Mobile Sidebar Toggle */}
        <button
          onClick={onToggleLeftSidebar}
          className="flex h-10 w-10 md:hidden items-center justify-center rounded-full bg-zinc-100 text-zinc-850 hover:bg-zinc-200 transition-colors dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
