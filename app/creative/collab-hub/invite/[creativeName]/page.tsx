"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import { useParams, useRouter } from "next/navigation";
import { Loader2, X, ChevronDown } from "lucide-react";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";

const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="#F5A623" className="w-4 h-4">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

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

const deliverables = ["3 Logo Concepts", "Final Logo in PNG, PDF, SVG", "Brand Color Palette", "Font Recommendations"];
const timelineOptions = ["Less than 24 hours", "1–2 days", "3–5 days", "1 week", "2 weeks"];
const feeOptions = ["$100", "$150", "$200", "$250", "Custom"];
const workModeOptions = ["Virtual", "On-site", "Hybrid"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#fafafa] p-6 mb-4 border border-gray-100">
      <h2 className="text-base font-bold text-[#1c1c3a] mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default function CollaborationBriefPage() {
  const params = useParams();
  const router = useRouter();

  // The route should be something like /creative/collab-hub/invite/[creativeName]/[creativeId]
  // or you can pass creativeId as a separate param. Adjust based on your actual route structure.
  const creativeName = decodeURIComponent(params.creativeName as string);
  const creativeId = params.creativeId as string; // <-- ADD this param to your route

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [timeline, setTimeline] = useState("Less than 24 hours");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [fee, setFee] = useState("$100");
  const [workMode, setWorkMode] = useState("Virtual");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { profile: creativeProfile, loading: profileLoading, error } = useCreativeProfile();

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={48} className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Error loading profile: {error}</p>
      </div>
    );
  }

  const userName = creativeProfile?.fullName || "Creative";
  const userAvatar =
    creativeProfile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  // ─── SEND INVITE ───────────────────────────────────────────────────────────
  async function handleSendInvite() {
    // Basic validation
    if (!role.trim()) {
      setSendError("Please enter a role.");
      return;
    }
    if (!description.trim()) {
      setSendError("Please enter a description.");
      return;
    }
    if (!deliveryDate) {
      setSendError("Please select a delivery date.");
      return;
    }

    setSendError(null);
    setSending(true);

    console.log("1. Building invite payload");

    try {
      const token = localStorage.getItem("accessToken");

      // If the endpoint needs a file, use FormData instead of JSON.
      // For now sending JSON — swap to FormData below if the backend needs it.
      const payload: Record<string, unknown> = {
        invitedCreativeId: creativeId,   // the creative being invited
        role,
        description,
        timeline,
        deliveryDate,
        fee,
        workMode,
      };

      console.log("2. Payload ready:", payload);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/collabs/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("3. Response status:", res.status);

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        console.log("4. Error response body:", errData);
        throw new Error(errData?.message || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      console.log("5. Success:", data);

      // Navigate to responses page after successful invite
      router.push("/creative/collab-hub/responses");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      console.log("6. Caught error:", message);
      setSendError(message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <DashboardTopbar
        userName={userName}
        userAvatar={userAvatar}
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
          <Sidebar activeItem="Collab Hub" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb crumbs={[
            { label: "Dashboard",  path: "/creative/dashboard" },
            { label: "Collab Hub", path: "/creative/collab-hub" },
            { label: "Invite Creative" },
          ]} />

          {/* Title + View Responses */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-bold text-black">Collaboration Brief</h1>
            <button onClick={() => router.push("/creative/collab-hub/responses")} className="flex items-center gap-2 px-4 py-2 bg-[#e84545] hover:bg-[#d03535] text-white text-sm font-semibold rounded-lg transition-colors">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              View Responses
            </button>
          </div>

          {/* Selected Creative */}
          <div className="bg-[#fafafa] p-6 mb-4 border border-gray-100">
            <h2 className="text-xl font-bold text-black mb-4">Selected Creative</h2>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <Image
                    src="https://i.pravatar.cc/80?img=12"
                    alt={creativeName}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div>
                  <p className="font-semibold text-black text-2xl">{creativeName}</p>
                  <p className="text-xs text-green-500 font-medium mt-0.5">● Online</p>
                  <p className="text-sm text-black mt-2">Verification Status:</p>
                  <span className="inline-block mt-1 px-3 py-0.5 bg-green-100 text-green-600 text-xs font-semibold rounded-full">
                    Verified
                  </span>
                </div>
              </div>
              <span className="px-4 py-1.5 bg-orange-400 text-white text-xs font-semibold rounded-md">Premium</span>
            </div>
            <div className="flex items-center gap-8 mt-4 pt-4 text-sm text-black">
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

          {/* Brief Summary */}
          <Section title="Brief Summary">
            <table className="w-full text-sm">
              <tbody>
                {briefRows.map((row) => (
                  <tr key={row.label} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-6 text-black font-medium w-44 align-top">{row.label}</td>
                    <td className="py-3 text-[#1c1c3a]">
                      {row.isFile ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 text-orange-500 rounded text-xs font-medium">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
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
          </Section>

          {/* Brief */}
          <Section title="Brief">
            {/* Role */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-1.5">Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Type here"
                className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 focus:border-[#e84545]/40 transition-all"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you'll need help with"
                className="w-full h-32 px-4 py-3 text-sm bg-white text-black placeholder-black border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 focus:border-[#e84545]/40 transition-all"
              />
            </div>

            {/* Deliverables */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">Deliverables</label>
              <div className="flex flex-wrap gap-2">
                {deliverables.map((d) => (
                  <span key={d} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-black bg-white">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Delivery Schedule */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">Delivery Schedule</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 font-medium mb-1.5">Timeline</label>
                  <div className="relative">
                    <select
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 text-sm bg-white text-black border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 pr-8 cursor-pointer"
                    >
                      {timelineOptions.map((o) => <option key={o}>{o}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <ChevronDown size={14} className="text-black" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-black font-medium mb-1.5">Delivery Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm text-black border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 pr-9"
                    />
                    <div className="pointer-events-none text-black absolute inset-y-0 right-3 flex items-center">
                      <CalendarIcon />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Proposed Collaboration Fee */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-1.5">Proposed Collaboration Fee</label>
              <div className="relative">
                <select
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 pr-9 cursor-pointer"
                >
                  {feeOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <ChevronDown size={14} className="text-black" />
                </div>
              </div>
            </div>

            {/* Work Mode */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-1.5">Work Mode</label>
              <div className="relative">
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 text-sm text-black border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 pr-9 cursor-pointer"
                >
                  {workModeOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <ChevronDown size={14} className="text-black" />
                </div>
              </div>
            </div>

            {/* Attach Reference File */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Attach Reference File (Optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg w-fit">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-orange-500 font-medium">{file.name}</span>
                  <button onClick={() => setFile(null)} className="text-orange-400 hover:text-orange-600">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#e84545] hover:bg-[#d03535] text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Upload
                </button>
              )}
            </div>
          </Section>

          {/* Error message */}
          {sendError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {sendError}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pb-10">
            <button
              onClick={() => router.back()}
              disabled={sending}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1c1c3a] text-white text-sm font-medium rounded-lg hover:bg-[#2a2a50] transition-colors disabled:opacity-50"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Cancel
            </button>
            <button
              onClick={handleSendInvite}
              disabled={sending}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#e84545] text-white text-sm font-medium rounded-lg hover:bg-[#d03535] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending && <Loader2 size={14} className="animate-spin" />}
              {sending ? "Sending..." : "Send Now"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}