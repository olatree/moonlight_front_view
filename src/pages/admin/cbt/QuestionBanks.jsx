// pages/cbt/QuestionBanks.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import {
  FaTrash,
  FaPencilAlt,
  FaSave,
  FaTimes,
  FaPlus,
  FaBook,
  FaChevronRight,
} from "react-icons/fa";

const QuestionBanks = () => {
  const navigate = useNavigate();

  // ── Data ──────────────────────────────────────────────────────────────────
  const [banks, setBanks]       = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses]   = useState([]);

  // ── UI State ──────────────────────────────────────────────────────────────
  const [loading, setLoading]       = useState(false);
  const [fetching, setFetching]     = useState(true);
  const [error, setError]           = useState("");
  const [showForm, setShowForm]     = useState(false);

  // ── Create form ───────────────────────────────────────────────────────────
  const [form, setForm] = useState({ title: "", subject: "", classId: "", description: "" });

  // ── Edit state ────────────────────────────────────────────────────────────
  const [editingId, setEditingId]     = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDesc, setEditingDesc]   = useState("");

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setFetching(true);
      const [banksRes, subjectsRes, classesRes] = await Promise.all([
        api.get("/cbt/banks"),
        api.get("/subjects"),
        api.get("/classes"),
    ]);

    setBanks(banksRes.data);
    setSubjects(subjectsRes.data);
    setClasses(classesRes.data);
    } catch (err) {
        setError("Failed to load data");
    } finally {
        setFetching(false);
    }
};

  // ── Create bank ───────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subject || !form.classId) {
      setError("Title, subject and class are required");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/cbt/banks", form);
      setBanks([res.data, ...banks]);
      setForm({ title: "", subject: "", classId: "", description: "" });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create bank");
    } finally {
      setLoading(false);
    }
  };

  // ── Start editing ─────────────────────────────────────────────────────────
  const startEditing = (bank) => {
    setEditingId(bank._id);
    setEditingTitle(bank.title);
    setEditingDesc(bank.description || "");
  };

  // ── Save edit ─────────────────────────────────────────────────────────────
  const handleUpdate = async (id) => {
    if (!editingTitle.trim()) return;
    try {
      setError("");
      const res = await api.put(`/cbt/banks/${id}`, {
        title: editingTitle,
        description: editingDesc,
      });
      setBanks(banks.map((b) => (b._id === id ? { ...b, ...res.data } : b)));
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update bank");
    }
  };

  // ── Delete bank ───────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bank and all its questions? This cannot be undone.")) return;
    try {
      setError("");
      await api.delete(`/cbt/banks/${id}`);
      setBanks(banks.filter((b) => b._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete bank");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Question Banks</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organise questions by subject and class
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(""); }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <FaPlus size={12} />
          New Bank
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 bg-red-50 border border-red-200 rounded px-4 py-2 mb-4">
          {error}
        </p>
      )}

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border rounded-lg p-5 mb-6 shadow-sm"
        >
          <h2 className="font-semibold text-gray-700 mb-4">Create New Bank</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. SS2 Biology First Term"
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Covers chapters 1–5"
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(""); }}
              className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "Creating..." : "Create Bank"}
            </button>
          </div>
        </form>
      )}

      {/* Loading */}
      {fetching ? (
        <div className="text-center py-20 text-gray-400">Loading banks...</div>
      ) : banks.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FaBook size={40} className="mx-auto mb-3 opacity-30" />
          <p>No question banks yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banks.map((bank) => (
            <div
              key={bank._id}
              className="bg-white border rounded-lg shadow-sm p-4 flex flex-col gap-3"
            >
              {editingId === bank._id ? (
                /* ── Edit mode ── */
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="border px-2 py-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    value={editingDesc}
                    onChange={(e) => setEditingDesc(e.target.value)}
                    placeholder="Description (optional)"
                    className="border px-2 py-1 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleUpdate(bank._id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      <FaSave />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ) : (
                /* ── View mode ── */
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{bank.title}</h3>
                      {bank.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{bank.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(bank)}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        <FaPencilAlt size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(bank._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {bank.subject?.name || "—"}
                    </span>
                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                      {bank.classId?.name || "—"}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {bank.questionCount ?? 0} question{bank.questionCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Open bank button */}
                  <button
                    onClick={() => navigate(`/admin/cbt/banks/${bank._id}`)}
                    className="mt-auto flex items-center justify-between w-full border border-green-600 text-green-700 px-3 py-1.5 rounded hover:bg-green-50 text-sm font-medium"
                  >
                    View Questions
                    <FaChevronRight size={11} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionBanks;