export type User = {
  id: string;
  name: string;
  email: string;
};

export type Role = 'USER' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
