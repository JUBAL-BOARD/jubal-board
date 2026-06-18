"use client";
import { useState, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";

interface Breakdown {
  gross: number;
  fees: number;
  netPay: number;
}

// This matches what /api/v1/earnings/breakdown actually returns: a list of
// transaction-like records, NOT a pre-aggregated { gross, fees, netPay } object.
interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  currency: string;
  amountUsd: number;
  type?: string;
  category?: string;
  kind?: string;
  direction?: string;
  [key: string]: unknown;
}

const periods = ["This month", "Last month", "Last 3 months", "This year"];

const periodToDateRange: Record<string, string> = {
  "This month": "thisMonth",
  "Last month": "lastMonth",
  "Last 3 months": "last3Months",
  "This year": "thisYear",
};

// FIXME: Verify against the real API response. Right now this guesses which
// transactions are "fees" by checking a few likely field names/values.
// Inspect a full transaction object (all fields, not just the first 5) and
// adjust this function to match the actual field that distinguishes fees
// from earnings.
const isFee = (t: Transaction): boolean => {
  const candidates = [t.type, t.category, t.kind, t.direction]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase());

  return candidates.some((v) =>
    ["fee", "fees", "charge", "deduction", "platform_fee"].includes(v)
  );
};

const aggregateBreakdown = (transactions: Transaction[]): Breakdown => {
  let gross = 0;
  let fees = 0;

  for (const t of transactions) {
    if (isFee(t)) {
      fees += t.amount ?? 0;
    } else {
      gross += t.amount ?? 0;
    }
  }

  return { gross, fees, netPay: gross - fees };
};

const EarningsBreakdown: React.FC = () => {
  const [period, setPeriod] = useState("This month");
  const [open, setOpen] = useState(false);
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState("USD");

  // Defensive: never crash on undefined/null, even if a field is missing.
  const fmt = (n: number | undefined | null) =>
    `${currency} ${(n ?? 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
    })}`;

  const fetchBreakdown = useCallback(async (selectedPeriod: string) => {
    setLoading(true);
    setError(null);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const dateRange = periodToDateRange[selectedPeriod] ?? "thisMonth";

      const [breakdownRes, earningsRes] = await Promise.all([
        fetch(`/api/v1/earnings/breakdown?dateRange=${dateRange}`, {
          credentials: "include",
          headers,
        }),
        fetch(`/api/v1/earnings`, {
          credentials: "include",
          headers,
        }),
      ]);

      if (!breakdownRes.ok)
        throw new Error(`Breakdown fetch failed (${breakdownRes.status})`);
      const json = await breakdownRes.json();

      // json.data is an array of transactions, so aggregate it into the
      // summary shape the UI expects instead of setting it directly.
      const transactions: Transaction[] = Array.isArray(json.data)
        ? json.data
        : [];
      setBreakdown(aggregateBreakdown(transactions));

      if (earningsRes.ok) {
        const earningsJson = await earningsRes.json();
        setCurrency(earningsJson.data?.currency ?? "USD");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBreakdown(period);
  }, [period, fetchBreakdown]);

  return (
    <div className="bg-[#fafafa] p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg lg:text-2xl font-heading font-bold text-gray-900">Earnings Breakdown</h2>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {period}
            <ChevronDown size={14} />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => { setPeriod(p); setOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                    period === p ? "text-red-500 font-medium" : "text-gray-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && <p className="text-sm text-gray-400 text-center py-6">Loading breakdown…</p>}
      {error && <p className="text-sm text-red-500 text-center py-6">{error}</p>}

      {!loading && !error && breakdown && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Platform Fees */}
          <div>
            <p className="font-semibold font-heading text-black text-sm lg:text-xl mb-4">Platform Fees</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-body lg:text-lg text-black">Total Fees</span>
                <span className="text-sm font-body text-black font-medium">-{fmt(breakdown.fees)}</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <p className="font-semibold font-heading text-black text-sm lg:text-xl mb-4">Summary</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-body lg:text-lg text-black">Gross Earnings</span>
                <span className="text-sm font-body text-black font-medium">{fmt(breakdown.gross)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-body lg:text-lg text-black">Total Fees</span>
                <span className="text-sm font-body text-black font-medium">-{fmt(breakdown.fees)}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="font-bold font-body text-black text-sm lg:text-md">Net Earnings</span>
                <span className="font-bold font-body text-black text-sm lg:text-md">{fmt(breakdown.netPay)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsBreakdown;