
import React, { useEffect, useState } from "react";
import api from "../../../api/axios";

const FeeStructurePage = () => {
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [structures, setStructures] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    sessionId: "",
    termId: "",
    classId: "",
    armId: "",
  });

  const [fees, setFees] = useState([{ feeTypeId: "", amount: "" }]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchInitialData = async () => {
    try {
      const [sessionsRes, classesRes, feeTypesRes, structuresRes] =
        await Promise.all([
          api.get("/sessions"),
          api.get("/classes"),
          api.get("/fees/types/active"),
          api.get("/fees/structures"),
        ]);

      setSessions(sessionsRes.data.data || sessionsRes.data || []);
      setClasses(classesRes.data.data || classesRes.data || []);
      setFeeTypes(feeTypesRes.data.data || []);
      setStructures(structuresRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load page data");
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const selectedSession = sessions.find((s) => s._id === form.sessionId);
    setTerms(selectedSession?.terms || []);
  }, [form.sessionId, sessions]);

  useEffect(() => {
    const selectedClass = classes.find((cls) => cls._id === form.classId);
    setArms(selectedClass?.arms || []);
  }, [form.classId, classes]);

  const handleFeeChange = (index, field, value) => {
    const updated = [...fees];
    updated[index][field] = value;
    setFees(updated);
  };

  const addFeeRow = () => {
    setFees([...fees, { feeTypeId: "", amount: "" }]);
  };

  const removeFeeRow = (index) => {
    if (fees.length === 1) return;
    setFees(fees.filter((_, i) => i !== index));
  };

  const totalAmount = fees.reduce(
    (sum, fee) => sum + Number(fee.amount || 0),
    0
  );

  const resetForm = () => {
    setEditingId(null);

    setForm({
      sessionId: "",
      termId: "",
      classId: "",
      armId: "",
    });

    setFees([{ feeTypeId: "", amount: "" }]);
  };

  const handleEdit = (item) => {
    setMessage("");
    setError("");
    setEditingId(item._id);

    setForm({
      sessionId: item.sessionId?._id || item.sessionId || "",
      termId: item.termId?._id || item.termId || "",
      classId: item.classId?._id || item.classId || "",
      armId: item.armId?._id || item.armId || "",
    });

    setFees(
      item.fees?.length
        ? item.fees.map((fee) => ({
            feeTypeId: fee.feeTypeId?._id || fee.feeTypeId || "",
            amount: fee.amount || "",
          }))
        : [{ feeTypeId: "", amount: "" }]
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.sessionId || !form.termId || !form.classId) {
      setError("Session, term and class are required");
      return;
    }

    const cleanFees = fees
      .filter((fee) => fee.feeTypeId && Number(fee.amount) > 0)
      .map((fee) => ({
        feeTypeId: fee.feeTypeId,
        amount: Number(fee.amount),
      }));

    if (cleanFees.length === 0) {
      setError("Please add at least one valid fee item");
      return;
    }

    const duplicateCheck = new Set();

    for (const fee of cleanFees) {
      if (duplicateCheck.has(fee.feeTypeId)) {
        setError("You selected the same fee type more than once");
        return;
      }

      duplicateCheck.add(fee.feeTypeId);
    }

    try {
      setLoading(true);

      if (editingId) {
        const ok = window.confirm(
          "Updating this fee structure will also sync existing student fee accounts. New fee items will be added to students' accounts. Continue?"
        );

        if (!ok) {
          setLoading(false);
          return;
        }

        const res = await api.put(`/fees/structures/${editingId}`, {
          fees: cleanFees,
          isActive: true,
        });

        setMessage(
          `Fee structure updated successfully. Student accounts synced: ${
            res.data.accountsUpdated || 0
          }`
        );
      } else {
        await api.post("/fees/structures", {
          ...form,
          armId: form.armId || null,
          fees: cleanFees,
        });

        setMessage("Fee structure created successfully");
      }

      resetForm();
      fetchInitialData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${editingId ? "update" : "create"} fee structure`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this fee structure?")) return;

    try {
      await api.patch(`/fees/structures/${id}/deactivate`);
      setMessage("Fee structure deactivated successfully");
      fetchInitialData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to deactivate fee structure"
      );
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Fee Structures</h1>
        <p className="text-sm text-gray-500">
          Set and update fees payable by each class and arm for a session and
          term.
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

      <div className="grid gap-6 lg:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-4 shadow lg:col-span-1"
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-700">
            {editingId ? "Edit Fee Structure" : "Create Fee Structure"}
          </h2>

          {editingId && (
            <div className="mb-4 rounded-lg bg-yellow-100 px-3 py-2 text-sm text-yellow-800">
              Editing mode: changes will sync existing student fee accounts.
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Session
            </label>
            <select
              value={form.sessionId}
              disabled={!!editingId}
              onChange={(e) =>
                setForm({ ...form, sessionId: e.target.value, termId: "" })
              }
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-green-500 disabled:bg-gray-100"
            >
              <option value="">Select session</option>
              {sessions.map((session) => (
                <option key={session._id} value={session._id}>
                  {session.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Term
            </label>
            <select
              value={form.termId}
              disabled={!!editingId}
              onChange={(e) => setForm({ ...form, termId: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-green-500 disabled:bg-gray-100"
            >
              <option value="">Select term</option>
              {terms.map((term) => (
                <option key={term._id} value={term._id}>
                  {term.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Class
            </label>
            <select
              value={form.classId}
              disabled={!!editingId}
              onChange={(e) =>
                setForm({ ...form, classId: e.target.value, armId: "" })
              }
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-green-500 disabled:bg-gray-100"
            >
              <option value="">Select class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Arm
            </label>
            <select
              value={form.armId}
              disabled={!!editingId}
              onChange={(e) => setForm({ ...form, armId: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-green-500 disabled:bg-gray-100"
            >
              <option value="">All arms / No arm</option>
              {arms.map((arm) => (
                <option key={arm._id} value={arm._id}>
                  {arm.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-600">
                Fee Items
              </label>
              <button
                type="button"
                onClick={addFeeRow}
                className="rounded bg-green-600 px-3 py-1 text-xs text-white"
              >
                Add
              </button>
            </div>

            <div className="space-y-3">
              {fees.map((fee, index) => (
                <div key={index} className="rounded-lg border p-3">
                  <select
                    value={fee.feeTypeId}
                    onChange={(e) =>
                      handleFeeChange(index, "feeTypeId", e.target.value)
                    }
                    className="mb-2 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  >
                    <option value="">Select fee type</option>
                    {feeTypes.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={fee.amount}
                    onChange={(e) =>
                      handleFeeChange(index, "amount", e.target.value)
                    }
                    placeholder="Amount"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  />

                  {fees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeeRow(index)}
                      className="mt-2 text-xs text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold">
            Total: ₦{totalAmount.toLocaleString()}
          </div>

          <div className="flex gap-2">
            <button
              disabled={loading}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update & Sync"
                : "Create Structure"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="rounded-xl bg-white p-4 shadow lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">
            Existing Fee Structures
          </h2>

          {structures.length === 0 ? (
            <p className="text-gray-500">No fee structures created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="border px-3 py-2">Session/Term</th>
                    <th className="border px-3 py-2">Class</th>
                    <th className="border px-3 py-2">Fees</th>
                    <th className="border px-3 py-2">Total</th>
                    <th className="border px-3 py-2">Status</th>
                    <th className="border px-3 py-2">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {structures.map((item) => (
                    <tr key={item._id}>
                      <td className="border px-3 py-2">
                        <div>{item.sessionId?.name}</div>
                        <div className="text-xs text-gray-500">
                          {item.termId?.name}
                        </div>
                      </td>

                      <td className="border px-3 py-2">
                        <div>{item.classId?.name}</div>
                        <div className="text-xs text-gray-500">
                          {item.armId?.name || "All arms"}
                        </div>
                      </td>

                      <td className="border px-3 py-2">
                        {item.fees?.map((fee) => (
                          <div key={fee._id} className="text-xs">
                            {fee.feeTypeName}: ₦
                            {Number(fee.amount || 0).toLocaleString()}
                          </div>
                        ))}
                      </td>

                      <td className="border px-3 py-2 font-semibold">
                        ₦{Number(item.totalAmount || 0).toLocaleString()}
                      </td>

                      <td className="border px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            item.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="border px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="rounded bg-blue-600 px-3 py-1 text-xs text-white"
                          >
                            Edit
                          </button>

                          {item.isActive && (
                            <button
                              onClick={() => handleDeactivate(item._id)}
                              className="rounded bg-red-600 px-3 py-1 text-xs text-white"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeStructurePage;