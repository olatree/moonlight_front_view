
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../../api/axios";

const FeeAccountDetailsPage = () => {
  const { id } = useParams();

  const [account, setAccount] = useState(null);
  const [payments, setPayments] = useState([]);
  const [discounts, setDiscounts] = useState([]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
const [showDiscountModal, setShowDiscountModal] = useState(false);

const [historyFilters, setHistoryFilters] = useState({
  sessionId: "",
  termId: "",
});

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "cash",
    note: "",
  });

  const [discountForm, setDiscountForm] = useState({
    feeItemId: "",
    discountType: "fixed",
    value: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchAccount = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/fees/accounts/${id}`);
      const feeAccount = res.data.data;

      setAccount(feeAccount);

      const [paymentsRes, discountsRes] = await Promise.all([
        api.get("/fees/payments", { params: { feeAccountId: id } }),
        api.get("/fees/discounts", { params: { feeAccountId: id } }),
      ]);

      setPayments(paymentsRes.data.data || []);
      setDiscounts(discountsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load fee account");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      setError("Enter a valid payment amount");
      return;
    }

    try {
      setSavingPayment(true);

      await api.post("/fees/payments", {
        feeAccountId: id,
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        note: paymentForm.note,
      });

      setMessage("Payment recorded successfully");

      setPaymentForm({
        amount: "",
        paymentMethod: "cash",
        note: "",
      });

      fetchAccount();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record payment");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (
      !discountForm.feeItemId ||
      !discountForm.value ||
      Number(discountForm.value) <= 0 ||
      !discountForm.reason
    ) {
      setError("Select fee item, enter value and reason");
      return;
    }

    try {
      setSavingDiscount(true);

      await api.post("/fees/discounts", {
        feeAccountId: id,
        feeItemId: discountForm.feeItemId,
        discountType: discountForm.discountType,
        value: Number(discountForm.value),
        reason: discountForm.reason,
      });

      setMessage("Discount applied successfully");

      setDiscountForm({
        feeItemId: "",
        discountType: "fixed",
        value: "",
        reason: "",
      });

      fetchAccount();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply discount");
    } finally {
      setSavingDiscount(false);
    }
  };

  const handleVoidPayment = async (paymentId) => {
    if (!window.confirm("Void this payment? This will reverse the balance.")) {
      return;
    }

    try {
      await api.patch(`/fees/payments/${paymentId}/void`);
      setMessage("Payment voided successfully");
      fetchAccount();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to void payment");
    }
  };

  const handleCancelDiscount = async (discountId) => {
    if (!window.confirm("Cancel this discount?")) return;

    try {
      await api.patch(`/fees/discounts/${discountId}/cancel`);
      setMessage("Discount cancelled successfully");
      fetchAccount();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel discount");
    }
  };

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

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading...</div>;
  }

  if (!account) {
    return (
      <div className="p-4">
        <p className="mb-3 text-sm text-red-600">Fee account not found.</p>
        <Link to="/admin/fees/accounts" className="text-sm text-green-700 underline">
          Back to fee accounts
        </Link>
      </div>
    );
  }

  const filteredPayments = payments.filter((payment) => {
  const sessionMatch =
    !historyFilters.sessionId ||
    payment.sessionId?._id === historyFilters.sessionId ||
    payment.sessionId === historyFilters.sessionId;

  const termMatch =
    !historyFilters.termId ||
    payment.termId?._id === historyFilters.termId ||
    payment.termId === historyFilters.termId;

  return sessionMatch && termMatch;
});

const filteredDiscounts = discounts.filter((discount) => {
  const sessionMatch =
    !historyFilters.sessionId ||
    discount.sessionId?._id === historyFilters.sessionId ||
    discount.sessionId === historyFilters.sessionId;

  const termMatch =
    !historyFilters.termId ||
    discount.termId?._id === historyFilters.termId ||
    discount.termId === historyFilters.termId;

  return sessionMatch && termMatch;
});

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
            Fee Account Details
          </h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            View balance, record payment, and apply student discount.
          </p>
        </div>

        <Link
          to="/admin/fees/accounts"
          className="inline-flex w-full justify-center rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 sm:w-auto"
        >
          Back
        </Link>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Student</p>
          <h3 className="mt-1 text-sm font-bold text-gray-800">
            {account.studentId?.name}
          </h3>
          <p className="text-xs text-gray-500">
            {account.studentId?.admissionNumber}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Class</p>
          <h3 className="mt-1 text-sm font-bold text-gray-800">
            {account.classId?.name} {account.armId?.name}
          </h3>
          <p className="text-xs text-gray-500">
            {account.sessionId?.name} - {account.termId?.name}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Paid</p>
          <h3 className="mt-1 text-lg font-bold text-green-700">
            ₦{Number(account.totalPaid || 0).toLocaleString()}
          </h3>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Due</p>
          <h3 className="mt-1 text-lg font-bold text-red-700">
            ₦{Number(account.totalDue || 0).toLocaleString()}
          </h3>
          <span
            className={`mt-2 inline-block rounded-full px-2 py-1 text-[11px] font-medium ${statusClass(
              account.status
            )}`}
          >
            {account.status}
          </span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-700">
            Fee Breakdown
          </h2>

          <div className="mb-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-lg bg-gray-100 p-3">
              <p className="text-xs text-gray-500">Original</p>
              <p className="text-sm font-bold">
                ₦{Number(account.totalAmount || 0).toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg bg-gray-100 p-3">
              <p className="text-xs text-gray-500">Discount</p>
              <p className="text-sm font-bold">
                ₦{Number(account.totalDiscount || 0).toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg bg-gray-100 p-3">
              <p className="text-xs text-gray-500">Prev. Balance</p>
              <p className="text-sm font-bold">
                ₦{Number(account.previousBalance || 0).toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg bg-gray-100 p-3">
              <p className="text-xs text-gray-500">Net Payable</p>
              <p className="text-sm font-bold">
                ₦{Number(account.netPayable || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {account.fees?.map((fee) => (
              <div key={fee._id} className="rounded-lg border bg-white p-3 text-sm">
                <div className="mb-2 font-semibold text-gray-800">
                  {fee.feeTypeName}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p className="text-gray-500">Amount</p>
                  <p className="text-right font-medium">
                    ₦{Number(fee.amount || 0).toLocaleString()}
                  </p>

                  <p className="text-gray-500">Discount</p>
                  <p className="text-right font-medium">
                    ₦{Number(fee.discount || 0).toLocaleString()}
                  </p>

                  <p className="text-gray-500">Paid</p>
                  <p className="text-right font-medium text-green-700">
                    ₦{Number(fee.paid || 0).toLocaleString()}
                  </p>

                  <p className="text-gray-500">Due</p>
                  <p className="text-right font-medium text-red-700">
                    ₦{Number(fee.due || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="border px-3 py-2">Fee</th>
                  <th className="border px-3 py-2">Amount</th>
                  <th className="border px-3 py-2">Discount</th>
                  <th className="border px-3 py-2">Paid</th>
                  <th className="border px-3 py-2">Due</th>
                </tr>
              </thead>

              <tbody>
                {account.fees?.map((fee) => (
                  <tr key={fee._id}>
                    <td className="border px-3 py-2">{fee.feeTypeName}</td>
                    <td className="border px-3 py-2">
                      ₦{Number(fee.amount || 0).toLocaleString()}
                    </td>
                    <td className="border px-3 py-2">
                      ₦{Number(fee.discount || 0).toLocaleString()}
                    </td>
                    <td className="border px-3 py-2 text-green-700">
                      ₦{Number(fee.paid || 0).toLocaleString()}
                    </td>
                    <td className="border px-3 py-2 text-red-700">
                      ₦{Number(fee.due || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <form
            onSubmit={handleRecordPayment}
            className="rounded-xl bg-white p-4 shadow-sm"
          >
            <h2 className="mb-4 text-base font-semibold text-gray-700">
              Record Payment
            </h2>

            <input
              type="number"
              value={paymentForm.amount}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, amount: e.target.value })
              }
              placeholder="Amount paid"
              className="mb-3 w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-green-500"
            />

            <select
              value={paymentForm.paymentMethod}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  paymentMethod: e.target.value,
                })
              }
              className="mb-3 w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-green-500"
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="pos">POS</option>
              <option value="online">Online</option>
              <option value="cheque">Cheque</option>
            </select>

            <textarea
              value={paymentForm.note}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, note: e.target.value })
              }
              placeholder="Optional note"
              className="mb-3 w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-green-500"
              rows="3"
            />

            <button
              disabled={savingPayment}
              className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {savingPayment ? "Saving..." : "Record Payment"}
            </button>
          </form>

          <form
            onSubmit={handleApplyDiscount}
            className="rounded-xl bg-white p-4 shadow-sm"
          >
            <h2 className="mb-4 text-base font-semibold text-gray-700">
              Apply Discount
            </h2>

            <select
              value={discountForm.feeItemId}
              onChange={(e) =>
                setDiscountForm({
                  ...discountForm,
                  feeItemId: e.target.value,
                })
              }
              className="mb-3 w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Select fee item</option>
              {account.fees?.map((fee) => (
                <option key={fee._id} value={fee._id}>
                  {fee.feeTypeName} - ₦
                  {Number(fee.amount || 0).toLocaleString()}
                </option>
              ))}
            </select>

            <select
              value={discountForm.discountType}
              onChange={(e) =>
                setDiscountForm({
                  ...discountForm,
                  discountType: e.target.value,
                })
              }
              className="mb-3 w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="fixed">Fixed Amount</option>
              <option value="percentage">Percentage</option>
            </select>

            <input
              type="number"
              value={discountForm.value}
              onChange={(e) =>
                setDiscountForm({ ...discountForm, value: e.target.value })
              }
              placeholder={
                discountForm.discountType === "percentage"
                  ? "Percentage e.g. 20"
                  : "Amount e.g. 10000"
              }
              className="mb-3 w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-blue-500"
            />

            <textarea
              value={discountForm.reason}
              onChange={(e) =>
                setDiscountForm({ ...discountForm, reason: e.target.value })
              }
              placeholder="Reason for discount"
              className="mb-3 w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-blue-500"
              rows="3"
            />

            <button
              disabled={savingDiscount}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {savingDiscount ? "Saving..." : "Apply Discount"}
            </button>
          </form>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-700">
            Payment History
          </h2>

          {payments.length === 0 ? (
            <p className="text-sm text-gray-500">No payment yet.</p>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {payments.map((payment) => (
                  <div key={payment._id} className="rounded-lg border p-3 text-sm">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="break-all text-xs font-semibold text-gray-800">
                        {payment.reference}
                      </p>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-700">
                        {payment.status}
                      </span>
                    </div>

                    <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                      <p className="text-gray-500">Amount</p>
                      <p className="text-right font-medium">
                        ₦{Number(payment.amount || 0).toLocaleString()}
                      </p>

                      <p className="text-gray-500">Method</p>
                      <p className="text-right font-medium">
                        {payment.paymentMethod}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/admin/fees/receipts/${payment._id}`}
                        className="flex-1 rounded bg-green-600 px-3 py-2 text-center text-xs text-white"
                      >
                        Receipt
                      </Link>

                      {payment.status !== "voided" && (
                        <button
                          onClick={() => handleVoidPayment(payment._id)}
                          className="flex-1 rounded bg-red-600 px-3 py-2 text-xs text-white"
                        >
                          Void
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
                      <th className="border px-3 py-2">Reference</th>
                      <th className="border px-3 py-2">Amount</th>
                      <th className="border px-3 py-2">Method</th>
                      <th className="border px-3 py-2">Status</th>
                      <th className="border px-3 py-2">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id}>
                        <td className="border px-3 py-2">{payment.reference}</td>
                        <td className="border px-3 py-2">
                          ₦{Number(payment.amount || 0).toLocaleString()}
                        </td>
                        <td className="border px-3 py-2">
                          {payment.paymentMethod}
                        </td>
                        <td className="border px-3 py-2">{payment.status}</td>
                        <td className="border px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/admin/fees/receipts/${payment._id}`}
                              className="rounded bg-green-600 px-3 py-1 text-xs text-white"
                            >
                              Receipt
                            </Link>

                            {payment.status !== "voided" && (
                              <button
                                onClick={() => handleVoidPayment(payment._id)}
                                className="rounded bg-red-600 px-3 py-1 text-xs text-white"
                              >
                                Void
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

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-700">
            Discount History
          </h2>

          {discounts.length === 0 ? (
            <p className="text-sm text-gray-500">No discount yet.</p>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {discounts.map((discount) => (
                  <div key={discount._id} className="rounded-lg border p-3 text-sm">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-800">
                        {discount.feeTypeName}
                      </p>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-700">
                        {discount.status}
                      </span>
                    </div>

                    <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                      <p className="text-gray-500">Discount</p>
                      <p className="text-right font-medium">
                        ₦{Number(discount.discountAmount || 0).toLocaleString()}
                      </p>

                      <p className="text-gray-500">Reason</p>
                      <p className="text-right font-medium">{discount.reason}</p>
                    </div>

                    {discount.status !== "cancelled" && (
                      <button
                        onClick={() => handleCancelDiscount(discount._id)}
                        className="w-full rounded bg-red-600 px-3 py-2 text-xs text-white"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-100 text-left">
                    <tr>
                      <th className="border px-3 py-2">Fee</th>
                      <th className="border px-3 py-2">Discount</th>
                      <th className="border px-3 py-2">Reason</th>
                      <th className="border px-3 py-2">Status</th>
                      <th className="border px-3 py-2">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {discounts.map((discount) => (
                      <tr key={discount._id}>
                        <td className="border px-3 py-2">
                          {discount.feeTypeName}
                        </td>
                        <td className="border px-3 py-2">
                          ₦{Number(discount.discountAmount || 0).toLocaleString()}
                        </td>
                        <td className="border px-3 py-2">{discount.reason}</td>
                        <td className="border px-3 py-2">{discount.status}</td>
                        <td className="border px-3 py-2">
                          {discount.status !== "cancelled" && (
                            <button
                              onClick={() => handleCancelDiscount(discount._id)}
                              className="rounded bg-red-600 px-3 py-1 text-xs text-white"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div> */}


      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
  <button
    onClick={() => setShowPaymentModal(true)}
    className="rounded-xl bg-white p-4 text-left shadow-sm transition hover:bg-green-50"
  >
    <p className="text-sm text-gray-500">Payment History</p>
    <h2 className="mt-1 text-lg font-bold text-gray-800">
      {payments.length} payment record(s)
    </h2>
    <p className="mt-1 text-xs text-green-700">
      Tap to view receipts and void payments
    </p>
  </button>

  <button
    onClick={() => setShowDiscountModal(true)}
    className="rounded-xl bg-white p-4 text-left shadow-sm transition hover:bg-blue-50"
  >
    <p className="text-sm text-gray-500">Discount History</p>
    <h2 className="mt-1 text-lg font-bold text-gray-800">
      {discounts.length} discount record(s)
    </h2>
    <p className="mt-1 text-xs text-blue-700">
      Tap to view or cancel discounts
    </p>
  </button>
</div>


{(showPaymentModal || showDiscountModal) && (
  <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-0 sm:items-center sm:justify-center sm:p-4">
    <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:max-w-4xl sm:rounded-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            {showPaymentModal ? "Payment History" : "Discount History"}
          </h2>
          <p className="text-xs text-gray-500">
            Filter by session and term for this student.
          </p>
        </div>

        <button
          onClick={() => {
            setShowPaymentModal(false);
            setShowDiscountModal(false);
          }}
          className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
        >
          Close
        </button>
      </div>

      {/* <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <select
          value={historyFilters.sessionId}
          onChange={(e) =>
            setHistoryFilters({
              sessionId: e.target.value,
              termId: "",
            })
          }
          className="w-full rounded-lg border px-3 py-3 text-sm"
        >
          <option value="">All Sessions</option>
          {account.sessionId && (
            <option value={account.sessionId?._id || account.sessionId}>
              {account.sessionId?.name || "Current Session"}
            </option>
          )}
        </select>

        <select
          value={historyFilters.termId}
          onChange={(e) =>
            setHistoryFilters({
              ...historyFilters,
              termId: e.target.value,
            })
          }
          className="w-full rounded-lg border px-3 py-3 text-sm"
        >
          <option value="">All Terms</option>
          {account.termId && (
            <option value={account.termId?._id || account.termId}>
              {account.termId?.name || "Current Term"}
            </option>
          )}
        </select>
      </div> */}

      {showPaymentModal && (
        <div>
          {filteredPayments.length === 0 ? (
            <p className="text-sm text-gray-500">No payment found.</p>
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((payment) => (
                <div
                  key={payment._id}
                  className="rounded-xl border bg-white p-3 text-sm"
                >
                  <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="break-all font-semibold text-gray-800">
                      {payment.reference}
                    </p>
                    <span className="w-fit rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      {payment.status}
                    </span>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                    <p className="text-gray-500">Amount</p>
                    <p className="text-right font-medium">
                      ₦{Number(payment.amount || 0).toLocaleString()}
                    </p>

                    <p className="text-gray-500">Method</p>
                    <p className="text-right font-medium">
                      {payment.paymentMethod}
                    </p>

                    <p className="text-gray-500">Date</p>
                    <p className="text-right font-medium">
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/admin/fees/receipts/${payment._id}`}
                      className="flex-1 rounded bg-green-600 px-3 py-2 text-center text-xs text-white"
                    >
                      Receipt
                    </Link>

                    {payment.status !== "voided" && (
                      <button
                        onClick={() => handleVoidPayment(payment._id)}
                        className="flex-1 rounded bg-red-600 px-3 py-2 text-xs text-white"
                      >
                        Void
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showDiscountModal && (
        <div>
          {filteredDiscounts.length === 0 ? (
            <p className="text-sm text-gray-500">No discount found.</p>
          ) : (
            <div className="space-y-3">
              {filteredDiscounts.map((discount) => (
                <div
                  key={discount._id}
                  className="rounded-xl border bg-white p-3 text-sm"
                >
                  <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-gray-800">
                      {discount.feeTypeName}
                    </p>
                    <span className="w-fit rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      {discount.status}
                    </span>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                    <p className="text-gray-500">Discount</p>
                    <p className="text-right font-medium">
                      ₦{Number(discount.discountAmount || 0).toLocaleString()}
                    </p>

                    <p className="text-gray-500">Reason</p>
                    <p className="text-right font-medium">
                      {discount.reason}
                    </p>

                    <p className="text-gray-500">Date</p>
                    <p className="text-right font-medium">
                      {discount.createdAt
                        ? new Date(discount.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  {discount.status !== "cancelled" && (
                    <button
                      onClick={() => handleCancelDiscount(discount._id)}
                      className="w-full rounded bg-red-600 px-3 py-2 text-xs text-white"
                    >
                      Cancel Discount
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
)}
    </div>
  );
};

export default FeeAccountDetailsPage;