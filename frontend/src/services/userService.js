import api from "../api";

// Get all users (paginated)
export const getAllUsers = (pageNo = 0, pageSize = 5) =>
  api.get(`/users?pageNo=${pageNo}&pageSize=${pageSize}`);

// Get single user
export const getUserById = (id) =>
  api.get(`/users/${id}`);

// Get user image URL (use directly in <img src={...} />)
export const getUserImageUrl = (id) =>
  `http://localhost:8080/users/${id}/image`;

// Create user (with image)
export const createUser = (userRequest, imageFile) => {
  const formData = new FormData();
  formData.append("userRequest", new Blob([JSON.stringify(userRequest)], { type: "application/json" }));
  formData.append("imageFile", imageFile);
  return api.post("/users", formData);
};

// Update user (with optional image)
export const updateUser = (id, userRequest, imageFile) => {
  const formData = new FormData();
  formData.append("userRequest", new Blob([JSON.stringify(userRequest)], { type: "application/json" }));
  if (imageFile) formData.append("imageFile", imageFile);
  return api.put(`/users/${id}`, formData);
};

// Delete user
export const deleteUser = (id) =>
  api.delete(`/users/${id}`);

// Search users by name
export const searchUsers = (name, pageNo = 0, pageSize = 5) =>
  api.get(`/users/search?name=${name}&pageNo=${pageNo}&pageSize=${pageSize}`);