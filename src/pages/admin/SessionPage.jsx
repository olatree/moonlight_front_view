import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [newSessionName, setNewSessionName] = useState("");
  const [newTermName, setNewTermName] = useState("1st Term");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all sessions from backend
const fetchSessions = async () => {
  try {
    setLoading(true);
    const { data } = await api.get("/sessions", {
      // withCredentials: true,
    });

    setSessions(data);
    // console.log("Fetched sessions:", data);

    // Keep selected session if it still exists
    if (selectedSession) {
      const updatedSession = data.find(s => s._id === selectedSession._id);
      setSelectedSession(updatedSession || null);
      if (selectedTerm && updatedSession) {
        const updatedTerm = updatedSession.terms.find(t => t._id === selectedTerm._id);
        setSelectedTerm(updatedTerm || null);
      }
    }

    setLoading(false);
  } catch (err) {
    console.error(err);
    setError("Failed to fetch sessions");
    setLoading(false);
  }
};


  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;
    try {
      await api.post(
        "/sessions",
        { name: newSessionName },
        // { withCredentials: true }
      );
      setNewSessionName("");
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create session");
    }
  };

  const handleCreateTerm = async () => {
    if (!selectedSession || !newTermName) return;
    try {
      await api.post(
        `/sessions/${selectedSession._id}/terms`,
        { name: newTermName },
        // { withCredentials: true }
      );
      setNewTermName("1st Term");
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add term");
    }
  };

  const handleActivateSession = async (sessionId) => {
    try {
      await api.put(
        `/sessions/${sessionId}/activate`,
        {},
        // { withCredentials: true }
      );
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to activate session");
    }
  };

  const handleActivateTerm = async (termId) => {
    try {
      await api.put(
        `/sessions/terms/${termId}/activate`,
        {},
        // { withCredentials: true }
      );
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to activate term");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Session & Term Management</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add Session */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Add New Session</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g., 2025/2026"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
            className="px-3 py-2 border rounded-md flex-1"
          />
          <button
            onClick={handleCreateSession}
            className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800"
          >
            Create Session
          </button>
        </div>
      </div>

      {/* Session Dropdown */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Select Session</h2>
        <div className="flex gap-2 items-center">
          <select
            value={selectedSession?._id || ""}
            onChange={(e) => {
              const session = sessions.find((s) => s._id === e.target.value);
              setSelectedSession(session);
              setSelectedTerm(null); // reset term selection
            }}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">-- Select a session --</option>
            {sessions.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} {s.isActive ? "(Active)" : ""}
              </option>
            ))}
          </select>
          {selectedSession && (
            <button
              onClick={() => handleActivateSession(selectedSession._id)}
              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
            >
              Activate Session
            </button>
          )}
        </div>
      </div>

      {/* Term Dropdown */}
      {selectedSession && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Terms for {selectedSession.name}</h2>

          {/* Add Term */}
          <div className="flex gap-2 items-center mb-2">
            <select
              value={newTermName}
              onChange={(e) => setNewTermName(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="1st Term">1st Term</option>
              <option value="2nd Term">2nd Term</option>
              <option value="3rd Term">3rd Term</option>
            </select>
            <button
              onClick={handleCreateTerm}
              className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800"
            >
              Add Term
            </button>
          </div>

          {/* Activate Term */}
          <div className="flex gap-2 items-center">
            <select
              value={selectedTerm?._id || ""}
              onChange={(e) => {
                const term = selectedSession.terms.find((t) => t._id === e.target.value);
                setSelectedTerm(term);
              }}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">-- Select term to activate --</option>
              {selectedSession.terms?.map((term) => (
                <option key={term._id} value={term._id}>
                  {term.name} {term.isActive ? "(Active)" : ""}
                </option>
              ))}
            </select>
            {selectedTerm && !selectedTerm.isActive && (
              <button
                onClick={() => handleActivateTerm(selectedTerm._id)}
                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
              >
                Activate Term
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
