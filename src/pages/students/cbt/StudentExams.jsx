

// // // pages/students/cbt/StudentExams.jsx
// // import React, { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import api from "../../../api/axios";
// // import { FaClipboardList, FaClock, FaCheckCircle } from "react-icons/fa";

// // const STATUS_COLORS = {
// //   null:      "bg-blue-600 hover:bg-blue-700",
// //   ongoing:   "bg-yellow-500 hover:bg-yellow-600",
// //   submitted: "bg-gray-400 cursor-not-allowed",
// //   timed_out: "bg-gray-400 cursor-not-allowed",
// // };

// // const StudentExams = () => {
// //   const navigate = useNavigate();
// //   const [exams, setExams]       = useState([]);
// //   const [fetching, setFetching] = useState(true);
// //   const [error, setError]       = useState("");

// //   // useEffect(() => {
// //   //   const fetchExams = async () => {
// //   //     try {
// //   //       setFetching(true);
// //   //       setError("");
        
// //   //       console.log("Fetching exams...");
// //   //       const res = await api.get("/cbt/student/exams");
// //   //       console.log("Exams fetched successfully:", res.data);
// //   //       setExams(res.data);
// //   //     } catch (err) {
// //   //       console.error("Error fetching exams:", err);
        
// //   //       if (err.response?.status === 401) {
// //   //         console.log("401 Unauthorized - Student not authenticated");
// //   //         setError("Please login to continue");
// //   //         // Redirect to student login after 2 seconds
// //   //         setTimeout(() => {
// //   //           navigate("/student-login");
// //   //         }, 2000);
// //   //       } else if (err.response?.status === 403) {
// //   //         setError("You don't have permission to access exams");
// //   //       } else if (err.response?.status === 404) {
// //   //         setError("No exams found");
// //   //       } else {
// //   //         setError(err.response?.data?.message || "Failed to load exams. Please try again.");
// //   //       }
// //   //     } finally {
// //   //       setFetching(false);
// //   //     }
// //   //   };
    
// //   //   fetchExams();
// //   // }, [navigate]);

// //   useEffect(() => {
// //   const fetchExams = async () => {
// //     try {
// //       setFetching(true);
// //       setError("");

// //       const res = await api.get("/cbt/student/exams");

// //       const payload = res.data;

// //       const examList = Array.isArray(payload)
// //         ? payload
// //         : payload.exams || payload.data || [];

// //       setExams(examList);
// //     } catch (err) {
// //       console.error("Error fetching exams:", err);

// //       if (err.response?.status === 401) {
// //         setError("Please login to continue");

// //         setTimeout(() => {
// //           navigate("/student-login");
// //         }, 2000);
// //       } else if (err.response?.status === 403) {
// //         setError("You don't have permission to access exams");
// //       } else {
// //         setError(
// //           err.response?.data?.message ||
// //             "Failed to load exams. Please try again."
// //         );
// //       }
// //     } finally {
// //       setFetching(false);
// //     }
// //   };

// //   fetchExams();
// // }, [navigate]);

// //   // Add retry button
// //   const handleRetry = () => {
// //     window.location.reload();
// //   };

// //   const formatTime = (dt) =>
// //     new Date(dt).toLocaleString("en-NG", {
// //       day: "numeric", month: "short",
// //       hour: "2-digit", minute: "2-digit",
// //     });

// //   const getButtonLabel = (status) => {
// //     if (!status)           return "Start Exam";
// //     if (status === "ongoing")   return "Resume Exam";
// //     if (status === "submitted") return "Submitted";
// //     if (status === "timed_out") return "Time Expired";
// //     return "Start Exam";
// //   };

// //   if (fetching) return <div className="p-6 text-center text-gray-400">Loading exams...</div>;

// //   return (
// //     <div className="p-6">
// //       <div className="mb-6">
// //         <h1 className="text-2xl font-bold text-gray-800">My Exams</h1>
// //         <p className="text-sm text-gray-500 mt-1">
// //           Available exams for your class
// //         </p>
// //       </div>

