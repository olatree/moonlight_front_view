import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ClassTeacherAssignment() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedArm, setSelectedArm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch teachers and classes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teacherRes, classRes] = await Promise.all([
          api.get("/teachers"), // ✅ Fetch teachers via User model
          api.get("/classes"),
        ]);
        // ✅ ensure always arrays
      setTeachers(teacherRes.data.users || teacherRes.data || []);
      console.log(teacherRes.data);
      setClasses(classRes.data.classes || classRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Assign teacher
  const handleAssign = async () => {
    if (!selectedClass || !selectedArm || !selectedTeacher) {
      alert("Please select class, arm and teacher");
      return;
    }

    try {
      setLoading(true);
      await api.post("/class-teachers", {
        classId: selectedClass,
        armId: selectedArm,
        teacherId: selectedTeacher,
      });
      alert("Class teacher assigned successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error assigning teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Assign Class Teacher</h2>

      {/* Class Select */}
      <label className="block mb-2">Select Class:</label>
      <select
        className="border p-2 w-full mb-4"
        value={selectedClass}
        onChange={(e) => {
          setSelectedClass(e.target.value);
          setSelectedArm("");
        }}
      >
        <option value="">-- Select Class --</option>
        {classes.map((cls) => (
          <option key={cls._id} value={cls._id}>
            {cls.name}
          </option>
        ))}
      </select>

      {/* Arm Select */}
      {selectedClass && (
        <>
          <label className="block mb-2">Select Arm:</label>
          <select
            className="border p-2 w-full mb-4"
            value={selectedArm}
            onChange={(e) => setSelectedArm(e.target.value)}
          >
            <option value="">-- Select Arm --</option>
            {classes
              .find((cls) => cls._id === selectedClass)
              ?.arms.map((arm) => (
                <option key={arm._id} value={arm._id}>
                  {arm.name}
                </option>
              ))}
          </select>
        </>
      )}

      {/* Teacher Select */}
      {selectedArm && (
        <>
          <label className="block mb-2">Select Teacher:</label>
          <select
            className="border p-2 w-full mb-4"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            <option value="">-- Select Teacher --</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Assign Button */}
      <button
        onClick={handleAssign}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Assigning..." : "Assign Teacher"}
      </button>
    </div>
  );
}
