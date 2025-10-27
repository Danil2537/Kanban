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
        searchBar: 'ed954f29-74d8-48e6-bc27-96b5755f2e0e',
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

  it('renders board title, search bar, copy button, and columns', () => {
    render(
      <Provider store={store}>
        <Board />
      </Provider>,
    );

    expect(screen.getByText('Kanban Boards')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('ed954f29-74d8-48e6-bc27-96b5755f2e0e'),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('My Board')).toBeInTheDocument();
    expect(screen.getByText('TODO')).toBeInTheDocument();
    // Check that the copy button exists
    expect(
      screen.getByRole('button', { name: /content_copy/i }),
    ).toBeInTheDocument();
  });

  it('dispatches editSearchBar and clears board error when typing', () => {
    render(
      <Provider store={store}>
        <Board />
      </Provider>,
    );

    const input = screen.getByPlaceholderText(
      'ed954f29-74d8-48e6-bc27-96b5755f2e0e',
    );
    fireEvent.change(input, { target: { value: 'abc123' } });

    expect(store.getState().boards.searchBar).toBe('abc123');
  });

  it('dispatches findBoard when Load button is clicked', async () => {
    render(
      <Provider store={store}>
        <Board />
      </Provider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Load'));
    });

    expect(store.getState().boards.id).toBe('board1');
  });

  it('copies search bar contents when copy button is clicked', async () => {
    render(
      <Provider store={store}>
        <Board />
      </Provider>,
    );

    const copyButton = screen.getByRole('button', { name: /content_copy/i });

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn() },
    });

    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      store.getState().boards.searchBar,
    );
    // The icon should now show 'done_outline'
    expect(copyButton.textContent).toBe('done_outline');
  });

  it('dispatches toggleBoardEdit and saveBoardTitle when editing title', async () => {
    store = setupStore({
      boards: {
        searchBar: 'ed954f29-74d8-48e6-bc27-96b5755f2e0e',
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
