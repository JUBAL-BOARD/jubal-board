"use client";

import { useState } from "react";

const Toggle = ({ defaultOn = true }: { defaultOn?: boolean }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className={`relative flex-shrink-0 w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${on ? "bg-[#E2554F]" : "bg-gray-300"}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "left-[22]" : "left-[2]"}`} />
    </button>
  );
};

const ToggleRow = ({ label, desc }: { label: string; desc?: string }) => (
  <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 last:border-none">
    <div>
      <p className="text-sm text-gray-800">{label}</p>
      {desc && <p className="text-xs text-gray-400">{desc}</p>}
    </div>
    <Toggle />
  </div>
);

const Section = ({ title, items }: { title: string; items: { label: string; desc?: string }[] }) => (
  <div className="mb-6">
    <h2 className="font-bold text-black text-2xl mb-3">{title}</h2>
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {items.map((item) => <ToggleRow key={item.label} {...item} />)}
    </div>
  </div>
);

const PrivacySettingsTab: React.FC = () => {
  return (
    <div className="bg-white flex flex-col gap-6">
      <div className="bg-[#fafafa] p-6">
        <Section title="Visibility" items={[
          { label: "Show Online Status", desc: "When on, creatives can see when you are active" },
          { label: "Show Last Seen", desc: "Help creatives know your availability" },
          { label: "Show Business Name Publicly", desc: "Appears on your job post and profile" },
          { label: "Show Profile to Verified Creatives Only", desc: "When on , only verified creatives can see when you are active" },
        ]} />
      </div>

      <div className="bg-[#fafafa] p-6">
        <Section title="Communication" items={[
          { label: "Allow Creatives to Message You Directly", desc: "Messages from creatives appear on your inbox" },
          { label: "Only Accept Messages from Accepted Proposals", desc: "Block unsolicited messages until a proposal is accepted" },
        ]} />
      </div>

      <div className="bg-[#fafafa] p-6">
        <Section title="Job Visibility" items={[
          { label: "All Creatives", desc: "Both business & individual account can see your posts and apply" },
          { label: "Individuals Only", desc: "Freelancers will be able to view and apply" },
          { label: "Business Only", desc: "Only business accounts will be able to view and apply" },
        ]} />
      </div>

      <div className="bg-[#fafafa] p-6">
        <Section title="Additional Control" items={[
          { label: "Portfolio Required", desc: "Only accounts with portfolio will be able to view and apply" },
          { label: "Same Country Only", desc: "Restricts visibility to creatives in your region only" },
        ]} />
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">
        <button className="flex items-center gap-2 bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">⊗ Cancel</button>
        <button className="bg-[#E2554F] hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">Save Preference</button>
      </div>
    </div>
  );
};

export default PrivacySettingsTab;