import reducer, {
  editBoardTitle,
  toggleBoardEdit,
  editSearchBar,
  cancelBoardTitleEdit,
  clearBoardError,
  findBoard,
  deleteBoard,
  saveBoardTitle,
} from '../../store/boardSlice';
import { describe, it, expect } from 'vitest';

describe('boardSlice', () => {
  const initialState = {
    searchBar: '',
    id: '',
    title: '',
    isEditing: false,
    error: '',
  };

  it('should handle editBoardTitle', () => {
    const nextState = reducer(
      initialState,
      editBoardTitle({ newTitle: 'Test' }),
    );
    expect(nextState.title).toBe('Test');
  });

  it('should handle toggleBoardEdit', () => {
    const nextState = reducer(initialState, toggleBoardEdit());
    expect(nextState.isEditing).toBe(true);
  });

  it('should handle editSearchBar', () => {
    const nextState = reducer(initialState, editSearchBar({ text: 'abc' }));
    expect(nextState.searchBar).toBe('abc');
  });

  it('should handle cancelBoardTitleEdit', () => {
    const state = { ...initialState, isEditing: true };
    const nextState = reducer(state, cancelBoardTitleEdit());
    expect(nextState.isEditing).toBe(false);
  });

  it('should handle clearBoardError', () => {
    const state = { ...initialState, error: 'Something' };
    const nextState = reducer(state, clearBoardError());
    expect(nextState.error).toBe('');
  });

  it('should handle findBoard.fulfilled', () => {
    const payload = { id: '1', title: 'Board 1', cards: [] };
    const nextState = reducer(initialState, {
      type: findBoard.fulfilled.type,
      payload,
    });
    expect(nextState.id).toBe('1');
    expect(nextState.title).toBe('Board 1');
    expect(nextState.searchBar).toBe('1');
    expect(nextState.isEditing).toBe(false);
    expect(nextState.error).toBe('');
  });

  it('should handle findBoard.rejected', () => {
    const action = { type: findBoard.rejected.type, payload: 'Error' };
    const nextState = reducer(initialState, action);
    expect(nextState.id).toBe('');
    expect(nextState.title).toBe('');
    expect(nextState.error).toContain('Error');
  });

  it('should handle deleteBoard.fulfilled', () => {
    const state = {
      ...initialState,
      id: '1',
      title: 'Board 1',
      searchBar: '1',
      isEditing: true,
    };
    const nextState = reducer(state, { type: deleteBoard.fulfilled.type });
    expect(nextState.id).toBe('');
    expect(nextState.title).toBe('');
    expect(nextState.searchBar).toBe('');
    expect(nextState.isEditing).toBe(false);
  });

  it('should handle saveBoardTitle.fulfilled', () => {
    const state = { ...initialState, isEditing: true, title: 'Old' };
    const payload = { title: 'New' };
    const nextState = reducer(state, {
      type: saveBoardTitle.fulfilled.type,
      payload,
    });
    expect(nextState.isEditing).toBe(false);
    expect(nextState.title).toBe('New');
  });
});
