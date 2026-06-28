import React from "react";
import { useTasks } from "../context/TaskContext";

export default function StatsBar() {
  const { summary, setFilters, filters } = useTasks();

  const total = summary.total || 0;

  const tiles = [
    { key: "all",         cls: "s-all",  label: "Total",       count: total,              pct: 100 },
    { key: "todo",        cls: "s-todo", label: "To Do",       count: summary.todo || 0,  pct: total ? ((summary.todo || 0) / total) * 100 : 0 },
    { key: "in-progress", cls: "s-prog", label: "In Progress", count: summary.inProgress || 0, pct: total ? ((summary.inProgress || 0) / total) * 100 : 0 },
    { key: "done",        cls: "s-done", label: "Done",        count: summary.done || 0,  pct: total ? ((summary.done || 0) / total) * 100 : 0 },
  ];

  return (
    <div className="stats-row">
      {tiles.map(({ key, cls, label, count, pct }) => (
        <button
          key={key}
          className={`stat-tile ${cls} ${filters.status === key ? "active" : ""}`}
          onClick={() => setFilters({ status: key })}
        >
          <div className="stat-tile-label">{label}</div>
          <div className="stat-tile-count">{count}</div>
          <div className="stat-tile-bar">
            <div className="stat-tile-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </button>
      ))}
    </div>
  );
}
