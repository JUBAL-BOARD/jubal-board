"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/app/components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/client/my-desk/breadcrumb";
import {
    X,
    Loader2,
    Star,
    BadgeCheck,
    CheckCircle,
    FileImage,
} from "lucide-react";

interface Milestone {
    id: string;
    title: string;
    amount: number;
    dueDate: string;
    notes: string;
}

interface Pitch {
    id: string;
    briefId: string;
    briefTitle?: string;
    creativeId: string;
    coverNote: string;
    proposedAmount: number;
    currency: string;
    deliveryDate: string;
    status: string;
    paymentMode: string;
    isCollaborative: boolean;
    createdAt: string;
    milestones: Milestone[];
    creativeProfile: {
        fullName: string;
        overallRating: number;
        professionalRole: string;
        isPremium: boolean;
        avatarUrl?: string;
    };
    brief?: {
        id: string;
        jobTitle: string;
        description?: string;
        category?: string;
        skills?: string[];
        budgetMin?: number;
        budgetMax?: number;
        budget?: number;
        currency?: string;
        timeline?: string;
        deadline?: string;
        referenceFiles?: string[];
    };
}

type ClientProfile = {
    name: string;
    clientProfile: { fullName: string; imageUrl: string | null };
};

function formatDate(iso: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
    });
}

function formatBudget(amount: number, currency?: string) {
    const symbol =
        currency === "NGN" ? "₦" :
            currency === "EUR" ? "€" :
                currency === "GBP" ? "£" : "$";
    return `${symbol}${amount?.toLocaleString() ?? "—"}`;
}

function getFileName(url: string) {
    try {
        return url.split("/").pop() ?? url;
    } catch {
        return url;
    }
}

const SERVICE_CHARGE_PERCENT = 0.15;

const ConfirmModal: React.FC<{
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}> = ({ onConfirm, onCancel, loading }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl px-8 py-8 w-[90%] max-w-sm flex flex-col items-center text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-green-100">
                <CheckCircle size={36} className="text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-black mb-2">Confirm Hire?</h2>
            <p className="text-sm text-gray-500 mb-6">
                This will create a project and take you to payment to get started.
            </p>
            <div className="flex gap-3 w-full">
                <button
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-1 text-white rounded-lg py-2.5 text-sm font-semibold bg-[#E05C5C] hover:bg-[#c94c4c] transition-colors disabled:opacity-60"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 size={14} className="animate-spin" />
                            Processing...
                        </span>
                    ) : (
                        "Yes, Proceed to Payment"
                    )}
                </button>
            </div>
        </div>
    </div>
);

