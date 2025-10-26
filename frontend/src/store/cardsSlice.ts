import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { Card, CardState } from '../interfaces';
import { BACKEND_URL } from '../constants';

export const deleteCard = createAsyncThunk(
  'cards/deleteCard',
  async (cardId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BACKEND_URL}/cards/${cardId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete card');
      return cardId; // the reducer will use this value
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const saveCard = createAsyncThunk(
  'cards/saveCard',
  async (card: Card, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BACKEND_URL}/cards/updateContent/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: card.title,
          description: card.description,
        }),
      });
      if (!res.ok) throw new Error('Failed to save card');
      return card;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const createCard = createAsyncThunk(
  'cards/createCard',
  async (boardId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BACKEND_URL}/cards/${boardId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to create card');
      return await res.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

const initialState: CardState = {
  todoCards: [],
  inProgressCards: [],
  doneCards: [],
};

const cardsSlice = createSlice({
  name: 'Cards',
  initialState,
  reducers: {
    toggleCardEdit: (state, action: PayloadAction<Card>) => {
      const card = action.payload;

      const columnArray =
        card.column === 'TODO'
          ? state.todoCards
          : card.column === 'IN_PROGRESS'
            ? state.inProgressCards
            : state.doneCards;

      const target = columnArray.find((c) => c.id === card.id);
      if (target) {
        target.isEditing = !target.isEditing;
      }
    },
    editCardField: (
      state,
      action: PayloadAction<{
        card: Card;
        field: 'title' | 'description';
        value: string;
      }>,
    ) => {
      const card = action.payload.card;

      const columnArray =
        card.column === 'TODO'
          ? state.todoCards
          : card.column === 'IN_PROGRESS'
            ? state.inProgressCards
            : state.doneCards;

      const target = columnArray.find((c) => c.id === card.id);
      if (target) {
        target[action.payload.field] = action.payload.value;
      }
    },
    fillCards: (state, action: PayloadAction<Card[]>) => {
      const cards = action.payload;
      cards.forEach((c) => {
        if (c.column === 'TODO') {
          state.todoCards.push(c);
        } else if (c.column === 'IN_PROGRESS') {
          state.inProgressCards.push(c);
        } else {
          state.doneCards.push(c);
        }
      });
    },
    clearCards: (state) => {
      state.todoCards = [];
      state.inProgressCards = [];
      state.doneCards = [];
    },
    moveCardWithinColumn: (
      state,
      action: PayloadAction<{
        column: 'TODO' | 'IN_PROGRESS' | 'DONE';
        oldIndex: number;
        newIndex: number;
      }>,
    ) => {
      const { column, oldIndex, newIndex } = action.payload;
      const columnArray =
        column === 'TODO'
          ? state.todoCards
          : column === 'IN_PROGRESS'
            ? state.inProgressCards
            : state.doneCards;

      const [moved] = columnArray.splice(oldIndex, 1);
      columnArray.splice(newIndex, 0, moved);
    },

    moveCardBetweenColumns: (
      state,
      action: PayloadAction<{
        from: 'TODO' | 'IN_PROGRESS' | 'DONE';
        to: 'TODO' | 'IN_PROGRESS' | 'DONE';
        card: Card;
      }>,
    ) => {
      const { from, to, card } = action.payload;

      const sourceArray =
        from === 'TODO'
          ? state.todoCards
          : from === 'IN_PROGRESS'
            ? state.inProgressCards
            : state.doneCards;

      const targetArray =
        to === 'TODO'
          ? state.todoCards
          : to === 'IN_PROGRESS'
            ? state.inProgressCards
            : state.doneCards;

      const index = sourceArray.findIndex((c) => c.id === card.id);
      if (index !== -1) sourceArray.splice(index, 1);

      targetArray.push({ ...card, column: to });
    },
    setActiveCard: (state, action: PayloadAction<string>) => {
      const allCards = [
        ...state.todoCards,
        ...state.inProgressCards,
        ...state.doneCards,
      ];
      allCards.forEach((c) => (c.isActive = c.id === action.payload));
    },

    clearActiveCard: (state) => {
      const allCards = [
        ...state.todoCards,
        ...state.inProgressCards,
        ...state.doneCards,
      ];
      allCards.forEach((c) => (c.isActive = false));
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deleteCard.fulfilled, (state, action) => {
      const cardId = action.payload;
      state.todoCards = state.todoCards.filter((c) => c.id !== cardId);
      state.inProgressCards = state.inProgressCards.filter(
        (c) => c.id !== cardId,
      );
      state.doneCards = state.doneCards.filter((c) => c.id !== cardId);
    });
    builder.addCase(saveCard.fulfilled, (state, action) => {
      const card = action.payload;
      const columnArray =
        card.column === 'TODO'
          ? state.todoCards
          : card.column === 'IN_PROGRESS'
            ? state.inProgressCards
            : state.doneCards;

      const target = columnArray.find((c) => c.id === card.id);
      if (target) {
        target.isEditing = false;
      }
    });
    builder.addCase(createCard.fulfilled, (state, action) => {
      const card = action.payload;
      state.todoCards.push(card);
    });
  },
});

export const {
  toggleCardEdit,
  editCardField,
  fillCards,
  clearCards,
  moveCardWithinColumn,
  moveCardBetweenColumns,
  setActiveCard,
  clearActiveCard,
} = cardsSlice.actions;
export default cardsSlice.reducer;
