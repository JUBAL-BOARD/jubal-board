"use client";

import { useState } from "react";
import { Camera } from "lucide-react";

const ProfileSettingsTab: React.FC = () => {
  const [form, setForm] = useState({
    fullName: "", dob: "", contactNumber: "", country: "",
    streetAddress: "", socialLinks: "", bio: "",
    postalCode: "", language: "English",
    preferredCommunication: "", professionalRole: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div>
      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <img
            src="https://i.pravatar.cc/150?img=47"
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow">
            <Camera size={14} className="text-black" />
          </button>
        </div>
        <p className="text-sm font-semibold text-black mt-2">Natasha John</p>
      </div>

      {/* Form */}
      <div className="border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-medium text-black mb-1 block">Full Name <span className="text-red-500">*</span></label>
            <input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Type here" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-red-100 bg-gray-50" />
          </div>
          <div>
            <label className="text-xs font-medium text-black mb-1 block">Date of Birth <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} placeholder="Type here" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-red-100 bg-gray-50" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-black mb-1 block">Contact Number <span className="text-red-500">*</span></label>
            <input value={form.contactNumber} onChange={(e) => update("contactNumber", e.target.value)} placeholder="Type here" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-red-100 bg-gray-50" />
          </div>
          <div>
            <label className="text-xs font-medium text-black mb-1 block">Country/State <span className="text-red-500">*</span></label>
            <input value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="Type here" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-red-100 bg-gray-50" />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-black mb-1 block">Street Address <span className="text-red-500">*</span></label>
          <input value={form.streetAddress} onChange={(e) => update("streetAddress", e.target.value)} placeholder="Type your street address" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-100 bg-gray-50" />
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-black mb-1 block">Preferred Social Link(s) <span className="text-red-500">*</span></label>
          <input value={form.socialLinks} onChange={(e) => update("socialLinks", e.target.value)} placeholder="Type here" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-red-100 bg-gray-50" />
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-black mb-1 block">Describe yourself in one line <span className="text-red-500">*</span></label>
          <textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-red-100 bg-gray-50 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-medium text-black mb-1 block">Postal Code</label>
            <input value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} placeholder="Type here" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-red-100 bg-gray-50" />
          </div>
          <div>
            <label className="text-xs font-medium text-black mb-1 block">Language Preference <span className="text-red-500">*</span></label>
            <select value={form.language} onChange={(e) => update("language", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-red-100 bg-gray-50">
              <option>English</option>
              <option>French</option>
              <option>Spanish</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-black mb-1 block">Preferred Communication <span className="text-red-500">*</span></label>
            <input value={form.preferredCommunication} onChange={(e) => update("preferredCommunication", e.target.value)} placeholder="Type here" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-red-100 bg-gray-50" />
          </div>
          <div>
            <label className="text-xs font-medium text-black mb-1 block">What's your professional role? <span className="text-red-500">*</span></label>
            <input value={form.professionalRole} onChange={(e) => update("professionalRole", e.target.value)} placeholder="Type here" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-red-100 bg-gray-50" />
          </div>
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

export default ProfileSettingsTab;