// //       {error && (
// //         <div className="text-center py-10">
// //           <p className="text-red-500 bg-red-50 border border-red-200 rounded px-4 py-2 mb-4">
// //             {error}
// //           </p>
// //           <button
// //             onClick={handleRetry}
// //             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
// //           >
// //             Retry
// //           </button>
// //         </div>
// //       )}

// //       {!error && exams.length === 0 ? (
// //         <div className="text-center py-20 text-gray-400">
// //           <FaClipboardList size={40} className="mx-auto mb-3 opacity-30" />
// //           <p className="text-lg mb-1">No exams available</p>
// //           <p className="text-sm">Check back later</p>
// //         </div>
// //       ) : (
// //         !error && (
// //           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
// //             {exams.map((exam) => (
// //               <div
// //                 key={exam._id}
// //                 className="bg-white border rounded-lg shadow-sm p-4 flex flex-col gap-3"
// //               >
// //                 <div>
// //                   <h3 className="font-semibold text-gray-800">{exam.title}</h3>
// //                   <p className="text-sm text-blue-600 mt-0.5">{exam.subject?.name}</p>
// //                 </div>

// //                 <div className="flex flex-wrap gap-2 text-xs">
// //                   <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
// //                     <FaClock size={10} />
// //                     {exam.duration} min
// //                   </span>
// //                   <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
// //                     Pass: {exam.passMark}%
// //                   </span>
// //                   {exam.sessionStatus === "submitted" && exam.percentage !== null && (
// //                     <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
// //                       <FaCheckCircle size={10} />
// //                       Score: {exam.percentage}%
// //                     </span>
// //                   )}
// //                 </div>

// //                 <div className="text-xs text-gray-400 space-y-0.5">
// //                   <p>Opens: {formatTime(exam.startTime)}</p>
// //                   <p>Closes: {formatTime(exam.endTime)}</p>
// //                 </div>

// //                 {exam.instructions && (
// //                   <p className="text-xs text-gray-500 italic border-l-2 border-green-300 pl-2">
// //                     {exam.instructions}
// //                   </p>
// //                 )}

// //                 {/* <button
// //                   disabled={
// //                     exam.sessionStatus === "submitted" ||
// //                     exam.sessionStatus === "timed_out"
// //                   }
// //                   onClick={() => navigate(`/student/exams/${exam._id}/lobby`)}
// //                   className={`mt-auto w-full text-white text-sm py-2 rounded font-medium transition-colors ${
// //                     STATUS_COLORS[exam.sessionStatus]
// //                   }`}
// //                 >
// //                   {getButtonLabel(exam.sessionStatus)}
// //                 </button> */}

// //                 <div className="text-xs">
// //                   {!hasStarted(exam) ? (
// //                     <span className="text-amber-600 font-medium">
// //                       Opens at {formatTime(exam.startTime)}
// //                     </span>
// //                   ) : hasEnded(exam) ? (
// //                     <span className="text-red-600 font-medium">
// //                       Exam Closed
// //                     </span>
// //                   ) : (
// //                     <span className="text-green-600 font-medium">
// //                       Exam Open
// //                     </span>
// //                   )}
// //                 </div>

// //                 <button
// //   disabled={
// //     new Date(exam.startTime) > new Date() ||
// //     new Date(exam.endTime) <= new Date() ||
// //     exam.sessionStatus === "submitted" ||
// //     exam.sessionStatus === "timed_out"
// //   }
// //   onClick={() => navigate(`/student/exams/${exam._id}/lobby`)}
// //   className={`mt-auto w-full text-white text-sm py-2 rounded font-medium transition-colors ${
// //     new Date(exam.startTime) > new Date()
// //       ? "bg-gray-400 cursor-not-allowed"
// //       : new Date(exam.endTime) <= new Date()
// //       ? "bg-red-500 cursor-not-allowed"
// //       : STATUS_COLORS[exam.sessionStatus]
// //   }`}
// // >
// //   {new Date(exam.startTime) > new Date()
// //     ? "Not Yet Open"
// //     : new Date(exam.endTime) <= new Date()
// //     ? "Closed"
// //     : getButtonLabel(exam.sessionStatus)}
// // </button>
// //               </div>
// //             ))}
// //           </div>
// //         )
// //       )}
// //     </div>
// //   );
// // };

