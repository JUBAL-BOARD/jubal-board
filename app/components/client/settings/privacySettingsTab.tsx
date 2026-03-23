"use client";

import { useState } from "react";
import ToggleRow from "./toggleRow";
import SettingsSection from "./settingsSection";
import SaveCancelBar from "./saveCancelBar";

const PrivacySettingsTab: React.FC = () => {
  const [settings, setSettings] = useState({
    onlineStatus: true,
    lastSeen: true,
    businessName: true,
    verifiedOnly: true,
    allowMessages: true,
    acceptedOnly: true,
    allCreatives: true,
    individualsOnly: true,
    businessOnly: true,
    portfolioRequired: true,
    sameCountry: true,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="bg-white flex flex-col gap-6">

      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Visibility">
          {[
            { label: "Show Online Status", desc: "When on, creatives can see when you are active", key: "onlineStatus" },
            { label: "Show Last Seen", desc: "Help creatives know your availability", key: "lastSeen" },
            { label: "Show Business Name Publicly", desc: "Appears on your job post and profile", key: "businessName" },
            { label: "Show Profile to Verified Creatives Only", desc: "When on, only verified creatives can see when you are active", key: "verifiedOnly" },
          ].map(({ label, desc, key }) => (
            <ToggleRow key={key} label={label} description={desc} checked={(settings as any)[key]} onChange={() => toggle(key as any)} />
          ))}
        </SettingsSection>
      </div>

      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Communication">
          {[
            { label: "Allow Creatives to Message You Directly", desc: "Messages from creatives appear on your inbox", key: "allowMessages" },
            { label: "Only Accept Messages from Accepted Proposals", desc: "Block unsolicited messages until a proposal is accepted", key: "acceptedOnly" },
          ].map(({ label, desc, key }) => (
            <ToggleRow key={key} label={label} description={desc} checked={(settings as any)[key]} onChange={() => toggle(key as any)} />
          ))}
        </SettingsSection>
      </div>

      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Job Visibility">
          {[
            { label: "All Creatives", desc: "Both business & individual account can see your posts and apply", key: "allCreatives" },
            { label: "Individuals Only", desc: "Freelancers will be able to view and apply", key: "individualsOnly" },
            { label: "Business Only", desc: "Only business accounts will be able to view and apply", key: "businessOnly" },
          ].map(({ label, desc, key }) => (
            <ToggleRow key={key} label={label} description={desc} checked={(settings as any)[key]} onChange={() => toggle(key as any)} />
          ))}
        </SettingsSection>
      </div>

      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Additional Control">
          {[
            { label: "Portfolio Required", desc: "Only accounts with portfolio will be able to view and apply", key: "portfolioRequired" },
            { label: "Same Country Only", desc: "Restricts visibility to creatives in your region only", key: "sameCountry" },
          ].map(({ label, desc, key }) => (
            <ToggleRow key={key} label={label} description={desc} checked={(settings as any)[key]} onChange={() => toggle(key as any)} />
          ))}
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

export default PrivacySettingsTab;