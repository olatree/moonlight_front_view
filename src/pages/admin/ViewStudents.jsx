

// src/pages/admin/ViewStudents.jsx
import { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function ViewStudents() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedArm, setSelectedArm] = useState("");
  const [activeSession, setActiveSession] = useState(null);
  const [activeTerm, setActiveTerm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [selectedStudent, setSelectedStudent] = useState(null);
  const printRef = useRef();
  const listPrintRef = useRef();

  const getResponseData = (res) => res.data?.data ?? res.data;

  const fetchActiveSessionTerm = async () => {
    try {
      const res = await api.get("/sessions/active");
      const payload = getResponseData(res);

      setActiveSession(payload?.session || res.data?.session || null);
      setActiveTerm(payload?.term || res.data?.term || null);
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
      setClasses([]);
    }
  };

  const fetchStudents = async () => {
    if (!activeSession?._id) return;

    try {
      setLoading(true);
      setError("");

      const params = { sessionId: activeSession._id };

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
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [activeSession, selectedClass, selectedArm]);

  const armsForSelectedClass = () => {
    if (!selectedClass) return [];

    const cls = classes.find((c) => c._id === selectedClass);
    return Array.isArray(cls?.arms) ? cls.arms : [];
  };

  const openModal = (student) => setSelectedStudent(student);
  const closeModal = () => setSelectedStudent(null);

  const toggleBlock = async () => {
    if (!selectedStudent?.studentId?._id) return;

    try {
      const studentId = selectedStudent.studentId._id;

      const url = selectedStudent.studentId.blocked
        ? `/students/${studentId}/unblock`
        : `/students/${studentId}/block`;

      const res = await api.patch(url);
      toast.success(res.data?.message || "Student status updated");

      await fetchStudents();
      closeModal();
    } catch (err) {
      console.error("Failed to toggle block:", err);
      toast.error(err.response?.data?.message || "Failed to update student status");
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "", "height=700,width=900");

    if (!printWindow) {
      toast.error("Please allow popups to print student profile.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Student Report Card</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 13px; }
            .report-card {
              border: 1px solid #000;
              padding: 20px;
              max-width: 700px;
              margin: auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .header img { height: 50px; }
            .header h1 { margin: 5px 0; font-size: 18px; }
            .header p { margin: 0; font-size: 12px; }
            .profile {
              display: flex;
              align-items: center;
              margin-bottom: 15px;
            }
            .profile img {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              border: 1px solid #333;
              object-fit: cover;
              margin-right: 20px;
            }
            .section { margin-bottom: 15px; }
            .section h3 {
              font-size: 14px;
              border-bottom: 1px solid #333;
              padding-bottom: 3px;
              margin-bottom: 8px;
            }
            .section p { margin: 3px 0; }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 11px;
              border-top: 1px solid #000;
              padding-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="report-card">
            ${printContents}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handlePrintList = () => {
    if (!Array.isArray(students) || students.length === 0) {
      toast.error("No students to print");
      return;
    }

    const rows = students
      .map(
        (en, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td>${en.studentId?.name || "—"}</td>
            <td>${en.studentId?.admissionNumber || "—"}</td>
            <td>${en.classId?.name || "—"}</td>
            <td>${en.armId?.name || "—"}</td>
            <td>${en.studentId?.blocked ? "Blocked" : "Active"}</td>
          </tr>
        `
      )
      .join("");

    const printWindow = window.open("", "", "height=700,width=900");

    if (!printWindow) {
      toast.error("Please allow popups to print students list.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Students List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .header img { height: 60px; margin-bottom: 5px; }
            .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; }
            .header p { margin: 2px 0; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td {
              border: 1px solid #ddd;
              padding: 6px;
              font-size: 13px;
              text-align: left;
            }
            th { background: #f5f5f5; }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/school-logo.png" alt="School Logo" />
            <h1>Moonlight Secondary School</h1>
            <p>Students List — ${activeSession?.name || ""} ${
      activeTerm ? `(${activeTerm.name})` : ""
    }</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>SN</th>
                <th>Name</th>
                <th>Admission No</th>
                <th>Class</th>
                <th>Arm</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="footer">
            Generated on ${new Date().toLocaleString()} by Moonlight School Management System
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const safeStudents = Array.isArray(students) ? students : [];
  const totalPages = Math.ceil(safeStudents.length / pageSize);

  const paginatedStudents = safeStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white p-4 sm:p-6 rounded shadow max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">
            Students — Current Session
          </h2>

          <div className="text-sm text-gray-600">
            {activeSession && activeTerm
              ? `Active: ${activeSession.name} (${activeTerm.name})`
              : "No active session/term"}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedArm("");
              }}
              className="border rounded p-2 w-full"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Arm</label>
            <select
              value={selectedArm}
              onChange={(e) => setSelectedArm(e.target.value)}
              className="border rounded p-2 w-full"
              disabled={!selectedClass}
            >
              <option value="">All Arms</option>
              {armsForSelectedClass().map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end mb-2">
          <button
            onClick={handlePrintList}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Print Students List
          </button>
        </div>

        <div ref={listPrintRef} className="overflow-x-auto">
          <table className="min-w-full border-collapse border text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">SN</th>
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Admission No</th>
                <th className="border p-2 text-left">Class</th>
                <th className="border p-2 text-left">Arm</th>
                <th className="border p-2 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((en, idx) => (
                  <tr
                    key={en._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openModal(en)}
                  >
                    <td className="border p-2 text-center">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="border p-2">{en.studentId?.name || "—"}</td>
                    <td className="border p-2">
                      {en.studentId?.admissionNumber || "—"}
                    </td>
                    <td className="border p-2">{en.classId?.name || "—"}</td>
                    <td className="border p-2">{en.armId?.name || "—"}</td>
                    <td className="border p-2">
                      {en.studentId?.blocked ? (
                        <span className="text-red-600">Blocked</span>
                      ) : (
                        <span className="text-green-600">Active</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2 flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 rounded mb-2 ${
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
      </div>

      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div ref={printRef} className="report-card">
              <div className="header text-center mb-4">
                <img
                  src="/school-logo.png"
                  alt="School Logo"
                  className="mx-auto h-12"
                />
                <h1 className="text-lg font-bold">Moonlight Secondary School</h1>
                <p>Student Report Card</p>
              </div>

              <div className="profile flex items-center gap-4 mb-4">
                <img
                  src={selectedStudent.studentId?.image || "/placeholder.png"}
                  alt="Student"
                  className="w-28 h-28 rounded-full object-cover border-2 border-gray-400"
                />

                <div>
                  <p>
                    <strong>Name:</strong>{" "}
                    {selectedStudent.studentId?.name || "—"}
                  </p>
                  <p>
                    <strong>Admission No:</strong>{" "}
                    {selectedStudent.studentId?.admissionNumber || "—"}
                  </p>
                  <p>
                    <strong>Gender:</strong>{" "}
                    {selectedStudent.studentId?.gender || "—"}
                  </p>
                  <p>
                    <strong>DOB:</strong>{" "}
                    {selectedStudent.studentId?.dateOfBirth
                      ? new Date(
                          selectedStudent.studentId.dateOfBirth
                        ).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="sections">
                <div className="section mb-4">
                  <h3 className="font-semibold border-b mb-2">
                    Academic Placement
                  </h3>
                  <p>
                    <strong>Class:</strong>{" "}
                    {selectedStudent.classId?.name || "—"}
                  </p>
                  <p>
                    <strong>Arm:</strong> {selectedStudent.armId?.name || "—"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {selectedStudent.studentId?.blocked ? "Blocked" : "Active"}
                  </p>
                </div>

                <div className="section mb-4">
                  <h3 className="font-semibold border-b mb-2">
                    Guardian Information
                  </h3>
                  <p>
                    <strong>Contact:</strong>{" "}
                    {selectedStudent.studentId?.parentContact || "—"}
                  </p>
                </div>
              </div>

              <div className="footer text-center text-xs border-t pt-2 mt-6">
                Printed on {new Date().toLocaleDateString()}
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                onClick={toggleBlock}
                className={`px-4 py-2 rounded text-white ${
                  selectedStudent.studentId?.blocked
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
              >
                {selectedStudent.studentId?.blocked ? "Unblock" : "Block"}
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded bg-blue-600 text-white"
              >
                Print
              </button>

              <button
                onClick={closeModal}
                className="px-4 py-2 rounded bg-gray-300"
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