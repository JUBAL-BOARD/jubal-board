"use client";
import { ChevronDown } from "lucide-react";

const deliveryTypes = [
  { label: "Initial Delivery", value: "INITIAL" },
  { label: "Revision", value: "REVISION" },
  { label: "Final Delivery", value: "FINAL" },
];

interface DeliveryTypeSelectorProps {
  active: { label: string; value: string };
  onChange: (type: { label: string; value: string }) => void;
}

const DeliveryTypeSelector: React.FC<DeliveryTypeSelectorProps> = ({ active, onChange }) => (
  <div className="bg-[#fafafa] border border-gray-200 rounded-xl mb-4 overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4">
      <span className="font-semibold text-black text-sm">Select Deliverable Type</span>
      <ChevronDown size={18} className="text-gray-500" />
    </div>
    <div className="px-5 pb-5 flex gap-3 flex-wrap">
      {deliveryTypes.map((type) => (
        <button
          key={type.value}
          onClick={() => onChange(type)}
          className={`px-4 py-2 rounded-3xl text-sm font-semibold border transition-colors ${
            active.value === type.value
              ? "bg-[#e84545] text-white border-[#e84545]"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          {type.label}
        </button>
      ))}
    </div>
  </div>
);

export default DeliveryTypeSelector;