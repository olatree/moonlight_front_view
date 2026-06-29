// // src/pages/student/StudentLessonsPage.jsx
// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import {
//   BookOpen,
//   FileText,
//   Video,
//   Type,
//   Eye,
//   Search,
//   Filter,
// } from "lucide-react";
// import api from "../../api/axios";

// const TERM_OPTIONS = ["1st Term", "2nd Term", "3rd Term"];

// const StudentLessonsPage = () => {
//   const [lessons, setLessons] = useState([]);
//   const [subjects, setSubjects] = useState([]);

//   const [filters, setFilters] = useState({
//     subjectId: "",
//     termName: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [filterLoading, setFilterLoading] = useState(false);
//   const [error, setError] = useState("");

//   const getData = (res) => res.data?.data ?? res.data;

//   const fetchLessons = async (filtersToUse = filters) => {
//     try {
//       setLoading(true);
//       setError("");

//       const params = {};

//       if (filtersToUse.subjectId) {
//         params.subjectId = filtersToUse.subjectId;
//       }

//       if (filtersToUse.termName) {
//         params.termName = filtersToUse.termName;
//       }

//       const res = await api.get("/lessons/student", { params });

//       setLessons(res.data.data || []);
//     } catch (err) {
//       setLessons([]);
//       setError(err.response?.data?.message || "Failed to load lessons");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchFilterDataAndLessons = async () => {
//     try {
//       setFilterLoading(true);
//       setError("");

//       const subjectsRes = await api.get("/subjects");
//       const subjectsPayload = getData(subjectsRes);

//       setSubjects(Array.isArray(subjectsPayload) ? subjectsPayload : []);

//       const nextFilters = {
//         subjectId: "",
//         termName: "",
//       };

//       setFilters(nextFilters);
//       await fetchLessons(nextFilters);
//     } catch (err) {
//       console.error("Filter data error:", err);
//       setError(err.response?.data?.message || "Failed to load filters");
//     } finally {
//       setFilterLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchFilterDataAndLessons();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const applyFilters = () => {
//     fetchLessons(filters);
//   };

//   const resetFilters = () => {
//     const nextFilters = {
//       subjectId: "",
//       termName: "",
//     };

//     setFilters(nextFilters);
//     fetchLessons(nextFilters);
//   };

//   const getResourceCounts = (lesson) => {
//     const resources = lesson.resources || [];

//     return {
//       documents: resources.filter((r) => r.type === "document").length,
//       videos: resources.filter((r) => r.type === "video_link").length,
//       texts: resources.filter((r) => r.type === "text").length,
//     };
//   };

//   const getLessonTermName = (lesson) => {
//     return lesson.termName || lesson.termId?.name || "Term";
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
//       <div className="mb-5">
//         <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
//           My Lessons
//         </h1>
//         <p className="text-sm text-gray-500">
//           View lesson notes, downloadable documents and video lessons.
//         </p>
//       </div>

//       {error && (
//         <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
//         <div className="mb-4 flex items-center gap-2 text-gray-800">
//           <Filter size={18} />
//           <h2 className="font-semibold">Filters</h2>
//         </div>

//         <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
//           <div>
//             <label className="mb-1 block text-xs font-medium text-gray-600">
//               Subject
//             </label>
//             <select
//               value={filters.subjectId}
//               onChange={(e) =>
//                 setFilters({ ...filters, subjectId: e.target.value })
//               }
//               disabled={filterLoading}
//               className="w-full rounded-lg border px-3 py-3 text-sm disabled:bg-gray-100"
//             >
//               <option value="">All Subjects</option>
//               {subjects.map((subject) => (
//                 <option key={subject._id} value={subject._id}>
//                   {subject.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="mb-1 block text-xs font-medium text-gray-600">
//               Term
//             </label>
//             <select
//               value={filters.termName}
//               onChange={(e) =>
//                 setFilters({ ...filters, termName: e.target.value })
//               }
//               disabled={filterLoading}
//               className="w-full rounded-lg border px-3 py-3 text-sm disabled:bg-gray-100"
//             >
//               <option value="">All Terms</option>
//               {TERM_OPTIONS.map((term) => (
//                 <option key={term} value={term}>
//                   {term}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex items-end">
//             <button
//               type="button"
//               onClick={applyFilters}
//               disabled={loading}
//               className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
//             >
//               <Search size={16} />
//               {loading ? "Loading..." : "Apply"}
//             </button>
//           </div>

