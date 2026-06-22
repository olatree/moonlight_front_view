import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../../api/axios";

const FeeReceiptPage = () => {
  const { paymentId } = useParams();

  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");

  const fetchPayment = async () => {
    try {
      const res = await api.get(`/fees/payments/${paymentId}`);
      setPayment(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load receipt");
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [paymentId]);

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!payment) {
    return <div className="p-6 text-gray-500">Loading receipt...</div>;
  }

  const account = payment.feeAccountId;

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:bg-white">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow print:shadow-none">
        <div className="mb-6 flex justify-between print:hidden">
          <Link
            to={`/admin/fees/accounts/${account?._id}`}
            className="rounded bg-gray-200 px-4 py-2 text-sm"
          >
            Back
          </Link>

          <button
            onClick={() => window.print()}
            className="rounded bg-green-600 px-4 py-2 text-sm text-white"
          >
            Print Receipt
          </button>
        </div>

        <div className="border-b pb-4 text-center">
          <h1 className="text-2xl font-bold uppercase text-gray-900">
            DORCAS MEMORIAL SCHOOLS
          </h1>
          <p className="text-sm text-gray-600">
            Official School Fee Payment Receipt
          </p>
        </div>

        <div className="mt-6 grid gap-4 text-sm md:grid-cols-2">
          <div>
            <p>
              <strong>Receipt No:</strong> {payment.reference}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(payment.createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Payment Method:</strong> {payment.paymentMethod}
            </p>
          </div>

          <div>
            <p>
              <strong>Received By:</strong> {payment.receivedBy?.name}
            </p>
            <p>
              <strong>Status:</strong> {payment.status}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border p-4 text-sm">
          <h2 className="mb-3 font-bold text-gray-800">Student Details</h2>

          <p>
            <strong>Name:</strong> {payment.studentId?.name}
          </p>
          <p>
            <strong>Admission No:</strong>{" "}
            {payment.studentId?.admissionNumber}
          </p>
          <p>
            <strong>Class:</strong> {account?.classId?.name}{" "}
            {account?.armId?.name}
          </p>
          <p>
            <strong>Session:</strong> {payment.sessionId?.name}
          </p>
          <p>
            <strong>Term:</strong> {payment.termId?.name}
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border text-sm">
            <tbody>
              <tr>
                <td className="border px-4 py-3 font-semibold">
                  Previous Balance
                </td>
                <td className="border px-4 py-3 text-right">
                  ₦{Number(account?.previousBalance || 0).toLocaleString()}
                </td>
              </tr>

              <tr>
                <td className="border px-4 py-3 font-semibold">
                  Original Term Fees
                </td>
                <td className="border px-4 py-3 text-right">
                  ₦{Number(account?.totalAmount || 0).toLocaleString()}
                </td>
              </tr>

              <tr>
                <td className="border px-4 py-3 font-semibold">
                  Total Discount
                </td>
                <td className="border px-4 py-3 text-right">
                  ₦{Number(account?.totalDiscount || 0).toLocaleString()}
                </td>
              </tr>

              <tr>
                <td className="border px-4 py-3 font-semibold">
                  Net Payable
                </td>
                <td className="border px-4 py-3 text-right">
                  ₦{Number(account?.netPayable || 0).toLocaleString()}
                </td>
              </tr>

              <tr>
                <td className="border px-4 py-3 font-semibold">
                  Amount Paid Now
                </td>
                <td className="border px-4 py-3 text-right font-bold text-green-700">
                  ₦{Number(payment.amount || 0).toLocaleString()}
                </td>
              </tr>

              <tr>
                <td className="border px-4 py-3 font-semibold">
                  Total Paid So Far
                </td>
                <td className="border px-4 py-3 text-right">
                  ₦{Number(account?.totalPaid || 0).toLocaleString()}
                </td>
              </tr>

              <tr>
                <td className="border px-4 py-3 font-semibold">
                  Balance
                </td>
                <td className="border px-4 py-3 text-right font-bold text-red-700">
                  ₦{Number(account?.totalDue || 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {payment.note && (
          <div className="mt-6 text-sm">
            <strong>Note:</strong> {payment.note}
          </div>
        )}

        <div className="mt-12 flex justify-between text-sm">
          <div>
            <div className="mb-1 w-40 border-t border-gray-700"></div>
            <p>Received By</p>
          </div>

          <div>
            <div className="mb-1 w-40 border-t border-gray-700"></div>
            <p>Parent/Guardian</p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          This receipt was generated electronically.
        </p>
      </div>
    </div>
  );
};

export default FeeReceiptPage;