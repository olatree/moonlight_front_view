

import React, { useEffect, useState } from "react";
import api from "../../../api/axios";

const DebtorsListPage = () => {
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);

  const [debtors, setDebtors] = useState([]);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

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

  const fetchDebtors = async () => {
    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const res = await api.get("/fees/reports/debtors", { params });

      setDebtors(res.data.data || []);
      setTotalOutstanding(res.data.totalOutstanding || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load debtors");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      sessionId: "",
      termId: "",
      classId: "",
      armId: "",
      status: "",
    });

    setTerms([]);
    setArms([]);
    setDebtors([]);
    setTotalOutstanding(0);
    setHasSearched(false);
    setError("");
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const selectedSession = sessions.find((s) => s._id === filters.sessionId);

    setTerms(selectedSession?.terms || []);

    setFilters((prev) => ({
      ...prev,
      termId: "",
    }));
  }, [filters.sessionId, sessions]);

  useEffect(() => {
    const selectedClass = classes.find((cls) => cls._id === filters.classId);

    setArms(selectedClass?.arms || []);

    setFilters((prev) => ({
      ...prev,
      armId: "",
    }));
  }, [filters.classId, classes]);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <style>
  {`
    @media print {
      @page {
        size: A4 portrait;
        margin: 10mm;
      }

      body {
        background: white !important;
      }

      table {
        width: 100% !important;
        border-collapse: collapse !important;
        font-size: 10px !important;
      }

      th,
      td {
        padding: 4px 6px !important;
        border: 1px solid #000 !important;
      }

      h1 {
        font-size: 16px !important;
      }

      h2 {
        font-size: 13px !important;
      }

      .print\\:hidden {
        display: none !important;
      }

      .print\\:block {
        display: block !important;
      }

      .shadow-sm,
      .shadow {
        box-shadow: none !important;
      }

      .rounded-xl,
      .rounded-lg {
        border-radius: 0 !important;
      }
    }
  `}
</style>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
            Debtors List
          </h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Filter and view students with outstanding school fee balances.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          disabled={!hasSearched || debtors.length === 0}
          className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto print:hidden"
        >
          Print
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 print:hidden">
          {error}
        </div>
      )}

      <div className="mb-4 rounded-xl bg-white p-4 shadow-sm print:hidden">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-700">Filters</h2>
          <p className="mt-1 text-xs text-gray-500">
            Select filters, then click Apply Filters. Debtors will not load
            automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Session
            </label>
            <select
              value={filters.sessionId}
              onChange={(e) =>
                setFilters({ ...filters, sessionId: e.target.value })
              }
              className="w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-green-500"
            >
              <option value="">All Sessions</option>
              {sessions.map((session) => (
                <option key={session._id} value={session._id}>
                  {session.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Term
            </label>
            <select
              value={filters.termId}
              onChange={(e) =>
                setFilters({ ...filters, termId: e.target.value })
              }
              className="w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-green-500"
            >
              <option value="">All Terms</option>
              {terms.map((term) => (
                <option key={term._id} value={term._id}>
                  {term.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Class
            </label>
            <select
              value={filters.classId}
              onChange={(e) =>
                setFilters({ ...filters, classId: e.target.value })
              }
              className="w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-green-500"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Arm
            </label>
            <select
              value={filters.armId}
              onChange={(e) =>
                setFilters({ ...filters, armId: e.target.value })
              }
              className="w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-green-500"
            >
              <option value="">All Arms</option>
              {arms.map((arm) => (
                <option key={arm._id} value={arm._id}>
                  {arm.name}
                </option>
              ))}
            </select>
          </div>

          <div>
  <label className="mb-1 block text-xs font-medium text-gray-600">
    Payment Status
  </label>
  <select
    value={filters.status}
    onChange={(e) =>
      setFilters({ ...filters, status: e.target.value })
    }
    className="w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-green-500"
  >
    <option value="">All Debtors</option>
    <option value="unpaid">Unpaid</option>
    <option value="part_payment">Part Payment</option>
    <option value="overpaid">Overpaid</option>
  </select>
</div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={fetchDebtors}
            disabled={loading}
            className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Loading..." : "Apply Filters"}
          </button>

          <button
            onClick={resetFilters}
            type="button"
            className="w-full rounded-lg bg-gray-200 px-4 py-3 text-sm font-medium text-gray-700 sm:w-auto"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs text-gray-500">Total Outstanding</p>
        <h2 className="mt-1 text-2xl font-bold text-red-700">
          ₦{Number(totalOutstanding || 0).toLocaleString()}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          {hasSearched
            ? `Total debtors: ${debtors.length}`
            : "Apply filters to view debtors"}
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-700">
          Outstanding Balances
        </h2>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !hasSearched ? (
          <p className="text-sm text-gray-500">
            Select your filters and click Apply Filters to view debtors.
          </p>
        ) : debtors.length === 0 ? (
          <p className="text-sm text-gray-500">
            No debtors found for the selected filters.
          </p>
        ) : (
          <>
            <div className="space-y-3 md:hidden print:hidden">
              {debtors.map((account) => (
                <div
                  key={account._id}
                  className="rounded-xl border bg-white p-3 text-sm"
                >
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-800">
                      {account.studentId?.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Admission No: {account.studentId?.admissionNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      Parent Contact: {account.studentId?.parentContact || "N/A"}
                    </p>
                  </div>

                  <div className="mb-3 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Class</p>
                    <p className="text-sm font-medium text-gray-800">
                      {account.classId?.name} {account.armId?.name}
                    </p>

                    <p className="mt-2 text-xs text-gray-500">Session/Term</p>
                    <p className="text-sm font-medium text-gray-800">
                      {account.sessionId?.name} - {account.termId?.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <p className="text-gray-500">Payable</p>
                      <p className="font-semibold text-gray-800">
                        ₦{Number(account.netPayable || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-lg bg-green-50 p-2">
                      <p className="text-gray-500">Paid</p>
                      <p className="font-semibold text-green-700">
                        ₦{Number(account.totalPaid || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-lg bg-red-50 p-2">
                      <p className="text-gray-500">Due</p>
                      <p className="font-semibold text-red-700">
                        ₦{Number(account.totalDue || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block print:block print:overflow-visible">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="border px-3 py-2">Student</th>
                    <th className="border px-3 py-2">Class</th>
                    <th className="border px-3 py-2">Session/Term</th>
                    <th className="border px-3 py-2">Payable</th>
                    <th className="border px-3 py-2">Paid</th>
                    <th className="border px-3 py-2">Outstanding</th>
                  </tr>
                </thead>

                <tbody>
                  {debtors.map((account) => (
                    <tr key={account._id}>
                      <td className="border px-3 py-2">
                        <div className="font-medium text-gray-800">
                          {account.studentId?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {account.studentId?.admissionNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {account.studentId?.parentContact}
                        </div>
                      </td>

                      <td className="border px-3 py-2">
                        {account.classId?.name} {account.armId?.name}
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

                      <td className="border px-3 py-2 font-semibold text-red-700">
                        ₦{Number(account.totalDue || 0).toLocaleString()}
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

export default DebtorsListPage;