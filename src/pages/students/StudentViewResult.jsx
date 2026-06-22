

// src/pages/student/StudentViewResult.jsx
import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import api from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import PrintableResult from "../../components/student-results/printableResult";
import { getApiData } from "../../utils/resultUtils";

export default function StudentViewResult() {
  const { user } = useAuth();

  const printRef = useRef(null);
  const studentId = user?._id || user?.id;

  const [studentInfo, setStudentInfo] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);

  const [classSize, setClassSize] = useState(0);
  const [classTeacher, setClassTeacher] = useState(null);
  const [principal, setPrincipal] = useState(null);

  const [feeInfo, setFeeInfo] = useState({
  currentBalance: 0,
  nextTermFee: 0,
});

  const [reportData, setReportData] = useState(null);

  const [loadingStudent, setLoadingStudent] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState("");

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${studentInfo?.studentId?.name || "Student"} Result`,
  });

  const isThirdTerm = (term) => {
    const name = term?.name?.toLowerCase() || "";
    return name.includes("third") || name.includes("3");
  };

  // useEffect(() => {
  //   const fetchStudentInfo = async () => {
  //     if (!user?._id) return;

  //     try {
  //       setLoadingStudent(true);
  //       setError("");

  //       const res = await api.get("/students", {
  //         params: { studentId: studentId },
  //       });

  //       const payload = getApiData(res);
  //       const enrollments = Array.isArray(payload) ? payload : [];

  //       if (enrollments.length > 0) {
  //         setStudentInfo(enrollments[0]);
  //       } else {
  //         setError("Student enrollment record not found.");
  //       }
  //     } catch (err) {
  //       console.error("Error fetching student info:", err);
  //       setError("Could not load student information. Please contact admin.");
  //     } finally {
  //       setLoadingStudent(false);
  //     }
  //   };

  //   fetchStudentInfo();
  // }, [user]);


useEffect(() => {
  const fetchStudentInfo = async () => {
    if (!studentId) return;

    try {
      setLoadingStudent(true);
      setError("");

      // 1. Get active session/term
      const activeRes = await api.get("/sessions/active");
      const activePayload = getApiData(activeRes) || activeRes.data;

      const activeSession =
        activePayload?.session || activePayload?.activeSession || null;

      if (!activeSession?._id) {
        setError("Active academic session not found.");
        return;
      }

      // 2. Store active session as selected session
      // setSelectedSession(activeSession);

      // 3. Fetch student's enrollment for active session
      const studentRes = await api.get("/students", {
        params: {
          studentId,
          sessionId: activeSession._id,
        },
      });

      const payload = getApiData(studentRes);
      const enrollments = Array.isArray(payload) ? payload : [];

      if (enrollments.length > 0) {
        setStudentInfo(enrollments[0]);
      } else {
        setError("Student enrollment record not found for active session.");
      }
    } catch (err) {
      console.error("Error fetching student info:", err);
      setError("Could not load student information. Please contact admin.");
    } finally {
      setLoadingStudent(false);
    }
  };

  fetchStudentInfo();
}, [studentId]);


  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get("/sessions");
        const payload = getApiData(res);
        setSessions(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError("Could not load academic sessions.");
      }
    };

    fetchSessions();
  }, []);

  useEffect(() => {
    const fetchClassTeacher = async () => {
      if (!studentInfo?.classId?._id || !studentInfo?.armId?._id) return;

      try {
        const res = await api.get(
          `/class-teachers/${studentInfo.classId._id}/${studentInfo.armId._id}`
        );

        const payload = getApiData(res);
        setClassTeacher(payload?.teacher || res.data?.teacher || payload || null);
      } catch (err) {
        console.error("Error fetching class teacher:", err);
        setClassTeacher({ name: "N/A" });
      }
    };

    fetchClassTeacher();
  }, [studentInfo]);

  useEffect(() => {
    const fetchPrincipal = async () => {
      try {
        const res = await api.get("/principals");
        
        const payload = getApiData(res);

        const principalData = Array.isArray(payload) ? payload[0] : payload;
        
        setPrincipal(principalData || { name: "N/A" });
      } catch (err) {
        console.error("Error fetching principal:", err);
        setPrincipal({ name: "N/A" });
      }
    };

    fetchPrincipal();
  }, []);

  useEffect(() => {
    const fetchClassSize = async () => {
      if (
        !studentInfo?.classId?._id ||
        !studentInfo?.armId?._id ||
        !selectedSession?._id
      ) {
        setClassSize(0);
        return;
      }

      try {
        const res = await api.get("/students", {
          params: {
            classId: studentInfo.classId._id,
            armId: studentInfo.armId._id,
            sessionId: selectedSession._id,
          },
        });

        const payload = getApiData(res);
        setClassSize(Array.isArray(payload) ? payload.length : 0);
        
      } catch (err) {
        console.error("Error fetching class size:", err);
        setClassSize(0);
      }
    };

    fetchClassSize();
  }, [studentInfo, selectedSession]);

  const handleSessionChange = (e) => {
    const session = sessions.find((item) => item._id === e.target.value);

    setSelectedSession(session || null);
    setSelectedTerm(null);
    setReportData(null);
    setError("");
  };
  

  const handleTermChange = (e) => {
    const term = selectedSession?.terms?.find(
      (item) => item._id === e.target.value
    );

    setSelectedTerm(term || null);
    setReportData(null);
    setError("");
  };

  const fetchAllTermResults = async () => {
    if (!selectedSession || !user?._id) return {};

    const terms = selectedSession.terms || [];

    const requests = terms.map((term) =>
      api
        .get("/results/student-term", {
          params: {
            userId: studentId,
            sessionId: selectedSession._id,
            termId: term._id,
          },
        })
        .then((res) => ({ term, res }))
        .catch(() => null)
    );

    const responses = await Promise.all(requests);

    const resultsByTerm = {};

    responses.forEach((item) => {
      if (!item) return;

      const payload = getApiData(item.res) || item.res?.data;

      if (payload?.success || payload?.results) {
        resultsByTerm[item.term._id] = {
          termName: item.term.name,
          results: payload.results || [],
          termAverage: payload.termAverage || 0,
          comments: payload.comments || {},
        };
      }
    });

    return resultsByTerm;
  };

  const getNextTermContext = () => {
  if (!selectedSession || !selectedTerm) return null;

  const terms = selectedSession.terms || [];
  const currentIndex = terms.findIndex((t) => t._id === selectedTerm._id);

  if (currentIndex === -1) return null;

  const nextTerm = terms[currentIndex + 1];

  if (nextTerm) {
    return {
      sessionId: selectedSession._id,
      termId: nextTerm._id,
    };
  }

  // If current term is 3rd Term, find next session's 1st Term
  const currentSessionIndex = sessions.findIndex(
    (s) => s._id === selectedSession._id
  );

  const nextSession = sessions[currentSessionIndex + 1];

  if (!nextSession) return null;

  const firstTerm = nextSession.terms?.find(
    (t) => t.name === "1st Term" || t.name?.toLowerCase().includes("1")
  );

  if (!firstTerm) return null;

  return {
    sessionId: nextSession._id,
    termId: firstTerm._id,
  };
};

// const fetchFeeInfo = async () => {
//   try {
//     if (!studentInfo?.studentId?._id || !selectedSession?._id || !selectedTerm?._id) {
//       return {
//         currentBalance: 0,
//         nextTermFee: 0,
//       };
//     }

//     let currentBalance = 0;
//     let nextTermFee = 0;

//     try {
//       const currentFeeRes = await api.get("/fees/accounts/student", {
//         params: {
//           studentId: studentInfo.studentId._id,
//           sessionId: selectedSession._id,
//           termId: selectedTerm._id,
//         },
//       });

//       const currentFeeAccount = currentFeeRes.data.data;

//       currentBalance = Number(currentFeeAccount?.totalDue || 0);
//     } catch {
//       currentBalance = 0;
//     }

//     const nextContext = getNextTermContext();

//     if (nextContext) {
//       try {
//         const nextFeeRes = await api.get("/fees/accounts/student", {
//           params: {
//             studentId: studentInfo.studentId._id,
//             sessionId: nextContext.sessionId,
//             termId: nextContext.termId,
//           },
//         });

//         const nextFeeAccount = nextFeeRes.data.data;

//         nextTermFee = Number(nextFeeAccount?.netPayable || 0);
//       } catch {
//         nextTermFee = 0;
//       }
//     }

//     return {
//       currentBalance,
//       nextTermFee,
//     };
//   } catch {
//     return {
//       currentBalance: 0,
//       nextTermFee: 0,
//     };
//   }
// };

const fetchFeeInfo = async () => {
  try {
    if (
      !studentInfo?.studentId?._id ||
      !selectedSession?._id ||
      !selectedTerm?._id ||
      !studentInfo?.classId?._id
    ) {
      return {
        currentBalance: 0,
        nextTermFee: 0,
      };
    }

    const nextContext = getNextTermContext();

    const feeRes = await api.get("/fees/accounts/report-fee-info", {
      params: {
        studentId: studentInfo.studentId._id,
        sessionId: selectedSession._id,
        termId: selectedTerm._id,
        classId: studentInfo.classId._id,
        armId: studentInfo.armId?._id || "",

        nextSessionId: nextContext?.sessionId || "",
        nextTermId: nextContext?.termId || "",
      },
    });

    return {
      currentBalance: Number(feeRes.data?.data?.currentBalance || 0),
      nextTermFee: Number(feeRes.data?.data?.nextTermFee || 0),
    };
  } catch (err) {
    console.error("Fee info error:", err);

    return {
      currentBalance: 0,
      nextTermFee: 0,
    };
  }
};  

const fetchResult = async () => {
    if (!selectedSession || !selectedTerm) {
      setError("Please select both session and term.");
      return;
    }

    if (!studentInfo || !user?._id) {
      setError("Student information not loaded.");
      return;
    }

    try {
      setLoadingReport(true);
      setError("");
      setReportData(null);

      const shouldFetchAllTerms = isThirdTerm(selectedTerm);

      const allTermResults = shouldFetchAllTerms
        ? await fetchAllTermResults()
        : {};

      const [resultRes, attendanceRes] = await Promise.all([
        api.get("/results/student-term", {
          params: {
            userId: studentId,
            sessionId: selectedSession._id,
            termId: selectedTerm._id,
          },
        }),
        api.get("/attendance/student/me", {
          params: {
            // studentId: studentId,
            sessionId: selectedSession._id,
            termId: selectedTerm._id,
          },
        }),
      ]);

      const resultPayload = getApiData(resultRes) || resultRes.data;
      const attendancePayload = getApiData(attendanceRes) || attendanceRes.data;
      

      if (!resultPayload?.success && !resultPayload?.results) {
        setError(
          resultPayload?.message || "No results found for selected session and term."
        );
        return;
      }

      const results = resultPayload.results || [];

      const calculatedAverage =
        results.length > 0
          ? results.reduce((sum, r) => sum + Number(r.total || 0), 0) / results.length
          : 0;

          const feeDetails = await fetchFeeInfo();
          setFeeInfo(feeDetails);

      setReportData({
        student: studentInfo,
        results: resultPayload.results || [],
        // termAverage: resultPayload.termAverage || 0,
        termAverage: resultPayload.termAverage || calculatedAverage,
        session: selectedSession.name,
        term: selectedTerm.name,
        comments: {
          classTeacher: resultPayload.comments?.classTeacher || "N/A",
          principal: resultPayload.comments?.principal || "N/A",
        },
        attendance: attendancePayload?.records || [],
        classTeacher: classTeacher || { name: "N/A" },
        principal: principal || { name: "N/A" },
        classSize,
        allTermResults,
        isThirdTerm: shouldFetchAllTerms,
        feeInfo: feeDetails,
      });
    } catch (err) {
      console.error("Error fetching result:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to fetch result. Please try again."
      );
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-3 py-4 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-4 shadow-lg sm:p-6">
        <h2 className="mb-4 text-center text-xl font-bold text-green-700 sm:text-2xl">
          View Term Result
        </h2>

        {loadingStudent ? (
          <p className="text-center text-gray-500">Loading student info...</p>
        ) : studentInfo ? (
          <>
            <div className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-gray-700">
              <p>
                <strong>Name:</strong> {studentInfo.studentId?.name}
              </p>
              <p>
                <strong>Class:</strong> {studentInfo.classId?.name} -{" "}
                {studentInfo.armId?.name}
              </p>
              <p>
                <strong>Admission No:</strong>{" "}
                {studentInfo.studentId?.admissionNumber}
              </p>
              {classTeacher && (
                <p>
                  <strong>Class Teacher:</strong> {classTeacher.name}
                </p>
              )}
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Session
                </label>
                <select
                  onChange={handleSessionChange}
                  value={selectedSession?._id || ""}
                  className="w-full rounded-lg border p-2"
                >
                  <option value="">Select Session</option>
                  {sessions.map((session) => (
                    <option key={session._id} value={session._id}>
                      {session.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Term</label>
                <select
                  onChange={handleTermChange}
                  value={selectedTerm?._id || ""}
                  disabled={!selectedSession}
                  className="w-full rounded-lg border p-2 disabled:bg-gray-100"
                >
                  <option value="">Select Term</option>
                  {(selectedSession?.terms || []).map((term) => (
                    <option key={term._id} value={term._id}>
                      {term.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={fetchResult}
              disabled={loadingReport || !selectedSession || !selectedTerm}
              className="w-full rounded-lg bg-green-600 py-2 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
            >
              {loadingReport ? "Loading Result..." : "Fetch Result"}
            </button>

            {reportData && (
              <button
                onClick={handlePrint}
                className="mt-3 w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700"
              >
                Print Result
              </button>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500">
            Student enrollment record not found.
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 py-2 text-center text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {reportData && (
        <div className="mt-6 overflow-x-auto">
          <div ref={printRef}>
            <PrintableResult {...reportData} />
          </div>
        </div>
      )}
    </div>
  );
}