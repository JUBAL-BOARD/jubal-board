"use client";

import { useState } from "react";
import Sidebar from "../../components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "../../components/client/my-desk/breadcrumb";
import WalletSummaryCards from "../../components/client/my-wallet/walletSummaryCards";
import TransactionTable from "../../components/client/my-wallet/transactionTable";
import Pagination from "../../components/client/my-desk/pagination";
import { Search, ListFilter, ChevronDown, X } from "lucide-react";
import { transactions, walletSummary } from "../../data/walletData";

const Wallet: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  const filtered = transactions.filter((tx) =>
    tx.details.toLowerCase().includes(search.toLowerCase()) ||
    tx.paymentMethod.toLowerCase().includes(search.toLowerCase())
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex flex-col min-h-screen bg-white">

      <DashboardTopbar
        userName="Charles Eden"
        userAvatar="https://i.pravatar.cc/150?img=33"
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 relative">

        {/* Dark overlay — mobile only, shows when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — slides in on mobile, always visible on desktop */}
        <div
          className={`
            fixed top-0 left-0 h-full z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10
          `}
        >
          {/* Close button inside sidebar on mobile */}
          <button
            className="absolute top-4 right-4 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>

          <Sidebar activeItem="Dashboard" />
        </div>

        {/* Main content — full width, no margin offset needed */}
        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">

          <Breadcrumb crumbs={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "My Wallet" },
          ]} />

          <h1 className="text-[26px] font-extrabold text-[#1a1a2e] m-0 mb-6">
            My Wallet
          </h1>

          {/* Summary Cards */}
          <WalletSummaryCards
            availableBalance={walletSummary.availableBalance}
            totalCredit={walletSummary.totalCredit}
            totalSpent={walletSummary.totalSpent}
            onAddFund={() => alert("Add Fund clicked")}
          />

          {/* Search + Filter */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 flex items-center gap-2.5 border-[1.5px] border-gray-200 rounded-lg px-3.5 py-2.5 bg-white">
              <Search size={18} stroke="black" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
            <TransactionTable transactions={filtered} />
            <Pagination
              currentPage={currentPage}
              totalPages={25}
              perPage={perPage}
              onPageChange={setCurrentPage}
              onPerPageChange={setPerPage}
            />
          </div>

        </main>
      </div>
    </div>
  );
};

export default Wallet;