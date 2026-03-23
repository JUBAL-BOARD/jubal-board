import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Transaction } from "@/app/types";

interface Props {
  transactions: Transaction[];
}

const statusStyles: Record<string, string> = {
  Debit: "text-red-500",
  Credit: "text-green-500",
  Reversed: "text-orange-500",
  Pending: "text-yellow-500",
};

const statusBgStyles: Record<string, string> = {
  Debit: "bg-red-50",
  Credit: "bg-green-50",
  Reversed: "bg-orange-50",
  Pending: "bg-yellow-50",
};

const RecentTransactions: React.FC<Props> = ({ transactions }) => {
  return (
    <div className="bg-[#fafafa] p-4 lg:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg lg:text-2xl font-bold text-gray-900">Recent Transactions</h2>
        <Link href="/creative/transactions" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronRight size={20} />
        </Link>
      </div>

      {/* Desktop — table */}
      <div className="hidden lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {["Details", "Payment Method", "Date", "Time", "Amount", "Status"].map((col) => (
                <th key={col} className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-4 text-sm text-black max-w-[180px]">{tx.details}</td>
                <td className="py-3 pr-4 text-sm text-black">{tx.paymentMethod}</td>
                <td className="py-3 pr-4 text-sm text-black">{tx.date}</td>
                <td className="py-3 pr-4 text-sm text-black">{tx.time}</td>
                <td className="py-3 pr-4 text-sm text-black font-medium">{tx.amount}</td>
                <td className="py-3">
                  <span className={`text-xs font-semibold ${statusStyles[tx.status]}`}>
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
        {transactions.map((tx, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-4">
            {/* Top row — details + amount */}
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-semibold text-black flex-1 pr-2">{tx.details}</p>
              <p className="text-sm font-bold text-black flex-shrink-0">{tx.amount}</p>
            </div>

            {/* Middle row — payment method */}
            <p className="text-xs text-gray-500 mb-2">{tx.paymentMethod}</p>

            {/* Bottom row — date, time, status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{tx.date}</span>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-400">{tx.time}</span>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusStyles[tx.status]} ${statusBgStyles[tx.status]}`}>
                {tx.status}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default RecentTransactions;