import reducer, {
  toggleCardEdit,
  editCardField,
  fillCards,
  clearCards,
  moveCardWithinColumn,
  moveCardBetweenColumns,
  setActiveCard,
  clearActiveCard,
} from '../../store/cardsSlice';

import { deleteCard, saveCard, createCard } from '../../store/cardsSlice';
import type { CardState, Card } from '../../interfaces';
import { describe, it, expect } from 'vitest';

describe('cardsSlice', () => {
  const initialState: CardState = {
    todoCards: [],
    inProgressCards: [],
    doneCards: [],
  };

  const sampleCardTodo: Card = {
    id: '1',
    column: 'TODO',
    title: 'Todo card',
    description: 'Description',
    isEditing: false,
    isActive: false,
    order: 0,
    boardId: '',
  };

  const sampleCardInProgress: Card = {
    id: '2',
    column: 'IN_PROGRESS',
    title: 'InProgress card',
    description: 'Description',
    isEditing: false,
    isActive: false,
    order: 0,
    boardId: '',
  };

  const sampleCardDone: Card = {
    id: '3',
    column: 'DONE',
    title: 'Done card',
    description: 'Description',
    isEditing: false,
    isActive: false,
    order: 0,
    boardId: '',
  };

  it('should handle fillCards', () => {
    const nextState = reducer(
      initialState,
      fillCards([sampleCardTodo, sampleCardInProgress, sampleCardDone]),
    );
    expect(nextState.todoCards).toHaveLength(1);
    expect(nextState.inProgressCards).toHaveLength(1);
    expect(nextState.doneCards).toHaveLength(1);
  });

  it('should handle clearCards', () => {
    const state = reducer(initialState, fillCards([sampleCardTodo]));
    const nextState = reducer(state, clearCards());
    expect(nextState.todoCards).toHaveLength(0);
  });

  it('should handle toggleCardEdit', () => {
    const state = reducer(initialState, fillCards([sampleCardTodo]));
    const nextState = reducer(state, toggleCardEdit(sampleCardTodo));
    expect(nextState.todoCards[0].isEditing).toBe(true);
  });

  it('should handle editCardField', () => {
    const state = reducer(initialState, fillCards([sampleCardTodo]));
    const nextState = reducer(
      state,
      editCardField({
        card: sampleCardTodo,
        field: 'title',
        value: 'New title',
      }),
    );
    expect(nextState.todoCards[0].title).toBe('New title');
  });

  it('should handle moveCardWithinColumn', () => {
    const state = reducer(
      initialState,
      fillCards([
        { ...sampleCardTodo, id: '1' },
        { ...sampleCardTodo, id: '2' },
        { ...sampleCardTodo, id: '3' },
      ]),
    );
    const nextState = reducer(
      state,
      moveCardWithinColumn({ column: 'TODO', oldIndex: 0, newIndex: 2 }),
    );
    expect(nextState.todoCards.map((c) => c.id)).toEqual(['2', '3', '1']);
  });

  it('should handle moveCardBetweenColumns', () => {
    const state = reducer(initialState, fillCards([sampleCardTodo]));
    const nextState = reducer(
      state,
      moveCardBetweenColumns({
        from: 'TODO',
        to: 'IN_PROGRESS',
        card: sampleCardTodo,
      }),
    );
    expect(nextState.todoCards).toHaveLength(0);
    expect(nextState.inProgressCards).toHaveLength(1);
    expect(nextState.inProgressCards[0].column).toBe('IN_PROGRESS');
  });

  it('should handle setActiveCard and clearActiveCard', () => {
    const state = reducer(
      initialState,
      fillCards([sampleCardTodo, sampleCardInProgress]),
    );
    const activeState = reducer(state, setActiveCard('2'));
    expect(activeState.inProgressCards[0].isActive).toBe(true);
    expect(activeState.todoCards[0].isActive).toBe(false);

    const clearedState = reducer(activeState, clearActiveCard());
    expect(clearedState.inProgressCards[0].isActive).toBe(false);
  });

  // --- ExtraReducers ---
  it('should handle deleteCard.fulfilled', () => {
    const state = reducer(
      initialState,
      fillCards([sampleCardTodo, sampleCardInProgress, sampleCardDone]),
    );
    const nextState = reducer(state, {
      type: deleteCard.fulfilled.type,
      payload: '1',
    });
    expect(nextState.todoCards).toHaveLength(0);
    expect(nextState.inProgressCards).toHaveLength(1);
    expect(nextState.doneCards).toHaveLength(1);
  });

  it('should handle saveCard.fulfilled', () => {
    const state = reducer(
      initialState,
      fillCards([{ ...sampleCardTodo, isEditing: true }]),
    );
    const nextState = reducer(state, {
      type: saveCard.fulfilled.type,
      payload: sampleCardTodo,
    });
    expect(nextState.todoCards[0].isEditing).toBe(false);
  });

  it('should handle createCard.fulfilled', () => {
    const newCard: Card = { ...sampleCardTodo, id: 'new' };
    const nextState = reducer(initialState, {
      type: createCard.fulfilled.type,
      payload: newCard,
    });
    expect(nextState.todoCards).toHaveLength(1);
    expect(nextState.todoCards[0].id).toBe('new');
  });
});
