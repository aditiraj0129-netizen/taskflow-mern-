import React, { useState, useEffect } from "react";
import { useTasks } from "../context/TaskContext";
import { useDebounce } from "../hooks/useDebounce";

export default function FilterBar({ view, setView }) {
  const { filters, setFilters } = useTasks();
  const [search, setSearch] = useState(filters.search || "");
  const debounced = useDebounce(search, 380);

  useEffect(() => {
    setFilters({ search: debounced });
  }, [debounced]); // eslint-disable-line

  const handleSort = (e) => setFilters({ sort: e.target.value });
  const handlePriority = (e) => setFilters({ priority: e.target.value });

  const hasActiveFilter = filters.priority !== "all" || filters.search;

  return (
    <div className="toolbar">
      <div className="toolbar-filters">
        {/* Priority filter */}
        <label className={`filter-pill ${filters.priority !== "all" ? "active" : ""}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="18" x2="15" y2="18"/>
          </svg>
          <select value={filters.priority} onChange={handlePriority}>
            <option value="all">Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        {/* Sort */}
        <label className="filter-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 6h18M7 12h10M10 18h4"/>
          </svg>
          <select value={filters.sort} onChange={handleSort}>
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
            <option value="dueDate">Due Soon</option>
            <option value="title">A → Z</option>
          </select>
        </label>

        {hasActiveFilter && (
          <button
            className="filter-pill"
            onClick={() => { setFilters({ priority: "all", search: "" }); setSearch(""); }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* View toggle */}
      <div className="view-toggle">
        <button
          className={`view-btn ${view === "kanban" ? "active" : ""}`}
          onClick={() => setView("kanban")}
          title="Kanban view"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="18" rx="1"/><rect x="17" y="3" width="5" height="18" rx="1"/>
          </svg>
        </button>
        <button
          className={`view-btn ${view === "list" ? "active" : ""}`}
          onClick={() => setView("list")}
          title="List view"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
            <circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
