import {
  useSensors,
  useSensor,
  PointerSensor,
  type UniqueIdentifier,
  type DragStartEvent,
  type DragEndEvent,
  DndContext,
  DragOverlay,
} from '@dnd-kit/core';
import { BACKEND_URL } from '../constants';
import DroppableColumn from './Column';
import {
  clearBoardError,
  createBoard,
  deleteBoard,
  editBoardTitle,
  editSearchBar,
  findBoard,
  saveBoardTitle,
  toggleBoardEdit,
} from '../store/boardSlice';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import {
  moveCardWithinColumn,
  moveCardBetweenColumns,
  setActiveCard,
  clearActiveCard,
  createCard,
} from '../store/cardsSlice';

export function Board() {
  const dispatch = useDispatch<AppDispatch>();
  const { todoCards, inProgressCards, doneCards } = useSelector(
    (state: RootState) => state.cards,
  );
  const { searchBar, id, title, isEditing, error } = useSelector(
    (state: RootState) => state.boards,
  );
  const activeCard = [...todoCards, ...inProgressCards, ...doneCards].find(
    (c) => c.isActive,
  );

  const sensors = useSensors(useSensor(PointerSensor));

  const findContainer = (
    id: UniqueIdentifier,
  ): 'TODO' | 'IN_PROGRESS' | 'DONE' | null => {
    if (todoCards.some((c) => c.id === id)) return 'TODO';
    if (inProgressCards.some((c) => c.id === id)) return 'IN_PROGRESS';
    if (doneCards.some((c) => c.id === id)) return 'DONE';
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const cardId = event.active.id as string;
    dispatch(setActiveCard(cardId));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      dispatch(clearActiveCard());
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceColumn = findContainer(activeId);
    const targetColumn = findContainer(overId) || overId;

    if (!sourceColumn || !targetColumn) return;

    if (sourceColumn === targetColumn) {
      const columnArray =
        sourceColumn === 'TODO'
          ? todoCards
          : sourceColumn === 'IN_PROGRESS'
            ? inProgressCards
            : doneCards;

      const oldIndex = columnArray.findIndex((c) => c.id === activeId);
      const newIndex = columnArray.findIndex((c) => c.id === overId);

      if (oldIndex !== newIndex) {
        dispatch(
          moveCardWithinColumn({ column: sourceColumn, oldIndex, newIndex }),
        );

        await fetch(`${BACKEND_URL}/cards/reorder/${activeId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newOrder: newIndex + 1 }),
        });
      }
    } else {
      const sourceCards =
        sourceColumn === 'TODO'
          ? todoCards
          : sourceColumn === 'IN_PROGRESS'
            ? inProgressCards
            : doneCards;

      const card = sourceCards.find((c) => c.id === activeId);
      if (!card) return;

      dispatch(
        moveCardBetweenColumns({
          from: sourceColumn,
          to: targetColumn as 'TODO' | 'IN_PROGRESS' | 'DONE',
          card,
        }),
      );

      await fetch(`${BACKEND_URL}/cards/changeColumn/${activeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newColumn: targetColumn }),
      });
    }

    dispatch(clearActiveCard());
  };

  return (
    <>
      <h1>Kanban Boards</h1>
      <div>
        <label htmlFor="searchbar">Enter Board ID</label>
        <input
          type="text"
          id="searchBar"
          name="searchBar"
          value={searchBar}
          onChange={(e) => {
            dispatch(editSearchBar({ text: e.target.value }));
            dispatch(clearBoardError());
          }}
          placeholder="ce626fca-e2d2-43a2-be16-a46298a3c1e1"
        />
        <div>
          <button onClick={() => dispatch(findBoard(searchBar))}>Search</button>
          <button onClick={() => dispatch(createBoard())}>
            Create new Board
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>

      {id !== '' && (
        <div>
          <div>
            <input
              type="text"
              id="boardTitle"
              name="boardTitle"
              value={title}
              onChange={(e) =>
                dispatch(editBoardTitle({ newTitle: e.target.value }))
              }
              disabled={!isEditing}
              className={`text-2xl font-semibold text-center px-2 py-1 rounded-md ${
                isEditing
                  ? 'bg-transparent border-none'
                  : 'bg-gray-800 border border-gray-600'
              }`}
            />
            {isEditing ? (
              <button
                onClick={() =>
                  dispatch(saveBoardTitle({ boardId: id, newTitle: title }))
                }
              >
                Save
              </button>
            ) : (
              <button onClick={() => dispatch(toggleBoardEdit())}>Edit</button>
            )}

            <button onClick={() => dispatch(deleteBoard(id))}>Delete</button>
          </div>
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4">
              <DroppableColumn
                id="TODO"
                columnCards={todoCards}
                onCreate={() => dispatch(createCard(id))}
              />
              <DroppableColumn id="IN_PROGRESS" columnCards={inProgressCards} />
              <DroppableColumn id="DONE" columnCards={doneCards} />
            </div>

            <DragOverlay>
              {activeCard ? (
                <div className="p-2 bg-gray-200 rounded shadow">
                  {activeCard.title}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </>
  );
}
