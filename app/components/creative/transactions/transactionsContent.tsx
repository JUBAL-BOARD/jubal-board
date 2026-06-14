"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import GigsPagination from "@/app/components/creative/my-gigs/gigsPagination";
import { useRouter } from "next/navigation";
import { Transaction } from "@/app/types";

const statusStyles: Record<string, string> = {
  Debit: "text-red-500 bg-red-50",
  Credit: "text-green-500 bg-green-50",
  Reversed: "text-orange-500 bg-orange-50",
  Pending: "text-yellow-500 bg-yellow-50",
};

const capitalizeFirst = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const TransactionsContent: React.FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      const earningsRes = await fetch(`/api/v1/earnings`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      const earningsJson = await earningsRes.json();
      const currency = earningsJson.data?.currency ?? "USD";

      const res = await fetch(
        `/api/v1/earnings/transactions?page=${page}&limit=${perPage}`,
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error(`Transactions fetch failed (${res.status})`);
      const json = await res.json();

      const rawList = Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.data?.transactions)
          ? json.data.transactions
          : Array.isArray(json.data?.items)
            ? json.data.items
            : Array.isArray(json)
              ? json
              : [];

      setTotalCount(
        json.total ??
        json.totalCount ??
        json.data?.total ??
        json.data?.meta?.total ??
        rawList.length
      );

      const mapped: Transaction[] = await Promise.all(
        rawList.map(async (tx: any) => {
          const date = new Date(tx.createdAt);

          // Extract project ID from reference string
          const projectIdMatch = tx.reference?.match(/project:\s*([a-f0-9-]{36})/i);
          const milestoneIdMatch = tx.reference?.match(/milestone\s+\d+\s+\w+:\s*([a-f0-9-]{36})/i);
          let details = tx.reference;

          if (projectIdMatch) {
            const projectId = projectIdMatch[1];
            try {
              const projectRes = await fetch(`/api/v1/projects/${projectId}`, {
                credentials: "include",
                headers: { Authorization: `Bearer ${token}` },
              });
              if (projectRes.ok) {
                const projectJson = await projectRes.json();
                const title = projectJson.data?.title;
                if (title) details = tx.reference.replace(projectId, title);
              }
            } catch { }
          } else if (milestoneIdMatch) {
            const milestoneId = milestoneIdMatch[1];
            try {
              const milestoneRes = await fetch(`/api/v1/projects/milestones/${milestoneId}`, {
                credentials: "include",
                headers: { Authorization: `Bearer ${token}` },
              });
              if (milestoneRes.ok) {
                const milestoneJson = await milestoneRes.json();
                const title = milestoneJson.data?.projectTitle ?? milestoneJson.data?.title;
                if (title) details = tx.reference.replace(milestoneId, title);
              }
            } catch { }
          }

          return {
            id: tx.id,
            details,
            paymentMethod: "Wallet",
            date: date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            time: date.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            amount: `${currency} ${tx.amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}`,
            status: capitalizeFirst(tx.type) as Transaction["status"],
          };
        })
      );

      setTransactions(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filtered = transactions.filter((tx) =>
    tx.details.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div>
      <Breadcrumb
        crumbs={[
          { label: "Dashboard", path: "/creative/dashboard" },
          { label: "My Transactions" },
        ]}
      />
      <h1 className="text-xl lg:text-2xl font-bold font-heading text-gray-900 mb-6">
        Transactions History
      </h1>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-3 lg:px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors flex-shrink-0">
          <SlidersHorizontal size={15} className="text-red-400" />
          <span className="hidden lg:inline">Filter By</span>
          <ChevronDown size={14} />
        </button>
      </div>

      {loading && (
        <p className="text-sm text-gray-400 text-center py-12">
          Loading transactions…
        </p>
      )}
      {error && (
        <p className="text-sm text-red-500 text-center py-12">{error}</p>
      )}

      {!loading && !error && (
        <>
          {/* Desktop — table */}
          <div className="hidden lg:block bg-[#fafafa] p-6 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {["Details", "Payment Method", "Date", "Time", "Amount", "Status"].map(
                    (col) => (
                      <th
                        key={col}
                        className="text-left text-sm font-semibold font-heading text-gray-900 px-5 py-4"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, i) => (
                  <tr
                    key={i}
                    onClick={() => router.push(`/creative/transactions/${tx.id}`)}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-none cursor-pointer"
                  >
                    <td className="px-5 py-4 text-sm font-body text-gray-800 max-w-[200px]">
                      {tx.details}
                    </td>
                    <td className="px-5 py-4 text-sm font-body text-gray-600">
                      {tx.paymentMethod}
                    </td>
                    <td className="px-5 py-4 text-sm font-body text-gray-600">
                      {tx.date}
                    </td>
                    <td className="px-5 py-4 text-sm font-body text-gray-600">
                      {tx.time}
                    </td>
                    <td className="px-5 py-4 text-sm font-body text-gray-700 font-medium">
                      {tx.amount}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-semibold font-body px-2 py-0.5 rounded-full ${statusStyles[tx.status]}`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center text-sm text-gray-400 py-12"
                    >
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile — cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {filtered.map((tx, i) => (
              <div
                key={i}
                onClick={() => router.push(`/creative/transactions/${tx.id}`)}
                className="bg-[#fafafa] border border-gray-100 rounded-xl p-4 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold font-body text-gray-800 flex-1 pr-2">
                    {tx.details}
                  </p>
                  <p className="text-sm font-bold font-body text-gray-900 flex-shrink-0">
                    {tx.amount}
                  </p>
                </div>
                <p className="text-xs font-body text-gray-500 mb-3">
                  {tx.paymentMethod}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-body text-gray-400">
                      {tx.date}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs font-body text-gray-400">
                      {tx.time}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold font-body px-2.5 py-0.5 rounded-full ${statusStyles[tx.status]}`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-12">
                No transactions found.
              </p>
            )}
          </div>

          <GigsPagination
            currentPage={page}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={(val) => {
              setPerPage(val);
              setPage(1);
            }}
          />
        </>
      )}
    </div>
  );
};

export default TransactionsContent;