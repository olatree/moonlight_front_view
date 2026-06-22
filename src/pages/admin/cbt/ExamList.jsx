

// pages/admin/cbt/ExamList.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../api/axios";
import {
  FaPlus, FaEye, FaTrash, FaPencilAlt,
} from "react-icons/fa";

const ADMIN_ROLES = ["admin", "super_admin", "principal", "master_admin"];

const STATUS_STYLES = {
  draft:  "bg-gray-100 text-gray-600",
  active: "bg-green-100 text-green-700",
  closed: "bg-red-100 text-red-600",
};

const ExamList = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [exams, setExams]       = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch]             = useState("");

  const isAdmin = ADMIN_ROLES.includes(user?.role);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setFetching(true);
      const res = await api.get("/cbt/exams");
      setExams(res.data);
    } catch (err) {
      setError("Failed to load exams");
    } finally {
      setFetching(false);
    }
  };

  const flashSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  // ── Status change ──────────────────────────────────────────────────────────
  const handleStatusChange = async (examId, status) => {
    const messages = {
      active: "Activate this exam? Students will be able to see and start it.",
      closed: "Close this exam? Students will no longer be able to start it.",
    };
    if (!window.confirm(messages[status])) return;
    try {
      setError("");
      await api.patch(`/cbt/exams/${examId}/status`, { status });
      setExams((prev) =>
        prev.map((e) => (e._id === examId ? { ...e, status } : e))
      );
      flashSuccess(`Exam ${status === "active" ? "activated" : "closed"} successfully`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  // ── Release results ────────────────────────────────────────────────────────
  const handleRelease = async (examId) => {
    if (!window.confirm("Release results? Students will be able to see their scores.")) return;
    try {
      setError("");
      await api.patch(`/cbt/exams/${examId}/release`);
      setExams((prev) =>
        prev.map((e) => (e._id === examId ? { ...e, releaseResult: true } : e))
      );
      flashSuccess("Results released to students");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to release results");
    }
  };

  // ── Delete exam ────────────────────────────────────────────────────────────
  const handleDelete = async (examId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      setError("");
      await api.delete(`/cbt/exams/${examId}`);
      setExams((prev) => prev.filter((e) => e._id !== examId));
      flashSuccess("Exam deleted");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete exam");
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = exams.filter((e) => {
    const matchStatus = statusFilter ? e.status === statusFilter : true;
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Exams</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and monitor all CBT exams</p>
        </div>
        <button
          onClick={() => navigate("/admin/cbt/exams/create")}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
        >
          <FaPlus size={11} /> Create Exam
        </button>
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exams..."
          className="border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      {fetching ? (
        <div className="text-center py-20 text-gray-400">Loading exams...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-1">No exams found</p>
          <p className="text-sm">Create one to get started</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Class</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Duration</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Results</th>
                  {isAdmin && (
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                  )}
                  <th className="text-left px-4 py-3 font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((exam) => (
                  <tr key={exam._id} className="hover:bg-gray-50 transition-colors">

                    {/* Title */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{exam.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {exam.passMark}% pass mark
                      </p>
                    </td>

                    {/* Subject */}
                    <td className="px-4 py-3 text-gray-600">
                      {exam.subject?.name || "—"}
                    </td>

                    {/* Class + Arm */}
                    <td className="px-4 py-3 text-gray-600">
                      {exam.classId?.name || "—"}
                      {exam.armId?.name && (
                        <span className="text-gray-400"> / {exam.armId.name}</span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="px-4 py-3 text-gray-600">
                      {exam.duration} min
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[exam.status]}`}>
                        {exam.status}
                      </span>
                    </td>

                    {/* Results released */}
                    <td className="px-4 py-3">
                      {exam.releaseResult ? (
                        <span className="text-xs text-green-600 font-medium">Released</span>
                      ) : (
                        <span className="text-xs text-gray-400">Not released</span>
                      )}
                    </td>

                    {/* Admin quick actions */}
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">

                          {/* Status transitions */}
                          {exam.status === "draft" && (
                            <button
                              onClick={() => handleStatusChange(exam._id, "active")}
                              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                            >
                              Activate
                            </button>
                          )}
                          {exam.status === "active" && (
                            <button
                              onClick={() => handleStatusChange(exam._id, "closed")}
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                              Close
                            </button>
                          )}
                          {exam.status === "closed" && !exam.releaseResult && (
                            <button
                              onClick={() => handleRelease(exam._id)}
                              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                            >
                              Release
                            </button>
                          )}
                          {exam.status === "closed" && exam.releaseResult && (
                            <span className="text-xs text-gray-400 italic">Done</span>
                          )}

                          {/* Edit — only draft exams */}
                          {exam.status === "draft" && (
                            <button
                              onClick={() => navigate(`/admin/cbt/exams/${exam._id}/edit`)}
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                            >
                              <FaPencilAlt size={9} /> Edit
                            </button>
                          )}

                          {/* Delete — only draft exams */}
                          {exam.status === "draft" && (
                            <button
                              onClick={() => handleDelete(exam._id, exam.title)}
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex items-center gap-1"
                            >
                              <FaTrash size={9} /> Delete
                            </button>
                          )}

                        </div>
                      </td>
                    )}

                    {/* View details */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/admin/cbt/exams/${exam._id}`)}
                        className="flex items-center gap-1 text-xs border border-green-600 text-green-700 px-2 py-1 rounded hover:bg-green-50"
                      >
                        <FaEye size={10} /> Details
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamList;