import React, { useState, useEffect, useCallback } from "react";
import { useTasks } from "../context/TaskContext";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import Analytics from "../components/Analytics";
import { useDebounce } from "../hooks/useDebounce";
import { format, isPast, isToday } from "date-fns";

/* ── Icons (inline SVG helpers) ─────────────────────────── */
const Ico = {
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  board: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="18" rx="1"/><rect x="17" y="3" width="5" height="18" rx="1"/></svg>,
  list:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor"/><circle cx="3" cy="12" r="1.5" fill="currentColor"/><circle cx="3" cy="18" r="1.5" fill="currentColor"/></svg>,
  chart: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6"  y1="20" x2="6"  y2="14"/></svg>,
  search:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  plus:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  kbd:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>,
  tasks: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>,
};

const KANBAN_COLS = [
  { key: "todo",         label: "To Do",       cls: "kc-todo" },
  { key: "in-progress",  label: "In Progress",  cls: "kc-prog" },
  { key: "done",         label: "Done",         cls: "kc-done" },
];

const STATUS_NEXT = { todo: "in-progress", "in-progress": "done", done: "todo" };
const STATUS_CLS  = { todo: "st-todo", "in-progress": "st-prog", done: "st-done" };
const STATUS_LABEL = { todo: "To Do", "in-progress": "In Progress", done: "Done" };

/* ── List Row ────────────────────────────────────────────── */
function ListRow({ task, selected, onSelect, onEdit }) {
  const { updateStatus, deleteTask } = useTasks();

  const due = task.dueDate ? (() => {
    const d = new Date(task.dueDate);
    return { label: format(d, "MMM d"), overdue: task.status !== "done" && isPast(d) && !isToday(d), today: isToday(d) };
  })() : null;

  return (
    <div className={`list-row ${task.status === "done" ? "lr-done" : ""} ${selected ? "lr-selected" : ""}`}>
      <button
        className={`lr-check ${selected ? "ticked" : ""}`}
        onClick={() => onSelect(task._id)}
      >{selected ? "✓" : ""}</button>

      <span className="lr-title">{task.title}</span>

      <span className={`lr-status ${STATUS_CLS[task.status]}`}>
        {STATUS_LABEL[task.status]}
      </span>

      <span className={`tc-priority-badge pb-${task.priority}`}>{task.priority}</span>

      <span className={`tc-due ${due?.overdue ? "overdue" : due?.today ? "due-today" : ""}`} style={{ fontSize: 12 }}>
        {due ? `📅 ${due.label}` : "—"}
      </span>

      <div className="lr-actions">
        <button className="btn btn-xs btn-ghost" onClick={() => onEdit(task)}>Edit</button>
        <button
          className="btn btn-xs btn-ghost"
          onClick={() => updateStatus(task._id, STATUS_NEXT[task.status])}
          title="Advance status"
        >→</button>
        <button className="btn btn-xs btn-danger" onClick={() => window.confirm(`Delete "${task.title}"?`) && deleteTask(task._id)}>✕</button>
      </div>
    </div>
  );
}

