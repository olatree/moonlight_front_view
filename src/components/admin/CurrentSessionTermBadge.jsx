import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function CurrentSessionTermBadge() {
  const [activeSession, setActiveSession] = useState(null);
  const [activeTerm, setActiveTerm] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveSessionTerm = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/sessions/active",
        // { withCredentials: true }
      );

      // backend returns { session: {...}, term: {...} }
      setActiveSession(data.session);
      setActiveTerm(data.term);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch active session/term:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSessionTerm();

    // optional: poll every 10s to keep it updated automatically
    // const interval = setInterval(fetchActiveSessionTerm, 10000);
    // return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  return (
    <div className="ml-auto flex gap-2 items-center text-sm font-medium text-gray-700">
      {activeSession && (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
          {activeSession.name}
        </span>
      )}
      {activeTerm && (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
          {activeTerm.name}
        </span>
      )}
    </div>
  );
}
