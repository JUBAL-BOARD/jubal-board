"use client";

import { useState } from "react";
import Sidebar from "../../components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "../../components/client/my-desk/breadcrumb";
import SettingsTabs from "../../components/client/settings/settingsTabs";
import type { SettingsTab } from "../../components/client/settings/settingsTabs";
import ProfileSettingsTab from "../../components/client/settings/profileSettingsTab";
import AccountSettingsTab from "../../components/client/settings/accountSettingsTab";
import NotificationSettingsTab from "../../components/client/settings/notificationSettingsTab";
import PrivacySettingsTab from "../../components/client/settings/privacySettingsTab";
import LanguageSettingsTab from "../../components/client/settings/languageSettingsTab";
import PaymentSettingsTab from "../../components/client/settings/paymentSettingsTab";
import { X } from "lucide-react";

const tabTitles: Record<SettingsTab, string> = {
  "Profile Settings":      "Edit Business Profile",
  "Account Settings":      "Account Settings",
  "Notification Settings": "Notification Settings",
  "Privacy Settings":      "Privacy Settings",
  "Language & Appearance": "Language & Appearance",
  "Payment Settings":      "Payment Method Settings",
};

const breadcrumbLabels: Record<SettingsTab, string> = {
  "Profile Settings":      "Settings",
  "Account Settings":      "Settings",
  "Notification Settings": "Notification Settings",
  "Privacy Settings":      "Privacy Settings",
  "Language & Appearance": "Language & Appearance",
  "Payment Settings":      "Payment Method",
};

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("Profile Settings");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderTab = () => {
    switch (activeTab) {
      case "Profile Settings":      return <ProfileSettingsTab />;
      case "Account Settings":      return <AccountSettingsTab />;
      case "Notification Settings": return <NotificationSettingsTab />;
      case "Privacy Settings":      return <PrivacySettingsTab />;
      case "Language & Appearance": return <LanguageSettingsTab />;
      case "Payment Settings":      return <PaymentSettingsTab />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">

      <DashboardTopbar
        userName="Charles Eden"
        userAvatar="https://i.pravatar.cc/150?img=33"
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 relative">

        {/* Dark overlay — mobile only, shows when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — slides in on mobile, always visible on desktop */}
        <div
          className={`
            fixed top-0 left-0 h-full z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10
          `}
        >
          {/* Close button inside sidebar on mobile */}
          <button
            className="absolute top-4 right-4 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>

          <Sidebar activeItem="Dashboard" />
        </div>

        {/* Main content — full width, no margin offset needed */}
        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">

          <Breadcrumb crumbs={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "Settings", path: "/settings" },
            ...(breadcrumbLabels[activeTab] !== "Settings"
              ? [{ label: breadcrumbLabels[activeTab] }]
              : []),
          ]} />

          <h1 className="text-[26px] font-extrabold text-[#1a1a2e] m-0 mb-5">
            {tabTitles[activeTab]}
          </h1>

          <SettingsTabs active={activeTab} onChange={setActiveTab} />

          {renderTab()}

        </main>
      </div>
    </div>
  );
};

export default Settings;