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
  XCircle,
  ChevronDown,
  Calendar,
  Clock,
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

function formatBudget(amount: number, currency: string) {
  const symbol =
    currency === "NGN" ? "₦" :
      currency === "EUR" ? "€" :
        currency === "GBP" ? "£" : "$";
  return `${symbol}${amount?.toLocaleString() ?? "—"}`;
}

const ConfirmModal: React.FC<{
  type: "accept" | "reject";
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ type, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl px-8 py-8 w-[90%] max-w-sm flex flex-col items-center text-center shadow-2xl">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${type === "accept" ? "bg-green-100" : "bg-red-100"}`}>
        {type === "accept"
          ? <CheckCircle size={36} className="text-green-500" />
          : <XCircle size={36} className="text-red-500" />}
      </div>
      <h2 className="text-lg font-bold text-black mb-2">
        {type === "accept" ? "Hire this Creative?" : "Reject this Pitch?"}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        {type === "accept"
          ? "Hiring this creative will create a project and notify them to get started."
          : "The creative will be notified that their pitch was not selected."}
      </p>
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
          className={`flex-1 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${type === "accept" ? "bg-[#E05C5C] hover:bg-[#c94c4c]" : "bg-red-500 hover:bg-red-600"
            }`}
        >
          {loading ? "Processing..." : type === "accept" ? "Yes, Hire Now" : "Yes, Reject"}
        </button>
      </div>
    </div>
  </div>
);

