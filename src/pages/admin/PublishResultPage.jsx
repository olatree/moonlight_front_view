// src/pages/admin/PublishResultsPage.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const getData = (res) => res.data?.data ?? res.data;

export default function PublishResultsPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const selectedSession = useMemo(
    () => sessions.find((s) => s._id === selectedSessionId),
    [sessions, selectedSessionId]
  );

  const terms = selectedSession?.terms || [];

  const fetchSessions = async () => {
    try {
      setLoading(true);

      const res = await api.get("/sessions");
      const payload = getData(res);

      setSessions(Array.isArray(payload) ? payload : []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!selectedSessionId || !selectedTermId) {
      toast.error("Please select session and term");
      return;
    }

    try {
      setChecking(true);
      setStatus(null);

      const res = await api.get("/result-publications/status", {
        params: {
          sessionId: selectedSessionId,
          termId: selectedTermId,
        },
      });

      setStatus(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to check status");
    } finally {
      setChecking(false);
    }
  };

  const publishResult = async () => {
    if (!selectedSessionId || !selectedTermId) {
      toast.error("Please select session and term");
      return;
    }

    const ok = window.confirm(
      "Publish this term result? Students will be able to view it."
    );

    if (!ok) return;

    try {
      setChecking(true);

      await api.post("/result-publications/publish", {
        sessionId: selectedSessionId,
        termId: selectedTermId,
      });

      toast.success("Result published successfully");
      await checkStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish result");
    } finally {
      setChecking(false);
    }
  };

  const unpublishResult = async () => {
    if (!selectedSessionId || !selectedTermId) {
      toast.error("Please select session and term");
      return;
    }

    const ok = window.confirm(
      "Unpublish this term result? Students will no longer be able to view it."
    );

    if (!ok) return;

    try {
      setChecking(true);

      await api.post("/result-publications/unpublish", {
        sessionId: selectedSessionId,
        termId: selectedTermId,
      });

      toast.success("Result unpublished successfully");
      await checkStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to unpublish result");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    setSelectedTermId("");
    setStatus(null);
  }, [selectedSessionId]);

  useEffect(() => {
    setStatus(null);
  }, [selectedTermId]);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">
            Publish Results
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Control when students can view their term and yearly results.
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Session
              </label>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border px-3 py-3 text-sm"
              >
                <option value="">Select Session</option>
                {sessions.map((session) => (
                  <option key={session._id} value={session._id}>
                    {session.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Term
              </label>
              <select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                disabled={!selectedSessionId}
                className="w-full rounded-lg border px-3 py-3 text-sm disabled:bg-gray-100"
              >
                <option value="">Select Term</option>
                {terms.map((term) => (
                  <option key={term._id} value={term._id}>
                    {term.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={checkStatus}
            disabled={checking || !selectedSessionId || !selectedTermId}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
          >
            {checking ? "Checking..." : "Check Status"}
          </button>
        </div>

        {status && (
          <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">Current Status</p>

                {status.isPublished ? (
                  <p className="mt-1 text-lg font-bold text-green-700">
                    Published
                  </p>
                ) : (
                  <p className="mt-1 text-lg font-bold text-red-600">
                    Not Published
                  </p>
                )}

                {status.publication?.publishedAt && (
                  <p className="mt-1 text-xs text-gray-500">
                    Published on{" "}
                    {new Date(
                      status.publication.publishedAt
                    ).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {!status.isPublished ? (
                  <button
                    type="button"
                    onClick={publishResult}
                    disabled={checking}
                    className="rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Publish Result
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={unpublishResult}
                    disabled={checking}
                    className="rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Unpublish Result
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Students can only view a term result after that session and term has
          been published. Yearly result becomes available only after all terms
          in the session are published.
        </div>
      </div>
    </div>
  );
}