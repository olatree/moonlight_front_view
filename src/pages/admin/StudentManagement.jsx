

// // src/pages/admin/ManageStudents.jsx
// import { useEffect, useRef, useState } from "react";
// import api from "../../api/axios";
// import toast from "react-hot-toast";

// const formatCategory = (value) =>
//   (value || "returning")
//     .replace("_", " ")
//     .replace(/\b\w/g, (c) => c.toUpperCase());

// const categoryClass = (value) => {
//   if (value === "new_intake") return "bg-blue-100 text-blue-700";
//   if (value === "transfer") return "bg-purple-100 text-purple-700";
//   return "bg-green-100 text-green-700";
// };

// export default function ManageStudents() {
//   const [students, setStudents] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedArm, setSelectedArm] = useState("");
//   const [activeSession, setActiveSession] = useState(null);
//   const [activeTerm, setActiveTerm] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [mode, setMode] = useState(null);
//   const printRef = useRef();

//   const [currentPage, setCurrentPage] = useState(1);
//   const pageSize = 10;

//   const [editForm, setEditForm] = useState({
//     name: "",
//     dateOfBirth: "",
//     gender: "",
//     parentContact: "",
//     classId: "",
//     armId: "",
//     studentCategory: "returning",
//     newPassword: "",
//     confirmPassword: "",
//     image: null,
//   });

//   const getResponseData = (res) => res.data?.data ?? res.data;

//   const fetchActiveSessionTerm = async () => {
//     try {
//       const res = await api.get("/sessions/active");
//       const payload = getResponseData(res);

//       setActiveSession(payload?.session || res.data?.session || null);
//       setActiveTerm(payload?.term || res.data?.term || null);
//     } catch (err) {
//       console.error("Failed to fetch active session/term:", err);
//     }
//   };

//   const fetchClasses = async () => {
//     try {
//       const res = await api.get("/classes");
//       const payload = getResponseData(res);

//       setClasses(Array.isArray(payload) ? payload : []);
//     } catch (err) {
//       console.error("Failed to fetch classes:", err);
//       setClasses([]);
//     }
//   };

//   const fetchStudents = async () => {
//     if (!activeSession?._id) return;

//     try {
//       setLoading(true);
//       setError("");

//       const params = { sessionId: activeSession._id };
//       if (selectedClass) params.classId = selectedClass;
//       if (selectedArm) params.armId = selectedArm;

//       const res = await api.get("/students", { params });
//       const payload = getResponseData(res);

//       setStudents(Array.isArray(payload) ? payload : []);
//       setCurrentPage(1);
//     } catch (err) {
//       console.error("Failed to fetch students:", err);
//       setError("Failed to fetch students");
//       setStudents([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchActiveSessionTerm();
//     fetchClasses();
//   }, []);

//   useEffect(() => {
//     fetchStudents();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [activeSession, selectedClass, selectedArm]);

//   const armsForSelectedClass = (classId = selectedClass) => {
//     if (!classId) return [];
//     const cls = classes.find((c) => c._id === classId);
//     return Array.isArray(cls?.arms) ? cls.arms : [];
//   };

//   const totalPages = Math.ceil(students.length / pageSize);

//   const paginatedStudents = students.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   const openViewModal = (enrollment) => {
//     setSelectedStudent(enrollment);
//     setMode("view");
//   };

//   const openEditModal = (enrollment) => {
//     setSelectedStudent(enrollment);
//     setMode("edit");

//     setEditForm({
//       name: enrollment.studentId?.name || "",
//       dateOfBirth: enrollment.studentId?.dateOfBirth
//         ? enrollment.studentId.dateOfBirth.slice(0, 10)
//         : "",
//       gender: enrollment.studentId?.gender || "",
//       parentContact: enrollment.studentId?.parentContact || "",
//       classId: enrollment.classId?._id || "",
//       armId: enrollment.armId?._id || "",
//       studentCategory: enrollment.studentCategory || "returning",
//       newPassword: "",
//       confirmPassword: "",
//       image: null,
//     });
//   };

//   const closeModal = () => {
//     setSelectedStudent(null);
//     setMode(null);
//   };

//   const toggleBlock = async (enrollment) => {
//     const student = enrollment?.studentId;

//     if (!student?._id) {
//       toast.error("Invalid student record");
//       return;
//     }

//     try {
//       const url = student.blocked
//         ? `/students/${student._id}/unblock`
//         : `/students/${student._id}/block`;

//       const res = await api.patch(url);
//       toast.success(res.data?.message || "Student status updated");

//       await fetchStudents();
//       closeModal();
//     } catch (err) {
//       console.error("Failed to update student status:", err);
//       toast.error(err.response?.data?.message || "Failed to update status");
//     }
//   };

//   const deleteStudent = async (enrollment) => {
//     const student = enrollment?.studentId;

