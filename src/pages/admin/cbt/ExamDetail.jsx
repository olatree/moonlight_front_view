// pages/admin/cbt/ExamDetail.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../api/axios";
import {
  FaArrowLeft,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const ADMIN_ROLES = ["admin", "super_admin", "principal", "master_admin"];

const STATUS_STYLES = {
  draft:  "bg-gray-100 text-gray-600",
  active: "bg-green-100 text-green-700",
  closed: "bg-red-100 text-red-600",
};

const ExamDetail = () => {
  const { examId } = useParams();
  const navigate   = useNavigate();
  const { user }   = useContext(AuthContext);

  const [exam, setExam]         = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [expandedQ, setExpandedQ] = useState(null);

  const isAdmin = ADMIN_ROLES.includes(user?.role);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      setFetching(true);
      const res = await api.get(`/cbt/exams/${examId}`);
      setExam(res.data);
    } catch (err) {
      setError("Failed to load exam");
    } finally {
      setFetching(false);
    }
  };

  const flashSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  // ── Status change ──────────────────────────────────────────────────────────
  const handleStatusChange = async (status) => {
    const messages = {
      active: "Activate this exam? Students will be able to start it.",
      closed: "Close this exam? No more students can start it.",
    };
    if (!window.confirm(messages[status])) return;

    try {
      setError("");
      await api.patch(`/cbt/exams/${examId}/status`, { status });
      setExam((prev) => ({ ...prev, status }));
      flashSuccess(`Exam ${status === "active" ? "activated" : "closed"} successfully`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  // ── Release results ────────────────────────────────────────────────────────
  const handleRelease = async () => {
    if (!window.confirm("Release results to students?")) return;
    try {
      setError("");
      await api.patch(`/cbt/exams/${examId}/release`);
      setExam((prev) => ({ ...prev, releaseResult: true }));
      flashSuccess("Results released to students");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to release results");
    }
  };

  // ── Delete exam ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm("Delete this exam permanently? This cannot be undone.")) return;
    try {
      await api.delete(`/cbt/exams/${examId}`);
      navigate("/admin/cbt/exams");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete exam");
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatDateTime = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleString("en-NG", {
      day:    "numeric",
      month:  "short",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (fetching) return <div className="p-6 text-center text-gray-400">Loading...</div>;
  if (!exam)    return <div className="p-6 text-center text-red-500">Exam not found</div>;

  const totalMarks = exam.questions?.reduce((sum, q) => sum + (q.marks || 1), 0) ?? 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate("/admin/cbt/exams")}
            className="text-gray-500 hover:text-gray-800 mt-1"
          >
            <FaArrowLeft />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-800">{exam.title}</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[exam.status]}`}>
                {exam.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Created by {exam.createdBy?.name || "—"}
            </p>
          </div>
        </div>

        {/* Admin action buttons */}
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            {exam.status === "draft" && (
              <>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 text-sm bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600"
                >
                  <FaTrash size={11} /> Delete
                </button>
                <button
                  onClick={() => handleStatusChange("active")}
                  className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700"
                >
                  Activate
                </button>
              </>
            )}
            {exam.status === "active" && (
              <button
                onClick={() => handleStatusChange("closed")}
                className="text-sm bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600"
              >
                Close Exam
              </button>
            )}
            {exam.status === "closed" && !exam.releaseResult && (
              <button
                onClick={handleRelease}
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
              >
                Release Results
              </button>
            )}
          </div>
        )}
      </div>

      {/* Feedback */}
      {error && (
        <p className="text-red-500 bg-red-50 border border-red-200 rounded px-4 py-2 mb-4">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-700 bg-green-50 border border-green-200 rounded px-4 py-2 mb-4">
          {success}
        </p>
      )}

      {/* Info cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Subject",
            value: exam.subject?.name || "—",
            sub:   `${exam.classId?.name || ""}${exam.armId?.name ? " / " + exam.armId.name : ""}`,
          },
          {
            label: "Duration",
            value: `${exam.duration} min`,
            sub:   `Pass mark: ${exam.passMark}%`,
            icon:  <FaClock className="text-blue-400" />,
          },
          {
            label: "Questions",
            value: exam.questions?.length ?? 0,
            sub:   `${totalMarks} total marks`,
            icon:  <FaCheckCircle className="text-green-400" />,
          },
          {
            label: "Results",
            value: exam.releaseResult ? "Released" : "Not released",
            sub:   exam.showResultAfter ? "Auto-show on submit" : "Manual release",
            icon:  exam.releaseResult
              ? <FaCheckCircle className="text-green-400" />
              : <FaTimesCircle className="text-gray-300" />,
          },
        ].map(({ label, value, sub, icon }) => (
          <div key={label} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
              {icon}
            </div>
            <p className="text-lg font-bold text-gray-800">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Timing + Settings */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">Timing</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Start</span>
              <span className="text-gray-800">{formatDateTime(exam.startTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">End</span>
              <span className="text-gray-800">{formatDateTime(exam.endTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Session</span>
              <span className="text-gray-800">{exam.sessionId?.name || "—"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">Settings</h2>
          <div className="space-y-2 text-sm">
            {[
              { label: "Shuffle questions", value: exam.shuffleQuestions },
              { label: "Shuffle options",   value: exam.shuffleOptions },
              { label: "Show result immediately", value: exam.showResultAfter },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-gray-500">{label}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  value ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {value ? "On" : "Off"}
                </span>
              </div>
            ))}
            {exam.instructions && (
              <div className="pt-2 border-t">
                <p className="text-gray-500 mb-1">Instructions</p>
                <p className="text-gray-700 italic">"{exam.instructions}"</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* View Results button */}
      {(exam.status === "closed" || exam.releaseResult) && (
        <div className="mb-6">
          <button
            onClick={() => navigate(`/admin/cbt/exams/${examId}/results`)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            <FaUsers size={13} /> View Student Results
          </button>
        </div>
      )}

      {/* Question list */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-700">
            Questions ({exam.questions?.length ?? 0})
          </h2>
        </div>

        {!exam.questions?.length ? (
          <div className="p-6 text-center text-gray-400 text-sm">No questions found</div>
        ) : (
          <div className="divide-y">
            {exam.questions.map((question, index) => {
              const isExpanded = expandedQ === question._id;
              return (
                <div key={question._id}>
                  {/* Collapsed row */}
                  <div className="flex items-start justify-between p-4 gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <p className={`text-sm text-gray-800 ${!isExpanded ? "line-clamp-2" : ""}`}>
                        {question.body}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {question.marks} mark{question.marks !== 1 ? "s" : ""}
                      </span>
                      <button
                        onClick={() => setExpandedQ(isExpanded ? null : question._id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded options */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 bg-gray-50 border-t">
                      {question.image && (
                        <img
                          src={question.image}
                          alt="Question diagram"
                          className="h-36 object-contain rounded border mb-3"
                        />
                      )}
                      <div className="grid md:grid-cols-2 gap-2">
                        {question.options?.map((opt) => (
                          <div
                            key={opt.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded border text-sm ${
                              opt.id === question.correctOption
                                ? "bg-green-50 border-green-400 text-green-800 font-medium"
                                : "bg-white text-gray-700"
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                              opt.id === question.correctOption
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}>
                              {opt.id}
                            </span>
                            {opt.text}
                            {opt.id === question.correctOption && (
                              <span className="ml-auto text-xs text-green-600">✓ correct</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {question.topic && (
                        <p className="text-xs text-blue-600 mt-2">Topic: {question.topic}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamDetail;