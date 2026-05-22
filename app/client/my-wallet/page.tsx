"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "../../components/client/my-desk/breadcrumb";
import WalletSummaryCards from "../../components/client/my-wallet/walletSummaryCards";
import TransactionTable from "../../components/client/my-wallet/transactionTable";
import Pagination from "../../components/client/my-desk/pagination";
import { Search, ListFilter, ChevronDown, X, Loader2 } from "lucide-react";
import type { Transaction, TransactionStatus } from "../../data/walletData";

type ClientProfile = {
  name: string;
  clientProfile: {
    fullName: string;
    imageUrl: string | null;
  };
};

const capitalizeFirst = (str: string): TransactionStatus => {
  const map: Record<string, TransactionStatus> = {
    CREDIT: "Credit",
    DEBIT: "Debit",
    REVERSED: "Reversed",
    PENDING: "Pending",
  };
  return map[str] ?? "Pending";
};

const fmt = (n: number) =>
  `₦${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

const Wallet: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [availableBalance, setAvailableBalance] = useState("₦0.00");
  const [totalCredit, setTotalCredit] = useState("₦0.00");
  const [totalSpent, setTotalSpent] = useState("₦0.00");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch profile, wallet balance, and transactions in parallel
      const [profileRes, walletRes, txRes] = await Promise.all([
        fetch("/api/v1/clients/me", { headers, credentials: "include" }),
        fetch("/api/v1/wallet", { headers, credentials: "include" }),
        fetch("/api/v1/wallet/transactions", { headers, credentials: "include" }),
      ]);

      // Profile
      if (profileRes.ok) {
        const profileJson = await profileRes.json();
        setProfile(profileJson.data);
      }

      // Wallet balance
      if (walletRes.ok) {
        const walletJson = await walletRes.json();
        const w = walletJson.data ?? walletJson;
        setAvailableBalance(fmt(w.availableBalance ?? 0));

        // Compute totalCredit and totalSpent from transactions below
        // (wallet endpoint doesn't return these directly)
      } else {
        setWalletError("Failed to load wallet balance.");
      }

      // Transactions
      if (txRes.ok) {
        const txJson = await txRes.json();
        const list = Array.isArray(txJson.data) ? txJson.data : [];

        // Compute totals from transactions
        let credit = 0;
        let spent = 0;
        list.forEach((tx: any) => {
          if (tx.type === "CREDIT") credit += tx.amount;
          if (tx.type === "DEBIT") spent += tx.amount;
        });
        setTotalCredit(fmt(credit));
        setTotalSpent(fmt(spent));

        const mapped: Transaction[] = list.map((tx: any) => {
          const date = new Date(tx.createdAt);
          const status = capitalizeFirst(tx.type);
          const isCredit = tx.type === "CREDIT";
          return {
            id: tx.id,
            details: tx.reference,
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
            amount: `${isCredit ? "+" : "-"}${fmt(tx.amount)}`,
            status,
          };
        });

        setTransactions(mapped);
      }
    } catch (err) {
      setWalletError("Something went wrong.");
    } finally {
      setProfileLoading(false);
      setWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = transactions.filter((tx) =>
    tx.details.toLowerCase().includes(search.toLowerCase()) ||
    tx.paymentMethod.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const userName = profile?.clientProfile?.fullName || profile?.name || "Client";
  const userAvatar =
    profile?.clientProfile?.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

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
      <div className="flex flex-1 relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className={`
            fixed top-0 left-0 h-full z-40
            transition-transform duration-300 ease-in-out
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
          <Sidebar activeItem="Dashboard" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb crumbs={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "My Wallet" },
          ]} />

          <h1 className="text-[26px] font-extrabold text-[#1a1a2e] m-0 mb-6">
            My Wallet
          </h1>

          {walletLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-[#E2554F]" size={32} />
            </div>
          ) : walletError ? (
            <p className="text-sm text-red-500 text-center py-6">{walletError}</p>
          ) : (
            <WalletSummaryCards
            />
          )}

          {/* Search + Filter */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 flex items-center gap-2.5 border-[1.5px] border-gray-200 rounded-lg px-3.5 py-2.5 bg-white">
              <Search size={18} stroke="black" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search"
                className="border-none outline-none flex-1 text-[13px] text-black bg-transparent placeholder:text-gray-400"
              />
            </div>
            <button className="flex items-center gap-2 bg-white border-none rounded-lg px-[18px] py-2.5 cursor-pointer text-[#e2554f] font-semibold text-[13px] hover:bg-gray-50 transition-colors">
              <ListFilter size={16} stroke="#E85D3A" />
              Filter By
              <ChevronDown size={12} stroke="#e2554f" />
            </button>
          </div>

          {/* Transaction Table */}
          <div className="bg-[#fafafa] rounded-[10px] border border-gray-200 px-6 py-5">
            {walletLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="animate-spin text-[#E2554F]" size={28} />
              </div>
            ) : (
              <>
                <TransactionTable transactions={paginated} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  perPage={perPage}
                  onPageChange={setCurrentPage}
                  onPerPageChange={(val) => { setPerPage(val); setCurrentPage(1); }}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Wallet;