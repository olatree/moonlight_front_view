
// src/pages/admin/TeacherComments.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";

const PAGE_SIZE = 10;

const getApiData = (res) => res?.data?.data ?? res?.data ?? [];

const TeacherComments = () => {
  const { user } = useAuth();

  const isClassTeacherOnly =
  user?.role === "teacher" &&
  user?.isClassTeacher === true &&
  user?.classTeacherOf?.classId &&
  user?.classTeacherOf?.armId;

const assignedClassId =
  user?.classTeacherOf?.classId?._id || user?.classTeacherOf?.classId;

const assignedArmId =
  user?.classTeacherOf?.armId?._id || user?.classTeacherOf?.armId;

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedArm, setSelectedArm] = useState(null);

  const [activeSession, setActiveSession] = useState(null);
  const [activeTerm, setActiveTerm] = useState(null);

  const [comments, setComments] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // -----------------------------------
  // ACTIVE SESSION
  // -----------------------------------

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await api.get("/sessions/active");

        setActiveSession(res.data?.session);
        setActiveTerm(res.data?.term);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch active session/term.");
      }
    };

    fetchActive();
  }, []);

  // -----------------------------------
  // FETCH CLASSES
  // -----------------------------------

  // useEffect(() => {
  //   const fetchClasses = async () => {
  //     try {
  //       const res = await api.get("/classes");

  //       const payload = getApiData(res);

  //       setClasses(Array.isArray(payload) ? payload : []);
  //     } catch (err) {
  //       console.error(err);
  //       setError("Failed to fetch classes.");
  //     }
  //   };

  //   fetchClasses();
  // }, []);

  useEffect(() => {
  const fetchClasses = async () => {
    try {
      const res = await api.get("/classes");
      const payload = getApiData(res);
      const allClasses = Array.isArray(payload) ? payload : [];

      if (isClassTeacherOnly) {
        const assignedClass = allClasses.find(
          (cls) => cls._id === assignedClassId
        );

        if (!assignedClass) {
          setError("Assigned class not found.");
          setClasses([]);
          return;
        }

        const assignedArm = assignedClass.arms?.find(
          (arm) => arm._id === assignedArmId
        );

        if (!assignedArm) {
          setError("Assigned arm not found.");
          setClasses([assignedClass]);
          setSelectedClass(assignedClass);
          return;
        }

        setClasses([assignedClass]);
        setSelectedClass(assignedClass);
        setSelectedArm(assignedArm);

        return;
      }

      setClasses(allClasses);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch classes.");
    }
  };

  fetchClasses();
}, [isClassTeacherOnly, assignedClassId, assignedArmId]);

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

      // STUDENTS

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

      // REPORTS

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
            report.classTeacherComment || "";
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

  useEffect(() => {
  if (
    isClassTeacherOnly &&
    selectedClass &&
    selectedArm &&
    activeSession?._id &&
    activeTerm?._id
  ) {
    handleArmSelect(selectedArm);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isClassTeacherOnly, selectedClass, selectedArm, activeSession, activeTerm]);

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
  // SAVE
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
          classTeacherComment: comment,
        })
      );

      await api.post("/term-reports/class-teacher", {
        reports: payload,
      });

      setSuccess("Comments saved successfully.");
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
            Teacher Comments
          </h1>

          {activeSession && activeTerm && (
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Session: <b>{activeSession.name}</b> | Term:{" "}
              <b>{activeTerm.name}</b>
            </p>
          )}
        </div>

        {/* ALERTS */}

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SELECTORS */}

        <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* CLASS */}

            {/* <select
              value={selectedClass?._id || ""}
              onChange={(e) => {
                const cls = classes.find(
                  (c) => c._id === e.target.value
                );

                handleClassSelect(cls);
              }}
              className="rounded-lg border px-3 py-2 text-sm"
            > */}
            <select
              value={selectedClass?._id || ""}
              disabled={isClassTeacherOnly}
              onChange={(e) => {
                const cls = classes.find((c) => c._id === e.target.value);
                handleClassSelect(cls);
              }}
              className="rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100"
            >
              <option value="">Select Class</option>

              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>

            {/* ARM */}

            {/* <select
              value={selectedArm?._id || ""}
              disabled={!selectedClass}
              onChange={(e) => {
                const arm = selectedClass?.arms?.find(
                  (a) => a._id === e.target.value
                );

                handleArmSelect(arm);
              }}
              className="rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100"
            > */}
            <select
              value={selectedArm?._id || ""}
              disabled={!selectedClass || isClassTeacherOnly}
              onChange={(e) => {
                const arm = selectedClass?.arms?.find((a) => a._id === e.target.value);
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
                Student Comments
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
                      placeholder="Enter teacher comment..."
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

export default TeacherComments;