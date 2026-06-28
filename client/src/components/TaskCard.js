import React, { useState, useRef, useEffect } from "react";
import { useTasks } from "../context/TaskContext";
import { format, isPast, isToday } from "date-fns";

const NEXT       = { todo: "in-progress", "in-progress": "done", done: "todo" };
const NEXT_LABEL = { todo: "→ Start", "in-progress": "→ Mark done", done: "→ Reopen" };

export default function TaskCard({ task, onEdit, selected, onSelect }) {
  const { updateStatus, deleteTask } = useTasks();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const setClose = () => setOpen(false);

  const due = task.dueDate ? (() => {
    const d = new Date(task.dueDate);
    const overdue  = task.status !== "done" && isPast(d) && !isToday(d);
    const dueToday = isToday(d);
    return { label: format(d, "MMM d"), overdue, dueToday };
  })() : null;

  const isDone = task.status === "done";

  return (
    <div
      className={`task-card tc-${task.priority} ${isDone ? "tc-done" : ""} ${selected ? "tc-selected" : ""}`}
    >
      <div className="tc-row1">
        {/* select checkbox */}
        <button
          className={`tc-checkbox ${selected ? "ticked" : ""}`}
          onClick={() => onSelect(task._id)}
          aria-label="Select task"
        >
          {selected ? "✓" : ""}
        </button>

        <span className="tc-title">{task.title}</span>

        {/* context menu */}
        <div className="ctx-menu-wrap" ref={menuRef}>
          <button
            className="tc-menu-btn"
            onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
            aria-label="Task options"
          >
            ···
          </button>
          {open && (
            <div className="ctx-menu">
              <button className="ctx-item" onClick={() => { setClose(); updateStatus(task._id, NEXT[task.status]); }}>
                {NEXT_LABEL[task.status]}
              </button>
              <button className="ctx-item" onClick={() => { setClose(); onEdit(task); }}>
                ✎ Edit
              </button>
              <div className="ctx-sep" />
              <button className="ctx-item ctx-del" onClick={() => { setClose(); window.confirm(`Delete "${task.title}"?`) && deleteTask(task._id); }}>
                ✕ Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && <p className="tc-desc">{task.description}</p>}

      {task.tags?.length > 0 && (
        <div className="tc-tags">
          {task.tags.slice(0, 4).map((t) => <span key={t} className="tc-tag">#{t}</span>)}
        </div>
      )}

      <div className="tc-footer">
        <span className={`tc-priority-badge pb-${task.priority}`}>{task.priority}</span>
        <div className="tc-meta">
          {due && (
            <span className={`tc-due ${due.overdue ? "overdue" : due.dueToday ? "due-today" : ""}`}>
              📅 {due.label}{due.overdue ? " !" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
