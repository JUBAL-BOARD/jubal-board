"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { X, ChevronDown, Loader2 } from "lucide-react";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";
import { useGigDetail } from "@/app/lib/hooks/useGigDetail";
import usePageReady from "@/app/lib/hooks/usePageReady";
import WithPageTransition from "@/app/components/shared/withPageTransition";
import FadeInSection from "@/app/components/shared/fadeInSection";

const StarIcon = () => (
<svg viewBox="0 0 20 20" fill="#F5A623" className="w-4 h-4">
<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
</svg>
);
const VerifiedIcon = () => (
<svg viewBox="0 0 20 20" fill="#3B82F6" className="w-4 h-4">
<path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
</svg>
);
interface SelectedCollab {
id: string;
name: string;
imageUrl: string | null;
professionalRole: string;
overallRating: number;
rate?: number;
isVerified?: boolean;
}
const timelineOptions = [
"Less than 24 hours",
"1-3 days",
"3-7 days",
"1-2 weeks",
"2-4 weeks",
"1+ month",
];
export default function CollaborateInvitePage() {
const params = useParams();
const router = useRouter();
const searchParams = useSearchParams();
const projectId = params.projectId as string;
const [sidebarOpen, setSidebarOpen] = useState(false);
const [selectedCollabs, setSelectedCollabs] = useState<SelectedCollab[]>([]);

const [projectTitle, setProjectTitle] = useState("");
const [projectDescription, setProjectDescription] = useState("");
const [budget, setBudget] = useState("");
const [timeline, setTimeline] = useState("Less than 24 hours");
const [startDate, setStartDate] = useState("");

const [sending, setSending] = useState(false);
const [sentSuccess, setSentSuccess] = useState(false);
const [error, setError] = useState<string | null>(null);

const { profile, loading: profileLoading } = useCreativeProfile();
const { detail, loading: gigLoading } = useGigDetail(projectId);

const isReady = usePageReady(profileLoading, gigLoading);

const userName = profile?.fullName ?? "Creative";
const userAvatar =
    profile?.avatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

const getAuthToken = async () => {
    const tokenRes = await fetch("/api/auth/session/token");
    const { token } = await tokenRes.json();
    return token;
};

// Parse selected creative from query param
useEffect(() => {
    const raw = searchParams.get("collab");
    if (raw) {
        try {
            const parsed = JSON.parse(decodeURIComponent(raw));
            const list: SelectedCollab[] = Array.isArray(parsed) ? parsed : [parsed];
            setSelectedCollabs(list);
        } catch {
            // ignore malformed query
        }
    }
}, [searchParams]);

// Fetch brief data to pre-populate title and description
useEffect(() => {
    if (!detail?.briefId) return;
    const fetchBrief = async () => {
        try {
            const token = await getAuthToken();
            const res = await fetch(`/api/v1/briefs/${detail.briefId}`, {
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            if (!res.ok) return;
            const json = await res.json();
            const brief = json.data ?? json;
            setProjectTitle(brief.jobTitle ?? "");
            setProjectDescription(brief.jobDescription ?? "");
        } catch {}
    };
    fetchBrief();
}, [detail]);

const handleRemove = (id: string) => {
    setSelectedCollabs((prev) => prev.filter((c) => c.id !== id));
};

const handleSendBrief = async () => {
    if (selectedCollabs.length === 0) {
        setError("Please select at least one creative to invite.");
        return;
    }
    if (!projectTitle.trim()) {
        setError("Please enter a project title.");
        return;
    }

    setSending(true);
    setError(null);

    try {
        const token = await getAuthToken();

        const results = await Promise.allSettled(
            selectedCollabs.map((collab) =>
                fetch(`/api/v1/collabs/invite`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        projectId,
                        invitedCreativeId: collab.id,
                        role: "COLLABORATOR",
                        description: projectDescription,
                        deliverables: [],
                        deliveryDate: startDate
                            ? new Date(startDate).toISOString()
                            : new Date().toISOString(),
                        timeline,
                        proposedFee: parseFloat(budget) || 0,
                        workMode: "VIRTUAL",
                    }),
                }).then(async (res) => {
                    if (!res.ok) {
                        const errData = await res.json().catch(() => null);
                        throw new Error(errData?.message || `Failed with status ${res.status}`);
                    }
                    return res.json();
                })
            )
        );

        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length > 0) {
            const msgs = (failed as PromiseRejectedResult[]).map(
                (f) => f.reason?.message ?? "Unknown error"
            );
            setError(`Some invites failed: ${msgs.join("; ")}`);
        } else {
            setSentSuccess(true);
            setTimeout(() => {
                router.push(`/creative/my-gigs/${projectId}/collaborate`);
            }, 1500);
        }
    } catch (err: any) {
        setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
        setSending(false);
    }
};

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
                <Sidebar activeItem="My Gigs" />
            </div>

            <main className="flex-1 w-full px-6 lg:px-8 py-6 overflow-y-auto bg-white">
                <WithPageTransition isReady={isReady} variant="generic">
                    <>
                        <FadeInSection delay={0}>
                            <Breadcrumb
                                crumbs={[
                                    { label: "Dashboard", path: "/creative/dashboard" },
                                    { label: "My Desk", path: "/creative/my-gigs" },
                                    { label: "Collaborate", path: `/creative/my-gigs/${projectId}/collaborate` },
                                    { label: "Invite", path: `/creative/my-gigs/${projectId}/collaborate/invite` },
                                ]}
                            />
                        </FadeInSection>

                        <FadeInSection delay={80}>
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-black">Invite Collaborators</h1>
                            </div>
                        </FadeInSection>

                        <div className="flex flex-col lg:flex-row gap-6">

                            {/* LEFT — Selected Creatives */}
                            <FadeInSection delay={0}>
                                <div className="w-full lg:w-[380px] shrink-0">
                                    <div className="bg-[#f9f9f9] rounded-sm border border-gray-100 p-5">
                                        <h2 className="text-base font-bold text-black mb-4">Selected Creatives</h2>

                                        {selectedCollabs.length === 0 ? (
                                            <p className="text-sm text-gray-400 text-center py-8">
                                                No creatives selected.{" "}
                                                <button
                                                    onClick={() =>
                                                        router.push(`/creative/my-gigs/${projectId}/collaborate`)
                                                    }
                                                    className="text-[#e84545] hover:underline font-medium"
                                                >
                                                    Go back to add some.
                                                </button>
                                            </p>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                {selectedCollabs.map((collab, i) => {
                                                    const avatar =
                                                        collab.imageUrl ??
                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(collab.name)}&background=1a1a2e&color=fff&size=128`;

                                                    return (
                                                        <FadeInSection key={collab.id} delay={i * 40}>
                                                            <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3">
                                                                <div className="relative shrink-0">
                                                                    <Image
                                                                        src={avatar}
                                                                        alt={collab.name}
                                                                        width={48}
                                                                        height={48}
                                                                        className="rounded-full object-cover"
                                                                    />
                                                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-1">
                                                                        <p className="font-semibold text-black text-sm truncate">
                                                                            {collab.name}
                                                                        </p>
                                                                        {collab.isVerified && <VerifiedIcon />}
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 truncate">
                                                                        {collab.professionalRole}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <div className="flex items-center gap-0.5">
                                                                            <StarIcon />
                                                                            <span className="text-xs font-semibold text-black">
                                                                                {collab.overallRating?.toFixed(1) ?? "5.0"}
                                                                            </span>
                                                                        </div>
                                                                        {collab.rate && (
                                                                            <span className="text-xs text-black font-medium">
                                                                                ${collab.rate}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    onClick={() => handleRemove(collab.id)}
                                                                    className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                                                                    aria-label="Remove"
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            </div>
                                                        </FadeInSection>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </FadeInSection>

                            {/* RIGHT — Send Brief form */}
                            <FadeInSection delay={120}>
                                <div className="flex-1 min-w-0">
                                    <div className="bg-[#f9f9f9] rounded-sm border border-gray-100 p-5">
                                        <h2 className="text-base font-bold text-black mb-5">Send Brief</h2>

                                        <div className="flex flex-col gap-4">
                                            {/* Project Title */}
                                            <div>
                                                <label className="block text-sm font-medium text-black mb-1.5">
                                                    Project Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={projectTitle}
                                                    onChange={(e) => setProjectTitle(e.target.value)}
                                                    placeholder="Type here"
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 focus:border-[#e84545]/40 transition-all"
                                                />
                                            </div>

                                            {/* Project Description */}
                                            <div>
                                                <label className="block text-sm font-medium text-black mb-1.5">
                                                    Project Description
                                                </label>
                                                <textarea
                                                    value={projectDescription}
                                                    onChange={(e) => setProjectDescription(e.target.value)}
                                                    placeholder="Describe your project in detail"
                                                    rows={5}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 focus:border-[#e84545]/40 transition-all resize-none"
                                                />
                                            </div>

                                            {/* Budget */}
                                            <div>
                                                <label className="block text-sm font-medium text-black mb-1.5">
                                                    Budget
                                                </label>
                                                <input
                                                    type="number"
                                                    value={budget}
                                                    onChange={(e) => setBudget(e.target.value)}
                                                    placeholder="Enter amount e.g. 500"
                                                    min={0}
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 focus:border-[#e84545]/40 transition-all"
                                                />
                                            </div>

                                            {/* Timeline */}
                                            <div>
                                                <label className="block text-sm font-medium text-black mb-1.5">
                                                    Timeline
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={timeline}
                                                        onChange={(e) => setTimeline(e.target.value)}
                                                        className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 focus:border-[#e84545]/40 transition-all pr-10"
                                                    >
                                                        {timelineOptions.map((opt) => (
                                                            <option key={opt} value={opt}>
                                                                {opt}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown
                                                        size={16}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Start Date */}
                                            <div>
                                                <label className="block text-sm font-medium text-black mb-1.5">
                                                    Start Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 focus:border-[#e84545]/40 transition-all"
                                                />
                                            </div>

                                            {/* Error message */}
                                            {error && (
                                                <p className="text-xs text-red-500 font-medium">{error}</p>
                                            )}

                                            {/* Send Brief button */}
                                            <button
                                                onClick={handleSendBrief}
                                                disabled={sending || sentSuccess}
                                                className={`w-full py-3 rounded-lg text-sm font-bold transition-colors mt-2 flex items-center justify-center gap-2 ${
                                                    sentSuccess
                                                        ? "bg-green-500 text-white cursor-default"
                                                        : "bg-[#e84545] hover:bg-[#d03535] text-white disabled:opacity-60"
                                                }`}
                                            >
                                                {sending && <Loader2 size={15} className="animate-spin" />}
                                                {sentSuccess ? "Brief Sent ✓" : sending ? "Sending..." : "Send Brief"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </FadeInSection>
                        </div>

                        <div className="pb-10" />
                    </>
                </WithPageTransition>
            </main>
        </div>
    </div>
);
}