const OrderReviewPage: React.FC = () => {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const passedName = searchParams.get("name");
    const passedAvatar = searchParams.get("avatar");

    const [pitch, setPitch] = useState<Pitch | null>(null);
    const [profile, setProfile] = useState<ClientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const tokenRes = await fetch("/api/auth/session/token");
                const { token } = await tokenRes.json();
                const headers = {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                };

                const [pitchRes, profileRes] = await Promise.all([
                    fetch(`/api/v1/pitches/${id}`, { headers, credentials: "include" }),
                    fetch("/api/v1/clients/me", { headers, credentials: "include" }),
                ]);

                const pitchJson = await pitchRes.json();
                console.log("PITCH DATA:", JSON.stringify(pitchJson, null, 2));
                const profileJson = await profileRes.json();
                const pitchData: Pitch = pitchJson.data ?? pitchJson;

                if (pitchData.briefId && !pitchData.brief) {
                    try {
                        const briefRes = await fetch(`/api/v1/briefs/${pitchData.briefId}`, {
                            headers,
                            credentials: "include",
                        });
                        if (briefRes.ok) {
                            const briefJson = await briefRes.json();
                            pitchData.brief = briefJson.data ?? briefJson;
                        }
                    } catch { /* fail silently */ }
                }

                setPitch(pitchData);
                setProfile(profileJson.data ?? profileJson);
            } catch {
                setError("Failed to load order details.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // ── FIX: No longer calls /accept here.
    // The pitch is only marked APPROVED after payment succeeds on the payment page.
    const handleConfirmHire = async () => {
        setActionLoading(true);
        try {
            const tokenRes = await fetch("/api/auth/session/token");
            const { token } = await tokenRes.json();
            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            const res = await fetch(`/api/v1/pitches/${id}/accept`, {
                method: "POST",
                headers,
                credentials: "include",
            });

            const json = await res.json();
            console.log("ACCEPT FULL RESPONSE:", JSON.stringify(json, null, 2));
            console.log("STATUS:", res.status);
            console.log("HEADERS:", JSON.stringify([...res.headers.entries()]));

            // Handle "already accepted" case
            if (!res.ok && json.message?.toLowerCase().includes("no longer pending")) {
                const projectsRes = await fetch(`/api/v1/projects`, { headers, credentials: "include" });
                const projectsJson = await projectsRes.json();
                const list = Array.isArray(projectsJson.data) ? projectsJson.data
                    : Array.isArray(projectsJson) ? projectsJson : [];
                const project = list.find((p: any) => p.pitchId === id) ?? list[0];
                const projectId = project?.id;
                if (!projectId) throw new Error("Could not find existing project.");
                setShowConfirm(false);
                router.push(`/client/pitches/${id}/payment?pitchId=${id}&projectId=${projectId}&name=${passedName ?? ""}&avatar=${passedAvatar ?? ""}`);
                return;
            }

            if (!res.ok) throw new Error(json.message ?? "Failed to create project.");

            // ── Robustly extract projectId from any nesting level ──
            const projectId =
                json?.data?.projectId ??
                json?.data?.id ??
                json?.data?.project?.id ??   // <-- common extra nesting
                json?.projectId ??
                json?.id ??
                json?.project?.id;           // <-- another common shape

            console.log("EXTRACTED projectId:", projectId);

            // ── Fallback: if still missing, fetch from /projects ──
            if (!projectId) {
                console.warn("No projectId in accept response — fetching from /projects");
                const projectsRes = await fetch(`/api/v1/projects`, { headers, credentials: "include" });
                const projectsJson = await projectsRes.json();
                const list = Array.isArray(projectsJson.data) ? projectsJson.data
                    : Array.isArray(projectsJson) ? projectsJson : [];
                const project = list.find((p: any) => p.pitchId === id) ?? list[0];
                const fallbackId = project?.id;
                if (!fallbackId) throw new Error("Could not find project after accept.");
                setShowConfirm(false);
                router.push(`/client/pitches/${id}/payment?pitchId=${id}&projectId=${fallbackId}&name=${passedName ?? ""}&avatar=${passedAvatar ?? ""}`);
                return;
            }

            setShowConfirm(false);
            router.push(`/client/pitches/${id}/payment?pitchId=${id}&projectId=${projectId}&name=${passedName ?? ""}&avatar=${passedAvatar ?? ""}`);
        } catch (e: any) {
            console.error("handleConfirmHire error:", e);
            setError(e.message ?? "Something went wrong.");
            setShowConfirm(false);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-white">
                <Loader2 className="animate-spin text-[#E05C5C]" size={40} />
            </div>
        );
    }

    if (!pitch) {
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-white">
                <p className="text-gray-500">Order details not found.</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 text-[#E05C5C] text-sm font-semibold"
                >
                    ← Go Back
                </button>
            </div>
        );
    }

    const userName = profile?.clientProfile?.fullName || profile?.name || "Client";
    const userAvatar =
        profile?.clientProfile?.imageUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

    const cp = pitch.creativeProfile;
    const creativeName = cp?.fullName ?? passedName ?? "Creative";
    const creativeAvatar =
        passedAvatar ||
        cp?.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(creativeName)}&background=1a1a2e&color=fff&size=128`;

    const brief = pitch.brief;
    const serviceCharge = Math.round((pitch.proposedAmount ?? 0) * SERVICE_CHARGE_PERCENT);
    const total = (pitch.proposedAmount ?? 0) + serviceCharge;
    const currency = pitch.currency;

    const deliverables = pitch.milestones?.length > 0
        ? pitch.milestones.map((m) => m.title)
        : [];

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {showConfirm && (
                <ConfirmModal
                    onConfirm={handleConfirmHire}
                    onCancel={() => !actionLoading && setShowConfirm(false)}
                    loading={actionLoading}
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
                    <div
                        className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
                <div
                    className={`
                        fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
                        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10
                    `}
                >
                    <button
                        className="absolute top-4 right-4 z-50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={22} />
                    </button>
                    <Sidebar activeItem="Pitches" />
                </div>

                <main className="flex-1 w-full px-4 lg:px-8 py-6 overflow-y-auto">
                    <Breadcrumb
                        crumbs={[
                            { label: "Dashboard", path: "/client/dashboard" },
                            { label: "Incoming Pitches", path: "/client/pitches" },
                            { label: "Creative Pitch", path: `/client/pitches/${id}` },
                            { label: "Order Review" },
                        ]}
                    />

                    <h1 className="text-2xl font-extrabold text-black mt-4 mb-5">
                        Order Review
                    </h1>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
                            {error}
                            <button onClick={() => setError(null)}>
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <div className="w-full flex flex-col gap-4">

                        {/* ── Brief Summary ── */}
                        <div className="bg-[#f5f5f5] rounded-2xl p-6">
                            <h2 className="font-bold text-black text-base mb-4">Brief Summary</h2>
                            <div className="flex flex-col gap-3">
                                <SummaryRow
                                    label="Job Title"
                                    value={brief?.jobTitle ?? pitch.briefTitle ?? "—"}
                                />
                                {brief?.category && (
                                    <SummaryRow label="Project Category" value={brief.category} />
                                )}
                                {brief?.skills && brief.skills.length > 0 && (
                                    <SummaryRow label="Specific Skill(s)" value={brief.skills.join(", ")} />
                                )}
                                {brief?.description && (
                                    <SummaryRow label="Job Description" value={brief.description} />
                                )}
                                {(brief?.budgetMin || brief?.budget) && (
                                    <SummaryRow
                                        label="Set your Budget"
                                        value={
                                            brief.budgetMin && brief.budgetMax
                                                ? `${formatBudget(brief.budgetMin, brief.currency ?? currency)} - ${formatBudget(brief.budgetMax, brief.currency ?? currency)}`
                                                : formatBudget(brief.budget ?? 0, brief.currency ?? currency)
                                        }
                                    />
                                )}
                                {brief?.referenceFiles && brief.referenceFiles.length > 0 && (
                                    <div className="flex gap-4">
                                        <span className="text-sm text-gray-500 w-40 shrink-0">
                                            Attach Reference File
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {brief.referenceFiles.map((file, i) => (
                                                <a
                                                    key={i}
                                                    href={file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 border border-[#E05C5C] text-[#E05C5C] text-xs font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                                                >
                                                    <FileImage size={12} />
                                                    {getFileName(file)}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {brief?.timeline && (
                                    <SummaryRow label="Timeline" value={brief.timeline} />
                                )}
                                {(brief?.deadline || pitch.deliveryDate) && (
                                    <SummaryRow
                                        label="Delivery Date"
                                        value={formatDate(brief?.deadline ?? pitch.deliveryDate)}
                                    />
                                )}
                            </div>
                        </div>

                        {/* ── Creative ── */}
                        <div className="bg-[#f5f5f5] rounded-2xl p-5">
                            <h2 className="font-bold text-black text-base mb-4">Creative</h2>
                            <div className="flex items-start gap-4 relative">
                                {cp?.isPremium && (
                                    <span className="absolute top-0 right-0 bg-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        Premium
                                    </span>
                                )}
                                <img
                                    src={creativeAvatar}
                                    alt={creativeName}
                                    className="w-16 h-16 rounded-full object-cover shrink-0"
                                />
                                <div className="flex-1 min-w-0 pr-20">
                                    <span className="font-bold text-black text-base">{creativeName}</span>
                                    <div className="flex items-center gap-1.5 mt-0.5 mb-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                                        <span className="text-xs text-green-600 font-medium">Online</span>
                                    </div>
                                    <div className="mb-3">
                                        <span className="text-xs text-gray-500 block mb-1">
                                            Verification Status:
                                        </span>
                                        <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-md">
                                            <BadgeCheck size={11} />
                                            Verified
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                            <span className="font-semibold text-black">
                                                {cp?.overallRating?.toFixed(1) ?? "—"}
                                            </span>
                                            <span className="text-gray-400">(35 Reviews)</span>
                                        </span>
                                        <span className="text-gray-300">|</span>
                                        <span>
                                            <span className="font-semibold text-black">12</span> Completed Projects
                                        </span>
                                        <span className="text-gray-300">|</span>
                                        <span>
                                            <span className="font-semibold text-black">100%</span> Job Success
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Deliverables ── */}
                        {deliverables.length > 0 && (
                            <div className="bg-[#f5f5f5] rounded-2xl p-5">
                                <h2 className="font-bold text-black text-base mb-3">Deliverables</h2>
                                <div className="flex flex-wrap gap-2">
                                    {deliverables.map((item, i) => (
                                        <span
                                            key={i}
                                            className="bg-white border border-gray-200 text-sm text-gray-700 font-medium px-4 py-1.5 rounded-full"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Pricing Breakdown ── */}
                        <div className="bg-[#f5f5f5] rounded-2xl p-5">
                            <h2 className="font-bold text-black text-base mb-4">Pricing Breakdown</h2>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Pitched Amount</span>
                                    <span className="text-gray-800">
                                        {formatBudget(pitch.proposedAmount, currency)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Service Charge (15%)</span>
                                    <span className="text-gray-800">
                                        {formatBudget(serviceCharge, currency)}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                                    <span className="font-bold text-black text-sm">Total Amount</span>
                                    <span className="font-bold text-black text-sm">
                                        {formatBudget(total, currency)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── CTA Buttons ── */}
                        <div className="flex items-center justify-end gap-3 pt-2 pb-8">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 bg-[#1a1a2e] text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-[#121220] transition-colors"
                            >
                                <X size={15} />
                                {pitch.status === "APPROVED" ? "Go Back" : "Cancel"}
                            </button>

                            {pitch.status !== "APPROVED" && (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className="bg-[#E05C5C] hover:bg-[#c94c4c] text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
                                >
                                    Continue to Payment
                                </button>
                            )}

                            {pitch.status === "APPROVED" && (
                                <div className="bg-green-50 text-green-600 text-sm font-semibold px-6 py-3 rounded-xl">
                                    ✓ Order Confirmed
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

const SummaryRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex gap-4">
        <span className="text-sm text-gray-500 w-40 shrink-0">{label}</span>
        <span className="text-sm text-gray-800 flex-1">{value}</span>
    </div>
);

export default OrderReviewPage;