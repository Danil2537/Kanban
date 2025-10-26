import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import CardItem from './Card';
import type { DroppableColumnProps } from '../interfaces';

export default function DroppableColumn({
  id,
  columnCards,
  onCreate,
}: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="w-1/3 p-4 rounded-lg bg-zinc-800 hover:bg-zinc-500"
    >
      <h2 className="font-bold mb-2">{id.replace('_', ' ')}</h2>
      <SortableContext
        id={id}
        items={columnCards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="w-1/3 p-4 rounded-lg bg-zinc-800 hover:bg-zinc-500">
          <ol className="min-h-[200px] ">
            {columnCards.map((card) => (
              <CardItem key={card.id} card={card} />
            ))}
          </ol>
        </div>
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
