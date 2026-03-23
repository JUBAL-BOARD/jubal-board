"use client";

import { useState } from "react";
import { X, Banknote, CreditCard, Building } from "lucide-react";

const Toggle = ({ defaultOn = true }: { defaultOn?: boolean }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className={`relative flex-shrink-0 w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${on ? "bg-[#E2554F]" : "bg-gray-300"}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "left-[22]" : "left-[2]"}`} />
    </button>
  );
};

const paymentMethods = [
  { id: "1", icon: <Banknote size={18} className="text-gray-600" />, label: "Cash", sub: "" },
  { id: "2", icon: <div className="w-6 h-4 bg-red-500 rounded-sm flex items-center justify-center"><span className="text-white text-[8px] font-bold">MC</span></div>, label: "Mastercard", sub: "•••••3456 · Expires 08/26" },
  { id: "3", icon: <div className="w-6 h-4 bg-blue-700 rounded-sm flex items-center justify-center"><span className="text-white text-[8px] font-bold">VISA</span></div>, label: "Visa", sub: "•••••3456 · Expires 08/26" },
  { id: "4", icon: <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"><span className="text-white text-[8px] font-bold">P</span></div>, label: "PayPal", sub: "charleseden@jubalboard.com" },
  { id: "5", icon: <Building size={18} className="text-gray-600" />, label: "Bank", sub: "Account •••••3456" },
];

const PaymentSettingsTab: React.FC = () => {
  const [methods, setMethods] = useState(paymentMethods);

  const removeMethod = (id: string) =>
    setMethods((prev) => prev.filter((m) => m.id !== id));

  return (
    <div className="bg-white flex flex-col gap-6">
      {/* Payment Methods */}
      <div className="bg-[#fafafa] p-6">
        <div className="mb-6">
          <h2 className="font-bold text-black text-2xl mb-3">Payment Method</h2>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {methods.map((m, i) => (
              <div key={m.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < methods.length - 1 ? "border-b border-gray-100" : ""}`}>
                <div className="flex-shrink-0">{m.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{m.label}</p>
                  {m.sub && <p className="text-xs text-gray-500">{m.sub}</p>}
                </div>
                <button onClick={() => removeMethod(m.id)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Withdrawal Settings */}
      <div className="bg-[#fafafa] p-6">
        <div className="mb-6">
          <h2 className="font-bold text-black text-2xl mb-3">Withdrawal Settings</h2>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-sm text-gray-800">Auto Withdrawal</p>
                <p className="text-xs text-gray-400">When balance reaches $300</p>
              </div>
              <Toggle />
            </div>
          </div>
        </div>
      </div>

      {/* Security and Notifications */}
      <div className="bg-[#fafafa] p-6">
        <div className="mb-6">
          <h2 className="font-bold text-black text-2xl mb-3">Security and Notifications</h2>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {[
              { label: "Payment Notification" },
              { label: "Two Factor Authentication" },
              { label: "Monthly Statement" },
            ].map((item, i) => (
              <div key={item.label} className={`flex items-center justify-between px-4 py-3.5 ${i < 2 ? "border-b border-gray-100" : ""}`}>
                <p className="text-sm text-gray-800">{item.label}</p>
                <Toggle />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">
        <button className="flex items-center gap-2 bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">⊗ Cancel</button>
        <button className="bg-[#E2554F] hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">Save Changes</button>
      </div>
    </div>
  );
};

export default PaymentSettingsTab;