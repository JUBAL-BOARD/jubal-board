"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const Toggle = ({ defaultOn = true }: { defaultOn?: boolean }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className={`relative flex-shrink-0 w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${on ? "bg-[#E2554F]" : "bg-gray-300"}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "left-[22]" : "left-[2]"}`} />
    </button>
  );
};

const SelectRow = ({ label, desc }: { label: string; desc?: string }) => (
  <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 last:border-none">
    <div>
      <p className="text-sm text-gray-800">{label}</p>
      {desc && <p className="text-xs text-gray-400">{desc}</p>}
    </div>
    <ChevronDown size={16} className="text-gray-400" />
  </div>
);

const LanguageAppearanceTab: React.FC = () => {
  return (
    <div className="bg-white flex flex-col gap-6">
      {/* Language Preference */}
      <div className="bg-[#fafafa] p-6">
        <div className="mb-6">
          <h2 className="font-bold text-black text-2xl mb-3">Language Preference</h2>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <SelectRow label="Website language" desc="Select language used for all menus and notifications" />
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-sm text-gray-800">Auto Translate Message</p>
                <p className="text-xs text-gray-400">Translate incoming messages to your selected language</p>
              </div>
              <Toggle />
            </div>
          </div>
        </div>
      </div>

      {/* Regional Format Settings */}
      <div className="bg-[#fafafa] p-6">
        <div className="mb-6">
          <h2 className="font-bold text-black text-2xl mb-3">Regional Format Settings</h2>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <SelectRow label="Date & Time Format" />
            <SelectRow label="Currency Display" desc="For pricing, invoice and payment" />
            <SelectRow label="Metric Unit" />
          </div>
        </div>
      </div>

      {/* Theme & Display Mode */}
      <div className="bg-[#fafafa] p-6">
        <div className="mb-6">
          <h2 className="font-bold text-black text-2xl mb-3">Theme & Display Mode</h2>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <SelectRow label="Light Mode" />
            <SelectRow label="Font Size" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">
        <button className="flex items-center gap-2 bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">⊗ Cancel</button>
        <button className="bg-[#E2554F] hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">Save Preference</button>
      </div>
    </div>
  );
};

export default LanguageAppearanceTab;