

// // src/api/axios.js
// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
//   withCredentials: true,
// });

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !originalRequest.url.includes("/auth/login") &&
//       !originalRequest.url.includes("/auth/refresh")
//     ) {
//       originalRequest._retry = true;

//       try {
//         await api.post("/auth/refresh");
//         return api(originalRequest);
//       } catch {
//         return Promise.reject(error);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;

// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api", "https://moonlight-api-2-69oh.onrender.com",
  withCredentials: true,
});


// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (!originalRequest) {
//       return Promise.reject(error);
//     }

//     const isLoginRequest =
//       originalRequest.url?.includes("/auth/login") ||
//       originalRequest.url?.includes("/students/login");

//     const isRefreshRequest =
//       originalRequest.url?.includes("/auth/refresh") ||
//       originalRequest.url?.includes("/students/refresh");

//     const isStudentRequest =
//       originalRequest.url?.includes("/students") ||
//       originalRequest.url?.includes("/attendance/student") ||
//       originalRequest.url?.includes("/results/student") ||
//       originalRequest.url?.includes("/fees/accounts/report-fee-info");

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !isLoginRequest &&
//       !isRefreshRequest
//     ) {
//       originalRequest._retry = true;

//       try {
//         if (isStudentRequest) {
//           // No student refresh endpoint currently.
//           // Just reject instead of calling /auth/refresh.
//           return Promise.reject(error);
//         }

//         await api.post("/auth/refresh");
//         return api(originalRequest);
//       } catch {
//         return Promise.reject(error);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

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