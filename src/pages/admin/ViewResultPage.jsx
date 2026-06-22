

// src/pages/admin/ViewResultsBySubject.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";

const getApiData = (res) => res?.data?.data ?? res?.data ?? [];

export default function ViewResultsBySubject() {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);

  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedArm, setSelectedArm] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get("/sessions");
        const payload = getApiData(res);
        setSessions(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setSessions([]);
      }
    };

    fetchSessions();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/classes");
        const payload = getApiData(res);
        setClasses(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setClasses([]);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/subjects");
        const payload = getApiData(res);
        setSubjects(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setSubjects([]);
      }
    };

    fetchSubjects();
  }, []);

  const resetResults = () => {
    setResults([]);
  };

  const fetchResults = async () => {
    if (
      !selectedSession ||
      !selectedTerm ||
      !selectedClass ||
      !selectedArm ||
      !selectedSubject
    ) {
      return;
    }

    try {
      setLoading(true);

      const res = await api.get("/results/by-subject", {
        params: {
          classId: selectedClass._id,
          armId: selectedArm._id,
          subjectId: selectedSubject._id,
          termId: selectedTerm._id,
          sessionId: selectedSession._id,
        },
      });

      const payload =
        res.data?.data || res.data?.results || res.data || [];

      setResults(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error("Error fetching results:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <h2 className="mb-4 text-center text-lg font-bold text-purple-700 md:text-xl">
        📊 View Results by Subject
      </h2>

      <div className="mb-5 flex flex-wrap gap-2 overflow-x-auto rounded-lg bg-white p-3 shadow-sm">
        <select
          onChange={(e) => {
            const session = sessions.find((s) => s._id === e.target.value);
            setSelectedSession(session || null);
            setSelectedTerm(null);
            setSelectedClass(null);
            setSelectedArm(null);
            setSelectedSubject(null);
            resetResults();
          }}
          value={selectedSession?._id || ""}
          className="min-w-[130px] rounded border px-2 py-2 text-sm"
        >
          <option value="">Session</option>
          {sessions.map((session) => (
            <option key={session._id} value={session._id}>
              {session.name}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => {
            const term = selectedSession?.terms?.find(
              (t) => t._id === e.target.value
            );

            setSelectedTerm(term || null);
            setSelectedClass(null);
            setSelectedArm(null);
            setSelectedSubject(null);
            resetResults();
          }}
          value={selectedTerm?._id || ""}
          disabled={!selectedSession}
          className="min-w-[110px] rounded border px-2 py-2 text-sm"
        >
          <option value="">Term</option>
          {(selectedSession?.terms || []).map((term) => (
            <option key={term._id} value={term._id}>
              {term.name}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => {
            const cls = classes.find((c) => c._id === e.target.value);

            setSelectedClass(cls || null);
            setSelectedArm(null);
            setSelectedSubject(null);
            resetResults();
          }}
          value={selectedClass?._id || ""}
          disabled={!selectedTerm}
          className="min-w-[120px] rounded border px-2 py-2 text-sm"
        >
          <option value="">Class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => {
            const arm = selectedClass?.arms?.find(
              (a) => a._id === e.target.value
            );

            setSelectedArm(arm || null);
            setSelectedSubject(null);
            resetResults();
          }}
          value={selectedArm?._id || ""}
          disabled={!selectedClass}
          className="min-w-[120px] rounded border px-2 py-2 text-sm"
        >
          <option value="">Arm</option>
          {(selectedClass?.arms || []).map((arm) => (
            <option key={arm._id} value={arm._id}>
              {arm.name}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => {
            const subject = subjects.find((s) => s._id === e.target.value);

            setSelectedSubject(subject || null);
            resetResults();
          }}
          value={selectedSubject?._id || ""}
          disabled={!selectedArm}
          className="min-w-[150px] rounded border px-2 py-2 text-sm"
        >
          <option value="">Subject</option>
          {subjects.map((subject) => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
          ))}
        </select>

        <button
          onClick={fetchResults}
          disabled={
            loading ||
            !selectedSession ||
            !selectedTerm ||
            !selectedClass ||
            !selectedArm ||
            !selectedSubject
          }
          className={`whitespace-nowrap rounded px-4 py-2 text-sm ${
            loading ||
            !selectedSession ||
            !selectedTerm ||
            !selectedClass ||
            !selectedArm ||
            !selectedSubject
              ? "cursor-not-allowed bg-gray-300 text-gray-600"
              : "bg-purple-700 text-white hover:bg-purple-800"
          }`}
        >
          {loading ? "Loading..." : "View"}
        </button>
      </div>

      <div className="mt-4">
        {loading ? (
          <p className="text-center text-gray-500">Fetching results...</p>
        ) : results.length > 0 ? (
          <>
            <div className="mb-4 text-center">
              <h3 className="text-lg font-semibold text-purple-700">
                {selectedClass?.name} ({selectedArm?.name}) -{" "}
                {selectedSubject?.name}
              </h3>

              <p className="text-sm text-gray-500">
                Term: {selectedTerm?.name} | Session: {selectedSession?.name}
              </p>
            </div>

            <div className="overflow-x-auto rounded bg-white shadow-sm">
              <table className="w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">#</th>
                    <th className="border p-2">Student</th>
                    <th className="border p-2">CA1</th>
                    <th className="border p-2">CA2</th>
                    <th className="border p-2">CA3</th>
                    <th className="border p-2">CA4</th>
                    <th className="border p-2">Exam</th>
                    <th className="border p-2">Total</th>
                    <th className="border p-2">Grade</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((result, index) => (
                    <tr
                      key={result.enrollmentId || result._id || index}
                      className="odd:bg-white even:bg-gray-50"
                    >
                      <td className="border p-2 text-center">{index + 1}</td>

                      <td className="border p-2">
                        {result.student?.name || "Unknown"}
                      </td>

                      <td className="border p-2 text-center">
                        {result.ca1 ?? "-"}
                      </td>

                      <td className="border p-2 text-center">
                        {result.ca2 ?? "-"}
                      </td>

                      <td className="border p-2 text-center">
                        {result.ca3 ?? "-"}
                      </td>

                      <td className="border p-2 text-center">
                        {result.ca4 ?? "-"}
                      </td>

                      <td className="border p-2 text-center">
                        {result.exam ?? "-"}
                      </td>

                      <td className="border p-2 text-center font-semibold">
                        {result.total ?? "-"}
                      </td>

                      <td className="border p-2 text-center font-semibold">
                        {result.grade ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="mt-4 text-center italic text-gray-500">
            No results available for this selection.
          </p>
        )}
      </div>
    </div>
  );
}