"use client";

import { useState } from "react";

const authMethods = [
  { label: "Email Code", desc: "Receive authentication codes via email", status: "Enabled", statusColor: "bg-green-500", action: "Manage" },
  { label: "SMS Code", desc: "Receive authentication code via text message!", status: "Not Set", statusColor: "bg-[#1a1a2e]", action: "Set Up" },
  { label: "Google Authenticator", desc: "Use Google Authenticator app for time-based codes", status: "Recommended", statusColor: "bg-orange-400", action: "Set Up" },
  { label: "Authy", desc: "Use Authy app for secure authentication codes", status: "Enabled", statusColor: "bg-green-500", action: "Manage" },
  { label: "Backup Codes", desc: "One-time backup codes for account recovery", status: "Recommended", statusColor: "bg-orange-400", action: "Generate" },
];

const Toggle = ({ defaultOn = true }: { defaultOn?: boolean }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className={`relative flex-shrink-0 w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${on ? "bg-[#E2554F]" : "bg-gray-300"}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "left-[22]" : "left-[2]"}`} />
    </button>
  );
};

const AccountSettingsTab: React.FC = () => {
  const [email, setEmail] = useState("charleseden@gmail.com");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  return (
    <div className="bg-white flex flex-col gap-6">
      {/* Email */}
      <div className="bg-[#fafafa] p-6 border border-gray-200 rounded-xl p-6">
        <h2 className="font-bold text-gray-900 text-2xl mb-1">Email Address</h2>
        <p className="text-xs text-black mb-4">Update your email address for account notifications and login</p>
        <div className="flex items-center gap-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-black text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-100" />
          <button className="bg-[#E2554F] hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">Update Email</button>
        </div>
      </div>

      {/* Password */}
      <div className="bg-[#fafafa] p-6 border border-gray-200 rounded-xl p-6">
        <h2 className="font-bold text-gray-900 text-2xl mb-1">Password</h2>
        <p className="text-xs text-black mb-4">Change your password to keep your account secure</p>
        <div className="flex flex-col gap-3 max-w-md">
          <input type="password" placeholder="Current Password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-100" />
          <input type="password" placeholder="New Password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-100" />
          <input type="password" placeholder="Confirm new password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-100" />
          <button className="bg-[#E2554F] hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors w-fit">Change Password</button>
        </div>
      </div>

      {/* MFA */}
      <div className="bg-[#fafafa] p-6 border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-gray-900 text-2xl">Multi-Factor Authentication</h2>
            <p className="text-xs text-black">Change your password to keep your account secure</p>
          </div>
          <Toggle defaultOn={true} />
        </div>
      </div>

      <div className="bg-[#fafafa] p-6 border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-black text-2xl mb-3">Authentication Methods</h3>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {authMethods.map((m, i) => (
            <div key={m.label} className={`flex items-center justify-between px-4 py-3.5 ${i < authMethods.length - 1 ? "border-b border-gray-100" : ""}`}>
              <div>
                <p className="text-sm font-medium text-gray-900">{m.label}</p>
                <p className="text-xs text-gray-500">{m.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`${m.statusColor} text-xs font-semibold px-3 py-1 rounded-md`}>{m.status}</span>
                <button className="bg-white border border-gray-200 rounded-md px-3.5 py-1.5 cursor-pointer text-[13px] text-gray-700 font-medium hover:bg-gray-50 transition-colors">{m.action}</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Security */}
      <div className="bg-[#fafafa] p-6 border border-gray-200 rounded-xl p-6">
        <h2 className="font-bold text-black text-2xl mb-4">Additional Security</h2>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {[
            { label: "Login Alerts", desc: "Get notified for new login attempts!" },
            { label: "Session Timeout", desc: "Automatically log out after 30 minutes of inactivity" },
          ].map((item, i) => (
            <div key={item.label} className={`flex items-center justify-between px-4 py-3.5 ${i === 0 ? "border-b border-gray-100" : ""}`}>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <Toggle />
            </div>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div className=" rounded-xl p-6">
        <h2 className="font-bold text-black text-2xl mb-4">Account Actions</h2>
        <div className="flex items-center justify-between">
          <button className="bg-[#E2554F] hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">Deactivate Account</button>
          <button className="bg-[#E2554F] hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">Delete Account</button>
        </div>
      </div>

      {/* Device */}
      <div className="bg-[#fafafa] p-6 border border-gray-200 rounded-xl p-6">
        <h2 className="font-bold text-black text-2xl mb-4">Device</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {["Device 1", "Device 2"].map((d) => (
            <div key={d} className="border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">{d}</span>
              <span className="text-gray-400">›</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center mb-6">
          <button className="bg-[#E2554F] hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">Sign Out from all Devices</button>
        </div>
      </div>
      <ActionButtons />
    </div>
  );
};

const ActionButtons = () => (
  <div className="flex items-center justify-end gap-3 mt-6">
    <button className="flex items-center gap-2 bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
      ⊗ Cancel
    </button>
    <button className="bg-[#E2554F] hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
      Save Changes
    </button>
  </div>
);

export default AccountSettingsTab;