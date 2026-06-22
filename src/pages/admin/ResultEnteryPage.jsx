
// src/pages/admin/ResultEntryPage.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const getApiData = (res) => res?.data?.data ?? res?.data ?? [];

const getId = (item) => item?._id ?? item?.id ?? item?.subjectId ?? item?.classId ?? item?.armId;

export default function ResultEntryPage() {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedArm, setSelectedArm] = useState(null);

  const [activeSession, setActiveSession] = useState(null);
  const [activeTerm, setActiveTerm] = useState(null);

  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingResults, setSavingResults] = useState(false);

  useEffect(() => {
    const fetchActiveSessionTerm = async () => {
      try {
        const res = await api.get("/sessions/active");
        const payload = getApiData(res);

        setActiveSession(payload?.session || res.data?.session || null);
        setActiveTerm(payload?.term || res.data?.term || null);
      } catch (err) {
        console.error("Error fetching active session/term:", err);
        toast.error("Please set active session and term first.");
      }
    };

    fetchActiveSessionTerm();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);

        let res;

        if (["admin", "super_admin", "principal", "master_admin", "teacher"].includes(user.role)) {
          res = await api.get("/subjects");
        } else if (user.role === "teacher") {
          res = await api.get(`/teacher-assignments/${user._id}/subjects`);
        }

        const payload = getApiData(res);
        setSubjects(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        toast.error("Failed to load subjects");
        setSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [user]);

  const handleSubjectSelect = async (subjectId) => {
    const subject = subjects.find(s => getId(s) === subjectId);
    setSelectedSubject(subject);
    setSelectedClass(null);
    setSelectedArm(null);
    setClasses([]);
    setArms([]);
    setStudents([]);
    setScores({});

    if (!subject) return;

    try {
      setLoadingClasses(true);

      const subjectIdValue = getId(subject);
      const res = await api.get(`/subjects/${subjectIdValue}/classes`);
      const payload = getApiData(res);

      setClasses(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error("Error fetching classes:", err);
      toast.error("Failed to load classes for subject");
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleClassSelect = (classId) => {
    const cls = classes.find(c => getId(c) === classId);
    setSelectedClass(cls);
    setSelectedArm(null);
    setStudents([]);
    setScores({});
    setArms(cls?.arms ?? cls?.armsList ?? []);
  };

  const handleArmSelect = async (armId) => {
    const arm = arms.find(a => getId(a) === armId);
    setSelectedArm(arm);
    setStudents([]);
    setScores({});

    if (!selectedClass || !selectedSubject || !activeSession || !activeTerm) {
      toast.error("Please select subject, class, arm, session and term.");
      return;
    }

    try {
      setLoadingStudents(true);

      const classId = getId(selectedClass);
      const armIdValue = getId(arm);
      const subjectId = getId(selectedSubject);
      const sessionId = activeSession._id;
      const termId = activeTerm._id;

      const [stuRes, resultRes] = await Promise.all([
        api.get("/students", {
          params: { classId, armId: armIdValue, sessionId },
        }),
        api.get("/results/by-subject", {
          params: { classId, armId: armIdValue, subjectId, sessionId, termId },
        }),
      ]);

      const studentPayload = getApiData(stuRes);
      const resultPayload = getApiData(resultRes);

      const studentList = Array.isArray(studentPayload) ? studentPayload : [];
      const existingResults = Array.isArray(resultPayload) ? resultPayload : [];

      const newScores = {};

      existingResults.forEach((r) => {
        const enrollmentId = r.enrollmentId?._id ?? r.enrollmentId;

        if (!enrollmentId) return;

        newScores[enrollmentId] = {
          ca1: r.ca1 ?? "",
          ca2: r.ca2 ?? "",
          ca3: r.ca3 ?? "",
          ca4: r.ca4 ?? "",
          exam: r.exam ?? "",
        };
      });

      setStudents(studentList);
      setScores(newScores);
    } catch (err) {
      console.error("Error fetching arm data:", err);
      toast.error(err.response?.data?.message || "Failed to load students/results");
      setStudents([]);
      setScores({});
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleScoreChange = (enrollmentId, field, value) => {
    let num = value === "" ? "" : Number(value);

    if (value !== "" && Number.isNaN(num)) return;

    if (field.startsWith("ca") && num !== "") {
      num = Math.max(0, Math.min(num, 10));
    }

    if (field === "exam" && num !== "") {
      num = Math.max(0, Math.min(num, 60));
    }

    setScores((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...(prev[enrollmentId] || {}),
        [field]: num,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !selectedClass || !selectedArm) {
      toast.error("Please select subject, class and arm.");
      return;
    }

    if (!activeSession || !activeTerm) {
      toast.error("No active session/term found.");
      return;
    }

    const subjectId = getId(selectedSubject);
    const classId = getId(selectedClass);
    const armId = getId(selectedArm);

    const resultsArray = Object.entries(scores)
      .filter(([, sc]) => Object.values(sc).some((v) => v !== ""))
      .map(([enrollmentId, sc]) => {
        const result = { enrollmentId };

        ["ca1", "ca2", "ca3", "ca4", "exam"].forEach((field) => {
          if (sc[field] !== "" && sc[field] !== undefined) {
            result[field] = Number(sc[field]);
          }
        });

        return result;
      });

    if (resultsArray.length === 0) {
      toast.error("No scores entered.");
      return;
    }

    try {
      setSavingResults(true);

      await api.post("/results/add-or-update", {
        subjectId,
        classId,
        armId,
        sessionId: activeSession._id,
        termId: activeTerm._id,
        results: resultsArray,
      });

      toast.success("Results saved successfully!");
    } catch (err) {
      console.error("Error saving results:", err);
      toast.error(err.response?.data?.message || "Failed to save results.");
    } finally {
      setSavingResults(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-3 px-2 sm:px-4 md:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Compact Header */}
        <div className="mb-3 rounded-xl bg-white p-3 shadow-sm sm:p-4">
          <h2 className="text-lg font-bold text-green-700 sm:text-xl">
            Result Entry
          </h2>
          <p className="mt-0.5 text-xs text-gray-600">
            {activeSession && activeTerm
              ? `${activeSession.name} • ${activeTerm.name}`
              : "No active session/term selected"}
          </p>
        </div>

        {/* Subject Dropdown */}
        <div className="mb-3 rounded-xl bg-white p-3 shadow-sm sm:p-4">
          <label className="mb-1 block text-sm font-semibold text-green-700">
            Select Subject
          </label>
          <select
            value={selectedSubject ? getId(selectedSubject) : ""}
            onChange={(e) => handleSubjectSelect(e.target.value)}
            disabled={loadingSubjects || loadingClasses || loadingStudents || savingResults}
            className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
          >
            <option value="">-- Choose a subject --</option>
            {subjects.map((subject) => (
              <option key={getId(subject)} value={getId(subject)}>
                {subject.name ?? subject.title}
              </option>
            ))}
          </select>
          {loadingSubjects && (
            <p className="mt-1 text-xs text-gray-500">Loading subjects...</p>
          )}
        </div>

        {/* Class Dropdown */}
        {selectedSubject && (
          <div className="mb-3 rounded-xl bg-white p-3 shadow-sm sm:p-4">
            <label className="mb-1 block text-sm font-semibold text-purple-700">
              Select Class
            </label>
            <select
              value={selectedClass ? getId(selectedClass) : ""}
              onChange={(e) => handleClassSelect(e.target.value)}
              disabled={loadingClasses || loadingStudents || savingResults || classes.length === 0}
              className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
            >
              <option value="">-- Choose a class --</option>
              {classes.map((cls) => (
                <option key={getId(cls)} value={getId(cls)}>
                  {cls.name ?? cls.className}
                </option>
              ))}
            </select>
            {loadingClasses && (
              <p className="mt-1 text-xs text-gray-500">Loading classes...</p>
            )}
            {!loadingClasses && classes.length === 0 && selectedSubject && (
              <p className="mt-1 text-xs text-yellow-600">
                No classes available for this subject
              </p>
            )}
          </div>
        )}

        {/* Arm Dropdown */}
        {selectedClass && (
          <div className="mb-3 rounded-xl bg-white p-3 shadow-sm sm:p-4">
            <label className="mb-1 block text-sm font-semibold text-blue-700">
              Select Arm
            </label>
            <select
              value={selectedArm ? getId(selectedArm) : ""}
              onChange={(e) => handleArmSelect(e.target.value)}
              disabled={savingResults || arms.length === 0}
              className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            >
              <option value="">-- Choose an arm --</option>
              {arms.map((arm) => (
                <option key={getId(arm)} value={getId(arm)}>
                  {arm.name ?? arm.armName}
                </option>
              ))}
            </select>
            {arms.length === 0 && selectedClass && (
              <p className="mt-1 text-xs text-yellow-600">
                No arms found for this class
              </p>
            )}
          </div>
        )}

        {/* Results Entry Section */}
        {selectedArm && (
          <div className="rounded-xl bg-white p-3 shadow-sm sm:p-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Scores Entry
                </h3>
                <p className="text-xs text-gray-500">
                  CA scores: 0-10 each • Exam: 0-60
                </p>
              </div>

              {students.length > 0 && (
                <button
                  onClick={handleSubmit}
                  disabled={savingResults}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {savingResults ? "Saving..." : "Save Results"}
                </button>
              )}
            </div>

            {loadingStudents ? (
              <div className="py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <p className="mt-2 text-sm text-gray-500">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500">
                  No students found in this arm.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="space-y-3 md:hidden">
                  {students.map((enrollment) => {
                    const enrollmentId = enrollment._id;
                    const student = enrollment.studentId;
                    const current = scores[enrollmentId] || {};

                    return (
                      <div
                        key={enrollmentId}
                        className="rounded-lg border border-gray-200 bg-white p-3"
                      >
                        <div className="mb-3 pb-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">
                            {student?.name || "Unknown Student"}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {student?.admissionNumber || "—"}
                          </p>
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                          {["ca1", "ca2", "ca3", "ca4", "exam"].map((field) => (
                            <div key={`${enrollmentId}-${field}`}>
                              <label className="mb-1 block text-center text-[10px] font-medium uppercase text-gray-500">
                                {field === "exam" ? "Exam" : field.toUpperCase()}
                              </label>
                              <input
                                type="number"
                                inputMode="numeric"
                                value={current[field] ?? ""}
                                onChange={(e) =>
                                  handleScoreChange(
                                    enrollmentId,
                                    field,
                                    e.target.value
                                  )
                                }
                                placeholder="-"
                                className="w-full rounded-lg border border-gray-300 p-2 text-center text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-green-600 text-white">
                        <th className="p-3 text-left rounded-tl-lg">Student</th>
                        <th className="p-3 text-center">CA1</th>
                        <th className="p-3 text-center">CA2</th>
                        <th className="p-3 text-center">CA3</th>
                        <th className="p-3 text-center">CA4</th>
                        <th className="p-3 text-center rounded-tr-lg">Exam</th>
                       </tr>
                    </thead>
                    <tbody>
                      {students.map((enrollment, idx) => {
                        const enrollmentId = enrollment._id;
                        const student = enrollment.studentId;
                        const current = scores[enrollmentId] || {};

                        return (
                          <tr
                            key={enrollmentId}
                            className={`border-b ${
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } hover:bg-gray-100`}
                          >
                            <td className="p-3">
                              <div className="font-medium text-gray-900">
                                {student?.name || "Unknown Student"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {student?.admissionNumber || "—"}
                              </div>
                             </td>

                            {["ca1", "ca2", "ca3", "ca4", "exam"].map((field) => (
                              <td key={`${enrollmentId}-${field}`} className="p-2 text-center">
                                <input
                                  type="number"
                                  value={current[field] ?? ""}
                                  onChange={(e) =>
                                    handleScoreChange(
                                      enrollmentId,
                                      field,
                                      e.target.value
                                    )
                                  }
                                  className="w-20 rounded-lg border border-gray-300 p-2 text-center focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                                  placeholder="-"
                                />
                               </td>
                            ))}
                           </tr>
                        );
                      })}
                    </tbody>
                   </table>
                </div>

                {/* Sticky Save Button for Mobile */}
                {students.length > 0 && (
                  <div className="sticky bottom-0 mt-4 -mx-3 bg-white p-3 shadow-lg rounded-t-xl md:hidden">
                    <button
                      onClick={handleSubmit}
                      disabled={savingResults}
                      className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-green-700 disabled:opacity-60 active:scale-95 transition-transform"
                    >
                      {savingResults ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Saving...
                        </span>
                      ) : (
                        "Save All Results"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}