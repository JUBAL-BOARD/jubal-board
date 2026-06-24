"use client";
import { useState } from "react";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { X, BadgeCheck } from "lucide-react";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";
import { useGigDetail } from "@/app/lib/hooks/useGigDetail";
import usePageReady from "@/app/lib/hooks/usePageReady";
import WithPageTransition from "@/app/components/shared/withPageTransition";
import FadeInSection from "@/app/components/shared/fadeInSection";
import ProjectCard from "@/app/components/creative/my-gigs/projectCard";
import ClientCard from "@/app/components/creative/my-gigs/clientCard";
import DeliveryTypeSelector from "@/app/components/creative/my-gigs/deliveryTypeSelector";
import FileUploadZone from "@/app/components/creative/my-gigs/fileUploadZone";
import MilestoneSelector from "@/app/components/creative/my-gigs/milestoneSelector";
import NoteToClient from "@/app/components/creative/my-gigs/noteToClient";
import UploadActions from "@/app/components/creative/my-gigs/uploadActions";

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
  const gigId = searchParams.get("id") || (params.projectId as string);
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

  const { profile, loading: profileLoading } = useCreativeProfile();
  const { detail, loading: gigLoading, error: gigError } = useGigDetail(gigId || null);

  const isReady = usePageReady(profileLoading, gigLoading);

  if (!gigId) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <p className="text-red-500 text-lg font-semibold">Error: Project ID is missing.</p>
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

  const handleSubmit = async () => {
    if (!files.length) { setSubmitError("Please upload at least one file."); return; }
    if (!gigId) { setSubmitError("Project ID is missing."); return; }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("type", activeDelivery.value);
      formData.append("creativeNote", note);
      if (selectedMilestone) formData.append("milestoneId", selectedMilestone);

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
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10`}
        >
          <button
            className="absolute top-4 right-4 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
          <Sidebar activeItem="My Gigs" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <WithPageTransition isReady={isReady} variant="generic">
            <>
              <FadeInSection delay={0}>
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
                  <p className="text-sm text-red-500 mb-4">
                    Failed to load gig details: {gigError}
                  </p>
                )}
              </FadeInSection>

              <FadeInSection delay={80}>
                <ProjectCard
                  title={gigTitle}
                  status={gigStatus}
                  progress={progress}
                  dueIn={dueIn}
                />
              </FadeInSection>

              <FadeInSection delay={160}>
                <ClientCard clientName={clientName} clientAvatar={clientAvatar} />
              </FadeInSection>

              <FadeInSection delay={0}>
                <DeliveryTypeSelector
                  active={activeDelivery}
                  onChange={setActiveDelivery}
                />
              </FadeInSection>

              <FadeInSection delay={0}>
                <FileUploadZone
                  files={files}
                  onFilesAdded={(newFiles) => setFiles((prev) => [...prev, ...newFiles])}
                  onClear={() => setFiles([])}
                />
              </FadeInSection>

              <FadeInSection delay={0}>
                <MilestoneSelector
                  milestones={gigMilestones}
                  selected={selectedMilestone}
                  onSelect={setSelectedMilestone}
                />
              </FadeInSection>

              <FadeInSection delay={0}>
                <NoteToClient value={note} onChange={setNote} />
              </FadeInSection>

              <FadeInSection delay={0}>
                <UploadActions
                  submitting={submitting}
                  hasFiles={files.length > 0}
                  submitError={submitError}
                  onCancel={() => router.back()}
                  onSubmit={handleSubmit}
                />
              </FadeInSection>
            </>
          </WithPageTransition>
        </main>
      </div>
    </div>
  );
}