//           <div className="flex items-end">
//             <button
//               type="button"
//               onClick={resetFilters}
//               className="w-full rounded-lg bg-gray-200 px-4 py-3 text-sm font-semibold text-gray-700"
//             >
//               Reset
//             </button>
//           </div>
//         </div>
//       </div>

//       {loading ? (
//         <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-500">
//           Loading lessons...
//         </div>
//       ) : lessons.length === 0 ? (
//         <div className="rounded-xl bg-white p-8 text-center">
//           <BookOpen className="mx-auto mb-3 text-gray-400" size={38} />
//           <h2 className="font-semibold text-gray-800">No lessons found</h2>
//           <p className="mt-1 text-sm text-gray-500">
//             Published lessons will appear here.
//           </p>
//         </div>
//       ) : (
//         <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//           {lessons.map((lesson) => {
//             const counts = getResourceCounts(lesson);

//             return (
//               <div
//                 key={lesson._id}
//                 className="rounded-2xl border bg-white p-4 shadow-sm"
//               >
//                 <div className="mb-3">
//                   <span className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
//                     Week {lesson.week || 1}
//                   </span>

//                   <h2 className="text-base font-bold text-gray-900">
//                     {lesson.title}
//                   </h2>

//                   <p className="mt-1 text-xs text-gray-500">
//                     {lesson.subjectId?.name || "Subject"} •{" "}
//                     {getLessonTermName(lesson)}
//                   </p>
//                 </div>

//                 {lesson.description && (
//                   <p className="mb-3 line-clamp-2 text-sm text-gray-600">
//                     {lesson.description}
//                   </p>
//                 )}

//                 <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
//                   <ResourceBadge
//                     icon={<FileText size={14} />}
//                     label="Docs"
//                     value={counts.documents}
//                   />

//                   <ResourceBadge
//                     icon={<Video size={14} />}
//                     label="Videos"
//                     value={counts.videos}
//                   />

//                   <ResourceBadge
//                     icon={<Type size={14} />}
//                     label="Notes"
//                     value={counts.texts}
//                   />
//                 </div>

//                 <Link
//                   to={`/student/lessons/${lesson._id}`}
//                   className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white"
//                 >
//                   <Eye size={16} />
//                   View Lesson
//                 </Link>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// const ResourceBadge = ({ icon, label, value }) => (
//   <div className="rounded-lg bg-gray-50 p-2 text-center">
//     <div className="mx-auto mb-1 flex justify-center text-gray-500">{icon}</div>
//     <p className="font-bold text-gray-800">{value}</p>
//     <p className="text-[11px] text-gray-500">{label}</p>
//   </div>
// );

// export default StudentLessonsPage;


// src/pages/student/StudentLessonsPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  FileText,
  Video,
  Type,
  Eye,
  Search,
  Filter,
} from "lucide-react";
import api from "../../api/axios";

const TERM_OPTIONS = ["1st Term", "2nd Term", "3rd Term"];

