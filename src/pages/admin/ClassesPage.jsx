import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newClass, setNewClass] = useState({ name: "", arms: "" }); // arms comma-separated

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/classes");
      // console.log("Fetched classes:", data);
      // add isEditing flag for inline editing
      const withEditing = data.map((cls) => ({ ...cls, isEditing: false }));
      setClasses(withEditing);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    setNewClass({ ...newClass, [e.target.name]: e.target.value });
  };

  // Create new class
  const handleAddClass = async () => {
    try {
      const armsArray = newClass.arms ? newClass.arms.split(",").map(a => a.trim()) : [];
      await api.post(
        "/classes",
        { name: newClass.name, arms: armsArray },
        // { withCredentials: true }
      );
      toast.success("Class created!");
      setNewClass({ name: "", arms: "" });
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create class");
    }
  };

  // Delete class
  const handleDeleteClass = async (id) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      await api.delete(`/classes/${id}`);
      toast.success("Class deleted");
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete class");
    }
  };

  // Toggle edit mode
  const toggleEdit = (id, editing) => {
    setClasses((prev) => prev.map((c) => (c._id === id ? { ...c, isEditing: editing } : c)));
  };

  // Update class name
  const handleUpdateClass = async (id, name) => {
    try {
      await api.put(`/classes/${id}`, { name });
      toast.success("Class updated");
      toggleEdit(id, false);
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update class");
    }
  };

  // Add arm
  const handleAddArm = async (classId, armName) => {
    try {
      await api.post(`/classes/${classId}/arms`, { name: armName });
      toast.success("Arm added");
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add arm");
    }
  };

  // Update arm
  const handleUpdateArm = async (armId, name) => {
    try {
      await api.put(`/classes/arms/${armId}`, { name });
      toast.success("Arm updated");
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update arm");
    }
  };

  // Delete arm
  const handleDeleteArm = async (armId) => {
    if (!confirm("Are you sure you want to delete this arm?")) return;
    try {
      await api.delete(`/classes/arms/${armId}`);
      toast.success("Arm deleted");
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete arm");
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Class Management</h1>

      {/* Add New Class */}
      <div className="mb-6 bg-white p-4 rounded shadow-md">
        <h2 className="font-semibold mb-2">Add New Class</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            name="name"
            placeholder="Class Name"
            value={newClass.name}
            onChange={handleChange}
            className="px-3 py-2 border rounded w-40"
          />
          <input
            type="text"
            name="arms"
            placeholder="Arms (comma separated)"
            value={newClass.arms}
            onChange={handleChange}
            className="px-3 py-2 border rounded w-60"
          />
          <button
            onClick={handleAddClass}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
          >
            Add Class
          </button>
        </div>
      </div>

      {/* Classes List */}
      <div className="bg-white p-4 rounded shadow-md">
        <h2 className="font-semibold mb-2">Existing Classes</h2>
        {classes.map((cls) => (
          <div key={cls._id} className="border-b last:border-b-0 py-2 flex justify-between items-start flex-wrap gap-2">
            <div className="flex flex-col gap-1 w-full md:w-auto">
              {/* Edit class name */}
              {cls.isEditing ? (
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="text"
                    value={cls.name}
                    onChange={(e) =>
                      setClasses((prev) =>
                        prev.map((c) => (c._id === cls._id ? { ...c, name: e.target.value } : c))
                      )
                    }
                    className="px-2 py-1 border rounded w-40"
                  />
                  <button
                    onClick={() => handleUpdateClass(cls._id, cls.name)}
                    className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => toggleEdit(cls._id, false)}
                    className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-medium">{cls.name}</p>
                  <button
                    onClick={() => toggleEdit(cls._id, true)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                </div>
              )}

              {/* Arms */}
              <div className="flex gap-2 mt-1 flex-wrap">
                {cls.arms.map((arm) => (
                  <ArmItem key={arm._id} arm={arm} onDelete={handleDeleteArm} onUpdate={handleUpdateArm} />
                ))}

                {/* Add new arm */}
                <AddArmInput classId={cls._id} onAdd={handleAddArm} />
              </div>
            </div>

            <button
              onClick={() => handleDeleteClass(cls._id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 self-start"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Inline component for adding an arm
function AddArmInput({ classId, onAdd }) {
  const [armName, setArmName] = useState("");
  return (
    <div className="flex gap-1 items-center">
      <input
        type="text"
        value={armName}
        onChange={(e) => setArmName(e.target.value)}
        placeholder="Add Arm"
        className="px-2 py-1 border rounded w-20"
      />
      <button
        onClick={() => {
          if (!armName.trim()) return;
          onAdd(classId, armName.trim());
          setArmName("");
        }}
        className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
      >
        +
      </button>
    </div>
  );
}

// Inline component for arm with edit/delete
function ArmItem({ arm, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(arm.name);

  return (
    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
      {isEditing ? (
        <>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-1 py-0.5 border rounded w-16"
          />
          <button
            onClick={() => {
              if (!name.trim()) return;
              onUpdate(arm._id, name.trim());
              setIsEditing(false);
            }}
            className="text-green-700 hover:text-green-900 text-xs"
          >
            ✓
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setName(arm.name);
            }}
            className="text-gray-500 hover:text-gray-700 text-xs"
          >
            ✕
          </button>
        </>
      ) : (
        <>
          {arm.name}
          <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-800 text-xs">
            ✎
          </button>
          <button onClick={() => onDelete(arm._id)} className="text-red-500 hover:text-red-700 text-xs">
            ×
          </button>
        </>
      )}
    </span>
  );
}
