import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { FaTrash, FaPencilAlt, FaSave, FaTimes } from "react-icons/fa";

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // For editing
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/subjects", {
        // withCredentials: true,
      });
      setSubjects(res.data);
    } catch (err) {
      setError("Failed to fetch subjects");
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    try {
      setLoading(true);
      const res = await api.post(
        "/subjects",
        { name: newSubject },
        // { withCredentials: true }
      );
      setSubjects([...subjects, res.data]);
      setNewSubject("");
    } catch (err) {
      setError("Failed to add subject");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    try {
      await api.delete(`/subjects/${id}`, {
        // withCredentials: true,
      });
      setSubjects(subjects.filter((s) => s._id !== id));
    } catch (err) {
      setError("Failed to delete subject");
    }
  };

  const startEditing = (subject) => {
    setEditingId(subject._id);
    setEditingName(subject.name);
  };

  const handleUpdateSubject = async (id) => {
    if (!editingName.trim()) return;

    try {
      const res = await api.put(
        `/subjects/${id}`,
        { name: editingName },
        // { withCredentials: true }
      );

      setSubjects(
        subjects.map((s) =>
          s._id === id ? { ...s, name: res.data.name } : s
        )
      );
      setEditingId(null);
      setEditingName("");
    } catch (err) {
      setError("Failed to update subject");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Subject Management</h1>

      {/* Add Subject Form */}
      <form onSubmit={handleAddSubject} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="Enter subject name"
          className="border px-3 py-2 rounded w-full"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Subjects List */}
      {subjects.length === 0 ? (
        <p className="text-gray-500">No subjects added yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject._id}
              className="border rounded p-4 shadow flex justify-between items-center"
            >
              {editingId === subject._id ? (
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                  <button
                    onClick={() => handleUpdateSubject(subject._id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    <FaSave />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-medium">{subject.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(subject)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      <FaPencilAlt />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;
