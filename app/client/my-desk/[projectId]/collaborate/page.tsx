"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/client/my-desk/breadcrumb";
import { useParams, useRouter } from "next/navigation";
import { X, ChevronDown, Search, Loader2 } from "lucide-react";
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

interface ProjectDetail {
    id: string;
    title: string;
    status: string;
    dueDate: string | null;
    progressPercentage: number;
    brief: {
        jobTitle?: string;
        jobDescription?: string;
        specificSkills?: string;
        timeline?: string;
        deliveryDate?: string;
        referenceFileUrl?: string;
    } | null;
    pitchId: string | null;
    briefId: string | null;
}

interface Creative {
    id: string;
    name: string;
    imageUrl: string | null;
    professionalRole: string;
    overallRating: number;
    completedProjects?: number;
    rate?: number;
    isVerified?: boolean;
    isPremium?: boolean;
    portfolioImages?: string[];
}

interface CurrentCreative {
    fullName?: string;
    name?: string;
    professionalRole?: string;
    avatarUrl?: string;
    imageUrl?: string;
    photoUrl?: string;
    overallRating?: number;
    completedProjects?: number;
    rate?: number;
}

type ClientProfile = {
    name: string;
    clientProfile: { fullName: string; imageUrl: string | null };
};

const getDueIn = (dueDate: string): string => {
    const diff = new Date(dueDate).getTime() - Date.now();
    if (diff <= 0) return "Overdue";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${days} days  ${String(hours).padStart(2, "0")} hrs  ${String(mins).padStart(2, "0")} mins`;
};

const statusColorMap: Record<string, string> = {
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-600",
    REVISION: "bg-orange-100 text-orange-600",
    PENDING_PAYMENT: "bg-blue-100 text-blue-600",
    PARTIALLY_COMPLETED: "bg-purple-100 text-purple-600",
};

const statusLabelMap: Record<string, string> = {
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    REVISION: "Revision",
    PENDING_PAYMENT: "Pending Payment",
    PARTIALLY_COMPLETED: "Partially Completed",
};

const filterTabs = ["All", "Verified", "Premium", "Recommended", "Logo Design"];

export default function CollaboratePage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [currentCreative, setCurrentCreative] = useState<CurrentCreative | null>(null);
    const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
    const [creatives, setCreatives] = useState<Creative[]>([]);
    const [loading, setLoading] = useState(true);
    const [creativesLoading, setCreativesLoading] = useState(true);
    const [invitingId, setInvitingId] = useState<string | null>(null);
    const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const isReady = usePageReady(loading);

    const getAuthToken = async () => {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        return token;
    };

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const token = await getAuthToken();
                const headers = { Authorization: `Bearer ${token}` };

                const [projectRes, profileRes] = await Promise.all([
                    fetch(`/api/v1/projects/${projectId}`, { headers, credentials: "include" }),
                    fetch("/api/v1/clients/me", { headers, credentials: "include" }),
                ]);

                if (profileRes.ok) {
                    const profileJson = await profileRes.json();
                    setClientProfile(profileJson.data);
                }

                if (projectRes.ok) {
                    const projectJson = await projectRes.json();
                    const detail: ProjectDetail = projectJson.data;

                    // fetch full brief to get specificSkills
                    if (detail.briefId) {
                        const briefRes = await fetch(`/api/v1/briefs/${detail.briefId}`, {
                            headers,
                            credentials: "include",
                        });
                        if (briefRes.ok) {
                            const briefJson = await briefRes.json();
                            const fullBrief = briefJson.data;

                            // skills can be an array of objects like { id, name, ... }
                            // so we map them to a comma-separated string
                            const skillsRaw =
                                fullBrief.specificSkills ??
                                fullBrief.skills ??
                                fullBrief.requiredSkills ??
                                [];

                            const specificSkills = Array.isArray(skillsRaw)
                                ? skillsRaw.map((s: any) => s.name ?? s).join(", ")
                                : skillsRaw ?? "—";

                            detail.brief = {
                                ...detail.brief,
                                specificSkills,
                            };
                        }
                    }

                    setProject(detail);

                    // fetch current creative from pitches
                    if (detail.pitchId && detail.briefId) {
                        const pitchesRes = await fetch(`/api/v1/briefs/${detail.briefId}/pitches`, {
                            headers,
                            credentials: "include",
                        });
                        if (pitchesRes.ok) {
                            const pitchesJson = await pitchesRes.json();
                            const pitchesList = pitchesJson.data?.pitches ?? pitchesJson.data ?? [];
                            const matchedPitch = pitchesList.find((p: any) => p.id === detail.pitchId);
                            if (matchedPitch?.creativeProfile) {
                                setCurrentCreative(matchedPitch.creativeProfile);
                            }
                        }
                    }
                }
            } catch {
                // fail silently
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [projectId]);

    useEffect(() => {
        const fetchCreatives = async () => {
            setCreativesLoading(true);
            try {
                const token = await getAuthToken();
                const res = await fetch(`/api/v1/creatives/suggested?page=1&limit=6`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include",
                });
                if (res.ok) {
                    const json = await res.json();
                    const list = Array.isArray(json.data) ? json.data : [];
                    setCreatives(list);
                    setHasMore(list.length === 6);
                }
            } catch {
                // fail silently
            } finally {
                setCreativesLoading(false);
            }
        };
        fetchCreatives();
    }, []);

    const handleLoadMore = async () => {
        setLoadingMore(true);
        try {
            const token = await getAuthToken();
            const nextPage = page + 1;
            const res = await fetch(`/api/v1/creatives/suggested?page=${nextPage}&limit=6`, {
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            if (res.ok) {
                const json = await res.json();
                const list = Array.isArray(json.data) ? json.data : [];
                setCreatives((prev) => [...prev, ...list]);
                setPage(nextPage);
                setHasMore(list.length === 6);
            }
        } catch {
            // fail silently
        } finally {
            setLoadingMore(false);
        }
    };

    const handleInvite = async (creative: Creative) => {
        setInvitingId(creative.id);
        try {
            const token = await getAuthToken();

            console.log("1. Sending collab invite for creative:", creative.id);

            const res = await fetch(`/api/v1/collabs/invite`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    projectId,
                    invitedCreativeId: creative.id,
                }),
            });

            console.log("2. Invite response status:", res.status);

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                console.log("3. Error body:", errData);
                throw new Error(errData?.message || `Failed with status ${res.status}`);
            }

            const data = await res.json();
            console.log("4. Invite success:", data);

            setInvitedIds((prev) => new Set(prev).add(creative.id));
        } catch (err) {
            console.log("5. Invite error:", err);
        } finally {
            setInvitingId(null);
        }
    };

    const filteredCreatives = creatives.filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            c.name?.toLowerCase().includes(q) ||
            c.professionalRole?.toLowerCase().includes(q)
        );
    });

    const userName = clientProfile?.clientProfile?.fullName || clientProfile?.name || "Client";
    const userAvatar =
        clientProfile?.clientProfile?.imageUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

    const currentCreativeName = currentCreative?.fullName ?? currentCreative?.name ?? "Creative";
    const currentCreativeAvatar =
        currentCreative?.photoUrl ??
        currentCreative?.imageUrl ??
        currentCreative?.avatarUrl ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(currentCreativeName)}&background=1a1a2e&color=fff&size=128`;

    const briefRows = project?.brief
        ? [
            { label: "Job Title", value: project.brief.jobTitle ?? "—" },
            { label: "Specific Skills", value: project.brief.specificSkills ?? "—" },
            { label: "Job Description", value: project.brief.jobDescription ?? "—" },
            { label: "Timeline", value: project.brief.timeline ?? "—" },
            {
                label: "Delivery Date",
                value: project.brief.deliveryDate
                    ? new Date(project.brief.deliveryDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })
                    : "—",
            },
        ]
        : [];

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-white">
                <Loader2 className="animate-spin text-[#E2554F]" size={40} />
            </div>
        );
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
                    <div
                        className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
                <div
                    className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
                    <WithPageTransition isReady={isReady} variant="gigs">
                        <>
                            <FadeInSection delay={0}>
                                <Breadcrumb
                                    crumbs={[
                                        { label: "Dashboard", path: "/client/dashboard" },
                                        { label: "My Desk", path: "/client/my-desk" },
                                        { label: "Review Deliverables", path: `/client/my-desk/${projectId}` },
                                    ]}
                                />

                                <div className="mb-6">
                                    <h1 className="text-2xl font-bold text-black">Collaborate</h1>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Invite another creative to collaborate with{" "}
                                        <span className="font-medium text-black">{currentCreativeName}</span> on this project
                                    </p>
                                </div>

                                <div className="flex flex-col lg:flex-row gap-5">
                                    {/* LEFT PANEL */}
                                    <div className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4">

                                        {/* Project card */}
                                        <div className="bg-[#fafafa] p-5 border border-gray-100">
                                            <h2 className="text-lg font-bold text-black text-center mb-2">
                                                {project?.title ?? "—"}
                                            </h2>
                                            <div className="flex justify-center mb-3">
                                                <span
                                                    className={`inline-block px-4 py-1 text-xs font-semibold rounded-full ${statusColorMap[project?.status ?? ""] ?? "bg-gray-100 text-gray-600"
                                                        }`}
                                                >
                                                    {statusLabelMap[project?.status ?? ""] ?? project?.status ?? "—"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#e84545] rounded-full"
                                                        style={{ width: `${project?.progressPercentage ?? 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold text-black">
                                                    {project?.progressPercentage ?? 0}%
                                                </span>
                                            </div>
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
                                                <span>Due in {project?.dueDate ? getDueIn(project.dueDate) : "—"}</span>
                                            </div>
                                        </div>

                                        {/* Current Creative card */}
                                        <div className="bg-[#fafafa] p-5 border border-gray-100">
                                            <h2 className="text-base font-bold text-black mb-3">Current Creative</h2>
                                            <div className="flex items-center gap-3">
                                                <div className="relative shrink-0">
                                                    <Image
                                                        src={currentCreativeAvatar}
                                                        alt={currentCreativeName}
                                                        width={48}
                                                        height={48}
                                                        className="rounded-full object-cover"
                                                    />
                                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1">
                                                        <p className="font-semibold text-black text-sm truncate">
                                                            {currentCreativeName}
                                                        </p>
                                                        <VerifiedIcon />
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {currentCreative?.professionalRole ?? "Creative"}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-black">
                                                        <div className="flex items-center gap-0.5">
                                                            <StarIcon />
                                                            <span className="font-semibold">
                                                                {currentCreative?.overallRating?.toFixed(1) ?? "5.0"}
                                                            </span>
                                                        </div>
                                                        {currentCreative?.rate && (
                                                            <span className="text-gray-500">${currentCreative.rate}</span>
                                                        )}
                                                        {currentCreative?.completedProjects !== undefined && (
                                                            <span className="text-gray-500">
                                                                {currentCreative.completedProjects} Completed Projects
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => router.push(`/client/hire-a-pro`)}
                                                        className="text-xs text-[#e84545] font-medium mt-1 hover:underline"
                                                    >
                                                        View Profile
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Brief Summary card */}
                                        <div className="bg-[#fafafa] border border-gray-100">
                                            <div className="w-full flex items-center justify-between px-5 py-4">
                                                <h2 className="text-base font-bold text-black">Brief Summary</h2>
                                                <ChevronDown size={18} className="text-black" />
                                            </div>
                                            <div className="px-5 pb-5">
                                                <table className="w-full text-sm">
                                                    <tbody>
                                                        {briefRows.map((row) => (
                                                            <tr key={row.label} className="border-b border-gray-50 last:border-0">
                                                                <td className="py-2 pr-4 text-black font-medium w-28 align-top text-xs">
                                                                    {row.label}
                                                                </td>
                                                                <td className="py-2 text-black text-xs">{row.value}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT PANEL */}
                                    <div className="flex-1 min-w-0">
                                        <div className="bg-[#fafafa] p-5 border border-gray-100">
                                            <h2 className="text-base font-bold text-black mb-4">Find Creative</h2>

                                            {/* Search + Filter */}
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="flex-1 relative">
                                                    <Search
                                                        size={16}
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        placeholder="Search creative or services"
                                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 focus:border-[#e84545]/40 transition-all"
                                                    />
                                                </div>
                                                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-black font-medium hover:bg-gray-50 transition-colors shrink-0">
                                                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#e84545]">
                                                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.553.894l-4 2A1 1 0 016 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                                                    </svg>
                                                    Filter By
                                                    <ChevronDown size={14} className="text-gray-400" />
                                                </button>
                                            </div>

                                            {/* Filter tabs */}
                                            <div className="flex items-center gap-2 mb-5 flex-wrap">
                                                {filterTabs.map((tab) => (
                                                    <button
                                                        key={tab}
                                                        onClick={() => setActiveFilter(tab)}
                                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === tab
                                                                ? "bg-[#e84545] text-white"
                                                                : "bg-white border border-gray-200 text-black hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        {tab}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Creatives grid */}
                                            {creativesLoading ? (
                                                <div className="flex items-center justify-center py-16">
                                                    <Loader2 className="animate-spin text-[#E2554F]" size={32} />
                                                </div>
                                            ) : filteredCreatives.length === 0 ? (
                                                <div className="flex items-center justify-center py-16">
                                                    <p className="text-sm text-gray-400">No creatives found.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {filteredCreatives.map((creative) => {
                                                        const avatar =
                                                            creative.imageUrl ??
                                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                                creative.name
                                                            )}&background=1a1a2e&color=fff&size=128`;

                                                        const isInvited = invitedIds.has(creative.id);
                                                        const isInviting = invitingId === creative.id;
                                                        const thumbnail = creative.portfolioImages?.[0] ?? null;

                                                        return (
                                                            <div
                                                                key={creative.id}
                                                                className="bg-white border border-gray-100 rounded-lg overflow-hidden"
                                                            >
                                                                {/* Portfolio thumbnail */}
                                                                <div className="w-full h-32 bg-gray-100 overflow-hidden">
                                                                    {thumbnail ? (
                                                                        <img
                                                                            src={thumbnail}
                                                                            alt={`${creative.name} portfolio`}
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                (e.target as HTMLImageElement).style.display = "none";
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                                            <svg
                                                                                viewBox="0 0 24 24"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                strokeWidth={1}
                                                                                className="w-10 h-10 text-gray-400"
                                                                            >
                                                                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                                                <path d="M21 15l-5-5L5 21" />
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Card body */}
                                                                <div className="p-4">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <div className="relative shrink-0">
                                                                            <Image
                                                                                src={avatar}
                                                                                alt={creative.name}
                                                                                width={36}
                                                                                height={36}
                                                                                className="rounded-full object-cover"
                                                                            />
                                                                            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-white" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-1">
                                                                                <p className="font-semibold text-black text-sm truncate">
                                                                                    {creative.name}
                                                                                </p>
                                                                                {creative.isVerified && <VerifiedIcon />}
                                                                            </div>
                                                                            <p className="text-xs text-gray-500 truncate">
                                                                                {creative.professionalRole}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-1 mb-3">
                                                                        <StarIcon />
                                                                        <span className="text-xs font-semibold text-black">
                                                                            {creative.overallRating?.toFixed(1) ?? "5.0"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center justify-between">
                                                                        <button
                                                                            onClick={() => router.push(`/client/hire-a-pro`)}
                                                                            className="text-xs text-[#e84545] font-medium hover:underline"
                                                                        >
                                                                            View Profile
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleInvite(creative)}
                                                                            disabled={isInviting || isInvited}
                                                                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isInvited
                                                                                    ? "bg-green-500 text-white cursor-default"
                                                                                    : "bg-[#e84545] hover:bg-[#d03535] text-white disabled:opacity-60"
                                                                                }`}
                                                                        >
                                                                            {isInviting && <Loader2 size={11} className="animate-spin" />}
                                                                            {isInvited ? "Invited ✓" : "Invite"}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Load More */}
                                            {!creativesLoading && hasMore && (
                                                <div className="flex justify-center mt-6">
                                                    <button
                                                        onClick={handleLoadMore}
                                                        disabled={loadingMore}
                                                        className="flex items-center gap-2 px-8 py-2.5 bg-[#e84545] hover:bg-[#d03535] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                                                    >
                                                        {loadingMore && <Loader2 size={14} className="animate-spin" />}
                                                        {loadingMore ? "Loading..." : "Load More"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pb-10" />
                            </FadeInSection>
                        </>
                    </WithPageTransition>

                </main>
            </div>
        </div>
    );
}