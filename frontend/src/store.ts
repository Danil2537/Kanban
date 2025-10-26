import { configureStore } from '@reduxjs/toolkit';
import cardsReducer from './store/cardsSlice';
import boardReducer from './store/boardSlice';

export const store = configureStore({
  reducer: {
    cards: cardsReducer,
    boards: boardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
