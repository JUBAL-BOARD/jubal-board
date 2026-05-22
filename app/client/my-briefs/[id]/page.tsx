"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "../../../components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "../../../components/client/my-desk/breadcrumb";
import {
    X, Loader2, MapPin, Calendar, Clock, Users,
    Trash2, Pencil, Eye, BadgeCheck, ChevronLeft
} from "lucide-react";

type BriefStatus = "ACTIVE" | "ASSIGNED" | "EXPIRED" | "CLOSED";

interface Skill { id: string; name: string; }
interface Pitch {
    id: string;
    briefId: string;
    creativeId: string;
    coverNote: string;
    proposedAmount: number;
    deliveryDate: string;
    currency: string;
    status: string;
    createdAt: string;
    isCollaborative: boolean;
    paymentMode: string;
    milestones: {
        id: string;
        title: string;
        amount: number;
        dueDate: string;
        notes: string;
    }[];
    creativeProfile: {
        fullName: string;
        overallRating: number;
        professionalRole: string;
        isPremium: boolean;
    };
}

interface BriefDetail {
    id: string;
    jobTitle: string;
    jobDescription: string;
    budgetMin: number;
    budgetMax: number;
    currency: string;
    deliveryDate: string;
    timeline: string;
    status: BriefStatus;
    location: string | null;
    modeOfProject: string;
    numberOfCreatives: number;
    projectCategoryId: string;
    category?: { id: string; name: string };
    skills: Skill[];
    referenceFileUrls: string[];
    pitchCount: number;
    createdAt: string;
}

type ClientProfile = {
    name: string;
    clientProfile: { fullName: string; imageUrl: string | null };
};

const statusStyles: Record<BriefStatus, string> = {
    ACTIVE: "bg-yellow-100 text-yellow-700",
    ASSIGNED: "bg-green-100 text-green-600",
    EXPIRED: "bg-red-100 text-red-400",
    CLOSED: "bg-gray-800 text-white",
};

const statusLabel: Record<BriefStatus, string> = {
    ACTIVE: "Active",
    ASSIGNED: "Assigned",
    EXPIRED: "Expired",
    CLOSED: "Closed",
};

function formatDate(iso: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
    });
}

function formatBudget(min: number, max: number, currency: string) {
    const symbol = currency === "NGN" ? "₦" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
    if (!min && !max) return "—";
    if (min && max) return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
    return `${symbol}${(min || max).toLocaleString()}`;
}

const modeLabel: Record<string, string> = {
    VIRTUAL: "Virtual",
    IN_PERSON: "On-site",
    HYBRID: "Hybrid",
};

