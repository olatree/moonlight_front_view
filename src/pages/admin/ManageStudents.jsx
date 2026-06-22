
import { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [activeTerm, setActiveTerm] = useState(null);

  const [selectedSession, setSelectedSession] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedArm, setSelectedArm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [blockingId, setBlockingId] = useState(null);
  const printRef = useRef();

  const getResponseData = (res) => res.data?.data ?? res.data;

  // ── initial load ──────────────────────────────────────────────────────────
  const fetchActiveSessionTerm = async () => {
    try {
      const res = await api.get("/sessions/active");
      const payload = getResponseData(res);
      const session = payload?.session || res.data?.session || null;
      const term = payload?.term || res.data?.term || null;
      setActiveSession(session);
      setActiveTerm(term);
      if (session?._id) setSelectedSession(session._id);
    } catch (err) {
      console.error("Failed to fetch active session/term:", err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get("/classes");
      const payload = getResponseData(res);
      setClasses(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await api.get("/sessions");
      const payload = getResponseData(res);
      setSessions(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };

  // ── fetch students — identical guard to ViewStudents ──────────────────────
  const fetchStudents = async () => {
    if (!activeSession?._id) return;

    try {
      setLoading(true);
      setError("");

      const params = { sessionId: selectedSession || activeSession._id };
      if (selectedClass) params.classId = selectedClass;
      if (selectedArm) params.armId = selectedArm;

      const res = await api.get("/students", { params });
      const payload = getResponseData(res);

      setStudents(Array.isArray(payload) ? payload : []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      setError("Failed to fetch students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSessionTerm();
    fetchClasses();
    fetchSessions();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [activeSession, selectedSession, selectedClass, selectedArm]);

  // ── helpers ───────────────────────────────────────────────────────────────
  const armsForSelectedClass = () => {
    if (!selectedClass) return [];
    const cls = classes.find((c) => c._id === selectedClass);
    return Array.isArray(cls?.arms) ? cls.arms : [];
  };

  const openModal = (enrollment) => setSelectedStudent(enrollment);
  const closeModal = () => setSelectedStudent(null);

  // ── block / unblock ───────────────────────────────────────────────────────
  const handleBlockToggle = async (enrollment, e) => {
    e?.stopPropagation();
    const student = enrollment.studentId;
    if (!student?._id) { toast.error("Invalid student record"); return; }

    try {
      setBlockingId(student._id);
      const url = student.blocked
        ? `/students/${student._id}/unblock`
        : `/students/${student._id}/block`;
      const res = await api.patch(url);
      toast.success(res.data?.message || "Student status updated");
      await fetchStudents();
      // update modal if open
      setSelectedStudent((prev) =>
        prev?._id === enrollment._id
          ? { ...prev, studentId: { ...prev.studentId, blocked: !student.blocked } }
          : prev
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update student");
    } finally {
      setBlockingId(null);
    }
  };

  // ── print single student ──────────────────────────────────────────────────
  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "", "height=700,width=900");
    if (!printWindow) { toast.error("Please allow popups to print."); return; }

    printWindow.document.write(`
      <html>
        <head>
          <title>Student Profile</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 13px; }
            .card { border: 1px solid #000; padding: 20px; max-width: 700px; margin: auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            .header h1 { margin: 5px 0; font-size: 18px; }
            .profile { display: flex; align-items: center; margin-bottom: 15px; }
            .profile img { width: 80px; height: 80px; border-radius: 50%; border: 1px solid #333; object-fit: cover; margin-right: 20px; }
            .section { margin-bottom: 15px; }
            .section h3 { font-size: 14px; border-bottom: 1px solid #333; padding-bottom: 3px; margin-bottom: 8px; }
            .section p { margin: 3px 0; }
            .footer { margin-top: 30px; text-align: center; font-size: 11px; border-top: 1px solid #000; padding-top: 5px; }
          </style>
        </head>
        <body><div class="card">${printRef.current.innerHTML}</div></body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // ── print full list ───────────────────────────────────────────────────────
  const handlePrintList = () => {
    if (!students.length) { toast.error("No students to print"); return; }
    const printWindow = window.open("", "", "height=700,width=900");
    if (!printWindow) { toast.error("Please allow popups to print."); return; }

    const rows = students.map((en, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${en.studentId?.name || "—"}</td>
        <td>${en.studentId?.admissionNumber || "—"}</td>
        <td>${en.classId?.name || "—"}</td>
        <td>${en.armId?.name || "—"}</td>
        <td>${en.studentId?.gender || "—"}</td>
        <td>${en.studentId?.parentContact || "—"}</td>
        <td>${en.studentId?.blocked ? "Blocked" : "Active"}</td>
      </tr>
    `).join("");

    const sessionName = sessions.find((s) => s._id === selectedSession)?.name
      || activeSession?.name || "";

    printWindow.document.write(`
      <html>
        <head>
          <title>Students List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; }
            .header p { margin: 2px 0; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 6px; font-size: 12px; text-align: left; }
            th { background: #f5f5f5; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; border-top: 1px solid #000; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/school-logo.png" alt="School Logo" style="height:60px;margin-bottom:5px" />
            <h1>Moonlight Secondary School</h1>
            <p>Students List — ${sessionName} ${activeTerm ? `(${activeTerm.name})` : ""}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SN</th><th>Name</th><th>Admission No</th>
                <th>Class</th><th>Arm</th><th>Gender</th>
                <th>Parent Contact</th><th>Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="footer">Generated on ${new Date().toLocaleString()}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // ── pagination ────────────────────────────────────────────────────────────
  const safeStudents = Array.isArray(students) ? students : [];
  const totalPages = Math.ceil(safeStudents.length / pageSize);
  const paginated = safeStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white p-4 sm:p-6 rounded shadow max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Manage Students
            </h2>
            <p className="text-sm text-gray-500">
              {activeSession && activeTerm
                ? `Active: ${activeSession.name} (${activeTerm.name})`
                : activeSession
                ? `Active: ${activeSession.name}`
                : "No active session"}
            </p>
          </div>

          <button
            onClick={handlePrintList}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            Print List
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option value="">All Sessions</option>
              {sessions.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setSelectedArm(""); }}
              className="border rounded p-2 w-full"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Arm</label>
            <select
              value={selectedArm}
              onChange={(e) => setSelectedArm(e.target.value)}
              disabled={!selectedClass}
              className="border rounded p-2 w-full disabled:bg-gray-100"
            >
              <option value="">All Arms</option>
              {armsForSelectedClass().map((a) => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-center">SN</th>
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Admission No</th>
                <th className="border p-2 text-left">Class</th>
                <th className="border p-2 text-left">Arm</th>
                <th className="border p-2 text-left">Gender</th>
                <th className="border p-2 text-left">Parent Contact</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                paginated.map((en, idx) => {
                  const student = en.studentId;
                  return (
                    <tr
                      key={en._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => openModal(en)}
                    >
                      <td className="border p-2 text-center">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="border p-2">{student?.name || "—"}</td>
                      <td className="border p-2">{student?.admissionNumber || "—"}</td>
                      <td className="border p-2">{en.classId?.name || "—"}</td>
                      <td className="border p-2">{en.armId?.name || "—"}</td>
                      <td className="border p-2">{student?.gender || "—"}</td>
                      <td className="border p-2">{student?.parentContact || "—"}</td>
                      <td className="border p-2">
                        {student?.blocked ? (
                          <span className="text-red-600 font-medium">Blocked</span>
                        ) : (
                          <span className="text-green-600 font-medium">Active</span>
                        )}
                      </td>
                      <td className="border p-2">
                        <button
                          onClick={(e) => handleBlockToggle(en, e)}
                          disabled={!student?._id || blockingId === student?._id}
                          className={`rounded px-3 py-1 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-400 ${
                            student?.blocked
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {blockingId === student?._id
                            ? "..."
                            : student?.blocked
                            ? "Unblock"
                            : "Block"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2 flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 rounded ${
                  currentPage === p
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 text-sm text-gray-500">
          Total records: {safeStudents.length}
        </div>
      </div>

      {/* Student detail modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div ref={printRef}>
              {/* Print header */}
              <div className="header text-center mb-4">
                <img src="/school-logo.png" alt="School Logo" className="mx-auto h-12" />
                <h1 className="text-lg font-bold">Moonlight Secondary School</h1>
                <p className="text-sm text-gray-500">Student Profile</p>
              </div>

              {/* Photo + basic info */}
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedStudent.studentId?.image || "/placeholder.png"}
                  alt="Student"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                />
                <div className="text-sm space-y-1">
                  <p><strong>Name:</strong> {selectedStudent.studentId?.name || "—"}</p>
                  <p><strong>Admission No:</strong> {selectedStudent.studentId?.admissionNumber || "—"}</p>
                  <p><strong>Gender:</strong> {selectedStudent.studentId?.gender || "—"}</p>
                  <p>
                    <strong>DOB:</strong>{" "}
                    {selectedStudent.studentId?.dateOfBirth
                      ? new Date(selectedStudent.studentId.dateOfBirth).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Academic placement */}
              <div className="mb-4">
                <h3 className="font-semibold border-b mb-2 text-sm">Academic Placement</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Class:</strong> {selectedStudent.classId?.name || "—"}</p>
                  <p><strong>Arm:</strong> {selectedStudent.armId?.name || "—"}</p>
                  <p><strong>Session:</strong> {selectedStudent.sessionId?.name || "—"}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={selectedStudent.studentId?.blocked ? "text-red-600" : "text-green-600"}>
                      {selectedStudent.studentId?.blocked ? "Blocked" : "Active"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Guardian */}
              <div className="mb-4">
                <h3 className="font-semibold border-b mb-2 text-sm">Guardian Information</h3>
                <p className="text-sm">
                  <strong>Contact:</strong> {selectedStudent.studentId?.parentContact || "—"}
                </p>
              </div>

              <div className="text-center text-xs text-gray-400 border-t pt-2 mt-4">
                Printed on {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* Modal actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => handleBlockToggle(selectedStudent)}
                disabled={blockingId === selectedStudent.studentId?._id}
                className={`px-4 py-2 rounded text-white text-sm disabled:bg-gray-400 ${
                  selectedStudent.studentId?.blocked
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {blockingId === selectedStudent.studentId?._id
                  ? "Updating..."
                  : selectedStudent.studentId?.blocked
                  ? "Unblock"
                  : "Block"}
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Print
              </button>

              <button
                onClick={closeModal}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 text-sm hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
