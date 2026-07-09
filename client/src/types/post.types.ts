export interface PostMedia {
  type: 'image' | 'video';
  url: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
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
}
