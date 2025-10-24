import { useState } from 'react';
import './App.css';

interface Card {
  id: string;
  column: 'TODO' | 'IN_PROGRESS' | 'DONE';
  title: string;
  description: string;
  order: number;
  boardId: string;
  isEditing?: boolean;
}

function App() {
  const [searchBar, setSearchBar] = useState('');
  const [board, setBoard] = useState<{ id: string; title: string }>({
    id: '',
    title: '',
  });
  const [todoCards, setTodoCards] = useState<Card[]>([]);
  const [inprogressCards, setInprogressCards] = useState<Card[]>([]);
  const [doneCards, setDoneCards] = useState<Card[]>([]);
  const [disableEditBoardTitle, setDisableEditBoardTitle] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}`
    : `https://kanban-h6ko.onrender.com`;

  const handleBoardSearch = async (id?: string) => {
    const url = `${BACKEND_URL}/boards/${id}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      alert(JSON.stringify(data));
      if (data) {
        setBoard({ id: data.id, title: data.title });
        setTodoCards(data.cards.filter((card: Card) => card.column == 'TODO'));
        setInprogressCards(
          data.cards.filter((card: Card) => card.column == 'IN_PROGRESS'),
        );
        setDoneCards(data.cards.filter((card: Card) => card.column == 'DONE'));
        //setCards(data.cards);
      }
    }
  };

  const handleCreateBoard = async () => {
    const url = `${BACKEND_URL}/boards`;
    alert(url);
    const res = await fetch(url, {
      method: 'POST',
    });
    alert(res);
    const data = await res.json();
    alert(JSON.stringify(data));
    const newBoardId = data.id;
    alert(newBoardId);
    if (newBoardId) {
      setSearchBar(newBoardId);
      handleBoardSearch(newBoardId);
    }
  };

  const handleDeleteBoard = async (id?: string) => {
    if (!id) return;
    const url = `${BACKEND_URL}/boards/${id}`;
    const res = await fetch(url, { method: 'DELETE' });
    alert(JSON.stringify(res));
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
      alert(data);
    }
  };

  const handleToggleEdit = () => setDisableEditBoardTitle(false);
  const handleSaveTitle = async () => {
    await updateBoardDb();
    setDisableEditBoardTitle(true);
  };

  return (
    <div className="min-h-screen bg-[#242424] text-white p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">Kanban Boards</h1>

      <div className="flex flex-col items-center gap-4 mb-8">
        <label htmlFor="searchbar" className="text-gray-300">
          Enter Board ID
        </label>
        <input
          type="text"
          id="searchBar"
          name="searchBar"
          className="border border-gray-600 rounded-md px-3 py-2 w-80 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchBar}
          onChange={(e) => setSearchBar(e.target.value)}
          placeholder="ce626fca-e2d2-43a2-be16-a46298a3c1e1"
        />
        <div className="flex gap-4">
          <button
            onClick={() => handleBoardSearch(searchBar)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
          >
            Search
          </button>
          <button
            onClick={handleCreateBoard}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md"
          >
            Create new Board
          </button>
        </div>
      </div>

      {board && board.id && (
        <div>
          <div className="flex items-center justify-center gap-4 mb-6">
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
              <button
                onClick={handleToggleEdit}
                className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded-md"
              >
                Edit
              </button>
            ) : (
              <button
                onClick={handleSaveTitle}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md"
              >
                Save
              </button>
            )}

            <button
              onClick={() => handleDeleteBoard(board.id)}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md"
            >
              Delete
            </button>
          </div>

          {/* Kanban Columns */}
          <div className="flex justify-center gap-6">
            <KanbanColumn
              boardId={board.id}
              title="To Do"
              cards={todoCards}
              setCards={setTodoCards}
              color="blue"
            />
            <KanbanColumn
              boardId={board.id}
              title="In Progress"
              cards={inprogressCards}
              setCards={setInprogressCards}
              color="yellow"
            />
            <KanbanColumn
              boardId={board.id}
              title="Done"
              cards={doneCards}
              setCards={setDoneCards}
              color="green"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  boardId,
  title,
  cards,
  setCards,
  color,
}: {
  boardId: string;
  title: string;
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  color: string;
}) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}`
    : `https://kanban-h6ko.onrender.com`;
  const handleCreateCard = async () => {
    if (!boardId) return;

    const url = `${BACKEND_URL}/cards/${boardId}`;
    const res = await fetch(url, {
      method: 'POST',
    });

    if (res.ok) {
      const newCard: Card = await res.json();
      setCards((prev) => [...prev, newCard]);
    } else {
      alert('Failed to create card');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    const url = `${BACKEND_URL}/cards/${cardId}`;
    const res = await fetch(url, {
      method: 'DELETE',
    });

    if (res.ok) {
      setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
    } else {
      alert('Failed to delete card');
    }
  };

  const toggleCardEdit = (
    cardId: string,
    columnCards: Card[],
    setCards: React.Dispatch<React.SetStateAction<Card[]>>,
  ) => {
    setCards(
      columnCards.map((card) =>
        card.id === cardId ? { ...card, isEditing: !card.isEditing } : card,
      ),
    );
  };

  const updateCardField = (
    cardId: string,
    columnCards: Card[],
    setCards: React.Dispatch<React.SetStateAction<Card[]>>,
    field: 'title' | 'description',
    value: string,
  ) => {
    setCards(
      columnCards.map((card) =>
        card.id === cardId ? { ...card, [field]: value } : card,
      ),
    );
  };

  const saveCardToDb = async (
    card: Card,
    columnCards: Card[],
    setCards: React.Dispatch<React.SetStateAction<Card[]>>,
  ) => {
    const url = `${BACKEND_URL}/cards/updateContent/${card.id}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: card.title,
        description: card.description,
      }),
    });

    if (res.ok) {
      setCards(
        columnCards.map((c) =>
          c.id === card.id ? { ...c, isEditing: false } : c,
        ),
      );
    } else {
      alert('Failed to save card');
    }
  };

  return (
    <div
      className={`w-1/3 bg-gray-800 p-4 rounded-2xl shadow-lg border-t-4 border-${color}-500`}
    >
      <h2 className="text-xl font-bold mb-4 text-center">{title}</h2>
      <ol className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
        {cards.length === 0 && (
          <p className="text-gray-400 text-sm text-center">No cards yet</p>
        )}

        {cards.map((card) => (
          <li
            key={card.id}
            className="bg-gray-700 p-3 rounded-lg shadow-sm hover:bg-gray-600 transition-colors text-left"
          >
            {card.isEditing ? (
              <>
                <input
                  className="w-full mb-1 px-2 py-1 rounded-md bg-gray-800 border border-gray-600"
                  value={card.title}
                  onChange={(e) =>
                    updateCardField(
                      card.id,
                      cards,
                      setCards,
                      'title',
                      e.target.value,
                    )
                  }
                />
                <textarea
                  className="w-full px-2 py-1 rounded-md bg-gray-800 border border-gray-600 text-sm"
                  value={card.description}
                  onChange={(e) =>
                    updateCardField(
                      card.id,
                      cards,
                      setCards,
                      'description',
                      e.target.value,
                    )
                  }
                />
              </>
            ) : (
              <>
                <h3 className="font-semibold">{card.title}</h3>
                <p className="text-gray-300 text-sm">{card.description}</p>
              </>
            )}

            <div className="flex gap-2 mt-2">
              {card.isEditing ? (
                <button
                  onClick={() => saveCardToDb(card, cards, setCards)}
                  className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-md text-sm"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => toggleCardEdit(card.id, cards, setCards)}
                  className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded-md text-sm"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => handleDeleteCard(card.id)}
                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded-md text-sm"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ol>
      {title == 'To Do' && (
        <button
          onClick={handleCreateCard}
          className="material-symbols-outlined mt-2"
        >
          add
        </button>
      )}
    </div>
  );
}

export default App;