//     if (!student?._id) {
//       toast.error("Invalid student record");
//       return;
//     }

//     const confirmDelete = window.confirm(
//       `Delete ${student.name}? This will remove the student and their enrollments.`
//     );

//     if (!confirmDelete) return;

//     try {
//       await api.delete(`/students/${student._id}`);
//       toast.success("Student deleted successfully");
//       await fetchStudents();
//       closeModal();
//     } catch (err) {
//       console.error("Failed to delete student:", err);
//       toast.error(err.response?.data?.message || "Failed to delete student");
//     }
//   };

//   const handleEditChange = (e) => {
//     const { name, value, files } = e.target;

//     if (name === "image") {
//       setEditForm((prev) => ({ ...prev, image: files?.[0] || null }));
//       return;
//     }

//     if (name === "classId") {
//       setEditForm((prev) => ({
//         ...prev,
//         classId: value,
//         armId: "",
//       }));
//       return;
//     }

//     setEditForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const submitEdit = async (e) => {
//     e.preventDefault();

//     if (!selectedStudent?.studentId?._id) {
//       toast.error("Invalid student record");
//       return;
//     }

//     if (
//       editForm.newPassword &&
//       editForm.newPassword !== editForm.confirmPassword
//     ) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     try {
//       setSaving(true);

//       const formData = new FormData();

//       formData.append("name", editForm.name.trim());
//       formData.append("dateOfBirth", editForm.dateOfBirth);
//       formData.append("gender", editForm.gender);
//       formData.append("parentContact", editForm.parentContact.trim());
//       formData.append("classId", editForm.classId);
//       formData.append("armId", editForm.armId);
//       formData.append("studentCategory", editForm.studentCategory);

//       if (activeSession?._id) formData.append("sessionId", activeSession._id);
//       if (activeTerm?._id) formData.append("termId", activeTerm._id);

//       if (editForm.newPassword) {
//         formData.append("newPassword", editForm.newPassword);
//         formData.append("confirmPassword", editForm.confirmPassword);
//       }

//       if (editForm.image) {
//         formData.append("picture", editForm.image);
//       }

//       const res = await api.put(
//         `/students/${selectedStudent.studentId._id}`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       toast.success(res.data?.message || "Student updated successfully");
//       await fetchStudents();
//       closeModal();
//     } catch (err) {
//       console.error("Failed to update student:", err);
//       toast.error(err.response?.data?.message || "Failed to update student");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handlePrint = () => {
//     if (!printRef.current) return;

//     const printWindow = window.open("", "", "height=700,width=900");

//     if (!printWindow) {
//       toast.error("Please allow popups to print student profile.");
//       return;
//     }

//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Student Profile</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; font-size: 13px; }
//             .report-card { border: 1px solid #000; padding: 20px; max-width: 700px; margin: auto; }
//             .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
//             .profile { display: flex; align-items: center; gap: 20px; margin-bottom: 15px; }
//             .profile img { width: 90px; height: 90px; border-radius: 50%; border: 1px solid #333; object-fit: cover; }
//             .section { margin-bottom: 15px; }
//             .section h3 { font-size: 14px; border-bottom: 1px solid #333; padding-bottom: 3px; margin-bottom: 8px; }
//             .footer { margin-top: 30px; text-align: center; font-size: 11px; border-top: 1px solid #000; padding-top: 5px; }
//           </style>
//         </head>
//         <body>
//           <div class="report-card">${printRef.current.innerHTML}</div>
//         </body>
//       </html>
//     `);

//     printWindow.document.close();
//     printWindow.focus();
//     printWindow.print();
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 px-3 py-3 sm:px-6 sm:py-6">
//       <div className="mx-auto max-w-6xl">
//         <div className="mb-3 rounded-xl bg-white p-3 shadow-sm">
//           <div className="flex items-center justify-between gap-3">
//             <div>
//               <h2 className="text-base font-bold text-gray-900 sm:text-xl">
//                 Manage Students
//               </h2>
//               <p className="text-xs text-gray-500">
//                 {activeSession && activeTerm
//                   ? `${activeSession.name} • ${activeTerm.name}`
//                   : "No active session/term"}
//               </p>
//             </div>

//             <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
//               {students.length}
//             </span>
//           </div>
//         </div>

