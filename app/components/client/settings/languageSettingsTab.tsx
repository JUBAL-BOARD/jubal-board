"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ToggleRow from "./toggleRow";
import SettingsSection from "./settingsSection";
import SaveCancelBar from "./saveCancelBar";

const SelectRow: React.FC<{ label: string; description?: string; options: string[] }> = ({
  label, description, options,
}) => {
  const [value, setValue] = useState(options[0]);
  return (
    <div className="bg-white px-4 py-3.5 border-b border-gray-100">
      <div className="flex justify-between items-center">
        <div className="">
          <p className="m-0 text-[14px] font-medium text-[#1a1a2e]">{label}</p>
          {description && <p className="m-0 mt-0.5 text-xs text-gray-500">{description}</p>}
        </div>
        <div className="relative min-w-[160px]">
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-[13px] text-gray-700 outline-none appearance-none cursor-pointer bg-white"
          >
            {options.map((o) => <option key={o}>{o}</option>)}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown size={14} stroke="#6B7280" />
          </div>
        </div>
      </div>
    </div>
  );
};

const LanguageSettingsTab: React.FC = () => {
  const [autoTranslate, setAutoTranslate] = useState(true);

  return (
    <div className="bg-white flex flex-col gap-6">

      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Language Preference">
          <SelectRow
            label="Website language"
            description="Select language used for all menus and notifications"
            options={["English", "French", "Spanish", "Arabic", "Yoruba"]}
          />
          <ToggleRow
            label="Auto Translate Message"
            description="Translate incoming messages to your selected language"
            checked={autoTranslate}
            onChange={setAutoTranslate}
          />
        </SettingsSection>
      </div>

      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Regional Format Settings">
          <SelectRow label="Date & Time Format" options={["MM/DD/YYYY 12hr", "DD/MM/YYYY 24hr", "YYYY/MM/DD"]} />
          <SelectRow label="Currency Display" description="For pricing, invoice and payment" options={["USD ($)", "EUR (€)", "GBP (£)", "NGN (₦)"]} />
          <SelectRow label="Metric Unit" options={["Imperial", "Metric"]} />
        </SettingsSection>
      </div>

      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Theme & Display Mode">
          <SelectRow label="Light Mode" options={["Light Mode", "Dark Mode", "System Default"]} />
          <SelectRow label="Font Size" options={["Medium", "Small", "Large"]} />
        </SettingsSection>
      </div>

      <SaveCancelBar
        onCancel={() => { }}
        onSave={() => alert("Preferences saved!")}
        saveLabel="Save Preference"
      />

    </div>
  );
};

export default LanguageSettingsTab;