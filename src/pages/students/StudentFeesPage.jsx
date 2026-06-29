// src/pages/student/StudentFeesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

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

const StudentFeesPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedAccount = useMemo(() => {
    return accounts.find((item) => item._id === selectedAccountId) || accounts[0];
  }, [accounts, selectedAccountId]);

  const totals = useMemo(() => {
    const fees = selectedAccount?.fees || [];

    const currentTermAmount = fees.reduce(
      (sum, fee) => sum + Number(fee.amount || 0),
      0
    );

    const currentTermDiscount = fees.reduce(
      (sum, fee) => sum + Number(fee.discount || 0),
      0
    );

    const currentTermNet = fees.reduce(
      (sum, fee) => sum + Number(fee.netAmount || 0),
      0
    );

    const currentTermPaid = fees.reduce(
      (sum, fee) => sum + Number(fee.paid || 0),
      0
    );

    const currentTermDue = fees.reduce(
      (sum, fee) => sum + Number(fee.due || 0),
      0
    );

    return {
      currentTermAmount,
      currentTermDiscount,
      currentTermNet,
      currentTermPaid,
      currentTermDue,
      previousBalance: Number(selectedAccount?.previousBalance || 0),
      previousBalancePaid: Number(selectedAccount?.previousBalancePaid || 0),
      totalPayable: Number(selectedAccount?.netPayable || 0),
      totalPaid: Number(selectedAccount?.totalPaid || 0),
      totalDue: Number(selectedAccount?.totalDue || 0),
    };
  }, [selectedAccount]);

  const progress = totals.totalPayable
    ? Math.min(Math.round((totals.totalPaid / totals.totalPayable) * 100), 100)
    : 0;

  const fetchFees = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/student-fees/my-fees");

      const data = res.data.data || [];
      setAccounts(data);

      if (data.length > 0) {
        setSelectedAccountId(data[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load fee account");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading fees...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          My Fees
        </h1>
        <p className="text-sm text-gray-500">
          View your school fee account, payment progress and balance.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          No fee account found yet.
        </div>
      ) : (
        <>
          <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Select Term Account
            </label>
            <select
              value={selectedAccount?._id || ""}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full rounded-lg border px-3 py-3 text-sm"
            >
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.sessionId?.name} - {account.termId?.name} -{" "}
                  {account.classId?.name} {account.armId?.name || ""}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedAccount?.sessionId?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedAccount?.termId?.name} •{" "}
                  {selectedAccount?.classId?.name} {selectedAccount?.armId?.name}
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(
                  selectedAccount?.status
                )}`}
              >
                {selectedAccount?.status || "unpaid"}
              </span>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                <span>Payment Progress</span>
                <span>
                  {formatMoney(totals.totalPaid)} paid of{" "}
                  {formatMoney(totals.totalPayable)} ({progress}%)
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-green-600"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card label="Total Payable" value={formatMoney(totals.totalPayable)} />
            <Card label="Total Paid" value={formatMoney(totals.totalPaid)} green />
            <Card label="Balance" value={formatMoney(totals.totalDue)} red />
            <Card
              label="Previous Balance"
              value={formatMoney(totals.previousBalance)}
              orange
            />
          </div>

          <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">
              Fee Breakdown
            </h2>

            <div className="space-y-3 md:hidden">
              {selectedAccount?.fees?.map((fee) => (
                <FeeCard key={fee._id} fee={fee} />
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="border px-3 py-2">Fee</th>
                    <th className="border px-3 py-2 text-right">Amount</th>
                    <th className="border px-3 py-2 text-right">Discount</th>
                    <th className="border px-3 py-2 text-right">Net</th>
                    <th className="border px-3 py-2 text-right">Paid</th>
                    <th className="border px-3 py-2 text-right">Balance</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedAccount?.fees?.map((fee) => (
                    <tr key={fee._id}>
                      <td className="border px-3 py-2">{fee.feeTypeName}</td>
                      <td className="border px-3 py-2 text-right">
                        {formatMoney(fee.amount)}
                      </td>
                      <td className="border px-3 py-2 text-right">
                        {formatMoney(fee.discount)}
                      </td>
                      <td className="border px-3 py-2 text-right">
                        {formatMoney(fee.netAmount)}
                      </td>
                      <td className="border px-3 py-2 text-right text-green-700">
                        {formatMoney(fee.paid)}
                      </td>
                      <td className="border px-3 py-2 text-right text-red-700">
                        {formatMoney(fee.due)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">
              Carry Forward
            </h2>

            <Info label="Previous Balance" value={totals.previousBalance} />
            <Info
              label="Paid Towards Old Balance"
              value={totals.previousBalancePaid}
              green
            />
            <Info
              label="Outstanding Old Balance"
              value={Math.max(
                totals.previousBalance - totals.previousBalancePaid,
                0
              )}
              red
            />
          </div>
        </>
      )}
    </div>
  );
};

const Card = ({ label, value, green, red, orange }) => (
  <div
    className={`rounded-xl p-4 shadow-sm ${
      green
        ? "bg-green-50 text-green-800"
        : red
        ? "bg-red-50 text-red-800"
        : orange
        ? "bg-orange-50 text-orange-800"
        : "bg-white text-gray-800"
    }`}
  >
    <p className="text-xs opacity-80">{label}</p>
    <h3 className="mt-1 text-lg font-bold">{value}</h3>
  </div>
);

const FeeCard = ({ fee }) => (
  <div className="rounded-lg border bg-white p-3 text-sm">
    <div className="mb-2 font-semibold text-gray-800">{fee.feeTypeName}</div>

    <div className="grid grid-cols-2 gap-2 text-xs">
      <p className="text-gray-500">Amount</p>
      <p className="text-right font-medium">{formatMoney(fee.amount)}</p>

      <p className="text-gray-500">Discount</p>
      <p className="text-right font-medium">{formatMoney(fee.discount)}</p>

      <p className="text-gray-500">Net</p>
      <p className="text-right font-medium">{formatMoney(fee.netAmount)}</p>

      <p className="text-gray-500">Paid</p>
      <p className="text-right font-medium text-green-700">
        {formatMoney(fee.paid)}
      </p>

      <p className="text-gray-500">Balance</p>
      <p className="text-right font-medium text-red-700">
        {formatMoney(fee.due)}
      </p>
    </div>
  </div>
);

const Info = ({ label, value, green, red }) => (
  <div className="flex items-center justify-between border-b py-3 text-sm last:border-b-0">
    <span className="text-gray-500">{label}</span>
    <span
      className={`font-semibold ${
        green ? "text-green-700" : red ? "text-red-700" : "text-gray-800"
      }`}
    >
      {formatMoney(value)}
    </span>
  </div>
);

export default StudentFeesPage;