// ── Confirm Delete Modal ───────────────────────────────────────────────────
const ConfirmModal: React.FC<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}> = ({ title, message, onConfirm, onCancel, loading }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl px-8 py-8 w-[90%] max-w-sm flex flex-col items-center text-center shadow-2xl">
            <h2 className="text-lg font-bold text-black mb-2">{title}</h2>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <div className="flex gap-3 w-full">
                <button
                    onClick={onCancel}
                    className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-1 bg-red-500 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                    {loading ? "Processing..." : "Confirm"}
                </button>
            </div>
        </div>
    </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────
const BriefDetailPage: React.FC = () => {
    const { id } = useParams();
    const router = useRouter();

    const [brief, setBrief] = useState<BriefDetail | null>(null);
    const [pitches, setPitches] = useState<Pitch[]>([]);
    const [profile, setProfile] = useState<ClientProfile | null>(null);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "pitches">("overview");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const tokenRes = await fetch("/api/auth/session/token");
                const { token } = await tokenRes.json();
                const headers = { Authorization: `Bearer ${token}` };

                const [briefRes, profileRes, categoriesRes] = await Promise.all([
                    fetch(`/api/v1/briefs/${id}`, { headers, credentials: "include" }),
                    fetch("/api/v1/clients/me", { headers, credentials: "include" }),
                    fetch("/api/v1/briefs/categories", { headers }),
                ]);

                const briefJson = await briefRes.json();
                const profileJson = await profileRes.json();
                const categoriesJson = await categoriesRes.json();

                setBrief(briefJson.data ?? briefJson);
                setProfile(profileJson.data ?? profileJson);
                setCategories(Array.isArray(categoriesJson) ? categoriesJson : categoriesJson.data ?? []);

                // Fetch pitches for this brief
                const pitchesRes = await fetch(`/api/v1/briefs/${id}/pitches`, { headers, credentials: "include" });
                console.log("Pitches status:", pitchesRes.status);
                if (pitchesRes.ok) {
                    const pitchesJson = await pitchesRes.json();
                    const pitchList = pitchesJson.data?.pitches ?? pitchesJson.data ?? pitchesJson ?? [];
                    setPitches(Array.isArray(pitchList) ? pitchList : []);
                }
            } catch {
                setError("Failed to load brief details.");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    const getCategoryName = (categoryId: string) =>
        categories.find((c) => c.id === categoryId)?.name ?? "—";

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const tokenRes = await fetch("/api/auth/session/token");
            const { token } = await tokenRes.json();
            const res = await fetch(`/api/v1/briefs/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to delete brief.");
            router.push("/client/my-briefs");
        } catch (e: any) {
            setError(e.message ?? "Something went wrong.");
            setShowDeleteModal(false);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-white">
                <Loader2 className="animate-spin text-[#E05C5C] mb-4" size={48} />
                <p className="text-gray-500 font-medium">Loading Brief...</p>
            </div>
        );
    }

    if (!brief) {
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-white">
                <p className="text-gray-500 font-medium">Brief not found.</p>
                <button onClick={() => router.push("/client/my-briefs")} className="mt-4 text-[#E05C5C] text-sm font-semibold">
                    ← Back to Briefs
                </button>
            </div>
        );
    }

    const userName = profile?.clientProfile?.fullName || profile?.name || "Client";
    const userAvatar =
        profile?.clientProfile?.imageUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {showDeleteModal && (
                <ConfirmModal
                    title="Delete Brief?"
                    message="This action cannot be undone. The brief and all its pitches will be permanently removed."
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteModal(false)}
                    loading={deleting}
                />
            )}

            <DashboardTopbar
                userName={userName}
                userAvatar={userAvatar}
                sidebarOpen={sidebarOpen}
                onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            />

            <div className="flex flex-1 relative">
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}
                <div
                    className={`
            fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10
          `}
                >
                    <button className="absolute top-4 right-4 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
                        <X size={22} />
                    </button>
                    <Sidebar activeItem="My Briefs" />
                </div>

                <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
                    <Breadcrumb
                        crumbs={[
                            { label: "Dashboard", path: "/client/dashboard" },
                            { label: "My Briefs", path: "/client/my-briefs" },
                            { label: brief.jobTitle ?? "Brief Details" },
                        ]}
                    />

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
                            {error}
                            <button onClick={() => setError(null)}><X size={14} /></button>
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push("/client/my-briefs")}
                                className="p-2 rounded-lg text-black border border-black hover:bg-black hover:text-white transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-heading font-extrabold text-black">{brief.jobTitle}</h1>
                                <p className="text-sm text-gray-900 mt-0.5">Posted {formatDate(brief.createdAt)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusStyles[brief.status]}`}>
                                {statusLabel[brief.status]}
                            </span>
                            <button
                                onClick={() => router.push(`/client/my-briefs/${id}/edit`)}
                                className="flex items-center gap-1.5 border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Pencil size={14} />
                                Edit
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center gap-1.5 bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-gray-100">
                        {(["overview", "pitches"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2.5 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${activeTab === tab
                                    ? "border-[#E05C5C] text-[#E05C5C]"
                                    : "border-transparent text-gray-500 hover:text-black"
                                    }`}
                            >
                                {tab === "pitches" ? `Pitches (${pitches.length})` : "Overview"}
                            </button>
                        ))}
                    </div>

                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left — main info */}
                            <div className="lg:col-span-2 flex flex-col gap-5">

                                {/* Reference image */}
                                {brief.referenceFileUrls?.length > 0 && (
                                    <div className="rounded-xl overflow-hidden border border-gray-100">
                                        <img
                                            src={brief.referenceFileUrls[0]}
                                            alt={brief.jobTitle}
                                            className="w-full max-h-72 object-cover"
                                        />
                                        {brief.referenceFileUrls.length > 1 && (
                                            <div className="flex gap-2 p-3 bg-gray-50 overflow-x-auto">
                                                {brief.referenceFileUrls.slice(1).map((url, i) => (
                                                    <img
                                                        key={i}
                                                        src={url}
                                                        alt={`Reference ${i + 2}`}
                                                        className="w-16 h-16 object-cover rounded-lg shrink-0 border border-gray-200"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Description */}
                                <div className="bg-[#fafafa] rounded-xl p-5">
                                    <h2 className="font-bold text-black text-base mb-2">Job Description</h2>
                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {brief.jobDescription}
                                    </p>
                                </div>

                                {/* Skills */}
                                {brief.skills?.length > 0 && (
                                    <div className="bg-[#fafafa] rounded-xl p-5">
                                        <h2 className="font-bold text-black text-base mb-3">Required Skills</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {brief.skills.map((skill) => (
                                                <span
                                                    key={skill.id}
                                                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700"
                                                >
                                                    {skill.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right — meta info */}
                            <div className="flex flex-col gap-4">
                                <div className="bg-[#fafafa] rounded-xl p-5 flex flex-col gap-4">
                                    <h2 className="font-bold text-black text-base">Brief Details</h2>

                                    <DetailRow label="Category" value={getCategoryName(brief.projectCategoryId)} />
                                    <DetailRow label="Budget" value={formatBudget(brief.budgetMin, brief.budgetMax, brief.currency)} />
                                    <DetailRow label="Timeline" value={brief.timeline ?? "—"} />
                                    <DetailRow
                                        label="Delivery Date"
                                        value={formatDate(brief.deliveryDate)}
                                        icon={<Calendar size={13} className="text-gray-400" />}
                                    />
                                    <DetailRow
                                        label="Mode"
                                        value={modeLabel[brief.modeOfProject] ?? brief.modeOfProject ?? "—"}
                                    />
                                    <DetailRow
                                        label="Location"
                                        value={brief.location ?? "Not specified"}
                                        icon={<MapPin size={13} className="text-gray-400" />}
                                    />
                                    <DetailRow
                                        label="Creatives Needed"
                                        value={String(brief.numberOfCreatives ?? 1)}
                                        icon={<Users size={13} className="text-gray-400" />}
                                    />
                                    <DetailRow
                                        label="Pitches Received"
                                        value={String(pitches.length)}
                                        icon={<Eye size={13} className="text-gray-400" />}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pitches Tab */}
                    {activeTab === "pitches" && (
                        <div className="flex flex-col gap-4">
                            {pitches.length === 0 ? (
                                <div className="text-center py-16 text-gray-900 text-sm">
                                    No pitches received yet.
                                </div>
                            ) : (
                                pitches.map((pitch) => (
                                    <div key={pitch.id} className="bg-[#fafafa] border border-gray-100 rounded-xl p-5 flex items-start gap-4">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(pitch.creativeProfile?.fullName ?? "C")}&background=1a1a2e&color=fff&size=128`}
                                            alt={pitch.creativeProfile?.fullName}
                                            className="w-12 h-12 rounded-full object-cover shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="font-bold text-black text-sm">
                                                    {pitch.creativeProfile?.fullName ?? "Creative"}
                                                </span>
                                                {pitch.creativeProfile?.isPremium && (
                                                    <BadgeCheck fill="blue" stroke="white" size={15} />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <p className="text-xs text-black flex items-center gap-1">
                                                    <Clock size={11} />
                                                    {formatDate(pitch.createdAt)}
                                                </p>
                                                <p className="text-xs text-black">
                                                    ⭐ {pitch.creativeProfile?.overallRating ?? "—"}
                                                </p>
                                                <p className="text-xs text-black italic">
                                                    {pitch.creativeProfile?.professionalRole ?? ""}
                                                </p>
                                            </div>
                                            <p className="text-sm text-black leading-relaxed line-clamp-3">
                                                {pitch.coverNote}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2">
                                                {pitch.proposedAmount && (
                                                    <p className="text-xs font-semibold text-[#E05C5C]">
                                                        Rate: {formatBudget(pitch.proposedAmount, 0, pitch.currency)}
                                                    </p>
                                                )}
                                                {pitch.deliveryDate && (
                                                    <p className="text-xs text-black flex items-center gap-1">
                                                        <Clock size={11} />
                                                        Delivery: {formatDate(pitch.deliveryDate)}
                                                    </p>
                                                )}
                                                {pitch.paymentMode && (
                                                    <p className="text-xs text-black">
                                                        {pitch.paymentMode === "MILESTONE" ? `${pitch.milestones?.length ?? 0} milestones` : "Flat payment"}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${pitch.status === "ACCEPTED"
                                                ? "bg-green-100 text-green-600"
                                                : pitch.status === "REJECTED"
                                                    ? "bg-red-100 text-red-500"
                                                    : "bg-yellow-100 text-yellow-600"
                                            }`}>
                                            {pitch.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

// ── Small helper component ─────────────────────────────────────────────────
const DetailRow: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500 flex items-center gap-1">{icon}{label}</span>
        <span className="text-xs font-semibold text-black text-right">{value}</span>
    </div>
);

export default BriefDetailPage;