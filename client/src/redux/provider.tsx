'use client';

import { useEffect, useState } from 'react';
import { Provider, useStore } from 'react-redux';

import { type RootState, Store } from '@/redux/store';

type AppStore = ReturnType<typeof Store>;

export function ReduxProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: Partial<RootState>;
}) {
  const [store] = useState<AppStore>(() => Store(initialState));

  useEffect(() => {
    if (initialState) {
      store.dispatch({
        type: 'HYDRATE',
        payload: initialState,
      });
    }
  }, [initialState, store]);

  return <Provider store={store}>{children}</Provider>;
}

export function ReduxHydrator({ initialState }: { initialState?: Partial<RootState> }) {
  const store = useStore();

  useEffect(() => {
    if (initialState) {
      store.dispatch({ type: 'HYDRATE', payload: initialState });
    }
  }, [store, initialState]);

  return null;
}