/* ── Keyboard shortcuts modal ────────────────────────────── */
function ShortcutsModal({ onClose }) {
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-head">
          <h2>Keyboard Shortcuts</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="shortcut-grid">
            {[
              ["New task",      "N"],
              ["Search",        "/"],
              ["Kanban view",   "1"],
              ["List view",     "2"],
              ["Analytics",     "3"],
              ["Close modal",   "Esc"],
              ["Select all",    "Ctrl+A"],
              ["Delete selected","Del"],
            ].map(([label, keys]) => (
              <div className="shortcut-row" key={label}>
                <span className="shortcut-label">{label}</span>
                <div className="shortcut-keys">
                  {keys.split("+").map((k) => <kbd key={k}>{k}</kbd>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════════ */
export default function Home() {
  const {
    tasks, loading, error, filters, summary,
    fetchTasks, setFilters, bulkDelete, bulkStatus,
  } = useTasks();

  const [view,         setView]         = useState("kanban");
  const [showForm,     setShowForm]     = useState(false);
  const [editTask,     setEditTask]     = useState(null);
  const [initStatus,   setInitStatus]   = useState("todo");
  const [selected,     setSelected]     = useState(new Set());
  const [searchInput,  setSearchInput]  = useState("");
  const [showShortcuts,setShowShortcuts]= useState(false);

  const debSearch = useDebounce(searchInput, 380);

  // sync search into context filters
  useEffect(() => { setFilters({ search: debSearch }); }, [debSearch]); // eslint-disable-line

  // fetch on filter change
  useEffect(() => {
    const p = {};
    if (filters.priority !== "all") p.priority = filters.priority;
    if (filters.search)             p.search   = filters.search;
    if (filters.sort)               p.sort     = filters.sort;
    fetchTasks(p);
  }, [filters, fetchTasks]);

  // clear selection on view change
  useEffect(() => { setSelected(new Set()); }, [view]);

  /* keyboard shortcuts */
  useEffect(() => {
    const h = (e) => {
      const tag = document.activeElement?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (e.key === "Escape") {
        setShowForm(false); setShowShortcuts(false); setSelected(new Set());
        return;
      }
      if (typing) return;

      if (e.key === "n" || e.key === "N") { openCreate("todo"); }
      if (e.key === "/" ) { document.querySelector(".topbar-search input")?.focus(); e.preventDefault(); }
      if (e.key === "1" ) setView("kanban");
      if (e.key === "2" ) setView("list");
      if (e.key === "3" ) setView("analytics");
      if (e.key === "?" ) setShowShortcuts(true);
      if ((e.key === "Delete" || e.key === "Backspace") && selected.size > 0) {
        if (window.confirm(`Delete ${selected.size} task(s)?`)) {
          bulkDelete([...selected]);
          setSelected(new Set());
        }
      }
      if (e.ctrlKey && e.key === "a") {
        e.preventDefault();
        setSelected(new Set(tasks.map((t) => t._id)));
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [tasks, selected, bulkDelete]);

  const openCreate = (status = "todo") => { setInitStatus(status); setEditTask(null); setShowForm(true); };
  const openEdit   = (task) => { setEditTask(task); setShowForm(true); };
  const closeForm  = () => { setShowForm(false); setEditTask(null); };

  const toggleSelect = useCallback((id) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  /* filter helpers */
  const hasFilters = filters.priority !== "all" || filters.search;
  const clearFilters = () => { setFilters({ priority: "all", search: "" }); setSearchInput(""); };

  /* filtered tasks (status filter for list/kanban handled differently) */
  const filteredTasks = filters.status === "all"
    ? tasks
    : tasks.filter((t) => t.status === filters.status);

  const grouped = {
    "todo":        tasks.filter((t) => t.status === "todo"),
    "in-progress": tasks.filter((t) => t.status === "in-progress"),
    "done":        tasks.filter((t) => t.status === "done"),
  };

  /* sidebar nav config */
  const navItems = [
    { key: "kanban",    label: "Board",     icon: Ico.board, count: summary.total },
    { key: "list",      label: "All Tasks", icon: Ico.tasks, count: summary.total },
    { key: "analytics", label: "Analytics", icon: Ico.chart  },
  ];

  const pageTitle = { kanban: "Board", list: "All Tasks", analytics: "Analytics" };

  return (
    <div className="shell">
      {/* ══════ SIDEBAR ══════ */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <span className="logo-text">Task<span>Flow</span></span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Workspace</div>
          {navItems.map(({ key, label, icon, count }) => (
            <button
              key={key}
              className={`nav-item ${view === key ? "active" : ""}`}
              onClick={() => setView(key)}
            >
              <span className="nav-item-icon">{icon}</span>
              {label}
              {count !== undefined && (
                <span className="nav-item-badge">{count}</span>
              )}
            </button>
          ))}

          <div className="nav-section-label" style={{ marginTop: 12 }}>Filters</div>
          {["all","todo","in-progress","done"].map((s) => {
            const labels = { all: "All", todo: "To Do", "in-progress": "In Progress", done: "Done" };
            const counts = { all: summary.total, todo: summary.todo, "in-progress": summary.inProgress, done: summary.done };
            return (
              <button
                key={s}
                className={`nav-item ${filters.status === s && view !== "analytics" ? "active" : ""}`}
                onClick={() => { setFilters({ status: s }); if (view === "analytics") setView("list"); }}
              >
                <span className="nav-item-icon" style={{ fontSize: 10 }}>●</span>
                {labels[s]}
                <span className="nav-item-badge">{counts[s] || 0}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="kbd-hint nav-item" onClick={() => setShowShortcuts(true)}>
            {Ico.kbd} Shortcuts <kbd>?</kbd>
          </button>
        </div>
      </aside>

      {/* ══════ PAGE ══════ */}
      <div className="page">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-search">
            <span className="topbar-search-icon">{Ico.search}</span>
            <input
              type="search"
              placeholder="Search tasks… (/)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="topbar-right">
            <button className="btn btn-ghost btn-sm" onClick={() => setShowShortcuts(true)}>
              {Ico.kbd}
            </button>
            <button className="btn btn-primary" onClick={() => openCreate("todo")}>
              {Ico.plus} New task
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="content">
          <div className="page-head">
            <div className="page-head-left">
              <h2>{pageTitle[view]}</h2>
              <p>
                {summary.total} total · {summary.todo} to do · {summary.inProgress} in progress · {summary.done} done
              </p>
            </div>
          </div>

          {/* Stats */}
          {view !== "analytics" && (
            <div className="stats-grid">
              {[
                { key: "all",  cls: "sc-all",  label: "Total",       count: summary.total,       icon: "🗂" },
                { key: "todo", cls: "sc-todo",  label: "To Do",       count: summary.todo,        icon: "📝" },
                { key: "in-progress", cls: "sc-prog", label: "In Progress", count: summary.inProgress, icon: "⚡" },
                { key: "done", cls: "sc-done",  label: "Done",        count: summary.done,        icon: "✅" },
              ].map(({ key, cls, label, count, icon }) => (
                <div
                  key={key}
                  className={`stat-card ${cls} ${filters.status === key ? "sc-active" : ""}`}
                  onClick={() => setFilters({ status: key })}
                >
                  <div className="stat-card-top">
                    <span className="stat-card-label">{label}</span>
                    <span className="stat-card-icon">{icon}</span>
                  </div>
                  <div className="stat-card-count">{loading ? "—" : (count || 0)}</div>
                  <div className="stat-card-trend">Click to filter</div>
                </div>
              ))}
            </div>
          )}

          {/* Toolbar */}
          {view !== "analytics" && (
            <div className="toolbar">
              <div className="toolbar-left">
                <label className={`pill-select ${filters.priority !== "all" ? "ps-active" : ""}`}>
                  ↕
                  <select value={filters.priority} onChange={(e) => setFilters({ priority: e.target.value })}>
                    <option value="all">Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>

                <label className="pill-select">
                  ⇅
                  <select value={filters.sort} onChange={(e) => setFilters({ sort: e.target.value })}>
                    <option value="-createdAt">Newest first</option>
                    <option value="createdAt">Oldest first</option>
                    <option value="dueDate">Due soon</option>
                    <option value="-dueDate">Due later</option>
                    <option value="title">A → Z</option>
                  </select>
                </label>

                {hasFilters && (
                  <button className="clear-filters" onClick={clearFilters}>✕ Clear filters</button>
                )}
              </div>

              <div className="view-switcher">
                <button className={`vs-btn ${view === "kanban" ? "vs-active" : ""}`} onClick={() => setView("kanban")}>
                  {Ico.board} Board
                </button>
                <button className={`vs-btn ${view === "list" ? "vs-active" : ""}`} onClick={() => setView("list")}>
                  {Ico.list} List
                </button>
              </div>
            </div>
          )}

          {/* Bulk actions bar */}
          {selected.size > 0 && (
            <div className="bulk-bar">
              <span className="bulk-bar-label">{selected.size} selected</span>
              <div className="bulk-bar-actions">
                <button className="btn btn-sm btn-ghost" onClick={() => { bulkStatus([...selected], "done"); setSelected(new Set()); }}>
                  ✓ Mark done
                </button>
                <button className="btn btn-sm btn-ghost" onClick={() => { bulkStatus([...selected], "in-progress"); setSelected(new Set()); }}>
                  → In Progress
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => { if (window.confirm(`Delete ${selected.size} task(s)?`)) { bulkDelete([...selected]); setSelected(new Set()); } }}
                >
                  {Ico.trash} Delete
                </button>
                <button className="btn btn-sm btn-ghost" onClick={() => setSelected(new Set())}>✕ Cancel</button>
              </div>
            </div>
          )}

          {error && (
            <div className="err-banner">⚠ {error} <button onClick={() => fetchTasks()}>Retry</button></div>
          )}

          {/* ── KANBAN ── */}
          {view === "kanban" && (
            <div className="kanban">
              {KANBAN_COLS.map(({ key, label, cls }) => {
                const col = grouped[key] || [];
                return (
                  <div key={key} className={`kanban-col ${cls}`}>
                    <div className="kanban-col-head">
                      <div className="col-title-group">
                        <span className="col-indicator" />
                        <span className="col-title-text">{label}</span>
                      </div>
                      <span className="col-count">{loading ? "—" : col.length}</span>
                    </div>
                    <div className="kanban-col-body">
                      {loading ? (
                        [1,2,3].map((i) => <div key={i} className="skeleton skel-card" />)
                      ) : col.length === 0 ? (
                        <div className="empty-col">
                          <div className="empty-col-icon">
                            {key === "todo" ? "📝" : key === "in-progress" ? "⚡" : "✅"}
                          </div>
                          <span>No tasks here</span>
                        </div>
                      ) : (
                        col.map((task) => (
                          <TaskCard
                            key={task._id}
                            task={task}
                            onEdit={openEdit}
                            selected={selected.has(task._id)}
                            onSelect={toggleSelect}
                          />
                        ))
                      )}
                      <button className="add-to-col" onClick={() => openCreate(key)}>
                        {Ico.plus} Add task
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── LIST ── */}
          {view === "list" && (
            <div className="list-wrap">
              <div className="list-header">
                <span />
                <span className="list-th">Title</span>
                <span className="list-th">Status</span>
                <span className="list-th">Priority</span>
                <span className="list-th">Due</span>
                <span className="list-th">Actions</span>
              </div>
              {loading ? (
                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[1,2,3,4,5].map((i) => <div key={i} className="skeleton skel-row" />)}
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="empty-page">
                  <div className="empty-page-icon">📋</div>
                  <h3>No tasks found</h3>
                  <p>Try adjusting your filters or search, or create a new task.</p>
                  <button className="btn btn-primary" onClick={() => openCreate()}>
                    {Ico.plus} New task
                  </button>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <ListRow
                    key={task._id}
                    task={task}
                    selected={selected.has(task._id)}
                    onSelect={toggleSelect}
                    onEdit={openEdit}
                  />
                ))
              )}
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {view === "analytics" && <Analytics />}
        </div>
      </div>

      {/* Modals */}
      {showForm && <TaskForm task={editTask} initialStatus={initStatus} onClose={closeForm} />}
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}