//         <div className="mb-3 rounded-xl bg-white p-3 shadow-sm sm:p-4">
//           <div className="grid grid-cols-2 gap-2 sm:gap-3">
//             <div>
//               <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
//                 Class
//               </label>
//               <select
//                 value={selectedClass}
//                 onChange={(e) => {
//                   setSelectedClass(e.target.value);
//                   setSelectedArm("");
//                 }}
//                 className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:p-3 sm:text-sm"
//               >
//                 <option value="">All Classes</option>
//                 {classes.map((c) => (
//                   <option key={c._id} value={c._id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
//                 Arm
//               </label>
//               <select
//                 value={selectedArm}
//                 onChange={(e) => setSelectedArm(e.target.value)}
//                 disabled={!selectedClass}
//                 className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100 sm:p-3 sm:text-sm"
//               >
//                 <option value="">All Arms</option>
//                 {armsForSelectedClass().map((a) => (
//                   <option key={a._id} value={a._id}>
//                     {a.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <button
//             onClick={fetchStudents}
//             disabled={loading}
//             className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto sm:text-sm"
//           >
//             {loading ? "Refreshing..." : "Refresh"}
//           </button>
//         </div>

//         {error && (
//           <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
//             {error}
//           </div>
//         )}

//         <div className="space-y-2 md:hidden">
//           {loading ? (
//             <div className="rounded-xl bg-white p-3 text-center text-sm text-gray-500 shadow-sm">
//               Loading students...
//             </div>
//           ) : students.length === 0 ? (
//             <div className="rounded-xl bg-white p-3 text-center text-sm text-gray-500 shadow-sm">
//               No students found
//             </div>
//           ) : (
//             paginatedStudents.map((en) => (
//               <div key={en._id} className="rounded-xl bg-white p-3 shadow-sm">
//                 <div className="flex items-center gap-3">
//                   <img
//                     src={en.studentId?.image || "/placeholder.png"}
//                     alt="Student"
//                     className="h-10 w-10 rounded-full object-cover"
//                   />

//                   <div className="min-w-0 flex-1">
//                     <h3 className="truncate text-sm font-semibold text-gray-900">
//                       {en.studentId?.name || "Deleted student"}
//                     </h3>

//                     <p className="text-xs text-gray-500">
//                       {en.studentId?.admissionNumber || "—"} •{" "}
//                       {en.classId?.name || "—"} {en.armId?.name || ""}
//                     </p>

//                     <p className="mt-1">
//                       <span
//                         className={`rounded-full px-2 py-1 text-[10px] font-medium ${categoryClass(
//                           en.studentCategory
//                         )}`}
//                       >
//                         {formatCategory(en.studentCategory)}
//                       </span>
//                     </p>
//                   </div>

//                   <span
//                     className={`rounded-full px-2 py-1 text-[10px] font-medium ${
//                       en.studentId?.blocked
//                         ? "bg-red-100 text-red-700"
//                         : "bg-green-100 text-green-700"
//                     }`}
//                   >
//                     {en.studentId?.blocked ? "Blocked" : "Active"}
//                   </span>
//                 </div>

//                 <div className="mt-2 grid grid-cols-4 gap-1.5">
//                   <button
//                     onClick={() => openViewModal(en)}
//                     className="rounded-md bg-gray-700 py-1.5 text-[10px] font-medium text-white"
//                   >
//                     View
//                   </button>

//                   <button
//                     onClick={() => openEditModal(en)}
//                     className="rounded-md bg-blue-600 py-1.5 text-[10px] font-medium text-white"
//                   >
//                     Edit
//                   </button>

//                   <button
//                     onClick={() => toggleBlock(en)}
//                     className={`rounded-md py-1.5 text-[10px] font-medium text-white ${
//                       en.studentId?.blocked ? "bg-green-600" : "bg-red-600"
//                     }`}
//                   >
//                     {en.studentId?.blocked ? "Unblock" : "Block"}
//                   </button>

//                   <button
//                     onClick={() => deleteStudent(en)}
//                     className="rounded-md bg-black py-1.5 text-[10px] font-medium text-white"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm md:block">
//           <table className="min-w-full border-collapse text-sm">
//             <thead>
//               <tr className="bg-gray-100 text-left">
//                 <th className="p-3">SN</th>
//                 <th className="p-3">Name</th>
//                 <th className="p-3">Admission No</th>
//                 <th className="p-3">Class</th>
//                 <th className="p-3">Arm</th>
//                 <th className="p-3">Category</th>
//                 <th className="p-3">Status</th>
//                 <th className="p-3">Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan="8" className="p-6 text-center text-gray-500">
//                     Loading...
//                   </td>
//                 </tr>
//               ) : students.length === 0 ? (
//                 <tr>
//                   <td colSpan="8" className="p-6 text-center text-gray-500">
//                     No students found
//                   </td>
//                 </tr>
//               ) : (
//                 paginatedStudents.map((en, idx) => (
//                   <tr key={en._id} className="border-t hover:bg-gray-50">
//                     <td className="p-3">
//                       {(currentPage - 1) * pageSize + idx + 1}
//                     </td>

//                     <td className="p-3">{en.studentId?.name || "—"}</td>

//                     <td className="p-3">
//                       {en.studentId?.admissionNumber || "—"}
//                     </td>

