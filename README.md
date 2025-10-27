# Kanban Board App

A small **Kanban board** TypeScript app developed as a **test task**.
App link: https://kanbantesttask.netlify.app/
---

## Tech Stack

### Backend
- **Framework:** [Nest.js] (hosted on [Render.com](https://render.com)) (Backend link: (https://kanban-h6ko.onrender.com))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (hosted on [Supabase](https://supabase.com))
- **Testing:** [Jest](https://jestjs.io/)
- **Linting/Formatting:** ESLint + Prettier

### Frontend
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Framework:** [React](https://react.dev/) (hosted on [Netlify](https://www.netlify.com)) (Frontend link: (https://kanbantesttask.netlify.app/))
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [React Redux](https://redux-toolkit.js.org/)
- **Drag & Drop:** [dnd-kit](https://dndkit.com/)
- **Testing:** [Vitest](https://vitest.dev/)
- **Linting/Formatting:** ESLint + Prettier

---

## Requirements

Each visitor is allowed to **create/update/delete boards**.

Each **board** (unique hashed ID, name) contains **3 columns**:
-  To Do  
-  In Progress  
-  Done  

Each visitor can:
- Enter a board ID and load relevant columns and cards.  
- Add/update/delete cards (title + description).  
- Drag and drop cards to change order or move them between columns.

---

## UI Overview

A **single-page web app** with the following interactive elements:

### Board Search
- **Search bar:** Allows entering a board ID.  
- **Copy button:** Copies the search bar contents to the clipboard.  
- **Default board ID:** `ed954f29-74d8-48e6-bc27-96b5755f2e0e` (demo board).  
- **Load button:** Loads the board with the specified ID.  
- **New Board button:** Creates a new empty board.  

### When a Board is Loaded
- **Board title field**
- **Edit/Save button**
  - When “Edit” is clicked → title field becomes editable.
  - When “Save” is clicked → title is updated in the database.
- **Delete board button**
- **Three columns:**  
  `TODO`, `IN PROGRESS`, `DONE`

### Cards
- **Add Card button:** Exists only in the **TODO** column.
- Each card includes:
  - Card title field
  - Card description field
  - Edit/Save button
  - Delete button
  - Drag-and-drop handle

Cards can be:
- Reordered within a column.
- Dragged to another column (added to the bottom).

---

## Backend Endpoints

### Board Controller

| Endpoint | Method | Description |
|-----------|--------|-------------|
| `/boards` | `POST` | Create a new board |
| `/boards/:id` | `GET` | Get a board (with cards) |
| `/boards/:id` | `PATCH` | Update board title |
| `/boards/:id` | `DELETE` | Delete a board |

**PATCH body example:**
```json
{ "updatedTitle": "New Board Title" }
```
Cards Controller
| **Endpoint**	| **Method** |	**Description** |
| `/cards/:boardId` |	`POST` |	Create a new card in TODO column |
| `/cards/:id` |	`GET` |	Get card data |
| `/cards/updateContent/:id` |	`PATCH` |	Update title/description |
| `/cards/reorder/:id` |	`PATCH` |	Change order inside a column |
| `/cards/changeColumn/:id` | `PATCH`	Move card to another column |
| `/cards/:id`	| `DELETE` | Delete a card |

PATCH bodies:

```json Copy code
// Update card content
{ "title": "New Title", "description": "Updated Description" }
```
```json Copy code
// Change order
{ "newOrder": 2 }
```
```json Copy code
// Change column
{ "newColumn": "IN_PROGRESS" }
```
CardColumn enum (from Prisma schema):
```ts Copy code
enum CardColumn {
  TODO
  IN_PROGRESS
  DONE
}
```
Frontend Structure
Components
Board

Column

Card

Redux Slices
Board Slice
Initial state:

```ts Copy code
const initialState: BoardState = {
  searchBar: "ed954f29-74d8-48e6-bc27-96b5755f2e0e",
  id: "",
  title: "",
  isEditing: false,
  error: "",
};
```
Reducers:
- editBoardTitle
- editSearchBar
- toggleBoardEdit
- cancelBoardTitleEdit
- clearBoardError

Extra Reducers:
- findBoard.fulfilled
- findBoard.rejected
- deleteBoard.fulfilled
- saveBoardTitle.fulfilled

Card Slice
Initial state:

```ts Copy code
const initialState: CardState = {
  todoCards: [],
  inProgressCards: [],
  doneCards: [],
};
```
Card interface:

```ts Copy code
export interface Card {
  id: string;
  column: "TODO" | "IN_PROGRESS" | "DONE";
  title: string;
  description: string;
  order: number;
  boardId: string;
  isEditing?: boolean;
  isActive?: boolean;
}
```
Reducers:
- toggleCardEdit
- editCardField
- fillCards
- clearCards
- moveCardWithinColumn
- moveCardBetweenColumns
- setActiveCard
- learActiveCard

Extra Reducers:
- deleteCard.fulfilled
- saveCard.fulfilled
- createCard.fulfilled
