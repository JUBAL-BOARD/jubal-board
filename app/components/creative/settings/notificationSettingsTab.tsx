"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface NotificationSettings {
  // Activity Updates
  briefInvitationEmail: boolean;
  briefInvitationPush: boolean;
  briefInvitationInApp: boolean;
  jobPostExpirationEmail: boolean;
  jobPostExpirationPush: boolean;
  jobPostExpirationInApp: boolean;
  projectProgressEmail: boolean;
  projectProgressPush: boolean;
  projectProgressInApp: boolean;
  projectMilestoneEmail: boolean;
  projectMilestonePush: boolean;
  projectMilestoneInApp: boolean;
  // Messages
  newMessageEmail: boolean;
  newMessagePush: boolean;
  newMessageInApp: boolean;
  mentionsEmail: boolean;
  mentionsPush: boolean;
  mentionsInApp: boolean;
  // Payment Updates
  paymentMadeEmail: boolean;
  paymentMadePush: boolean;
  withdrawalMadeEmail: boolean;
  withdrawalMadePush: boolean;
  // In-App Updates
  promotionsEmail: boolean;
  promotionsPush: boolean;
  newFeatureEmail: boolean;
  newFeaturePush: boolean;
  policyUpdateEmail: boolean;
  policyUpdatePush: boolean;
  feedbackRequestEmail: boolean;
  feedbackRequestPush: boolean;
}

const defaultSettings: NotificationSettings = {
  briefInvitationEmail: true, briefInvitationPush: true, briefInvitationInApp: true,
  jobPostExpirationEmail: true, jobPostExpirationPush: true, jobPostExpirationInApp: true,
  projectProgressEmail: true, projectProgressPush: true, projectProgressInApp: true,
  projectMilestoneEmail: true, projectMilestonePush: true, projectMilestoneInApp: true,
  newMessageEmail: true, newMessagePush: true, newMessageInApp: true,
  mentionsEmail: true, mentionsPush: true, mentionsInApp: true,
  paymentMadeEmail: true, paymentMadePush: true,
  withdrawalMadeEmail: true, withdrawalMadePush: true,
  promotionsEmail: true, promotionsPush: true,
  newFeatureEmail: true, newFeaturePush: true,
  policyUpdateEmail: true, policyUpdatePush: true,
  feedbackRequestEmail: true, feedbackRequestPush: true,
};

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative flex-shrink-0 w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${value ? "bg-[#E2554F]" : "bg-gray-300"}`}
  >
    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${value ? "left-[22px]" : "left-[2px]"}`} />
  </button>
);

const ToggleRow = ({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 last:border-none">
    <div>
      <p className="text-sm text-gray-800">{label}</p>
      {desc && <p className="text-xs text-gray-400">{desc}</p>}
    </div>
    <Toggle value={value} onChange={onChange} />
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-6">
    <h2 className="font-bold text-black text-2xl mb-3">{title}</h2>
    <div className="border border-gray-200 rounded-xl overflow-hidden">{children}</div>
  </div>
);

const NotificationSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);

  const set = (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const tokenRes = await fetch("/api/auth/session/token", { credentials: "include" });
        const { token } = await tokenRes.json();
        if (!token) throw new Error("Unauthorized");

        const res = await fetch("/api/v1/users/me/settings/notifications", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        if (res.ok) {
          const json = await res.json();
          const data = json.data;
          if (data) {
            setSettings((prev) => ({ ...prev, ...data }));
          }
        }
      } catch {
        // silently fall back to defaults
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const tokenRes = await fetch("/api/auth/session/token", { credentials: "include" });
      const { token } = await tokenRes.json();
      if (!token) throw new Error("Unauthorized");

      const res = await fetch("/api/v1/users/me/settings/notifications", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save notification settings.");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#E2554F] mb-4" />
        <p className="text-gray-500 text-sm font-medium">Loading notification settings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-600">
          Notification preferences saved!
        </div>
      )}

      {/* Push Notifications master toggle */}
      <div className="flex items-center justify-between mb-2 px-5 py-4">
        <div>
          <p className="font-bold text-black text-2xl">Push Notifications</p>
          <p className="text-xs text-gray-500">Stay updated with important alerts</p>
        </div>
        <Toggle value={pushEnabled} onChange={setPushEnabled} />
      </div>

      <div className="bg-[#fafafa] p-6">
        <Section title="Activity Updates">
          <ToggleRow label="New Proposal" value={settings.briefInvitationPush} onChange={(v) => set("briefInvitationPush", v)} />
          <ToggleRow label="Job Post Expiration Reminder" value={settings.jobPostExpirationPush} onChange={(v) => set("jobPostExpirationPush", v)} />
          <ToggleRow label="Project Progress" value={settings.projectProgressPush} onChange={(v) => set("projectProgressPush", v)} />
          <ToggleRow label="Project Milestone Update" value={settings.projectMilestonePush} onChange={(v) => set("projectMilestonePush", v)} />
        </Section>
      </div>

      <div className="bg-[#fafafa] p-6">
        <Section title="Messages">
          <ToggleRow label="New Message Alert" value={settings.newMessagePush} onChange={(v) => set("newMessagePush", v)} />
          <ToggleRow label="Email Notifications" value={settings.newMessageEmail} onChange={(v) => set("newMessageEmail", v)} />
          <ToggleRow label="Mentions/Tags" value={settings.mentionsPush} onChange={(v) => set("mentionsPush", v)} />
        </Section>
      </div>

      <div className="bg-[#fafafa] p-6">
        <Section title="Payment Updates">
          <ToggleRow label="Payment Made Notification" value={settings.paymentMadePush} onChange={(v) => set("paymentMadePush", v)} />
          <ToggleRow label="Withdrawal Made Notification" value={settings.withdrawalMadePush} onChange={(v) => set("withdrawalMadePush", v)} />
        </Section>
      </div>

      <div className="bg-[#fafafa] p-6">
        <Section title="In-App Updates">
          <ToggleRow label="Promotions/Offers" value={settings.promotionsPush} onChange={(v) => set("promotionsPush", v)} />
          <ToggleRow label="New Feature/System Update" value={settings.newFeaturePush} onChange={(v) => set("newFeaturePush", v)} />
          <ToggleRow label="Policy/Terms Update" value={settings.policyUpdatePush} onChange={(v) => set("policyUpdatePush", v)} />
          <ToggleRow label="Feedback Request" value={settings.feedbackRequestPush} onChange={(v) => set("feedbackRequestPush", v)} />
        </Section>
      </div>

      <div className="flex items-center justify-end gap-3 mt-2 mb-4">
        <button
          onClick={() => setSettings(defaultSettings)}
          className="flex items-center gap-2 bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          ⊗ Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#E2554F] hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm disabled:opacity-70 flex items-center gap-2"
        >
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save Preference"}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettingsTab;