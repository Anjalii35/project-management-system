import api from "../api";

export const getAllTasks = (pageNo = 0, pageSize = 5) =>
  api.get(`/tasks?pageNo=${pageNo}&pageSize=${pageSize}`);

export const getTaskById = (id) =>
  api.get(`/tasks/${id}`);

export const getTasksByProject = (projectId, pageNo = 0, pageSize = 5) =>
  api.get(`/tasks/projects/${projectId}?pageNo=${pageNo}&pageSize=${pageSize}`);

export const getTasksByUser = (userId, pageNo = 0, pageSize = 5) =>
  api.get(`/tasks/users/${userId}?pageNo=${pageNo}&pageSize=${pageSize}`);

export const createTask = (taskRequest) =>
  api.post("/tasks", taskRequest);

export const updateTask = (id, taskRequest) =>
  api.put(`/tasks/${id}`, taskRequest);

export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`);

export const updateTaskStatus = (id, status) =>
  api.patch(`/tasks/${id}/status?status=${status}`);