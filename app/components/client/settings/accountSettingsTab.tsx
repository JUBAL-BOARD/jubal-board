"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import ToggleRow from "./toggleRow";
import SettingsSection from "./settingsSection";

const inputClass = "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-700 outline-none box-border bg-transparent";

type AuthMethod = {
  label: string;
  description: string;
  status: "Enabled" | "Not Set" | "Recommended";
  actionLabel: string;
};

const authMethods: AuthMethod[] = [
  { label: "Email Code", description: "Receive authentication codes via email", status: "Enabled", actionLabel: "Manage" },
  { label: "SMS Code", description: "Receive authentication code via text message!", status: "Not Set", actionLabel: "Set Up" },
  { label: "Google Authenticator", description: "Use Google Authenticator app for time-based codes", status: "Recommended", actionLabel: "Set Up" },
  { label: "Authy", description: "Use Authy app for secure authentication codes", status: "Enabled", actionLabel: "Manage" },
  { label: "Backup Codes", description: "One-time backup codes for account recovery", status: "Recommended", actionLabel: "Generate" },
];

const statusStyles: Record<string, string> = {
  Enabled: "bg-green-500 text-white",
  "Not Set": "bg-[#1a1a2e] text-white",
  Recommended: "bg-amber-400 text-white",
};

const AccountSettingsTab: React.FC = () => {
  const [email, setEmail] = useState("charleseden@gmail.com");
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [mfa, setMfa] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);

  return (
    <div className="bg-white flex flex-col gap-6">

      {/* Email */}
      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Email Address">
          <div className="p-4">
            <p className="m-0 mb-3 text-[13px] text-black">
              Update your email address for account notifications and login
            </p>
            <div className="flex gap-3 bg-white">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} flex-1`}
              />
              <button className="bg-[#E2554F] border-none rounded-lg px-6 py-2.5 cursor-pointer text-white font-bold text-[14px] whitespace-nowrap hover:bg-[#d44a44] transition-colors">
                Update Email
              </button>
            </div>
          </div>
        </SettingsSection>
      </div>

      {/* Password */}
      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Password">
          <div className="p-4">
            <p className="m-0 mb-3 text-[13px] text-gray-500">
              Change your password to keep your account secure
            </p>
            <div className="flex flex-col gap-2.5 max-w-[380px]">
              {[
                { placeholder: "Current Password", key: "current" },
                { placeholder: "New Password", key: "newPass" },
                { placeholder: "Confirm new password", key: "confirm" },
              ].map(({ placeholder, key }) => (
                <input
                  key={key}
                  type="password"
                  placeholder={placeholder}
                  value={(passwords as any)[key]}
                  onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                  className={inputClass}
                />
              ))}
              <button className="self-start bg-[#E2554F] border-none rounded-lg px-6 py-2.5 cursor-pointer text-white font-bold text-[14px] hover:bg-[#d44a44] transition-colors">
                Change Password
              </button>
            </div>
          </div>
        </SettingsSection>
      </div>

      {/* MFA */}
      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Multi-Factor Authentication">
          <ToggleRow
            label="Change your password to keep your account secure"
            description=""
            checked={mfa}
            onChange={setMfa}
          />
        </SettingsSection>
      </div>

      {/* Auth Methods */}
      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Authentication Methods">
          {authMethods.map((method) => (
            <div
              key={method.label}
              className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100"
            >
              <div>
                <p className="m-0 text-[14px] font-medium text-[#1a1a2e]">{method.label}</p>
                <p className="m-0 mt-0.5 text-xs text-gray-500">{method.description}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className={`text-xs font-semibold px-3 py-1 rounded-md ${statusStyles[method.status]}`}>
                  {method.status}
                </span>
                <button className="bg-white border border-gray-200 rounded-md px-3.5 py-1.5 cursor-pointer text-[13px] text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  {method.actionLabel}
                </button>
              </div>
            </div>
          ))}
        </SettingsSection>
      </div>

      {/* Additional Security */}
      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Additional Security">
          <ToggleRow label="Login Alerts" description="Get notified for new login attempts!" checked={loginAlerts} onChange={setLoginAlerts} />
          <ToggleRow label="Session Timeout" description="Automatically log out after 30 minutes of inactivity" checked={sessionTimeout} onChange={setSessionTimeout} />
        </SettingsSection>
      </div>

      {/* Account Actions */}
      <div className="bg-white mb-6">
        <h3 className="text-2xl font-extrabold text-[#1a1a2e] m-0 mb-3">Account Actions</h3>
        <div className="flex justify-between">
          <button className="bg-[#E2554F] border-none rounded-lg px-6 py-3 cursor-pointer text-white font-bold text-[14px] hover:bg-[#d44a44] transition-colors">
            Deactivate Account
          </button>
          <button className="bg-[#E2554F] border-none rounded-lg px-6 py-3 cursor-pointer text-white font-bold text-[14px] hover:bg-[#d44a44] transition-colors">
            Delete Account
          </button>
        </div>
      </div>

      {/* Device */}
      <div className="bg-[#fafafa] p-6">
        <SettingsSection title="Device">
          <div className="p-4 grid grid-cols-2 gap-3">
            {["Device 1", "Device 2"].map((d) => (
              <div
                key={d}
                className="border border-gray-200 rounded-lg px-4 py-3 flex justify-between items-center"
              >
                <span className="text-[13px] text-gray-700">{d}</span>
                <ChevronRight size={16} stroke="#374151" />
              </div>
            ))}
          </div>
        </SettingsSection>
      </div>

      {/* Sign Out All */}
      <div className="flex justify-center mb-6">
        <button className="bg-[#E2554F] border-none rounded-lg px-12 py-3 cursor-pointer text-white font-bold text-[14px] hover:bg-[#d44a44] transition-colors">
          Sign Out from all Devices
        </button>
      </div>

    </div>
  );
};

export default AccountSettingsTab;