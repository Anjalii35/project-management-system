import api from "../api";

export const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const token = response.data;
    localStorage.setItem("token", token);

    // Fetch all users and find current user by email to get id and role
    const usersRes = await api.get("/users?pageNo=0&pageSize=200");
    const currentUser = usersRes.data.find((u) => u.email === email);
    if (currentUser) {
        localStorage.setItem("userId", currentUser.id);
        localStorage.setItem("userRole", currentUser.role);
        localStorage.setItem("userName", currentUser.name);
    }

    return token;
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    window.location.href = "/landing";
};

export const isLoggedIn = () => !!localStorage.getItem("token");