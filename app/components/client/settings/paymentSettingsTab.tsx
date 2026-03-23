"use client";

import { useState } from "react";
import { X, Banknote, Landmark } from "lucide-react";
import ToggleRow from "./toggleRow";
import SettingsSection from "./settingsSection";
import SaveCancelBar from "./saveCancelBar";

const CardIcon: React.FC<{ color: string }> = ({ color }) => (
  <div
    className="w-7 h-[18px] rounded flex items-center justify-center flex-shrink-0"
    style={{ background: color }}
  >
    <div className="w-3 h-2 rounded-sm bg-white/50" />
  </div>
);

const PaypalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#003087">
    <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 00-.607-.541c1.379 3.741-.614 6.647-4.95 6.647h-2.458l-1.461 9.267h3.53l.765-4.845c.082-.519.526-.9 1.05-.9h.527c3.875 0 6.565-1.88 7.374-5.843.433-2.145.12-3.897-.77-4.785z" />
  </svg>
);

interface PaymentMethod {
  id: number;
  icon: React.ReactNode;
  label: string;
  subtitle: string;
}

const initialMethods: PaymentMethod[] = [
  { id: 1, icon: <Banknote size={20} stroke="#374151" />, label: "Cash", subtitle: "" },
  { id: 2, icon: <CardIcon color="#EB001B" />, label: "Mastercard", subtitle: "*****3456  Expires 08/26" },
  { id: 3, icon: <CardIcon color="#1A1F71" />, label: "Visa", subtitle: "*****3456  Expires 08/26" },
  { id: 4, icon: <PaypalIcon />, label: "PayPal", subtitle: "charleseden@jubalboard.com" },
  { id: 5, icon: <Landmark size={20} stroke="#374151" />, label: "Bank", subtitle: "Account *****3456" },
];

const PaymentSettingsTab: React.FC = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);
  const [toggles, setToggles] = useState({
    autoWithdrawal: true,
    paymentNotification: true,
    twoFactor: true,
    monthlyStatement: true,
  });

  const toggle = (key: keyof typeof toggles) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const removeMethod = (id: number) =>
    setMethods((prev) => prev.filter((m) => m.id !== id));

  return (
    <div className="bg-white flex flex-col gap-6">

      {/* Payment Methods */}
      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Payment Method">
          {methods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between px-4 py-3 border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                {method.icon}
                <div>
                  <p className="m-0 text-[14px] font-medium text-[#1a1a2e]">{method.label}</p>
                  {method.subtitle && (
                    <p className="m-0 mt-0.5 text-xs text-gray-500">{method.subtitle}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeMethod(method.id)}
                className="bg-transparent border-none cursor-pointer p-1 hover:opacity-70 transition-opacity"
              >
                <X size={16} stroke="#9CA3AF" />
              </button>
            </div>
          ))}
        </SettingsSection>
      </div>

      {/* Withdrawal */}
      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Withdrawal Settings">
          <ToggleRow
            label="Auto Withdrawal"
            description="When balance reaches $300"
            checked={toggles.autoWithdrawal}
            onChange={() => toggle("autoWithdrawal")}
          />
        </SettingsSection>
      </div>

      {/* Security */}
      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Security and Notifications">
          {[
            { label: "Payment Notification", key: "paymentNotification" },
            { label: "Two Factor Authentication", key: "twoFactor" },
            { label: "Monthly Statement", key: "monthlyStatement" },
          ].map(({ label, key }) => (
            <ToggleRow key={key} label={label} checked={(toggles as any)[key]} onChange={() => toggle(key as any)} />
          ))}
        </SettingsSection>
      </div>

      <SaveCancelBar onCancel={() => { }} onSave={() => alert("Changes saved!")} />

    </div>
  );
};

export default PaymentSettingsTab;