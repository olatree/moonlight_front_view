// src/pages/admin/TeacherAssignment.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { Trash2 } from "lucide-react";

const API = {
  teachers: "/teachers",
  classes: "/classes",
  subjects: "/subjects",
  teacherAssignments: "/teacher-assignments",
};

export default function TeacherAssignment() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedArm, setSelectedArm] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]); // multiple
  const [assignments, setAssignments] = useState([]); // current (teacher+class+arm) assignments

  // Load base data
  useEffect(() => {
    const load = async () => {
      try {
        const [t, c, s] = await Promise.all([
          api.get(API.teachers),
          api.get(API.classes),
          api.get(API.subjects),
        ]);
        setTeachers(t.data || []);
        setClasses(c.data || []);
        setSubjects(s.data || []);
      } catch (err) {
        console.error("Failed to load lists:", err);
      }
    };
    load();
  }, []);

  // Fetch assignments when all three are selected
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedTeacher || !selectedClass || !selectedArm) {
        setAssignments([]);
        return;
      }
      try {
        const { data } = await api.get(
          `${API.teacherAssignments}/${selectedTeacher}/${selectedClass}/${selectedArm}`
        );
        setAssignments(data || []);
      } catch (err) {
        console.error("Failed to fetch assignments:", err);
        setAssignments([]);
      }
    };
    fetchAssignments();
  }, [selectedTeacher, selectedClass, selectedArm]);

  const assignedSubjectIds = useMemo(
    () => new Set(assignments.map((a) => a.subject?._id || a.subject)),
    [assignments]
  );

  const toggleSubject = (subjectId) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleAssign = async () => {
    if (!selectedTeacher || !selectedClass || !selectedArm || selectedSubjects.length === 0) {
      return;
    }
    try {
      await api.post(
        API.teacherAssignments,
        {
          teacherId: selectedTeacher,
          classId: selectedClass,
          armId: selectedArm,
          subjectIds: selectedSubjects,
        }
      );

      // refresh assignments
      const { data } = await api.get(
        `${API.teacherAssignments}/${selectedTeacher}/${selectedClass}/${selectedArm}`
      );
      setAssignments(data || []);
      setSelectedSubjects([]);
    } catch (err) {
      console.error("Error assigning subjects:", err);
      alert(err.response?.data?.message || "Failed to assign subjects");
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm("Remove this assignment?")) return;
    try {
      await api.delete(`${API.teacherAssignments}/${assignmentId}`);
      setAssignments((prev) => prev.filter((a) => a._id !== assignmentId));
    } catch (err) {
      console.error("Error deleting assignment:", err);
      alert(err.response?.data?.message || "Failed to delete assignment");
    }
  };

  const armsForSelectedClass =
    classes.find((cls) => cls._id === selectedClass)?.arms || [];

  return (
    <div className="p-6">
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Assign Subjects to A Teacher</h2>

        {/* Teacher */}
        <label className="block text-sm font-medium mb-1">Teacher</label>
        <select
          className="w-full border rounded p-2 mb-3"
          value={selectedTeacher}
          onChange={(e) => {
            setSelectedTeacher(e.target.value);
            setSelectedClass("");
            setSelectedArm("");
            setAssignments([]);
            setSelectedSubjects([]);
          }}
        >
          <option value="">Select Teacher</option>
          {teachers.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name} {t.email ? `(${t.email})` : ""}
            </option>
          ))}
        </select>

        {/* Class */}
        <label className="block text-sm font-medium mb-1">Class</label>
        <select
          className="w-full border rounded p-2 mb-3"
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedArm("");
            setAssignments([]);
            setSelectedSubjects([]);
          }}
          disabled={!selectedTeacher}
        >
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name}
            </option>
          ))}
        </select>

        {/* Arm */}
        {selectedClass && (
          <>
            <label className="block text-sm font-medium mb-1">Arm</label>
            <select
              className="w-full border rounded p-2 mb-3"
              value={selectedArm}
              onChange={(e) => {
                setSelectedArm(e.target.value);
                setSelectedSubjects([]);
              }}
              disabled={!selectedTeacher || !selectedClass}
            >
              <option value="">Select Arm</option>
              {armsForSelectedClass.map((arm) => (
                <option key={arm._id} value={arm._id}>
                  {arm.name}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Subject multiselect buttons */}
        {selectedArm && (
          <div>
            <h3 className="font-semibold mb-2">Select Subjects:</h3>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subj) => {
                const isAssigned = assignedSubjectIds.has(subj._id);
                const isSelected = selectedSubjects.includes(subj._id);
                return (
                  <button
                    key={subj._id}
                    type="button"
                    onClick={() => {
                      if (isAssigned) return;
                      toggleSubject(subj._id);
                    }}
                    className={`px-3 py-1 rounded-full border text-sm
                      ${
                        isAssigned
                          ? "bg-gray-300 cursor-not-allowed"
                          : isSelected
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    title={isAssigned ? "Already assigned" : "Select subject"}
                  >
                    {subj.name}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleAssign}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              disabled={selectedSubjects.length === 0}
            >
              Assign Selected
            </button>
          </div>
        )}

        {/* Current assignments */}
        {selectedArm && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Current Assignments:</h3>
            <div className="flex flex-wrap gap-2">
              {assignments.length > 0 ? (
                assignments.map((a) => (
                  <div
                    key={a._id}
                    className="flex items-center bg-gray-200 px-3 py-1 rounded-full"
                  >
                    <span className="text-sm">{a.subject?.name || "Subject"}</span>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="ml-2 text-red-600 hover:text-red-800"
                      title="Remove"
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
}
