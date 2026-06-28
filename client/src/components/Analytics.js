import React from "react";
import { useTasks } from "../context/TaskContext";
import { format, isPast, isToday } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";

function CompletionRing({ pct }) {
  const r = 45;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="completion-ring-wrap">
      <div className="completion-ring">
        <svg className="cr-svg" width="120" height="120" viewBox="0 0 120 120">
          <circle className="cr-bg"   cx="60" cy="60" r={r} />
          <circle
            className="cr-fill"
            cx="60" cy="60" r={r}
            style={{ strokeDashoffset: offset }}
          />
        </svg>
        <div className="cr-label">
          <span className="cr-pct">{pct}%</span>
          <span className="cr-text">done</span>
        </div>
      </div>
    </div>
  );
}

const CHART_COLORS = { high: "#f43f5e", medium: "#f97316", low: "#84cc16" };
const STATUS_COLORS = { todo: "#64748b", "in-progress": "#f59e0b", done: "#10b981" };

const TooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "#f1f5f9",
  fontSize: "12px",
};

export default function Analytics() {
  const { tasks, activity } = useTasks();

  const total     = tasks.length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const pct       = total ? Math.round((doneCount / total) * 100) : 0;

  const byPriority = ["high", "medium", "low"].map((p) => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    count: tasks.filter((t) => t.priority === p).length,
    pct: total ? Math.round((tasks.filter((t) => t.priority === p).length / total) * 100) : 0,
    color: CHART_COLORS[p],
  }));

  const byStatus = ["todo", "in-progress", "done"].map((s) => ({
    name: s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1),
    value: tasks.filter((t) => t.status === s).length,
    color: STATUS_COLORS[s],
  }));

  const overdue = tasks.filter(
    (t) => t.status !== "done" && t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))
  );

  // Tasks created per day over last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = format(d, "MMM d");
    return {
      day: key,
      tasks: tasks.filter((t) => format(new Date(t.createdAt), "MMM d") === key).length,
    };
  });

  return (
    <div>
      <div className="analytics-grid">
        {/* Completion ring */}
        <div className="analytics-card">
          <h3>Completion Rate</h3>
          <CompletionRing pct={pct} />
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--t3)", marginTop: 8 }}>
            {doneCount} of {total} tasks completed
          </p>
        </div>

        {/* Status breakdown */}
        <div className="analytics-card">
          <h3>By Status</h3>
          {total === 0 ? (
            <p style={{ color: "var(--t3)", fontSize: 13, marginTop: 16 }}>No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={byStatus}
                  cx="50%" cy="50%"
                  innerRadius={40} outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {byStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Created last 7 days */}
        <div className="analytics-card full-width">
          <h3>Tasks Created — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={last7} barSize={28}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="tasks" radius={[6, 6, 0, 0]}>
                {last7.map((_, i) => (
                  <Cell key={i} fill={i === 6 ? "#00d4aa" : "#1e2433"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority breakdown */}
        <div className="analytics-card">
          <h3>By Priority</h3>
          <div className="priority-breakdown">
            {byPriority.map(({ name, count, pct, color }) => (
              <div className="pb-row" key={name}>
                <div className="pb-row-head">
                  <span className="pb-label" style={{ color }}>{name}</span>
                  <span className="pb-val">{count} ({pct}%)</span>
                </div>
                <div className="pb-track">
                  <div className="pb-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            ))}
            {total === 0 && <p style={{ color: "var(--t3)", fontSize: 13 }}>No tasks yet</p>}
          </div>
        </div>

        {/* Overdue */}
        <div className="analytics-card">
          <h3>Overdue Tasks {overdue.length > 0 && <span style={{ color: "var(--hi-c)" }}>({overdue.length})</span>}</h3>
          {overdue.length === 0 ? (
            <p style={{ color: "var(--t3)", fontSize: 13, marginTop: 8 }}>🎉 No overdue tasks!</p>
          ) : (
            <div className="overdue-list">
              {overdue.slice(0, 5).map((t) => (
                <div className="overdue-item" key={t._id}>
                  <span className="overdue-title">{t.title}</span>
                  <span className="overdue-date">{format(new Date(t.dueDate), "MMM d")}</span>
                </div>
              ))}
              {overdue.length > 5 && (
                <p style={{ fontSize: 12, color: "var(--t3)", textAlign: "center" }}>+{overdue.length - 5} more</p>
              )}
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="analytics-card full-width">
          <h3>Recent Activity</h3>
          {activity.length === 0 ? (
            <p style={{ color: "var(--t3)", fontSize: 13 }}>No activity yet — start by creating a task!</p>
          ) : (
            <div className="activity-feed">
              {activity.slice(0, 12).map((a, i) => (
                <div className="activity-item" key={i}>
                  <div className={`activity-dot act-${a.type === "create" ? "create" : a.type === "delete" ? "delete" : a.task?.status === "done" ? "done" : "update"}`} />
                  <span className="activity-text">
                    {a.type === "create" && <><strong>Created</strong> "{a.task?.title}"</>}
                    {a.type === "update" && <><strong>Updated</strong> "{a.task?.title}" → {a.task?.status}</>}
                    {a.type === "delete" && <><strong>Deleted</strong> "{a.task?.title}"</>}
                  </span>
                  <span className="activity-time">{format(new Date(a.time), "HH:mm")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
