// pages/students/cbt/ExamRunner.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../../api/axios";
import { FaFlag, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ExamRunner = () => {
  const { examId, sessionId } = useParams();
  const navigate  = useNavigate();
  const location  = useLocation();

  // ── Session data ──────────────────────────────────────────────────────────
  const [questions, setQuestions]   = useState([]);
  const [answers, setAnswers]       = useState({});   // { questionId: "A"|"B"|"C"|"D" }
  const [flagged, setFlagged]       = useState({});   // { questionId: true }
  const [currentIndex, setCurrentIndex] = useState(0);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft]   = useState(null);  // seconds
  const timerRef = useRef(null);

  // ── UI ────────────────────────────────────────────────────────────────────
  const [fetching, setFetching]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [savingFor, setSavingFor]   = useState(null); // questionId being saved

  // ── Load session ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setFetching(true);
        const res = await api.get(`/cbt/student/sessions/${sessionId}`);
        const { session, questions: qs, timeRemaining } = res.data;

        setQuestions(qs);

        // Rebuild answers map from saved session answers
        const savedAnswers = {};
        const savedFlags   = {};
        session.answers.forEach((a) => {
          if (a.selected) savedAnswers[a.question] = a.selected;
          if (a.flagged)  savedFlags[a.question]   = true;
        });
        setAnswers(savedAnswers);
        setFlagged(savedFlags);

        // Use timeRemaining from location state (just started) or from server (resumed)
        const initialTime =
          location.state?.timeRemaining ?? Math.round(timeRemaining);
        setTimeLeft(initialTime);

      } catch (err) {
        setError("Failed to load exam session");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [sessionId]);

  // ── Timer countdown ───────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmit(true); // auto-submit
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  // ── Format timer display ───────────────────────────────────────────────────
  const formatTime = (secs) => {
    if (secs === null) return "--:--";
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const timerColor = () => {
    if (timeLeft === null) return "text-gray-700";
    if (timeLeft <= 60)  return "text-red-600 animate-pulse";
    if (timeLeft <= 300) return "text-yellow-600";
    return "text-green-700";
  };

  // ── Save answer ───────────────────────────────────────────────────────────
  const saveAnswer = useCallback(async (questionId, selected) => {
    try {
      setSavingFor(questionId);
      await api.patch(`/cbt/student/sessions/${sessionId}/answer`, {
        questionId,
        selected,
      });
    } catch {
      // Silent fail — answer is still in local state
    } finally {
      setSavingFor(null);
    }
  }, [sessionId]);

  const handleAnswer = (questionId, selected) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selected }));
    saveAnswer(questionId, selected);
  };

  // ── Flag question ──────────────────────────────────────────────────────────
  const handleFlag = async (questionId) => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
    try {
      await api.patch(`/cbt/student/sessions/${sessionId}/flag`, { questionId });
    } catch {
      // silent
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (auto = false) => {
    if (!auto) {
      const answered = Object.keys(answers).length;
      const total    = questions.length;
      const unanswered = total - answered;
      if (unanswered > 0) {
        if (!window.confirm(
          `You have ${unanswered} unanswered question${unanswered !== 1 ? "s" : ""}. Submit anyway?`
        )) return;
      }
    }

    clearTimeout(timerRef.current);

    try {
      setSubmitting(true);
      const res = await api.post(`/cbt/student/sessions/${sessionId}/submit`, {
        autoSubmitted: auto,
      });
      navigate(`/student/exams/${examId}/result/${sessionId}`, {
        state: res.data,
      });
    } catch (err) {
      setError("Failed to submit exam. Please try again.");
      setSubmitting(false);
    }
  };

  // ── Navigator status per question ──────────────────────────────────────────
  const getQuestionStatus = (q) => {
    const answered = !!answers[q._id];
    const isFlagged = !!flagged[q._id];
    if (isFlagged && answered)  return "bg-yellow-400 text-white";
    if (isFlagged)              return "bg-yellow-200 text-yellow-800";
    if (answered)               return "bg-green-500 text-white";
    return "bg-gray-100 text-gray-600";
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (fetching) return (
    <div className="h-screen flex items-center justify-center text-gray-400">
      Loading exam...
    </div>
  );

  if (error) return (
    <div className="h-screen flex items-center justify-center text-red-500">
      {error}
    </div>
  );

  const currentQuestion = questions[currentIndex];
  const answeredCount   = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">{answeredCount}</span>
          /{questions.length} answered
        </div>

        {/* Timer */}
        <div className={`font-mono text-xl font-bold ${timerColor()}`}>
          {formatTime(timeLeft)}
        </div>

        <button
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          className="bg-green-600 text-white text-sm px-4 py-1.5 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Question area ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {currentQuestion && (
            <div className="max-w-2xl mx-auto">

              {/* Question header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <button
                  onClick={() => handleFlag(currentQuestion._id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    flagged[currentQuestion._id]
                      ? "bg-yellow-100 border-yellow-400 text-yellow-700"
                      : "border-gray-300 text-gray-500 hover:border-yellow-400 hover:text-yellow-600"
                  }`}
                >
                  <FaFlag size={10} />
                  {flagged[currentQuestion._id] ? "Flagged" : "Flag for review"}
                </button>
              </div>

              {/* Question body */}
              <div className="bg-white border rounded-xl p-5 shadow-sm mb-4">
                {currentQuestion.image && (
                  <img
                    src={currentQuestion.image}
                    alt="Question diagram"
                    className="max-h-48 object-contain rounded border mb-4 mx-auto"
                  />
                )}
                <p className="text-gray-800 text-base leading-relaxed">
                  {currentQuestion.body}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options?.map((opt) => {
                  const isChosen = answers[currentQuestion._id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswer(currentQuestion._id, opt.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        isChosen
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-white hover:border-green-300"
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                        isChosen
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {opt.id}
                      </span>
                      <span className={`text-sm ${isChosen ? "text-green-800 font-medium" : "text-gray-700"}`}>
                        {opt.text}
                      </span>
                      {savingFor === currentQuestion._id && isChosen && (
                        <span className="ml-auto text-xs text-gray-400">saving...</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  <FaChevronLeft size={11} /> Previous
                </button>
                <button
                  onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                  disabled={currentIndex === questions.length - 1}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  Next <FaChevronRight size={11} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Question navigator (desktop sidebar) ─────────────────────── */}
        <div className="hidden md:flex flex-col w-56 bg-white border-l p-4 overflow-y-auto">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Navigator
          </p>

          {/* Legend */}
          <div className="space-y-1 mb-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" /> Answered
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-400" /> Flagged
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 border" /> Not answered
            </div>
          </div>

          {/* Grid of question numbers */}
          <div className="grid grid-cols-4 gap-1.5">
            {questions.map((q, i) => (
              <button
                key={q._id}
                onClick={() => setCurrentIndex(i)}
                className={`w-full aspect-square rounded text-xs font-medium transition-colors ${
                  getQuestionStatus(q)
                } ${currentIndex === i ? "ring-2 ring-green-600 ring-offset-1" : ""}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Submit at bottom of navigator */}
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="mt-auto w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400"
          >
            {submitting ? "Submitting..." : "Submit Exam"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExamRunner;