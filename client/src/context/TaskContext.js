import React, { createContext, useContext, useReducer, useCallback } from "react";
import { taskApi } from "../utils/api";
import toast from "react-hot-toast";

const TaskContext = createContext(null);

const init = {
  tasks: [],
  summary: { total: 0, todo: 0, inProgress: 0, done: 0 },
  loading: false,
  error: null,
  filters: { status: "all", priority: "all", sort: "-createdAt", search: "" },
  activity: [], // local activity log
};

function reducer(state, { type, payload }) {
  switch (type) {
    case "LOADING": return { ...state, loading: true, error: null };
    case "ERROR":   return { ...state, loading: false, error: payload };
    case "SET_TASKS": return { ...state, loading: false, tasks: payload.tasks, summary: payload.summary };
    case "ADD_TASK":
      return {
        ...state,
        tasks: [payload, ...state.tasks],
        activity: [{ type: "create", task: payload, time: new Date() }, ...state.activity].slice(0, 50),
      };
    case "UPD_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t._id === payload._id ? payload : t)),
        activity: [{ type: "update", task: payload, time: new Date() }, ...state.activity].slice(0, 50),
      };
    case "DEL_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((t) => t._id !== payload.id),
        activity: [{ type: "delete", task: payload.task, time: new Date() }, ...state.activity].slice(0, 50),
      };
    case "FILTERS": return { ...state, filters: { ...state.filters, ...payload } };
    default: return state;
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init);

  const fetchTasks = useCallback(async (params = {}) => {
    dispatch({ type: "LOADING" });
    try {
      const { data } = await taskApi.getAll(params);
      dispatch({ type: "SET_TASKS", payload: data });
    } catch (e) {
      dispatch({ type: "ERROR", payload: e.message });
      toast.error(e.message);
    }
  }, []);

  const createTask = useCallback(async (data) => {
    const toastId = toast.loading("Creating task…");
    try {
      const res = await taskApi.create(data);
      dispatch({ type: "ADD_TASK", payload: res.data });
      toast.success("Task created!", { id: toastId });
      return res.data;
    } catch (e) {
      toast.error(e.message, { id: toastId });
      throw e;
    }
  }, []);

  const updateTask = useCallback(async (id, data) => {
    try {
      const res = await taskApi.update(id, data);
      dispatch({ type: "UPD_TASK", payload: res.data });
      toast.success("Task updated");
      return res.data;
    } catch (e) {
      toast.error(e.message);
      throw e;
    }
  }, []);

  const updateStatus = useCallback(async (id, status) => {
    try {
      const res = await taskApi.updateStatus(id, status);
      dispatch({ type: "UPD_TASK", payload: res.data });
      const label = status === "done" ? "✓ Marked done" : status === "in-progress" ? "Started!" : "Moved to To Do";
      toast.success(label);
    } catch (e) {
      toast.error(e.message);
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    const task = state.tasks.find((t) => t._id === id);
    try {
      await taskApi.remove(id);
      dispatch({ type: "DEL_TASK", payload: { id, task } });
      toast.success("Task deleted");
    } catch (e) {
      toast.error(e.message);
    }
  }, [state.tasks]);

  const bulkDelete = useCallback(async (ids) => {
    const toastId = toast.loading(`Deleting ${ids.length} tasks…`);
    try {
      await Promise.all(ids.map((id) => taskApi.remove(id)));
      ids.forEach((id) => dispatch({ type: "DEL_TASK", payload: { id, task: state.tasks.find((t) => t._id === id) } }));
      toast.success(`Deleted ${ids.length} tasks`, { id: toastId });
    } catch (e) {
      toast.error(e.message, { id: toastId });
    }
  }, [state.tasks]);

  const bulkStatus = useCallback(async (ids, status) => {
    const toastId = toast.loading(`Updating ${ids.length} tasks…`);
    try {
      const results = await Promise.all(ids.map((id) => taskApi.updateStatus(id, status)));
      results.forEach((res) => dispatch({ type: "UPD_TASK", payload: res.data }));
      toast.success(`Updated ${ids.length} tasks`, { id: toastId });
    } catch (e) {
      toast.error(e.message, { id: toastId });
    }
  }, []);

  const setFilters = useCallback((f) => dispatch({ type: "FILTERS", payload: f }), []);

  return (
    <TaskContext.Provider value={{
      ...state, fetchTasks, createTask, updateTask,
      updateStatus, deleteTask, bulkDelete, bulkStatus, setFilters,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used inside TaskProvider");
  return ctx;
};
