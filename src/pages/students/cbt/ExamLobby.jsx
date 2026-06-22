// pages/students/cbt/ExamLobby.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import {
  FaClock, FaListOl, FaExclamationTriangle,
  FaCheckCircle, FaArrowRight,
} from "react-icons/fa";

const ExamLobby = () => {
  const { examId } = useParams();
  const navigate   = useNavigate();

  const [exam, setExam]         = useState(null);
  const [fetching, setFetching] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    const fetchExam = async () => {
      try {
        // Reuse the available exams list and find this one
        // Or fetch all and filter — student exam detail isn't a separate endpoint
        const res = await api.get("/cbt/student/exams");
        const found = res.data.find((e) => e._id === examId);
        if (!found) {
          setError("Exam not found or no longer available");
        } else {
          setExam(found);
        }
      } catch {
        setError("Failed to load exam details");
      } finally {
        setFetching(false);
      }
    };
    fetchExam();
  }, [examId]);

  const handleStart = async () => {
    try {
      setStarting(true);
      setError("");
      const res = await api.post(`/cbt/student/sessions/start/${examId}`);
      const sessionId = res.data.session._id;
      const timeRemaining = res.data.timeRemaining;
      // Pass timeRemaining via state so ExamRunner starts with correct time
      navigate(`/student/exams/${examId}/run/${sessionId}`, {
        state: { timeRemaining },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start exam");
      setStarting(false);
    }
  };

  if (fetching) return <div className="p-6 text-center text-gray-400">Loading...</div>;
  if (error && !exam) return (
    <div className="p-6 text-center text-red-500">{error}</div>
  );

  const alreadySubmitted =
    exam.sessionStatus === "submitted" || exam.sessionStatus === "timed_out";
  const isOngoing = exam.sessionStatus === "ongoing";

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

        {/* Header */}
        <div className="bg-green-600 px-6 py-5 text-white">
          <p className="text-sm opacity-80 mb-1">{exam.subject?.name}</p>
          <h1 className="text-2xl font-bold">{exam.title}</h1>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
              <FaClock className="text-green-600" size={18} />
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="font-semibold text-gray-800">{exam.duration} minutes</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
              <FaListOl className="text-blue-500" size={18} />
              <div>
                <p className="text-xs text-gray-500">Questions</p>
                <p className="font-semibold text-gray-800">{exam.questionCount ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          {exam.instructions && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800 mb-1">Instructions</p>
              <p className="text-sm text-blue-700">{exam.instructions}</p>
            </div>
          )}

          {/* Rules */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Before you begin:</p>
            {[
              "Ensure you have a stable internet connection",
              "Do not close or refresh the browser during the exam",
              "Your answers are saved automatically as you select them",
              "The exam will auto-submit when time runs out",
              `You need ${exam.passMark}% or above to pass`,
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={13} />
                {rule}
              </div>
            ))}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <FaExclamationTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" size={14} />
            <p className="text-xs text-yellow-700">
              Once you start, the timer begins immediately and cannot be paused.
            </p>
          </div>

          {error && (
            <p className="text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm">
              {error}
            </p>
          )}

          {/* Action */}
          {alreadySubmitted ? (
            <div className="text-center py-2">
              <p className="text-gray-500 text-sm">You have already submitted this exam.</p>
              {exam.percentage !== null && (
                <p className="text-green-700 font-semibold mt-1">
                  Your score: {exam.percentage}%
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {starting ? "Starting..." : isOngoing ? "Resume Exam" : "Start Exam"}
              {!starting && <FaArrowRight size={14} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamLobby;