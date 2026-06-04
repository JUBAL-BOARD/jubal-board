"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import { X, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";

const StarIcon = () => (
    <svg viewBox="0 0 20 20" fill="#F5A623" className="w-4 h-4">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const VerifiedIcon = () => (
    <svg viewBox="0 0 20 20" fill="#3B82F6" className="w-4 h-4 shrink-0">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

interface CollabInvitation {
    id: string;
    projectId: string;
    role: string;
    status: string;
    description?: string;
    proposedFee?: number;
    currency?: string;
    timeline?: string;
    deliveryDate?: string;
    workMode?: string;
    createdAt?: string;
    project?: {
        id: string;
        title?: string;
        status?: string;
    };
    invitedBy?: {
        id: string;
        fullName?: string;
        name?: string;
        imageUrl?: string;
        avatarUrl?: string;
        overallRating?: number;
        professionalRole?: string;
        isVerified?: boolean;
    };
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    PENDING: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-700",
        icon: <Clock size={11} />,
    },
    ACCEPTED: {
        label: "Accepted",
        className: "bg-green-100 text-green-700",
        icon: <CheckCircle size={11} />,
    },
    REJECTED: {
        label: "Rejected",
        className: "bg-red-100 text-red-600",
        icon: <XCircle size={11} />,
    },
};

const filterTabs = ["All", "PENDING", "ACCEPTED", "REJECTED"];
const filterLabels: Record<string, string> = {
    All: "All",
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
};

export default function CollabInvitationsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [invitations, setInvitations] = useState<CollabInvitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [actioningId, setActioningId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<"accept" | "reject" | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const { profile, loading: profileLoading } = useCreativeProfile();

    const userName = profile?.fullName ?? "Creative";
    const userAvatar =
        profile?.avatar ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

    const getAuthToken = async () => {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        return token;
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const fetchInvitations = useCallback(async () => {
    setLoading(true);
    try {
        const token = await getAuthToken();
        const headers = { Authorization: `Bearer ${token}` };

        const res = await fetch("/api/v1/collabs", {
            headers,
            credentials: "include",
        });
        if (!res.ok) return;

        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : [];

        // Fetch project details for each collab to get the inviter's info
        const enriched = await Promise.all(
            list.map(async (collab: any) => {
                try {
                    const projectRes = await fetch(`/api/v1/projects/${collab.projectId}`, {
                        headers,
                        credentials: "include",
                    });
                    if (projectRes.ok) {
                        const projectJson = await projectRes.json();
                        const project = projectJson.data ?? projectJson;
                        console.log("PROJECT DATA:", JSON.stringify(project, null, 2)); // 👈 keep briefly to verify shape
                        return { ...collab, project };
                    }
                } catch {}
                return collab;
            })
        );

        setInvitations(enriched);
    } catch {
    } finally {
        setLoading(false);
    }
}, []);

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    const handleAccept = async (invitation: CollabInvitation) => {
        setActioningId(invitation.id);
        setActionType("accept");
        try {
            const token = await getAuthToken();
            const res = await fetch(`/api/v1/collabs/${invitation.id}/accept`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.message || `Failed with status ${res.status}`);
            }
            setInvitations((prev) =>
                prev.map((inv) =>
                    inv.id === invitation.id ? { ...inv, status: "ACCEPTED" } : inv
                )
            );
            showToast("Collaboration accepted successfully!");
        } catch (err: any) {
            showToast(err?.message ?? "Failed to accept. Please try again.");
        } finally {
            setActioningId(null);
            setActionType(null);
        }
    };

    const handleReject = async (invitation: CollabInvitation) => {
        setActioningId(invitation.id);
        setActionType("reject");
        try {
            const token = await getAuthToken();
            const res = await fetch(`/api/v1/collabs/${invitation.id}/reject`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({}),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.message || `Failed with status ${res.status}`);
            }
            setInvitations((prev) =>
                prev.map((inv) =>
                    inv.id === invitation.id ? { ...inv, status: "REJECTED" } : inv
                )
            );
            showToast("Collaboration rejected.");
        } catch (err: any) {
            showToast(err?.message ?? "Failed to reject. Please try again.");
        } finally {
            setActioningId(null);
            setActionType(null);
        }
    };

    const filtered = invitations.filter((inv) =>
        activeFilter === "All" ? true : inv.status === activeFilter
    );

    if (profileLoading) {
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
                    <Sidebar activeItem="Collab Hub" />
                </div>

                <main className="flex-1 w-full px-6 lg:px-8 py-6 overflow-y-auto bg-white">
                    <Breadcrumb
                        crumbs={[
                            { label: "Dashboard", path: "/creative/dashboard" },
                            { label: "Collab Hub", path: "/creative/collab-hub" },
                            { label: "Invitations", path: "/creative/collab-hub/invitations" },
                        ]}
                    />

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-black">Collab Invitations</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Collaboration invites sent to you by other creatives
                        </p>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex items-center gap-2 mb-6 flex-wrap">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveFilter(tab)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    activeFilter === tab
                                        ? "bg-[#e84545] text-white"
                                        : "bg-white border border-gray-200 text-black hover:bg-gray-50"
                                }`}
                            >
                                {filterLabels[tab]}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-[#E2554F]" size={36} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-gray-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-black">No invitations found</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {activeFilter === "All"
                                    ? "You haven't received any collab invitations yet."
                                    : `No ${filterLabels[activeFilter].toLowerCase()} invitations.`}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map((invitation) => {
                                const inviter = invitation.invitedBy;
                                const inviterName =
                                    inviter?.fullName ?? inviter?.name ?? "Creative";
                                const inviterAvatar =
                                    inviter?.imageUrl ??
                                    inviter?.avatarUrl ??
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(inviterName)}&background=1a1a2e&color=fff&size=128`;

                                const status = statusConfig[invitation.status] ?? statusConfig["PENDING"];
                                const isPending = invitation.status === "PENDING";
                                const isActioning = actioningId === invitation.id;

                                return (
                                    <div
                                        key={invitation.id}
                                        className="bg-[#f9f9f9] border border-gray-100 rounded-xl overflow-hidden flex flex-col"
                                    >
                                        {/* Top accent */}
                                        <div className="h-1 w-full bg-[#e84545]" />

                                        <div className="p-4 flex flex-col flex-1">
                                            {/* Inviter info */}
                                            <div className="flex items-start gap-3 mb-4">
                                                <div className="relative shrink-0">
                                                    <Image
                                                        src={inviterAvatar}
                                                        alt={inviterName}
                                                        width={44}
                                                        height={44}
                                                        className="rounded-full object-cover"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1">
                                                        <p className="font-semibold text-black text-sm truncate">
                                                            {inviterName}
                                                        </p>
                                                        {inviter?.isVerified && <VerifiedIcon />}
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {inviter?.professionalRole ?? "Creative"}
                                                    </p>
                                                    {inviter?.overallRating != null && (
                                                        <div className="flex items-center gap-0.5 mt-0.5">
                                                            <StarIcon />
                                                            <span className="text-xs font-semibold text-black">
                                                                {inviter.overallRating.toFixed(1)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Status badge */}
                                                <span
                                                    className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${status.className}`}
                                                >
                                                    {status.icon}
                                                    {status.label}
                                                </span>
                                            </div>

                                            {/* Project + details */}
                                            <div className="flex flex-col gap-1.5 mb-4 text-xs">
                                                {invitation.project?.title && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-gray-400 w-20 shrink-0">Project</span>
                                                        <span className="text-black font-medium truncate">
                                                            {invitation.project.title}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-start gap-2">
                                                    <span className="text-gray-400 w-20 shrink-0">Role</span>
                                                    <span className="text-black font-medium capitalize">
                                                        {invitation.role?.toLowerCase() ?? "—"}
                                                    </span>
                                                </div>
                                                {invitation.proposedFee != null && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-gray-400 w-20 shrink-0">Fee</span>
                                                        <span className="text-black font-medium">
                                                            {invitation.currency ?? "$"}{invitation.proposedFee.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                                {invitation.timeline && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-gray-400 w-20 shrink-0">Timeline</span>
                                                        <span className="text-black font-medium">{invitation.timeline}</span>
                                                    </div>
                                                )}
                                                {invitation.deliveryDate && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-gray-400 w-20 shrink-0">Due Date</span>
                                                        <span className="text-black font-medium">
                                                            {new Date(invitation.deliveryDate).toLocaleDateString("en-GB", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                                {invitation.workMode && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-gray-400 w-20 shrink-0">Work Mode</span>
                                                        <span className="text-black font-medium capitalize">
                                                            {invitation.workMode.replace("_", " ").toLowerCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                {invitation.description && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-gray-400 w-20 shrink-0">Note</span>
                                                        <span className="text-black line-clamp-2">
                                                            {invitation.description}
                                                        </span>
                                                    </div>
                                                )}
                                                {invitation.createdAt && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-gray-400 w-20 shrink-0">Received</span>
                                                        <span className="text-gray-500">
                                                            {new Date(invitation.createdAt).toLocaleDateString("en-GB", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions — only show for PENDING */}
                                            {isPending && (
                                                <div className="flex gap-2 mt-auto">
                                                    <button
                                                        onClick={() => handleReject(invitation)}
                                                        disabled={isActioning}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                    >
                                                        {isActioning && actionType === "reject" ? (
                                                            <Loader2 size={11} className="animate-spin" />
                                                        ) : (
                                                            <XCircle size={13} className="text-red-400" />
                                                        )}
                                                        Decline
                                                    </button>
                                                    <button
                                                        onClick={() => handleAccept(invitation)}
                                                        disabled={isActioning}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#e84545] hover:bg-[#d03535] text-xs font-semibold text-white transition-colors disabled:opacity-50"
                                                    >
                                                        {isActioning && actionType === "accept" ? (
                                                            <Loader2 size={11} className="animate-spin" />
                                                        ) : (
                                                            <CheckCircle size={13} />
                                                        )}
                                                        Accept
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
            })}
                        </div>
                    )}
                </main>
            </div>

            {/* Toast */}
            {toastMessage && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg animate-fade-in">
                    {toastMessage}
                </div>
            )}

            <div className="pb-10" />
        </div>
    );
}