import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import { type UnknownAction } from '@reduxjs/toolkit';

import authReducer from './features/authSlice';

function isHydrateAction(action: UnknownAction): action is UnknownAction & {
  type: 'HYDRATE';
  payload: Partial<RootState>;
} {
  return action.type === 'HYDRATE';
}

const combinedReducer = combineReducers({
  auth: authReducer,
});

export const rootReducer = (state: RootState | undefined, action: UnknownAction): RootState => {
  if (isHydrateAction(action)) {
    const payload = action.payload;

    // Ensure state is initialized
    const currentState = state || combinedReducer(undefined, { type: '@@INIT' });
    const nextState = { ...currentState };

    Object.keys(payload).forEach((key) => {
      const k = key as keyof RootState;
      if (payload[k]) {
        // Combine existing slice state with the new hydrated state for this slice
        nextState[k] = {
          ...currentState[k],
          ...(payload[k] as RootState[typeof k]),
        };
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
