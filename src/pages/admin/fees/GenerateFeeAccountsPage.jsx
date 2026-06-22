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
      }?`
    );

    if (!ok) return;

    try {
      setGeneratingId(structure._id);

      const res = await api.post("/fees/accounts/generate", {
        feeStructureId: structure._id,
      });

      setMessage(
        `Generated successfully. Created: ${res.data.created}, Skipped: ${res.data.skipped}, Total students: ${res.data.totalStudents}`
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate accounts");
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Generate Fee Accounts
        </h1>
        <p className="text-sm text-gray-500">
          Create student fee accounts from existing fee structures.
        </p>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-700">
          Available Fee Structures
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : structures.length === 0 ? (
          <p className="text-gray-500">No fee structures found.</p>
        ) : (
          <div className="overflow-x-auto">
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
                        disabled={!structure.isActive || generatingId === structure._id}
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
        )}
      </div>
    </div>
  );
};

export default GenerateFeeAccountsPage;