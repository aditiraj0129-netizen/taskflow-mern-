<div align="center">

# TaskFlow Pro

**A full-stack task management application built with the MERN stack**

[Live Demo](#) · [API Docs](#api-reference)

</div>

---

## Features

| Feature | Details |
|---------|---------|
| **Kanban Board** | Three-column board — To Do, In Progress, Done |
| **List View** | Sortable table with inline actions |
| **Analytics Dashboard** | Completion ring, status pie chart, 7-day activity bar chart, priority breakdown, overdue tracker |
| **Activity Log** | Real-time feed of every create / update / delete action |
| **Bulk Actions** | Select multiple tasks → bulk status change or bulk delete |
| **Keyboard Shortcuts** | `N` new task, `/` search, `1/2/3` switch views, `Ctrl+A` select all, `Del` delete selected |
| **Smart Search** | Debounced live search across title and description |
| **Filtering** | Filter by status (clickable stat cards or sidebar) and priority |
| **Due Date Warnings** | Overdue and "due today" chips on cards |
| **Tags** | Color-coded tag chips on each task |
| **Form Validation** | Client + server validation with field-level error messages |
| **Toast Notifications** | Loading → success/error toasts on every operation |
| **Responsive UI** | Collapsing sidebar, stacked Kanban on mobile |

## Tech Stack

```
Frontend          Backend           Database
─────────         ─────────         ─────────
React 18          Node.js           MongoDB Atlas
Context + Hooks   Express.js        Mongoose ODM
Recharts          REST API
Axios             Error middleware
react-hot-toast   Input validation
date-fns
```

## Project Structure

```
task-tracker/
├── server/
│   ├── controllers/
│   │   └── taskController.js     # All route logic
│   ├── middleware/
│   │   └── errorHandler.js       # Centralised error handling
│   ├── models/
│   │   └── Task.js               # Mongoose schema
│   ├── routes/
│   │   └── taskRoutes.js         # Express router
│   ├── index.js                  # Server entry point
│   └── .env.example
│
└── client/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── TaskCard.js        # Card with context menu + selection
        │   ├── TaskForm.js        # Create / edit modal
        │   └── Analytics.js      # Charts and metrics
        ├── context/
        │   └── TaskContext.js     # Global state (useReducer)
        ├── hooks/
        │   └── useDebounce.js     # Debounce hook
        ├── pages/
        │   └── Home.js            # Main app shell
        ├── utils/
        │   └── api.js             # Axios instance + endpoints
        ├── App.js
        └── App.css                # Complete design system
```

## Local Development

### Prerequisites
- Node.js 18+
- A free [MongoDB Atlas](https://mongodb.com/atlas) cluster

### 1 — Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 2 — Environment variables

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Create `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

3 — Run

```bash
# Terminal 1 — API server (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — React app (http://localhost:3000)
cd client && npm start
```

API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | List tasks with filters |
| `GET` | `/api/tasks/:id` | Get single task |
| `POST` | `/api/tasks` | Create task |
| `PUT` | `/api/tasks/:id` | Full update |
| `PATCH` | `/api/tasks/:id/status` | Update status only |
| `DELETE` | `/api/tasks/:id` | Delete single task |
| `POST` | `/api/tasks/bulk-delete` | Delete multiple tasks |
| `GET` | `/api/health` | Health check |
 Query parameters — `GET /api/tasks`

| Param | Values | Description |
|-------|--------|-------------|
| `status` | `todo` `in-progress` `done` | Filter by status |
| `priority` | `high` `medium` `low` | Filter by priority |
| `sort` | `-createdAt` `createdAt` `dueDate` `title` | Sort order |
| `search` | string | Full-text search on title + description |

 Task schema

```json
{
  "title":       "string (3–100 chars, required)",
  "description": "string (max 500 chars)",
  "status":      "todo | in-progress | done",
  "priority":    "low | medium | high",
  "dueDate":     "ISO date string | null",
  "tags":        ["string"]
}
```

<img width="476" height="277" alt="Screenshot 2026-06-24 at 8 47 31 PM" src="https://github.com/user-attachments/assets/bd96b725-90b7-4f23-8ed2-e7ef6ba17d61" />






---

Built with React 18, Node.js, Express, MongoDB, and Recharts.
