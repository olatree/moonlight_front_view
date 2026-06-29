// src/pages/admin/lessons/ManageLessonsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  FileText,
  Video,
  Type,
  Eye,
  Pencil,
  Trash2,
  UploadCloud,
  Archive,
  Search,
  Filter,
} from "lucide-react";
import api from "../../../api/axios";

const statusClass = (status) =>
  status === "published"
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700";

const ManageLessonsPage = () => {
  const [lessons, setLessons] = useState([]);
  const [activeSessionTerm, setActiveSessionTerm] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [arms, setArms] = useState([]);

  const [filters, setFilters] = useState({
    termId: "",
    classId: "",
    armId: "",
    subjectId: "",
    week: "",
    status: "",
  });

  const [previewLesson, setPreviewLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getData = (res) => res.data?.data ?? res.data;

  const fetchInitialData = async () => {
    try {
      const [activeRes, classesRes, subjectsRes] = await Promise.all([
        api.get("/sessions/active"),
        api.get("/classes"),
        api.get("/subjects"),
      ]);

      const active = getData(activeRes);

      setActiveSessionTerm(active);
      setClasses(getData(classesRes) || []);
      setSubjects(getData(subjectsRes) || []);

      setFilters((prev) => ({
        ...prev,
        termId: active?.term?._id || "",
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load page data");
    }
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        sessionId: activeSessionTerm?.session?._id,
      };

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const res = await api.get("/lessons", { params });
      setLessons(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const selectedClass = classes.find((cls) => cls._id === filters.classId);
    setArms(selectedClass?.arms || []);
    setFilters((prev) => ({ ...prev, armId: "" }));
  }, [filters.classId, classes]);

  useEffect(() => {
    if (activeSessionTerm?.session?._id) {
      fetchLessons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionTerm]);

  const updateFilter = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      termId: activeSessionTerm?.term?._id || "",
      classId: "",
      armId: "",
      subjectId: "",
      week: "",
      status: "",
    });
  };

  const resourceCounts = (lesson) => {
    const resources = lesson.resources || [];

    return {
      documents: resources.filter((r) => r.type === "document").length,
      videos: resources.filter((r) => r.type === "video_link").length,
      texts: resources.filter((r) => r.type === "text").length,
      total: resources.length,
    };
  };

  const togglePublish = async (lesson) => {
    try {
      setMessage("");
      setError("");

      const nextStatus = lesson.status === "published" ? "draft" : "published";

      await api.put(`/lessons/${lesson._id}`, {
        status: nextStatus,
      });

      setMessage(
        nextStatus === "published"
          ? "Lesson published successfully"
          : "Lesson unpublished successfully"
      );

      fetchLessons();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update lesson status");
    }
  };

  const archiveLesson = async (lesson) => {
    if (!window.confirm("Archive this lesson?")) return;

    try {
      await api.put(`/lessons/${lesson._id}`, {
        status: "draft",
      });

      setMessage("Lesson archived as draft");
      fetchLessons();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to archive lesson");
    }
  };

  const deleteLesson = async (lesson) => {
    if (!window.confirm("Delete this lesson permanently?")) return;

    try {
      await api.delete(`/lessons/${lesson._id}`);
      setMessage("Lesson deleted successfully");
      fetchLessons();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete lesson");
    }
  };

  const terms = useMemo(() => {
    const activeTerm = activeSessionTerm?.term;
    return activeTerm ? [activeTerm] : [];
  }, [activeSessionTerm]);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Manage Lessons
          </h1>
          <p className="text-sm text-gray-500">
            Create, filter, preview, publish and manage learning resources.
          </p>
        </div>

        <Link
          to="/admin/lessons/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white"
        >
          <UploadCloud size={17} />
          Create Lesson
        </Link>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-gray-800">
          <Filter size={18} />
          <h2 className="font-semibold">Filters</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <Select
            label="Term"
            value={filters.termId}
            onChange={(value) => updateFilter("termId", value)}
            options={terms}
            placeholder="All Terms"
          />

          <Select
            label="Class"
            value={filters.classId}
            onChange={(value) => updateFilter("classId", value)}
            options={classes}
            placeholder="All Classes"
          />

          <Select
            label="Arm"
            value={filters.armId}
            onChange={(value) => updateFilter("armId", value)}
            options={arms}
            placeholder="All Arms"
            disabled={!filters.classId}
          />

          <Select
            label="Subject"
            value={filters.subjectId}
            onChange={(value) => updateFilter("subjectId", value)}
            options={subjects}
            placeholder="All Subjects"
          />

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Week
            </label>
            <input
              type="number"
              min="1"
              value={filters.week}
              onChange={(e) => updateFilter("week", e.target.value)}
              placeholder="Any week"
              className="w-full rounded-lg border px-3 py-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="w-full rounded-lg border px-3 py-3 text-sm"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={fetchLessons}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Search size={16} />
            {loading ? "Loading..." : "Apply Filters"}
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg bg-gray-200 px-4 py-3 text-sm font-semibold text-gray-700"
          >
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-500">
          Loading lessons...
        </div>
      ) : lessons.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center">
          <BookOpen className="mx-auto mb-3 text-gray-400" size={38} />
          <h2 className="font-semibold text-gray-800">No lessons found</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create a lesson or adjust your filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lessons.map((lesson) => {
            const counts = resourceCounts(lesson);

            return (
              <div
                key={lesson._id}
                className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <span className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Week {lesson.week || 1}
                    </span>

                    <h2 className="text-base font-bold text-gray-900">
                      {lesson.title}
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      {lesson.classId?.name || "N/A"}{" "}
                      {lesson.armId?.name || "All Arms"} •{" "}
                      {lesson.subjectId?.name || "N/A"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(
                      lesson.status
                    )}`}
                  >
                    {lesson.status}
                  </span>
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

                <div className="mb-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                  <p>
                    <b>Term:</b> {lesson.termId?.name || "N/A"}
                  </p>
                  <p>
                    <b>Total Resources:</b> {counts.total}
                  </p>
                  <p>
                    <b>Created By:</b> {lesson.createdBy?.name || "N/A"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPreviewLesson(lesson)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    <Eye size={14} />
                    Preview
                  </button>

                  <Link
                    to={`/admin/lessons/${lesson._id}/edit`}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-gray-800 px-3 py-2 text-xs font-semibold text-white"
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>

                  <button
                    onClick={() => togglePublish(lesson)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    <UploadCloud size={14} />
                    {lesson.status === "published" ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    onClick={() => archiveLesson(lesson)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-yellow-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    <Archive size={14} />
                    Archive
                  </button>

                  <button
                    onClick={() => deleteLesson(lesson)}
                    className="col-span-2 inline-flex items-center justify-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {previewLesson && (
        <PreviewModal
          lesson={previewLesson}
          onClose={() => setPreviewLesson(null)}
        />
      )}
    </div>
  );
};

const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}) => (
  <div>
    <label className="mb-1 block text-xs font-medium text-gray-600">
      {label}
    </label>

    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-lg border px-3 py-3 text-sm disabled:bg-gray-100"
    >
      <option value="">{placeholder}</option>
      {options.map((item) => (
        <option key={item._id} value={item._id}>
          {item.name}
        </option>
      ))}
    </select>
  </div>
);

const ResourceBadge = ({ icon, label, value }) => (
  <div className="rounded-lg bg-gray-50 p-2 text-center">
    <div className="mx-auto mb-1 flex justify-center text-gray-500">{icon}</div>
    <p className="font-bold text-gray-800">{value}</p>
    <p className="text-[11px] text-gray-500">{label}</p>
  </div>
);

const PreviewModal = ({ lesson, onClose }) => {
  const documents = lesson.resources?.filter((r) => r.type === "document") || [];
  const videos = lesson.resources?.filter((r) => r.type === "video_link") || [];
  const texts = lesson.resources?.filter((r) => r.type === "text") || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-0 sm:items-center sm:justify-center sm:p-4">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:max-w-3xl sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-blue-700">
              Student Preview
            </p>
            <h2 className="text-xl font-bold text-gray-900">{lesson.title}</h2>
            <p className="text-sm text-gray-500">
              Week {lesson.week} • {lesson.subjectId?.name} •{" "}
              {lesson.classId?.name} {lesson.armId?.name || "All Arms"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
          >
            Close
          </button>
        </div>

        {lesson.description && (
          <div className="mb-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
            {lesson.description}
          </div>
        )}

        {texts.length > 0 && (
          <PreviewSection title="Teacher Notes" icon={<Type size={17} />}>
            {texts.map((item) => (
              <div key={item._id} className="rounded-lg border p-3">
                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                {item.description && (
                  <p className="mt-1 text-xs text-gray-500">
                    {item.description}
                  </p>
                )}
                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
                  {item.content}
                </p>
              </div>
            ))}
          </PreviewSection>
        )}

        {documents.length > 0 && (
          <PreviewSection title="Documents" icon={<FileText size={17} />}>
            {documents.map((item) => (
              <a
                key={item._id}
                href={item.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {item.fileName || item.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.fileMimeType || "Document"}
                  </p>
                </div>
                <span className="text-blue-600">Open</span>
              </a>
            ))}
          </PreviewSection>
        )}

        {videos.length > 0 && (
          <PreviewSection title="Video Lessons" icon={<Video size={17} />}>
            {videos.map((item) => (
              <a
                key={item._id}
                href={item.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border p-3 text-sm hover:bg-gray-50"
              >
                <p className="font-semibold text-gray-800">{item.title}</p>
                {item.description && (
                  <p className="mt-1 text-xs text-gray-500">
                    {item.description}
                  </p>
                )}
                <p className="mt-2 break-all text-xs text-blue-600">
                  {item.videoUrl}
                </p>
              </a>
            ))}
          </PreviewSection>
        )}
      </div>
    </div>
  );
};

const PreviewSection = ({ title, icon, children }) => (
  <section className="mb-5">
    <div className="mb-3 flex items-center gap-2">
      {icon}
      <h3 className="font-bold text-gray-800">{title}</h3>
    </div>

    <div className="space-y-3">{children}</div>
  </section>
);

export default ManageLessonsPage;