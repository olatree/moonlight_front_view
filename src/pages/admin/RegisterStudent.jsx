

// src/pages/admin/AddStudent.jsx
import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function AddStudent() {
  const [classes, setClasses] = useState([]);
  const [activeSessionTerm, setActiveSessionTerm] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedArm, setSelectedArm] = useState("");

  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    parentContact: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  const getResponseData = (res) => {
    return res.data?.data ?? res.data;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, sessionRes] = await Promise.all([
          api.get("/classes"),
          api.get("/sessions/active"),
        ]);

        const classesPayload = getResponseData(classesRes);
        const sessionPayload = getResponseData(sessionRes);

        setClasses(Array.isArray(classesPayload) ? classesPayload : []);
        setActiveSessionTerm(sessionPayload || null);
      } catch (err) {
        console.error("Failed to load required data:", err);
        alert("Failed to load required data. Please refresh.");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files?.[0]) {
      const file = files[0];

      setForm((prev) => ({
        ...prev,
        image: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = (formElement) => {
    setForm({
      name: "",
      dateOfBirth: "",
      gender: "",
      parentContact: "",
      image: null,
    });

    setSelectedClass("");
    setSelectedArm("");
    setImagePreview(null);

    if (formElement?.image) {
      formElement.image.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!activeSessionTerm?.session?._id) {
      alert("No active session found. Please set one in admin panel.");
      return;
    }

    if (!selectedClass || !selectedArm) {
      alert("Please select both Class and Arm.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("dateOfBirth", form.dateOfBirth);
      formData.append("gender", form.gender);
      formData.append("parentContact", form.parentContact.trim());
      formData.append("classId", selectedClass);
      formData.append("armId", selectedArm);
      formData.append("sessionId", activeSessionTerm.session._id);

      if (activeSessionTerm.term?._id) {
        formData.append("termId", activeSessionTerm.term._id);
      }

      if (form.image) {
        formData.append("picture", form.image);
      }

      const res = await api.post("/students", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const payload = getResponseData(res);
      const loginCredentials = payload?.loginCredentials;

      alert(
        `Student registered successfully!\nAdmission No: ${
          loginCredentials?.admissionNumber || "N/A"
        }\nPassword: ${loginCredentials?.password || "N/A"}`
      );

      resetForm(e.target);
    } catch (err) {
      console.error("Registration error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to register student";

      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedClassObj = classes.find((c) => c._id === selectedClass);
  const arms = Array.isArray(selectedClassObj?.arms)
    ? selectedClassObj.arms
    : [];

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Add New Student
      </h2>

      {activeSessionTerm?.session && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          Active Session: <strong>{activeSessionTerm.session.name}</strong>
          {activeSessionTerm.term && (
            <>
              {" "}
              | Active Term: <strong>{activeSessionTerm.term.name}</strong>
            </>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth *
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender *
          </label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          >
            <option value="">-- Select Gender --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parent Phone/Email *
          </label>
          <input
            type="text"
            name="parentContact"
            value={form.parentContact}
            onChange={handleChange}
            placeholder="e.g. 08012345678 or parent@email.com"
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student Photo Optional
          </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />

          {imagePreview && (
            <div className="mt-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-32 w-32 object-cover rounded-lg border shadow"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class *
          </label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedArm("");
            }}
            className="w-full px-4 py-2 border rounded-lg"
            required
          >
            <option value="">-- Select Class --</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {selectedClass && arms.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arm *
            </label>
            <select
              value={selectedArm}
              onChange={(e) => setSelectedArm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="">-- Select Arm --</option>
              {arms.map((arm) => (
                <option key={arm._id} value={arm._id}>
                  {arm.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedClass && arms.length === 0 && (
          <p className="text-sm text-red-600">
            This class has no arms assigned.
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !activeSessionTerm?.session?._id}
          className={`w-full py-3 rounded-lg text-white font-medium transition ${
            loading || !activeSessionTerm?.session?._id
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Registering Student..." : "Register Student"}
        </button>
      </form>

      {!activeSessionTerm?.session && (
        <p className="mt-6 text-center text-red-600 text-sm">
          No active session/term. Contact admin.
        </p>
      )}
    </div>
  );
}