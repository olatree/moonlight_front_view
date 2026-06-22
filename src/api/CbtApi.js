// src/api/cbtApi.js
import api from "./axios"; // your existing axios instance

// ─── QUESTION BANK ────────────────────────────────────────────────────────────

export const getQuestions = (params = {}) =>
  api.get("/cbt/questions", { params });

export const addQuestion = (data) =>
  api.post("/cbt/questions", data);

export const updateQuestion = (id, data) =>
  api.put(`/cbt/questions/${id}`, data);

export const deleteQuestion = (id) =>
  api.delete(`/cbt/questions/${id}`);

// ─── EXAM BUILDER ─────────────────────────────────────────────────────────────

export const getExams = (params = {}) =>
  api.get("/cbt/exams", { params });

export const getExamById = (id) =>
  api.get(`/cbt/exams/${id}`);

export const createExam = (data) =>
  api.post("/cbt/exams", data);

export const updateExam = (id, data) =>
  api.put(`/cbt/exams/${id}`, data);

export const deleteExam = (id) =>
  api.delete(`/cbt/exams/${id}`);

// ─── SCHEDULING ───────────────────────────────────────────────────────────────

export const getSchedules = (params = {}) =>
  api.get("/cbt/schedules", { params });

export const createSchedule = (data) =>
  api.post("/cbt/schedules", data);

export const toggleSchedule = (id) =>
  api.patch(`/cbt/schedules/${id}/toggle`);

export const deleteSchedule = (id) =>
  api.delete(`/cbt/schedules/${id}`);

// ─── RESULTS ─────────────────────────────────────────────────────────────────

export const getExamResults = (params = {}) =>
  api.get("/cbt/results", { params });

// ─── STUDENT EXAM FLOW ────────────────────────────────────────────────────────

export const startExam = (scheduleId) =>
  api.post("/cbt/attempt/start", { scheduleId });

export const saveAnswer = (attemptId, questionId, selectedIndex) =>
  api.post("/cbt/attempt/answer", { attemptId, questionId, selectedIndex });

export const submitExam = (attemptId) =>
  api.post("/cbt/attempt/submit", { attemptId });

export const getMyResults = (params = {}) =>
  api.get("/cbt/attempt/my-results", { params });