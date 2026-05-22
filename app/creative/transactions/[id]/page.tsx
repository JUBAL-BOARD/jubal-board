"use client";

import { useState } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import { X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const briefRows = [
  { label: "Job Title",             value: "Logo Design" },
  { label: "Project Category",      value: "Digital & Visual Arts" },
  { label: "Specific Skill(s)",     value: "Graphics Designer" },
  { label: "Job Description",       value: "Create a modern, minimalist logo. Include brand colors (black & gold). Deliver in PNG, SVG, and PDF formats" },
  { label: "Set your Budget",       value: "$50–$100" },
  { label: "Attach Reference File", value: "img2345.jpeg", isFile: true },
  { label: "Timeline",              value: "3 days" },
  { label: "Delivery Date",         value: "Nov 28, 2025" },
];

const deliverables = ["3 Logo Concepts", "Final Logo in PNG, PDF, SVG", "Brand Color Palette"];

const paymentRows = [
  { label: "Project Amount",    value: "$100" },
  { label: "Service Fee",       value: "$15" },
  { label: "Amount Paid to you",value: "$85" },
  { label: "Payout Method",     value: "Wallet" },
  { label: "Payment Status",    value: "Payment Released", isStatus: true },
  { label: "Payment Date",      value: "21 Nov, 2025" },
  { label: "Withdrawal Status", value: "Already withdrawn" },
  { label: "Withdrawn Date",    value: "21 Nov, 2025" },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} viewBox="0 0 20 20" fill={s <= rating ? "#F5A623" : "#E5E7EB"} className="w-5 h-5">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function TransactionDetailPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <DashboardTopbar
        userName="Natasha John"
        userAvatar="https://i.pravatar.cc/150?img=47"
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <div className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10`}>
          <button className="absolute top-4 right-4 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
          <Sidebar activeItem="Transactions" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb crumbs={[
            { label: "Dashboard",    path: "/creative/dashboard" },
            { label: "Transactions", path: "/creative/transactions" },
            { label: "Details" },
          ]} />

          {/* Modal-style card */}
          <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="relative flex items-center justify-center px-6 pt-6 pb-4 border-b border-gray-100">
              <button
                className="absolute left-5 text-black hover:text-gray-700"
                onClick={() => window.history.back()}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-black">Transactions Details</h1>
                <p className="text-lg text-black mt-0.5">Logo Design for Luxury Boutique</p>
                <span className="inline-block mt-1 text-xs font-semibold text-green-500">Completed</span>
                <div className="flex items-center justify-center gap-1.5 mt-1 text-xs text-black">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Completed on 20 Nov, 2025
                </div>
              </div>
              <button
                className="absolute right-5 text-black hover:text-gray-600"
                onClick={() => window.history.back()}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body — two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

              {/* Left column */}
              <div className="p-6 space-y-6">
                {/* Client */}
                <div className="bg-[#fafafa] p-6">
                  <h2 className="text-base font-bold text-black mb-3">Client</h2>
                  <div className="flex items-start gap-3">
                    <Image
                      src="https://i.pravatar.cc/80?img=12"
                      alt="Charles Eden"
                      width={48}
                      height={48}
                      className="rounded-full object-cover shrink-0"
                    />
                    <div className="text-xs text-black space-y-0.5">
                      <p className="font-semibold text-sm text-black">Charles Eden</p>
                      <div className="flex items-center gap-1">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-gray-400">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>4800 Argonne Street, Aurora Denver CO.</span>
                      </div>
                      <p><span className="text-black">Language: </span>English</p>
                      <p><span className="text-black">Preferred Communication: </span>Chat only</p>
                    </div>
                  </div>
                </div>

                {/* Brief Summary */}
                <div className="bg-[#fafafa] p-6">
                  <h2 className="text-base font-bold text-black mb-3">Brief Summary</h2>
                  <table className="w-full text-xs">
                    <tbody>
                      {briefRows.map((row) => (
                        <tr key={row.label} className="border-b border-gray-50 last:border-0">
                          <td className="py-2 pr-4 text-black font-medium w-36 align-top">{row.label}</td>
                          <td className="py-2 text-black">
                            {row.isFile ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 border border-orange-200 text-orange-500 rounded text-[10px] font-medium">
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                                {row.value}
                              </span>
                            ) : row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Deliverables */}
                <div className="bg-[#fafafa] p-6">
                  <h2 className="text-base font-bold text-black mb-3">Deliverables</h2>
                  <div className="flex flex-wrap gap-2">
                    {deliverables.map((d) => (
                      <span key={d} className="px-3 py-1 border border-gray-200 rounded-lg text-xs text-gray-600 bg-gray-50">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="p-6 space-y-6">
                {/* Payment Summary */}
                <div className="bg-[#fafafa] p-6">
                  <h2 className="text-base font-bold text-black mb-3">Payment Summary</h2>
                  <table className="w-full text-xs">
                    <tbody>
                      {paymentRows.map((row) => (
                        <tr key={row.label} className="border-b border-gray-50 last:border-0">
                          <td className="py-2 text-black font-medium w-36">{row.label}</td>
                          <td className={`py-2 font-medium ${row.isStatus ? "text-green-500" : "text-gray-800"}`}>
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Feedback & Rating */}
                <div className="bg-[#fafafa] p-6">
                  <h2 className="text-base font-bold text-black mb-3">Feedback & Rating</h2>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-gray-50">
                        <td className="py-2 text-black font-medium w-36 align-top">Client Rating</td>
                        <td className="py-2">
                          <StarRating rating={4} />
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-black font-medium align-top">Review Message</td>
                        <td className="py-2 text-black">You did an outstanding job</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="w-[40%] mx-auto px-6 py-5 border-t border-gray-100">
              <button onClick={() => router.push(`/creative/transactions/${id}/e-receipt`)} className="w-full py-3 bg-[#e84545] hover:bg-[#d03535] text-white font-semibold rounded-xl transition-colors text-sm">
                View E-Receipt
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}