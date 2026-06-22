import React, { useEffect, useState } from "react";
import api from "../../../api/axios";

const FeeAccountsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [filters, setFilters] = useState({
    sessionId: "",
    termId: "",
    classId: "",
    armId: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchInitialData = async () => {
    try {
      const [sessionsRes, classesRes] = await Promise.all([
        api.get("/sessions"),
        api.get("/classes"),
      ]);

      setSessions(sessionsRes.data.data || sessionsRes.data || []);
      setClasses(classesRes.data.data || classesRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load filters");
    }
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const res = await api.get("/fees/accounts", { params });

      setAccounts(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load fee accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const selectedSession = sessions.find((s) => s._id === filters.sessionId);

    setTerms(selectedSession?.terms || []);
    setFilters((prev) => ({ ...prev, termId: "" }));
  }, [filters.sessionId, sessions]);

  useEffect(() => {
    const selectedClass = classes.find((cls) => cls._id === filters.classId);

    setArms(selectedClass?.arms || []);
    setFilters((prev) => ({ ...prev, armId: "" }));
  }, [filters.classId, classes]);

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.termId, filters.classId, filters.armId, filters.status]);

  const totalExpected = accounts.reduce(
    (sum, acc) => sum + Number(acc.netPayable || 0),
    0
  );

  const totalPaid = accounts.reduce(
    (sum, acc) => sum + Number(acc.totalPaid || 0),
    0
  );

  const totalDue = accounts.reduce(
    (sum, acc) => sum + Number(acc.totalDue || 0),
    0
  );

  const statusClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "part_payment":
        return "bg-yellow-100 text-yellow-700";
      case "overpaid":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Fee Accounts</h1>
        <p className="text-sm text-gray-500">
          View student balances, outstanding fees, and payment status.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-xl bg-white p-4 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Filters</h2>

        <div className="grid gap-4 md:grid-cols-5">
          <select
            value={filters.sessionId}
            onChange={(e) =>
              setFilters({ ...filters, sessionId: e.target.value })
            }
            className="rounded-lg border px-3 py-2"
          >
            <option value="">All Sessions</option>
            {sessions.map((session) => (
              <option key={session._id} value={session._id}>
                {session.name}
              </option>
            ))}
          </select>

          <select
            value={filters.termId}
            onChange={(e) =>
              setFilters({ ...filters, termId: e.target.value })
            }
            className="rounded-lg border px-3 py-2"
          >
            <option value="">All Terms</option>
            {terms.map((term) => (
              <option key={term._id} value={term._id}>
                {term.name}
              </option>
            ))}
          </select>

          <select
            value={filters.classId}
            onChange={(e) =>
              setFilters({ ...filters, classId: e.target.value })
            }
            className="rounded-lg border px-3 py-2"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>

          <select
            value={filters.armId}
            onChange={(e) =>
              setFilters({ ...filters, armId: e.target.value })
            }
            className="rounded-lg border px-3 py-2"
          >
            <option value="">All Arms</option>
            {arms.map((arm) => (
              <option key={arm._id} value={arm._id}>
                {arm.name}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
            className="rounded-lg border px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="part_payment">Part Payment</option>
            <option value="paid">Paid</option>
            <option value="overpaid">Overpaid</option>
          </select>
        </div>

        <button
          onClick={fetchAccounts}
          className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Apply Filters
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Total Expected</p>
          <h3 className="text-xl font-bold text-gray-800">
            ₦{totalExpected.toLocaleString()}
          </h3>
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Total Paid</p>
          <h3 className="text-xl font-bold text-green-700">
            ₦{totalPaid.toLocaleString()}
          </h3>
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Total Due</p>
          <h3 className="text-xl font-bold text-red-700">
            ₦{totalDue.toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-700">
          Student Fee Accounts
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : accounts.length === 0 ? (
          <p className="text-gray-500">No fee accounts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="border px-3 py-2">Student</th>
                  <th className="border px-3 py-2">Class</th>
                  <th className="border px-3 py-2">Session/Term</th>
                  <th className="border px-3 py-2">Payable</th>
                  <th className="border px-3 py-2">Paid</th>
                  <th className="border px-3 py-2">Due</th>
                  <th className="border px-3 py-2">Status</th>
                  <th className="border px-3 py-2">Action</th>
                </tr>
              </thead>

              <tbody>
                {accounts.map((account) => (
                  <tr key={account._id}>
                    <td className="border px-3 py-2">
                      <div className="font-medium text-gray-800">
                        {account.studentId?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {account.studentId?.admissionNumber}
                      </div>
                    </td>

                    <td className="border px-3 py-2">
                      <div>{account.classId?.name}</div>
                      <div className="text-xs text-gray-500">
                        {account.armId?.name}
                      </div>
                    </td>

                    <td className="border px-3 py-2">
                      <div>{account.sessionId?.name}</div>
                      <div className="text-xs text-gray-500">
                        {account.termId?.name}
                      </div>
                    </td>

                    <td className="border px-3 py-2">
                      ₦{Number(account.netPayable || 0).toLocaleString()}
                    </td>

                    <td className="border px-3 py-2 text-green-700">
                      ₦{Number(account.totalPaid || 0).toLocaleString()}
                    </td>

                    <td className="border px-3 py-2 text-red-700">
                      ₦{Number(account.totalDue || 0).toLocaleString()}
                    </td>

                    <td className="border px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${statusClass(
                          account.status
                        )}`}
                      >
                        {account.status}
                      </span>
                    </td>

                    <td className="border px-3 py-2">
                      <a
                        href={`/admin/fees/accounts/${account._id}`}
                        className="rounded bg-blue-600 px-3 py-1 text-xs text-white"
                      >
                        View
                      </a>
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

export default FeeAccountsPage;