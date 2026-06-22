
// src/pages/admin/ViewResultsByStudent.jsx
import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";

const getApiData = (res) => res?.data?.data ?? res?.data ?? [];

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") return value._id || value.id || "";
  return value;
};

export default function ViewResultsByStudent() {
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedArm, setSelectedArm] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);

  const [viewMode, setViewMode] = useState("results");
  const [results, setResults] = useState(null);
  const [profile, setProfile] = useState(null);
  const [expandedTerms, setExpandedTerms] = useState({});

  const printRef = useRef(null);

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
    const fetchStudents = async () => {
      try {
        const res = await api.get("/students");
        const payload = getApiData(res);
        const data = Array.isArray(payload) ? payload : [];

        if (data.length > 0 && data[0].studentId) {
          const uniqueStudents = [];
          const studentIds = new Set();

          data.forEach((enrollment) => {
            const student = enrollment.studentId;

            if (student && !studentIds.has(student._id)) {
              studentIds.add(student._id);

              uniqueStudents.push({
                _id: student._id,
                name: student.name,
                admissionNumber: student.admissionNumber || "N/A",
                gender: student.gender,
                parentContact: student.parentContact,
                image: student.image,
                classId: getId(enrollment.classId),
                className: enrollment.classId?.name || "",
                armId: getId(enrollment.armId),
                armName: enrollment.armId?.name || "",
              });
            }
          });

          uniqueStudents.sort((a, b) => a.name.localeCompare(b.name));
          setStudents(uniqueStudents);
          setFilteredStudents(uniqueStudents);
        } else {
          setStudents(data);
          setFilteredStudents(data);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setStudents([]);
        setFilteredStudents([]);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = students;

    if (selectedClass) {
      filtered = filtered.filter(
        (student) => getId(student.classId) === selectedClass._id
      );
    }

    if (selectedArm) {
      filtered = filtered.filter(
        (student) => getId(student.armId) === selectedArm._id
      );
    }

    setFilteredStudents(filtered);
    setSelectedStudent(null);
    setResults(null);
    setProfile(null);
  }, [selectedClass, selectedArm, students]);

  const availableArms = selectedClass?.arms || [];

  const fetchResults = async () => {
    if (!selectedStudent) {
      setError("Please select a student");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = {
        studentId: selectedStudent._id,
      };

      if (selectedSession) params.sessionId = selectedSession._id;
      if (selectedTerm) params.termId = selectedTerm._id;

      const res = await api.get("/results/by-student", { params });
      const payload = getApiData(res);

      setResults(payload);
      setProfile(null);
      setViewMode("results");

      if (payload?.results?.length > 0) {
        setExpandedTerms({ "result-0": true });
      }
    } catch (err) {
      console.error("Failed to fetch results:", err);
      setError(err.response?.data?.message || "Failed to fetch results");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!selectedStudent) {
      setError("Please select a student");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = {
        studentId: selectedStudent._id,
      };

      if (selectedSession) params.sessionId = selectedSession._id;

      const res = await api.get("/results/student-profile", { params });
      const payload = getApiData(res);

      setProfile(payload);
      setResults(null);
      setViewMode("profile");

      const expanded = {};

      payload?.academicHistory?.forEach((session, sessionIndex) => {
        session.terms?.forEach((term, termIndex) => {
          expanded[`profile-${sessionIndex}-${termIndex}`] = true;
        });
      });

      setExpandedTerms(expanded);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError(err.response?.data?.message || "Failed to fetch profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleTerm = (key) => {
    setExpandedTerms((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getGradeColor = (grade) => {
    const colors = {
      A: "bg-green-100 text-green-800",
      B: "bg-blue-100 text-blue-800",
      C: "bg-yellow-100 text-yellow-800",
      D: "bg-orange-100 text-orange-800",
      E: "bg-orange-100 text-orange-800",
      F: "bg-red-200 text-red-900",
    };

    return colors[grade] || "bg-gray-100 text-gray-800";
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open("", "", "width=1200,height=800");

    if (!printWindow) {
      alert("Please allow popups to print.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${viewMode === "profile" ? "Profile" : "Results"} - ${
      selectedStudent?.name || "Student"
    }</title>
          <style>
            @page { size: A4; margin: 20px; }
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f3f4f6; }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
          </style>
        </head>
        <body>${printRef.current.innerHTML}</body>
      </html>
    `);

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold text-purple-700 sm:text-xl">
            View Results by Student
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Select class, arm, and student to view academic records.
          </p>
        </div>

        <div className="mb-5 rounded-xl border border-purple-100 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <select
              onChange={(e) => {
                const cls = classes.find((c) => c._id === e.target.value);

                setSelectedClass(cls || null);
                setSelectedArm(null);
                setSelectedStudent(null);
                setResults(null);
                setProfile(null);
                setError("");
              }}
              value={selectedClass?._id || ""}
              className="rounded-lg border border-purple-200 px-3 py-2 text-sm"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>

            <select
              onChange={(e) => {
                const arm = availableArms.find((a) => a._id === e.target.value);

                setSelectedArm(arm || null);
                setSelectedStudent(null);
                setResults(null);
                setProfile(null);
                setError("");
              }}
              value={selectedArm?._id || ""}
              disabled={!selectedClass}
              className="rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100"
            >
              <option value="">All Arms</option>
              {availableArms.map((arm) => (
                <option key={arm._id} value={arm._id}>
                  {arm.name}
                </option>
              ))}
            </select>

            <select
              onChange={(e) => {
                const student = filteredStudents.find(
                  (s) => s._id === e.target.value
                );

                setSelectedStudent(student || null);
                setResults(null);
                setProfile(null);
                setError("");
              }}
              value={selectedStudent?._id || ""}
              disabled={filteredStudents.length === 0}
              className="rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100"
            >
              <option value="">
                {selectedClass && selectedArm
                  ? "Select Student"
                  : selectedClass
                  ? "Select Arm First"
                  : "Select Student"}
              </option>

              {filteredStudents.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.admissionNumber})
                </option>
              ))}
            </select>

            <select
              onChange={(e) => {
                const session = sessions.find((s) => s._id === e.target.value);

                setSelectedSession(session || null);
                setSelectedTerm(null);
                setResults(null);
                setProfile(null);
              }}
              value={selectedSession?._id || ""}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">All Sessions</option>
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
                setResults(null);
                setProfile(null);
              }}
              value={selectedTerm?._id || ""}
              disabled={!selectedSession}
              className="rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100"
            >
              <option value="">All Terms</option>
              {(selectedSession?.terms || []).map((term) => (
                <option key={term._id} value={term._id}>
                  {term.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              <button
                onClick={fetchResults}
                disabled={loading || !selectedStudent}
                className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300"
              >
                {loading ? "Loading..." : "Results"}
              </button>

              <button
                onClick={fetchProfile}
                disabled={loading || !selectedStudent}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300"
              >
                Profile
              </button>
            </div>
          </div>

          {(results || profile) && (
            <button
              onClick={handlePrint}
              className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white sm:w-auto"
            >
              Print
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">
            Loading...
          </div>
        )}

        {!loading && viewMode === "results" && results && (
          <div ref={printRef} className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-purple-700">
                {selectedStudent?.name}
              </h3>
              <p className="text-sm text-gray-500">
                Records found: {results.totalRecords || 0}
              </p>
            </div>

            {Array.isArray(results.results) && results.results.length > 0 ? (
              results.results.map((termResult, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleTerm(`result-${index}`)}
                    className="w-full bg-purple-50 p-4 text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {termResult.session} - {termResult.term}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {termResult.class} {termResult.arm}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs uppercase text-gray-500">
                          Average
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {termResult.average}%
                        </p>
                      </div>
                    </div>
                  </button>

                  {expandedTerms[`result-${index}`] && (
                    <div className="p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left">Subject</th>
                              <th className="px-2 py-2">CA1</th>
                              <th className="px-2 py-2">CA2</th>
                              <th className="px-2 py-2">CA3</th>
                              <th className="px-2 py-2">CA4</th>
                              <th className="px-2 py-2">Exam</th>
                              <th className="px-2 py-2">Total</th>
                              <th className="px-2 py-2">Grade</th>
                            </tr>
                          </thead>

                          <tbody>
                            {(termResult.subjects || []).map(
                              (subject, subjectIndex) => (
                                <tr key={subjectIndex} className="border-t">
                                  <td className="px-4 py-2 font-medium">
                                    {subject.subject}
                                  </td>
                                  <td className="px-2 py-2 text-center">
                                    {subject.ca1}
                                  </td>
                                  <td className="px-2 py-2 text-center">
                                    {subject.ca2}
                                  </td>
                                  <td className="px-2 py-2 text-center">
                                    {subject.ca3}
                                  </td>
                                  <td className="px-2 py-2 text-center">
                                    {subject.ca4}
                                  </td>
                                  <td className="px-2 py-2 text-center">
                                    {subject.exam}
                                  </td>
                                  <td className="px-2 py-2 text-center font-bold">
                                    {subject.total}
                                  </td>
                                  <td className="px-2 py-2 text-center">
                                    <span
                                      className={`rounded px-2 py-1 text-xs font-bold ${getGradeColor(
                                        subject.grade
                                      )}`}
                                    >
                                      {subject.grade}
                                    </span>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">
                No results found for this student.
              </div>
            )}
          </div>
        )}

        {!loading && viewMode === "profile" && profile && (
          <div ref={printRef} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-4 border-b pb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-700 text-3xl font-bold text-white">
                {profile.student?.name?.charAt(0) || "S"}
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  {profile.student?.name || selectedStudent?.name}
                </h1>
                <p className="text-gray-600">
                  ID:{" "}
                  {profile.student?.admissionNumber ||
                    selectedStudent?.admissionNumber}
                </p>
                <p className="text-gray-600">
                  Gender: {profile.student?.gender || selectedStudent?.gender || "N/A"}
                </p>
              </div>
            </div>

            {Array.isArray(profile.academicHistory) &&
            profile.academicHistory.length > 0 ? (
              <div className="space-y-4">
                {profile.academicHistory.map((session, sessionIndex) => (
                  <div key={sessionIndex} className="rounded-lg border p-4">
                    <h3 className="mb-3 font-bold text-purple-700">
                      {session.session}
                    </h3>

                    {(session.terms || []).map((term, termIndex) => (
                      <div
                        key={termIndex}
                        className="mb-3 rounded-lg bg-gray-50 p-3"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            toggleTerm(`profile-${sessionIndex}-${termIndex}`)
                          }
                          className="w-full text-left font-semibold"
                        >
                          {term.term} - Average: {term.average}%
                        </button>

                        {expandedTerms[
                          `profile-${sessionIndex}-${termIndex}`
                        ] && (
                          <div className="mt-3 overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr>
                                  <th className="p-2 text-left">Subject</th>
                                  <th className="p-2">Total</th>
                                  <th className="p-2">Grade</th>
                                </tr>
                              </thead>

                              <tbody>
                                {(term.subjects || []).map(
                                  (subject, subjectIndex) => (
                                    <tr
                                      key={subjectIndex}
                                      className="border-t"
                                    >
                                      <td className="p-2">{subject.subject}</td>
                                      <td className="p-2 text-center">
                                        {subject.total}
                                      </td>
                                      <td className="p-2 text-center">
                                        {subject.grade}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center italic text-gray-400">
                No academic history found.
              </p>
            )}
          </div>
        )}

        {!loading && !results && !profile && (
          <div className="rounded-xl border-2 border-dashed bg-gray-50 py-16 text-center">
            <p className="text-gray-400">
              Select class, arm, and student to view performance data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}