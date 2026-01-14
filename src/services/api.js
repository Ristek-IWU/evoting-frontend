import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

// 🔐 Ambil token USER atau ADMIN otomatis
API.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("token");

    const token = adminToken || userToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