//                     <td className="p-3">{en.classId?.name || "—"}</td>

//                     <td className="p-3">{en.armId?.name || "—"}</td>

//                     <td className="p-3">
//                       <span
//                         className={`rounded-full px-2 py-1 text-xs font-medium ${categoryClass(
//                           en.studentCategory
//                         )}`}
//                       >
//                         {formatCategory(en.studentCategory)}
//                       </span>
//                     </td>

//                     <td className="p-3">
//                       {en.studentId?.blocked ? (
//                         <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
//                           Blocked
//                         </span>
//                       ) : (
//                         <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
//                           Active
//                         </span>
//                       )}
//                     </td>

//                     <td className="p-3">
//                       <div className="flex flex-wrap gap-2">
//                         <button
//                           onClick={() => openViewModal(en)}
//                           className="rounded bg-gray-700 px-3 py-1 text-xs text-white"
//                         >
//                           View
//                         </button>

//                         <button
//                           onClick={() => openEditModal(en)}
//                           className="rounded bg-blue-600 px-3 py-1 text-xs text-white"
//                         >
//                           Edit
//                         </button>

//                         <button
//                           onClick={() => toggleBlock(en)}
//                           className={`rounded px-3 py-1 text-xs text-white ${
//                             en.studentId?.blocked
//                               ? "bg-green-600"
//                               : "bg-red-600"
//                           }`}
//                         >
//                           {en.studentId?.blocked ? "Unblock" : "Block"}
//                         </button>

//                         <button
//                           onClick={() => deleteStudent(en)}
//                           className="rounded bg-black px-3 py-1 text-xs text-white"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {totalPages > 1 && (
//           <div className="mt-3 flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
//             <button
//               onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//               disabled={currentPage === 1}
//               className="rounded-lg bg-gray-200 px-3 py-2 text-xs font-medium disabled:opacity-50"
//             >
//               Prev
//             </button>

//             <span className="text-xs text-gray-600">
//               Page {currentPage} of {totalPages}
//             </span>

//             <button
//               onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className="rounded-lg bg-gray-200 px-3 py-2 text-xs font-medium disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>

//       {selectedStudent && mode === "view" && (
//         <div className="fixed inset-0 z-50 flex items-end bg-black/50 px-3 sm:items-center sm:justify-center">
//           <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 sm:max-w-lg sm:rounded-2xl sm:p-6">
//             <div ref={printRef}>
//               <h2 className="mb-4 text-center text-xl font-bold">
//                 Student Profile
//               </h2>

//               <div className="mb-4 flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
//                 <img
//                   src={selectedStudent.studentId?.image || "/placeholder.png"}
//                   alt="Student"
//                   className="h-28 w-28 rounded-full object-cover"
//                 />

//                 <div className="text-sm">
//                   <p>
//                     <strong>Name:</strong> {selectedStudent.studentId?.name}
//                   </p>

//                   <p>
//                     <strong>Admission No:</strong>{" "}
//                     {selectedStudent.studentId?.admissionNumber}
//                   </p>

//                   <p>
//                     <strong>Gender:</strong> {selectedStudent.studentId?.gender}
//                   </p>

//                   <p>
//                     <strong>Contact:</strong>{" "}
//                     {selectedStudent.studentId?.parentContact}
//                   </p>

//                   <p>
//                     <strong>Status:</strong>{" "}
//                     {selectedStudent.studentId?.blocked ? "Blocked" : "Active"}
//                   </p>
//                 </div>
//               </div>

//               <div className="rounded-xl bg-gray-50 p-3 text-sm">
//                 <p>
//                   <strong>Class:</strong> {selectedStudent.classId?.name}
//                 </p>

//                 <p>
//                   <strong>Arm:</strong> {selectedStudent.armId?.name}
//                 </p>

//                 <p>
//                   <strong>Session:</strong> {selectedStudent.sessionId?.name}
//                 </p>

//                 <p className="mt-2">
//                   <strong>Category:</strong>{" "}
//                   <span
//                     className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${categoryClass(
//                       selectedStudent.studentCategory
//                     )}`}
//                   >
//                     {formatCategory(selectedStudent.studentCategory)}
//                   </span>
//                 </p>
//               </div>
//             </div>

//             <div className="mt-5 grid grid-cols-2 gap-2">
//               <button
//                 onClick={handlePrint}
//                 className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white"
//               >
//                 Print
//               </button>

//               <button
//                 onClick={closeModal}
//                 className="rounded-xl bg-gray-200 px-4 py-3 text-sm font-medium"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {selectedStudent && mode === "edit" && (
//         <div className="fixed inset-0 z-50 flex items-end bg-black/50 px-3 sm:items-center sm:justify-center">
//           <form
//             onSubmit={submitEdit}
//             className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 sm:max-w-lg sm:rounded-2xl sm:p-6"
//           >
//             <h2 className="mb-4 text-xl font-bold">Edit Student</h2>

