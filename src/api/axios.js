

// src/api/axios.js
import axios from "axios";

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api", 
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});


api.interceptors.request.use((config) => {
  const staffToken = localStorage.getItem("token");
  const studentToken = localStorage.getItem("studentToken");

  const token = staffToken || studentToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }


  return config;
});

export default api;