// // export default StudentExams;


// // pages/students/cbt/StudentExams.jsx
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../../api/axios";
// import { FaClipboardList, FaClock, FaCheckCircle } from "react-icons/fa";

// const STATUS_COLORS = {
//   null: "bg-blue-600 hover:bg-blue-700",
//   ongoing: "bg-yellow-500 hover:bg-yellow-600",
//   submitted: "bg-gray-400 cursor-not-allowed",
//   timed_out: "bg-gray-400 cursor-not-allowed",
// };

// const StudentExams = () => {
//   const navigate = useNavigate();

//   const [exams, setExams] = useState([]);
//   const [fetching, setFetching] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchExams = async () => {
//       try {
//         setFetching(true);
//         setError("");

//         const res = await api.get("/cbt/student/exams");

//         const payload = res.data;
//         const examList = Array.isArray(payload)
//           ? payload
//           : payload.exams || payload.data || [];

//         setExams(examList);
//       } catch (err) {
//         console.error("Error fetching exams:", err);

//         if (err.response?.status === 401) {
//           setError("Please login to continue");

//           setTimeout(() => {
//             navigate("/student-login");
//           }, 2000);
//         } else if (err.response?.status === 403) {
//           setError("You don't have permission to access exams");
//         } else {
//           setError(
//             err.response?.data?.message ||
//               "Failed to load exams. Please try again."
//           );
//         }
//       } finally {
//         setFetching(false);
//       }
//     };

//     fetchExams();
//   }, [navigate]);

//   const handleRetry = () => {
//     window.location.reload();
//   };

//   const formatTime = (dt) =>
//     new Date(dt).toLocaleString("en-NG", {
//       day: "numeric",
//       month: "short",
//       hour: "2-digit",
//       minute: "2-digit",
//     });

//   const hasStarted = (exam) => new Date(exam.startTime) <= new Date();

//   const hasEnded = (exam) => new Date(exam.endTime) <= new Date();

//   const getButtonLabel = (exam) => {
//     if (!hasStarted(exam)) return "Not Yet Open";
//     if (hasEnded(exam)) return "Closed";
//     if (!exam.sessionStatus) return "Start Exam";
//     if (exam.sessionStatus === "ongoing") return "Resume Exam";
//     if (exam.sessionStatus === "submitted") return "Submitted";
//     if (exam.sessionStatus === "timed_out") return "Time Expired";
//     return "Start Exam";
//   };

//   const isButtonDisabled = (exam) => {
//     return (
//       !hasStarted(exam) ||
//       hasEnded(exam) ||
//       exam.sessionStatus === "submitted" ||
//       exam.sessionStatus === "timed_out"
//     );
//   };

//   const getButtonClass = (exam) => {
//     if (!hasStarted(exam)) return "bg-gray-400 cursor-not-allowed";
//     if (hasEnded(exam)) return "bg-red-500 cursor-not-allowed";
//     return STATUS_COLORS[exam.sessionStatus] || STATUS_COLORS.null;
//   };

//   if (fetching) {
//     return (
//       <div className="p-6 text-center text-gray-400">Loading exams...</div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">My Exams</h1>
//         <p className="text-sm text-gray-500 mt-1">
//           Available exams for your class
//         </p>
//       </div>

//       {error && (
//         <div className="text-center py-10">
//           <p className="text-red-500 bg-red-50 border border-red-200 rounded px-4 py-2 mb-4">
//             {error}
//           </p>

//           <button
//             onClick={handleRetry}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Retry
//           </button>
//         </div>
//       )}

