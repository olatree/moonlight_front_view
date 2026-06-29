// import React, { useEffect, useState } from "react";
// import api from "../../../api/axios";

// const GenerateFeeAccountsPage = () => {
//   const [structures, setStructures] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [generatingId, setGeneratingId] = useState(null);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   const fetchStructures = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/fees/structures");
//       setStructures(res.data.data || []);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to load fee structures");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStructures();
//   }, []);

//   const handleGenerate = async (structure) => {
//     setMessage("");
//     setError("");

//     const ok = window.confirm(
//       `Generate fee accounts for ${structure.classId?.name || "this class"} ${
//         structure.armId?.name || ""
//       }?`
//     );

//     if (!ok) return;

//     try {
//       setGeneratingId(structure._id);

//       const res = await api.post("/fees/accounts/generate", {
//         feeStructureId: structure._id,
//       });

//       setMessage(
//         `Generated successfully. Created: ${res.data.created}, Skipped: ${res.data.skipped}, Total students: ${res.data.totalStudents}`
//       );
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to generate accounts");
//     } finally {
//       setGeneratingId(null);
//     }
//   };

//   return (
//     <div className="p-4 md:p-6">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">
//           Generate Fee Accounts
//         </h1>
//         <p className="text-sm text-gray-500">
//           Create student fee accounts from existing fee structures.
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

//       <div className="rounded-xl bg-white p-4 shadow">
//         <h2 className="mb-4 text-lg font-semibold text-gray-700">
//           Available Fee Structures
//         </h2>

//         {loading ? (
//           <p className="text-gray-500">Loading...</p>
//         ) : structures.length === 0 ? (
//           <p className="text-gray-500">No fee structures found.</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full border text-sm">
//               <thead className="bg-gray-100 text-left">
//                 <tr>
//                   <th className="border px-3 py-2">Session/Term</th>
//                   <th className="border px-3 py-2">Class/Arm</th>
//                   <th className="border px-3 py-2">Fee Items</th>
//                   <th className="border px-3 py-2">Total</th>
//                   <th className="border px-3 py-2">Status</th>
//                   <th className="border px-3 py-2">Action</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {structures.map((structure) => (
//                   <tr key={structure._id}>
//                     <td className="border px-3 py-2">
//                       <div className="font-medium">
//                         {structure.sessionId?.name || "N/A"}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         {structure.termId?.name || "N/A"}
//                       </div>
//                     </td>

//                     <td className="border px-3 py-2">
//                       <div className="font-medium">
//                         {structure.classId?.name || "N/A"}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         {structure.armId?.name || "All arms"}
//                       </div>
//                     </td>

//                     <td className="border px-3 py-2">
//                       {structure.fees?.map((fee) => (
//                         <div key={fee._id} className="text-xs">
//                           {fee.feeTypeName}: ₦
//                           {Number(fee.amount || 0).toLocaleString()}
//                         </div>
//                       ))}
//                     </td>

//                     <td className="border px-3 py-2 font-semibold">
//                       ₦{Number(structure.totalAmount || 0).toLocaleString()}
//                     </td>

//                     <td className="border px-3 py-2">
//                       <span
//                         className={`rounded-full px-2 py-1 text-xs ${
//                           structure.isActive
//                             ? "bg-green-100 text-green-700"
//                             : "bg-red-100 text-red-700"
//                         }`}
//                       >
//                         {structure.isActive ? "Active" : "Inactive"}
//                       </span>
//                     </td>

//                     <td className="border px-3 py-2">
//                       <button
//                         disabled={!structure.isActive || generatingId === structure._id}
//                         onClick={() => handleGenerate(structure)}
//                         className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
//                       >
//                         {generatingId === structure._id
//                           ? "Generating..."
//                           : "Generate Accounts"}
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default GenerateFeeAccountsPage;

import React, { useEffect, useState } from "react";
import api from "../../../api/axios";

