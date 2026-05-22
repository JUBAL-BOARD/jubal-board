"use client";

import { useRouter } from "next/navigation";

const paymentRows = [
  { label: "Project Amount",     value: "$100" },
  { label: "Service Fee",        value: "$15" },
  { label: "Amount Paid to you", value: "$85" },
  { label: "Payout Method",      value: "Wallet" },
  { label: "Payment Status",     value: "Payment Released", isStatus: true },
  { label: "Payment Date",       value: "21 Nov, 2025" },
  { label: "Withdrawal Status",  value: "Already withdrawn" },
  { label: "Withdrawn Date",     value: "21 Nov, 2025" },
];

// Simple barcode using SVG bars
const Barcode = () => (
  <svg viewBox="0 0 200 60" className="w-full h-16" xmlns="http://www.w3.org/2000/svg">
    {Array.from({ length: 60 }).map((_, i) => (
      <rect
        key={i}
        x={i * 3.2 + 4}
        y={0}
        width={i % 3 === 0 ? 2.5 : 1.5}
        height={i % 5 === 0 ? 60 : 50}
        fill="#111"
      />
    ))}
  </svg>
);

export default function EReceiptPage() {
  const router = useRouter();

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button
            onClick={() => router.back()}
            className="text-black hover:text-gray-700"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-black">E-Receipt</h1>
          <div className="w-5" /> {/* spacer */}
        </div>

        {/* Barcode */}
        <div className="px-6 pt-2 pb-1">
          <Barcode />
          <p className="text-center text-xs text-black mt-1 tracking-widest">#RB1025698</p>
        </div>

        {/* Divider */}
        <div className="px-6 my-3">
          <div className="border-t border-dashed border-gray-200" />
        </div>

        {/* Project info */}
        <div className="mx-6 bg-gray-50 rounded-xl px-4 py-3 mb-3">
          <p className="font-bold text-black text-sm">Logo Design for Luxury Boutique</p>
          <span className="inline-block mt-1 text-xs font-semibold text-green-500">Completed</span>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-black">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Completed on 20 Nov, 2025
          </div>
        </div>

        {/* Payment Summary */}
        <div className="mx-6 bg-gray-50 rounded-xl px-4 py-3 mb-5">
          <h2 className="text-sm font-bold text-black mb-3">Payment Summary</h2>
          <table className="w-full text-xs">
            <tbody>
              {paymentRows.map((row) => (
                <tr key={row.label} className="border-b border-gray-100 last:border-0">
                  <td className="py-1.5 text-black font-medium">{row.label}</td>
                  <td className={`py-1.5 text-right font-medium ${row.isStatus ? "text-green-500" : "text-gray-800"}`}>
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Download button */}
        <div className="px-6 pb-3">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#e84545] hover:bg-[#d03535] text-white font-bold rounded-xl transition-colors text-sm"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download PDF
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-black pb-5">
          Need help? Contact us at{" "}
          <a href="mailto:support@jubalboard.com" className="text-[#e84545]">
            support@jubalboard.com
          </a>
        </p>
      </div>
    </div>
  );
}