//       {!error && exams.length === 0 ? (
//         <div className="text-center py-20 text-gray-400">
//           <FaClipboardList size={40} className="mx-auto mb-3 opacity-30" />
//           <p className="text-lg mb-1">No exams available</p>
//           <p className="text-sm">Check back later</p>
//         </div>
//       ) : (
//         !error && (
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {exams.map((exam) => (
//               <div
//                 key={exam._id}
//                 className="bg-white border rounded-lg shadow-sm p-4 flex flex-col gap-3"
//               >
//                 <div>
//                   <h3 className="font-semibold text-gray-800">
//                     {exam.title}
//                   </h3>
//                   <p className="text-sm text-blue-600 mt-0.5">
//                     {exam.subject?.name}
//                   </p>
//                 </div>

//                 <div className="flex flex-wrap gap-2 text-xs">
//                   <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
//                     <FaClock size={10} />
//                     {exam.duration} min
//                   </span>

//                   <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
//                     Pass: {exam.passMark}%
//                   </span>

//                   {exam.sessionStatus === "submitted" &&
//                     exam.percentage !== null && (
//                       <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
//                         <FaCheckCircle size={10} />
//                         Score: {exam.percentage}%
//                       </span>
//                     )}
//                 </div>

//                 <div className="text-xs text-gray-400 space-y-0.5">
//                   <p>Opens: {formatTime(exam.startTime)}</p>
//                   <p>Closes: {formatTime(exam.endTime)}</p>
//                 </div>

//                 {exam.instructions && (
//                   <p className="text-xs text-gray-500 italic border-l-2 border-green-300 pl-2">
//                     {exam.instructions}
//                   </p>
//                 )}

//                 <div className="text-xs">
//                   {!hasStarted(exam) ? (
//                     <span className="text-amber-600 font-medium">
//                       Opens at {formatTime(exam.startTime)}
//                     </span>
//                   ) : hasEnded(exam) ? (
//                     <span className="text-red-600 font-medium">
//                       Exam Closed
//                     </span>
//                   ) : exam.sessionStatus === "submitted" ? (
//                     <span className="text-gray-600 font-medium">
//                       Already Submitted
//                     </span>
//                   ) : exam.sessionStatus === "timed_out" ? (
//                     <span className="text-red-600 font-medium">
//                       Time Expired
//                     </span>
//                   ) : (
//                     <span className="text-green-600 font-medium">
//                       Exam Open
//                     </span>
//                   )}
//                 </div>

//                 <button
//                   disabled={isButtonDisabled(exam)}
//                   onClick={() => navigate(`/student/exams/${exam._id}/lobby`)}
//                   className={`mt-auto w-full text-white text-sm py-2 rounded font-medium transition-colors ${getButtonClass(
//                     exam
//                   )}`}
//                 >
//                   {getButtonLabel(exam)}
//                 </button>
//               </div>
//             ))}
//           </div>
//         )
//       )}
//     </div>
//   );
// };

// export default StudentExams;


// pages/students/cbt/StudentExams.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { FaClipboardList, FaClock, FaCheckCircle } from "react-icons/fa";

const STATUS_COLORS = {
  null: "bg-blue-600 hover:bg-blue-700",
  ongoing: "bg-yellow-500 hover:bg-yellow-600",
  submitted: "bg-gray-400 cursor-not-allowed",
  timed_out: "bg-gray-400 cursor-not-allowed",
};

const StudentExams = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setFetching(true);
        setError("");

        const res = await api.get("/cbt/student/exams");

        const payload = res.data;
        const examList = Array.isArray(payload)
          ? payload
          : payload.exams || payload.data || [];

        setExams(examList);
      } catch (err) {
        console.error("Error fetching exams:", err);

        if (err.response?.status === 401) {
          setError("Please login to continue");

          setTimeout(() => {
            navigate("/student-login");
          }, 2000);
        } else if (err.response?.status === 403) {
          setError("You don't have permission to access exams");
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to load exams. Please try again."
          );
        }
      } finally {
        setFetching(false);
      }
    };

    fetchExams();
  }, [navigate]);

  const handleRetry = () => {
    window.location.reload();
  };

  const formatTime = (dt) =>
    new Date(dt).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const hasStarted = (exam) => new Date(exam.startTime) <= new Date();

  const hasEnded = (exam) => new Date(exam.endTime) <= new Date();

  const canViewResult = (exam) => {
    return exam.canViewResult === true && exam.percentage !== null;
  };

  const getButtonLabel = (exam) => {
    if (!hasStarted(exam)) return "Not Yet Open";

    if (exam.sessionStatus === "submitted") return "Submitted";
    if (exam.sessionStatus === "timed_out") return "Time Expired";

    if (hasEnded(exam)) return "Closed";

    if (!exam.sessionStatus) return "Start Exam";
    if (exam.sessionStatus === "ongoing") return "Resume Exam";

    return "Start Exam";
  };

  const isButtonDisabled = (exam) => {
    return (
      !hasStarted(exam) ||
      hasEnded(exam) ||
      exam.sessionStatus === "submitted" ||
      exam.sessionStatus === "timed_out"
    );
  };

  const getButtonClass = (exam) => {
    if (!hasStarted(exam)) return "bg-gray-400 cursor-not-allowed";

    if (
      hasEnded(exam) ||
      exam.sessionStatus === "submitted" ||
      exam.sessionStatus === "timed_out"
    ) {
      return "bg-gray-400 cursor-not-allowed";
    }

    return STATUS_COLORS[exam.sessionStatus] || STATUS_COLORS.null;
  };

  const getExamStatus = (exam) => {
    if (!hasStarted(exam)) {
      return (
        <span className="text-amber-600 font-medium">
          Opens at {formatTime(exam.startTime)}
        </span>
      );
    }

    if (exam.sessionStatus === "submitted") {
      return (
        <span className="text-gray-600 font-medium">
          Submitted
        </span>
      );
    }

    if (exam.sessionStatus === "timed_out") {
      return (
        <span className="text-red-600 font-medium">
          Time Expired
        </span>
      );
    }

    if (hasEnded(exam)) {
      return (
        <span className="text-red-600 font-medium">
          Exam Closed
        </span>
      );
    }

    return (
      <span className="text-green-600 font-medium">
        Exam Open
      </span>
    );
  };

  if (fetching) {
    return (
      <div className="p-6 text-center text-gray-400">
        Loading exams...
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Exams</h1>
        <p className="text-sm text-gray-500 mt-1">
          Available exams for your class
        </p>
      </div>

      {error && (
        <div className="text-center py-10">
          <p className="text-red-500 bg-red-50 border border-red-200 rounded px-4 py-2 mb-4">
            {error}
          </p>

          <button
            onClick={handleRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {!error && exams.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FaClipboardList size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg mb-1">No exams available</p>
          <p className="text-sm">Check back later</p>
        </div>
      ) : (
        !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <div
                key={exam._id}
                className="bg-white border rounded-lg shadow-sm p-4 flex flex-col gap-3"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {exam.title}
                  </h3>

                  <p className="text-sm text-blue-600 mt-0.5">
                    {exam.subject?.name}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    <FaClock size={10} />
                    {exam.duration} min
                  </span>

                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                    Pass: {exam.passMark}%
                  </span>

                  {canViewResult(exam) && (
                    <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                      <FaCheckCircle size={10} />
                      Score: {exam.percentage}%
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-400 space-y-0.5">
                  <p>Opens: {formatTime(exam.startTime)}</p>
                  <p>Closes: {formatTime(exam.endTime)}</p>
                </div>

                {exam.instructions && (
                  <p className="text-xs text-gray-500 italic border-l-2 border-green-300 pl-2">
                    {exam.instructions}
                  </p>
                )}

                <div className="text-xs">
                  {getExamStatus(exam)}
                </div>

                {canViewResult(exam) && (
                  <div className="bg-green-50 border border-green-100 rounded p-2 text-xs text-green-700">
                    <p className="font-medium">Result Released</p>
                    <p>
                      Score: {exam.score ?? "-"} / {exam.total ?? "-"}{" "}
                      ({exam.percentage}%)
                    </p>
                  </div>
                )}

                <button
                  disabled={isButtonDisabled(exam)}
                  onClick={() => navigate(`/student/exams/${exam._id}/lobby`)}
                  className={`mt-auto w-full text-white text-sm py-2 rounded font-medium transition-colors ${getButtonClass(
                    exam
                  )}`}
                >
                  {getButtonLabel(exam)}
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default StudentExams;