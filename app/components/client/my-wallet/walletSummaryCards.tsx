"use client";

import { useState, useEffect } from "react";
import AddFundModal from "./addFundmodal";

interface WalletData {
  id: string;
  userId: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  currency: string;
  updatedAt: string;
}

const formatAmount = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency ?? "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
};

const WalletSummaryCards: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddFund, setShowAddFund] = useState(false);

  const fetchWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      const res = await fetch("/api/v1/wallet", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Failed to fetch wallet");

      setWallet(json.data ?? json);
      console.log("wallet response:", json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchWallet();
  }, []);

  const currency = wallet?.currency ?? "NGN";

  const cards = [
    {
      label: "Available Balance",
      value: wallet ? formatAmount(wallet.availableBalance, currency) : "—",
      labelColor: "text-[#92400E]",
      valueColor: "text-[#1a1a2e]",
      bg: "bg-[#FFFBEB]",
    },
    {
      label: "Total Earned",
      value: wallet ? formatAmount(wallet.totalEarned, currency) : "—",
      labelColor: "text-[#166534]",
      valueColor: "text-[#22C55E]",
      bg: "bg-[#F0FDF4]",
    },
    {
      label: "Pending Balance",
      value: wallet ? formatAmount(wallet.pendingBalance, currency) : "—",
      labelColor: "text-[#3730A3]",
      valueColor: "text-[#1a1a2e]",
      bg: "bg-[#EEF2FF]",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:flex items-stretch gap-0 border border-gray-200 rounded-[10px] bg-[#fafafa] px-2.5 py-5 overflow-hidden mb-6">

        {loading ? (
          // Skeleton loader
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 px-6 py-5 border-r border-gray-200 animate-pulse">
                <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
                <div className="h-7 w-32 bg-gray-200 rounded" />
              </div>
            ))}
          </>
        ) : error ? (
          <div className="flex-1 px-6 py-5 text-sm text-red-500">
            {error}{" "}
            <button onClick={fetchWallet} className="underline font-semibold">
              Retry
            </button>
          </div>
        ) : (
          cards.map((card, i) => (
            <div
              key={i}
              className={`flex-1 px-6 py-5 ${card.bg} border-r border-gray-200`}
            >
              <p className={`m-0 mb-1.5 text-[13px] font-medium ${card.labelColor}`}>
                {card.label}
              </p>
              <p className={`m-0 text-[26px] font-extrabold ${card.valueColor}`}>
                {card.value}
              </p>
            </div>
          ))
        )}

        {/* Add Fund Button */}
        <div className="flex items-center justify-center px-7 py-5 bg-transparent">
          <button
            onClick={() => setShowAddFund(true)}
            className="bg-[#E2554F] border-none rounded-lg px-6 py-3 cursor-pointer text-white font-bold text-[14px] whitespace-nowrap hover:bg-[#d44a44] transition-colors"
          >
            + Add Fund
          </button>
        </div>
      </div>

      {showAddFund && (
        <AddFundModal
          onClose={() => setShowAddFund(false)}
          // Refetch wallet after a successful top-up
          onSuccess={fetchWallet}
        />
      )}
    </>
  );
};

export default WalletSummaryCards;