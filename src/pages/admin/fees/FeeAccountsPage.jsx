// src/pages/admin/fees/FeeAccountsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/axios";

const STORAGE_KEY = "feeAccountsFilters";

const formatMoney = (value) => `₦${Number(value || 0).toLocaleString()}`;

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

const FeeAccountsPage = () => {
  const [activeSessionTerm, setActiveSessionTerm] = useState(null);
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

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const getResponseData = (res) => res.data?.data ?? res.data;

  const saveFilters = (nextFilters, nextPage = page) => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        filters: nextFilters,
        page: nextPage,
      })
    );
  };

  const updateFilter = (name, value) => {
    const nextFilters = {
      ...filters,
      [name]: value,
    };

    if (name === "classId") {
      nextFilters.armId = "";
    }

    setFilters(nextFilters);
    setPage(1);
    saveFilters(nextFilters, 1);
  };

  const fetchInitialData = async () => {
    try {
      setError("");

      const [activeRes, classesRes] = await Promise.all([
        api.get("/sessions/active"),
        api.get("/classes"),
      ]);

      const activePayload = getResponseData(activeRes);
      const classesPayload = getResponseData(classesRes);

      const activeSession = activePayload?.session || null;
      const activeTerm = activePayload?.term || null;

      setActiveSessionTerm(activePayload || null);
      setClasses(Array.isArray(classesPayload) ? classesPayload : []);

      const activeSessionTerms = Array.isArray(activeSession?.terms)
        ? activeSession.terms
        : activeTerm
        ? [activeTerm]
        : [];

      setTerms(activeSessionTerms);

      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");

      const restoredFilters = saved?.filters || {};

      const nextFilters = {
        sessionId: activeSession?._id || "",
        termId: restoredFilters.termId || activeTerm?._id || "",
        classId: restoredFilters.classId || "",
        armId: restoredFilters.armId || "",
        status: restoredFilters.status || "",
      };

      setFilters(nextFilters);

      const restoredPage = Number(saved?.page || 1);
      setPage(restoredPage);

      saveFilters(nextFilters, restoredPage);

      if (nextFilters.sessionId && nextFilters.termId && nextFilters.classId) {
        await fetchAccounts(nextFilters, restoredPage);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load page data");
    }
  };

  const fetchAccounts = async (filtersToUse = filters, pageToFetch = page) => {
    if (
      !filtersToUse.sessionId ||
      !filtersToUse.termId ||
      !filtersToUse.classId
    ) {
      setError("Please select term and class before loading accounts.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      const params = {
        page: pageToFetch,
        limit,
      };

      Object.entries(filtersToUse).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const res = await api.get("/fees/accounts", { params });

      setAccounts(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalRecords(res.data.totalRecords || 0);
      setPage(pageToFetch);

      saveFilters(filtersToUse, pageToFetch);
    } catch (err) {
      setAccounts([]);
      setError(err.response?.data?.message || "Failed to load fee accounts");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    const nextFilters = {
      sessionId: activeSessionTerm?.session?._id || "",
      termId: activeSessionTerm?.term?._id || "",
      classId: "",
      armId: "",
      status: "",
    };

    setFilters(nextFilters);
    setArms([]);
    setAccounts([]);
    setHasSearched(false);
    setPage(1);
    setTotalPages(1);
    setTotalRecords(0);
    setError("");

    saveFilters(nextFilters, 1);
  };

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const selectedClass = classes.find((cls) => cls._id === filters.classId);
    setArms(Array.isArray(selectedClass?.arms) ? selectedClass.arms : []);
  }, [filters.classId, classes]);

  const totals = useMemo(() => {
    return accounts.reduce(
      (acc, account) => {
        acc.totalExpected += Number(account.netPayable || 0);
        acc.totalPaid += Number(account.totalPaid || 0);
        acc.totalDue += Number(account.totalDue || 0);
        return acc;
      },
      {
        totalExpected: 0,
        totalPaid: 0,
        totalDue: 0,
      }
    );
  }, [accounts]);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          Fee Accounts
        </h1>
        <p className="text-sm text-gray-500">
          View student fee accounts for the current session.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-700">Filters</h2>
            <p className="text-xs text-gray-500">
              Session is locked to the current active session.
            </p>
          </div>

          {activeSessionTerm?.session && (
            <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              {activeSessionTerm.session.name}
            </span>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Current Session
            </label>
            <input
              value={activeSessionTerm?.session?.name || "No active session"}
              disabled
              className="w-full rounded-lg border bg-gray-100 px-3 py-3 text-sm text-gray-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Term
            </label>
            <select
              value={filters.termId}
              onChange={(e) => updateFilter("termId", e.target.value)}
              className="w-full rounded-lg border px-3 py-3 text-sm"
            >
              <option value="">Select Term</option>
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
              onChange={(e) => updateFilter("classId", e.target.value)}
              className="w-full rounded-lg border px-3 py-3 text-sm"
            >
              <option value="">Select Class</option>
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
              onChange={(e) => updateFilter("armId", e.target.value)}
              disabled={!filters.classId}
              className="w-full rounded-lg border px-3 py-3 text-sm disabled:bg-gray-100"
            >
              <option value="">All Arms</option>
              {arms.map((arm) => (
                <option key={arm._id} value={arm._id}>
                  {arm.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="w-full rounded-lg border px-3 py-3 text-sm"
            >
              <option value="">All Status</option>
              <option value="unpaid">Unpaid</option>
              <option value="part_payment">Part Payment</option>
              <option value="paid">Paid</option>
              <option value="overpaid">Overpaid</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => fetchAccounts(filters, 1)}
              disabled={loading}
              className="w-full rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? "Loading..." : "Apply Filters"}
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full rounded-lg border px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {hasSearched && (
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Expected This Page</p>
            <h3 className="text-xl font-bold text-gray-800">
              {formatMoney(totals.totalExpected)}
            </h3>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Paid This Page</p>
            <h3 className="text-xl font-bold text-green-700">
              {formatMoney(totals.totalPaid)}
            </h3>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Due This Page</p>
            <h3 className="text-xl font-bold text-red-700">
              {formatMoney(totals.totalDue)}
            </h3>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-gray-700">
              Student Fee Accounts
            </h2>
            <p className="text-xs text-gray-500">
              {hasSearched
                ? `Showing ${accounts.length} of ${totalRecords} record(s)`
                : "Apply filters to load accounts"}
            </p>
          </div>

          {hasSearched && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {loading ? (
          <p className="py-6 text-center text-gray-500">
            Loading fee accounts...
          </p>
        ) : !hasSearched ? (
          <p className="py-6 text-center text-gray-500">
            Select term and class, then click Apply Filters.
          </p>
        ) : accounts.length === 0 ? (
          <p className="py-6 text-center text-gray-500">
            No fee accounts found for the selected filters.
          </p>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {accounts.map((account) => (
                <AccountCard key={account._id} account={account} />
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
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
                    <tr key={account._id} className="hover:bg-gray-50">
                      <td className="border px-3 py-2">
                        <div className="font-medium text-gray-800">
                          {account.studentId?.name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {account.studentId?.admissionNumber || "N/A"}
                        </div>
                      </td>

                      <td className="border px-3 py-2">
                        <div>{account.classId?.name || "N/A"}</div>
                        <div className="text-xs text-gray-500">
                          {account.armId?.name || "No arm"}
                        </div>
                      </td>

                      <td className="border px-3 py-2">
                        <div>{account.sessionId?.name || "N/A"}</div>
                        <div className="text-xs text-gray-500">
                          {account.termId?.name || "N/A"}
                        </div>
                      </td>

                      <td className="border px-3 py-2">
                        {formatMoney(account.netPayable)}
                      </td>

                      <td className="border px-3 py-2 text-green-700">
                        {formatMoney(account.totalPaid)}
                      </td>

                      <td className="border px-3 py-2 text-red-700">
                        {formatMoney(account.totalDue)}
                      </td>

                      <td className="border px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs capitalize ${statusClass(
                            account.status
                          )}`}
                        >
                          {account.status || "unpaid"}
                        </span>
                      </td>

                      <td className="border px-3 py-2">
                        <Link
                          to={`/admin/fees/accounts/${account._id}`}
                          className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
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
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => fetchAccounts(filters, Math.max(page - 1, 1))}
                  disabled={page <= 1 || loading}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="text-xs text-gray-500">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    fetchAccounts(filters, Math.min(page + 1, totalPages))
                  }
                  disabled={page >= totalPages || loading}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const AccountCard = ({ account }) => (
  <div className="rounded-xl border bg-white p-3 text-sm">
    <div className="mb-3 flex items-start justify-between gap-2">
      <div>
        <h3 className="font-semibold text-gray-800">
          {account.studentId?.name || "N/A"}
        </h3>
        <p className="text-xs text-gray-500">
          {account.studentId?.admissionNumber || "N/A"}
        </p>
      </div>

      <span
        className={`rounded-full px-2 py-1 text-[11px] capitalize ${statusClass(
          account.status
        )}`}
      >
        {account.status || "unpaid"}
      </span>
    </div>

    <p className="mb-2 text-xs text-gray-500">
      {account.classId?.name || "N/A"} {account.armId?.name || ""}
    </p>

    <div className="grid grid-cols-3 gap-2 text-xs">
      <div className="rounded-lg bg-gray-50 p-2">
        <p className="text-gray-500">Payable</p>
        <p className="font-bold text-gray-800">
          {formatMoney(account.netPayable)}
        </p>
      </div>

      <div className="rounded-lg bg-green-50 p-2">
        <p className="text-gray-500">Paid</p>
        <p className="font-bold text-green-700">
          {formatMoney(account.totalPaid)}
        </p>
      </div>

      <div className="rounded-lg bg-red-50 p-2">
        <p className="text-gray-500">Due</p>
        <p className="font-bold text-red-700">{formatMoney(account.totalDue)}</p>
      </div>
    </div>

    <Link
      to={`/admin/fees/accounts/${account._id}`}
      className="mt-3 block rounded-lg bg-blue-600 px-3 py-2 text-center text-xs font-semibold text-white"
    >
      View Account
    </Link>
  </div>
);

export default FeeAccountsPage;