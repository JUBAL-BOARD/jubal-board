"use client";

import { useState } from "react";
import ToggleRow from "./toggleRow";
import SettingsSection from "./settingsSection";
import SaveCancelBar from "./saveCancelBar";

const NotificationSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    newProposal: true,
    jobExpiration: true,
    projectProgress: true,
    projectMilestone: true,
    newMessage: true,
    emailNotifications: true,
    mentions: true,
    paymentMade: true,
    withdrawalMade: true,
    promotions: true,
    newFeature: true,
    policyTerms: true,
    feedback: true,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="bg-white flex flex-col gap-6">

      {/* Push */}
      <SettingsSection title="Push Notifications">
        <ToggleRow
          label=""
          description="Stay updated with important alerts"
          checked={settings.pushNotifications}
          onChange={() => toggle("pushNotifications")}
        />
      </SettingsSection>

      {/* Activity */}
      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Activity Updates">
          {[
            { label: "New Proposal", key: "newProposal" },
            { label: "Job Post Expiration Reminder", key: "jobExpiration" },
            { label: "Project Progress", key: "projectProgress" },
            { label: "Project Milestone Update", key: "projectMilestone" },
          ].map(({ label, key }) => (
            <ToggleRow key={key} label={label} checked={(settings as any)[key]} onChange={() => toggle(key as any)} />
          ))}
        </SettingsSection>
      </div>

      {/* Messages */}
      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Messages">
        {[
          { label: "New Message Alert", key: "newMessage" },
          { label: "Email Notifications", key: "emailNotifications" },
          { label: "Mentions/Tags", key: "mentions" },
        ].map(({ label, key }) => (
          <ToggleRow key={key} label={label} checked={(settings as any)[key]} onChange={() => toggle(key as any)} />
        ))}
      </SettingsSection>
      </div>

      {/* Payment */}
      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Payment Updates">
        {[
          { label: "Payment Made Notification", key: "paymentMade" },
          { label: "Withdrawal Made Notification", key: "withdrawalMade" },
        ].map(({ label, key }) => (
          <ToggleRow key={key} label={label} checked={(settings as any)[key]} onChange={() => toggle(key as any)} />
        ))}
      </SettingsSection>
      </div>

      {/* In-App */}
      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="In-App Updates">
        {[
          { label: "Promotions/Offers", key: "promotions" },
          { label: "New Feature/System Update", key: "newFeature" },
          { label: "Policy/Terms Update", key: "policyTerms" },
          { label: "Feedback Request", key: "feedback" },
        ].map(({ label, key }) => (
          <ToggleRow key={key} label={label} checked={(settings as any)[key]} onChange={() => toggle(key as any)} />
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

export default NotificationSettingsTab;