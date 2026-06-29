
// src/context/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import api from "../api/axios";

export const AuthContext = createContext(null);

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong"
  );
};

const normalizeStudent = (student) => ({
  ...student,
  _id: student.id || student._id,
  role: "student",
});

const safeGetItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Safari private mode or storage quota exceeded — fail silently
  }
};

const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // fail silently
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authType, setAuthType] = useState(null); // "staff" | "student"
  const [loading, setLoading] = useState(true);

  const clearAuthState = () => {
    setUser(null);
    setRole(null);
    setAuthType(null);
    safeRemoveItem("studentData");
    safeRemoveItem("studentToken");
    safeRemoveItem("token");
    safeRemoveItem("userData");
  };

  const loadUser = async () => {
    const staffToken = safeGetItem("token");
    const studentToken = safeGetItem("studentToken");

    // No tokens at all — clear state and exit without hitting the network
    if (!staffToken && !studentToken) {
      clearAuthState();
      return;
    }

    if (staffToken) {
      try {
        const staffRes = await api.get("/auth/me");
        const staffUser = staffRes.data.data;

        setUser(staffUser);
        setRole(staffUser.role);
        setAuthType("staff");
        safeSetItem("userData", JSON.stringify(staffUser));
        return;
      } catch (error) {
        if (error?.response?.status === 401) {
          // Token is genuinely invalid or expired — log out
          clearAuthState();
          return;
        }

        // Transient failure (network error, CORS hiccup, server timeout)
        // Restore from cached userData so the user stays logged in
        const cached = safeGetItem("userData");
        if (cached) {
          try {
            const staffUser = JSON.parse(cached);
            setUser(staffUser);
            setRole(staffUser.role);
            setAuthType("staff");
          } catch {
            // Corrupted cache — clear everything
            clearAuthState();
          }
        } else {
          // No cache to fall back on — clear
          clearAuthState();
        }
        return;
      }
    }

    if (studentToken) {
      try {
        const studentRes = await api.get("/students/me");
        const studentData = studentRes.data.data;

        if (studentData) {
          const student = normalizeStudent(studentData);
          setUser(student);
          setRole("student");
          setAuthType("student");
          safeSetItem("studentData", JSON.stringify(student));
          return;
        }

        // API returned 200 but no data — treat as logged out
        clearAuthState();
      } catch (error) {
        if (error?.response?.status === 401) {
          clearAuthState();
          return;
        }

        // Transient failure — restore from cached studentData
        const cached = safeGetItem("studentData");
        if (cached) {
          try {
            const student = JSON.parse(cached);
            setUser(student);
            setRole("student");
            setAuthType("student");
          } catch {
            clearAuthState();
          }
        } else {
          clearAuthState();
        }
        return;
      }
    }
  };

  useEffect(() => {
    loadUser().finally(() => setLoading(false));
  }, []);

  const login = async (userId, password) => {
    try {
      const res = await api.post("/auth/login", { userId, password });

      console.log("STAFF LOGIN RESPONSE:", res.data);

      const staffUser = res.data.data;

      const token =
        res.data.token ||
        res.data.accessToken ||
        res.data.staffToken ||
        res.data.data?.token;

      if (!token) {
        return {
          success: false,
          error: "Login successful, but no token was returned from backend.",
        };
      }

      safeSetItem("token", token);
      safeSetItem("userData", JSON.stringify(staffUser));
      safeRemoveItem("studentToken");
      safeRemoveItem("studentData");

      setUser(staffUser);
      setRole(staffUser.role);
      setAuthType("staff");

      return { success: true, user: staffUser };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const studentLogin = async (admissionNumber, password) => {
    try {
      const res = await api.post("/students/login", {
        admissionNumber,
        password,
      });

      const student = normalizeStudent(res.data.data);
      const token = res.data.studentToken;

      if (!token) {
        return {
          success: false,
          error: "Login successful, but no token was returned from backend.",
        };
      }

      safeSetItem("studentToken", token);
      safeSetItem("studentData", JSON.stringify(student));
      safeRemoveItem("token");
      safeRemoveItem("userData");

      setUser(student);
      setRole("student");
      setAuthType("student");

      return { success: true, student };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const logout = async () => {
    try {
      if (authType === "student") {
        await api.post("/students/logout");
      } else {
        await api.post("/auth/logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthState();
    }
  };

  const logoutAll = async () => {
    try {
      await api.post("/auth/logout-all");
    } catch (error) {
      console.error("Logout all error:", error);
    } finally {
      clearAuthState();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        authType,
        loading,
        login,
        studentLogin,
        logout,
        logoutAll,
        refreshUser: loadUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};