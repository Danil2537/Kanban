import { render, screen, fireEvent } from '@testing-library/react';
import DroppableColumn from './Column';
import { describe, expect, it, vi } from 'vitest';
import type { PropsWithChildren } from 'react';
vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: vi.fn() }),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: PropsWithChildren) => <div>{children}</div>,
  verticalListSortingStrategy: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
  }),
}));

// --- Redux mocks ---
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(), // mock dispatch
}));

describe('<DroppableColumn />', () => {
  const mockCards = [
    {
      id: '1',
      title: 'Test Card 1',
      description: 'desc 1',
      column: 'TODO',
      order: 0,
      boardId: '',
      isEditing: false,
      isActive: false,
    },
    {
      id: '2',
      title: 'Test Card 2',
      description: 'desc 2',
      column: 'TODO',
      order: 0,
      boardId: '',
      isEditing: false,
      isActive: false,
    },
  ];

  it('renders column title correctly', () => {
    render(
      <DroppableColumn id="TODO" columnCards={mockCards} onCreate={() => {}} />,
    );
    expect(screen.getByText('TODO')).toBeInTheDocument();
  });

  it('renders list of cards', () => {
    render(
      <DroppableColumn id="TODO" columnCards={mockCards} onCreate={() => {}} />,
    );
    expect(screen.getByText('Test Card 1')).toBeInTheDocument();
    expect(screen.getByText('Test Card 2')).toBeInTheDocument();
  });

  it('renders + Add button when onCreate is provided', () => {
    render(
      <DroppableColumn id="TODO" columnCards={mockCards} onCreate={() => {}} />,
    );
    expect(screen.getByText('+ Add')).toBeInTheDocument();
  });

  it('does not render + Add button when onCreate is missing', () => {
    render(<DroppableColumn id="TODO" columnCards={mockCards} />);
    expect(screen.queryByText('+ Add')).not.toBeInTheDocument();
  });

  it('calls onCreate when + Add button is clicked', () => {
    const onCreateMock = vi.fn();
    render(
      <DroppableColumn
        id="TODO"
        columnCards={mockCards}
        onCreate={onCreateMock}
      />,
    );
    fireEvent.click(screen.getByText('+ Add'));
    expect(onCreateMock).toHaveBeenCalledTimes(1);
  });
});
