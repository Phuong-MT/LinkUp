'use client';

import { motion } from 'framer-motion';
import React from 'react';

export default function MessagesDropdown() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-850 dark:bg-zinc-900 z-50"
    >
      <div className="border-b border-zinc-100 p-4 dark:border-zinc-800 flex justify-between items-center">
        <h3 className="font-bold text-lg">Chats</h3>
        <button className="text-sm text-blue-600 hover:underline">Mark all read</button>
      </div>
      <div className="max-h-96 overflow-y-auto py-1">
        {[
          {
            name: 'Sarah Connor',
            msg: 'The design system looks great! 👍',
            time: '10m',
            unread: true,
          },
          { name: 'Alex Mercer', msg: 'Are you joining the meeting?', time: '1h', unread: false },
          { name: 'Elena Rostova', msg: 'Perfect, thank you!', time: '2h', unread: false },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-zinc-200 overflow-hidden shrink-0">
              <img
                src={`https://i.pravatar.cc/100?u=${item.name}`}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="font-semibold text-sm truncate">{item.name}</span>
                <span className="text-xs text-zinc-500">{item.time}</span>
              </div>
              <p
                className={`text-xs truncate ${item.unread ? 'font-bold text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
              >
                {item.msg}
              </p>
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
