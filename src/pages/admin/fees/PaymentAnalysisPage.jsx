

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/axios";

const FeeCollectionAnalysisPage = () => {
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);

  const [summary, setSummary] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

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

  const buildParams = () => {
    const params = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });

    return params;
  };

  const fetchAnalysis = async (pageToFetch = 1) => {
    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      const params = buildParams();

      const [summaryRes, accountsRes] = await Promise.all([
        api.get("/fees/reports/collection-summary", { params }),
        api.get("/fees/accounts", {
          params: {
            ...params,
            page: pageToFetch,
            limit,
          },
        }),
      ]);

      setSummary(summaryRes.data.data || null);
      setAccounts(accountsRes.data.data || []);
      setPage(pageToFetch);
      setTotalPages(accountsRes.data.totalPages || 1);
      setTotalRecords(accountsRes.data.totalRecords || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analysis");
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
    setSummary(null);
    setAccounts([]);
    setHasSearched(false);
    setPage(1);
    setTotalPages(1);
    setTotalRecords(0);
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

  const collectionRate = summary?.collectionRate || 0;

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
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
            Fee Collection Analysis
          </h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Analyze expected fees, payments received, outstanding balances, and
            student payment status.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          disabled={!hasSearched || accounts.length === 0}
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
            Select session, term, class, arm, or status, then click Apply
            Filters.
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
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-green-500"
            >
              <option value="">All Status</option>
              <option value="unpaid">Unpaid</option>
              <option value="part_payment">Part Payment</option>
              <option value="paid">Paid</option>
              <option value="overpaid">Overpaid</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => fetchAnalysis(1)}
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

      {!hasSearched ? (
        <div className="rounded-xl bg-white p-4 text-sm text-gray-500 shadow-sm">
          Apply filters to view fee collection analysis.
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Expected Payment</p>
              <h2 className="mt-1 text-xl font-bold text-gray-800">
                ₦{Number(summary?.totalExpected || 0).toLocaleString()}
              </h2>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Payments Received</p>
              <h2 className="mt-1 text-xl font-bold text-green-700">
                ₦{Number(summary?.totalCollected || 0).toLocaleString()}
              </h2>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Payments Due</p>
              <h2 className="mt-1 text-xl font-bold text-red-700">
                ₦{Number(summary?.totalOutstanding || 0).toLocaleString()}
              </h2>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Collection Rate</p>
              <h2 className="mt-1 text-xl font-bold text-blue-700">
                {collectionRate}%
              </h2>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Original Fees</p>
              <h2 className="mt-1 text-lg font-bold text-gray-800">
                ₦{Number(summary?.totalOriginalFees || 0).toLocaleString()}
              </h2>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Discounts Given</p>
              <h2 className="mt-1 text-lg font-bold text-purple-700">
                ₦{Number(summary?.totalDiscounts || 0).toLocaleString()}
              </h2>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Previous Balances</p>
              <h2 className="mt-1 text-lg font-bold text-orange-700">
                ₦{Number(summary?.totalPreviousBalance || 0).toLocaleString()}
              </h2>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Student Accounts</p>
              <h2 className="mt-1 text-lg font-bold text-gray-800">
                {summary?.totalAccounts || 0}
              </h2>
            </div>
          </div>

          <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-gray-700">
              Status Breakdown
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-xs text-gray-500">Paid</p>
                <p className="text-lg font-bold text-green-700">
                  {summary?.statusSummary?.paid || 0}
                </p>
              </div>

              <div className="rounded-lg bg-yellow-50 p-3">
                <p className="text-xs text-gray-500">Part Payment</p>
                <p className="text-lg font-bold text-yellow-700">
                  {summary?.statusSummary?.partPayment || 0}
                </p>
              </div>

              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-xs text-gray-500">Unpaid</p>
                <p className="text-lg font-bold text-red-700">
                  {summary?.statusSummary?.unpaid || 0}
                </p>
              </div>

              <div className="rounded-lg bg-purple-50 p-3">
                <p className="text-xs text-gray-500">Overpaid</p>
                <p className="text-lg font-bold text-purple-700">
                  {summary?.statusSummary?.overpaid || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-gray-700">
                Student Fee Accounts
              </h2>

              <p className="text-xs text-gray-500">
                Showing {accounts.length} of {totalRecords} record(s)
              </p>
            </div>

            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : accounts.length === 0 ? (
              <p className="text-sm text-gray-500">
                No fee accounts found for selected filters.
              </p>
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {accounts.map((account) => (
                    <div
                      key={account._id}
                      className="rounded-xl border bg-white p-3 text-sm"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {account.studentId?.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {account.studentId?.admissionNumber}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-medium ${statusClass(
                            account.status
                          )}`}
                        >
                          {account.status}
                        </span>
                      </div>

                      <div className="mb-3 rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">Class</p>
                        <p className="text-sm font-medium text-gray-800">
                          {account.classId?.name} {account.armId?.name}
                        </p>

                        <p className="mt-2 text-xs text-gray-500">
                          Session/Term
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          {account.sessionId?.name} - {account.termId?.name}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-lg bg-gray-100 p-2">
                          <p className="text-gray-500">Expected</p>
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

                      <Link
                        to={`/admin/fees/accounts/${account._id}`}
                        className="mt-3 block rounded-lg bg-blue-600 px-3 py-2 text-center text-xs font-medium text-white print:hidden"
                      >
                        View Account
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full border text-sm">
                    <thead className="bg-gray-100 text-left">
                      <tr>
                        <th className="border px-3 py-2">Student</th>
                        <th className="border px-3 py-2">Class</th>
                        <th className="border px-3 py-2">Session/Term</th>
                        <th className="border px-3 py-2">Expected</th>
                        <th className="border px-3 py-2">Paid</th>
                        <th className="border px-3 py-2">Due</th>
                        <th className="border px-3 py-2">Status</th>
                        <th className="border px-3 py-2 print:hidden">
                          Action
                        </th>
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

                          <td className="border px-3 py-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${statusClass(
                                account.status
                              )}`}
                            >
                              {account.status}
                            </span>
                          </td>

                          <td className="border px-3 py-2 print:hidden">
                            <Link
                              to={`/admin/fees/accounts/${account._id}`}
                              className="rounded bg-blue-600 px-3 py-1 text-xs text-white"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalRecords > limit && (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <p className="text-xs text-gray-500">
                      Page {page} of {totalPages} — Showing {accounts.length} of{" "}
                      {totalRecords} records
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchAnalysis(Math.max(page - 1, 1))}
                        disabled={page === 1 || loading}
                        className="rounded bg-gray-200 px-3 py-2 text-xs text-gray-700 disabled:opacity-50"
                      >
                        Previous
                      </button>

                      <button
                        onClick={() =>
                          fetchAnalysis(Math.min(page + 1, totalPages))
                        }
                        disabled={page === totalPages || loading}
                        className="rounded bg-green-600 px-3 py-2 text-xs text-white disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FeeCollectionAnalysisPage;