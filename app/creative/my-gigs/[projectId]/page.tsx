"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import { useParams } from "next/navigation";
import { X } from "lucide-react";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";
import { useGigDetail } from "@/app/lib/hooks/useGigDetail";
import usePageReady from "@/app/lib/hooks/usePageReady";
import WithPageTransition from "@/app/components/shared/withPageTransition";
import FadeInSection from "@/app/components/shared/fadeInSection";

import InviteToCollaborateModal from "@/app/components/creative/my-gigs/project-detail/inviteToCollaborateModal";
import ProjectTabBar from "@/app/components/creative/my-gigs/project-detail/projectTabBar";
import ViewProjectTab from "@/app/components/creative/my-gigs/project-detail/viewProjectTab";
import ReviewDeliverablesTab from "@/app/components/creative/my-gigs/project-detail/reviewDeliverablesTab";
import { formatDate } from "@/app/components/creative/my-gigs/project-detail/utils";
import type {
  Deliverable,
  CreativeProfile,
  BriefDetail,
} from "@/app/components/creative/my-gigs/project-detail/types";

export default function CreativeViewProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"view" | "review">("view");
  const [showCollaborateModal, setShowCollaborateModal] = useState(false);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [deliverablesLoading, setDeliverablesLoading] = useState(false);
  const [clientProfile, setClientProfile] = useState<CreativeProfile | null>(null);
  const [clientProfileLoading, setClientProfileLoading] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [briefDetail, setBriefDetail] = useState<BriefDetail | null>(null);

  const { profile, loading: profileLoading } = useCreativeProfile();
  const { detail, loading: gigLoading } = useGigDetail(projectId);

  const isReady = usePageReady(profileLoading, gigLoading);

  const getAuthToken = async () => {
    const tokenRes = await fetch("/api/auth/session/token");
    const { token } = await tokenRes.json();
    return token;
  };

  const fetchDeliverables = async (token: string) => {
    setDeliverablesLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const types = ["INITIAL", "REVISION", "FINAL"];
      const regularResults = await Promise.all(
        types.map((type) =>
          fetch(`/api/v1/projects/${projectId}/deliverables?type=${type}`, {
            headers,
            credentials: "include",
          }).then((r) => (r.ok ? r.json() : { data: [] }))
        )
      );
      const regularDeliverables: Deliverable[] = regularResults.flatMap((r) => r.data ?? []);

      const briefsRes = await fetch(`/api/v1/collabs/project/${projectId}/briefs`, {
        headers,
        credentials: "include",
      });

      let collabDeliverables: Deliverable[] = [];
      if (briefsRes.ok) {
        const briefsJson = await briefsRes.json();
        const briefs = Array.isArray(briefsJson.data) ? briefsJson.data : [];
        const collabIds: string[] = briefs
          .flatMap((b: any) => b.collaborations ?? [])
          .filter((c: any) => c.status === "ACCEPTED")
          .map((c: any) => c.id);

        const collabResults = await Promise.all(
          collabIds.map((collabId) =>
            fetch(`/api/v1/collabs/${collabId}/deliverables`, {
              headers,
              credentials: "include",
            }).then((r) => (r.ok ? r.json() : { data: [] }))
          )
        );

        collabDeliverables = collabResults.flatMap((r) =>
          (r.data ?? []).map((d: any) => ({
            id: d.id,
            projectId: d.projectId,
            type: d.deliverableType ?? d.type,
            fileName: d.fileName,
            fileUrl: d.signedUrl ?? d.fileUrl,
            fileSize: d.fileSize ?? 0,
            mimeType: d.mimeType ?? "",
            uploadedAt: d.createdAt,
            creativeNote: d.creativeNote,
            reviewStatus: d.reviewStatus,
            collabId: d.collaborationId,
            isCollabDeliverable: true,
          }))
        );
      }

      setDeliverables([...regularDeliverables, ...collabDeliverables]);
    } catch {
      // fail silently
    } finally {
      setDeliverablesLoading(false);
    }
  };

 useEffect(() => {
  if (!detail) return;

  const fetchExtras = async () => {
    const token = await getAuthToken();
    await fetchDeliverables(token);

    if (!detail.briefId) return;
    setClientProfileLoading(true);
    try {
      const briefRes = await fetch(`/api/v1/briefs/${detail.briefId}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!briefRes.ok) return;
      const briefJson = await briefRes.json();
      const brief = briefJson.data ?? briefJson;

      if (brief.client) {
        setClientProfile({
          fullName: brief.client.name,
          name: brief.client.name,
          avatarUrl: brief.client.imageUrl ?? brief.client.avatarUrl,
          imageUrl: brief.client.imageUrl ?? brief.client.avatarUrl,
          overallRating: brief.client.rating,
          isVerified: brief.client.isVerified,
          isPremium: false,
        });
      }

      const skillsRaw = brief.specificSkills ?? brief.skills ?? brief.requiredSkills ?? [];
      const specificSkills = Array.isArray(skillsRaw)
        ? skillsRaw.map((s: any) => s.name ?? s).join(", ")
        : skillsRaw ?? "—";

      setBriefDetail({
        jobTitle: brief.jobTitle ?? "—",
        jobDescription: brief.jobDescription ?? "—",
        specificSkills: specificSkills || "—",
        timeline: brief.timeline ?? "—",
        deliveryDate: brief.deliveryDate ?? null,   // 👈 this line
      });
    } catch {
      // fail silently
    } finally {
      setClientProfileLoading(false);
    }
  };

  fetchExtras();
}, [detail]);

  const handleInviteSubmit = async (email: string, message: string) => {
    setActionSubmitting(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/v1/projects/${projectId}/invite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, message }),
      });
      if (!res.ok) throw new Error("Failed to send invite");
      setShowCollaborateModal(false);
    } catch {
      // fail silently
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  const handleReviewDeliverable = async (
    collabId: string,
    deliverableId: string,
    status: "APPROVED" | "REVISION_REQUESTED"
  ) => {
    try {
      const token = await getAuthToken();
      const res = await fetch(
        `/api/v1/collabs/${collabId}/deliverables/${deliverableId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) throw new Error("Failed to update deliverable status");
      const token2 = await getAuthToken();
      await fetchDeliverables(token2);
    } catch {
      // fail silently
    }
  };

  const userName = profile?.fullName ?? "Creative";
  const userAvatar =
    profile?.avatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  const clientName = clientProfile?.fullName ?? clientProfile?.name ?? "Client";
  const clientAvatar =
    clientProfile?.imageUrl ??
    clientProfile?.avatarUrl ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=e84545&color=fff&size=128`;
  const clientRole = "Client";

  const briefRows = [
    { label: "Job Title", value: briefDetail?.jobTitle ?? "—" },
    { label: "Specific Skills", value: briefDetail?.specificSkills ?? "—" },
    { label: "Job Description", value: briefDetail?.jobDescription ?? "—" },
    { label: "Timeline", value: briefDetail?.timeline ?? "—" },
    { label: "Delivery Date", value: formatDate(briefDetail?.deliveryDate) },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {showCollaborateModal && (
        <InviteToCollaborateModal
          onClose={() => setShowCollaborateModal(false)}
          onSubmit={handleInviteSubmit}
          projectTitle={detail?.title ?? "—"}
          submitting={actionSubmitting}
        />
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
          className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10`}
        >
          <button
            className="absolute top-4 right-4 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
          <Sidebar activeItem="My Desk" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <WithPageTransition isReady={isReady} variant="generic">
            <>
              <FadeInSection delay={0}>
                <Breadcrumb
                  crumbs={[
                    { label: "Dashboard", path: "/creative/dashboard" },
                    { label: "My Gigs", path: "/creative/my-gigs" },
                    { label: "View Project" },
                  ]}
                />
              </FadeInSection>

              <FadeInSection delay={80}>
                <ProjectTabBar
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  projectId={projectId}
                  showCollabProgress={
                    detail?.status === "COLLABORATING" || (detail?.requiredCollaborators ?? 0) > 1
                  }
                />
              </FadeInSection>

              {activeTab === "view" ? (
                <ViewProjectTab
                  title={detail?.title}
                  status={detail?.status}
                  progressPercentage={detail?.progressPercentage}
                  dueDate={detail?.dueDate}
                  clientProfile={clientProfile}
                  clientProfileLoading={clientProfileLoading}
                  clientName={clientName}
                  clientAvatar={clientAvatar}
                  clientRole={clientRole}
                  briefRows={briefRows}
                  milestones={detail?.milestones}
                />
              ) : (
                <ReviewDeliverablesTab
                  title={detail?.title}
                  status={detail?.status}
                  progressPercentage={detail?.progressPercentage}
                  dueDate={detail?.dueDate}
                  clientProfile={clientProfile}
                  clientName={clientName}
                  clientAvatar={clientAvatar}
                  clientRole={clientRole}
                  briefRows={briefRows}
                  milestones={detail?.milestones}
                  deliverables={deliverables}
                  deliverablesLoading={deliverablesLoading}
                  onDownload={handleDownload}
                  onReview={handleReviewDeliverable}
                />
              )}

              <div className="pb-10" />
            </>
          </WithPageTransition>
        </main>
      </div>
    </div>
  );
}