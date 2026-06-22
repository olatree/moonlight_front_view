import { useEffect, useState } from "react";
import {
  getClassSize,
  getClassTeacher,
  getPrincipals,
  getSessions,
  getStudentAttendance,
  getStudentEnrollment,
  getStudentTermResult,
} from "../services/studentResultService";
import { isThirdTerm } from "../utils/resultCalculations";

export const useStudentResult = (user) => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [sessions, setSessions] = useState([]);

  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);

  const [sessionId, setSessionId] = useState("");
  const [termId, setTermId] = useState("");

  const [classTeacher, setClassTeacher] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [classSize, setClassSize] = useState(0);

  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [fetchingResult, setFetchingResult] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      if (!user?._id) return;

      try {
        setPageLoading(true);
        setError("");

        const [enrollments, sessionList, principalData] = await Promise.all([
          getStudentEnrollment(user._id),
          getSessions(),
          getPrincipals(),
        ]);

        if (!enrollments.length) {
          setError("Student enrollment record not found.");
          return;
        }

        setStudentInfo(enrollments[0]);
        setSessions(sessionList);
        setPrincipal(principalData || { name: "N/A" });
      } catch (err) {
        setError("Could not load student result page data.");
      } finally {
        setPageLoading(false);
      }
    };

    bootstrap();
  }, [user]);

  useEffect(() => {
    const loadClassTeacher = async () => {
      if (!studentInfo?.classId?._id || !studentInfo?.armId?._id) return;

      try {
        const teacher = await getClassTeacher(
          studentInfo.classId._id,
          studentInfo.armId._id
        );

        setClassTeacher(teacher || { name: "N/A" });
      } catch {
        setClassTeacher({ name: "N/A" });
      }
    };

    loadClassTeacher();
  }, [studentInfo]);

  useEffect(() => {
    const loadClassSize = async () => {
      if (!studentInfo?.classId?._id || !studentInfo?.armId?._id) return;
      if (!sessionId || !termId) return;

      try {
        const count = await getClassSize({
          classId: studentInfo.classId._id,
          armId: studentInfo.armId._id,
          sessionId,
          termId,
        });

        setClassSize(count);
      } catch {
        setClassSize(0);
      }
    };

    loadClassSize();
  }, [studentInfo, sessionId, termId]);

  const handleSessionChange = (e) => {
    const selected = sessions.find((session) => session._id === e.target.value);

    setSelectedSession(selected || null);
    setSelectedTerm(null);
    setSessionId(selected?._id || "");
    setTermId("");
    setError("");
  };

  const handleTermChange = (e) => {
    const selected = selectedSession?.terms.find(
      (term) => term._id === e.target.value
    );

    setSelectedTerm(selected || null);
    setTermId(selected?._id || "");
    setError("");
  };

  const fetchAllTermResults = async () => {
    const terms = selectedSession?.terms || [];
    const resultsByTerm = {};

    for (const term of terms) {
      const response = await getStudentTermResult({
        studentId: user._id,
        sessionId,
        termId: term._id,
      });

      if (response.success) {
        resultsByTerm[term._id] = {
          termName: term.name,
          results: response.results || [],
          termAverage: response.termAverage || 0,
          comments: response.comments || {},
        };
      }
    }

    return resultsByTerm;
  };

  const fetchResultData = async () => {
    if (!sessionId || !termId) {
      setError("Please select both Session and Term.");
      return null;
    }

    if (!studentInfo) {
      setError("Student information not loaded.");
      return null;
    }

    try {
      setFetchingResult(true);
      setError("");

      const thirdTermSelected = isThirdTerm(selectedTerm?.name);

      const allTermResults = thirdTermSelected
        ? await fetchAllTermResults()
        : {};

      const [resultResponse, attendanceResponse] = await Promise.all([
        getStudentTermResult({
          studentId: user._id,
          sessionId,
          termId,
        }),
        getStudentAttendance({
          studentId: user._id,
          sessionId,
          termId,
        }),
      ]);

      if (!resultResponse.success) {
        setError(
          resultResponse.message ||
            "No results found for selected session and term."
        );
        return null;
      }

      return {
        student: studentInfo,
        results: resultResponse.results || [],
        termAverage: resultResponse.termAverage || 0,
        session: selectedSession?.name || "",
        term: selectedTerm?.name || "",
        comments: {
          classTeacher: resultResponse.comments?.classTeacher || "N/A",
          principal: resultResponse.comments?.principal || "N/A",
        },
        attendance: attendanceResponse.records || [],
        classTeacher: classTeacher || { name: "N/A" },
        principal: principal || { name: "N/A" },
        classSize,
        allTermResults,
        isThirdTerm: thirdTermSelected,
      };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch result data.");
      return null;
    } finally {
      setFetchingResult(false);
    }
  };

  return {
    studentInfo,
    sessions,
    selectedSession,
    selectedTerm,
    sessionId,
    termId,
    classTeacher,
    principal,
    classSize,
    error,
    pageLoading,
    fetchingResult,
    setError,
    handleSessionChange,
    handleTermChange,
    fetchResultData,
  };
};