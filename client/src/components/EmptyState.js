import React from "react";

export default function EmptyState({ onAdd }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📋</div>
      <h3>No tasks found</h3>
      <p>Adjust your filters or create a new task to get started.</p>
      <button className="btn btn-primary" onClick={onAdd}>
        + Create Task
      </button>
    </div>
  );
}
