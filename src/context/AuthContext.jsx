
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authType, setAuthType] = useState(null); // "staff" | "student"
  const [loading, setLoading] = useState(true);

  const clearAuthState = () => {
    setUser(null);
    setRole(null);
    setAuthType(null);
    localStorage.removeItem("studentData");
    localStorage.removeItem("studentToken");
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
  };

  const loadUser = async () => {
    setLoading(true);

    try {
      const staffRes = await api.get("/auth/me");
      const staffUser = staffRes.data.data;

      setUser(staffUser);
      setRole(staffUser.role);
      setAuthType("staff");
      return;
    } catch {}

    // In AuthContext.jsx — loadUser function, student branch
try {
  const studentRes = await api.get("/students/me");
  const studentData = studentRes.data.data;

  if (!studentData) return;

  const student = normalizeStudent(studentData);

  setUser(student);
  setRole("student");
  setAuthType("student");
  return;
} catch {}

    clearAuthState();
    setLoading(false);
  };

  useEffect(() => {
    loadUser().finally(() => setLoading(false));
  }, []);

  const login = async (userId, password) => {
    try {
      const res = await api.post("/auth/login", {
        userId,
        password,
      });

      const staffUser = res.data.data;

      setUser(staffUser);
      setRole(staffUser.role);
      setAuthType("staff");
      localStorage.removeItem("studentData");

      return {
        success: true,
        user: staffUser,
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  };

  const studentLogin = async (admissionNumber, password) => {
    try {
      const res = await api.post("/students/login", {
        admissionNumber,
        password,
      });

      const student = normalizeStudent(res.data.data);

      setUser(student);
      setRole("student");
      setAuthType("student");
      localStorage.setItem("studentData", JSON.stringify(student));

      return {
        success: true,
        student,
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
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