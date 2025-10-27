import { useSortable } from '@dnd-kit/sortable';
import type { Card } from '../interfaces';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import {
  deleteCard,
  editCardField,
  saveCard,
  toggleCardEdit,
} from '../store/cardsSlice';

export default function CardItem({ card }: { card: Card }) {
  const { attributes, listeners, setNodeRef } = useSortable({ id: card.id });
  const dispatch = useDispatch<AppDispatch>();

  return (
    <li
      ref={setNodeRef}
      className="bg-zinc-700 rounded-xl shadow-md p-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200"
    >
      <div
        className="flex justify-end text-zinc-500 hover:text-zinc-300"
        {...attributes}
        {...listeners}
      >
        <span className="material-symbols-outlined text-xl">drag_handle</span>
      </div>

      {card.isEditing ? (
        <>
          <input
            value={card.title}
            onChange={(e) =>
              dispatch(
                editCardField({ card, field: 'title', value: e.target.value }),
              )
            }
            className="w-full bg-zinc-800 text-gray-100 rounded-md px-2 py-1 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Title"
          />
          <textarea
            value={card.description}
            onChange={(e) =>
              dispatch(
                editCardField({
                  card,
                  field: 'description',
                  value: e.target.value,
                }),
              )
            }
            className="w-full bg-zinc-800 text-gray-300 rounded-md px-2 py-1 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Description"
          />
        </>
      ) : (
        <>
          <h3 className="font-semibold text-gray-100 text-lg">{card.title}</h3>
          <p className="text-gray-400 text-sm whitespace-pre-wrap">
            {card.description}
          </p>
        </>
      )}

      <div className="flex justify-end gap-3 mt-2 text-sm">
        {card.isEditing ? (
          <button
            className="bg-green-400 text-gray-200 hover:text-gray-400 hover:bg-green-600 font-medium"
            onClick={() => dispatch(saveCard(card))}
            aria-label="save"
          >
            Save
          </button>
        ) : (
          <button
            className="bg-blue-400 text-gray-200 hover:text-blue-400 hover:bg-blue-600"
            onClick={() => dispatch(toggleCardEdit(card))}
            aria-label="edit"
          >
            <span className="material-symbols-outlined align-middle">
              edit_square
            </span>
          </button>
        )}

        <button
          className="bg-red-400 text-gray-200 hover:text-red-400 hover:bg-red-600"
          onClick={() => dispatch(deleteCard(card.id))}
          aria-label="delete"
        >
          <span className="material-symbols-outlined align-middle">delete</span>
        </button>
      </div>
    </li>
  );
}
