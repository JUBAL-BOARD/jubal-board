"use client";
import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import GigsPagination from "@/app/components/creative/my-gigs/gigsPagination";
import { allTransactions } from "@/app/data";

const statusStyles: Record<string, string> = {
  Debit: "text-red-500 bg-red-50",
  Credit: "text-green-500 bg-green-50",
  Reversed: "text-orange-500 bg-orange-50",
  Pending: "text-yellow-500 bg-yellow-50",
};

const TransactionsContent: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = allTransactions.filter((tx) =>
    tx.details.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <Breadcrumb crumbs={[
        { label: "Dashboard", path: "/creative/dashboard" },
        { label: "My Transactions" },
      ]} />

      <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Transactions History</h1>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-3 lg:px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors flex-shrink-0">
          <SlidersHorizontal size={15} className="text-red-400" />
          <span className="hidden lg:inline">Filter By</span>
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Desktop — table */}
      <div className="hidden lg:block bg-[#fafafa] p-6 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {["Details", "Payment Method", "Date", "Time", "Amount", "Status"].map((col) => (
                <th key={col} className="text-left text-sm font-semibold text-gray-900 px-5 py-4">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((tx, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-none"
              >
                <td className="px-5 py-4 text-sm text-gray-800 max-w-[200px]">{tx.details}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{tx.paymentMethod}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{tx.date}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{tx.time}</td>
                <td className="px-5 py-4 text-sm text-gray-700 font-medium">{tx.amount}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[tx.status]}`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile — cards */}
      <div className="flex flex-col gap-3 lg:hidden">
        {paginated.map((tx, i) => (
          <div key={i} className="bg-[#fafafa] border border-gray-100 rounded-xl p-4">
            {/* Top — details + amount */}
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-semibold text-gray-800 flex-1 pr-2">{tx.details}</p>
              <p className="text-sm font-bold text-gray-900 flex-shrink-0">{tx.amount}</p>
            </div>

            {/* Middle — payment method */}
            <p className="text-xs text-gray-500 mb-3">{tx.paymentMethod}</p>

            {/* Bottom — date, time, status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{tx.date}</span>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-400">{tx.time}</span>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusStyles[tx.status]}`}>
                {tx.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <GigsPagination
        currentPage={page}
        totalPages={totalPages}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={(val) => { setPerPage(val); setPage(1); }}
      />
    </div>
  );
};

export default TransactionsContent;