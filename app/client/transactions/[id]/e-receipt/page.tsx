"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type ProjectData = {
  id: string;
  title: string;
  status: string;
  paymentMode: string;
  agreedAmount: number;
  serviceFee: number;
  processingFee: number;
  deadline: string | null;
  completedAt: string | null;
  creative: {
    id: string;
    name: string;
    avatarUrl: string | null;
    isPremium: boolean;
  };
  escrow: {
    amount: number;
    status: string;
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

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat("en-NG", {
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

const Barcode = () => (
  <svg viewBox="0 0 200 60" className="w-full h-16" xmlns="http://www.w3.org/2000/svg">
    {Array.from({ length: 60 }).map((_, i) => (
      <rect
        key={i}
        x={i * 3.2 + 4}
        y={0}
        width={i % 3 === 0 ? 2.5 : 1.5}
        height={i % 5 === 0 ? 60 : 50}
        fill="#111"
      />
    ))}
  </svg>
);

export default function EReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [currency, setCurrency] = useState<string>("USD");
  const [loading, setLoading] = useState(true);
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

        // Fetch wallet currency, transactions in parallel
        const [walletRes, txRes] = await Promise.all([
          fetch("/api/v1/wallet", { headers, credentials: "include" }),
          fetch("/api/v1/wallet/transactions", { headers, credentials: "include" }),
        ]);

        // Currency
        if (walletRes.ok) {
          const walletJson = await walletRes.json();
          setCurrency(walletJson.data?.currency ?? "USD");
        }

        // Find transaction by ID
        if (!txRes.ok) throw new Error("Failed to fetch transactions");
        const txJson = await txRes.json();
        const list: TransactionData[] = Array.isArray(txJson.data?.transactions)
          ? txJson.data.transactions
          : [];

        const tx = list.find((t) => t.id === id);
        if (!tx) throw new Error("Transaction not found");
        setTransaction(tx);

        // Fetch project
        const projectId = extractProjectId(tx.reference);
        if (projectId) {
          const projRes = await fetch(`/api/v1/projects/${projectId}`, { headers });
          if (projRes.ok) {
            const projJson = await projRes.json();
            setProject(projJson.data);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <Loader2 className="animate-spin text-[#E2554F]" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <p className="text-sm text-red-500">{error}</p>
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
        { label: "Delivery Date", value: formatDate(project.deadline) },
        { label: "Completed On", value: formatDate(project.completedAt) },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button onClick={() => router.back()} className="text-black hover:text-gray-700">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-black">E-Receipt</h1>
          <div className="w-5" />
        </div>

        {/* Barcode */}
        <div className="px-6 pt-2 pb-1">
          <Barcode />
          <p className="text-center text-xs text-black mt-1 tracking-widest">#{transaction?.id.slice(0, 10).toUpperCase()}</p>
        </div>

        {/* Divider */}
        <div className="px-6 my-3">
          <div className="border-t border-dashed border-gray-200" />
        </div>

        {/* Project info */}
        <div className="mx-6 bg-gray-50 rounded-xl px-4 py-3 mb-3">
          <p className="font-bold text-black text-sm">{project?.title ?? "—"}</p>
          <span className="inline-block mt-1 text-xs font-semibold text-green-500">
            {project?.status?.replace(/_/g, " ") ?? "—"}
          </span>
          {project?.completedAt && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-black">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Completed on {formatDate(project.completedAt)}
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="mx-6 bg-gray-50 rounded-xl px-4 py-3 mb-5">
          <h2 className="text-sm font-bold text-black mb-3">Payment Summary</h2>
          <table className="w-full text-xs">
            <tbody>
              {paymentRows.map((row) => (
                <tr key={row.label} className="border-b border-gray-100 last:border-0">
                  <td className="py-1.5 text-black font-medium">{row.label}</td>
                  <td className={`py-1.5 text-right font-medium ${row.isStatus ? "text-green-500" : "text-gray-800"}`}>
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Download button */}
        <div className="px-6 pb-3">
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#e84545] hover:bg-[#d03535] text-white font-bold rounded-xl transition-colors text-sm"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download PDF
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-black pb-5">
          Need help? Contact us at{" "}
          <a href="mailto:support@jubalboard.com" className="text-[#e84545]">
            support@jubalboard.com
          </a>
        </p>
      </div>
    </div>
  );
}