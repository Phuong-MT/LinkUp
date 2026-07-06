'use client';

import { motion } from 'framer-motion';
import { Bell, Heart } from 'lucide-react';
import React from 'react';

export default function NotificationsDropdown() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-850 dark:bg-zinc-900 z-50"
    >
      <div className="border-b border-zinc-100 p-4 dark:border-zinc-800 flex justify-between items-center">
        <h3 className="font-bold text-lg">Notifications</h3>
        <button className="text-sm text-blue-600 hover:underline">Mark all read</button>
      </div>
      <div className="max-h-96 overflow-y-auto py-1">
        {[
          {
            title: 'Sarah Connor reacted to your post',
            detail: 'Sarah gave a Like to your design post.',
            time: '2m',
            unread: true,
          },
          {
            title: 'Alex Mercer liked your comment',
            detail: '"Early morning coffee run" comment was liked.',
            time: '1h',
            unread: false,
          },
          {
            title: 'New member in Design Group',
            detail: 'Anna Miller just joined LinkUp Developers group.',
            time: '3h',
            unread: true,
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-white shrink-0 ${idx % 2 === 0 ? 'bg-blue-600' : 'bg-rose-500'}`}
            >
              {idx % 2 === 0 ? (
                <Heart className="h-5 w-5 fill-current" />
              ) : (
                <Bell className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span
                className={`block text-sm leading-tight ${item.unread ? 'font-bold text-zinc-900 dark:text-white' : 'text-zinc-800 dark:text-zinc-350'}`}
              >
                {item.title}
              </span>
              <span className="block text-xs text-zinc-500 truncate mt-0.5">{item.detail}</span>
              <span className="block text-[10px] text-zinc-400 mt-1">{item.time}</span>
            </div>
            {item.unread && (
              <div className="self-center h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
