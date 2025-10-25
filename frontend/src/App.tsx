import { useState } from 'react';
import './App.css';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

interface Card {
  id: string;
  column: string; //'TODO' | 'IN_PROGRESS' | 'DONE';
  title: string;
  description: string;
  order: number;
  boardId: string;
  isEditing?: boolean;
}

interface DroppableColumnProps {
  id: string;
  columnCards: Card[];
  setColumnCards: React.Dispatch<React.SetStateAction<Card[]>>;
  onCreate?: () => void;
  children?: React.ReactNode;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}`
  : `https://kanban-h6ko.onrender.com`;

function CardItem({
  card,
  columnCards,
  setColumnCards,
}: {
  card: Card;
  columnCards: Card[];
  setColumnCards: React.Dispatch<React.SetStateAction<Card[]>>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDeleteCard = async (
    setColumnCards: React.Dispatch<React.SetStateAction<Card[]>>,
    cardId: string,
  ) => {
    const res = await fetch(`${BACKEND_URL}/cards/${cardId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setColumnCards((prev) => prev.filter((c) => c.id !== cardId));
    } else {
      alert('Failed to delete card');
    }
  };

  const toggleCardEdit = (cardId: string) => {
    setColumnCards(
      columnCards.map((c) =>
        c.id === cardId ? { ...c, isEditing: !c.isEditing } : c,
      ),
    );
  };

  const updateCardField = (
    cardId: string,
    field: 'title' | 'description',
    value: string,
  ) => {
    setColumnCards(
      columnCards.map((c) => (c.id === cardId ? { ...c, [field]: value } : c)),
    );
  };

  const saveCardToDb = async (card: Card) => {
    const res = await fetch(`${BACKEND_URL}/cards/updateContent/${card.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: card.title,
        description: card.description,
      }),
    });
    if (res.ok) {
      setColumnCards(
        columnCards.map((c) =>
          c.id === card.id ? { ...c, isEditing: false } : c,
        ),
      );
    } else {
      alert('Failed to save card');
    }
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="p-2 mb-2 bg-zinc-800 shadow rounded-md"
    >
      <div
        className="cursor-grab select-none text-gray-500 mb-1"
        {...attributes}
        {...listeners}
      >
        <span className="material-symbols-outlined">drag_handle</span>
      </div>

      {card.isEditing ? (
        <>
          <input
            value={card.title}
            onChange={(e) => updateCardField(card.id, 'title', e.target.value)}
            className="w-full border p-1 rounded mb-1"
          />
          <textarea
            value={card.description}
            onChange={(e) =>
              updateCardField(card.id, 'description', e.target.value)
            }
            className="w-full border p-1 rounded"
          />
        </>
      ) : (
        <>
          <h3 className="font-bold">{card.title}</h3>
          <p>{card.description}</p>
        </>
      )}

      <div className="mt-2 flex gap-2">
        {card.isEditing ? (
          <button
            onClick={() => saveCardToDb(card)}
            className="text-green-600 hover:text-green-800"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => toggleCardEdit(card.id)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
        )}
        <button
          onClick={() => handleDeleteCard(setColumnCards, card.id)}
          className="text-red-600 hover:text-red-800"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

function DroppableColumn({
  id,
  columnCards,
  setColumnCards,
  onCreate,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`w-1/3 p-4 rounded-lg transition-colors ${
        isOver ? 'bg-zinc-400' : 'bg-zinc-600'
      }`}
    >
      <h2 className="font-bold mb-2">{id.replace('_', ' ')}</h2>
      <SortableContext
        id={id}
        items={columnCards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <ol className="min-h-[200px]">
          {columnCards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              columnCards={columnCards}
              setColumnCards={setColumnCards}
            />
          ))}
        </ol>
      </SortableContext>
      {onCreate && (
        <button
          onClick={onCreate}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          + Add
        </button>
      )}
    </div>
  );
}

