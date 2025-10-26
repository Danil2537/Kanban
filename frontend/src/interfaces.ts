export interface Card {
  id: string;
  column: string; //'TODO' | 'IN_PROGRESS' | 'DONE';
  title: string;
  description: string;
  order: number;
  boardId: string;
  isEditing?: boolean;
  isActive?: boolean;
}

export interface DroppableColumnProps {
  id: string;
  columnCards: Card[];
  onCreate?: () => void;
  children?: React.ReactNode;
}

export interface CardState {
  todoCards: Card[];
  inProgressCards: Card[];
  doneCards: Card[];
}

export interface BoardState {
  searchBar: string;
  id: string;
  title: string;
  isEditing: boolean;
  error: string;
}
