"use client";

import { useState } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/client/my-desk/breadcrumb";
import { useParams } from "next/navigation";
import { X } from "lucide-react";

const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="#F5A623" className="w-4 h-4">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const briefRows = [
  { label: "Job Title",              value: "Logo Design" },
  { label: "Project Category",       value: "Digital & Visual Arts" },
  { label: "Specific Skill(s)",      value: "Graphics Designer" },
  { label: "Job Description",        value: "Create a modern, minimalist logo. Include brand colors (black & gold). Deliver in PNG, SVG, and PDF formats" },
  { label: "Set your Budget",        value: "$50–$100" },
  { label: "Attach Reference File",  value: "img2345.jpeg", isFile: true },
  { label: "Timeline",               value: "3 days" },
  { label: "Delivery Date",          value: "Nov 28, 2025" },
];

const deliverables = ["3 Logo Concepts", "Final Logo in PNG, PDF, SVG", "Brand Color Palette", "Font Recommendations"];

const pricingRows = [
  { label: "Pitched Amount",  value: "$100",  bold: false },
  { label: "Service Charge",  value: "$15",   bold: false },
  { label: "Total Amount",    value: "$115",  bold: true  },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#fafafa] p-6 mb-4 border border-gray-100">
      <h2 className="text-base font-bold text-[#1c1c3a] mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default function OrderReviewPage() {
  const params = useParams();
  const creativeName = decodeURIComponent(params.creativeName as string);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <DashboardTopbar
        userName="Charles Eden"
        userAvatar="https://i.pravatar.cc/150?img=33"
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
          <Sidebar activeItem="Hire a Pro" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb crumbs={[
            { label: "Dashboard",      path: "/client/dashboard" },
            { label: "Hire a Pro",     path: "/client/explore-skills" },
            { label: "Creative Pitch", path: -1 as any },
            { label: "Order Review" },
          ]} />

          <h1 className="text-2xl font-bold text-gray-900 mb-5">Order Review</h1>

          {/* Brief Summary */}
          <Section title="Brief Summary">
            <table className="w-full text-sm">
              <tbody>
                {briefRows.map((row) => (
                  <tr key={row.label} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-6 text-gray-400 font-medium w-44 align-top">{row.label}</td>
                    <td className="py-3 text-[#1c1c3a]">
                      {row.isFile ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 text-orange-500 rounded text-xs font-medium">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          {row.value}
                        </span>
                      ) : (
                        row.value
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Creative */}
          <div className="bg-[#fafafa] p-6 mb-4 border border-gray-100">
            <div className="flex items-start justify-between">
              <h2 className="text-base font-bold text-[#1c1c3a]">Creative</h2>
              <span className="px-4 py-1.5 bg-orange-400 text-white text-xs font-semibold rounded-md">Premium</span>
            </div>
            <div className="flex items-start gap-4 mt-4">
              <div className="relative shrink-0">
                <Image
                  src="https://i.pravatar.cc/80?img=47"
                  alt={creativeName}
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
                <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <p className="font-semibold text-[#1c1c3a] text-base">{creativeName}</p>
                <p className="text-xs text-green-500 font-medium mt-0.5">● Online</p>
                <p className="text-xs text-gray-400 mt-2">Verification Status:</p>
                <span className="inline-block mt-1 px-3 py-0.5 bg-green-100 text-green-600 text-xs font-semibold rounded-full">
                  Verified
                </span>
              </div>
            </div>
            <div className="flex items-center gap-8 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <StarIcon />
                <span className="font-medium text-[#1c1c3a]">5.0</span>
                <span className="text-gray-400">(35 Reviews)</span>
              </div>
              <div>
                <span className="font-medium text-[#1c1c3a]">12</span>{" "}
                <span className="text-gray-400">Completed Projects</span>
              </div>
              <div>
                <span className="font-medium text-[#1c1c3a]">100%</span>{" "}
                <span className="text-gray-400">Job Success</span>
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <Section title="Deliverables">
            <div className="flex flex-wrap gap-2">
              {deliverables.map((d) => (
                <span key={d} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-gray-50">
                  {d}
                </span>
              ))}
            </div>
          </Section>

          {/* Pricing Breakdown */}
          <Section title="Pricing Breakdown">
            <table className="w-full text-sm">
              <tbody>
                {pricingRows.map((row) => (
                  <tr key={row.label} className="border-b border-gray-50 last:border-0">
                    <td className={`py-3 ${row.bold ? "font-bold text-[#1c1c3a]" : "text-gray-500"}`}>
                      {row.label}
                    </td>
                    <td className={`py-3 text-right ${row.bold ? "font-bold text-[#1c1c3a]" : "text-gray-700"}`}>
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pb-10">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-[#1c1c3a] text-white text-sm font-medium rounded-lg hover:bg-[#2a2a50] transition-colors">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Cancel
            </button>
            <button className="px-6 py-2.5 bg-[#e84545] text-white text-sm font-medium rounded-lg hover:bg-[#d03535] transition-colors">
              Continue
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}