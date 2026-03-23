import type { Transaction, TransactionStatus } from "../../../data/walletData";

interface Props {
  transactions: Transaction[];
}

const statusStyles: Record<TransactionStatus, { color: string; background: string; border: string }> = {
  Debit:    { color: "#E85D3A", background: "white",   border: "1px solid #e5e7eb" },
  Credit:   { color: "#22C55E", background: "white",   border: "1px solid #e5e7eb" },
  Reversed: { color: "#E85D3A", background: "#FFF0ED", border: "none" },
  Pending:  { color: "#D97706", background: "#FFFBEB", border: "none" },
};

const headers = ["Details", "Payment Method", "Date", "Time", "Amount", "Status"];

const TransactionTable: React.FC<Props> = ({ transactions }) => {
  return (
    <div>
      <h3 className="text-lg font-extrabold text-[#1a1a2e] m-0 mb-4">
        Transaction History
      </h3>

      {/* Desktop — table */}
      <div className="hidden lg:block">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="text-left px-3 py-2.5 text-[13px] font-bold text-gray-700 border-b border-gray-200"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const style = statusStyles[tx.status];
              return (
                <tr key={tx.id} className="border-b border-gray-100">
                  <td className="px-3 py-3.5 text-[13px] text-[#1a1a2e]">{tx.details}</td>
                  <td className="px-3 py-3.5 text-[13px] text-gray-700">{tx.paymentMethod}</td>
                  <td className="px-3 py-3.5 text-[13px] text-gray-700">{tx.date}</td>
                  <td className="px-3 py-3.5 text-[13px] text-gray-700">{tx.time}</td>
                  <td
                    className="px-3 py-3.5 text-[13px] font-semibold"
                    style={{ color: tx.amount.startsWith("+") ? "#22C55E" : "#E85D3A" }}
                  >
                    {tx.amount}
                  </td>
                  <td className="px-3 py-3.5">
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-md"
                      style={{
                        color: style.color,
                        background: style.background,
                        border: style.border,
                      }}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile — cards */}
      <div className="flex flex-col gap-3 lg:hidden">
        {transactions.map((tx) => {
          const style = statusStyles[tx.status];
          return (
            <div key={tx.id} className="bg-white border border-gray-100 rounded-xl p-4">

              {/* Top — details + amount */}
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-[#1a1a2e] flex-1 pr-2">{tx.details}</p>
                <p
                  className="text-sm font-bold flex-shrink-0"
                  style={{ color: tx.amount.startsWith("+") ? "#22C55E" : "#E85D3A" }}
                >
                  {tx.amount}
                </p>
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
                <span
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md"
                  style={{
                    color: style.color,
                    background: style.background === "white" ? "#f9fafb" : style.background,
                    border: style.border,
                  }}
                >
                  {tx.status}
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default TransactionTable;