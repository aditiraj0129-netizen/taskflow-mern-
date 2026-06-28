import React, { useState, useEffect } from "react";
import { useTasks } from "../context/TaskContext";
import { format } from "date-fns";

const BLANK = { title: "", description: "", status: "todo", priority: "medium", dueDate: "", tags: "" };

export default function TaskForm({ task, initialStatus = "todo", onClose }) {
  const { createTask, updateTask } = useTasks();
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
        tags: (task.tags || []).join(", "),
      });
    } else {
      setForm((f) => ({ ...f, status: initialStatus }));
    }
    // Esc to close
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [task, initialStatus, onClose]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const toggle = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    const title = form.title.trim();
    if (!title) e.title = "Title is required";
    else if (title.length < 3) e.title = "At least 3 characters";
    else if (title.length > 100) e.title = "Max 100 characters";
    if (form.description.length > 500) e.description = "Max 500 characters";
    return e;
  };

  const submit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      task ? await updateTask(task._id, payload) : await createTask(payload);
      onClose();
    } catch { /* toast shown in context */ }
    finally { setSaving(false); }
  };

  const statusOpts = [
    { v: "todo",        label: "To Do",       cls: "ct-todo" },
    { v: "in-progress", label: "In Progress",  cls: "ct-prog" },
    { v: "done",        label: "Done",         cls: "ct-done" },
  ];

  const priorityOpts = [
    { v: "high",   label: "⬆ High",   cls: "ct-high" },
    { v: "medium", label: "▶ Medium",  cls: "ct-medium" },
    { v: "low",    label: "⬇ Low",    cls: "ct-low" },
  ];

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal>
        <div className="modal-head">
          <h2>{task ? "Edit task" : "New task"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Title */}
          <div className="f-group">
            <label className="f-label">Title *</label>
            <input
              className={`f-input ${errors.title ? "f-err" : ""}`}
              value={form.title}
              onChange={set("title")}
              placeholder="What needs to be done?"
              autoFocus
            />
            {errors.title && <span className="f-err-msg">⚠ {errors.title}</span>}
          </div>

          {/* Description */}
          <div className="f-group">
            <label className="f-label">Description</label>
            <textarea
              className={`f-textarea ${errors.description ? "f-err" : ""}`}
              value={form.description}
              onChange={set("description")}
              placeholder="Add context, steps, or notes…"
              rows={3}
            />
            <span className="f-hint">{form.description.length}/500</span>
            {errors.description && <span className="f-err-msg">⚠ {errors.description}</span>}
          </div>

          {/* Status */}
          <div className="f-group">
            <label className="f-label">Status</label>
            <div className="chip-row">
              {statusOpts.map(({ v, label, cls }) => (
                <button
                  key={v}
                  type="button"
                  className={`chip-toggle ${cls} ${form.status === v ? "on" : ""}`}
                  onClick={() => toggle("status", v)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="f-group">
            <label className="f-label">Priority</label>
            <div className="chip-row">
              {priorityOpts.map(({ v, label, cls }) => (
                <button
                  key={v}
                  type="button"
                  className={`chip-toggle ${cls} ${form.priority === v ? "on" : ""}`}
                  onClick={() => toggle("priority", v)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Due + Tags */}
          <div className="f-row">
            <div className="f-group">
              <label className="f-label">Due date</label>
              <input type="date" className="f-input" value={form.dueDate} onChange={set("dueDate")} />
            </div>
            <div className="f-group">
              <label className="f-label">Tags</label>
              <input
                className="f-input"
                value={form.tags}
                onChange={set("tags")}
                placeholder="api, frontend, bug"
              />
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? "Saving…" : task ? "Save changes" : "Create task"}
          </button>
        </div>
      </div>
    </div>
  );
}