//             <div className="space-y-3">
//               <input
//                 name="name"
//                 value={editForm.name}
//                 onChange={handleEditChange}
//                 className="w-full rounded-xl border p-3 text-sm"
//                 placeholder="Name"
//                 required
//               />

//               <input
//                 type="date"
//                 name="dateOfBirth"
//                 value={editForm.dateOfBirth}
//                 onChange={handleEditChange}
//                 className="w-full rounded-xl border p-3 text-sm"
//                 required
//               />

//               <select
//                 name="gender"
//                 value={editForm.gender}
//                 onChange={handleEditChange}
//                 className="w-full rounded-xl border p-3 text-sm"
//                 required
//               >
//                 <option value="">Select Gender</option>
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//               </select>

//               <input
//                 name="parentContact"
//                 value={editForm.parentContact}
//                 onChange={handleEditChange}
//                 className="w-full rounded-xl border p-3 text-sm"
//                 placeholder="Parent Contact"
//                 required
//               />

//               <select
//                 name="classId"
//                 value={editForm.classId}
//                 onChange={handleEditChange}
//                 className="w-full rounded-xl border p-3 text-sm"
//                 required
//               >
//                 <option value="">Select Class</option>
//                 {classes.map((cls) => (
//                   <option key={cls._id} value={cls._id}>
//                     {cls.name}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 name="armId"
//                 value={editForm.armId}
//                 onChange={handleEditChange}
//                 className="w-full rounded-xl border p-3 text-sm"
//                 required
//               >
//                 <option value="">Select Arm</option>
//                 {armsForSelectedClass(editForm.classId).map((arm) => (
//                   <option key={arm._id} value={arm._id}>
//                     {arm.name}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 name="studentCategory"
//                 value={editForm.studentCategory}
//                 onChange={handleEditChange}
//                 className="w-full rounded-xl border p-3 text-sm"
//                 required
//               >
//                 <option value="returning">Returning Student</option>
//                 <option value="new_intake">New Intake</option>
//                 <option value="transfer">Transfer Student</option>
//               </select>

//               <input
//                 type="file"
//                 name="image"
//                 accept="image/*"
//                 onChange={handleEditChange}
//                 className="w-full text-sm"
//               />

//               <input
//                 type="password"
//                 name="newPassword"
//                 value={editForm.newPassword}
//                 onChange={handleEditChange}
//                 className="w-full rounded-xl border p-3 text-sm"
//                 placeholder="New password optional"
//               />

//               <input
//                 type="password"
//                 name="confirmPassword"
//                 value={editForm.confirmPassword}
//                 onChange={handleEditChange}
//                 className="w-full rounded-xl border p-3 text-sm"
//                 placeholder="Confirm new password"
//               />
//             </div>

//             <div className="mt-5 grid grid-cols-2 gap-2">
//               <button
//                 type="submit"
//                 disabled={saving}
//                 className="rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
//               >
//                 {saving ? "Saving..." : "Save"}
//               </button>

//               <button
//                 type="button"
//                 onClick={closeModal}
//                 className="rounded-xl bg-gray-200 px-4 py-3 text-sm font-medium"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }

// src/pages/admin/ManageStudents.jsx
import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const formatCategory = (value) =>
  (value || "returning")
    .replace("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const categoryClass = (value) => {
  if (value === "new_intake") return "bg-blue-100 text-blue-700";
  if (value === "transfer") return "bg-purple-100 text-purple-700";
  return "bg-green-100 text-green-700";
};

const getStatusLabel = (student) => {
  if (student?.status === "graduated") return "Graduated";
  if (student?.archived) return "Archived";
  if (student?.blocked) return "Blocked";
  return "Active";
};

