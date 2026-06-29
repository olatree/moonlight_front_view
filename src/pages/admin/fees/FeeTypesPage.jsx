// import React, { useEffect, useState } from "react";
// import api from "../../../api/axios";

// const FeeTypesPage = () => {
//   const [feeTypes, setFeeTypes] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//     isCompulsory: true,
//   });

//   const [editingId, setEditingId] = useState(null);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   const fetchFeeTypes = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/fees/types");
//       setFeeTypes(res.data.data || []);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to fetch fee types");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchFeeTypes();
//   }, []);

//   const resetForm = () => {
//     setForm({
//       name: "",
//       description: "",
//       isCompulsory: true,
//     });
//     setEditingId(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setError("");

//     if (!form.name.trim()) {
//       setError("Fee type name is required");
//       return;
//     }

//     try {
//       if (editingId) {
//         await api.put(`/fees/types/${editingId}`, form);
//         setMessage("Fee type updated successfully");
//       } else {
//         await api.post("/fees/types", form);
//         setMessage("Fee type created successfully");
//       }

//       resetForm();
//       fetchFeeTypes();
//     } catch (err) {
//       setError(err.response?.data?.message || "Something went wrong");
//     }
//   };

//   const handleEdit = (feeType) => {
//     setEditingId(feeType._id);
//     setForm({
//       name: feeType.name || "",
//       description: feeType.description || "",
//       isCompulsory: feeType.isCompulsory ?? true,
//     });
//   };

//   const handleArchive = async (id) => {
//     if (!window.confirm("Archive this fee type?")) return;

//     try {
//       await api.patch(`/fees/types/${id}/archive`);
//       setMessage("Fee type archived successfully");
//       fetchFeeTypes();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to archive fee type");
//     }
//   };

//   const handleRestore = async (id) => {
//     try {
//       await api.patch(`/fees/types/${id}/restore`);
//       setMessage("Fee type restored successfully");
//       fetchFeeTypes();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to restore fee type");
//     }
//   };

//   return (
//     <div className="p-4 md:p-6">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">Fee Types</h1>
//         <p className="text-sm text-gray-500">
//           Create and manage the different fees collected by the school.
//         </p>
//       </div>

//       {message && (
//         <div className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-green-700">
//           {message}
//         </div>
//       )}

//       {error && (
//         <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
//           {error}
//         </div>
//       )}

//       <div className="grid gap-6 lg:grid-cols-3">
//         <form
//           onSubmit={handleSubmit}
//           className="rounded-xl bg-white p-4 shadow lg:col-span-1"
//         >
//           <h2 className="mb-4 text-lg font-semibold text-gray-700">
//             {editingId ? "Edit Fee Type" : "Add Fee Type"}
//           </h2>

//           <div className="mb-4">
//             <label className="mb-1 block text-sm font-medium text-gray-600">
//               Fee Name
//             </label>
//             <input
//               type="text"
//               value={form.name}
//               onChange={(e) =>
//                 setForm({ ...form, name: e.target.value })
//               }
//               placeholder="e.g. Tuition Fee"
//               className="w-full rounded-lg border px-3 py-2 outline-none focus:border-green-500"
//             />
//           </div>

//           <div className="mb-4">
//             <label className="mb-1 block text-sm font-medium text-gray-600">
//               Description
//             </label>
//             <textarea
//               value={form.description}
//               onChange={(e) =>
//                 setForm({ ...form, description: e.target.value })
//               }
//               placeholder="Optional description"
//               className="w-full rounded-lg border px-3 py-2 outline-none focus:border-green-500"
//               rows="3"
//             />
//           </div>

//           <div className="mb-4 flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={form.isCompulsory}
//               onChange={(e) =>
//                 setForm({ ...form, isCompulsory: e.target.checked })
//               }
//             />
//             <span className="text-sm text-gray-600">Compulsory fee</span>
//           </div>

//           <div className="flex gap-3">
//             <button
//               type="submit"
//               className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
//             >
//               {editingId ? "Update" : "Create"}
//             </button>

//             {editingId && (
//               <button
//                 type="button"
//                 onClick={resetForm}
//                 className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//             )}
//           </div>
//         </form>

//         <div className="rounded-xl bg-white p-4 shadow lg:col-span-2">
//           <h2 className="mb-4 text-lg font-semibold text-gray-700">
//             All Fee Types
//           </h2>

//           {loading ? (
//             <p className="text-gray-500">Loading...</p>
//           ) : feeTypes.length === 0 ? (
//             <p className="text-gray-500">No fee types created yet.</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full border text-sm">
//                 <thead className="bg-gray-100 text-left">
//                   <tr>
//                     <th className="border px-3 py-2">Name</th>
//                     <th className="border px-3 py-2">Type</th>
//                     <th className="border px-3 py-2">Status</th>
//                     <th className="border px-3 py-2">Actions</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {feeTypes.map((feeType) => (
//                     <tr key={feeType._id}>
//                       <td className="border px-3 py-2">
//                         <div className="font-medium text-gray-800">
//                           {feeType.name}
//                         </div>
//                         {feeType.description && (
//                           <div className="text-xs text-gray-500">
//                             {feeType.description}
//                           </div>
//                         )}
//                       </td>

//                       <td className="border px-3 py-2">
//                         {feeType.isCompulsory ? "Compulsory" : "Optional"}
//                       </td>

//                       <td className="border px-3 py-2">
//                         <span
//                           className={`rounded-full px-2 py-1 text-xs ${
//                             feeType.isActive
//                               ? "bg-green-100 text-green-700"
//                               : "bg-red-100 text-red-700"
//                           }`}
//                         >
//                           {feeType.isActive ? "Active" : "Archived"}
//                         </span>
//                       </td>

