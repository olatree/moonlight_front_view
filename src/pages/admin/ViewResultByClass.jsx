import React, { useEffect, useState, useRef } from "react";
import api from "../../api/axios";

// const api = axios.create({
//   baseURL: "http://localhost:8000/api",
//   withCredentials: true,
// });

export default function ViewResultsByClass() {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [results, setResults] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedArm, setSelectedArm] = useState(null);

  const [loading, setLoading] = useState(false);
  const printRef = useRef();

  // 🔹 Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get("/sessions");
        setSessions(res.data || []);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }
    };
    fetchSessions();
  }, []);

  // 🔹 Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/classes");
        setClasses(res.data || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, []);

  // 🔹 Fetch results
  const fetchResults = async () => {
    if (!selectedSession || !selectedTerm || !selectedClass || !selectedArm) return;
    setLoading(true);
    try {
      const res = await api.get("/results/class/all-subjects", {
        params: {
          classId: selectedClass._id,
          armId: selectedArm._id,
          sessionId: selectedSession._id,
          termId: selectedTerm._id,
        },
      });

      const data = res.data || [];
      const uniqueSubjects = [
        ...new Set(data.flatMap((s) => s.subjects.map((sub) => sub.subject))),
      ];

      setSubjects(uniqueSubjects);
      setResults(data);
    } catch (err) {
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Get grade letter
  const getGrade = (score) => {
    if (score === "-" || isNaN(score)) return "-";
    if (score >= 70) return "A";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    if (score >= 45) return "D";
    return "F";
  };

  // 🔹 Grade color helper
  const getGradeColor = (score) => {
    // if (score === "-") return "text-gray-400";
    // if (score >= 70) return "text-green-600 font-semibold";
    if (score <= 45) return "text-red-500 font-semibold";
    // return "text-red-600 font-semibold";
  };

  // 🔹 Print handler — replicate exact page layout (no external Tailwind file)
const handlePrint = () => {
  const printContents = printRef.current.innerHTML;
  const printWindow = window.open("", "", "width=1200,height=800");

  printWindow.document.write(`
    <html>
      <head>
        <title>Class Results - ${selectedClass?.name}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 20px;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white;
            padding: 10px;
          }
          /* Optional: fix rotation headers */
          th.subject-header {
            transform: rotate(-90deg);
            white-space: nowrap;
            text-align: center;
            vertical-align: middle;
          }
        </style>
      </head>
      <body>${printContents}</body>
    </html>
  `);

  // Copy all stylesheets and inline Tailwind-injected <style> tags
  const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"));
  styles.forEach((styleEl) => {
    printWindow.document.head.appendChild(styleEl.cloneNode(true));
  });

  printWindow.document.close();

  // Wait for rendering before printing
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
};


  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h2 className="text-lg md:text-xl font-bold text-purple-700 mb-4 text-center">
        📘 View Results by Class (All Subjects)
      </h2>

      {/* 🔹 Filter Bar */}
      <div className="flex flex-wrap md:flex-nowrap gap-2 overflow-x-auto pb-2 bg-white shadow-sm p-3 rounded-lg mb-5">
        {/* Session */}
        <select
          onChange={(e) => {
            const session = sessions.find((s) => s._id === e.target.value);
            setSelectedSession(session);
            setSelectedTerm(null);
          }}
          value={selectedSession?._id || ""}
          className="border rounded px-2 py-2 text-sm min-w-[130px]"
        >
          <option value="">Session</option>
          {sessions.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Term */}
        <select
          onChange={(e) => {
            const term = selectedSession?.terms.find((t) => t._id === e.target.value);
            setSelectedTerm(term);
          }}
          value={selectedTerm?._id || ""}
          disabled={!selectedSession}
          className="border rounded px-2 py-2 text-sm min-w-[110px]"
        >
          <option value="">Term</option>
          {selectedSession?.terms.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Class */}
        <select
          onChange={(e) => {
            const cls = classes.find((c) => c._id === e.target.value);
            setSelectedClass(cls);
            setSelectedArm(null);
          }}
          value={selectedClass?._id || ""}
          disabled={!selectedTerm}
          className="border rounded px-2 py-2 text-sm min-w-[120px]"
        >
          <option value="">Class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name}
            </option>
          ))}
        </select>

        {/* Arm */}
        <select
          onChange={(e) => {
            const arm = selectedClass?.arms.find((a) => a._id === e.target.value);
            setSelectedArm(arm);
          }}
          value={selectedArm?._id || ""}
          disabled={!selectedClass}
          className="border rounded px-2 py-2 text-sm min-w-[120px]"
        >
          <option value="">Arm</option>
          {selectedClass?.arms.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>

        {/* Buttons */}
        <button
          onClick={fetchResults}
          disabled={loading || !selectedArm}
          className={`px-4 py-2 rounded text-sm whitespace-nowrap ${
            loading || !selectedArm
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-purple-700 text-white hover:bg-purple-800"
          }`}
        >
          {loading ? "Loading..." : "View"}
        </button>

        {results.length > 0 && (
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            🖨️ Print
          </button>
        )}
      </div>

      {/* 🔹 Results Table */}
      <div className="mt-4" ref={printRef}>
        {loading ? (
          <p className="text-center text-gray-500">Fetching results...</p>
        ) : results.length > 0 ? (
          <>
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-purple-700">
                {selectedClass?.name} ({selectedArm?.name})
              </h3>
              <p className="text-sm text-gray-500">
                Term: {selectedTerm?.name} | Session: {selectedSession?.name}
              </p>
            </div>

            <div className="overflow-x-auto bg-white rounded shadow-sm">
              <table className="w-full text-xs border border-gray-200 table-fixed">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border w-[5px] h-[100px]">#</th>
                    <th className="border text-left w-[30px] h-[100px]">Student</th>

                    {/* Subjects */}
                    {subjects.map((subj, i) => (
                      <th
                        key={i}
                        className="border w-[10px] h-[100px] text-[10px] leading-tight subject-header"
                        style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap", textAlign: "center", verticalAlign: "middle" }}
                      >
                        {subj}
                      </th>
                    ))}

                    <th className="border w-[10px] h-[100px] text-center font-semibold"
                        style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap", textAlign: "center", verticalAlign: "middle" }}
                    >
                      Average
                    </th>
                    <th className="border w-[10px] h-[100px] text-center font-semibold"
                        style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap", textAlign: "center", verticalAlign: "middle" }}
                    >
                      Grade
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((r, i) => {
                    const subjectScores = subjects.map((subj) => {
                      const s = r.subjects.find((ss) => ss.subject === subj);
                      return s ? s.total : "-";
                    });

                    const numericScores = subjectScores.filter((v) => !isNaN(v));
                    const avg =
                      numericScores.length > 0
                        ? (
                            numericScores.reduce((a, b) => a + b, 0) / numericScores.length
                          ).toFixed(1)
                        : "-";
                    const grade = getGrade(avg);

                    return (
                      <tr key={r.student._id || i} className="odd:bg-white even:bg-gray-50 hover:bg-purple-50">
                        <td className="border text-center py-1">{i + 1}</td>
                        <td className="border text-left px-2 py-1 truncate">{r.student.name}</td>
                        {subjectScores.map((score, j) => (
                          <td key={j} className={`border text-center py-1 ${getGradeColor(score)}`}>
                            {score}
                          </td>
                        ))}
                        <td className="border text-center font-semibold avg">{avg}</td>
                        <td className="border text-center font-semibold grade">{grade}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 italic mt-4">
            No results available for this class and term.
          </p>
        )}
      </div>
    </div>
  );
}