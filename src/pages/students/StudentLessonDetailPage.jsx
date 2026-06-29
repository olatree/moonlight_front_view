// src/pages/student/StudentLessonDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Download,
  FileText,
  Type,
  Video,
} from "lucide-react";
import api from "../../api/axios";

const StudentLessonDetailsPage = () => {
  const { id } = useParams();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [error, setError] = useState("");

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/lessons/student/${id}`);
      const lessonData = res.data.data;

      setLesson(lessonData);

      const firstVideo = lessonData?.resources?.find(
        (resource) => resource.type === "video_link"
      );

      if (firstVideo) {
        setActiveVideo(firstVideo);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load lesson");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 text-sm text-gray-500">
        Loading lesson...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="rounded-xl bg-red-100 p-4 text-sm text-red-700">
          {error}
        </div>

        <Link
          to="/student/lessons"
          className="mt-4 inline-flex items-center gap-2 text-sm text-green-700"
        >
          <ArrowLeft size={16} />
          Back to lessons
        </Link>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }


const handleDownload = async (document) => {
  try {
    const res = await api.get(
      `/lessons/student/${lesson._id}/resources/${document._id}/download`
    );

    const fileUrl = res.data.data.fileUrl;
    const fileName = res.data.data.fileName || document.fileName || "lesson-document";

    const fileRes = await fetch(fileUrl);
    const blob = await fileRes.blob();

    const blobUrl = window.URL.createObjectURL(blob);
    const link = window.document.createElement("a");

    link.href = blobUrl;
    link.download = fileName;
    window.document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    alert(err.response?.data?.message || "Failed to download document");
  }
};

  const documents = lesson.resources?.filter((r) => r.type === "document") || [];
  const videos = lesson.resources?.filter((r) => r.type === "video_link") || [];
  const texts = lesson.resources?.filter((r) => r.type === "text") || [];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-4">
        <Link
          to="/student/lessons"
          className="inline-flex items-center gap-2 text-sm font-medium text-green-700"
        >
          <ArrowLeft size={16} />
          Back to Lessons
        </Link>
      </div>

      <section className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-green-700">
          <BookOpen size={18} />
          <span className="text-xs font-bold uppercase">Lesson</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>

        <p className="mt-2 text-sm text-gray-500">
          {lesson.subjectId?.name || "Subject"} • {lesson.termId?.name || "Term"}{" "}
          • Week {lesson.week || 1}
        </p>

        {lesson.classId?.name && (
          <p className="mt-1 text-sm text-gray-500">
            Class: {lesson.classId.name}{" "}
            {lesson.armId?.name ? `• ${lesson.armId.name}` : ""}
          </p>
        )}

        {lesson.description && (
          <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm leading-6 text-green-800">
            {lesson.description}
          </div>
        )}
      </section>

      {videos.length > 0 && (
        <section className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Video size={18} />
            <h2 className="font-bold text-gray-900">Video Lessons</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="aspect-video overflow-hidden rounded-xl bg-black">
                {activeVideo ? (
                  <iframe
                    title={activeVideo.title}
                    src={getYouTubeEmbedUrl(activeVideo.videoUrl)}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-white">
                    Select a video to play
                  </div>
                )}
              </div>

              {activeVideo && (
                <div className="mt-3">
                  <h3 className="font-semibold text-gray-900">
                    {activeVideo.title}
                  </h3>
                  {activeVideo.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {activeVideo.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              {videos.map((video) => (
                <button
                  key={video._id}
                  type="button"
                  onClick={() => setActiveVideo(video)}
                  className={`w-full rounded-xl border p-3 text-left text-sm ${
                    activeVideo?._id === video._id
                      ? "border-green-500 bg-green-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <p className="font-semibold text-gray-800">{video.title}</p>
                  {video.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                      {video.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {texts.length > 0 && (
        <section className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Type size={18} />
            <h2 className="font-bold text-gray-900">Teacher Notes</h2>
          </div>

          <div className="space-y-4">
            {texts.map((text) => (
              <div key={text._id} className="rounded-xl border p-4">
                <h3 className="font-bold text-gray-900">{text.title}</h3>

                {text.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {text.description}
                  </p>
                )}

                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-700">
                  {text.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {documents.length > 0 && (
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileText size={18} />
            <h2 className="font-bold text-gray-900">Documents</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {documents.map((document) => (
              <div key={document._id} className="rounded-xl border p-4">
                <p className="font-semibold text-gray-900">
                  {document.fileName || document.title}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {document.fileMimeType || "Document"}
                </p>

                {/* <a
                //   href={getDownloadUrl(document.fileUrl)}
                  href={`${api.defaults.baseURL}/lessons/student/${lesson._id}/resources/${document._id}/download`}
                  download={document.fileName || "lesson-document"}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white"
                >
                  <Download size={16} />
                  Download Document
                </a> */}
                <button
                    type="button"
                    onClick={() => handleDownload(document)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white"
                    >
                    <Download size={16} />
                    Download Document
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// const getDownloadUrl = (url) => {
//   if (!url) return "#";

//   if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
//     return url.replace("/upload/", "/upload/fl_attachment/");
//   }

//   return url;
// };

const getYouTubeEmbedUrl = (url) => {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    let videoId = "";

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.replace("/", "");
    }

    if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v") || "";

      if (parsed.pathname.includes("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1];
      }

      if (parsed.pathname.includes("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1];
      }
    }

    if (!videoId) return "";

    videoId = videoId.split("?")[0].split("&")[0];

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return "";
  }
};

export default StudentLessonDetailsPage;