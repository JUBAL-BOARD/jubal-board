"use client";

import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { showFundWithdrawnToast } from "@/app/components/ui/toasts";

interface Props {
  onClose: () => void;
}

const quickAmounts = ["$50", "$100", "$200", "$500", "$1,000"];

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance?: number;
}

export default function WithdrawModal({
  isOpen,
  onClose,
  availableBalance = 5000,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");

  if (!isOpen) return null;

  const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
  const serviceFee = numericAmount > 0 ? 10 : 0;
  const youReceive = numericAmount - serviceFee;

  const handleWithdrawFund = () => {
      if (!amount) return;
      // Replace with your actual API call:
      // await fetch("/api/wallet/fund", { method: "POST", body: JSON.stringify({ amount, gateway: selectedGateway }) });
      onClose();
      showFundWithdrawnToast();
    };

  return (
    <div className="fixed mt-20 inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-6 relative shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-xl font-bold text-black">Withdraw Fund</h2>
          <button onClick={onClose} className="ml-auto text-black hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Withdrawal Amount */}
        <div className="mb-4">
          <label className="block text-sm text-black mb-1.5">Withdrawal Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-sm">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300"
            />
          </div>
        </div>

        {/* Quick amounts */}
        <div className="mb-4">
          <p className="text-sm text-black mb-2">or Select Amount</p>
          <div className="flex gap-2 flex-wrap">
            {quickAmounts.map((q) => (
              <button
                key={q}
                onClick={() => setAmount(q.replace("$", "").replace(",", ""))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  amount === q.replace("$", "").replace(",", "")
                    ? "bg-[#e84545] text-white border-[#e84545]"
                    : "bg-white text-black border-gray-200 hover:bg-gray-50"
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Payout Method */}
        <div className="mb-4">
          <p className="text-sm text-black mb-2">Payout Method</p>
          <div className="flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2">
              {/* Mastercard logo */}
              <div className="flex -space-x-2">
                <div className="w-5 h-5 rounded-full bg-red-500" />
                <div className="w-5 h-5 rounded-full bg-yellow-400" />
              </div>
              <span className="text-sm text-gray-700">Mastercard ******2345</span>
            </div>
            <button className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#e84545]" />
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-black mb-2">Summary</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-black">
              <span>Amount:</span>
              <span>${numericAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-black">
              <span>Service Fee:</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-black">
              <span>You will receive:</span>
              <span>${youReceive > 0 ? youReceive.toFixed(2) : "0.00"}</span>
            </div>
            <div className="flex justify-between text-black">
              <span>Processing:</span>
              <span className="text-black">Within 24–48 hours</span>
            </div>
          </div>
        </div>

        {/* Confirm PIN */}
        <div className="mb-5">
          <label className="block text-sm text-black mb-1.5">Confirm Your Pin</label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={6}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300"
          />
        </div>

        {/* Withdraw button */}
        <button onClick={handleWithdrawFund} className="w-full py-3 bg-[#e84545] hover:bg-[#d03535] text-white font-semibold rounded-xl transition-colors mb-3">
          Withdraw
        </button>

        {/* Support link */}
        <p className="text-center text-xs text-black">
          Having issues?{" "}
          <a href="#" className="text-[#e84545] underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}