const getStatusClass = (student) => {
  if (student?.status === "graduated") return "bg-purple-100 text-purple-700";
  if (student?.archived) return "bg-gray-200 text-gray-700";
  if (student?.blocked) return "bg-red-100 text-red-700";
  return "bg-green-100 text-green-700";
};

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedArm, setSelectedArm] = useState("");
  const [activeSession, setActiveSession] = useState(null);
  const [activeTerm, setActiveTerm] = useState(null);
  const [studentStatus, setStudentStatus] = useState("active");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [mode, setMode] = useState(null);
  const printRef = useRef();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [editForm, setEditForm] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    parentContact: "",
    classId: "",
    armId: "",
    studentCategory: "returning",
    newPassword: "",
    confirmPassword: "",
    image: null,
  });

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

      const params = {
        sessionId: activeSession._id,
        studentStatus,
      };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession, selectedClass, selectedArm, studentStatus]);

  const armsForSelectedClass = (classId = selectedClass) => {
    if (!classId) return [];
    const cls = classes.find((c) => c._id === classId);
    return Array.isArray(cls?.arms) ? cls.arms : [];
  };

  const totalPages = Math.ceil(students.length / pageSize);

  const paginatedStudents = students.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const openViewModal = (enrollment) => {
    setSelectedStudent(enrollment);
    setMode("view");
  };

  const openEditModal = (enrollment) => {
    setSelectedStudent(enrollment);
    setMode("edit");

    setEditForm({
      name: enrollment.studentId?.name || "",
      dateOfBirth: enrollment.studentId?.dateOfBirth
        ? enrollment.studentId.dateOfBirth.slice(0, 10)
        : "",
      gender: enrollment.studentId?.gender || "",
      parentContact: enrollment.studentId?.parentContact || "",
      classId: enrollment.classId?._id || "",
      armId: enrollment.armId?._id || "",
      studentCategory: enrollment.studentCategory || "returning",
      newPassword: "",
      confirmPassword: "",
      image: null,
    });
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setMode(null);
  };

  const toggleBlock = async (enrollment) => {
    const student = enrollment?.studentId;

    if (!student?._id) {
      toast.error("Invalid student record");
      return;
    }

    if (student.status === "graduated") {
      toast.error("Graduated students cannot be blocked/unblocked here.");
      return;
    }

    try {
      const url = student.blocked
        ? `/students/${student._id}/unblock`
        : `/students/${student._id}/block`;

      const res = await api.patch(url);
      toast.success(res.data?.message || "Student status updated");

      await fetchStudents();
      closeModal();
    } catch (err) {
      console.error("Failed to update student status:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const deleteStudent = async (enrollment) => {
    const student = enrollment?.studentId;

    if (!student?._id) {
      toast.error("Invalid student record");
      return;
    }

    const confirmDelete = window.confirm(
      `Delete ${student.name}? This will remove the student and their enrollments.`
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/students/${student._id}`);
      toast.success("Student deleted successfully");
      await fetchStudents();
      closeModal();
    } catch (err) {
      console.error("Failed to delete student:", err);
      toast.error(err.response?.data?.message || "Failed to delete student");
    }
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setEditForm((prev) => ({ ...prev, image: files?.[0] || null }));
      return;
    }

    if (name === "classId") {
      setEditForm((prev) => ({
        ...prev,
        classId: value,
        armId: "",
      }));
      return;
    }

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitEdit = async (e) => {
    e.preventDefault();

    if (!selectedStudent?.studentId?._id) {
      toast.error("Invalid student record");
      return;
    }

    if (
      editForm.newPassword &&
      editForm.newPassword !== editForm.confirmPassword
    ) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("name", editForm.name.trim());
      formData.append("dateOfBirth", editForm.dateOfBirth);
      formData.append("gender", editForm.gender);
      formData.append("parentContact", editForm.parentContact.trim());
      formData.append("classId", editForm.classId);
      formData.append("armId", editForm.armId);
      formData.append("studentCategory", editForm.studentCategory);

      if (activeSession?._id) formData.append("sessionId", activeSession._id);
      if (activeTerm?._id) formData.append("termId", activeTerm._id);

      if (editForm.newPassword) {
        formData.append("newPassword", editForm.newPassword);
        formData.append("confirmPassword", editForm.confirmPassword);
      }

      if (editForm.image) {
        formData.append("picture", editForm.image);
      }

      const res = await api.put(
        `/students/${selectedStudent.studentId._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success(res.data?.message || "Student updated successfully");
      await fetchStudents();
      closeModal();
    } catch (err) {
      console.error("Failed to update student:", err);
      toast.error(err.response?.data?.message || "Failed to update student");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open("", "", "height=700,width=900");

    if (!printWindow) {
      toast.error("Please allow popups to print student profile.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Student Profile</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 13px; }
            .report-card { border: 1px solid #000; padding: 20px; max-width: 700px; margin: auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            .profile { display: flex; align-items: center; gap: 20px; margin-bottom: 15px; }
            .profile img { width: 90px; height: 90px; border-radius: 50%; border: 1px solid #333; object-fit: cover; }
            .section { margin-bottom: 15px; }
            .section h3 { font-size: 14px; border-bottom: 1px solid #333; padding-bottom: 3px; margin-bottom: 8px; }
            .footer { margin-top: 30px; text-align: center; font-size: 11px; border-top: 1px solid #000; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="report-card">${printRef.current.innerHTML}</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const tabButtonClass = (tab) =>
    `rounded-lg px-3 py-2 text-xs font-semibold sm:text-sm ${
      studentStatus === tab
        ? tab === "active"
          ? "bg-green-600 text-white"
          : tab === "graduated"
          ? "bg-purple-600 text-white"
          : "bg-gray-800 text-white"
        : "bg-gray-100 text-gray-700"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-3 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-3 rounded-xl bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 sm:text-xl">
                Student Records
              </h2>
              <p className="text-xs text-gray-500">
                {activeSession && activeTerm
                  ? `${activeSession.name} • ${activeTerm.name}`
                  : "No active session/term"}
              </p>
            </div>

            <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
              {students.length}
            </span>
          </div>
        </div>

        <div className="mb-3 rounded-xl bg-white p-2 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setStudentStatus("active")}
              className={tabButtonClass("active")}
            >
              Active
            </button>

            <button
              type="button"
              onClick={() => setStudentStatus("graduated")}
              className={tabButtonClass("graduated")}
            >
              Graduated
            </button>

            <button
              type="button"
              onClick={() => setStudentStatus("archived")}
              className={tabButtonClass("archived")}
            >
              Archived
            </button>
          </div>
        </div>

        <div className="mb-3 rounded-xl bg-white p-3 shadow-sm sm:p-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedArm("");
                }}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:p-3 sm:text-sm"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                Arm
              </label>
              <select
                value={selectedArm}
                onChange={(e) => setSelectedArm(e.target.value)}
                disabled={!selectedClass}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100 sm:p-3 sm:text-sm"
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

          <button
            onClick={fetchStudents}
            disabled={loading}
            className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto sm:text-sm"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-2 md:hidden">
          {loading ? (
            <div className="rounded-xl bg-white p-3 text-center text-sm text-gray-500 shadow-sm">
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="rounded-xl bg-white p-3 text-center text-sm text-gray-500 shadow-sm">
              No students found
            </div>
          ) : (
            paginatedStudents.map((en) => (
              <div key={en._id} className="rounded-xl bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <img
                    src={en.studentId?.image || "/placeholder.png"}
                    alt="Student"
                    className="h-10 w-10 rounded-full object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-gray-900">
                      {en.studentId?.name || "Deleted student"}
                    </h3>

                    <p className="text-xs text-gray-500">
                      {en.studentId?.admissionNumber || "—"} •{" "}
                      {en.classId?.name || "—"} {en.armId?.name || ""}
                    </p>

                    <p className="mt-1">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-medium ${categoryClass(
                          en.studentCategory
                        )}`}
                      >
                        {formatCategory(en.studentCategory)}
                      </span>
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-medium ${getStatusClass(
                      en.studentId
                    )}`}
                  >
                    {getStatusLabel(en.studentId)}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => openViewModal(en)}
                    className="rounded-md bg-gray-700 py-1.5 text-[10px] font-medium text-white"
                  >
                    View
                  </button>

                  {studentStatus !== "graduated" && (
                    <>
                      <button
                        onClick={() => openEditModal(en)}
                        className="rounded-md bg-blue-600 py-1.5 text-[10px] font-medium text-white"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => toggleBlock(en)}
                        className={`rounded-md py-1.5 text-[10px] font-medium text-white ${
                          en.studentId?.blocked ? "bg-green-600" : "bg-red-600"
                        }`}
                      >
                        {en.studentId?.blocked ? "Unblock" : "Block"}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => deleteStudent(en)}
                    className="rounded-md bg-black py-1.5 text-[10px] font-medium text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm md:block">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">SN</th>
                <th className="p-3">Name</th>
                <th className="p-3">Admission No</th>
                <th className="p-3">Class</th>
                <th className="p-3">Arm</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((en, idx) => (
                  <tr key={en._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>

                    <td className="p-3">{en.studentId?.name || "—"}</td>

                    <td className="p-3">
                      {en.studentId?.admissionNumber || "—"}
                    </td>

                    <td className="p-3">{en.classId?.name || "—"}</td>

                    <td className="p-3">{en.armId?.name || "—"}</td>

                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${categoryClass(
                          en.studentCategory
                        )}`}
                      >
                        {formatCategory(en.studentCategory)}
                      </span>
                    </td>

                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(
                          en.studentId
                        )}`}
                      >
                        {getStatusLabel(en.studentId)}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openViewModal(en)}
                          className="rounded bg-gray-700 px-3 py-1 text-xs text-white"
                        >
                          View
                        </button>

                        {studentStatus !== "graduated" && (
                          <>
                            <button
                              onClick={() => openEditModal(en)}
                              className="rounded bg-blue-600 px-3 py-1 text-xs text-white"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => toggleBlock(en)}
                              className={`rounded px-3 py-1 text-xs text-white ${
                                en.studentId?.blocked
                                  ? "bg-green-600"
                                  : "bg-red-600"
                              }`}
                            >
                              {en.studentId?.blocked ? "Unblock" : "Block"}
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => deleteStudent(en)}
                          className="rounded bg-black px-3 py-1 text-xs text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg bg-gray-200 px-3 py-2 text-xs font-medium disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-xs text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-lg bg-gray-200 px-3 py-2 text-xs font-medium disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedStudent && mode === "view" && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 px-3 sm:items-center sm:justify-center">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 sm:max-w-lg sm:rounded-2xl sm:p-6">
            <div ref={printRef}>
              <h2 className="mb-4 text-center text-xl font-bold">
                Student Profile
              </h2>

              <div className="mb-4 flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
                <img
                  src={selectedStudent.studentId?.image || "/placeholder.png"}
                  alt="Student"
                  className="h-28 w-28 rounded-full object-cover"
                />

                <div className="text-sm">
                  <p>
                    <strong>Name:</strong> {selectedStudent.studentId?.name}
                  </p>

                  <p>
                    <strong>Admission No:</strong>{" "}
                    {selectedStudent.studentId?.admissionNumber}
                  </p>

                  <p>
                    <strong>Gender:</strong> {selectedStudent.studentId?.gender}
                  </p>

                  <p>
                    <strong>Contact:</strong>{" "}
                    {selectedStudent.studentId?.parentContact}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {getStatusLabel(selectedStudent.studentId)}
                  </p>

                  {selectedStudent.studentId?.status === "graduated" && (
                    <>
                      <p>
                        <strong>Graduated:</strong>{" "}
                        {selectedStudent.studentId?.graduatedAt
                          ? new Date(
                              selectedStudent.studentId.graduatedAt
                            ).toLocaleDateString()
                          : "-"}
                      </p>

                      <p className="mt-2 rounded-lg bg-purple-50 p-2 text-xs text-purple-700">
                        This student has graduated and is now an alumni record.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-3 text-sm">
                <p>
                  <strong>Class:</strong> {selectedStudent.classId?.name}
                </p>

                <p>
                  <strong>Arm:</strong> {selectedStudent.armId?.name}
                </p>

                <p>
                  <strong>Session:</strong> {selectedStudent.sessionId?.name}
                </p>

                <p className="mt-2">
                  <strong>Category:</strong>{" "}
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${categoryClass(
                      selectedStudent.studentCategory
                    )}`}
                  >
                    {formatCategory(selectedStudent.studentCategory)}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={handlePrint}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white"
              >
                Print
              </button>

              <button
                onClick={closeModal}
                className="rounded-xl bg-gray-200 px-4 py-3 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedStudent && mode === "edit" && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 px-3 sm:items-center sm:justify-center">
          <form
            onSubmit={submitEdit}
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 sm:max-w-lg sm:rounded-2xl sm:p-6"
          >
            <h2 className="mb-4 text-xl font-bold">Edit Student</h2>

            <div className="space-y-3">
              <input
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                className="w-full rounded-xl border p-3 text-sm"
                placeholder="Name"
                required
              />

              <input
                type="date"
                name="dateOfBirth"
                value={editForm.dateOfBirth}
                onChange={handleEditChange}
                className="w-full rounded-xl border p-3 text-sm"
                required
              />

              <select
                name="gender"
                value={editForm.gender}
                onChange={handleEditChange}
                className="w-full rounded-xl border p-3 text-sm"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              <input
                name="parentContact"
                value={editForm.parentContact}
                onChange={handleEditChange}
                className="w-full rounded-xl border p-3 text-sm"
                placeholder="Parent Contact"
                required
              />

              <select
                name="classId"
                value={editForm.classId}
                onChange={handleEditChange}
                className="w-full rounded-xl border p-3 text-sm"
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>

              <select
                name="armId"
                value={editForm.armId}
                onChange={handleEditChange}
                className="w-full rounded-xl border p-3 text-sm"
                required
              >
                <option value="">Select Arm</option>
                {armsForSelectedClass(editForm.classId).map((arm) => (
                  <option key={arm._id} value={arm._id}>
                    {arm.name}
                  </option>
                ))}
              </select>

              <select
                name="studentCategory"
                value={editForm.studentCategory}
                onChange={handleEditChange}
                className="w-full rounded-xl border p-3 text-sm"
                required
              >
                <option value="returning">Returning Student</option>
                <option value="new_intake">New Intake</option>
                <option value="transfer">Transfer Student</option>
              </select>

              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleEditChange}
                className="w-full text-sm"
              />

              <input
                type="password"
                name="newPassword"
                value={editForm.newPassword}
                onChange={handleEditChange}
                className="w-full rounded-xl border p-3 text-sm"
                placeholder="New password optional"
              />

              <input
                type="password"
                name="confirmPassword"
                value={editForm.confirmPassword}
                onChange={handleEditChange}
                className="w-full rounded-xl border p-3 text-sm"
                placeholder="Confirm new password"
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl bg-gray-200 px-4 py-3 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}