import { useState, useMemo, useEffect, useCallback } from "react";
import {
  getQuestions, addQuestion, updateQuestion, deleteQuestion,
  getExams, createExam, updateExam, deleteExam,
  getSchedules, createSchedule, toggleSchedule, deleteSchedule,
  getExamResults,
} from "../../api/CbtApi";

// ─── Constants ────────────────────────────────────────────────────────────────
// These should come from your existing API; hardcoded here as fallback
const DIFFICULTIES = ["easy", "medium", "hard"];

const DIFF_COLOR = {
  easy:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard:   "bg-rose-50 text-rose-700 border-rose-200",
};

// ─── Shared UI ───────────────────────────────────────────────────────────────
function Badge({ label, color }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", className = "", disabled = false, loading = false }) {
  const base = "inline-flex items-center gap-1.5 font-medium rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-700 active:scale-95",
    ghost:   "bg-transparent text-slate-600 hover:bg-slate-100 active:scale-95",
    danger:  "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 active:scale-95",
    outline: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:scale-95",
  };
  return (
    <button disabled={disabled || loading} onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {loading && (
        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      )}
      {children}
    </button>
  );
}

function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</label>}
      <input {...props}
        className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition ${error ? "border-rose-300" : "border-slate-200"}`}
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function Select({ label, options = [], valueKey = "_id", labelKey = "name", error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</label>}
      <select {...props}
        className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition ${error ? "border-rose-300" : "border-slate-200"}`}>
        <option value="">Select…</option>
        {options.map(o => (
          typeof o === "string"
            ? <option key={o} value={o}>{o}</option>
            : <option key={o[valueKey]} value={o[valueKey]}>{o[labelKey]}</option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function Modal({ open, onClose, title, children, width = "max-w-xl" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className={`relative z-10 bg-white rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function EmptyState({ message = "No data found" }) {
  return (
    <tr>
      <td colSpan={20} className="text-center py-16">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
          <p className="text-sm">{message}</p>
        </div>
      </td>
    </tr>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
      <p className="text-sm text-rose-600">{message}</p>
      {onRetry && <Btn variant="danger" size="sm" onClick={onRetry}>Retry</Btn>}
    </div>
  );
}

// ─── Question Bank ────────────────────────────────────────────────────────────
function QuestionBank({ subjects }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterDiff, setFilterDiff]       = useState("");
  const [search, setSearch]               = useState("");
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    subject: "", text: "", options: ["", "", "", ""], correctIndex: 0, difficulty: "medium", marks: 1,
  });

  const fetchQuestions = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (filterSubject) params.subject = filterSubject;
      if (filterDiff)    params.difficulty = filterDiff;
      if (search)        params.search = search;
      const res = await getQuestions(params);
      setQuestions(res.data.data || []);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [filterSubject, filterDiff, search]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  function openAdd() {
    setEditing(null);
    setForm({ subject: "", text: "", options: ["", "", "", ""], correctIndex: 0, difficulty: "medium", marks: 1 });
    setModal(true);
  }

  function openEdit(q) {
    setEditing(q._id);
    setForm({ subject: q.subject?._id || q.subject, text: q.text, options: [...q.options], correctIndex: q.correctIndex, difficulty: q.difficulty, marks: q.marks });
    setModal(true);
  }

  async function save() {
    setSaving(true);
    try {
      if (editing) {
        const res = await updateQuestion(editing, form);
        setQuestions(qs => qs.map(q => q._id === editing ? res.data.data : q));
      } else {
        const res = await addQuestion(form);
        setQuestions(qs => [res.data.data, ...qs]);
      }
      setModal(false);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to save question");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    try {
      await deleteQuestion(deleteTarget._id);
      setQuestions(qs => qs.filter(q => q._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to delete question");
    }
  }

  const isFormValid = form.subject && form.text && form.options.every(o => o.trim());

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Question Bank</h2>
          <p className="text-sm text-slate-500">{questions.length} questions loaded</p>
        </div>
        <Btn onClick={openAdd}><span className="text-base leading-none">+</span> Add Question</Btn>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchQuestions} />}

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <input placeholder="Search questions…" value={search} onChange={e => setSearch(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-slate-900/20" />
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
            <option value="">All Difficulties</option>
            {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
          </select>
          {(filterSubject || filterDiff || search) && (
            <Btn variant="ghost" size="sm" onClick={() => { setFilterSubject(""); setFilterDiff(""); setSearch(""); }}>Clear</Btn>
          )}
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["#", "Question", "Subject", "Difficulty", "Marks", "Options", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    Loading…
                  </div>
                </td></tr>
              ) : questions.length === 0 ? (
                <EmptyState message="No questions found" />
              ) : questions.map((q, i) => (
                <tr key={q._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 text-slate-800 max-w-xs">
                    <p className="truncate">{q.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Answer: {q.options[q.correctIndex]}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{q.subject?.name || "—"}</td>
                  <td className="px-4 py-3"><Badge label={q.difficulty} color={DIFF_COLOR[q.difficulty]} /></td>
                  <td className="px-4 py-3 text-slate-600">{q.marks}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{q.options.length} options</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Btn variant="ghost" size="sm" onClick={() => openEdit(q)}>Edit</Btn>
                      <Btn variant="danger" size="sm" onClick={() => setDeleteTarget(q)}>Delete</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Question" : "Add Question"} width="max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Subject" options={subjects} value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
            <Select label="Difficulty" options={DIFFICULTIES} value={form.difficulty}
              onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} />
          </div>
          <Input label="Question Text" value={form.text}
            onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="Type the question…" />
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Options <span className="normal-case text-slate-400">(select radio to mark correct answer)</span>
            </label>
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-3">
                <input type="radio" name="correct" checked={form.correctIndex === i}
                  onChange={() => setForm(f => ({ ...f, correctIndex: i }))}
                  className="accent-slate-900 w-4 h-4 shrink-0" />
                <input value={opt}
                  onChange={e => setForm(f => { const o = [...f.options]; o[i] = e.target.value; return { ...f, options: o }; })}
                  placeholder={`Option ${i + 1}`}
                  className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 ${form.correctIndex === i ? "border-slate-400 bg-slate-50" : "border-slate-200"}`}
                />
              </div>
            ))}
          </div>
          <Input label="Marks" type="number" min={1} value={form.marks}
            onChange={e => setForm(f => ({ ...f, marks: +e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Btn variant="outline" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={save} disabled={!isFormValid} loading={saving}>
              {editing ? "Save Changes" : "Add Question"}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Question">
        <p className="text-sm text-slate-600 mb-2">You are about to permanently delete:</p>
        <p className="text-sm font-medium text-slate-800 bg-slate-50 rounded-lg px-4 py-3 mb-6 truncate">
          {deleteTarget?.text}
        </p>
        <div className="flex justify-end gap-3">
          <Btn variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Btn>
          <Btn variant="danger" onClick={confirmDelete}>Delete</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─── Exam Builder ─────────────────────────────────────────────────────────────
function ExamBuilder({ subjects, classes }) {
  const [exams, setExams]         = useState([]);
  const [allQuestions, setAllQs]  = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  const [modal, setModal]         = useState(false);
  const [detailExam, setDetailExam] = useState(null);
  const [editing, setEditing]     = useState(null);
  const [qFilter, setQFilter]     = useState("");
  const [form, setForm] = useState({
    title: "", subject: "", class: "", duration: 30, passMark: "",
    shuffleQuestions: true, shuffleOptions: false, selectedQs: [],
  });

  const fetchExams = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await getExams();
      setExams(res.data.data || []);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load exams");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  // Load questions when subject changes in form
  useEffect(() => {
    if (!form.subject) { setAllQs([]); return; }
    getQuestions({ subject: form.subject })
      .then(res => setAllQs(res.data.data || []))
      .catch(() => setAllQs([]));
  }, [form.subject]);

  const availableQs = useMemo(() =>
    allQuestions.filter(q => !qFilter || q.text.toLowerCase().includes(qFilter.toLowerCase())),
    [allQuestions, qFilter]
  );

  const totalMarks = useMemo(() =>
    form.selectedQs.reduce((sum, id) => sum + (allQuestions.find(q => q._id === id)?.marks || 0), 0),
    [form.selectedQs, allQuestions]
  );

  function openAdd() {
    setEditing(null);
    setForm({ title: "", subject: "", class: "", duration: 30, passMark: "", shuffleQuestions: true, shuffleOptions: false, selectedQs: [] });
    setModal(true);
  }

  function openEdit(ex) {
    setEditing(ex._id);
    setForm({
      title: ex.title,
      subject: ex.subject?._id || ex.subject,
      class: ex.class?._id || ex.class,
      duration: ex.duration,
      passMark: ex.passMark || "",
      shuffleQuestions: ex.shuffleQuestions ?? true,
      shuffleOptions: ex.shuffleOptions ?? false,
      selectedQs: ex.questions.map(q => q._id || q),
    });
    setModal(true);
  }

  function toggleQ(id) {
    setForm(f => ({
      ...f,
      selectedQs: f.selectedQs.includes(id) ? f.selectedQs.filter(q => q !== id) : [...f.selectedQs, id],
    }));
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        title: form.title, subject: form.subject, class: form.class,
        duration: form.duration, passMark: form.passMark || undefined,
        shuffleQuestions: form.shuffleQuestions, shuffleOptions: form.shuffleOptions,
        questions: form.selectedQs,
      };
      if (editing) {
        const res = await updateExam(editing, payload);
        setExams(es => es.map(e => e._id === editing ? res.data.data : e));
      } else {
        const res = await createExam(payload);
        setExams(es => [res.data.data, ...es]);
      }
      setModal(false);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to save exam");
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try {
      await deleteExam(id);
      setExams(es => es.filter(e => e._id !== id));
    } catch (e) {
      setError(e.response?.data?.error || "Failed to delete exam");
    }
  }

  const isFormValid = form.title && form.subject && form.class && form.selectedQs.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Exam Builder</h2>
          <p className="text-sm text-slate-500">{exams.length} exams created</p>
        </div>
        <Btn onClick={openAdd}><span className="text-base leading-none">+</span> New Exam</Btn>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchExams} />}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          Loading exams…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map(ex => (
            <Card key={ex._id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{ex.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{ex.subject?.name} · {ex.class?.name}</p>
                </div>
                <Badge label={ex.isActive ? "active" : "inactive"}
                  color={ex.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"} />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Questions", val: ex.questions?.length || 0 },
                  { label: "Marks",     val: ex.totalMarks },
                  { label: "Duration",  val: `${ex.duration}m` },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-base font-bold text-slate-800">{val}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Btn variant="outline" size="sm" className="flex-1 justify-center" onClick={() => setDetailExam(ex)}>View</Btn>
                <Btn variant="ghost" size="sm" className="flex-1 justify-center" onClick={() => openEdit(ex)}>Edit</Btn>
                <Btn variant="danger" size="sm" onClick={() => handleDelete(ex._id)}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </Btn>
              </div>
            </Card>
          ))}
          {exams.length === 0 && (
            <div className="col-span-3 text-center py-16 text-slate-400">No exams yet. Create your first exam.</div>
          )}
        </div>
      )}

      {/* Builder Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Exam" : "Create Exam"} width="max-w-3xl">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Exam Title" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. First Term Mathematics Exam" />
            </div>
            <Select label="Subject" options={subjects} value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value, selectedQs: [] }))} />
            <Select label="Class" options={classes} value={form.class}
              onChange={e => setForm(f => ({ ...f, class: e.target.value }))} />
            <Input label="Duration (minutes)" type="number" min={5} value={form.duration}
              onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} />
            <Input label="Pass Mark (optional)" type="number" value={form.passMark}
              onChange={e => setForm(f => ({ ...f, passMark: e.target.value }))} />
          </div>

          <div className="flex gap-6">
            {[["shuffleQuestions", "Shuffle questions"], ["shuffleOptions", "Shuffle options"]].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                  className="w-4 h-4 accent-slate-900 rounded" />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>

          {/* Question picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Select Questions{" "}
                {form.selectedQs.length > 0 && (
                  <span className="text-slate-800 normal-case">
                    ({form.selectedQs.length} selected · {totalMarks} marks)
                  </span>
                )}
              </label>
              <input placeholder="Search…" value={qFilter} onChange={e => setQFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs w-48 focus:outline-none focus:ring-2 focus:ring-slate-900/20" />
            </div>

            {!form.subject ? (
              <p className="text-sm text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl">
                Pick a subject first to load questions
              </p>
            ) : availableQs.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl">
                No questions found for this subject
              </p>
            ) : (
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {availableQs.map(q => {
                  const selected = form.selectedQs.includes(q._id);
                  return (
                    <div key={q._id} onClick={() => toggleQ(q._id)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${selected ? "bg-slate-50" : "hover:bg-slate-50"}`}>
                      <div className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${selected ? "bg-slate-900 border-slate-900" : "border-slate-300"}`}>
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                            <path d="M1.5 5l3 3 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 truncate">{q.text}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge label={q.difficulty} color={DIFF_COLOR[q.difficulty]} />
                          <span className="text-xs text-slate-400">{q.marks} mark{q.marks > 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Btn variant="outline" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={save} disabled={!isFormValid} loading={saving}>
              {editing ? "Save Changes" : "Create Exam"}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detailExam} onClose={() => setDetailExam(null)} title={detailExam?.title || ""}>
        {detailExam && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Subject",  detailExam.subject?.name],
                ["Class",    detailExam.class?.name],
                ["Duration", `${detailExam.duration} minutes`],
                ["Total Marks", detailExam.totalMarks],
                ["Pass Mark", detailExam.passMark || "50%"],
                ["Questions", detailExam.questions?.length],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-lg px-4 py-3">
                  <p className="text-xs text-slate-500">{k}</p>
                  <p className="text-sm font-medium text-slate-800 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Questions ({detailExam.questions?.length})
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {detailExam.questions?.map((q, i) => (
                  <div key={q._id || i} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-400 w-5 shrink-0">{i + 1}</span>
                    <p className="text-sm text-slate-700 flex-1 truncate">{q.text}</p>
                    {q.difficulty && <Badge label={q.difficulty} color={DIFF_COLOR[q.difficulty]} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Scheduling ───────────────────────────────────────────────────────────────
function Scheduling({ sessions, terms }) {
  const [schedules, setSchedules] = useState([]);
  const [exams, setExams]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  const [modal, setModal]         = useState(false);
  const [form, setForm] = useState({
    exam: "", session: "", term: "", scheduledBy: "teacher", startTime: "", endTime: "",
  });

  const fetchSchedules = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [schedRes, examRes] = await Promise.all([getSchedules(), getExams()]);
      setSchedules(schedRes.data.data || []);
      setExams(examRes.data.data || []);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load schedules");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  async function save() {
    setSaving(true);
    try {
      const payload = {
        exam: form.exam, session: form.session, term: form.term,
        scheduledBy: form.scheduledBy,
        startTime: form.scheduledBy === "term" ? form.startTime : null,
        endTime:   form.scheduledBy === "term" ? form.endTime   : null,
      };
      const res = await createSchedule(payload);
      setSchedules(s => [res.data.data, ...s]);
      setModal(false);
      setForm({ exam: "", session: "", term: "", scheduledBy: "teacher", startTime: "", endTime: "" });
    } catch (e) {
      setError(e.response?.data?.error || "Failed to create schedule");
    } finally { setSaving(false); }
  }

  async function handleToggle(id) {
    try {
      const res = await toggleSchedule(id);
      setSchedules(ss => ss.map(s => s._id === id ? res.data.data : s));
    } catch (e) {
      setError(e.response?.data?.error || "Failed to toggle schedule");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteSchedule(id);
      setSchedules(ss => ss.filter(s => s._id !== id));
    } catch (e) {
      setError(e.response?.data?.error || "Failed to delete schedule");
    }
  }

  function scheduleStatus(s) {
    if (s.isOpen) return "open";
    if (!s.startTime) return "closed";
    const now = new Date();
    if (now < new Date(s.startTime)) return "upcoming";
    if (now > new Date(s.endTime)) return "closed";
    return "open";
  }

  const STATUS_COLOR = {
    open:     "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed:   "bg-slate-100 text-slate-500 border-slate-200",
    upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  };

  const stats = {
    open:     schedules.filter(s => scheduleStatus(s) === "open").length,
    upcoming: schedules.filter(s => scheduleStatus(s) === "upcoming").length,
    closed:   schedules.filter(s => scheduleStatus(s) === "closed").length,
  };

  const isFormValid = form.exam && form.session && form.term;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Exam Scheduling</h2>
          <p className="text-sm text-slate-500">{schedules.length} schedules · {stats.open} currently open</p>
        </div>
        <Btn onClick={() => setModal(true)}><span className="text-base leading-none">+</span> Schedule Exam</Btn>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchSchedules} />}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Open",     val: stats.open,     color: "text-emerald-600" },
          { label: "Upcoming", val: stats.upcoming, color: "text-blue-600" },
          { label: "Closed",   val: stats.closed,   color: "text-slate-500" },
        ].map(({ label, val, color }) => (
          <Card key={label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{val}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Exam", "Subject · Class", "Session · Term", "Window", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading…</td></tr>
              ) : schedules.length === 0 ? (
                <EmptyState message="No schedules yet" />
              ) : schedules.map(s => {
                const status = scheduleStatus(s);
                return (
                  <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{s.exam?.title || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      <p>{s.exam?.subject?.name}</p>
                      <p className="text-slate-400">{s.exam?.class?.name}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      <p>{s.session?.name}</p>
                      <p className="text-slate-400">{s.term?.name}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {s.startTime
                        ? `${new Date(s.startTime).toLocaleString()} → ${new Date(s.endTime).toLocaleString()}`
                        : "Manual control"}
                    </td>
                    <td className="px-4 py-3"><Badge label={status} color={STATUS_COLOR[status]} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Btn variant={s.isOpen ? "danger" : "outline"} size="sm" onClick={() => handleToggle(s._id)}>
                          {s.isOpen ? "Close" : "Open"}
                        </Btn>
                        <Btn variant="danger" size="sm" onClick={() => handleDelete(s._id)}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Schedule an Exam">
        <div className="space-y-4">
          <Select label="Exam" options={exams} labelKey="title" value={form.exam}
            onChange={e => setForm(f => ({ ...f, exam: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Session" options={sessions} value={form.session}
              onChange={e => setForm(f => ({ ...f, session: e.target.value }))} />
            <Select label="Term" options={terms} value={form.term}
              onChange={e => setForm(f => ({ ...f, term: e.target.value }))} />
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Scheduling method</p>
            <div className="flex gap-4">
              {[["teacher", "Manual (open/close)"], ["term", "Timed window"]].map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input type="radio" name="scheduledBy" value={val}
                    checked={form.scheduledBy === val}
                    onChange={() => setForm(f => ({ ...f, scheduledBy: val }))}
                    className="accent-slate-900" />
                  {label}
                </label>
              ))}
            </div>
            {form.scheduledBy === "term" && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Input label="Start Time" type="datetime-local" value={form.startTime}
                  onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
                <Input label="End Time" type="datetime-local" value={form.endTime}
                  onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Btn variant="outline" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={save} disabled={!isFormValid} loading={saving}>Schedule</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────
function Results({ exams, classes }) {
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filterExam, setFilterExam]   = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [search, setSearch]           = useState("");

  const fetchResults = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (filterExam)  params.examId  = filterExam;
      if (filterClass) params.classId = filterClass;
      const res = await getExamResults(params);
      setResults(res.data.data || []);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load results");
    } finally { setLoading(false); }
  }, [filterExam, filterClass]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const filtered = useMemo(() =>
    results.filter(r =>
      !search ||
      r.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.student?.admissionNumber?.includes(search)
    ),
    [results, search]
  );

  const avgPct    = filtered.length ? Math.round(filtered.reduce((s, r) => s + r.percentage, 0) / filtered.length) : 0;
  const passCount = filtered.filter(r => r.passed).length;
  const topScorer = filtered[0] || null;

  function scoreColor(pct) {
    if (pct >= 70) return "text-emerald-600";
    if (pct >= 50) return "text-amber-600";
    return "text-rose-600";
  }
  function barColor(pct) {
    if (pct >= 70) return "bg-emerald-500";
    if (pct >= 50) return "bg-amber-400";
    return "bg-rose-400";
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Results & Reports</h2>
          <p className="text-sm text-slate-500">{results.length} attempts recorded</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchResults} />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Average Score",  val: `${avgPct}%`,    sub: "across filtered results" },
          { label: "Pass Rate",      val: `${filtered.length ? Math.round((passCount / filtered.length) * 100) : 0}%`, sub: `${passCount} of ${filtered.length} passed` },
          { label: "Top Scorer",     val: topScorer ? `${topScorer.percentage}%` : "—", sub: topScorer?.student?.name || "No data" },
          { label: "Total Students", val: filtered.length, sub: "results shown" },
        ].map(({ label, val, sub }) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{val}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <input placeholder="Search student or admission no…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-slate-900/20" />
          <select value={filterExam} onChange={e => setFilterExam(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
            <option value="">All Exams</option>
            {exams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
          </select>
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          {(filterExam || filterClass || search) && (
            <Btn variant="ghost" size="sm" onClick={() => { setFilterExam(""); setFilterClass(""); setSearch(""); }}>Clear</Btn>
          )}
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Rank", "Student", "Adm. No.", "Exam", "Score", "Performance", "Result"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <EmptyState message="No results match the current filters" />
              ) : filtered.map(r => (
                <tr key={r.attemptId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-400 text-xs font-mono">#{r.rank}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{r.student?.name || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{r.student?.admissionNumber || "—"}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">{r.exam}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${scoreColor(r.percentage)}`}>{r.score}/{r.totalMarks}</span>
                    <span className={`ml-1.5 text-xs ${scoreColor(r.percentage)}`}>({r.percentage}%)</span>
                  </td>
                  <td className="px-4 py-3 w-36">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColor(r.percentage)}`} style={{ width: `${r.percentage}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={r.passed ? "Passed" : "Failed"}
                      color={r.passed ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
const TABS = ["Question Bank", "Exam Builder", "Scheduling", "Results"];
const ICONS = [
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
];

export default function CBTAdmin() {
  const [activeTab, setActiveTab] = useState(0);

  // Shared reference data fetched once at the top level
  const [subjects, setSubjects]   = useState([]);
  const [classes, setClasses]     = useState([]);
  const [sessions, setSessions]   = useState([]);
  const [terms, setTerms]         = useState([]);
  const [exams, setExams]         = useState([]);
  const [refLoading, setRefLoading] = useState(true);

  useEffect(() => {
    async function loadRefData() {
      try {
        // Replace these with your actual existing API calls for subjects, classes, sessions, terms
        const [subRes, classRes, sessionRes, termRes, examRes] = await Promise.all([
          import("../../api/axios").then(m => m.default.get("/subjects")),
          import("../../api/axios").then(m => m.default.get("/classes")),
          import("../../api/axios").then(m => m.default.get("/sessions")),
          import("../../api/axios").then(m => m.default.get("/terms")),
          getExams(),
        ]);
        setSubjects(subRes.data.data   || subRes.data   || []);
        setClasses(classRes.data.data  || classRes.data  || []);
        setSessions(sessionRes.data.data || sessionRes.data || []);
        setTerms(termRes.data.data     || termRes.data   || []);
        setExams(examRes.data.data     || []);
      } catch (e) {
        console.error("Failed to load reference data:", e);
      } finally {
        setRefLoading(false);
      }
    }
    loadRefData();
  }, []);

  const screens = [
    <QuestionBank subjects={subjects} />,
    <ExamBuilder  subjects={subjects} classes={classes} />,
    <Scheduling   sessions={sessions} terms={terms} />,
    <Results      exams={exams} classes={classes} />,
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <span className="font-semibold text-slate-800 text-sm">CBT Admin</span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:block">Computer Based Testing · Admin Portal</span>
            {refLoading && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                Loading data…
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === i
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}>
                {ICONS[i]}{tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {screens[activeTab]}
      </main>
    </div>
  );
}