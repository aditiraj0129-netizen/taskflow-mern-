import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.errors?.join(", ") ||
      err.response?.data?.message ||
      err.message ||
      "Something went wrong";
    return Promise.reject(new Error(msg));
  }
);

export const taskApi = {
  getAll:       (params) => api.get("/tasks", { params }),
  getOne:       (id)     => api.get(`/tasks/${id}`),
  create:       (data)   => api.post("/tasks", data),
  update:       (id, d)  => api.put(`/tasks/${id}`, d),
  updateStatus: (id, s)  => api.patch(`/tasks/${id}/status`, { status: s }),
  remove:       (id)     => api.delete(`/tasks/${id}`),
  bulkDelete:   (ids)    => api.post("/tasks/bulk-delete", { ids }),
};
