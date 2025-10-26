import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import cardsReducer from '../../store/cardsSlice';
import CardItem from '../../components/Card';
import type { Card } from '../../interfaces';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import type { RootState } from '../../store';

// --- Mocks ---
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
  }),
}));

const mockDispatch = vi.fn();
vi.mock('react-redux', async () => {
  const actual = await vi.importActual<RootState>('react-redux');
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

describe('CardItem', () => {
  const baseCard: Card = {
    id: '1',
    title: 'Test Card',
    description: 'Test Description',
    order: 1,
    column: 'TODO',
    boardId: 'b1',
    isEditing: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderCard = (card: Card) => {
    const store = configureStore({
      reducer: { cards: cardsReducer },
      preloadedState: {
        cards: {
          todoCards: card.column === 'TODO' ? [card] : [],
          inProgressCards: card.column === 'IN_PROGRESS' ? [card] : [],
          doneCards: card.column === 'DONE' ? [card] : [],
        },
      },
    });

    return render(
      <Provider store={store}>
        <CardItem card={card} />
      </Provider>,
    );
  };

  it('renders title and description in view mode', () => {
    renderCard(baseCard);

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('dispatches toggleCardEdit when Edit is clicked', () => {
    renderCard(baseCard);

    fireEvent.click(screen.getByText('Edit'));
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('renders inputs in edit mode', () => {
    const editingCard = { ...baseCard, isEditing: true };
    renderCard(editingCard);

    expect(screen.getByDisplayValue('Test Card')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('dispatches editCardField when input changes', () => {
    const editingCard = { ...baseCard, isEditing: true };
    renderCard(editingCard);

    fireEvent.change(screen.getByDisplayValue('Test Card'), {
      target: { value: 'New Title' },
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('dispatches saveCard when Save is clicked', () => {
    const editingCard = { ...baseCard, isEditing: true };
    renderCard(editingCard);

    fireEvent.click(screen.getByText('Save'));
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('dispatches deleteCard when Delete is clicked', () => {
    renderCard(baseCard);

    fireEvent.click(screen.getByText('Delete'));
    expect(mockDispatch).toHaveBeenCalled();
  });
});
