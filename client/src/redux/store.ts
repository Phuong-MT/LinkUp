import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import { type UnknownAction } from '@reduxjs/toolkit';

import authReducer from './features/authSlice';
import postReducer from './features/postSlice';
import userReducer from './features/userSlice';

function isHydrateAction(action: UnknownAction): action is UnknownAction & {
  type: 'HYDRATE';
  payload: Partial<RootState>;
} {
  return action.type === 'HYDRATE';
}

const combinedReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  post: postReducer,
});

export const rootReducer = (state: RootState | undefined, action: UnknownAction): RootState => {
  if (isHydrateAction(action)) {
    const payload = action.payload;

    // Ensure state is initialized
    const currentState = state || combinedReducer(undefined, { type: '@@INIT' });
    const nextState = { ...currentState };

    const mergeStateSlice = <K extends keyof RootState>(
      slice: K,
      partial: Partial<RootState[K]>,
    ) => {
      nextState[slice] = {
        ...(currentState[slice] as Record<string, unknown>),
        ...partial,
      } as RootState[K];
    };

    Object.keys(payload).forEach((key) => {
      const k = key as keyof RootState;
      if (payload[k]) {
        mergeStateSlice(k, payload[k] as Partial<RootState[typeof k]>);
      }
    });

    return nextState;
  }

  return combinedReducer(state, action);
};

export const Store = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer as typeof combinedReducer,
    preloadedState,
  });

export type RootState = ReturnType<typeof combinedReducer>;
export type AppDispatch = ReturnType<typeof Store>['dispatch'];
