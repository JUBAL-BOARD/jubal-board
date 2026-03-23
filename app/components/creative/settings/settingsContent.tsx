"use client";

import { useState } from "react";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import ProfileSettingsTab from "./profileSettingsTab";
import AccountSettingsTab from "./accountSettingsTab";
import NotificationSettingsTab from "./notificationSettingsTab";
import PrivacySettingsTab from "./privacySettingsTab";
import LanguageAppearanceTab from "./languageAppearanceTab";
import PaymentSettingsTab from "./paymentSettingsTab";

const tabs = [
  "Profile Settings",
  "Account Settings",
  "Notification Settings",
  "Privacy Settings",
  "Language & Appearance",
  "Payment Settings",
];

const tabTitles: Record<string, string> = {
  "Profile Settings": "Edit Profile",
  "Account Settings": "Account Settings",
  "Notification Settings": "Notification Settings",
  "Privacy Settings": "Privacy Settings",
  "Language & Appearance": "Language & Appearance",
  "Payment Settings": "Payment Method Settings",
};

const breadcrumbLabels: Record<string, string> = {
  "Profile Settings": "Profile Settings",
  "Account Settings": "Settings",
  "Notification Settings": "Notification Settings",
  "Privacy Settings": "Privacy Settings",
  "Language & Appearance": "Language & Appearance",
  "Payment Settings": "Payment Method",
};

const SettingsContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Profile Settings");

  return (
    <div>
      <Breadcrumb crumbs={[
        { label: "Dashboard", path: "/creative/dashboard" },
        { label: "Settings", path: "/creative/settings" },
        { label: breadcrumbLabels[activeTab] },
      ]} />

      <h1 className="text-2xl font-bold text-gray-900 mb-5">{tabTitles[activeTab]}</h1>

      <div className="px-3 lg:px-6 py-3 lg:py-4 bg-[#fafafa] border border-gray-200 rounded-[10px] mb-6">
        {/* Tab bar */}
        <div className="flex gap-2 overflow-x-auto lg:overflow-x-visible lg:flex-wrap pb-1 lg:pb-0 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-3 lg:px-[18px] py-2 rounded-lg text-xs lg:text-[13px] cursor-pointer transition-all duration-150 whitespace-nowrap ${activeTab === tab
                  ? "bg-[#E2554F] text-white font-semibold border-none"
                  : "bg-white text-gray-700 font-normal border border-gray-200 hover:border-gray-300"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>



      {/* Tab content */}
      {activeTab === "Profile Settings" && <ProfileSettingsTab />}
      {activeTab === "Account Settings" && <AccountSettingsTab />}
      {activeTab === "Notification Settings" && <NotificationSettingsTab />}
      {activeTab === "Privacy Settings" && <PrivacySettingsTab />}
      {activeTab === "Language & Appearance" && <LanguageAppearanceTab />}
      {activeTab === "Payment Settings" && <PaymentSettingsTab />}
    </div>
  );
};

export default SettingsContent;