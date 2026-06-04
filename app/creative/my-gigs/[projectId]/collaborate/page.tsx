"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import { useParams, useRouter } from "next/navigation";
import { X, ChevronDown, Search, Loader2 } from "lucide-react";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";
import { useGigDetail } from "@/app/lib/hooks/useGigDetail";

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

const MessageIcon = () => (
    <div className="w-8 h-8 rounded-full bg-[#1a1a3e] flex items-center justify-center">
        <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
    </div>
);

interface Collab {
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

export default function CreativeCollaboratePage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collabs, setCollabs] = useState<Collab[]>([]);
    const [collabsLoading, setCollabsLoading] = useState(true);
    const [invitingId, setInvitingId] = useState<string | null>(null);
    const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [briefOpen, setBriefOpen] = useState(true);
    const [briefDetail, setBriefDetail] = useState<{
        jobTitle?: string;
        jobDescription?: string;
        specificSkills?: string;
        timeline?: string;
        deliveryDate?: string;
    } | null>(null);

    const { profile, loading: profileLoading } = useCreativeProfile();
    const { detail, loading: gigLoading } = useGigDetail(projectId);

    const getAuthToken = async () => {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        return token;
    };

    useEffect(() => {
        if (!detail?.briefId) return;
        const fetchBrief = async () => {
            try {
                const token = await getAuthToken();
                const briefRes = await fetch(`/api/v1/briefs/${detail.briefId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include",
                });
                if (!briefRes.ok) return;
                const briefJson = await briefRes.json();
                const brief = briefJson.data ?? briefJson;
                const skillsRaw = brief.specificSkills ?? brief.skills ?? brief.requiredSkills ?? [];
                const specificSkills = Array.isArray(skillsRaw)
                    ? skillsRaw.map((s: any) => s.name ?? s).join(", ")
                    : skillsRaw ?? "—";
                setBriefDetail({
                    jobTitle: brief.jobTitle ?? "—",
                    jobDescription: brief.jobDescription ?? "—",
                    specificSkills: specificSkills || "—",
                    timeline: brief.timeline ?? "—",
                    deliveryDate: brief.deliveryDate ?? null,
                });
            } catch { }
        };
        fetchBrief();
    }, [detail]);

    useEffect(() => {
        const fetchCollabs = async () => {
            setCollabsLoading(true);
            try {
                const token = await getAuthToken();
                const res = await fetch(`/api/v1/creatives?page=1&limit=6`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include",
                });
                if (res.ok) {
                    const json = await res.json();
                    const list = Array.isArray(json.data) ? json.data : [];
                    setCollabs(list);
                    setHasMore(list.length === 6);
                }
            } catch { } finally {
                setCollabsLoading(false);
            }
        };
        fetchCollabs();
    }, []);

    const handleLoadMore = async () => {
        setLoadingMore(true);
        try {
            const token = await getAuthToken();
            const nextPage = page + 1;
            const res = await fetch(`/api/v1/creatives?page=${nextPage}&limit=6`, {
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            if (res.ok) {
                const json = await res.json();
                const list = Array.isArray(json.data) ? json.data : [];
                setCollabs((prev) => [...prev, ...list]);
                setPage(nextPage);
                setHasMore(list.length === 6);
            }
        } catch { } finally {
            setLoadingMore(false);
        }
    };

    // const handleInvite = async (collab: Collab) => {
    //     setInvitingId(collab.id);
    //     try {
    //         const token = await getAuthToken();
    //         const res = await fetch(`/api/v1/collabs/invite`, {
    //             method: "POST",
    //             headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    //             credentials: "include",
    //             body: JSON.stringify({ projectId, invitedCreativeId: collab.id, role: "COLLABORATOR", description: "", deliverables: [], }),
    //         });
    //         if (!res.ok) {
    //             const errData = await res.json().catch(() => null);
    //             throw new Error(errData?.message || `Failed with status ${res.status}`);
    //         }
    //         setInvitedIds((prev) => new Set(prev).add(collab.id));
    //     } catch (err) {
    //         console.error("Invite error:", err);
    //     } finally {
    //         setInvitingId(null);
    //     }
    // };

    const filteredCollabs = collabs.filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return c.name?.toLowerCase().includes(q) || c.professionalRole?.toLowerCase().includes(q);
    });

    const loading = profileLoading || gigLoading;

    const userName = profile?.fullName ?? "Creative";
    const userAvatar =
        profile?.avatar ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

    const briefRows = briefDetail
        ? [
            { label: "Job Title", value: briefDetail.jobTitle ?? "—" },
            { label: "Specific Skills", value: briefDetail.specificSkills ?? "—" },
            { label: "Job Description", value: briefDetail.jobDescription ?? "—" },
            { label: "Timeline", value: briefDetail.timeline ?? "—" },
            {
                label: "Delivery Date",
                value: briefDetail.deliveryDate
                    ? new Date(briefDetail.deliveryDate).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
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
                    <Sidebar activeItem="My Gigs" />
                </div>

                <main className="flex-1 w-full px-6 lg:px-8 py-6 overflow-y-auto bg-white">
                    <Breadcrumb
                        crumbs={[
                            { label: "Dashboard", path: "/creative/dashboard" },
                            { label: "My Gigs", path: "/creative/my-gigs" },
                            { label: "Review Deliverables", path: `/creative/my-gigs/${projectId}` },
                        ]}
                    />

                    {/* Page title */}
                    <div className="mb-5">
                        <h1 className="text-2xl font-bold text-black">Collaborate</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Invite another creative to collaborate with{" "}
                            <span className="font-medium text-black">{userName}</span> on this project
                        </p>
                    </div>

                    {/* Two-column layout */}
                    <div className="flex flex-col lg:flex-row gap-5">

                        {/* LEFT COLUMN */}
                        <div className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4">

                            {/* Project card */}
                            <div className="bg-[#f9f9f9] p-5 rounded-sm border border-gray-100 text-center">
                                <h2 className="text-base font-bold text-black mb-3 leading-snug">
                                    {detail?.title ?? "Logo Design for Luxury Boutique"}
                                </h2>
                                <div className="flex justify-center mb-4">
                                    <span
                                        className={`inline-block px-5 py-1 text-xs font-semibold rounded-full ${statusColorMap[detail?.status ?? "IN_PROGRESS"] ?? "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {statusLabelMap[detail?.status ?? "IN_PROGRESS"] ?? "In Progress"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#e84545] rounded-full"
                                            style={{ width: `${detail?.progressPercentage ?? 60}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-semibold text-black shrink-0">
                                        {detail?.progressPercentage ?? 60}%
                                    </span>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-sm text-black mt-1">
                                    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
                                        <circle cx="10" cy="10" r="8" />
                                        <path strokeLinecap="round" d="M10 6v4l2.5 2.5" />
                                    </svg>
                                    <span className="text-xs">Due in {detail?.dueDate ? getDueIn(detail.dueDate) : "2 days  23 hrs  30 mins"}</span>
                                </div>
                            </div>

                            {/* Current Creative card */}
                            <div className="bg-[#f9f9f9] p-5 rounded-sm border border-gray-100">
                                <h2 className="text-sm font-bold text-black mb-3">Current Creative</h2>
                                <div className="flex items-center gap-3">
                                    <div className="relative shrink-0">
                                        <Image
                                            src={userAvatar}
                                            alt={userName}
                                            width={48}
                                            height={48}
                                            className="rounded-full object-cover"
                                        />
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1">
                                            <p className="font-semibold text-black text-sm truncate">{userName}</p>
                                            <VerifiedIcon />
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">
                                            {(profile as any)?.professionalRole ?? "Graphic Designer"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <div className="flex items-center gap-0.5">
                                                <StarIcon />
                                                <span className="text-xs font-semibold text-black">
                                                    {(profile as any)?.overallRating?.toFixed(1) ?? "5.0"}
                                                </span>
                                            </div>
                                            {(profile as any)?.rate && (
                                                <span className="text-xs text-black font-medium">${(profile as any).rate}</span>
                                            )}
                                            {(profile as any)?.completedProjects && (
                                                <span className="text-xs text-gray-500">
                                                    {(profile as any).completedProjects} Completed Projects
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <MessageIcon />
                                </div>
                                <button className="mt-3 text-xs text-[#e84545] font-medium hover:underline">
                                    View Profile
                                </button>
                            </div>

                            {/* Brief Summary card */}
                            <div className="bg-[#f9f9f9] rounded-sm border border-gray-100 overflow-hidden">
                                <button
                                    onClick={() => setBriefOpen(!briefOpen)}
                                    className="w-full flex items-center justify-between px-5 py-4"
                                >
                                    <h2 className="text-sm font-bold text-black">Brief Summary</h2>
                                    <ChevronDown
                                        size={18}
                                        className={`text-black transition-transform ${briefOpen ? "rotate-180" : ""}`}
                                    />
                                </button>
                                {briefOpen && (
                                    <div className="px-5 pb-5">
                                        <table className="w-full text-xs">
                                            <tbody>
                                                {briefRows.map((row) => (
                                                    <tr key={row.label} className="border-b border-gray-100 last:border-0">
                                                        <td className="py-2 pr-4 text-gray-500 font-medium w-28 align-top whitespace-nowrap">
                                                            {row.label}
                                                        </td>
                                                        <td className="py-2 text-black">{row.value}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN — Find Creative */}
                        <div className="flex-1 min-w-0">
                            <div className="bg-[#f9f9f9] p-5 rounded-sm border border-gray-100">
                                <h2 className="text-base font-bold text-black mb-4">Find Creative</h2>

                                {/* Search + Filter row */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex-1 relative">
                                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                                {collabsLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="animate-spin text-[#E2554F]" size={32} />
                                    </div>
                                ) : filteredCollabs.length === 0 ? (
                                    <div className="flex items-center justify-center py-16">
                                        <p className="text-sm text-gray-400">No creatives found.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {filteredCollabs.map((collab) => {
                                            const avatar =
                                                collab.imageUrl ??
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(collab.name)}&background=1a1a2e&color=fff&size=128`;
                                            const isInvited = invitedIds.has(collab.id);
                                            const isInviting = invitingId === collab.id;
                                            const thumbnail = collab.portfolioImages?.[0] ?? null;

                                            return (
                                                <div
                                                    key={collab.id}
                                                    className="bg-white border border-gray-100 rounded-lg overflow-hidden"
                                                >
                                                    {/* Portfolio thumbnail */}
                                                    <div className="w-full h-36 bg-gray-100 overflow-hidden">
                                                        {thumbnail ? (
                                                            <img
                                                                src={thumbnail}
                                                                alt={`${collab.name} portfolio`}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = "none";
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-10 h-10 text-gray-400">
                                                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                                    <path d="M21 15l-5-5L5 21" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Card body */}
                                                    <div className="p-4">
                                                        <div className="flex items-start gap-2 mb-2">
                                                            <div className="relative shrink-0">
                                                                <Image
                                                                    src={avatar}
                                                                    alt={collab.name}
                                                                    width={40}
                                                                    height={40}
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
                                                                <div className="flex items-center gap-0.5 mt-1">
                                                                    <StarIcon />
                                                                    <span className="text-xs font-semibold text-black">
                                                                        {collab.overallRating?.toFixed(1) ?? "5.0"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <MessageIcon />
                                                        </div>

                                                        <div className="flex items-center justify-between mt-3">
                                                            <button
                                                                onClick={() => router.push(`/creative/my-gigs/${projectId}`)}
                                                                className="text-xs text-[#e84545] font-medium hover:underline"
                                                            >
                                                                View Profile
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const collabData = encodeURIComponent(JSON.stringify({
                                                                        id: collab.id,
                                                                        name: collab.name,
                                                                        imageUrl: collab.imageUrl,
                                                                        professionalRole: collab.professionalRole,
                                                                        overallRating: collab.overallRating,
                                                                        rate: collab.rate,
                                                                        isVerified: collab.isVerified,
                                                                    }));
                                                                    router.push(`/creative/my-gigs/${projectId}/collaborate/invite?collab=${collabData}`);
                                                                }}
                                                                className="flex items-center gap-1.5 px-5 py-1.5 rounded-md text-xs font-semibold bg-[#e84545] hover:bg-[#d03535] text-white transition-colors"
                                                            >
                                                                Invite
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Load More */}
                                {!collabsLoading && hasMore && (
                                    <div className="flex justify-center mt-6">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className="flex items-center gap-2 px-10 py-2.5 bg-[#e84545] hover:bg-[#d03535] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
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
                </main>
            </div>
        </div>
    );
}