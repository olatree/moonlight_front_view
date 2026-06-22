import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Trash2 } from "lucide-react";

const SubjectAssignment = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedArm, setSelectedArm] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]); // array now
  const [assignedSubjects, setAssignedSubjects] = useState([]);

  // Fetch subjects + classes
  useEffect(() => {
    api.get("/subjects").then((res) => setSubjects(res.data));
    api.get("/classes").then((res) => setClasses(res.data));
  }, []);

  // Fetch assignments when class+arm selected
  useEffect(() => {
    if (selectedClass && selectedArm) {
      api
        .get(`/subject-assignments/${selectedClass}/${selectedArm}`)
        .then((res) => setAssignedSubjects(res.data))
        .catch(() => setAssignedSubjects([]));
    }
  }, [selectedClass, selectedArm]);


  const handleAssign = async () => {
  if (!selectedClass || !selectedArm || selectedSubjects.length === 0) return;

  try {
    await api.post("/subject-assignments", {
      classId: selectedClass,
      armId: selectedArm,
      subjectIds: selectedSubjects, // send array
    });

    // ✅ Re-fetch fresh populated assignments
    const res = await api.get(
      `/subject-assignments/${selectedClass}/${selectedArm}`
    );
    setAssignedSubjects(res.data);

    // clear selection
    setSelectedSubjects([]);
  } catch (error) {
    console.error("Error Assigning Subjects", error);
  }
};


  const handleDelete = async (assignmentId) => {
    try {
      await api.delete(`/subject-assignments/${assignmentId}`);
      setAssignedSubjects((prev) => prev.filter((a) => a._id !== assignmentId));
    } catch (error) {
      console.error(error);
    }
  };

  const toggleSubject = (subjectId) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  return (
    <div className="p-6">
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Assign Subject to Class</h2>

        {/* Class dropdown */}
        <select
          className="w-full border rounded p-2 mb-3"
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedArm("");
            setAssignedSubjects([]);
          }}
        >
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name}
            </option>
          ))}
        </select>

        {/* Arm dropdown */}
        {selectedClass && (
          <select
            className="w-full border rounded p-2 mb-3"
            value={selectedArm}
            onChange={(e) => setSelectedArm(e.target.value)}
          >
            <option value="">Select Arm</option>
            {classes
              .find((cls) => cls._id === selectedClass)
              ?.arms.map((arm) => (
                <option key={arm._id} value={arm._id}>
                  {arm.name}
                </option>
              ))}
          </select>
        )}

        {/* Subject checkboxes */}
        {selectedArm && (
          <div>
            <h3 className="font-semibold mb-2">Select Subjects:</h3>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subj) => (
                <button
                  key={subj._id}
                  onClick={() => toggleSubject(subj._id)}
                  className={`px-3 py-1 rounded-full border ${
                    selectedSubjects.includes(subj._id)
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {subj.name}
                </button>
              ))}
            </div>
            <button
              onClick={handleAssign}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Assign Selected
            </button>
          </div>
        )}

        {/* Assigned subjects list */}
        {selectedArm && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Assigned Subjects:</h3>
            <div className="flex flex-wrap gap-2">
              {assignedSubjects.length > 0 ? (
                assignedSubjects.map((a) => (
                  <div
                    key={a._id}
                    className="flex items-center bg-gray-200 px-3 py-1 rounded-full"
                  >
                    <span>{a.subject?.name}</span>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No subjects assigned yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectAssignment;
