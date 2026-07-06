'use client';

import { Search, Settings } from 'lucide-react';
import React from 'react';

export default function RightSidebar() {
  const onlineContacts = [
    {
      id: '1',
      name: 'Sarah Connor',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    },
    {
      id: '2',
      name: 'Alex Mercer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    },
    {
      id: '3',
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    },
    {
      id: '4',
      name: 'David Miller',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    },
    {
      id: '5',
      name: 'Emma Watson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    },
    {
      id: '6',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    },
  ];

  return (
    <aside className="h-full w-72 p-3 overflow-y-auto no-scrollbar hidden lg:block border-l border-zinc-250/20 shrink-0">
      <div className="flex flex-col gap-4">
        {/* Sponsored Section */}
        <div>
          <h3 className="px-2 pb-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Sponsored
          </h3>
          <div className="flex flex-col gap-2.5">
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200"
                alt="Sponsor 1"
                className="h-16 w-24 rounded-lg object-cover shadow-xs shrink-0"
              />
              <div>
                <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-250 truncate">
                  Design Masterclass 2026
                </span>
                <span className="block text-[10px] text-zinc-400 mt-0.5">designinstitute.org</span>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <img
                src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200"
                alt="Sponsor 2"
                className="h-16 w-24 rounded-lg object-cover shadow-xs shrink-0"
              />
              <div>
                <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-250 truncate">
                  Upgrade to SuperMac Pro
                </span>
                <span className="block text-[10px] text-zinc-400 mt-0.5">apple.com</span>
              </div>
            </a>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800" />

        {/* Contacts Section */}
        <div>
          <div className="flex items-center justify-between px-2 pb-2">
            <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Contacts
            </h3>
            <div className="flex gap-2">
              <button className="text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors cursor-pointer animate-pulse">
                <Search className="h-4.5 w-4.5" />
              </button>
              <button className="text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors cursor-pointer">
                <Settings className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Contact List */}
          <div className="flex flex-col gap-1">
            {onlineContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
                </div>
                <span className="text-xs font-semibold">{contact.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
