import api from "../api";

// Get all projects (paginated)
export const getAllProjects = (pageNo = 0, pageSize = 5) =>
  api.get(`/projects?pageNo=${pageNo}&pageSize=${pageSize}`);

// Get single project
export const getProjectById = (id) =>
  api.get(`/projects/${id}`);

// Get project image URL (use directly in <img src={...} />)
export const getProjectImageUrl = (id) =>
  `http://localhost:8080/projects/${id}/image`;

// Create project (with image)
export const createProject = (projectRequest, imageFile) => {
  const formData = new FormData();
  formData.append("projectRequest", new Blob([JSON.stringify(projectRequest)], { type: "application/json" }));
  formData.append("imageFile", imageFile);
  return api.post("/projects", formData);
};

// Update project (with optional image)
export const updateProject = (id, projectRequest, imageFile) => {
  const formData = new FormData();
  formData.append("projectRequest", new Blob([JSON.stringify(projectRequest)], { type: "application/json" }));
  if (imageFile) formData.append("imageFile", imageFile);
  return api.put(`/projects/${id}`, formData);
};

// Delete project
export const deleteProject = (id) =>
  api.delete(`/projects/${id}`);

// Search projects by title
export const searchProjects = (title, pageNo = 0, pageSize = 5) =>
  api.get(`/projects/search?title=${title}&pageNo=${pageNo}&pageSize=${pageSize}`);

// Update project status only
export const updateProjectStatus = (id, status) =>
  api.patch(`/projects/${id}/status?status=${status}`);