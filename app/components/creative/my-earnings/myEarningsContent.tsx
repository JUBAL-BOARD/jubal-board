"use client";
import { useState, useEffect, useCallback } from "react";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import EarningsStats from "./earningsStat";
import EarningsBreakdown from "./earningsBreakdown";
import RecentTransactions from "./recentTransactions";
import { EarningsData, Transaction } from "@/app/types";

const MyEarningsContent: React.FC = () => {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [earningsRes, txRes] = await Promise.all([
        fetch("/api/v1/earnings", { credentials: "include", headers }),
        fetch(`/api/v1/earnings/transactions`, { credentials: "include", headers }),
      ]);

      if (!earningsRes.ok) throw new Error(`Earnings fetch failed (${earningsRes.status})`);
      if (!txRes.ok) throw new Error(`Transactions fetch failed (${txRes.status})`);

      const earningsJson = await earningsRes.json();
      const txJson = await txRes.json();

      fetch(`/api/v1/earnings/transactions?limit=${10}&page=${1}`, { credentials: "include", headers }),

        // Map earnings
        setEarningsData({
          totalEarned: earningsJson.data.totalEarned,
          pendingEarnings: earningsJson.data.pendingBalance,
          availableBalance: earningsJson.data.availableBalance,
        });

      // Map transactions
      const mapped: Transaction[] = (txJson.data ?? []).map((tx: any) => {
        const date = new Date(tx.createdAt);
        return {
          id: tx.id,
          details: tx.reference,
          paymentMethod: "Wallet",
          date: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          time: date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          amount: `₦${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          status: capitalizeFirst(tx.type) as Transaction["status"],
        };
      });
      setTransactions(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const capitalizeFirst = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  if (loading) return <p className="text-sm text-gray-400 text-center py-12">Loading earnings…</p>;
  if (error) return <p className="text-sm text-red-500 text-center py-12">{error}</p>;

  return (
    <div>
      <Breadcrumb crumbs={[
        { label: "Dashboard", path: "/creative/dashboard" },
        { label: "My Earnings" },
      ]} />
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">My Earnings</h1>
      {earningsData && <EarningsStats data={earningsData} />}
      <EarningsBreakdown />
      <RecentTransactions transactions={transactions} />
    </div>
  );
};

export default MyEarningsContent;