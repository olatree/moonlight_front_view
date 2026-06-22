import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FaTrash } from "react-icons/fa";

const AssignSubjectToClass = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Fetch classes, subjects, assignments
  useEffect(() => {
    api.get("/classes").then((res) => setClasses(res.data));
    api.get("/subjects").then((res) => setSubjects(res.data));
    fetchAssignments();
  }, []);

  const fetchAssignments = () => {
    api.get("/subject-assignments").then((res) => setAssignments(res.data));
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedClass || selectedSubjects.length === 0) {
      alert("Please select a class and at least one subject");
      return;
    }

    await api.post("/subject-assignments", {
      classId: selectedClass,
      subjectIds: selectedSubjects,
    });

    fetchAssignments();
    setSelectedClass("");
    setSelectedSubjects([]);
  };

  const handleDelete = async (id) => {
    await api.delete(`/subject-assignments/${id}`);
    fetchAssignments();
  };

  const toggleSubject = (id) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Assign Subjects to Classes</h2>

      {/* Form */}
      <form onSubmit={handleAssign} className="bg-white shadow p-4 rounded mb-6">
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select Class --</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">Select Subjects</label>
          <div className="grid grid-cols-2 gap-2">
            {subjects.map((subj) => (
              <label key={subj._id} className="flex items-center gap-2 border p-2 rounded">
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subj._id)}
                  onChange={() => toggleSubject(subj._id)}
                />
                {subj.name}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Assign
        </button>
      </form>

      {/* Table of Assignments */}
      <h3 className="text-xl font-semibold mb-3">Assigned Subjects</h3>
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Class</th>
              <th className="border p-2">Subjects</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a._id}>
                <td className="border p-2">{a.class?.name}</td>
                <td className="border p-2">
                  {a.subjects.map((s) => s.name).join(", ")}
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignSubjectToClass;
