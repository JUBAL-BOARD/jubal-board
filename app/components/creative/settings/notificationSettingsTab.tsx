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

const NotificationSettingsTab: React.FC = () => {
  return (
    <div className="bg-white flex flex-col gap-6">
      <div className="flex items-center justify-between mb-6 px-5 py-4">
        <div>
          <p className="font-bold text-black text-2xl">Push Notifications</p>
          <p className="text-xs text-gray-500">Stay updated with important alerts</p>
        </div>
        <Toggle defaultOn={true} />
      </div>

      <div className="bg-[#fafafa] p-6">
        <Section title="Activity Updates" items={[
          { label: "New Proposal" },
          { label: "Job Post Expiration Reminder" },
          { label: "Project Progress" },
          { label: "Project Milestone Update" },
        ]} />
      </div>

      <div className="bg-[#fafafa] p-6">
        <Section title="Messages" items={[
          { label: "New Message Alert" },
          { label: "Email Notifications" },
          { label: "Mentions/Tags" },
        ]} />
      </div>

      <div className="bg-[#fafafa] p-6">
        <Section title="Payment Updates" items={[
          { label: "Payment Made Notification" },
          { label: "Withdrawal Made Notification" },
        ]} />
      </div>

      <div className="bg-[#fafafa] p-6">
        <Section title="In-App Updates" items={[
          { label: "Promotions/Offers" },
          { label: "New Feature/System Update" },
          { label: "Policy/Terms Update" },
          { label: "Feedback Request" },
        ]} />
      </div>

      <ActionButtons saveLabel="Save Preference" />
    </div>
  );
};

const ActionButtons = ({ saveLabel = "Save Changes" }: { saveLabel?: string }) => (
  <div className="flex items-center justify-end gap-3 mt-6">
    <button className="flex items-center gap-2 bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">⊗ Cancel</button>
    <button className="bg-[#E2554F] hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">{saveLabel}</button>
  </div>
);

export default NotificationSettingsTab;