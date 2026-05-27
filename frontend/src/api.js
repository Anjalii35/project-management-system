import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
    baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();
            if (isExpired) {
                localStorage.clear();
                toast.error("Your session has expired. Please login again.");
                setTimeout(() => { window.location.href = "/login"; }, 1500);
                return Promise.reject("Token expired");
            }
        } catch (e) {}
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            toast.error("Session expired. Please login again.");
            setTimeout(() => { window.location.href = "/login"; }, 1500);
        }
        return Promise.reject(error);
    }
);

export default api;