const GenerateFeeAccountsPage = () => {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchStructures = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/fees/structures");
      setStructures(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load fee structures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  const handleGenerate = async (structure) => {
    setMessage("");
    setError("");

    const ok = window.confirm(
      `Generate fee accounts for ${structure.classId?.name || "this class"} ${
        structure.armId?.name || ""
      }?\n\nThe system will automatically apply fees based on each student's category.`
    );

    if (!ok) return;

    try {
      setGeneratingId(structure._id);

      const res = await api.post("/fees/accounts/generate", {
        feeStructureId: structure._id,
      });

      setMessage(
        `Generated successfully. Created: ${res.data.created}, Skipped: ${res.data.skipped}, Carried Over: ${res.data.carriedOver || 0}, Total students: ${res.data.totalStudents}`
      );

      fetchStructures();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate accounts");
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          Generate Fee Accounts
        </h1>

        <p className="text-sm text-gray-500">
          Create student fee accounts from existing fee structures.
        </p>
      </div>

      <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
        <p className="font-semibold">How billing category works:</p>
        <p className="mt-1">
          Returning students, new intakes, and transfer students will
          automatically receive only the fee types that apply to them.
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

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-gray-700">
            Available Fee Structures
          </h2>

          <button
            onClick={fetchStructures}
            disabled={loading}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : structures.length === 0 ? (
          <p className="text-sm text-gray-500">No fee structures found.</p>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {structures.map((structure) => (
                <div
                  key={structure._id}
                  className="rounded-xl border bg-white p-3 text-sm"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {structure.classId?.name || "N/A"}{" "}
                        {structure.armId?.name || "All arms"}
                      </h3>

                      <p className="text-xs text-gray-500">
                        {structure.sessionId?.name || "N/A"} •{" "}
                        {structure.termId?.name || "N/A"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2 py-1 text-[11px] ${
                        structure.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {structure.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mb-3 rounded-lg bg-gray-50 p-3">
                    <p className="mb-1 text-xs font-semibold text-gray-600">
                      Fee Items
                    </p>

                    <div className="space-y-1">
                      {structure.fees?.map((fee) => (
                        <div
                          key={fee._id}
                          className="flex justify-between gap-3 text-xs"
                        >
                          <span>{fee.feeTypeName}</span>
                          <span className="font-medium">
                            ₦{Number(fee.amount || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="font-bold text-gray-800">
                      ₦{Number(structure.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>

                  <button
                    disabled={!structure.isActive || generatingId === structure._id}
                    onClick={() => handleGenerate(structure)}
                    className="w-full rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {generatingId === structure._id
                      ? "Generating..."
                      : "Generate Accounts"}
                  </button>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="border px-3 py-2">Session/Term</th>
                    <th className="border px-3 py-2">Class/Arm</th>
                    <th className="border px-3 py-2">Fee Items</th>
                    <th className="border px-3 py-2">Total</th>
                    <th className="border px-3 py-2">Status</th>
                    <th className="border px-3 py-2">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {structures.map((structure) => (
                    <tr key={structure._id}>
                      <td className="border px-3 py-2">
                        <div className="font-medium">
                          {structure.sessionId?.name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {structure.termId?.name || "N/A"}
                        </div>
                      </td>

                      <td className="border px-3 py-2">
                        <div className="font-medium">
                          {structure.classId?.name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {structure.armId?.name || "All arms"}
                        </div>
                      </td>

                      <td className="border px-3 py-2">
                        {structure.fees?.map((fee) => (
                          <div key={fee._id} className="text-xs">
                            {fee.feeTypeName}: ₦
                            {Number(fee.amount || 0).toLocaleString()}
                          </div>
                        ))}
                      </td>

                      <td className="border px-3 py-2 font-semibold">
                        ₦{Number(structure.totalAmount || 0).toLocaleString()}
                      </td>

                      <td className="border px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            structure.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {structure.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="border px-3 py-2">
                        <button
                          disabled={
                            !structure.isActive ||
                            generatingId === structure._id
                          }
                          onClick={() => handleGenerate(structure)}
                          className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {generatingId === structure._id
                            ? "Generating..."
                            : "Generate Accounts"}
                        </button>
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
  );
};

export default GenerateFeeAccountsPage;