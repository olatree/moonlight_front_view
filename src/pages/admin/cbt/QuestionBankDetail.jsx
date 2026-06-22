// pages/cbt/QuestionBankDetail.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
// Add this import at the top
import * as XLSX from "xlsx";
import { FaDownload } from "react-icons/fa";
import {
  FaTrash,
  FaPencilAlt,
  FaSave,
  FaTimes,
  FaPlus,
  FaFileExcel,
  FaArrowLeft,
  FaImage,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const OPTIONS = ["A", "B", "C", "D"];

const emptyForm = {
  body: "",
  topic: "",
  marks: 1,
  correctOption: "",
  image: null,
  options: [
    { id: "A", text: "" },
    { id: "B", text: "" },
    { id: "C", text: "" },
    { id: "D", text: "" },
  ],
};

const QuestionBankDetail = () => {
  const { bankId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [bank, setBank]           = useState(null);
  const [questions, setQuestions] = useState([]);

  // ── UI State ──────────────────────────────────────────────────────────────
  const [fetching, setFetching]     = useState(true);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [expandedId, setExpandedId] = useState(null); // which question is expanded

  // ── Create / Edit form ────────────────────────────────────────────────────
  const [form, setForm]         = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ── Import state ──────────────────────────────────────────────────────────
  const [importing, setImporting]       = useState(false);
  const [importResult, setImportResult] = useState(null); // { imported, skipped, errors }

  // ── Fetch bank + questions ─────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, [bankId]);

  const fetchData = async () => {
    try {
      setFetching(true);
      setError("");
      const [bankRes, questionsRes] = await Promise.all([
        api.get(`/cbt/banks/${bankId}`),
        api.get(`/cbt/questions?bankId=${bankId}`),
      ]);
      setBank(bankRes.data);
      setQuestions(questionsRes.data);
    } catch (err) {
      setError("Failed to load bank data");
    } finally {
      setFetching(false);
    }
  };

  // ── Flash success message ──────────────────────────────────────────────────
  const flashSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  // ── Form helpers ───────────────────────────────────────────────────────────
  const handleOptionChange = (id, value) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((o) => (o.id === id ? { ...o, text: value } : o)),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setForm((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImagePreview(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const startEditing = (question) => {
    setEditingId(question._id);
    setForm({
      body: question.body,
      topic: question.topic || "",
      marks: question.marks || 1,
      correctOption: question.correctOption,
      image: null, // new upload only — existing shown separately
      options: question.options.map((o) => ({ ...o })),
    });
    setImagePreview(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Validate form ──────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.body.trim()) return "Question text is required";
    for (const opt of form.options) {
      if (!opt.text.trim()) return `Option ${opt.id} cannot be empty`;
    }
    if (!form.correctOption) return "Please select the correct option";
    if (form.marks < 1) return "Marks must be at least 1";
    return null;
  };

  // ── Submit (create or update) ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    // Build FormData — needed because image is a file
    const data = new FormData();
    data.append("bankId", bankId);
    data.append("body", form.body.trim());
    data.append("topic", form.topic.trim() || "General");
    data.append("marks", form.marks);
    data.append("correctOption", form.correctOption);
    data.append("options", JSON.stringify(form.options));
    if (form.image) data.append("image", form.image);

    try {
      setLoading(true);
      setError("");

      if (editingId) {
        const res = await api.put(`/cbt/questions/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setQuestions((prev) =>
          prev.map((q) => (q._id === editingId ? res.data : q))
        );
        flashSuccess("Question updated successfully");
      } else {
        const res = await api.post("/cbt/questions", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setQuestions((prev) => [...prev, res.data]);
        flashSuccess("Question added successfully");
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save question");
    } finally {
      setLoading(false);
    }
  };

  // ── Delete question ────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question? This cannot be undone.")) return;
    try {
      setError("");
      await api.delete(`/cbt/questions/${id}`);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
      flashSuccess("Question deleted");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete question");
    }
  };

  // ── Excel import ───────────────────────────────────────────────────────────
  const handleExcelImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    try {
      setImporting(true);
      setImportResult(null);
      setError("");
      const res = await api.post(`/cbt/questions/import/${bankId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImportResult(res.data);
      flashSuccess(`${res.data.imported} question(s) imported`);
      // Refresh question list
      const questionsRes = await api.get(`/cbt/questions?bankId=${bankId}`);
      setQuestions(questionsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Import failed");
    } finally {
      setImporting(false);
      if (excelInputRef.current) excelInputRef.current.value = "";
    }
  };

  // Add this function inside the component
const downloadSampleExcel = () => {
  const sampleData = [
    {
      question: "What is a noun?",
      option_a: "A person, place or thing",
      option_b: "An action word",
      option_c: "A describing word",
      option_d: "A joining word",
      correct: "A",
      topic: "Parts of Speech",
      marks: 1,
    },
    {
      question: "Which of these is a verb?",
      option_a: "Beautiful",
      option_b: "Run",
      option_c: "Table",
      option_d: "Quickly",
      correct: "B",
      topic: "Parts of Speech",
      marks: 1,
    },
    {
      question: "What is H2O commonly known as?",
      option_a: "Salt",
      option_b: "Oxygen",
      option_c: "Water",
      option_d: "Hydrogen",
      correct: "C",
      topic: "Chemistry",
      marks: 2,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths so it's readable when opened
  worksheet["!cols"] = [
    { wch: 50 }, // question
    { wch: 25 }, // option_a
    { wch: 25 }, // option_b
    { wch: 25 }, // option_c
    { wch: 25 }, // option_d
    { wch: 10 }, // correct
    { wch: 20 }, // topic
    { wch: 8 },  // marks
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");

  XLSX.writeFile(workbook, "questions_import_template.xlsx");
};

  // ── Render ─────────────────────────────────────────────────────────────────
  if (fetching) {
    return <div className="p-6 text-center text-gray-400">Loading...</div>;
  }

  if (!bank) {
    return <div className="p-6 text-center text-red-500">Bank not found</div>;
  }

  return (
    <div className="p-6">

      {/* Back + header */}
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={() => navigate("/admin/cbt/banks")}
          className="text-gray-500 hover:text-gray-800"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{bank.title}</h1>
      </div>
      <div className="flex flex-wrap gap-2 text-xs mb-6 ml-7">
        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
          {bank.subject?.name}
        </span>
        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
          {bank.classId?.name}
        </span>
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Action buttons */}
      {/* <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
        >
          <FaPlus size={11} /> Add Question
        </button>

        {/* Excel import — hidden file input triggered by button */}
        <button
          onClick={() => excelInputRef.current?.click()}
          disabled={importing}
          className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 disabled:bg-gray-400 text-sm"
        >
          <FaFileExcel size={13} />
          {importing ? "Importing..." : "Import Excel"}
        </button>
        <input
          ref={excelInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleExcelImport}
        />
      {/* </div> */} *

      {/* Action buttons */}
<div className="flex flex-wrap gap-2 mb-6">
  <button
    onClick={openCreateForm}
    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
  >
    <FaPlus size={11} /> Add Question
  </button>

  <button
    onClick={() => excelInputRef.current?.click()}
    disabled={importing}
    className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 disabled:bg-gray-400 text-sm"
  >
    <FaFileExcel size={13} />
    {importing ? "Importing..." : "Import Excel"}
  </button>
  <input
    ref={excelInputRef}
    type="file"
    accept=".xlsx,.xls"
    className="hidden"
    onChange={handleExcelImport}
  />

  {/* ── Download sample template ── */}
  <button
    onClick={downloadSampleExcel}
    className="flex items-center gap-2 border border-emerald-700 text-emerald-700 px-4 py-2 rounded hover:bg-emerald-50 text-sm"
  >
    <FaDownload size={11} />
    Download Template
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

      {/* Import result breakdown */}
      {importResult && (
        <div className="bg-white border rounded-lg p-4 mb-4 text-sm">
          <p className="font-semibold text-gray-700 mb-2">Import Summary</p>
          <p className="text-green-700">✓ {importResult.imported} imported</p>
          {importResult.skipped > 0 && (
            <p className="text-yellow-600">⚠ {importResult.skipped} skipped</p>
          )}
          {importResult.errors?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {importResult.errors.map((e, i) => (
                <li key={i} className="text-red-500 text-xs">{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded-lg p-5 mb-6 shadow-sm"
        >
          <h2 className="font-semibold text-gray-700 mb-4">
            {editingId ? "Edit Question" : "Add New Question"}
          </h2>

          {/* Question body */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Question <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Type your question here..."
              className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {/* Options */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Options <span className="text-red-500">*</span>
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              {form.options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  {/* Correct answer selector */}
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, correctOption: opt.id })}
                    className={`w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 border-2 transition-colors ${
                      form.correctOption === opt.id
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-500 border-gray-300 hover:border-green-400"
                    }`}
                    title={`Mark ${opt.id} as correct`}
                  >
                    {opt.id}
                  </button>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                    placeholder={`Option ${opt.id}`}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>
            {form.correctOption && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Option {form.correctOption} marked as correct
              </p>
            )}
          </div>

          {/* Topic + Marks */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Topic <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                placeholder="e.g. Cell Biology"
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={form.marks}
                onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Image upload */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Image <span className="text-gray-400">(optional — for diagrams)</span>
            </label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-32 rounded border object-contain"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 border border-dashed border-gray-300 px-4 py-2 rounded text-sm text-gray-500 hover:border-green-500 hover:text-green-600"
              >
                <FaImage /> Upload image
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Form actions */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { resetForm(); setShowForm(false); }}
              className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading
                ? editingId ? "Saving..." : "Adding..."
                : editingId ? "Save Changes" : "Add Question"
              }
            </button>
          </div>
        </form>
      )}

      {/* Question list */}
      {questions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-1">No questions yet</p>
          <p className="text-sm">Add one manually or import from Excel</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => {
            const isExpanded = expandedId === question._id;
            return (
              <div
                key={question._id}
                className="bg-white border rounded-lg shadow-sm overflow-hidden"
              >
                {/* Question header — always visible */}
                <div className="flex items-start justify-between p-4 gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Index badge */}
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    {/* Question text — truncated when collapsed */}
                    <p className={`text-gray-800 text-sm ${!isExpanded ? "line-clamp-2" : ""}`}>
                      {question.body}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => startEditing(question)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      <FaPencilAlt size={11} />
                    </button>
                    <button
                      onClick={() => handleDelete(question._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      <FaTrash size={11} />
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : question._id)}
                      className="text-gray-400 hover:text-gray-600 px-1"
                    >
                      {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t px-4 pb-4 pt-3 bg-gray-50">
                    {/* Image */}
                    {question.image && (
                      <img
                        src={question.image}
                        alt="Question diagram"
                        className="h-40 object-contain rounded border mb-3"
                      />
                    )}

                    {/* Options */}
                    <div className="grid md:grid-cols-2 gap-2 mb-3">
                      {question.options.map((opt) => (
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

                    {/* Meta */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {question.topic && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {question.topic}
                        </span>
                      )}
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {question.marks} mark{question.marks !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuestionBankDetail;