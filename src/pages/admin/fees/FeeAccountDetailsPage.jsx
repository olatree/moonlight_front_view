// // src/pages/admin/fees/FeeAccountDetailsPage.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import api from "../../../api/axios";

// const formatMoney = (value) => `₦${Number(value || 0).toLocaleString()}`;

// const statusClass = (status) => {
//   switch (status) {
//     case "paid":
//       return "bg-green-100 text-green-700";
//     case "part_payment":
//       return "bg-yellow-100 text-yellow-700";
//     case "overpaid":
//       return "bg-purple-100 text-purple-700";
//     default:
//       return "bg-red-100 text-red-700";
//   }
// };

// const formatStatus = (status) =>
//   (status || "unpaid").replace("_", " ").toUpperCase();

// const FeeAccountDetailsPage = () => {
//   const { id } = useParams();

//   const [account, setAccount] = useState(null);
//   const [payments, setPayments] = useState([]);
//   const [discounts, setDiscounts] = useState([]);

//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [showDiscountModal, setShowDiscountModal] = useState(false);
//   const [showPaymentHistory, setShowPaymentHistory] = useState(false);
//   const [showDiscountHistory, setShowDiscountHistory] = useState(false);

//   const [paymentForm, setPaymentForm] = useState({
//     amount: "",
//     paymentMethod: "cash",
//     note: "",
//   });

//   const [discountForm, setDiscountForm] = useState({
//     feeItemId: "",
//     discountType: "fixed",
//     value: "",
//     reason: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [savingPayment, setSavingPayment] = useState(false);
//   const [savingDiscount, setSavingDiscount] = useState(false);
//   // FIX #6: individual loading states for void/cancel to prevent double-clicks
//   const [voidingId, setVoidingId] = useState(null);
//   const [cancellingId, setCancellingId] = useState(null);

//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   const fetchAccount = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const res = await api.get(`/fees/accounts/${id}`);
//       const feeAccount = res.data.data;

//       setAccount(feeAccount);

//       const [paymentsRes, discountsRes] = await Promise.all([
//         api.get("/fees/payments", { params: { feeAccountId: id } }),
//         api.get("/fees/discounts", { params: { feeAccountId: id } }),
//       ]);

//       setPayments(paymentsRes.data.data || []);
//       setDiscounts(discountsRes.data.data || []);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to load fee account");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAccount();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   const paymentProgress = useMemo(() => {
//     const netPayable = Number(account?.netPayable || 0);
//     const totalPaid = Number(account?.totalPaid || 0);

//     if (netPayable <= 0) return 0;

//     return Math.min(Math.round((totalPaid / netPayable) * 100), 100);
//   }, [account]);

//   const feeBreakdownTotals = useMemo(() => {
//     const fees = account?.fees || [];

//     const feeAmount = fees.reduce(
//       (sum, fee) => sum + Number(fee.amount || 0),
//       0
//     );

//     const discount = fees.reduce(
//       (sum, fee) => sum + Number(fee.discount || 0),
//       0
//     );

//     const paid = fees.reduce((sum, fee) => sum + Number(fee.paid || 0), 0);

//     const balance = fees.reduce((sum, fee) => sum + Number(fee.due || 0), 0);

//     const previousBalance = Number(account?.previousBalance || 0);

//     return {
//       feeAmount,
//       discount,
//       paid,
//       balance,
//       previousBalance,
//       // totalDue already represents the current actual balance
//       totalBalance: Number(account?.totalDue || balance + previousBalance),
//     };
//   }, [account]);

//   const remainingAfterPayment = useMemo(() => {
//     const due = Number(account?.totalDue || 0);
//     const paying = Number(paymentForm.amount || 0);
//     // FIX #8: return raw difference so we can detect overpayment in UI
//     return due - paying;
//   }, [account, paymentForm.amount]);

//   // FIX #5: clear stale messages when opening any modal
//   const openModal = (openFn) => {
//     setMessage("");
//     setError("");
//     openFn(true);
//   };

//   // FIX #7: reset forms when closing modals
//   const closeAllModals = () => {
//     setShowPaymentModal(false);
//     setShowDiscountModal(false);
//     setShowPaymentHistory(false);
//     setShowDiscountHistory(false);
//     setPaymentForm({ amount: "", paymentMethod: "cash", note: "" });
//     setDiscountForm({ feeItemId: "", discountType: "fixed", value: "", reason: "" });
//   };

//   const handleRecordPayment = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setError("");

//     // FIX #1: guard against zero or negative amounts
//     if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
//       setError("Enter a valid payment amount");
//       return;
//     }

//     try {
//       setSavingPayment(true);

//       await api.post("/fees/payments", {
//         feeAccountId: id,
//         amount: Number(paymentForm.amount),
//         paymentMethod: paymentForm.paymentMethod,
//         note: paymentForm.note,
//       });

//       setMessage("Payment recorded successfully");
//       setPaymentForm({ amount: "", paymentMethod: "cash", note: "" });
//       setShowPaymentModal(false);
//       fetchAccount();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to record payment");
//     } finally {
//       setSavingPayment(false);
//     }
//   };

//   const handleApplyDiscount = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setError("");

//     if (
//       !discountForm.feeItemId ||
//       !discountForm.value ||
//       Number(discountForm.value) <= 0 ||
//       !discountForm.reason
//     ) {
//       setError("Select fee item, enter value and reason");
//       return;
//     }

//     try {
//       setSavingDiscount(true);

//       await api.post("/fees/discounts", {
//         feeAccountId: id,
//         feeItemId: discountForm.feeItemId,
//         discountType: discountForm.discountType,
//         value: Number(discountForm.value),
//         reason: discountForm.reason,
//       });

//       setMessage("Discount applied successfully");
//       setDiscountForm({ feeItemId: "", discountType: "fixed", value: "", reason: "" });
//       setShowDiscountModal(false);
//       fetchAccount();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to apply discount");
//     } finally {
//       setSavingDiscount(false);
//     }
//   };

//   // FIX #6: track voidingId to disable the specific button being processed
//   const handleVoidPayment = async (paymentId) => {
//     if (!window.confirm("Void this payment? This will reverse the balance.")) {
//       return;
//     }

//     try {
//       setVoidingId(paymentId);
//       await api.patch(`/fees/payments/${paymentId}/void`);
//       setMessage("Payment voided successfully");
//       fetchAccount();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to void payment");
//     } finally {
//       setVoidingId(null);
//     }
//   };

//   // FIX #6: track cancellingId to disable the specific button being processed
//   const handleCancelDiscount = async (discountId) => {
//     if (!window.confirm("Cancel this discount?")) return;

//     try {
//       setCancellingId(discountId);
//       await api.patch(`/fees/discounts/${discountId}/cancel`);
//       setMessage("Discount cancelled successfully");
//       fetchAccount();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to cancel discount");
//     } finally {
//       setCancellingId(null);
//     }
//   };

//   if (loading) {
//     return <div className="p-4 text-sm text-gray-500">Loading...</div>;
//   }

//   if (!account) {
//     return (
//       <div className="p-4">
//         <p className="mb-3 text-sm text-red-600">Fee account not found.</p>
//         <Link
//           to="/admin/fees/accounts"
//           className="text-sm text-green-700 underline"
//         >
//           Back to fee accounts
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
//       <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
//             Student Fee Account
//           </h1>
//           <p className="text-xs text-gray-500 sm:text-sm">
//             Financial summary, payments, discounts and fee breakdown.
//           </p>
//         </div>

//         <Link
//           to="/admin/fees/accounts"
//           className="inline-flex w-full justify-center rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 sm:w-auto"
//         >
//           Back
//         </Link>
//       </div>

//       {message && (
//         <div className="mb-4 rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700">
//           {message}
//         </div>
//       )}

//       {error && (
//         <div className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
//         <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//           <div>
//             <h2 className="text-lg font-bold text-gray-900">
//               {account.studentId?.name}
//             </h2>

//             <p className="text-sm text-gray-500">
//               {account.studentId?.admissionNumber} • {account.classId?.name}{" "}
//               {account.armId?.name}
//             </p>

//             <p className="mt-1 text-xs text-gray-500">
//               {account.sessionId?.name} • {account.termId?.name}
//             </p>
//           </div>

//           <span
//             className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusClass(
//               account.status
//             )}`}
//           >
//             {formatStatus(account.status)}
//           </span>
//         </div>

//         <div className="mt-5">
//           <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
//             <span>Payment Progress</span>
//             <span>{paymentProgress}%</span>
//           </div>

//           <div className="h-3 overflow-hidden rounded-full bg-gray-200">
//             <div
//               className="h-full rounded-full bg-green-600"
//               style={{ width: `${paymentProgress}%` }}
//             />
//           </div>
//         </div>
//       </div>

//       <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-6">
//         {/* 1. Current term fee = sum of all fee item amounts before discount */}
//         <div className="rounded-xl bg-blue-50 p-4 shadow-sm">
//           <p className="text-xs text-blue-700">Current Term Fee</p>
//           <h3 className="mt-1 text-lg font-bold text-blue-800">
//             {formatMoney(feeBreakdownTotals.feeAmount)}
//           </h3>
//         </div>

//         {/* 2. Previous balance carried forward from last term */}
//         <div className="rounded-xl bg-orange-50 p-4 shadow-sm">
//           <p className="text-xs text-orange-700">Previous Balance</p>
//           <h3 className="mt-1 text-lg font-bold text-orange-800">
//             {formatMoney(account.previousBalance)}
//           </h3>
//         </div>

//         {/* 3. Total discounts applied this term */}
//         <div className="rounded-xl bg-yellow-50 p-4 shadow-sm">
//           <p className="text-xs text-yellow-700">Discounts</p>
//           <h3 className="mt-1 text-lg font-bold text-yellow-800">
//             {formatMoney(account.totalDiscount)}
//           </h3>
//         </div>

//         {/* 4. Net payable = term fee + previous balance - discounts */}
//         <div className="rounded-xl bg-purple-50 p-4 shadow-sm">
//           <p className="text-xs text-purple-700">Net Payable</p>
//           <h3 className="mt-1 text-lg font-bold text-purple-800">
//             {formatMoney(account.netPayable)}
//           </h3>
//         </div>

//         {/* 5. Total paid so far this term */}
//         <div className="rounded-xl bg-green-50 p-4 shadow-sm">
//           <p className="text-xs text-green-700">Total Paid</p>
//           <h3 className="mt-1 text-lg font-bold text-green-800">
//             {formatMoney(account.totalPaid)}
//           </h3>
//         </div>

//         {/* 6. Current total balance = net payable - total paid */}
//         <div className="rounded-xl bg-gray-900 p-4 shadow-sm">
//           <p className="text-xs text-gray-200">Current Total Balance</p>
//           <h3 className="mt-1 text-lg font-bold text-white">
//             {formatMoney(account.totalDue)}
//           </h3>
//         </div>
//       </div>

//       <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
//         {/* FIX #5: clear stale messages on open */}
//         <button
//           onClick={() => openModal(setShowPaymentModal)}
//           className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
//         >
//           Record Payment
//         </button>

//         <button
//           onClick={() => openModal(setShowDiscountModal)}
//           className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
//         >
//           Apply Discount
//         </button>

//         <button
//           onClick={() => openModal(setShowPaymentHistory)}
//           className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-green-50"
//         >
//           Payment History
//         </button>

//         <button
//           onClick={() => openModal(setShowDiscountHistory)}
//           className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-blue-50"
//         >
//           Discount History
//         </button>

//         <button
//           onClick={() => window.print()}
//           className="rounded-xl bg-gray-800 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black"
//         >
//           Print Statement
//         </button>
//       </div>

//       <div className="rounded-xl bg-white p-4 shadow-sm">
//         <h2 className="mb-4 text-base font-semibold text-gray-700">
//           Fee Breakdown
//         </h2>

//         {/* Mobile card view */}
//         <div className="space-y-3 md:hidden">
//           {account.fees?.map((fee) => (
//             <div key={fee._id} className="rounded-lg border bg-white p-3 text-sm">
//               <div className="mb-2 font-semibold text-gray-800">
//                 {fee.feeTypeName}
//               </div>

//               <div className="grid grid-cols-2 gap-2 text-xs">
//                 <p className="text-gray-500">Amount</p>
//                 <p className="text-right font-medium">
//                   {formatMoney(fee.amount)}
//                 </p>

//                 <p className="text-gray-500">Discount</p>
//                 <p className="text-right font-medium">
//                   {formatMoney(fee.discount)}
//                 </p>

//                 <p className="text-gray-500">Paid</p>
//                 <p className="text-right font-medium text-green-700">
//                   {formatMoney(fee.paid)}
//                 </p>

//                 <p className="text-gray-500">Balance</p>
//                 <p className="text-right font-medium text-red-700">
//                   {formatMoney(fee.due)}
//                 </p>
//               </div>
//             </div>
//           ))}

//           {/* Previous balance row */}
//           {feeBreakdownTotals.previousBalance > 0 && (
//             <div className="rounded-lg border bg-orange-50 p-3 text-sm">
//               <div className="mb-1 font-semibold text-orange-800">
//                 Previous Balance (Carried Forward)
//               </div>
//               <div className="grid grid-cols-2 gap-2 text-xs">
//                 <p className="text-gray-500">Amount</p>
//                 <p className="text-right font-medium">—</p>

//                 <p className="text-gray-500">Discount</p>
//                 <p className="text-right font-medium">—</p>

//                 <p className="text-gray-500">Paid</p>
//                 <p className="text-right font-medium">—</p>

//                 <p className="text-gray-500">Balance</p>
//                 <p className="text-right font-bold text-orange-700">
//                   {formatMoney(feeBreakdownTotals.previousBalance)}
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Totals summary card */}
//           <div className="rounded-lg border bg-gray-100 p-3 text-sm font-semibold">
//             <div className="mb-1 text-gray-700">Totals</div>
//             <div className="grid grid-cols-2 gap-2 text-xs">
//               <p className="text-gray-500">Term Fee</p>
//               <p className="text-right font-bold text-gray-800">
//                 {formatMoney(feeBreakdownTotals.feeAmount)}
//               </p>

//               <p className="text-gray-500">Discount</p>
//               <p className="text-right font-bold text-yellow-700">
//                 {formatMoney(feeBreakdownTotals.discount)}
//               </p>

//               <p className="text-gray-500">Paid</p>
//               <p className="text-right font-bold text-green-700">
//                 {formatMoney(feeBreakdownTotals.paid)}
//               </p>

//               <p className="text-gray-500">Total Balance</p>
//               <p className="text-right font-bold text-red-700">
//                 {formatMoney(feeBreakdownTotals.totalBalance)}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Desktop table view */}
//         <div className="hidden overflow-x-auto md:block">
//           <table className="min-w-full border text-sm">
//             <thead className="bg-gray-100 text-left">
//               <tr>
//                 <th className="border px-3 py-2">Fee Item</th>
//                 <th className="border px-3 py-2 text-right">Amount</th>
//                 <th className="border px-3 py-2 text-right">Discount</th>
//                 <th className="border px-3 py-2 text-right">Paid</th>
//                 <th className="border px-3 py-2 text-right">Balance</th>
//               </tr>
//             </thead>

//             <tbody>
//               {account.fees?.map((fee) => (
//                 <tr key={fee._id} className="hover:bg-gray-50">
//                   <td className="border px-3 py-2">{fee.feeTypeName}</td>
//                   <td className="border px-3 py-2 text-right">
//                     {formatMoney(fee.amount)}
//                   </td>
//                   <td className="border px-3 py-2 text-right text-yellow-700">
//                     {formatMoney(fee.discount)}
//                   </td>
//                   <td className="border px-3 py-2 text-right text-green-700">
//                     {formatMoney(fee.paid)}
//                   </td>
//                   <td className="border px-3 py-2 text-right text-red-700">
//                     {formatMoney(fee.due)}
//                   </td>
//                 </tr>
//               ))}

//               {/* Previous balance row — only balance column is meaningful */}
//               {feeBreakdownTotals.previousBalance > 0 && (
//                 <tr className="bg-orange-50 italic">
//                   <td className="border px-3 py-2 font-medium text-orange-800">
//                     Previous Balance (Carried Forward)
//                   </td>
//                   <td className="border px-3 py-2 text-center text-gray-400">—</td>
//                   <td className="border px-3 py-2 text-center text-gray-400">—</td>
//                   <td className="border px-3 py-2 text-center text-gray-400">—</td>
//                   <td className="border px-3 py-2 text-right font-bold text-orange-700">
//                     {formatMoney(feeBreakdownTotals.previousBalance)}
//                   </td>
//                 </tr>
//               )}

//               {/* Totals row */}
//               <tr className="bg-gray-100 font-bold">
//                 <td className="border px-3 py-2">Total</td>
//                 <td className="border px-3 py-2 text-right">
//                   {formatMoney(feeBreakdownTotals.feeAmount)}
//                 </td>
//                 <td className="border px-3 py-2 text-right text-yellow-700">
//                   {formatMoney(feeBreakdownTotals.discount)}
//                 </td>
//                 <td className="border px-3 py-2 text-right text-green-700">
//                   {formatMoney(feeBreakdownTotals.paid)}
//                 </td>
//                 <td className="border px-3 py-2 text-right text-red-700">
//                   {formatMoney(feeBreakdownTotals.totalBalance)}
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Record Payment Modal */}
//       {showPaymentModal && (
//         <Modal title="Record Payment" onClose={closeAllModals}>
//           {/* FIX #2: explicit type="submit" on button */}
//           <form onSubmit={handleRecordPayment} className="space-y-3">
//             <div className="rounded-lg bg-red-50 p-3 text-sm">
//               <p className="text-red-700">Current Outstanding</p>
//               <p className="text-xl font-bold text-red-800">
//                 {formatMoney(account.totalDue)}
//               </p>
//             </div>

//             {/* FIX #1: min="0" prevents negative input at the browser level */}
//             <input
//               type="number"
//               min="0"
//               value={paymentForm.amount}
//               onChange={(e) =>
//                 setPaymentForm({ ...paymentForm, amount: e.target.value })
//               }
//               placeholder="Amount paid"
//               className="w-full rounded-lg border px-3 py-3 text-sm"
//             />

//             {/* FIX #8: show overpayment warning when amount exceeds balance */}
//             <div
//               className={`rounded-lg p-3 text-sm ${
//                 remainingAfterPayment < 0
//                   ? "bg-purple-50"
//                   : "bg-green-50"
//               }`}
//             >
//               {remainingAfterPayment < 0 ? (
//                 <>
//                   <p className="text-purple-700">Overpayment</p>
//                   <p className="text-xl font-bold text-purple-800">
//                     +{formatMoney(Math.abs(remainingAfterPayment))}
//                   </p>
//                 </>
//               ) : (
//                 <>
//                   <p className="text-green-700">Balance After Payment</p>
//                   <p className="text-xl font-bold text-green-800">
//                     {formatMoney(remainingAfterPayment)}
//                   </p>
//                 </>
//               )}
//             </div>

//             <select
//               value={paymentForm.paymentMethod}
//               onChange={(e) =>
//                 setPaymentForm({
//                   ...paymentForm,
//                   paymentMethod: e.target.value,
//                 })
//               }
//               className="w-full rounded-lg border px-3 py-3 text-sm"
//             >
//               <option value="cash">Cash</option>
//               <option value="bank_transfer">Bank Transfer</option>
//               <option value="pos">POS</option>
//               <option value="online">Online</option>
//               <option value="cheque">Cheque</option>
//             </select>

//             <textarea
//               value={paymentForm.note}
//               onChange={(e) =>
//                 setPaymentForm({ ...paymentForm, note: e.target.value })
//               }
//               placeholder="Optional note"
//               rows="3"
//               className="w-full rounded-lg border px-3 py-3 text-sm"
//             />

//             {/* FIX #2: explicit type="submit" */}
//             <button
//               type="submit"
//               disabled={savingPayment}
//               className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
//             >
//               {savingPayment ? "Saving..." : "Record Payment"}
//             </button>
//           </form>
//         </Modal>
//       )}

//       {/* Apply Discount Modal */}
//       {showDiscountModal && (
//         <Modal title="Apply Discount" onClose={closeAllModals}>
//           {/* FIX #2: explicit type="submit" on button */}
//           <form onSubmit={handleApplyDiscount} className="space-y-3">
//             <select
//               value={discountForm.feeItemId}
//               onChange={(e) =>
//                 setDiscountForm({
//                   ...discountForm,
//                   feeItemId: e.target.value,
//                 })
//               }
//               className="w-full rounded-lg border px-3 py-3 text-sm"
//             >
//               <option value="">Select fee item</option>
//               {account.fees?.map((fee) => (
//                 <option key={fee._id} value={fee._id}>
//                   {fee.feeTypeName} - {formatMoney(fee.amount)}
//                 </option>
//               ))}
//             </select>

//             <select
//               value={discountForm.discountType}
//               onChange={(e) =>
//                 setDiscountForm({
//                   ...discountForm,
//                   discountType: e.target.value,
//                 })
//               }
//               className="w-full rounded-lg border px-3 py-3 text-sm"
//             >
//               <option value="fixed">Fixed Amount</option>
//               <option value="percentage">Percentage</option>
//             </select>

//             {/* FIX #1: min="0" prevents negative discount values */}
//             <input
//               type="number"
//               min="0"
//               value={discountForm.value}
//               onChange={(e) =>
//                 setDiscountForm({ ...discountForm, value: e.target.value })
//               }
//               placeholder={
//                 discountForm.discountType === "percentage"
//                   ? "Percentage e.g. 20"
//                   : "Amount e.g. 10000"
//               }
//               className="w-full rounded-lg border px-3 py-3 text-sm"
//             />

//             <textarea
//               value={discountForm.reason}
//               onChange={(e) =>
//                 setDiscountForm({ ...discountForm, reason: e.target.value })
//               }
//               placeholder="Reason for discount"
//               rows="3"
//               className="w-full rounded-lg border px-3 py-3 text-sm"
//             />

//             {/* FIX #2: explicit type="submit" */}
//             <button
//               type="submit"
//               disabled={savingDiscount}
//               className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
//             >
//               {savingDiscount ? "Saving..." : "Apply Discount"}
//             </button>
//           </form>
//         </Modal>
//       )}

//       {/* Payment History Modal */}
//       {showPaymentHistory && (
//         <Modal title="Payment History" onClose={closeAllModals} wide>
//           {payments.length === 0 ? (
//             <p className="text-sm text-gray-500">No payment found.</p>
//           ) : (
//             <div className="space-y-3">
//               {payments.map((payment) => (
//                 <div key={payment._id} className="rounded-xl border p-3 text-sm">
//                   <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
//                     <p className="break-all font-semibold text-gray-800">
//                       {payment.reference}
//                     </p>
//                     <span className="w-fit rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
//                       {payment.status}
//                     </span>
//                   </div>

//                   <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
//                     <p className="text-gray-500">Amount</p>
//                     <p className="text-right font-medium">
//                       {formatMoney(payment.amount)}
//                     </p>

//                     <p className="text-gray-500">Method</p>
//                     <p className="text-right font-medium">
//                       {payment.paymentMethod}
//                     </p>

//                     <p className="text-gray-500">Date</p>
//                     <p className="text-right font-medium">
//                       {payment.createdAt
//                         ? new Date(payment.createdAt).toLocaleDateString()
//                         : "N/A"}
//                     </p>
//                   </div>

//                   <div className="flex gap-2">
//                     <Link
//                       to={`/admin/fees/receipts/${payment._id}`}
//                       className="flex-1 rounded bg-green-600 px-3 py-2 text-center text-xs text-white"
//                     >
//                       Receipt
//                     </Link>

//                     {payment.status !== "voided" && (
//                       /* FIX #6: disable void button while this specific payment is being voided */
//                       <button
//                         onClick={() => handleVoidPayment(payment._id)}
//                         disabled={voidingId === payment._id}
//                         className="flex-1 rounded bg-red-600 px-3 py-2 text-xs text-white disabled:opacity-60"
//                       >
//                         {voidingId === payment._id ? "Voiding..." : "Void"}
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </Modal>
//       )}

//       {/* Discount History Modal */}
//       {showDiscountHistory && (
//         <Modal title="Discount History" onClose={closeAllModals} wide>
//           {discounts.length === 0 ? (
//             <p className="text-sm text-gray-500">No discount found.</p>
//           ) : (
//             <div className="space-y-3">
//               {discounts.map((discount) => (
//                 <div key={discount._id} className="rounded-xl border p-3 text-sm">
//                   <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
//                     <p className="font-semibold text-gray-800">
//                       {discount.feeTypeName}
//                     </p>
//                     <span className="w-fit rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
//                       {discount.status}
//                     </span>
//                   </div>

//                   <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
//                     <p className="text-gray-500">Discount</p>
//                     <p className="text-right font-medium">
//                       {formatMoney(discount.discountAmount)}
//                     </p>

//                     <p className="text-gray-500">Reason</p>
//                     <p className="text-right font-medium">{discount.reason}</p>

//                     <p className="text-gray-500">Date</p>
//                     <p className="text-right font-medium">
//                       {discount.createdAt
//                         ? new Date(discount.createdAt).toLocaleDateString()
//                         : "N/A"}
//                     </p>
//                   </div>

//                   {discount.status !== "cancelled" && (
//                     /* FIX #6: disable cancel button while this specific discount is being cancelled */
//                     <button
//                       onClick={() => handleCancelDiscount(discount._id)}
//                       disabled={cancellingId === discount._id}
//                       className="w-full rounded bg-red-600 px-3 py-2 text-xs text-white disabled:opacity-60"
//                     >
//                       {cancellingId === discount._id
//                         ? "Cancelling..."
//                         : "Cancel Discount"}
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </Modal>
//       )}
//     </div>
//   );
// };

// const Modal = ({ title, children, onClose, wide = false }) => {
//   return (
//     <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-0 sm:items-center sm:justify-center sm:p-4">
//       <div
//         className={`max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl ${
//           wide ? "sm:max-w-4xl" : "sm:max-w-lg"
//         }`}
//       >
//         <div className="mb-4 flex items-center justify-between gap-3">
//           <h2 className="text-lg font-bold text-gray-800">{title}</h2>

//           <button
//             type="button"
//             onClick={onClose}
//             className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
//           >
//             Close
//           </button>
//         </div>

//         {children}
//       </div>
//     </div>
//   );
// };

// export default FeeAccountDetailsPage;

// src/pages/admin/fees/FeeAccountDetailsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../../api/axios";

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

const formatStatus = (status) =>
  (status || "unpaid").replace("_", " ").toUpperCase();

const FeeAccountDetailsPage = () => {
  const { id } = useParams();

  const [account, setAccount] = useState(null);
  const [payments, setPayments] = useState([]);
  const [discounts, setDiscounts] = useState([]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showDiscountHistory, setShowDiscountHistory] = useState(false);

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
  const [voidingId, setVoidingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchAccount = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/fees/accounts/${id}`);
      setAccount(res.data.data);

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

  const totals = useMemo(() => {
    const fees = account?.fees || [];

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

    const previousBalance = Number(account?.previousBalance || 0);
    const previousBalancePaid = Number(account?.previousBalancePaid || 0);
    const previousBalanceDue = Math.max(
      previousBalance - previousBalancePaid,
      0
    );

    const totalPayable = Number(account?.netPayable || 0);
    const totalPaid = Number(account?.totalPaid || 0);
    const totalDue = Number(account?.totalDue || 0);

    return {
      currentTermAmount,
      currentTermDiscount,
      currentTermNet,
      currentTermPaid,
      currentTermDue,
      previousBalance,
      previousBalancePaid,
      previousBalanceDue,
      totalPayable,
      totalPaid,
      totalDue,
    };
  }, [account]);

  const paymentProgress = useMemo(() => {
    if (!totals.totalPayable) return 0;
    return Math.min(
      Math.round((totals.totalPaid / totals.totalPayable) * 100),
      100
    );
  }, [totals]);

  const remainingAfterPayment = useMemo(() => {
    return Number(account?.totalDue || 0) - Number(paymentForm.amount || 0);
  }, [account, paymentForm.amount]);

  const openModal = (setter) => {
    setMessage("");
    setError("");
    setter(true);
  };

  const closeAllModals = () => {
    setShowPaymentModal(false);
    setShowDiscountModal(false);
    setShowPaymentHistory(false);
    setShowDiscountHistory(false);

    setPaymentForm({
      amount: "",
      paymentMethod: "cash",
      note: "",
    });

    setDiscountForm({
      feeItemId: "",
      discountType: "fixed",
      value: "",
      reason: "",
    });
  };

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
      closeAllModals();
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
      closeAllModals();
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
      setVoidingId(paymentId);
      await api.patch(`/fees/payments/${paymentId}/void`);
      setMessage("Payment voided successfully");
      fetchAccount();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to void payment");
    } finally {
      setVoidingId(null);
    }
  };

  const handleCancelDiscount = async (discountId) => {
    if (!window.confirm("Cancel this discount?")) return;

    try {
      setCancellingId(discountId);
      await api.patch(`/fees/discounts/${discountId}/cancel`);
      setMessage("Discount cancelled successfully");
      fetchAccount();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel discount");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading...</div>;
  }

  if (!account) {
    return (
      <div className="p-4">
        <p className="mb-3 text-sm text-red-600">Fee account not found.</p>
        <Link
          to="/admin/fees/accounts"
          className="text-sm text-green-700 underline"
        >
          Back to fee accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Student Financial Statement
          </h1>
          <p className="text-xs text-gray-500 sm:text-sm">
            Current term charges, carry-forward balance, payments and discounts.
          </p>
        </div>

        <Link
          to="/admin/fees/accounts"
          className="inline-flex justify-center rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700"
        >
          Back
        </Link>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700 print:hidden">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 print:hidden">
          {error}
        </div>
      )}

      <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {account.studentId?.name}
            </h2>
            <p className="text-sm text-gray-500">
              {account.studentId?.admissionNumber} • {account.classId?.name}{" "}
              {account.armId?.name}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {account.sessionId?.name} • {account.termId?.name}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusClass(
              account.status
            )}`}
          >
            {formatStatus(account.status)}
          </span>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span>Payment Progress</span>
            <span>
              {formatMoney(totals.totalPaid)} paid of{" "}
              {formatMoney(totals.totalPayable)} ({paymentProgress}%)
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-green-600"
              style={{ width: `${paymentProgress}%` }}
            />
          </div>
        </div>
      </section>

      <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <SummaryCard
          label="Current Term Net"
          value={formatMoney(totals.currentTermNet)}
          className="bg-blue-50 text-blue-800"
        />
        <SummaryCard
          label="Carry Forward"
          value={formatMoney(totals.previousBalance)}
          className="bg-orange-50 text-orange-800"
        />
        <SummaryCard
          label="Total Payable"
          value={formatMoney(totals.totalPayable)}
          className="bg-purple-50 text-purple-800"
        />
        <SummaryCard
          label="Total Paid"
          value={formatMoney(totals.totalPaid)}
          className="bg-green-50 text-green-800"
        />
        <SummaryCard
          label="Outstanding"
          value={formatMoney(totals.totalDue)}
          className="bg-red-50 text-red-800"
        />
        <SummaryCard
          label="Status"
          value={formatStatus(account.status)}
          className="bg-gray-900 text-white"
        />
      </section>

      <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5 print:hidden">
        <button
          onClick={() => openModal(setShowPaymentModal)}
          className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
        >
          Record Payment
        </button>

        <button
          onClick={() => openModal(setShowDiscountModal)}
          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Apply Discount
        </button>

        <button
          onClick={() => openModal(setShowPaymentHistory)}
          className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-green-50"
        >
          Payment History
        </button>

        <button
          onClick={() => openModal(setShowDiscountHistory)}
          className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-blue-50"
        >
          Discount History
        </button>

        <button
          onClick={() => window.print()}
          className="rounded-xl bg-gray-800 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black"
        >
          Print Statement
        </button>
      </section>

      <section className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800">
          Current Term Charges
        </h2>

        <div className="space-y-3 md:hidden">
          {account.fees?.map((fee) => (
            <FeeCard key={fee._id} fee={fee} />
          ))}

          <FeeCard
            fee={{
              feeTypeName: "TOTAL",
              amount: totals.currentTermAmount,
              discount: totals.currentTermDiscount,
              netAmount: totals.currentTermNet,
              paid: totals.currentTermPaid,
              due: totals.currentTermDue,
            }}
            total
          />
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-3 py-2">Fee Item</th>
                <th className="border px-3 py-2 text-right">Amount</th>
                <th className="border px-3 py-2 text-right">Discount</th>
                <th className="border px-3 py-2 text-right">Net Fee</th>
                <th className="border px-3 py-2 text-right">Paid</th>
                <th className="border px-3 py-2 text-right">Balance</th>
              </tr>
            </thead>

            <tbody>
              {account.fees?.map((fee) => (
                <tr key={fee._id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{fee.feeTypeName}</td>
                  <td className="border px-3 py-2 text-right">
                    {formatMoney(fee.amount)}
                  </td>
                  <td className="border px-3 py-2 text-right text-yellow-700">
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

              <tr className="bg-gray-100 font-bold">
                <td className="border px-3 py-2">Total</td>
                <td className="border px-3 py-2 text-right">
                  {formatMoney(totals.currentTermAmount)}
                </td>
                <td className="border px-3 py-2 text-right text-yellow-700">
                  {formatMoney(totals.currentTermDiscount)}
                </td>
                <td className="border px-3 py-2 text-right">
                  {formatMoney(totals.currentTermNet)}
                </td>
                <td className="border px-3 py-2 text-right text-green-700">
                  {formatMoney(totals.currentTermPaid)}
                </td>
                <td className="border px-3 py-2 text-right text-red-700">
                  {formatMoney(totals.currentTermDue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-800">
            Carry Forward Balance
          </h2>

          <InfoRow label="Previous Balance" value={totals.previousBalance} />
          <InfoRow
            label="Paid Towards Old Debt"
            value={totals.previousBalancePaid}
            green
          />
          <InfoRow
            label="Outstanding Old Debt"
            value={totals.previousBalanceDue}
            red
          />
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-800">
            Financial Summary
          </h2>

          <InfoRow label="Current Term Charges" value={totals.currentTermAmount} />
          <InfoRow label="Discounts" value={totals.currentTermDiscount} />
          <InfoRow label="Current Term Net" value={totals.currentTermNet} />
          <InfoRow label="Carry Forward" value={totals.previousBalance} />
          <div className="my-2 border-t" />
          <InfoRow label="Total Payable" value={totals.totalPayable} bold />
          <InfoRow label="Payments Received" value={totals.totalPaid} green bold />
          <InfoRow label="Current Balance" value={totals.totalDue} red bold />
        </div>
      </section>

      <section className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800">
          Recent Payment Allocation
        </h2>

        {payments.length === 0 ? (
          <p className="text-sm text-gray-500">No payments recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {payments.slice(0, 3).map((payment) => (
              <PaymentAllocationCard
                key={payment._id}
                payment={payment}
                onVoid={handleVoidPayment}
                voidingId={voidingId}
              />
            ))}
          </div>
        )}
      </section>

      {showPaymentModal && (
        <Modal title="Record Payment" onClose={closeAllModals}>
          <form onSubmit={handleRecordPayment} className="space-y-3">
            <div className="rounded-lg bg-red-50 p-3 text-sm">
              <p className="text-red-700">Current Outstanding</p>
              <p className="text-xl font-bold text-red-800">
                {formatMoney(account.totalDue)}
              </p>
            </div>

            <input
              type="number"
              min="0"
              value={paymentForm.amount}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, amount: e.target.value })
              }
              placeholder="Amount paid"
              className="w-full rounded-lg border px-3 py-3 text-sm"
            />

            <div
              className={`rounded-lg p-3 text-sm ${
                remainingAfterPayment < 0 ? "bg-purple-50" : "bg-green-50"
              }`}
            >
              {remainingAfterPayment < 0 ? (
                <>
                  <p className="text-purple-700">Overpayment</p>
                  <p className="text-xl font-bold text-purple-800">
                    +{formatMoney(Math.abs(remainingAfterPayment))}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-green-700">Balance After Payment</p>
                  <p className="text-xl font-bold text-green-800">
                    {formatMoney(remainingAfterPayment)}
                  </p>
                </>
              )}
            </div>

            <select
              value={paymentForm.paymentMethod}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  paymentMethod: e.target.value,
                })
              }
              className="w-full rounded-lg border px-3 py-3 text-sm"
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
              rows="3"
              className="w-full rounded-lg border px-3 py-3 text-sm"
            />

            <button
              type="submit"
              disabled={savingPayment}
              className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {savingPayment ? "Saving..." : "Record Payment"}
            </button>
          </form>
        </Modal>
      )}

      {showDiscountModal && (
        <Modal title="Apply Discount" onClose={closeAllModals}>
          <form onSubmit={handleApplyDiscount} className="space-y-3">
            <select
              value={discountForm.feeItemId}
              onChange={(e) =>
                setDiscountForm({
                  ...discountForm,
                  feeItemId: e.target.value,
                })
              }
              className="w-full rounded-lg border px-3 py-3 text-sm"
            >
              <option value="">Select fee item</option>
              {account.fees?.map((fee) => (
                <option key={fee._id} value={fee._id}>
                  {fee.feeTypeName} - {formatMoney(fee.amount)}
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
              className="w-full rounded-lg border px-3 py-3 text-sm"
            >
              <option value="fixed">Fixed Amount</option>
              <option value="percentage">Percentage</option>
            </select>

            <input
              type="number"
              min="0"
              value={discountForm.value}
              onChange={(e) =>
                setDiscountForm({ ...discountForm, value: e.target.value })
              }
              placeholder={
                discountForm.discountType === "percentage"
                  ? "Percentage e.g. 20"
                  : "Amount e.g. 10000"
              }
              className="w-full rounded-lg border px-3 py-3 text-sm"
            />

            <textarea
              value={discountForm.reason}
              onChange={(e) =>
                setDiscountForm({ ...discountForm, reason: e.target.value })
              }
              placeholder="Reason for discount"
              rows="3"
              className="w-full rounded-lg border px-3 py-3 text-sm"
            />

            <button
              type="submit"
              disabled={savingDiscount}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {savingDiscount ? "Saving..." : "Apply Discount"}
            </button>
          </form>
        </Modal>
      )}

      {showPaymentHistory && (
        <Modal title="Payment History" onClose={closeAllModals} wide>
          {payments.length === 0 ? (
            <p className="text-sm text-gray-500">No payment found.</p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <PaymentAllocationCard
                  key={payment._id}
                  payment={payment}
                  onVoid={handleVoidPayment}
                  voidingId={voidingId}
                  showReceipt
                />
              ))}
            </div>
          )}
        </Modal>
      )}

      {showDiscountHistory && (
        <Modal title="Discount History" onClose={closeAllModals} wide>
          {discounts.length === 0 ? (
            <p className="text-sm text-gray-500">No discount found.</p>
          ) : (
            <div className="space-y-3">
              {discounts.map((discount) => (
                <div key={discount._id} className="rounded-xl border p-3 text-sm">
                  <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-gray-800">
                      {discount.feeTypeName}
                    </p>
                    <span className="w-fit rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      {discount.status}
                    </span>
                  </div>

                  <InfoRow
                    label="Discount"
                    value={discount.discountAmount}
                    green
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    Reason: {discount.reason}
                  </div>

                  {discount.status !== "cancelled" && (
                    <button
                      onClick={() => handleCancelDiscount(discount._id)}
                      disabled={cancellingId === discount._id}
                      className="mt-3 w-full rounded bg-red-600 px-3 py-2 text-xs text-white disabled:opacity-60"
                    >
                      {cancellingId === discount._id
                        ? "Cancelling..."
                        : "Cancel Discount"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, className }) => (
  <div className={`rounded-xl p-4 shadow-sm ${className}`}>
    <p className="text-xs opacity-80">{label}</p>
    <h3 className="mt-1 text-lg font-bold">{value}</h3>
  </div>
);

const FeeCard = ({ fee, total = false }) => (
  <div
    className={`rounded-lg border p-3 text-sm ${
      total ? "bg-gray-100 font-bold" : "bg-white"
    }`}
  >
    <div className="mb-2 font-semibold text-gray-800">{fee.feeTypeName}</div>

    <div className="grid grid-cols-2 gap-2 text-xs">
      <p className="text-gray-500">Amount</p>
      <p className="text-right font-medium">{formatMoney(fee.amount)}</p>

      <p className="text-gray-500">Discount</p>
      <p className="text-right font-medium text-yellow-700">
        {formatMoney(fee.discount)}
      </p>

      <p className="text-gray-500">Net Fee</p>
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

const InfoRow = ({ label, value, green, red, bold }) => (
  <div
    className={`flex items-center justify-between py-2 text-sm ${
      bold ? "font-bold" : ""
    }`}
  >
    <span className="text-gray-500">{label}</span>
    <span
      className={`${
        green ? "text-green-700" : red ? "text-red-700" : "text-gray-800"
      }`}
    >
      {formatMoney(value)}
    </span>
  </div>
);

const PaymentAllocationCard = ({
  payment,
  onVoid,
  voidingId,
  showReceipt = false,
}) => (
  <div className="rounded-xl border p-3 text-sm">
    <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="break-all font-semibold text-gray-800">
          {payment.reference}
        </p>
        <p className="text-xs text-gray-500">
          {payment.createdAt
            ? new Date(payment.createdAt).toLocaleDateString()
            : "N/A"}{" "}
          • {payment.paymentMethod}
        </p>
      </div>

      <span className="w-fit rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
        {payment.status}
      </span>
    </div>

    <InfoRow label="Amount Received" value={payment.amount} bold />
    <InfoRow
      label="Paid to Previous Balance"
      value={payment.previousBalancePaid}
      green
    />
    <InfoRow
      label="Paid to Current Term"
      value={payment.currentTermPaid}
      green
    />

    <div className="mt-3 flex gap-2">
      {showReceipt && (
        <Link
          to={`/admin/fees/receipts/${payment._id}`}
          className="flex-1 rounded bg-green-600 px-3 py-2 text-center text-xs text-white"
        >
          Receipt
        </Link>
      )}

      {payment.status !== "voided" && (
        <button
          onClick={() => onVoid(payment._id)}
          disabled={voidingId === payment._id}
          className="flex-1 rounded bg-red-600 px-3 py-2 text-xs text-white disabled:opacity-60"
        >
          {voidingId === payment._id ? "Voiding..." : "Void"}
        </button>
      )}
    </div>
  </div>
);

const Modal = ({ title, children, onClose, wide = false }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-0 sm:items-center sm:justify-center sm:p-4">
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl ${
          wide ? "sm:max-w-4xl" : "sm:max-w-lg"
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
          >
            Close
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default FeeAccountDetailsPage;