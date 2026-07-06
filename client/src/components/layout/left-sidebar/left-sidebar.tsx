'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Users2,
  Group,
  Tv,
  Store,
  Bookmark,
  History,
  Calendar,
  FileText,
  Heart,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { type RootState } from '@/redux/store';

interface LeftSidebarProps {
  showLeftSidebar: boolean;
  onClose: () => void;
}

export default function LeftSidebar({ showLeftSidebar, onClose }: LeftSidebarProps) {
  const { user } = useSelector((state: RootState) => state.user);
  const [showAllShortcuts, setShowAllShortcuts] = useState(false);

  const sidebarLinks = [
    { name: 'Find Friends', icon: Users2, color: 'text-blue-500' },
    { name: 'Groups', icon: Group, color: 'text-teal-500' },
    { name: 'Video', icon: Tv, color: 'text-red-500' },
    { name: 'Marketplace', icon: Store, color: 'text-sky-500' },
    { name: 'Saved', icon: Bookmark, color: 'text-purple-500' },
    { name: 'Memories', icon: History, color: 'text-amber-500' },
    { name: 'Events', icon: Calendar, color: 'text-rose-500' },
    { name: 'Feeds', icon: FileText, color: 'text-cyan-500' },
    { name: 'Fundraisers', icon: Heart, color: 'text-pink-500' },
  ];

  const visibleLinks = showAllShortcuts ? sidebarLinks : sidebarLinks.slice(0, 5);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showLeftSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          fixed bottom-0 top-14 left-0 z-35 w-64 border-r border-zinc-200/80 bg-white p-3 shadow-lg transition-transform duration-300 ease-in-out md:sticky md:top-0 md:z-0 md:bg-transparent md:border-0 md:shadow-none h-full shrink-0
          ${showLeftSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col gap-1.5 h-full overflow-y-auto no-scrollbar pr-1">
          {/* User Profile shortcut */}
          <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 cursor-pointer">
            <img
              src={user?.avatar || 'https://i.pravatar.cc/150'}
              alt="My Profile"
              className="h-9 w-9 rounded-full object-cover border border-zinc-100 dark:border-zinc-800"
            />
            <span className="font-semibold text-sm truncate">{user?.name || 'User'}</span>
          </div>

          {/* List links */}
          {visibleLinks.map((link, idx) => (
            <button
              key={idx}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer text-zinc-750 dark:text-zinc-300"
            >
              <link.icon className={`h-5.5 w-5.5 ${link.color}`} />
              <span>{link.name}</span>
            </button>
          ))}

          {/* Show more/less toggle button */}
          <button
            onClick={() => setShowAllShortcuts(!showAllShortcuts)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer text-zinc-500"
          >
            <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-zinc-200 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400">
              {showAllShortcuts ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
            <span>{showAllShortcuts ? 'Show less' : 'See more'}</span>
          </button>

          {/* Divider */}
          <div className="my-3 border-t border-zinc-200 dark:border-zinc-800" />

          {/* Quick shortcuts header */}
          <div className="px-3 pb-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Your shortcuts
          </div>
          {[
            {
              name: 'LinkUp Developers',
              img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100',
            },
            {
              name: 'React Community',
              img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100',
            },
          ].map((shortcut, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 cursor-pointer"
            >
              <img
                src={shortcut.img}
                alt={shortcut.name}
                className="h-9 w-9 rounded-lg object-cover"
              />
              <span className="text-sm font-medium truncate">{shortcut.name}</span>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
