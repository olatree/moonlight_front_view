import api from "../api/axios";

export const getStudentEnrollment = async (studentId) => {
  const res = await api.get("/students", {
    params: { studentId },
  });

  return res.data.data || [];
};

export const getSessions = async () => {
  const res = await api.get("/sessions");
  return res.data.data || res.data || [];
};

export const getClassTeacher = async (classId, armId) => {
  const res = await api.get(`/class-teachers/${classId}/${armId}`);
  return res.data.data || res.data.teacher || null;
};

export const getPrincipals = async () => {
  const res = await api.get("/principals");
  const data = res.data.data || res.data;
  return Array.isArray(data) ? data[0] : data;
};

export const getClassSize = async ({ classId, armId, sessionId, termId }) => {
  const res = await api.get("/students/class-count", {
    params: { classId, armId, sessionId, termId },
  });

  return res.data.count || 0;
};

export const getStudentTermResult = async ({ studentId, sessionId, termId }) => {
  const res = await api.get("/results/student-term", {
    params: {
      userId: studentId,
      sessionId,
      termId,
    },
  });

  return res.data;
};

export const getStudentAttendance = async ({ studentId, sessionId, termId }) => {
  const res = await api.get("/attendance/student", {
    params: { studentId, sessionId, termId },
  });

  return res.data;
};