//                       <td className="border px-3 py-2">
//                         <div className="flex flex-wrap gap-2">
//                           <button
//                             onClick={() => handleEdit(feeType)}
//                             className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
//                           >
//                             Edit
//                           </button>

//                           {feeType.isActive ? (
//                             <button
//                               onClick={() => handleArchive(feeType._id)}
//                               className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
//                             >
//                               Archive
//                             </button>
//                           ) : (
//                             <button
//                               onClick={() => handleRestore(feeType._id)}
//                               className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
//                             >
//                               Restore
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FeeTypesPage;

import React, { useEffect, useState } from "react";
import api from "../../../api/axios";

const appliesToOptions = [
  { value: "all", label: "All Students" },
  { value: "returning", label: "Returning Students" },
  { value: "new_intake", label: "New Intake Only" },
  { value: "transfer", label: "Transfer Students Only" },
];

const getAppliesToLabel = (value) => {
  return appliesToOptions.find((item) => item.value === value)?.label || "All Students";
};

const FeeTypesPage = () => {
  const [feeTypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    isCompulsory: true,
    appliesTo: "all",
  });

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchFeeTypes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/fees/types");
      setFeeTypes(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch fee types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeTypes();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      isCompulsory: true,
      appliesTo: "all",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.name.trim()) {
      setError("Fee type name is required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/fees/types/${editingId}`, form);
        setMessage("Fee type updated successfully");
      } else {
        await api.post("/fees/types", form);
        setMessage("Fee type created successfully");
      }

      resetForm();
      fetchFeeTypes();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (feeType) => {
    setEditingId(feeType._id);
    setForm({
      name: feeType.name || "",
      description: feeType.description || "",
      isCompulsory: feeType.isCompulsory ?? true,
      appliesTo: feeType.appliesTo || "all",
    });
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Archive this fee type?")) return;

    try {
      await api.patch(`/fees/types/${id}/archive`);
      setMessage("Fee type archived successfully");
      fetchFeeTypes();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to archive fee type");
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.patch(`/fees/types/${id}/restore`);
      setMessage("Fee type restored successfully");
      fetchFeeTypes();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to restore fee type");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          Fee Types
        </h1>
        <p className="text-sm text-gray-500">
          Create fees and define which student category should pay them.
        </p>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-4 shadow-sm lg:col-span-1"
        >
          <h2 className="mb-4 text-base font-semibold text-gray-700">
            {editingId ? "Edit Fee Type" : "Add Fee Type"}
          </h2>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Fee Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Tuition Fee"
              className="w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-green-500"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Optional description"
              className="w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-green-500"
              rows="3"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Applies To
            </label>
            <select
              value={form.appliesTo}
              onChange={(e) =>
                setForm({ ...form, appliesTo: e.target.value })
              }
              className="w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-green-500"
            >
              {appliesToOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <p className="mt-1 text-xs text-gray-500">
              Example: Admission Fee should be New Intake Only.
            </p>
          </div>

          <div className="mb-5 flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isCompulsory}
              onChange={(e) =>
                setForm({ ...form, isCompulsory: e.target.checked })
              }
            />
            <span className="text-sm text-gray-600">Compulsory fee</span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              className="rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700"
            >
              {editingId ? "Update" : "Create"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg bg-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-gray-700">
            All Fee Types
          </h2>

          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : feeTypes.length === 0 ? (
            <p className="text-sm text-gray-500">No fee types created yet.</p>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {feeTypes.map((feeType) => (
                  <div
                    key={feeType._id}
                    className="rounded-xl border bg-white p-3 text-sm"
                  >
                    <div className="mb-2">
                      <p className="font-semibold text-gray-800">
                        {feeType.name}
                      </p>
                      {feeType.description && (
                        <p className="text-xs text-gray-500">
                          {feeType.description}
                        </p>
                      )}
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                        {getAppliesToLabel(feeType.appliesTo)}
                      </span>

                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                        {feeType.isCompulsory ? "Compulsory" : "Optional"}
                      </span>

                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          feeType.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {feeType.isActive ? "Active" : "Archived"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEdit(feeType)}
                        className="rounded bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>

                      {feeType.isActive ? (
                        <button
                          onClick={() => handleArchive(feeType._id)}
                          className="rounded bg-red-600 px-3 py-2 text-xs text-white hover:bg-red-700"
                        >
                          Archive
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRestore(feeType._id)}
                          className="rounded bg-green-600 px-3 py-2 text-xs text-white hover:bg-green-700"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-100 text-left">
                    <tr>
                      <th className="border px-3 py-2">Name</th>
                      <th className="border px-3 py-2">Applies To</th>
                      <th className="border px-3 py-2">Type</th>
                      <th className="border px-3 py-2">Status</th>
                      <th className="border px-3 py-2">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {feeTypes.map((feeType) => (
                      <tr key={feeType._id}>
                        <td className="border px-3 py-2">
                          <div className="font-medium text-gray-800">
                            {feeType.name}
                          </div>
                          {feeType.description && (
                            <div className="text-xs text-gray-500">
                              {feeType.description}
                            </div>
                          )}
                        </td>

                        <td className="border px-3 py-2">
                          {getAppliesToLabel(feeType.appliesTo)}
                        </td>

                        <td className="border px-3 py-2">
                          {feeType.isCompulsory ? "Compulsory" : "Optional"}
                        </td>

                        <td className="border px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              feeType.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {feeType.isActive ? "Active" : "Archived"}
                          </span>
                        </td>

                        <td className="border px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleEdit(feeType)}
                              className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                            >
                              Edit
                            </button>

                            {feeType.isActive ? (
                              <button
                                onClick={() => handleArchive(feeType._id)}
                                className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                              >
                                Archive
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestore(feeType._id)}
                                className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                              >
                                Restore
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeTypesPage;