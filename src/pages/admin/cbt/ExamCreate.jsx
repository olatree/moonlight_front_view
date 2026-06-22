


// pages/admin/cbt/ExamCreate.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../api/axios";
import {
  FaArrowLeft, FaPlus, FaTimes,
  FaSearch, FaChevronDown, FaChevronUp,
} from "react-icons/fa";

const ADMIN_ROLES = ["admin", "super_admin", "principal", "master_admin"];

const ExamCreate = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // ── Dropdown data ─────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms]       = useState([]);   // ← new
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses]   = useState([]);
  const [arms, setArms]         = useState([]);

  // ── Available questions ───────────────────────────────────────────────────
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [questionSearch, setQuestionSearch]         = useState("");
  const [topicFilter, setTopicFilter]               = useState("");
  const [loadingQuestions, setLoadingQuestions]     = useState(false);

  // ── Form ──────────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    title:            "",
    subject:          "",
    classId:          "",
    armId:            "",
    sessionId:        "",
    termId:           "",   // ← new
    duration:         30,
    startTime:        "",
    endTime:          "",
    passMark:         50,
    instructions:     "",
    shuffleQuestions: true,
    shuffleOptions:   false,
    showResultAfter:  false,
  });

  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // ── UI ────────────────────────────────────────────────────────────────────
  const [fetching, setFetching]               = useState(true);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState("");
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);

  // ── 1. On mount: sessions + subjects ──────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const init = async () => {
      try {
        setFetching(true);
        const [sessionsRes, subjectsRes] = await Promise.all([
          api.get("/sessions"),
          ADMIN_ROLES.includes(user.role)
            ? api.get("/subjects")
            : api.get(`/teacher-assignments/${user._id}/subjects`),
        ]);

        setSessions(sessionsRes.data);
        setSubjects(subjectsRes.data);

        // Auto-select active session and its active term
        const active = sessionsRes.data.find((s) => s.isActive);
        if (active) {
          setForm((f) => ({ ...f, sessionId: active._id }));
          setTerms(active.terms || []);
          // Auto-select active term
          const activeTerm = active.terms?.find((t) => t.isActive);
          if (activeTerm) setForm((f) => ({ ...f, termId: activeTerm._id }));
        }
      } catch {
        setError("Failed to load initial data");
      } finally {
        setFetching(false);
      }
    };

    init();
  }, [user]);

  // ── 2. Session changes → update terms ────────────────────────────────────
  useEffect(() => {
    if (!form.sessionId) return;
    const session = sessions.find((s) => s._id === form.sessionId);
    if (session) {
      setTerms(session.terms || []);
      // Auto-select active term for this session
      const activeTerm = session.terms?.find((t) => t.isActive);
      setForm((f) => ({ ...f, termId: activeTerm?._id || "" }));
    }
  }, [form.sessionId]);

  // ── 3. Subject changes → load classes ────────────────────────────────────
  useEffect(() => {
    if (!form.subject || !user) return;

    setForm((f) => ({ ...f, classId: "", armId: "" }));
    setClasses([]);
    setArms([]);
    setAvailableQuestions([]);
    setSelectedQuestions([]);

    const load = async () => {
      try {
        const res = ADMIN_ROLES.includes(user.role)
          ? await api.get("/classes")
          : await api.get(`/subjects/${form.subject}/classes`);
        setClasses(res?.data || []);
      } catch {
        setError("Failed to load classes");
      }
    };
    load();
  }, [form.subject]);

  // ── 4. Class changes → extract arms from class object ────────────────────
  useEffect(() => {
    if (!form.classId) return;

    setForm((f) => ({ ...f, armId: "" }));
    setArms([]);
    setAvailableQuestions([]);
    setSelectedQuestions([]);

    const selectedClass = classes.find((c) => c._id === form.classId);
    if (selectedClass) {
      setArms(selectedClass.arms ?? selectedClass.armsList ?? []);
    }
  }, [form.classId]);

  // ── 5. Subject + class → load questions ──────────────────────────────────
  useEffect(() => {
    if (!form.subject || !form.classId) return;

    const load = async () => {
      try {
        setLoadingQuestions(true);
        setAvailableQuestions([]);

        const banksRes = await api.get(
          `/cbt/banks?subject=${form.subject}&classId=${form.classId}`
        );
        const banks = banksRes.data;
        if (!banks.length) return;

        const perBank = await Promise.all(
          banks.map((bank) =>
            api
              .get(`/cbt/questions?bankId=${bank._id}`)
              .then((r) => r.data.map((q) => ({ ...q, bankTitle: bank.title })))
          )
        );
        setAvailableQuestions(perBank.flat());
      } catch {
        setError("Failed to load questions");
      } finally {
        setLoadingQuestions(false);
      }
    };
    load();
  }, [form.subject, form.classId]);

  // ── Question helpers ──────────────────────────────────────────────────────
  const isSelected     = (id) => selectedQuestions.some((q) => q._id === id);
  const toggleQuestion = (q)  =>
    setSelectedQuestions((prev) =>
      isSelected(q._id) ? prev.filter((x) => x._id !== q._id) : [...prev, q]
    );

  const filteredQuestions = () =>
    availableQuestions.filter((q) => {
      const matchSearch = q.body.toLowerCase().includes(questionSearch.toLowerCase());
      const matchTopic  = topicFilter ? q.topic === topicFilter : true;
      return matchSearch && matchTopic;
    });

  const uniqueTopics = [...new Set(availableQuestions.map((q) => q.topic).filter(Boolean))];
  const totalMarks   = selectedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);

  const selectAll = () => {
    const filtered  = filteredQuestions();
    const allPicked = filtered.every((q) => isSelected(q._id));
    if (allPicked) {
      setSelectedQuestions((prev) =>
        prev.filter((q) => !filtered.find((f) => f._id === q._id))
      );
    } else {
      const toAdd = filtered.filter((q) => !isSelected(q._id));
      setSelectedQuestions((prev) => [...prev, ...toAdd]);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim())            return setError("Exam title is required");
    if (!form.subject)                 return setError("Please select a subject");
    if (!form.classId)                 return setError("Please select a class");
    if (!form.sessionId)               return setError("Please select a session");
    if (!form.termId)                  return setError("Please select a term");
    if (!form.startTime)               return setError("Start time is required");
    if (!form.endTime)                 return setError("End time is required");
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      return setError("End time must be after start time");
    }
    if (selectedQuestions.length === 0) return setError("Please select at least one question");

    try {
      setLoading(true);
      await api.post("/cbt/exams", {
        ...form,
        armId:       form.armId || null,
        questionIds: selectedQuestions.map((q) => q._id),
      });
      navigate("/admin/cbt/exams");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-6 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin/cbt/exams")} className="text-gray-500 hover:text-gray-800">
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create Exam</h1>
          <p className="text-sm text-gray-500">Fill in details and pick questions</p>
        </div>
      </div>

      {error && (
        <p className="text-red-500 bg-red-50 border border-red-200 rounded px-4 py-2 mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Basic Info ───────────────────────────────────────────────── */}
        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Exam Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. SS2 Biology First Term CAT"
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Subject */}
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

            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                disabled={!form.subject || !classes.length}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
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
                value={form.armId}
                onChange={(e) => setForm({ ...form, armId: e.target.value })}
                disabled={!form.classId}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              >
                <option value="">All arms</option>
                {arms.map((a) => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
            </div>

            {/* Session */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Session <span className="text-red-500">*</span>
              </label>
              <select
                value={form.sessionId}
                onChange={(e) => setForm({ ...form, sessionId: e.target.value })}
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

            {/* Term — cascades from session */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Term <span className="text-red-500">*</span>
              </label>
              <select
                value={form.termId}
                onChange={(e) => setForm({ ...form, termId: e.target.value })}
                disabled={!form.sessionId || !terms.length}
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

          </div>
        </div>

        {/* ── Timing ───────────────────────────────────────────────────── */}
        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">Timing</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={5}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Start/End = window students can begin. Duration = how long they get once they start.
          </p>
        </div>

        {/* ── Settings ─────────────────────────────────────────────────── */}
        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">Settings</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Pass Mark (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.passMark}
                onChange={(e) => setForm({ ...form, passMark: Number(e.target.value) })}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Instructions <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                placeholder="e.g. Answer all questions carefully"
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            {[
              { key: "shuffleQuestions", label: "Shuffle questions",         desc: "Each student gets questions in a different order" },
              { key: "shuffleOptions",   label: "Shuffle options",           desc: "Options A–D are randomised per student" },
              { key: "showResultAfter",  label: "Show result immediately",   desc: "If off, teacher manually releases results" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-start gap-3">
                <div
                  onClick={() => setForm({ ...form, [key]: !form[key] })}
                  className="relative flex-shrink-0 mt-0.5 cursor-pointer"
                >
                  <div className={`w-10 h-5 rounded-full transition-colors ${form[key] ? "bg-green-500" : "bg-gray-300"}`} />
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form[key] ? "translate-x-5" : "translate-x-0"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Question Picker ───────────────────────────────────────────── */}
        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-gray-700">Questions</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {selectedQuestions.length} selected · {totalMarks} total mark{totalMarks !== 1 ? "s" : ""}
              </p>
            </div>
            {form.subject && form.classId && (
              <button
                type="button"
                onClick={() => setShowQuestionPicker((v) => !v)}
                className="flex items-center gap-2 text-sm border border-green-600 text-green-700 px-3 py-1.5 rounded hover:bg-green-50"
              >
                <FaPlus size={10} />
                {showQuestionPicker ? "Hide picker" : "Pick questions"}
                {showQuestionPicker ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
              </button>
            )}
          </div>

          {(!form.subject || !form.classId) && (
            <p className="text-sm text-gray-400 py-4 text-center">
              Select a subject and class above to load available questions
            </p>
          )}

          {form.subject && form.classId && showQuestionPicker && (
            <div className="border rounded-lg overflow-hidden mb-4">
              <div className="p-3 bg-gray-50 border-b flex flex-wrap gap-2">
                <div className="flex items-center gap-2 border rounded px-2 py-1 bg-white flex-1 min-w-40">
                  <FaSearch size={11} className="text-gray-400" />
                  <input
                    type="text"
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    placeholder="Search questions..."
                    className="text-sm outline-none w-full"
                  />
                </div>
                {uniqueTopics.length > 0 && (
                  <select
                    value={topicFilter}
                    onChange={(e) => setTopicFilter(e.target.value)}
                    className="border rounded px-2 py-1 text-sm bg-white"
                  >
                    <option value="">All topics</option>
                    {uniqueTopics.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-green-700 border border-green-600 px-3 py-1 rounded hover:bg-green-50"
                >
                  {filteredQuestions().every((q) => isSelected(q._id)) ? "Deselect all" : "Select all"}
                </button>
              </div>

              {loadingQuestions ? (
                <div className="p-6 text-center text-gray-400 text-sm">Loading questions...</div>
              ) : filteredQuestions().length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">
                  {availableQuestions.length === 0
                    ? "No questions found for this subject and class. Add questions to a bank first."
                    : "No questions match your search"}
                </div>
              ) : (
                <div className="divide-y max-h-80 overflow-y-auto">
                  {filteredQuestions().map((question) => (
                    <label
                      key={question._id}
                      className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isSelected(question._id) ? "bg-green-50" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected(question._id)}
                        onChange={() => toggleQuestion(question)}
                        className="mt-1 accent-green-600"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 line-clamp-2">{question.body}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {question.topic && (
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                              {question.topic}
                            </span>
                          )}
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {question.marks} mark{question.marks !== 1 ? "s" : ""}
                          </span>
                          <span className="text-xs text-gray-400">{question.bankTitle}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedQuestions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Selected Questions
              </p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {selectedQuestions.map((q, i) => (
                  <div
                    key={q._id}
                    className="flex items-center justify-between bg-green-50 border border-green-100 rounded px-3 py-2 text-sm"
                  >
                    <span className="text-gray-700 line-clamp-1 flex-1">
                      <span className="font-medium text-green-700 mr-2">{i + 1}.</span>
                      {q.body}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleQuestion(q)}
                      className="ml-2 text-gray-400 hover:text-red-500 flex-shrink-0"
                    >
                      <FaTimes size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Submit ────────────────────────────────────────────────────── */}
        <div className="flex gap-3 justify-end pb-6">
          <button
            type="button"
            onClick={() => navigate("/admin/cbt/exams")}
            className="px-5 py-2 border rounded text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Exam"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ExamCreate;