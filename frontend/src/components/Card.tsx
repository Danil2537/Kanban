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
    <li ref={setNodeRef} className="p-2 mb-2 bg-zinc-800 shadow rounded-md">
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
            onChange={(e) =>
              dispatch(
                editCardField({
                  card: card,
                  field: 'title',
                  value: e.target.value,
                }),
              )
            }
            className="w-full border p-1 rounded mb-1"
          />
          <textarea
            value={card.description}
            onChange={(e) =>
              dispatch(
                editCardField({
                  card: card,
                  field: 'description',
                  value: e.target.value,
                }),
              )
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
            onClick={() => dispatch(saveCard(card))}
            className="text-green-600 hover:text-green-800"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => dispatch(toggleCardEdit(card))}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
        )}
        <button
          onClick={() => dispatch(deleteCard(card.id))}
          className="text-red-600 hover:text-red-800"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
