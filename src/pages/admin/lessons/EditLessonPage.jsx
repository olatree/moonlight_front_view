// src/pages/admin/lessons/EditLessonPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FileText, PlusCircle, Trash2, Video, Type } from "lucide-react";
import api from "../../../api/axios";

const EditLessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [arms, setArms] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    week: 1,
    classId: "",
    armId: "",
    subjectId: "",
    status: "draft",
  });

  const [textResources, setTextResources] = useState([
    { title: "", description: "", content: "" },
  ]);

  const [videoResources, setVideoResources] = useState([
    { title: "", description: "", videoUrl: "" },
  ]);

  const [files, setFiles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getData = (res) => res.data?.data ?? res.data;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [lessonRes, classesRes, subjectsRes] = await Promise.all([
        api.get(`/lessons/${id}`),
        api.get("/classes"),
        api.get("/subjects"),
      ]);

      const lessonData = getData(lessonRes);

      setLesson(lessonData);
      setClasses(getData(classesRes) || []);
      setSubjects(getData(subjectsRes) || []);

      setForm({
        title: lessonData.title || "",
        description: lessonData.description || "",
        week: lessonData.week || 1,
        classId: lessonData.classId?._id || lessonData.classId || "",
        armId: lessonData.armId?._id || lessonData.armId || "",
        subjectId: lessonData.subjectId?._id || lessonData.subjectId || "",
        status: lessonData.status || "draft",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load lesson");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const selectedClass = classes.find((cls) => cls._id === form.classId);
    setArms(selectedClass?.arms || []);
  }, [form.classId, classes]);

  const updateForm = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "classId" ? { armId: "" } : {}),
    }));
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await api.put(`/lessons/${id}`, form);

      setMessage("Lesson updated successfully");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update lesson");
    } finally {
      setSaving(false);
    }
  };

  const handleAddResources = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const validTextResources = textResources.filter(
        (item) => item.title.trim() && item.content.trim()
      );

      const validVideoResources = videoResources.filter(
        (item) => item.title.trim() && item.videoUrl.trim()
      );

      if (
        validTextResources.length === 0 &&
        validVideoResources.length === 0 &&
        files.length === 0
      ) {
        setError("Add at least one resource.");
        return;
      }

      const formData = new FormData();

      formData.append("textResources", JSON.stringify(validTextResources));
      formData.append("videoResources", JSON.stringify(validVideoResources));

      files.forEach((file) => {
        formData.append("files", file);
      });

      await api.post(`/lessons/${id}/resources`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setTextResources([{ title: "", description: "", content: "" }]);
      setVideoResources([{ title: "", description: "", videoUrl: "" }]);
      setFiles([]);
      setMessage("Resources added successfully");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add resources");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveResource = async (resourceId) => {
    if (!window.confirm("Remove this resource?")) return;

    try {
      setMessage("");
      setError("");

      await api.delete(`/lessons/${id}/resources/${resourceId}`);

      setMessage("Resource removed successfully");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove resource");
    }
  };

  const handleStatusChange = async (status) => {
    try {
      setMessage("");
      setError("");

      await api.patch(`/lessons/${id}/status`, { status });

      setMessage("Lesson status updated");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const updateTextResource = (index, name, value) => {
    const updated = [...textResources];
    updated[index][name] = value;
    setTextResources(updated);
  };

  const updateVideoResource = (index, name, value) => {
    const updated = [...videoResources];
    updated[index][name] = value;
    setVideoResources(updated);
  };

  const addTextResource = () => {
    setTextResources([
      ...textResources,
      { title: "", description: "", content: "" },
    ]);
  };

  const addVideoResource = () => {
    setVideoResources([
      ...videoResources,
      { title: "", description: "", videoUrl: "" },
    ]);
  };

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading lesson...</div>;
  }

  if (!lesson) {
    return (
      <div className="p-4">
        <p className="text-sm text-red-600">Lesson not found.</p>
        <Link to="/admin/lessons" className="text-sm text-green-700 underline">
          Back to lessons
        </Link>
      </div>
    );
  }

  const documents = lesson.resources?.filter((r) => r.type === "document") || [];
  const videos = lesson.resources?.filter((r) => r.type === "video_link") || [];
  const texts = lesson.resources?.filter((r) => r.type === "text") || [];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Edit Lesson
          </h1>
          <p className="text-sm text-gray-500">
            Update lesson details and manage learning resources.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/lessons")}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
        >
          Back
        </button>
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

      <form
        onSubmit={handleUpdateInfo}
        className="mb-5 rounded-xl bg-white p-4 shadow-sm"
      >
        <h2 className="mb-4 text-base font-semibold text-gray-800">
          Lesson Information
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Lesson Title"
            value={form.title}
            onChange={(value) => updateForm("title", value)}
          />

          <Input
            label="Week"
            type="number"
            value={form.week}
            onChange={(value) => updateForm("week", value)}
          />

          <Select
            label="Class"
            value={form.classId}
            onChange={(value) => updateForm("classId", value)}
            options={classes}
            placeholder="Select Class"
          />

          <Select
            label="Arm"
            value={form.armId}
            onChange={(value) => updateForm("armId", value)}
            options={arms}
            placeholder="All Arms"
          />

          <Select
            label="Subject"
            value={form.subjectId}
            onChange={(value) => updateForm("subjectId", value)}
            options={subjects}
            placeholder="Select Subject"
          />

          <Select
            label="Status"
            value={form.status}
            onChange={(value) => updateForm("status", value)}
            options={[
              { _id: "draft", name: "Draft" },
              { _id: "published", name: "Published" },
              { _id: "archived", name: "Archived" },
            ]}
            placeholder="Select Status"
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-gray-600">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => updateForm("description", e.target.value)}
            rows="3"
            className="w-full rounded-lg border px-3 py-3 text-sm"
          />
        </div>

        <button
          disabled={saving}
          className="mt-4 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800">
          Quick Status
        </h2>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => handleStatusChange("published")}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Publish
          </button>

          <button
            onClick={() => handleStatusChange("draft")}
            className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Unpublish
          </button>

          <button
            onClick={() => handleStatusChange("archived")}
            className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Archive
          </button>
        </div>
      </div>

      <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800">
          Current Resources
        </h2>

        <ResourceSection
          title="Typed Notes"
          icon={<Type size={17} />}
          resources={texts}
          onRemove={handleRemoveResource}
        />

        <ResourceSection
          title="Documents"
          icon={<FileText size={17} />}
          resources={documents}
          onRemove={handleRemoveResource}
        />

        <ResourceSection
          title="Video Links"
          icon={<Video size={17} />}
          resources={videos}
          onRemove={handleRemoveResource}
        />
      </div>

      <form
        onSubmit={handleAddResources}
        className="rounded-xl bg-white p-4 shadow-sm"
      >
        <h2 className="mb-4 text-base font-semibold text-gray-800">
          Add New Resources
        </h2>

        <ResourceInputBlock
          title="Typed Notes"
          items={textResources}
          setItems={setTextResources}
          updateItem={updateTextResource}
          addItem={addTextResource}
          fields={["title", "description", "content"]}
        />

        <ResourceInputBlock
          title="Video Links"
          items={videoResources}
          setItems={setVideoResources}
          updateItem={updateVideoResource}
          addItem={addVideoResource}
          fields={["title", "description", "videoUrl"]}
        />

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-gray-600">
            Upload Documents
          </label>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="w-full text-sm"
          />
        </div>

        <button
          disabled={saving}
          className="mt-5 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          <PlusCircle size={16} />
          {saving ? "Adding..." : "Add Resources"}
        </button>
      </form>
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-600">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border px-3 py-3 text-sm"
    />
  </div>
);

