import { Video, Image as ImageIcon, Smile } from 'lucide-react';
import React from 'react';

interface CreatePostTriggerProps {
  user: {
    name: string;
    avatar: string;
  } | null;
  onClickTrigger: (uploadType: 'image' | 'video' | null) => void;
}

export const CreatePostTrigger: React.FC<CreatePostTriggerProps> = ({ user, onClickTrigger }) => {
  return (
    <div className="mb-5 rounded-xl bg-white p-4 shadow-xs border border-zinc-200/50 dark:bg-zinc-900 dark:border-zinc-800/50">
      <div className="flex gap-2 items-center">
        <img
          src={user?.avatar || 'https://i.pravatar.cc/150'}
          alt="My Profile"
          className="h-10 w-10 rounded-full object-cover border border-zinc-100 dark:border-zinc-800"
        />
        <button
          onClick={() => onClickTrigger(null)}
          className="flex-1 rounded-full bg-zinc-100 px-4 py-2.5 text-left text-sm text-zinc-500 hover:bg-zinc-200/80 transition-colors dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/80 cursor-pointer"
        >
          What&apos;s on your mind, {user?.name?.split(' ')[0] || 'User'}?
        </button>
      </div>

      <div className="mt-3 border-t border-zinc-105 dark:border-zinc-800 pt-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-zinc-650 dark:text-zinc-400">
        <button
          onClick={() => onClickTrigger('video')}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors"
        >
          <Video className="h-5 w-5 text-rose-500" />
          <span>Live video</span>
        </button>

        <button
          onClick={() => onClickTrigger('image')}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors"
        >
          <ImageIcon className="h-5 w-5 text-emerald-500" />
          <span>Photo/video</span>
        </button>

        <button
          onClick={() => onClickTrigger(null)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors"
        >
          <Smile className="h-5 w-5 text-amber-500" />
          <span>Feeling/activity</span>
        </button>
      </div>
    </div>
  );
};
export default CreatePostTrigger;
