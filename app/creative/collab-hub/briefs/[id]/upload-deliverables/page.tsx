"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import { useParams, useRouter } from "next/navigation";
import { X, ChevronDown, CloudUpload, BadgeCheck, Loader2 } from "lucide-react";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";
import usePageReady from "@/app/lib/hooks/usePageReady";
import WithPageTransition from "@/app/components/shared/withPageTransition";
import FadeInSection from "@/app/components/shared/fadeInSection";

const getDueIn = (deadline: string): string => {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "0 days 00hrs 00mins";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${days} day${days !== 1 ? "s" : ""} ${String(hours).padStart(2, "0")}hrs ${String(mins).padStart(2, "0")}mins`;
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

const SuccessModal: React.FC<{ onContinue: () => void }> = ({ onContinue }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-[#e2c20dff] rounded-2xl px-12 py-10 w-[80%] lg:w-[420px] flex flex-col items-center text-center shadow-2xl">
      <div className="w-[90px] h-[90px] rounded-full bg-white flex items-center justify-center mb-5">
        <BadgeCheck size={52} fill="white" stroke="#e2c20dff" />
      </div>
      <h2 className="text-[22px] font-bold text-white m-0 mb-1">Sent!</h2>
      <p className="text-[14px] text-white m-0 mb-7 leading-relaxed max-w-[260px]">
        Your deliverable has been sent to the lead creative for review.
      </p>
      <button
        onClick={onContinue}
        className="bg-white border-none rounded-lg px-8 py-2.5 cursor-pointer text-black font-semibold text-xs lg:text-[14px] hover:bg-black hover:text-white transition-colors"
      >
        Continue
      </button>
    </div>
  </div>
);

interface CollabDetail {
  projectTitle: string;
  projectStatus: string;
  deliveryDate: string | null;
  role: string;
  leadCreative: {
    name: string;
    avatarUrl: string;
  } | null;
}

export default function CollabUploadDeliverablesPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [collabDetail, setCollabDetail] = useState<CollabDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      setDetailLoading(true);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch collab gigs to find this specific collab's details
        const res = await fetch(`/api/v1/collabs/my-gigs`, {
          headers,
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch collab details");
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : [];
        const match = list.find((c: any) => c.id === id);

        if (match) {
          setCollabDetail({
            projectTitle: match.projectTitle ?? "—",
            projectStatus: match.projectStatus ?? "IN_PROGRESS",
            deliveryDate: match.deliveryDate ?? null,
            role: match.role ?? "Collaborator",
            leadCreative: match.leadCreative ?? null,
          });
        }
      } catch {
        // fail silently
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const { profile, loading } = useCreativeProfile();
  const isReady = usePageReady(loading);

  // Fallback values if profile is not loaded
  const userName = profile?.fullName || "User";
  const userAvatar = profile?.avatar || "https://i.pravatar.cc/150?img=47";

  const projectTitle = collabDetail?.projectTitle ?? "—";
  const dueIn = collabDetail?.deliveryDate ? getDueIn(collabDetail.deliveryDate) : "No deadline";
  const leadName = collabDetail?.leadCreative?.name ?? "Lead Creative";
  const leadAvatar =
    collabDetail?.leadCreative?.avatarUrl ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(leadName)}&background=e84545&color=fff&size=80`;

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

    setSubmitting(true);
    setSubmitError(null);

    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("creativeNote", note);

      const res = await fetch(`/api/v1/collabs/${id}/deliverables`, {
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
        <SuccessModal onContinue={() => router.push("/creative/my-gigs")} />
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
          <Sidebar activeItem="Collab Hub" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <WithPageTransition isReady={isReady} variant="generic">
            <FadeInSection delay={0}>
              <Breadcrumb
                crumbs={[
                  { label: "Dashboard", path: "/creative/dashboard" },
                  { label: "My Gigs", path: "/creative/my-gigs" },
                  { label: projectTitle },
                  { label: "Upload Deliverables" },
                ]}
              />

              <h1 className="text-2xl font-bold text-gray-900 mb-5">Upload Deliverables</h1>

              {/* Project card */}
              <div className="bg-[#fafafa] border border-gray-100 rounded-xl p-5 mb-4 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{projectTitle}</h2>
                <span className="inline-block px-4 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full mb-4">
                  {collabDetail?.role ?? "Collaborator"}
                </span>
                <div className="flex items-center justify-center gap-2 text-sm text-black">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="w-4 h-4"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <circle cx="10" cy="10" r="8" />
                    <path strokeLinecap="round" d="M10 6v4l2.5 2.5" />
                  </svg>
                  <span>Due in {dueIn}</span>
                </div>
              </div>

              {/* About the lead creative */}
              <div className="bg-[#fafafa] border border-gray-100 rounded-xl p-5 mb-4">
                <h2 className="text-base font-bold text-black text-xl mb-4">Lead Creative</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Image
                      src={leadAvatar}
                      alt={leadName}
                      width={56}
                      height={56}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-black text-lg mb-0.5">{leadName}</p>
                      <p className="text-xs text-gray-400">Lead Creative</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Files */}
              <Section title="Upload Files">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-gray-50 transition-colors mb-4"
                >
                  <CloudUpload size={52} className="text-[#e84545] mb-3" />
                  <p className="font-semibold text-gray-700 text-sm mb-1">
                    Drag your files here or tap to upload
                  </p>
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
                    <button
                      onClick={removeFiles}
                      className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </Section>

              {/* Note to Lead Creative */}
              <Section title="Note to Lead Creative">
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
            </FadeInSection>
          </WithPageTransition>

        </main>
      </div>
    </div>
  );
}