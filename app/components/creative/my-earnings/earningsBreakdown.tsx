"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const periods = ["This month", "Last month", "Last 3 months", "This year"];

const platformFees = [
  { label: "Jubal Board Service Fee", amount: "-$50.00" },
  { label: "Processing Fee", amount: "-$50.00" },
  { label: "Payout Fee", amount: "-$50.00" },
];

const withheldAmounts = [
  { label: "Disputes", amount: "-$50.00" },
  { label: "Refund issued", amount: "-$50.00" },
  { label: "Payment holds", amount: "-$50.00" },
];

const EarningsBreakdown: React.FC = () => {
  const [period, setPeriod] = useState("This month");
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-[#fafafa] p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg lg:text-2xl font-bold text-gray-900">Earnings Breakdown</h2>

        {/* Period dropdown */}
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

      {/* Two column breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Platform Fees */}
        <div>
          <p className="font-semibold text-black text-sm lg:text-xl mb-4">Platform Fees</p>
          <div className="space-y-3">
            {platformFees.map((fee) => (
              <div key={fee.label} className="flex items-center justify-between">
                <span className="text-sm lg:text-lg text-black">{fee.label}</span>
                <span className="text-sm lg:text-md text-black font-medium">{fee.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Withheld Amounts */}
        <div>
          <p className="font-semibold text-black text-sm lg:text-xl mb-4">Withheld Amounts</p>
          <div className="space-y-3">
            {withheldAmounts.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm lg:text-lg text-black">{item.label}</span>
                <span className="text-sm lg:text-md text-black font-medium">{item.amount}</span>
              </div>
            ))}
          </div>

          {/* Net Earnings */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <span className="font-bold text-black text-sm lg:text-md">Net Earnings</span>
            <span className="font-bold text-black text-sm lg:text-md">$420.00</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsBreakdown;