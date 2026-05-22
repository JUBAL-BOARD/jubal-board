"use client";

import { useState } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/client/my-desk/breadcrumb";
import { useParams, useRouter } from "next/navigation";
import { BadgeCheck, X } from "lucide-react";

const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="#F5A623" className="w-4 h-4">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ChevronDown = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const deliverables = ["3 Logo Concepts", "Final Logo in PNG, PDF, SVG", "Brand Color Palette", "Font Recommendations"];
const timelineOptions = ["Less than 24 hours", "1–2 days", "3–5 days", "1 week", "2 weeks"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#fafafa] p-5 mb-4 border border-gray-100">
      <h2 className="text-base font-bold text-[#1c1c3a] mb-4">{title}</h2>
      {children}
    </div>
  );
}

// ── Congratulations Modal ───────────────────────────────────────────────────
const CongratulationsModal: React.FC<{ onGoToDashboard: () => void }> = ({ onGoToDashboard }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-[#7832beff] rounded-2xl px-12 py-10 w-[80%] lg:w-[420px] flex flex-col items-center text-center shadow-2xl">

            {/* Icon */}
            <div className="w-[90px] h-[90px] rounded-full bg-white flex items-center justify-center mb-5">
                <BadgeCheck size={52} fill="white" stroke="#7832beff" />
            </div>

            {/* Text */}
            <h2 className="text-[22px] font-bold text-white m-0 mb-1">
                Great Choice
            </h2> 
            <p className="text-[14px] text-white m-0 mb-7 leading-relaxed max-w-[260px]">
                Review your order details and fund your Escrow to start the project.
            </p>

            {/* Button */}
            <button
                onClick={onGoToDashboard}
                className="bg-white border-none rounded-lg px-8 py-2.5 cursor-pointer text-black font-semibold text-xs lg:text-[14px] hover:bg-black hover:text-white transition-colors"
            >
                Review Order
            </button>

        </div>
    </div>
);

export default function CreativePitchPage() {
  const params = useParams();
  const creativeName = decodeURIComponent(params.creativeName as string);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeline, setTimeline] = useState("Less than 24 hours");
  const [milestone1, setMilestone1] = useState("Less than 24 hours");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [milestone2Date, setMilestone2Date] = useState("");
  const [pricing, setPricing] = useState("$100");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Congratulations Modal */}
      {showModal && (
        <CongratulationsModal onGoToDashboard={() => router.push(`/client/explore-skills/creative-pitch/${encodeURIComponent(creativeName)}/order-review`)} />
      )}

      <DashboardTopbar
        userName="Charles Eden"
        userAvatar="https://i.pravatar.cc/150?img=33"
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 relative">

        {/* Dark overlay — mobile only, shows when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — slides in on mobile, always visible on desktop */}
        <div
          className={`
            fixed top-0 left-0 h-full z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10
          `}
        >
          {/* Close button inside sidebar on mobile */}
          <button
            className="absolute top-4 right-4 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>

          <Sidebar activeItem="Hire A Pro" />
        </div>

        {/* Main content — full width, no margin offset needed */}
        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb crumbs={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "Hire a Pro", path: "/client/explore-skills" },
            { label: "Creative Pitch", },
            { label: creativeName },
          ]} />

          <h1 className="text-2xl font-bold text-gray-900 mb-5">Creative Pitch</h1>

          {/* Creative profile card */}
          <div className="bg-[#fafafa] p-6 mb-4 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
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
                  <p className="font-semibold text-black text-base">{creativeName}</p>
                  <p className="text-xs text-green-500 font-medium mt-0.5">● Online</p>
                  <p className="text-sm text-black mt-2">Verification Status:</p>
                  <span className="inline-block mt-1 px-3 py-0.5 bg-green-100 text-green-600 text-xs font-semibold rounded-full">
                    Verified
                  </span>
                </div>
              </div>
              <span className="px-4 py-1.5 bg-orange-400 text-white text-xs font-semibold rounded-md">Premium</span>
            </div>
            <div className="flex items-center gap-8 mt-4 pt-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <StarIcon />
                <span className="font-medium text-black">5.0</span>
                <span className="text-black">(35 Reviews)</span>
              </div>
              <div>
                <span className="font-medium text-black">12</span>{" "}
                <span className="text-black">Completed Projects</span>
              </div>
              <div>
                <span className="font-medium text-black">100%</span>{" "}
                <span className="text-black">Job Success</span>
              </div>
            </div>
          </div>

          {/* Pitch Point — read only */}
          <Section title="Pitch Point">
            <div className="w-full min-h-[120px] px-4 py-3 text-sm text-gray-600 border border-gray-200 rounded-lg bg-white">
              Hi! I can design a modern minimalist logo with 3 unique concepts.
              I will follow your brand colors and deliver all formats.
            </div>
          </Section>

          {/* Deliverables */}
          <Section title="Deliverables">
            <div className="flex flex-wrap gap-2">
              {deliverables.map((d) => (
                <span key={d} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white">
                  {d}
                </span>
              ))}
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Pricing">
            <div className="relative">
              <select
                value={pricing}
                onChange={(e) => setPricing(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 pr-9 cursor-pointer"
              >
                <option>$100</option>
                <option>$75</option>
                <option>$50</option>
                <option>Custom</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <ChevronDown />
              </div>
            </div>
          </Section>

          {/* Delivery Schedule */}
          <Section title="Delivery Schedule">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 font-medium mb-1.5">Timeline</label>
                <div className="relative">
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 pr-8 cursor-pointer"
                  >
                    {timelineOptions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <ChevronDown />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-medium mb-1.5">Delivery Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 pr-9"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <CalendarIcon />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-medium mb-1.5">Milestone 1 (Optional)</label>
                <div className="relative">
                  <select
                    value={milestone1}
                    onChange={(e) => setMilestone1(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 pr-8 cursor-pointer"
                  >
                    {timelineOptions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <ChevronDown />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-medium mb-1.5">Milestone 2 (Optional)</label>
                <div className="relative">
                  <input
                    type="date"
                    value={milestone2Date}
                    onChange={(e) => setMilestone2Date(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 pr-9"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <CalendarIcon />
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pb-10">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-[#1c1c3a] text-white text-sm font-medium rounded-lg hover:bg-[#2a2a50] transition-colors">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Cancel
            </button>
            <button onClick={() => setShowModal(true)} className="px-6 py-2.5 bg-[#e84545] text-white text-sm font-medium rounded-lg hover:bg-[#d03535] transition-colors">
              Hire Now
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}