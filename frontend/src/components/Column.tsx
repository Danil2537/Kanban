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
      className="flex-1 bg-zinc-800 p-5 rounded-2xl shadow-lg flex flex-col min-h-[400px] border border-zinc-700"
    >
      <h2 className="font-semibold text-center mb-4 text-lg uppercase tracking-wide text-gray-200">
        {id.replace('_', ' ')}
      </h2>

      <SortableContext
        id={id}
        items={columnCards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <ol className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
          {columnCards.map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </ol>
      </SortableContext>

      {onCreate && (
        <button
          onClick={onCreate}
          aria-label="add card"
          className="mt-5 py-3 border-2 border-dashed border-zinc-600 bg-indigo-400 text-gray-200 hover:text-gray-400 hover:bg-indigo-600 font-medium transition-all duration-200 flex justify-center items-center gap-1"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
          <span className="text-sm uppercase tracking-wide font-medium">
            Add Card
          </span>
        </button>
      )}
    </div>
  );
}