export function Board() {
  const [searchBar, setSearchBar] = useState('');
  const [board, setBoard] = useState<{ id: string; title: string }>({
    id: '',
    title: '',
  });
  const [disableEditBoardTitle, setDisableEditBoardTitle] = useState(false);
  const handleBoardSearch = async (id?: string) => {
    if (!id) {
      alert('Please enter a board ID.');
      return;
    }

    try {
      const url = `${BACKEND_URL}/boards/${id}`;
      const res = await fetch(url);

      if (!res.ok) {
        if (res.status === 404) {
          alert('Board not found. Please check the ID and try again.');
        } else {
          alert(`Error fetching board: ${res.statusText}`);
        }
        return;
      }

      const data = await res.json();

      if (!data) {
        alert('No data received for this board.');
        return;
      }

      setBoard({ id: data.id, title: data.title });
      setTodoCards(data.cards.filter((card: Card) => card.column === 'TODO'));
      setInprogressCards(
        data.cards.filter((card: Card) => card.column === 'IN_PROGRESS'),
      );
      setDoneCards(data.cards.filter((card: Card) => card.column === 'DONE'));
    } catch (err) {
      console.error('Error fetching board:', err);
      alert('Failed to load board. Please try again later.');
    }
  };

  const handleCreateBoard = async () => {
    const url = `${BACKEND_URL}/boards`;
    const res = await fetch(url, {
      method: 'POST',
    });
    const data = await res.json();
    const newBoardId = data.id;
    if (newBoardId) {
      setSearchBar(newBoardId);
      handleBoardSearch(newBoardId);
    }
  };

  const handleDeleteBoard = async (id?: string) => {
    if (!id) {
      alert('No board selected to delete.');
      return;
    }

    const confirmDelete = confirm(
      'Are you sure you want to delete this board? This action cannot be undone.',
    );
    if (!confirmDelete) return;

    try {
      const url = `${BACKEND_URL}/boards/${id}`;
      const res = await fetch(url, { method: 'DELETE' });

      if (!res.ok) {
        alert(`Failed to delete board: ${res.statusText}`);
        return;
      }

      setBoard({ id: '', title: '' });
      setTodoCards([]);
      setInprogressCards([]);
      setDoneCards([]);

      alert('Board deleted successfully.');
    } catch (err) {
      console.error('Error deleting board:', err);
      alert('Failed to delete board. Please try again later.');
    }
  };

  const handleUpdateBoardName = (newTitle: string) => {
    setBoard((prevBoard) => ({ ...prevBoard, title: newTitle }));
  };

  const updateBoardDb = async () => {
    const url = `${BACKEND_URL}/boards/${board.id}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updatedTitle: board.title }),
    });
    if (res.ok) {
      const data = await res.json();
      console.log(data);
    }
  };

  const handleToggleEdit = () => setDisableEditBoardTitle(false);
  const handleSaveTitle = async () => {
    await updateBoardDb();
    setDisableEditBoardTitle(true);
  };

  const [todoCards, setTodoCards] = useState<Card[]>([]);
  const [inprogressCards, setInprogressCards] = useState<Card[]>([]);
  const [doneCards, setDoneCards] = useState<Card[]>([]);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const handleCreateCard = async () => {
    if (!board.id) return;

    const url = `${BACKEND_URL}/cards/${board.id}`;
    const res = await fetch(url, {
      method: 'POST',
    });

    if (res.ok) {
      const newCard: Card = await res.json();
      setTodoCards((prev) => [...prev, newCard]);
    } else {
      alert('Failed to create card');
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const findContainer = (id: UniqueIdentifier) => {
    if (todoCards.some((c) => c.id === id)) return 'TODO';
    if (inprogressCards.some((c) => c.id === id)) return 'IN_PROGRESS';
    if (doneCards.some((c) => c.id === id)) return 'DONE';
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const cardId = event.active.id;
    const column = findContainer(cardId);
    const card =
      todoCards.find((c) => c.id === cardId) ||
      inprogressCards.find((c) => c.id === cardId) ||
      doneCards.find((c) => c.id === cardId);
    if (card && column) setActiveCard(card);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceColumn = findContainer(activeId);
    const targetColumn = findContainer(overId) || overId; // "TODO", "IN_PROGRESS", "DONE"

    if (!sourceColumn || !targetColumn) return;

    // If dropped in the same column
    if (sourceColumn === targetColumn) {
      const sourceCards =
        sourceColumn === 'TODO'
          ? todoCards
          : sourceColumn === 'IN_PROGRESS'
            ? inprogressCards
            : doneCards;

      const oldIndex = sourceCards.findIndex((c) => c.id === activeId);
      const newIndex = sourceCards.findIndex((c) => c.id === overId);

      if (oldIndex !== newIndex) {
        const reordered = arrayMove(sourceCards, oldIndex, newIndex);
        switch (sourceColumn) {
          case 'TODO':
            setTodoCards(reordered);
            break;
          case 'IN_PROGRESS':
            setInprogressCards(reordered);
            break;
          case 'DONE':
            setDoneCards(reordered);
            break;
        }

        // Optional: call backend to update order
        await fetch(`${BACKEND_URL}/cards/reorder/${activeId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newOrder: newIndex + 1 }),
        });
      }
    } else {
      // Moved to a different column
      const sourceSetter =
        sourceColumn === 'TODO'
          ? setTodoCards
          : sourceColumn === 'IN_PROGRESS'
            ? setInprogressCards
            : setDoneCards;
      alert(sourceSetter.toString());
      const targetSetter =
        targetColumn === 'TODO'
          ? setTodoCards
          : targetColumn === 'IN_PROGRESS'
            ? setInprogressCards
            : setDoneCards;
      alert(targetSetter.toString());
      const sourceCards =
        sourceColumn === 'TODO'
          ? todoCards
          : sourceColumn === 'IN_PROGRESS'
            ? inprogressCards
            : doneCards;
      alert(JSON.stringify(sourceCards));
      const targetCards =
        targetColumn === 'TODO'
          ? todoCards
          : targetColumn === 'IN_PROGRESS'
            ? inprogressCards
            : doneCards;
      alert(JSON.stringify(sourceCards));
      const card = sourceCards.find((c) => c.id === activeId);
      alert(JSON.stringify(card));
      if (!card) return;

      // Remove from old column
      sourceSetter(sourceCards.filter((c) => c.id !== activeId));
      // Add to end of new column
      targetSetter([...targetCards, { ...card, column: targetColumn }]);

      // Call backend to update column
      await fetch(`${BACKEND_URL}/cards/changeColumn/${activeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newColumn: targetColumn }),
      });
    }

    setActiveCard(null);
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
          onChange={(e) => setSearchBar(e.target.value)}
          placeholder="ce626fca-e2d2-43a2-be16-a46298a3c1e1"
        />
        <div>
          <button onClick={() => handleBoardSearch(searchBar)}>Search</button>
          <button onClick={handleCreateBoard}>Create new Board</button>
        </div>
      </div>

      {board && board.id && (
        <div>
          <div>
            <input
              type="text"
              id="boardTitle"
              name="boardTitle"
              value={board.title}
              onChange={(e) => handleUpdateBoardName(e.target.value)}
              disabled={disableEditBoardTitle}
              className={`text-2xl font-semibold text-center px-2 py-1 rounded-md ${
                disableEditBoardTitle
                  ? 'bg-transparent border-none'
                  : 'bg-gray-800 border border-gray-600'
              }`}
            />
            {disableEditBoardTitle ? (
              <button onClick={handleToggleEdit}>Edit</button>
            ) : (
              <button onClick={handleSaveTitle}>Save</button>
            )}

            <button onClick={() => handleDeleteBoard(board.id)}>Delete</button>
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
                setColumnCards={setTodoCards}
                onCreate={handleCreateCard}
              />
              <DroppableColumn
                id="IN_PROGRESS"
                columnCards={inprogressCards}
                setColumnCards={setInprogressCards}
              />
              <DroppableColumn
                id="DONE"
                columnCards={doneCards}
                setColumnCards={setDoneCards}
              />
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

function App() {
  return (
    <div>
      <h1>Kanban Boards</h1>
      <Board />
    </div>
  );
}

export default App;
