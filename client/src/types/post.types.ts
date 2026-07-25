export interface PostMedia {
  type: 'image' | 'video';
  url: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
}

export interface MentionUser {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
}

export interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    badge?: string;
  };
  time: string;
  content: string;
  media?: PostMedia[];
  likes: number;
  commentsCount: number;
  shares: number;
  hasLiked?: boolean;
  isShared?: boolean;
  originalPost?: Post | null;
  mentions?: MentionUser[];
}

export interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  mentions?: MentionUser[];
}
