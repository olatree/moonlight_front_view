import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function ViewClassTeachers() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

    // const api = axios.create({
    //   baseURL: "http://localhost:8000/api",
    //   withCredentials: true,
    // });

  // Fetch all class-teacher assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get("/class-teachers");
        setAssignments(res.data);
      } catch (err) {
        console.error("Error fetching assignments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  // Handle Unassign Teacher
  const handleUnassign = async (id) => {
    if (!window.confirm("Are you sure you want to unassign this class teacher?")) return;

    try {
      await api.delete(`/class-teachers/${id}`);
      setAssignments(assignments.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Error unassigning teacher:", err);
      alert(err.response?.data?.message || "Failed to unassign teacher");
    }
  };

  if (loading) {
    return <div className="p-6">Loading class teachers...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">View Class Teachers</h1>
        <Link
          to="/assign-class-teacher"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Assign Class Teacher
        </Link>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Class</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Arm</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Teacher</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {assignments.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-3 text-center text-gray-500">
                  No class teachers assigned yet.
                </td>
              </tr>
            ) : (
              assignments.map((a) => (
                <tr key={a._id}>
                  <td className="px-4 py-3 text-sm text-gray-800">{a.classId?.name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{a.armId?.name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{a.teacher?.name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{a.teacher?.email || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{a.teacher?.phone || "—"}</td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleUnassign(a._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Unassign
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center text-gray-500">No class teachers assigned yet.</div>
        ) : (
          assignments.map((a) => (
            <div key={a._id} className="bg-white p-4 rounded-lg shadow border">
              <p className="text-sm">
                <span className="font-semibold">Class:</span> {a.classId?.name || "—"}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Arm:</span> {a.armId?.name || "—"}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Teacher:</span> {a.teacher?.name || "—"}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Email:</span> {a.teacher?.email || "—"}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Phone:</span> {a.teacher?.phone || "—"}
              </p>
              <div className="mt-3">
                <button
                  onClick={() => handleUnassign(a._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 w-full"
                >
                  Unassign
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
