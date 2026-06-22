


// src/pages/admin/PrincipalReportEntry.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";

const PAGE_SIZE = 10;

const getApiData = (res) => res?.data?.data ?? res?.data ?? [];

const PrincipalReportEntry = () => {
  const { user } = useAuth();

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedArm, setSelectedArm] = useState(null);

  const [activeSession, setActiveSession] = useState(null);
  const [activeTerm, setActiveTerm] = useState(null);

  const [comments, setComments] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  // -----------------------------------
  // ACTIVE SESSION + TERM
  // -----------------------------------

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await api.get("/sessions/active");

        setActiveSession(res.data?.session);
        setActiveTerm(res.data?.term);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch active session and term.");
      }
    };

    fetchActive();
  }, []);

  // -----------------------------------
  // FETCH CLASSES
  // -----------------------------------

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/classes");

        const payload = getApiData(res);

        setClasses(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch classes.");
      }
    };

    fetchClasses();
  }, []);

  // -----------------------------------
  // CLASS SELECT
  // -----------------------------------

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    setSelectedArm(null);

    setStudents([]);
    setComments({});

    setCurrentPage(1);

    setSuccess("");
    setError("");
  };

  // -----------------------------------
  // ARM SELECT
  // -----------------------------------

  const handleArmSelect = async (arm) => {
    try {
      setLoading(true);

      setSelectedArm(arm);

      setStudents([]);
      setComments({});

      setCurrentPage(1);

      const classId = selectedClass?._id;
      const armId = arm?._id;

      // FETCH STUDENTS

      const studentRes = await api.get("/students", {
        params: {
          classId,
          armId,
          sessionId: activeSession?._id,
        },
      });

      const studentPayload = getApiData(studentRes);

      const studentList = Array.isArray(studentPayload)
        ? studentPayload
        : [];

      // FETCH REPORTS

      const reportRes = await api.get("/term-reports", {
        params: {
          classId,
          armId,
          sessionId: activeSession?._id,
          termId: activeTerm?._id,
        },
      });

      const reportPayload = getApiData(reportRes);

      const reports = Array.isArray(reportPayload)
        ? reportPayload
        : [];

      const existingComments = {};

      reports.forEach((report) => {
        const sid = report.enrollmentId?.studentId?._id;

        if (sid) {
          existingComments[sid] =
            report.principalComment || "";
        }
      });

      setStudents(studentList);
      setComments(existingComments);
    } catch (err) {
      console.error(err);
      setError("Failed to load students or reports.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------
  // COMMENT CHANGE
  // -----------------------------------

  const handleCommentChange = (studentId, value) => {
    setComments((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  // -----------------------------------
  // PAGINATION
  // -----------------------------------

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    return students.slice(start, end);
  }, [students, currentPage]);

  const totalPages = Math.ceil(students.length / PAGE_SIZE);

  // -----------------------------------
  // SAVE COMMENTS
  // -----------------------------------

  const handleSave = async () => {
    try {
      setSaving(true);

      setSuccess("");
      setError("");

      if (!selectedClass || !selectedArm) {
        setError("Please select class and arm.");
        return;
      }

      const payload = Object.entries(comments).map(
        ([studentId, comment]) => ({
          studentId,
          sessionId: activeSession?._id,
          termId: activeTerm?._id,
          principalComment: comment,
        })
      );

      await api.post("/term-reports/principal", {
        reports: payload,
      });

      setSuccess("Principal comments saved successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to save comments."
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------
  // UI
  // -----------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl p-3 sm:p-5">
        {/* HEADER */}

        <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
          <h1 className="text-lg font-bold text-green-700 sm:text-xl">
            Principal Report Entry
          </h1>

          {activeSession && activeTerm && (
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Session: <b>{activeSession.name}</b> | Term:{" "}
              <b>{activeTerm.name}</b>
            </p>
          )}
        </div>

        {/* SUCCESS */}

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SELECTORS */}

        <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* CLASS */}

            <select
              value={selectedClass?._id || ""}
              onChange={(e) => {
                const cls = classes.find(
                  (c) => c._id === e.target.value
                );

                handleClassSelect(cls);
              }}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Select Class</option>

              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>

            {/* ARM */}

            <select
              value={selectedArm?._id || ""}
              disabled={!selectedClass}
              onChange={(e) => {
                const arm = selectedClass?.arms?.find(
                  (a) => a._id === e.target.value
                );

                handleArmSelect(arm);
              }}
              className="rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100"
            >
              <option value="">Select Arm</option>

              {(selectedClass?.arms || []).map((arm) => (
                <option key={arm._id} value={arm._id}>
                  {arm.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">
            Loading students...
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          selectedArm &&
          students.length === 0 && (
            <div className="rounded-xl bg-white p-10 text-center text-gray-400 shadow-sm">
              No students found for this class and arm.
            </div>
          )}

        {/* STUDENTS */}

        {!loading && students.length > 0 && (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-green-700">
                Principal Comments
              </h2>

              <span className="text-xs text-gray-500">
                {students.length} students
              </span>
            </div>

            <div className="space-y-3">
              {paginatedStudents.map((enrollment) => {
                const student = enrollment.studentId;

                const sid =
                  student?._id || enrollment._id;

                return (
                  <div
                    key={sid}
                    className="rounded-xl border bg-gray-50 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {student?.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {student?.admissionNumber}
                        </p>
                      </div>
                    </div>

                    <textarea
                      value={comments[sid] || ""}
                      onChange={(e) =>
                        handleCommentChange(
                          sid,
                          e.target.value
                        )
                      }
                      placeholder="Enter principal comment..."
                      rows={3}
                      className="w-full rounded-lg border p-2 text-sm outline-none focus:border-green-500"
                    />
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((p) => p - 1)
                  }
                  className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
                >
                  Prev
                </button>

                <span className="text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => p + 1)
                  }
                  className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}

            {/* SAVE */}

            <div className="sticky bottom-0 mt-6 bg-white pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving Comments..."
                  : "Save Comments"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrincipalReportEntry;