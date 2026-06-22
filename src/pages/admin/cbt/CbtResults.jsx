

// pages/admin/cbt/CbtResults.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import * as XLSX from "xlsx";
import {
  FaDownload, FaCheckCircle, FaTimesCircle,
  FaClock, FaUsers, FaArrowLeft,
} from "react-icons/fa";

const CbtResults = () => {
  const { examId } = useParams(); // Get exam ID from URL
  const navigate = useNavigate();
  
  // ── Filter data ───────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses]   = useState([]);

  // ── Selected filters ──────────────────────────────────────────────────────
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm]       = useState("");
  const [selectedClass, setSelectedClass]     = useState("");
  const [selectedArm, setSelectedArm]         = useState("");
  const [terms, setTerms]                     = useState([]);
  const [arms, setArms]                       = useState([]);

  // ── Exams matching filters ────────────────────────────────────────────────
  const [exams, setExams]               = useState([]);
  const [selectedExam, setSelectedExam] = useState("");

  // ── Results ───────────────────────────────────────────────────────────────
  const [results, setResults]   = useState(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError]       = useState("");
  const [loadingExam, setLoadingExam] = useState(false);

  // ── Check if we're in direct exam view ────────────────────────────────────
  const isDirectExamView = !!examId;

  // ── On mount ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [sessionsRes, classesRes] = await Promise.all([
          api.get("/sessions"),
          api.get("/classes"),
        ]);
        setSessions(sessionsRes.data);
        setClasses(classesRes.data);

        // If direct exam view, load exam results directly
        if (examId) {
          await loadDirectExamResults(examId);
        } else {
          // Auto-select active session for filter view
          const active = sessionsRes.data.find((s) => s.isActive);
          if (active) {
            setSelectedSession(active._id);
            setTerms(active.terms || []);
            const activeTerm = active.terms?.find((t) => t.isActive);
            if (activeTerm) setSelectedTerm(activeTerm._id);
          }
        }
      } catch {
        setError("Failed to load filter data");
      }
    };
    init();
  }, [examId]);

  // ── Load exam results directly from exam ID ───────────────────────────────
  const loadDirectExamResults = async (id) => {
    try {
      setLoadingExam(true);
      setError("");
      
      // First, get exam details to populate filters
      const examRes = await api.get(`/cbt/exams/${id}`);
      const examData = examRes.data;
      
      // Then get results
      const resultsRes = await api.get(`/cbt/exams/${id}/results`);
      const resultsData = resultsRes.data;
      
      // Populate filters based on exam data
      if (examData.sessionId) setSelectedSession(examData.sessionId);
      if (examData.termId) setSelectedTerm(examData.termId);
      if (examData.classId) setSelectedClass(examData.classId);
      if (examData.armId) setSelectedArm(examData.armId);
      
      // Set the selected exam and results
      setSelectedExam(id);
      setResults(resultsData);
      
      // Also load the exam in the exams list for consistency
      setExams([examData]);
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load exam results");
    } finally {
      setLoadingExam(false);
    }
  };

  // ── Session changes → update terms ───────────────────────────────────────
  useEffect(() => {
    if (!selectedSession || isDirectExamView) return;
    const session = sessions.find((s) => s._id === selectedSession);
    if (session) {
      setTerms(session.terms || []);
      const activeTerm = session.terms?.find((t) => t.isActive);
      setSelectedTerm(activeTerm?._id || "");
    }
    setSelectedClass("");
    setSelectedArm("");
    setSelectedExam("");
    setExams([]);
    setResults(null);
  }, [selectedSession, isDirectExamView]);

  // ── Class changes → extract arms ─────────────────────────────────────────
  useEffect(() => {
    if (!selectedClass || isDirectExamView) { 
      setArms([]); 
      setSelectedArm(""); 
      return; 
    }
    const cls = classes.find((c) => c._id === selectedClass);
    setArms(cls?.arms ?? cls?.armsList ?? []);
    setSelectedArm("");
    setSelectedExam("");
    setExams([]);
    setResults(null);
  }, [selectedClass, isDirectExamView]);

  // ── When filters complete → load matching exams (only in filter view) ─────
  useEffect(() => {
    if (isDirectExamView) return;
    if (!selectedSession || !selectedTerm || !selectedClass) return;

    const loadExams = async () => {
      try {
        const params = new URLSearchParams({
          sessionId: selectedSession,
          termId:    selectedTerm,
          classId:   selectedClass,
          // status:    "closed", // only closed exams have results
        });
        if (selectedArm) params.append("armId", selectedArm);

        const res = await api.get(`/cbt/exams?${params}`);
        setExams(res.data);
        setSelectedExam("");
        setResults(null);
      } catch {
        setError("Failed to load exams");
      }
    };
    loadExams();
  }, [selectedSession, selectedTerm, selectedClass, selectedArm, isDirectExamView]);

  // ── Load results for selected exam (only in filter view) ──────────────────
  useEffect(() => {
    if (isDirectExamView) return;
    if (!selectedExam) return;

    const loadResults = async () => {
      try {
        setFetching(true);
        setError("");
        const res = await api.get(`/cbt/exams/${selectedExam}/results`);
        setResults(res.data);
      } catch {
        setError("Failed to load results");
      } finally {
        setFetching(false);
      }
    };
    loadResults();
  }, [selectedExam, isDirectExamView]);

  // ── Export to Excel ───────────────────────────────────────────────────────
  const exportToExcel = () => {
    if (!results) return;

    const rows = results.sessions.map((s, i) => ({
      "#":               i + 1,
      "Student Name":    s.student?.name || "—",
      "Admission No":    s.student?.admissionNumber || "—",
      "Score":           s.score ?? "—",
      "Total":           s.total ?? "—",
      "Percentage (%)":  s.percentage ?? "—",
      "Status":          s.passed ? "Passed" : "Failed",
      "Time Spent (min)": s.timeSpent ? Math.round(s.timeSpent / 60) : "—",
      "Submitted At":    s.submittedAt
        ? new Date(s.submittedAt).toLocaleString("en-NG")
        : "—",
      "Auto Submitted":  s.autoSubmitted ? "Yes" : "No",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 4 }, { wch: 25 }, { wch: 15 }, { wch: 8 },
      { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 15 },
      { wch: 20 }, { wch: 14 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CBT Results");
    XLSX.writeFile(wb, `${results.exam?.title || "results"}_cbt_results.xlsx`);
  };

  // ── Format time spent ─────────────────────────────────────────────────────
  const formatTime = (secs) => {
    if (!secs) return "—";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  // ── Go back to results list ───────────────────────────────────────────────
  const handleBack = () => {
    navigate("/admin/cbt/exams/results");
  };

  // ── Render loading state for direct exam view ────────────────────────────
  if (loadingExam) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mb-4"></div>
          <p className="text-gray-500">Loading exam results...</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      {/* Header with back button for direct view */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          {isDirectExamView && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft size={18} />
              <span>Back to Results</span>
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isDirectExamView ? "Exam Results" : "CBT Results"}
            </h1>
            {isDirectExamView && results?.exam && (
              <p className="text-sm text-gray-500 mt-1">
                {results.exam.title} — {results.exam.subject?.name}
              </p>
            )}
            {!isDirectExamView && (
              <p className="text-sm text-gray-500 mt-1">
                Filter by session, term, class and arm to view exam results
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          {isDirectExamView && (
            <button
              onClick={() => navigate("/admin/cbt/exams/results")}
              className="mt-2 text-sm text-green-600 hover:text-green-700"
            >
              ← Return to results list
            </button>
          )}
        </div>
      )}

      {/* ── Filters (hidden in direct exam view) ────────────────────────────── */}
      {!isDirectExamView && !loadingExam && (
        <div className="bg-white border rounded-lg p-5 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Filters</h2>
          <div className="grid md:grid-cols-3 gap-4">

            {/* Session */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Session</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select session</option>
                {sessions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.isActive ? "(Active)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Term */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Term</label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                disabled={!selectedSession || !terms.length}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              >
                <option value="">Select term</option>
                {terms.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} {t.isActive ? "(Active)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Arm */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Arm <span className="text-gray-400">(optional)</span>
              </label>
              <select
                value={selectedArm}
                onChange={(e) => setSelectedArm(e.target.value)}
                disabled={!selectedClass || !arms.length}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              >
                <option value="">All arms</option>
                {arms.map((a) => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
            </div>

            {/* Exam */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Exam</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                disabled={!exams.length}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              >
                <option value="">
                  {exams.length === 0
                    ? "No closed exams found for these filters"
                    : "Select exam"}
                </option>
                {exams.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.title} — {e.subject?.name}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {fetching && (
        <div className="text-center py-16 text-gray-400">Loading results...</div>
      )}

      {!fetching && results && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: "Total",    value: results.summary.totalStudents, icon: <FaUsers className="text-blue-400" />,        bg: "bg-blue-50" },
              { label: "Submitted", value: results.summary.submitted,   icon: <FaCheckCircle className="text-green-400" />, bg: "bg-green-50" },
              { label: "Passed",   value: results.summary.passed,       icon: <FaCheckCircle className="text-green-600" />, bg: "bg-green-50" },
              { label: "Failed",   value: results.summary.failed,       icon: <FaTimesCircle className="text-red-400" />,   bg: "bg-red-50" },
              { label: "Average",  value: `${results.summary.averageScore}%`, icon: <FaClock className="text-purple-400" />, bg: "bg-purple-50" },
            ].map(({ label, value, icon, bg }) => (
              <div key={label} className={`${bg} border rounded-lg p-4 flex items-center gap-3`}>
                {icon}
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-xl font-bold text-gray-800">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Exam info banner for direct view */}
          {isDirectExamView && results.exam && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Exam Title:</span>
                  <span className="ml-2 font-medium text-gray-800">{results.exam.title}</span>
                </div>
                <div>
                  <span className="text-gray-600">Subject:</span>
                  <span className="ml-2 font-medium text-gray-800">{results.exam.subject?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <span className="ml-2 font-medium text-gray-800">{results.exam.duration} minutes</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Questions:</span>
                  <span className="ml-2 font-medium text-gray-800">{results.exam.totalQuestions}</span>
                </div>
                <div>
                  <span className="text-gray-600">Pass Mark:</span>
                  <span className="ml-2 font-medium text-gray-800">{results.exam.passMark}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                    results.exam.status === 'closed' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {results.exam.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Table header + export */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700">
              Student Scores {isDirectExamView && `(${results.sessions.length} students)`}
            </h2>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 text-sm"
            >
              <FaDownload size={12} /> Export Excel
            </button>
          </div>

          {/* Results table */}
          {results.sessions.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white border rounded-lg">
              No students have taken this exam yet
            </div>
          ) : (
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Adm. No</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Score</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">%</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Time Spent</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {results.sessions.map((s, i) => (
                      <tr key={s._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {s.student?.name || "—"}
                          {s.autoSubmitted && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                              auto
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {s.student?.admissionNumber || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {s.score ?? "—"}/{s.total ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${
                            s.percentage >= 50 ? "text-green-600" : "text-red-500"
                          }`}>
                            {s.percentage ?? "—"}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {s.passed === true && (
                            <span className="flex items-center gap-1 text-green-700 text-xs font-medium">
                              <FaCheckCircle size={11} /> Passed
                            </span>
                          )}
                          {s.passed === false && (
                            <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                              <FaTimesCircle size={11} /> Failed
                            </span>
                          )}
                          {s.passed === undefined && (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {formatTime(s.timeSpent)}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {s.submittedAt
                            ? new Date(s.submittedAt).toLocaleString("en-NG", {
                                day: "numeric", month: "short",
                                hour: "2-digit", minute: "2-digit",
                              })
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state — filters set but no exam selected */}
      {!fetching && !results && selectedClass && !isDirectExamView && (
        <div className="text-center py-16 text-gray-400">
          <FaUsers size={36} className="mx-auto mb-3 opacity-30" />
          <p>Select an exam above to view results</p>
        </div>
      )}
    </div>
  );
};

export default CbtResults;