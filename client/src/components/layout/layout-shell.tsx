'use client';

import { Home, Tv, Group, MessageCircle, Bell } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';

import Header from './header/header';
import LeftSidebar from './left-sidebar/left-sidebar';
import RightSidebar from './right-sidebar/right-sidebar';

interface LayoutShellProps {
  children: React.ReactNode;
}

const mapNavigation = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/watch', icon: Tv, label: 'Watch' },
  { href: '/groups', icon: Group, label: 'Groups' },
  { href: '/messages', icon: MessageCircle, label: 'Chat' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function LayoutShell({ children }: LayoutShellProps) {
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="h-full w-full bg-zinc-100 font-sans text-zinc-900 transition-colors duration-200 dark:bg-black dark:text-zinc-100 flex flex-col overflow-hidden">
      {/* 1. Header (Navbar) */}
      <Header onToggleLeftSidebar={() => setShowLeftSidebar(!showLeftSidebar)} />

      {/* Main Core Layout Grid */}
      <div className="flex flex-1 w-full relative overflow-hidden">
        {/* 2. Left Sidebar (Navigation Panel) */}
        <LeftSidebar showLeftSidebar={showLeftSidebar} onClose={() => setShowLeftSidebar(false)} />

        {/* 3. Center Section: Main children page */}
        <main className="flex-1 min-w-0 bg-transparent flex justify-center h-full overflow-y-auto no-scrollbar">
          {children}
        </main>

        {/* 4. Right Sidebar (Contacts & Sponsored) */}
        <RightSidebar />
      </div>

      {/* 5. Mobile Bottom Navbar */}
      <footer className="sticky bottom-0 z-40 border-t border-zinc-200/80 bg-white/95 px-4 py-1.5 shadow-md md:hidden dark:border-zinc-800/80 dark:bg-zinc-900/95">
        <div className="flex items-center justify-around">
          {mapNavigation.map((tab, index) => {
            const isActive = pathname === tab.href;
            return (
              <button
                key={index}
                onClick={() => router.push(tab.href)}
                className={`flex flex-col items-center justify-center p-1 text-zinc-500 dark:text-zinc-400 cursor-pointer ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
}
