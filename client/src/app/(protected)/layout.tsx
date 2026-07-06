import { redirect } from 'next/navigation';

import LayoutShell from '@/components/layout/layout-shell';
import { ReduxHydrator } from '@/redux/provider';
import { type RootState } from '@/redux/store';
import { type User, type Role } from '@/types/user.types';
import { axiosServer } from '@/utils/api/axiosServer';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  let initialState: Partial<RootState> | undefined = undefined;
  try {
    const [res] = await Promise.all([axiosServer.get<{ user: User; role: Role }>('/user/me')]);
    const { user, role } = res.data;

    // Build the initial state for the Redux store
    initialState = {
      user: {
        user: {
          id: user.id,
          name: user.name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatar: `https://i.pravatar.cc/150?u=${user.email || 'default'}`,
        },
        role: role,
        status: 'succeeded',
        error: null,
      },
    };
  } catch {
    // If unauthorized or any error occurs, redirect to login
    redirect('/login');
  }
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <ReduxHydrator initialState={initialState} />
      <LayoutShell>{children}</LayoutShell>
    </div>
  );
}
