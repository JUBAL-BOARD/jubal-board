"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { X, ChevronDown, Check, CloudUpload, BadgeCheck, Loader2 } from "lucide-react";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";
import { useGigDetail } from "@/app/lib/hooks/useGigDetail";

const deliveryTypes = [
  { label: "Initial Delivery", value: "INITIAL" },
  { label: "Revision", value: "REVISION" },
  { label: "Final Delivery", value: "FINAL" },
];

const getDueIn = (deadline: string): string => {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "0 days 00hrs 00mins";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${days} day${days !== 1 ? "s" : ""} ${String(hours).padStart(2, "0")}hrs ${String(mins).padStart(2, "0")}mins`;
};

const getProgress = (status: string): number => {
  const map: Record<string, number> = {
    IN_PROGRESS: 60, ACTIVE: 30, PENDING_PAYMENT: 20,
    PARTIALLY_COMPLETED: 75, REVISED: 90, COLLABORATING: 50, COMPLETED: 100,
  };
  return map[status] ?? 0;
};

const apiStatusToLabel = (status: string): string => {
  const map: Record<string, string> = {
    IN_PROGRESS: "In Progress", COMPLETED: "Completed", REVISED: "Revised",
    COLLABORATING: "Collaborating", PARTIALLY_COMPLETED: "Partially Completed",
    ACTIVE: "Active", PENDING_PAYMENT: "Active",
  };
  return map[status] ?? status;
};

const progressBarColor: Record<string, string> = {
  IN_PROGRESS: "bg-[#E2554F]", COMPLETED: "bg-green-500", REVISED: "bg-yellow-400",
  COLLABORATING: "bg-green-500", PARTIALLY_COMPLETED: "bg-orange-400",
  ACTIVE: "bg-blue-500", PENDING_PAYMENT: "bg-blue-500",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#fafafa] border border-gray-200 rounded-xl mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-[#fafafa]">
        <span className="font-semibold text-black text-sm">{title}</span>
        <ChevronDown size={18} className="text-gray-500" />
      </div>
      <div className="px-5 pb-5 bg-[#fafafa]">{children}</div>
    </div>
  );
}

const CongratulationsModal: React.FC<{ onGoToDashboard: () => void }> = ({ onGoToDashboard }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-[#e2c20dff] rounded-2xl px-12 py-10 w-[80%] lg:w-[420px] flex flex-col items-center text-center shadow-2xl">
      <div className="w-[90px] h-[90px] rounded-full bg-white flex items-center justify-center mb-5">
        <BadgeCheck size={52} fill="white" stroke="#e2c20dff" />
      </div>
      <h2 className="text-[22px] font-bold text-white m-0 mb-1">Sent</h2>
      <p className="text-[14px] text-white m-0 mb-7 leading-relaxed max-w-[260px]">
        Client will check it and drop feedback.
      </p>
      <button
        onClick={onGoToDashboard}
        className="bg-white border-none rounded-lg px-8 py-2.5 cursor-pointer text-black font-semibold text-xs lg:text-[14px] hover:bg-black hover:text-white transition-colors"
      >
        Continue
      </button>
    </div>
  </div>
);

export default function UploadDeliverablesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const gigId = searchParams.get("id");
  const gigTitleFromUrl = decodeURIComponent(params.gigTitle as string);
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeDelivery, setActiveDelivery] = useState(deliveryTypes[0]);
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { profile, loading: profileLoading } = useCreativeProfile();
  const { detail, loading: gigLoading, error: gigError } = useGigDetail(gigId);

  if (profileLoading || gigLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#E2554F]" size={40} />
      </div>
    );
  }
  const gigMilestones: { id: string; title: string }[] = detail?.milestones ?? [];

  const userName = profile?.fullName || "Creative";
  const userAvatar =
    profile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  const gigTitle = detail?.title ?? gigTitleFromUrl;
  const gigStatus = detail?.status ?? "IN_PROGRESS";
  const progress = detail?.progressPercentage ?? getProgress(gigStatus);
  const dueIn = detail?.dueDate
    ? getDueIn(detail.dueDate)
    : detail?.collabDeadline
      ? getDueIn(detail.collabDeadline)
      : "No deadline";

  const clientName = detail?.clientName ?? "Unknown Client";
  const clientAvatar =
    detail?.clientAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=e84545&color=fff&size=80`;

  // Real milestones from the gig detail, fallback to empty
  
//   const [selectedMilestone, setSelectedMilestone] = useState<string | null>(
//     gigMilestones[0]?.id ?? null
//   );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFiles = () => setFiles([]);

  const handleSubmit = async () => {
    if (!files.length) {
      setSubmitError("Please upload at least one file.");
      return;
    }
    if (!gigId) {
      setSubmitError("Project ID is missing.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      const formData = new FormData();
      files.forEach((file) => formData.append("file", file));
      formData.append("type", activeDelivery.value);
      formData.append("note", note);
      if (selectedMilestone) {
        formData.append("milestoneId", selectedMilestone);
      }

      const res = await fetch(`/api/v1/projects/${gigId}/deliverables`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.message ?? "Upload failed. Please try again.");
      }

      setShowModal(true);
    } catch (err: any) {
      setSubmitError(err?.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {showModal && (
        <CongratulationsModal onGoToDashboard={() => router.push("/creative/my-gigs")} />
      )}
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
        <div className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10`}>
          <button className="absolute top-4 right-4 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
          <Sidebar activeItem="My Gigs" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb
            crumbs={[
              { label: "Dashboard", path: "/creative/dashboard" },
              { label: "My Gig", path: "/creative/my-gigs" },
              { label: gigTitle, path: `/creative/my-gigs/${encodeURIComponent(gigTitle)}` },
              { label: "Upload Deliverables" },
            ]}
          />

          <h1 className="text-2xl font-bold text-gray-900 mb-5">Upload Deliverables</h1>

          {gigError && (
            <p className="text-sm text-red-500 mb-4">Failed to load gig details: {gigError}</p>
          )}

          {/* Project card */}
          <div className="bg-[#fafafa] border border-gray-100 rounded-xl p-5 mb-4 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{gigTitle}</h2>
            <span className="inline-block px-4 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full mb-4">
              {apiStatusToLabel(gigStatus)}
            </span>
            <div className="flex w-[60%] mx-auto items-center gap-3 mb-3">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${progressBarColor[gigStatus] ?? "bg-gray-400"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-600">{progress}%</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-black">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="10" cy="10" r="8" />
                <path strokeLinecap="round" d="M10 6v4l2.5 2.5" />
              </svg>
              <span>Due in {dueIn}</span>
            </div>
          </div>

          {/* About the client */}
          <div className="bg-[#fafafa] border border-gray-100 rounded-xl p-5 mb-4">
            <h2 className="text-base font-bold text-black text-xl mb-4">About the client</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image src={clientAvatar} alt={clientName} width={56} height={56} className="rounded-full object-cover" />
                <div className="text-sm text-black">
                  <p className="font-semibold text-black text-lg mb-1">{clientName}</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#e84545] text-white text-sm font-medium rounded-lg hover:bg-[#d03535] transition-colors">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd" />
                </svg>
                Chat Client
              </button>
            </div>
          </div>

          {/* Select Deliverable Type */}
          <Section title="Select Deliverable Type">
            <div className="flex gap-3 flex-wrap">
              {deliveryTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setActiveDelivery(type)}
                  className={`px-4 py-2 rounded-3xl text-sm font-semibold border transition-colors ${
                    activeDelivery.value === type.value
                      ? "bg-[#e84545] text-white border-[#e84545]"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Upload Files */}
          <Section title="Upload Files">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="bg-white border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-gray-50 transition-colors mb-4"
            >
              <CloudUpload size={52} className="text-[#e84545] mb-3" />
              <p className="font-semibold text-gray-700 text-sm mb-1">Drag your files here or tap to upload</p>
              <p className="text-xs text-gray-400">PNG, JPG, PDF, MP4, ZIP</p>
              <p className="text-xs text-gray-400">Maximum file size 500mb. Multiple files allowed.</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept=".png,.jpg,.jpeg,.pdf,.mp4,.zip"
              />
            </div>
            {files.length > 0 && (
              <div className="border border-gray-100 rounded-xl p-4 flex items-center gap-4 relative">
                {files.map((file, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-medium">
                        {file.name.split(".").pop()?.toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={removeFiles} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </Section>

          {/* Select Milestone — only shown if milestones exist */}
          {gigMilestones.length > 0 && (
            <Section title="Select Milestone (If applicable)">
              <div className="grid grid-cols-2 gap-3">
                {gigMilestones.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMilestone(m.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors ${
                      selectedMilestone === m.id
                        ? "border-gray-300 bg-white"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-medium text-gray-700">{m.title}</span>
                    {selectedMilestone === m.id && <Check size={16} className="text-gray-600" />}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* Note to Client */}
          <Section title="Note to Client">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a short message to explain your delivery"
              className="w-full h-28 px-4 py-3 text-sm bg-white text-black placeholder-black border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 focus:border-[#e84545]/40 transition-all"
            />
          </Section>

          {/* Error */}
          {submitError && (
            <p className="text-sm text-red-500 mb-4 text-right">{submitError}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pb-10">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1c1c3a] text-white text-sm font-medium rounded-lg hover:bg-[#2a2a50] transition-colors"
            >
              <X size={15} />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || files.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#e84545] text-white text-sm font-medium rounded-lg hover:bg-[#d03535] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? "Uploading..." : "Submit Now"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}