const StudentLessonsPage = () => {
  const [lessons, setLessons] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [filters, setFilters] = useState({
    subjectId: "",
    termName: "",
  });

  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState("");

  const getData = (res) => res.data?.data ?? res.data;

  const fetchSubjects = async () => {
    try {
      setFilterLoading(true);
      setError("");

      const subjectsRes = await api.get("/subjects");
      const subjectsPayload = getData(subjectsRes);

      setSubjects(Array.isArray(subjectsPayload) ? subjectsPayload : []);
    } catch (err) {
      console.error("Filter data error:", err);
      setError(err.response?.data?.message || "Failed to load filters");
    } finally {
      setFilterLoading(false);
    }
  };

  const fetchLessons = async (filtersToUse = filters) => {
    if (!filtersToUse.subjectId && !filtersToUse.termName) {
      setError("Please select a subject or term before searching.");
      setLessons([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      const params = {};

      if (filtersToUse.subjectId) {
        params.subjectId = filtersToUse.subjectId;
      }

      if (filtersToUse.termName) {
        params.termName = filtersToUse.termName;
      }

      const res = await api.get("/lessons/student", { params });

      setLessons(res.data.data || []);
    } catch (err) {
      setLessons([]);
      setError(err.response?.data?.message || "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    fetchLessons(filters);
  };

  const resetFilters = () => {
    const nextFilters = {
      subjectId: "",
      termName: "",
    };

    setFilters(nextFilters);
    setLessons([]);
    setHasSearched(false);
    setError("");
  };

  const getResourceCounts = (lesson) => {
    const resources = lesson.resources || [];

    return {
      documents: resources.filter((r) => r.type === "document").length,
      videos: resources.filter((r) => r.type === "video_link").length,
      texts: resources.filter((r) => r.type === "text").length,
    };
  };

  const getLessonTermName = (lesson) => {
    return lesson.termName || lesson.termId?.name || "Term";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          My Lessons
        </h1>
        <p className="text-sm text-gray-500">
          Search for lesson notes, downloadable documents and video lessons.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-gray-800">
          <Filter size={18} />
          <h2 className="font-semibold">Search Lessons</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Subject
            </label>
            <select
              value={filters.subjectId}
              onChange={(e) =>
                setFilters({ ...filters, subjectId: e.target.value })
              }
              disabled={filterLoading}
              className="w-full rounded-lg border px-3 py-3 text-sm disabled:bg-gray-100"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Term
            </label>
            <select
              value={filters.termName}
              onChange={(e) =>
                setFilters({ ...filters, termName: e.target.value })
              }
              disabled={filterLoading}
              className="w-full rounded-lg border px-3 py-3 text-sm disabled:bg-gray-100"
            >
              <option value="">Select Term</option>
              {TERM_OPTIONS.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={applyFilters}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Search size={16} />
              {loading ? "Loading..." : "Apply"}
            </button>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full rounded-lg bg-gray-200 px-4 py-3 text-sm font-semibold text-gray-700"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {!hasSearched && !loading ? (
        <div className="rounded-xl bg-white p-8 text-center">
          <BookOpen className="mx-auto mb-3 text-gray-400" size={38} />
          <h2 className="font-semibold text-gray-800">Search for lessons</h2>
          <p className="mt-1 text-sm text-gray-500">
            Select a subject or term, then click Apply.
          </p>
        </div>
      ) : loading ? (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-500">
          Loading lessons...
        </div>
      ) : lessons.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center">
          <BookOpen className="mx-auto mb-3 text-gray-400" size={38} />
          <h2 className="font-semibold text-gray-800">No lessons found</h2>
          <p className="mt-1 text-sm text-gray-500">
            Try another subject or term.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lessons.map((lesson) => {
            const counts = getResourceCounts(lesson);

            return (
              <div
                key={lesson._id}
                className="rounded-2xl border bg-white p-4 shadow-sm"
              >
                <div className="mb-3">
                  <span className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    Week {lesson.week || 1}
                  </span>

                  <h2 className="text-base font-bold text-gray-900">
                    {lesson.title}
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    {lesson.subjectId?.name || "Subject"} •{" "}
                    {getLessonTermName(lesson)}
                  </p>
                </div>

                {lesson.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                    {lesson.description}
                  </p>
                )}

                <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
                  <ResourceBadge
                    icon={<FileText size={14} />}
                    label="Docs"
                    value={counts.documents}
                  />

                  <ResourceBadge
                    icon={<Video size={14} />}
                    label="Videos"
                    value={counts.videos}
                  />

                  <ResourceBadge
                    icon={<Type size={14} />}
                    label="Notes"
                    value={counts.texts}
                  />
                </div>

                <Link
                  to={`/student/lessons/${lesson._id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white"
                >
                  <Eye size={16} />
                  View Lesson
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ResourceBadge = ({ icon, label, value }) => (
  <div className="rounded-lg bg-gray-50 p-2 text-center">
    <div className="mx-auto mb-1 flex justify-center text-gray-500">{icon}</div>
    <p className="font-bold text-gray-800">{value}</p>
    <p className="text-[11px] text-gray-500">{label}</p>
  </div>
);

export default StudentLessonsPage;