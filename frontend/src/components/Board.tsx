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
import { useState, useEffect } from 'react';

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

  const [copied, setCopied] = useState(false);

  // Reset copied state whenever searchBar changes
  useEffect(() => {
    setCopied(false);
  }, [searchBar]);

  const handleCopy = () => {
    navigator.clipboard.writeText(searchBar);
    setCopied(true);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-zinc-900 text-gray-200 py-8 px-6">
      <h1 className="font-bold mb-8">Kanban Boards</h1>
      <div className="w-full max-w-6xl mb-10">
        <h2 className="text-2xl font-bold mb-4">Enter Board ID</h2>

        <div className="flex flex-col md:flex-row items-stretch gap-2">
          <div className="relative w-full md:w-2/3">
            <input
              type="text"
              id="searchBar"
              name="searchBar"
              value={searchBar}
              onChange={(e) => {
                dispatch(editSearchBar({ text: e.target.value }));
                dispatch(clearBoardError());
              }}
              placeholder="ed954f29-74d8-48e6-bc27-96b5755f2e0e"
              className="w-full h-12 bg-neutral-700 border border-neutral-700 rounded-lg px-4 py-2 pr-12 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleCopy}
              className="absolute inset-y-0 right-2 flex items-center justify-center px-2 text-gray-300 hover:text-white rounded-md"
            >
              <span className="material-symbols-outlined text-lg">
                {copied ? 'done_outline' : 'content_copy'}
              </span>
            </button>
          </div>

          <div className="flex w-full md:w-1/3 gap-2">
            <button
              onClick={() => dispatch(findBoard(searchBar))}
              className="flex-1 px-3 py-2 bg-blue-500 text-white hover:text-gray-400 hover:bg-blue-700 font-medium rounded-md"
            >
              Load
            </button>
            <button
              onClick={() => dispatch(createBoard())}
              className="flex-1 px-3 py-2 bg-green-500 text-white hover:text-gray-400 hover:bg-green-700 font-medium rounded-md"
            >
              New Board
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
      </div>

      {id !== '' && (
        <div className="w-full max-w-6xl flex flex-col items-left">
          <div className="flex mb-8 space-x-4">
            <input
              type="text"
              id="boardTitle"
              name="boardTitle"
              value={title}
              onChange={(e) =>
                dispatch(editBoardTitle({ newTitle: e.target.value }))
              }
              disabled={!isEditing}
              className={`flex-1 text-2xl font-semibold text-left px-3 rounded-md ${
                isEditing
                  ? 'bg-neutral-800 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  : 'bg-neutral-700 text-gray-100'
              }`}
            />
            <div className="w-2/3 pl-2 flex space-x-6">
              {isEditing ? (
                <button
                  onClick={() =>
                    dispatch(saveBoardTitle({ boardId: id, newTitle: title }))
                  }
                  className="w-1/2 py-1 bg-green-500 text-white hover:text-gray-400 hover:bg-green-700 font-medium"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => dispatch(toggleBoardEdit())}
                  className="w-1/2 py-1 bg-blue-500 text-white hover:text-gray-400 hover:bg-blue-700 font-medium"
                >
                  Edit Title
                </button>
              )}

              <button
                onClick={() => dispatch(deleteBoard(id))}
                className="w-1/2 py-1 bg-red-500 text-white hover:text-gray-400 hover:bg-red-700 font-medium rounded-md"
              >
                Delete Board
              </button>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col md:flex-row justify-center gap-6 w-full">
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
                <div className="bg-neutral-800 px-4 py-2 rounded-md shadow-md">
                  {activeCard.title}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  );
}