const Select = ({ label, value, onChange, options, placeholder }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-600">
      {label}
    </label>
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border px-3 py-3 text-sm"
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

const ResourceSection = ({ title, icon, resources, onRemove }) => (
  <div className="mb-5">
    <div className="mb-2 flex items-center gap-2">
      {icon}
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>

    {resources.length === 0 ? (
      <p className="text-sm text-gray-500">No {title.toLowerCase()} added.</p>
    ) : (
      <div className="space-y-2">
        {resources.map((resource) => (
          <div
            key={resource._id}
            className="flex flex-col gap-2 rounded-lg border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-gray-800">
                {resource.title || resource.fileName}
              </p>
              {resource.fileUrl && (
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600"
                >
                  Open document
                </a>
              )}
              {resource.videoUrl && (
                <a
                  href={resource.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-xs text-blue-600"
                >
                  {resource.videoUrl}
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => onRemove(resource._id)}
              className="inline-flex items-center justify-center gap-1 rounded bg-red-600 px-3 py-2 text-xs text-white"
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

const ResourceInputBlock = ({
  title,
  items,
  updateItem,
  addItem,
  fields,
}) => (
  <div className="mb-5 rounded-lg border p-3">
    <div className="mb-3 flex items-center justify-between">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <button
        type="button"
        onClick={addItem}
        className="rounded bg-gray-800 px-3 py-2 text-xs text-white"
      >
        Add More
      </button>
    </div>

    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-lg bg-gray-50 p-3">
          <input
            value={item.title}
            onChange={(e) => updateItem(index, "title", e.target.value)}
            placeholder="Title"
            className="mb-2 w-full rounded-lg border px-3 py-2 text-sm"
          />

          <input
            value={item.description}
            onChange={(e) => updateItem(index, "description", e.target.value)}
            placeholder="Description"
            className="mb-2 w-full rounded-lg border px-3 py-2 text-sm"
          />

          {fields.includes("content") && (
            <textarea
              value={item.content}
              onChange={(e) => updateItem(index, "content", e.target.value)}
              placeholder="Typed note"
              rows="4"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          )}

          {fields.includes("videoUrl") && (
            <input
              value={item.videoUrl}
              onChange={(e) => updateItem(index, "videoUrl", e.target.value)}
              placeholder="Video URL"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          )}
        </div>
      ))}
    </div>
  </div>
);

export default EditLessonPage;