const PitchDetailPage: React.FC = () => {
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
  const [confirmModal, setConfirmModal] = useState<"accept" | "reject" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [pricingOpen, setPricingOpen] = useState(true);

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
        const profileJson = await profileRes.json();

        setPitch(pitchJson.data ?? pitchJson);
        setProfile(profileJson.data ?? profileJson);
      } catch {
        setError("Failed to load pitch details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAction = async (type: "accept" | "reject") => {
    setActionLoading(true);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      const res = await fetch(`/api/v1/pitches/${id}/${type}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `Failed to ${type} pitch.`);
      }

      setConfirmModal(null);
      setActionSuccess(
        type === "accept"
          ? "Pitch accepted! A project has been created."
          : "Pitch rejected."
      );
      setPitch((prev) =>
        prev ? { ...prev, status: type === "accept" ? "ACCEPTED" : "REJECTED" } : prev
      );
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
      setConfirmModal(null);
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
        <p className="text-gray-500">Pitch not found.</p>
        <button
          onClick={() => router.push("/client/pitches")}
          className="mt-4 text-[#E05C5C] text-sm font-semibold"
        >
          ← Back to Pitches
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

  const isPending = pitch.status === "PENDING";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {confirmModal && (
        <ConfirmModal
          type={confirmModal}
          onConfirm={() => handleAction(confirmModal)}
          onCancel={() => setConfirmModal(null)}
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
              { label: "Creative Pitch" },
            ]}
          />

          <h1 className="text-2xl font-extrabold text-black mt-4 mb-5">
            Creative Pitch
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
              {error}
              <button onClick={() => setError(null)}><X size={14} /></button>
            </div>
          )}

          {actionSuccess && (
            <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
              {actionSuccess}
              <button onClick={() => setActionSuccess(null)}><X size={14} /></button>
            </div>
          )}

          <div className="w-full flex flex-col gap-4">

            {/* ── Creative Card ── */}
            <div className="bg-[#f5f5f5] rounded-2xl p-5 flex items-start gap-4 relative">
              {cp?.isPremium && (
                <span className="absolute top-4 right-4 bg-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full">
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
                  <span className="text-xs text-gray-500 block mb-1">Verification Status:</span>
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
                    <span className="text-gray-400">Rating</span>
                  </span>
                  {cp?.professionalRole && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-600">{cp.professionalRole}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Pitch Point ── */}
            <div className="bg-[#f5f5f5] rounded-2xl p-5">
              <h2 className="font-bold text-black text-base mb-3">Pitch Point</h2>
              <div className="bg-white rounded-xl p-4 min-h-[100px]">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {pitch.coverNote ?? "—"}
                </p>
              </div>
            </div>

            {/* ── Milestones as Deliverables ── */}
            {pitch.milestones?.length > 0 && (
              <div className="bg-[#f5f5f5] rounded-2xl p-5">
                <h2 className="font-bold text-black text-base mb-3">Deliverables</h2>
                <div className="flex flex-wrap gap-2">
                  {pitch.milestones.map((m) => (
                    <span
                      key={m.id}
                      className="bg-white border border-gray-200 text-sm text-gray-700 font-medium px-4 py-1.5 rounded-full"
                    >
                      {m.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Pricing ── */}
            <div className="bg-[#f5f5f5] rounded-2xl p-5">
              <h2 className="font-bold text-black text-base mb-3">Pricing</h2>
              <button
                onClick={() => setPricingOpen((v) => !v)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between text-sm hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-black">
                  {formatBudget(pitch.proposedAmount, pitch.currency)}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${pricingOpen ? "rotate-180" : ""}`}
                />
              </button>

              {pricingOpen && (
                <div className="mt-2 bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Payment Mode</span>
                  <span className="font-semibold text-black">
                    {pitch.paymentMode === "MILESTONE" ? "Milestone" : "Flat Payment"}
                  </span>
                </div>
              )}
            </div>

            {/* ── Delivery Schedule ── */}
            <div className="bg-[#f5f5f5] rounded-2xl p-5">
              <h2 className="font-bold text-black text-base mb-4">Delivery Schedule</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Payment Mode / Timeline */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Timeline</label>
                  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between text-sm text-gray-700">
                    <span>
                      {pitch.paymentMode === "MILESTONE" ? "Milestone-based" : "One-time"}
                    </span>
                    <Clock size={15} className="text-gray-400" />
                  </div>
                </div>

                {/* Delivery Date */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Delivery Date</label>
                  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between text-sm text-gray-700">
                    <span>{formatDate(pitch.deliveryDate)}</span>
                    <Calendar size={15} className="text-gray-400" />
                  </div>
                </div>

                {/* Milestones */}
                {pitch.milestones?.slice(0, 2).map((m, i) => (
                  <div key={m.id}>
                    <label className="block text-sm text-gray-600 mb-1.5">
                      Milestone {i + 1} <span className="text-gray-400">(Optional)</span>
                    </label>
                    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between text-sm text-gray-700">
                      <span className="truncate mr-2">{m.title}</span>
                      <span className="text-xs text-gray-400 shrink-0">{formatDate(m.dueDate)}</span>
                    </div>
                  </div>
                ))}

                {/* Fill empty milestone slots if fewer than 2 */}
                {(pitch.milestones?.length ?? 0) === 0 && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1.5">
                        Milestone 1 <span className="text-gray-400">(Optional)</span>
                      </label>
                      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between text-sm text-gray-400">
                        <span>—</span>
                        <ChevronDown size={15} className="text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1.5">
                        Milestone 2 <span className="text-gray-400">(Optional)</span>
                      </label>
                      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between text-sm text-gray-400">
                        <span>—</span>
                        <Calendar size={15} className="text-gray-400" />
                      </div>
                    </div>
                  </>
                )}

                {(pitch.milestones?.length ?? 0) === 1 && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">
                      Milestone 2 <span className="text-gray-400">(Optional)</span>
                    </label>
                    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between text-sm text-gray-400">
                      <span>—</span>
                      <Calendar size={15} className="text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── CTA Buttons ── */}
            {isPending && (
              <div className="flex items-center justify-end gap-3 pt-2 pb-6">
                <button
                  onClick={() => router.push("/client/pitches")}
                  className="flex items-center gap-2 bg-[#1a1a2e] text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-[#121220] transition-colors"
                >
                  <X size={15} />
                  Cancel
                </button>
                <button
                  onClick={() =>
                    router.push(
                      `/client/pitches/${pitch.id}/review?name=${encodeURIComponent(creativeName)}&avatar=${encodeURIComponent(creativeAvatar)}`
                    )
                  }
                  className="bg-[#E05C5C] hover:bg-[#c94c4c] text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
                >
                  Hire Now
                </button>
              </div>
            )}

            {!isPending && (
              <div className="flex flex-col gap-3 pt-2 pb-6">
                <div className={`rounded-xl p-4 text-center text-sm font-semibold ${pitch.status === "APPROVED"
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-500"
                  }`}>
                  {pitch.status === "APPROVED"
                    ? "✓ You accepted this pitch"
                    : "✗ You rejected this pitch"}
                </div>

                {pitch.status === "APPROVED" && (
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => router.push("/client/pitches")}
                      className="flex items-center gap-2 bg-[#1a1a2e] text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-[#121220] transition-colors"
                    >
                      <X size={15} />
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        router.push(
                          `/client/pitches/${pitch.id}/review?name=${encodeURIComponent(creativeName)}&avatar=${encodeURIComponent(creativeAvatar)}`
                        )
                      }
                      className="bg-[#E05C5C] hover:bg-[#c94c4c] text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
                    >
                      View Order Review
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PitchDetailPage;