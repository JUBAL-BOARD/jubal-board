"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/client/my-desk/breadcrumb";
import { useParams, useRouter } from "next/navigation";
import { X, BadgeCheck, Loader2 } from "lucide-react";

type ClientProfile = {
  name: string;
  clientProfile: {
    fullName: string;
    imageUrl: string | null;
  };
};

type ProjectData = {
  id: string;
  title: string;
  status: string;
  paymentMode: string;
  agreedAmount: number;
  serviceFee: number;
  processingFee: number;
  totalAmount: number;
  dueDate: string | null;
  completedAt: string | null;
  leadCreativeId: string;
  escrow: {
    amount: number;
    status: string;
  } | null;
  brief: {
    jobTitle: string;
    jobDescription: string;
    timeline: string;
    deliveryDate: string | null;
    modeOfProject: string;
    currency: string;
    budgetMin: number;
    budgetMax: number;
    referenceFileUrl: string | null;
    location: string | null;
  } | null;
};

type TransactionData = {
  id: string;
  amount: number;
  type: string;
  status: string;
  reference: string;
  paymentMethod: string;
  createdAt: string;
};

type CreativeData = {
  id: string;
  fullName: string;
  imageUrl: string | null;
  isPremium: boolean;
  professionalRole: string;
};

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(n);

const extractProjectId = (reference: string): string | null => {
  const match = reference.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  return match ? match[0] : null;
};

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} viewBox="0 0 20 20" fill={s <= rating ? "#F5A623" : "#E5E7EB"} className="w-4 h-4">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function ClientTransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [creative, setCreative] = useState<CreativeData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Fetch profile and transactions in parallel
        const [profileRes, txRes] = await Promise.all([
          fetch("/api/v1/clients/me", { headers, credentials: "include" }),
          fetch("/api/v1/wallet/transactions", { headers, credentials: "include" }),
        ]);

        // Profile
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          setProfile(profileJson.data);
        }
        setProfileLoading(false);

        // Find transaction by ID
        if (!txRes.ok) throw new Error("Failed to fetch transactions");
        const txJson = await txRes.json();
        const list: TransactionData[] = Array.isArray(txJson.data?.transactions)
          ? txJson.data.transactions
          : [];

        const tx = list.find((t) => t.id === id);
        if (!tx) throw new Error("Transaction not found");
        setTransaction(tx);

        // Extract project ID and fetch project
        const projectId = extractProjectId(tx.reference);
        if (projectId) {
          const projRes = await fetch(`/api/v1/projects/${projectId}`, { headers });
          if (projRes.ok) {
            const projJson = await projRes.json();
            const projData = projJson.data;
            setProject(projData);

            // Fetch creative using leadCreativeId
            if (projData.leadCreativeId) {
              const creativeRes = await fetch(
                `/api/v1/creatives/${projData.leadCreativeId}/public-profile`,
                { headers }
              );
              if (creativeRes.ok) {
                const creativeJson = await creativeRes.json();
                setCreative(creativeJson.data);
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setDataLoading(false);
        setProfileLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  const userName = profile?.clientProfile?.fullName || profile?.name || "Client";
  const userAvatar =
    profile?.clientProfile?.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  // Use brief currency if available, fallback to USD
  const currency = project?.brief?.currency ?? "USD";

  if (profileLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#E2554F]" size={40} />
      </div>
    );
  }

  const paymentRows = project
    ? [
      { label: "Project Amount", value: fmt(project.agreedAmount, currency) },
      { label: "Service Fee", value: fmt(project.serviceFee, currency) },
      { label: "Processing Fee", value: fmt(project.processingFee, currency) },
      { label: "Amount Paid", value: fmt(transaction?.amount ?? 0, currency) },
      { label: "Payout Method", value: project.paymentMode?.replace(/_/g, " ") ?? "—" },
      { label: "Payment Status", value: project.escrow?.status ?? "—", isStatus: true },
      { label: "Due Date", value: formatDate(project.dueDate) },
    ]
    : [];

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
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <div className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10`}>
          <button className="absolute top-4 right-4 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
          <Sidebar activeItem="My Wallet" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb crumbs={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "My Wallet", path: "/client/my-wallet" },
            { label: "Transaction Details" },
          ]} />

          {dataLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#E2554F]" size={36} />
            </div>
          ) : error ? (
            <p className="text-center text-sm text-red-500 py-10">{error}</p>
          ) : (
            <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="relative flex items-center justify-center px-6 pt-6 pb-4 border-b border-gray-100">
                <button onClick={() => router.back()} className="absolute left-5 text-gray-500 hover:text-gray-700">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-black">Transaction Details</h1>
                  <p className="text-xl text-black mt-0.5">{project?.title ?? "—"}</p>
                  <span className="inline-block mt-1 text-xs font-semibold text-green-500">
                    {project?.status?.replace(/_/g, " ") ?? transaction?.status ?? "—"}
                  </span>
                  {project?.completedAt && (
                    <div className="flex items-center justify-center gap-1.5 mt-1 text-xs text-black">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Completed on {formatDate(project.completedAt)}
                    </div>
                  )}
                </div>
                <button onClick={() => router.back()} className="absolute right-5 text-black hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

                {/* Left */}
                <div className="p-6 space-y-6">
                  {/* Creative */}
                  {creative && (
                    <div className="bg-[#fafafa] p-6">
                      <h2 className="text-xl font-bold text-black mb-3">Creative</h2>
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            creative.imageUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(creative.fullName)}&background=1a1a2e&color=fff&size=128`
                          }
                          alt={creative.fullName}
                          className="rounded-full object-cover w-12 h-12"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(creative.fullName)}&background=1a1a2e&color=fff&size=128`;
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="font-semibold text-black text-xl">{creative.fullName}</p>
                            {creative.isPremium && <BadgeCheck fill="blue" stroke="white" size={14} />}
                          </div>
                          <p className="text-sm text-gray-500">{creative.professionalRole}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transaction Info */}
                  <div className="bg-[#fafafa] p-6">
                    <h2 className="text-lg font-bold text-black mb-3">Transaction Info</h2>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-gray-50">
                          <td className="py-2 pr-4 text-black font-medium w-36">Reference</td>
                          <td className="py-2 text-black break-all">
                            {project?.title ?? transaction?.reference ?? "—"}
                          </td>
                        </tr>
                        <tr className="border-b border-gray-50">
                          <td className="py-2 pr-4 text-black font-medium">Type</td>
                          <td className="py-2 text-black">{transaction?.type ?? "—"}</td>
                        </tr>
                        <tr className="border-b border-gray-50">
                          <td className="py-2 pr-4 text-black font-medium">Amount</td>
                          <td className="py-2 text-black">{fmt(transaction?.amount ?? 0, currency)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 text-black font-medium">Date</td>
                          <td className="py-2 text-black">{formatDate(transaction?.createdAt ?? null)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right */}
                <div className="p-6 space-y-6">
                  {/* Payment Summary */}
                  <div className="bg-[#fafafa] p-6">
                    <h2 className="text-xl font-bold text-black mb-3">Payment Summary</h2>
                    <table className="w-full text-sm">
                      <tbody>
                        {paymentRows.map((row) => (
                          <tr key={row.label} className="border-b border-gray-50 last:border-0">
                            <td className="py-2 text-black font-medium w-36">{row.label}</td>
                            <td className={`py-2 font-medium ${row.isStatus ? "text-green-500" : "text-gray-800"}`}>
                              {row.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Feedback & Rating */}
                  <div className="bg-[#fafafa] p-6">
                    <h2 className="text-xl font-bold text-black mb-3">Feedback & Rating</h2>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-gray-50">
                          <td className="py-2 text-black font-medium w-36 align-top">My Rating</td>
                          <td className="py-2"><StarRating rating={0} /></td>
                        </tr>
                        <tr>
                          <td className="py-2 text-black font-medium align-top">Review Message</td>
                          <td className="py-2 text-gray-400 italic">No review yet</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 text-center border-t border-gray-100">
                <button
                  onClick={() => router.push(`/client/transactions/${id}/e-receipt`)}
                  className="w-[40%] py-3 bg-[#e84545] hover:bg-[#d03535] text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  View E-Receipt
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}