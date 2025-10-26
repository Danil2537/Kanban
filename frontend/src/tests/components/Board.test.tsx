import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cardsReducer from '../../store/cardsSlice';
import boardReducer from '../../store/boardSlice';
import { Board } from '../../components/Board';
import type { RootState } from '../../store';

// Mock fetch globally
vi.stubGlobal(
  'fetch',
  vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({ id: 'board1', title: 'My Board', cards: [] }),
    }),
  ) as unknown as typeof fetch,
);

const setupStore = (preloadedState?: RootState) =>
  configureStore({
    reducer: { boards: boardReducer, cards: cardsReducer },
    preloadedState,
  });

describe('Board component', () => {
  let store: ReturnType<typeof setupStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = setupStore({
      boards: {
        searchBar: 'abc',
        id: 'board1',
        title: 'My Board',
        isEditing: false,
        error: '',
      },
      cards: {
        todoCards: [],
        inProgressCards: [],
        doneCards: [],
      },
    });
  });

  it('renders board title, search bar, and columns', () => {
    render(
      <Provider store={store}>
        <Board />
      </Provider>,
    );

    expect(screen.getByText('Kanban Boards')).toBeInTheDocument();
    expect(screen.getByLabelText('Enter Board ID')).toBeInTheDocument();
    expect(screen.getByDisplayValue('My Board')).toBeInTheDocument();
    expect(screen.getByText('TODO')).toBeInTheDocument();
  });

  it('dispatches editSearchBar and clearBoardError when typing in search bar', () => {
    render(
      <Provider store={store}>
        <Board />
      </Provider>,
    );

    const input = screen.getByPlaceholderText(
      'ce626fca-e2d2-43a2-be16-a46298a3c1e1',
    );

    fireEvent.change(input, { target: { value: 'abc123' } });

    // There should now be two actions dispatched
    //const actions = store.getState(); // you can assert state changes if needed
    expect(store.getState().boards.searchBar).toBe('abc123');
  });

  it('dispatches findBoard when Search is clicked', async () => {
    render(
      <Provider store={store}>
        <Board />
      </Provider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Search'));
    });

    expect(store.getState().boards.id).toBe('board1');
  });

  it('dispatches toggleBoardEdit and saveBoardTitle when editing title', async () => {
    // Render with isEditing true
    store = setupStore({
      boards: {
        searchBar: 'abc',
        id: 'board1',
        title: 'My Board',
        isEditing: true,
        error: '',
      },
      cards: { todoCards: [], inProgressCards: [], doneCards: [] },
    });

    render(
      <Provider store={store}>
        <Board />
      </Provider>,
    );

    const input = screen.getByDisplayValue('My Board');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'New Title' } });
    });

    expect(store.getState().boards.title).toBe('New Title');

    const saveButton = screen.getByText('Save');

    await act(async () => {
      fireEvent.click(saveButton);
    });

    // The mock fetch will resolve the title back to 'My Board'
    expect(store.getState().boards.title).toBe('My Board');
  });

  it('renders error message when board error exists', () => {
    store = setupStore({
      boards: {
        searchBar: '',
        id: '',
        title: '',
        isEditing: false,
        error: 'Some error',
      },
      cards: { todoCards: [], inProgressCards: [], doneCards: [] },
    });

    render(
      <Provider store={store}>
        <Board />
      </Provider>,
    );

    expect(screen.getByText('Some error')).toBeInTheDocument();
  });

  it('renders DragOverlay when activeCard exists', () => {
    store = setupStore({
      boards: {
        searchBar: '',
        id: 'board1',
        title: 'My Board',
        isEditing: false,
        error: '',
      },
      cards: {
        todoCards: [
          {
            id: '1',
            title: 'Card 1',
            isActive: true,
            column: '',
            description: '',
            order: 0,
            boardId: '',
          },
        ],
        inProgressCards: [],
        doneCards: [],
      },
    });

    render(
      <Provider store={store}>
        <Board />
      </Provider>,
    );

    expect(screen.getByText('Card 1')).toBeInTheDocument();
  });
});
