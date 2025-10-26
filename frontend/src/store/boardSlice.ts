import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { BoardState } from '../interfaces';
import { BACKEND_URL } from '../constants';
import { clearCards, fillCards } from './cardsSlice';

export const findBoard = createAsyncThunk(
  'board/find',
  async (boardId: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${BACKEND_URL}/boards/${boardId}`);
      if (!res.ok) throw new Error('Failed to find board');
      const data = await res.json();
      dispatch(fillCards(data.cards));
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const createBoard = createAsyncThunk(
  'board/create',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${BACKEND_URL}/boards`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to create board');
      const data = await res.json();
      await dispatch(findBoard(data.id));
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const deleteBoard = createAsyncThunk(
  'board/delete',
  async (boardId: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${BACKEND_URL}/boards/${boardId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete board');
      await dispatch(clearCards());
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const saveBoardTitle = createAsyncThunk(
  'board/saveTitle',
  async (
    updateBoardTitleDto: { boardId: string; newTitle: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/boards/${updateBoardTitleDto.boardId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updatedTitle: updateBoardTitleDto.newTitle }),
        },
      );
      if (!res.ok) throw new Error('Failed to update board title');
      return await res.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

const initialState: BoardState = {
  searchBar: '',
  id: '',
  title: '',
  isEditing: false,
  error: '',
};

const boardSlice = createSlice({
  name: 'Board',
  initialState,
  reducers: {
    editBoardTitle: (state, action: PayloadAction<{ newTitle: string }>) => {
      state.title = action.payload.newTitle;
    },
    editSearchBar: (state, action: PayloadAction<{ text: string }>) => {
      state.searchBar = action.payload.text;
    },
    toggleBoardEdit: (state) => {
      state.isEditing = !state.isEditing;
    },
    cancelBoardTitleEdit: (state) => {
      state.isEditing = false;
    },
    clearBoardError: (state) => {
      state.error = '';
    },
  },
  extraReducers: (builder) => {
    builder.addCase(findBoard.fulfilled, (state, action) => {
      const foundBoardData = action.payload;
      state.id = foundBoardData.id;
      state.title = foundBoardData.title;
      state.searchBar = foundBoardData.id;
      state.isEditing = false;
      state.error = '';
    });
    builder.addCase(findBoard.rejected, (state, action) => {
      state.id = '';
      state.title = '';
      state.error = `Board not found, error: ${action.payload as string}`;
    });
    builder.addCase(deleteBoard.fulfilled, (state) => {
      state.id = '';
      state.title = '';
      state.searchBar = '';
      state.isEditing = false;
    });

    builder.addCase(saveBoardTitle.fulfilled, (state, action) => {
      const data = action.payload;
      state.isEditing = false;
      state.title = data.title;
    });
  },
});

export const {
  editBoardTitle,
  toggleBoardEdit,
  cancelBoardTitleEdit,
  editSearchBar,
  clearBoardError,
} = boardSlice.actions;
export default boardSlice.reducer;
