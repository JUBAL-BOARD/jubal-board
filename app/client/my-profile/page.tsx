"use client";

import { useState } from "react";
import Sidebar from "../../components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "../../components/client/my-desk/breadcrumb";
import ProfileHeader from "../../components/client/my-profile/profileHeader";
import ProfileInfoSection from "../../components/client/my-profile/profileInfoSection";
import { userProfile } from "../../data/profileData";
import { X } from "lucide-react";

const Profile: React.FC = () => {
  const [profile] = useState(userProfile);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const personalFields = [
    { label: "Full Name",              value: profile.fullName },
    { label: "User Name/Display Name", value: profile.displayName },
    { label: "Email Address",          value: profile.email },
    { label: "Contact Number",         value: profile.contactNumber },
    { label: "Location",               value: profile.location },
  ];

  const addressFields = [
    { label: "Country",        value: profile.country },
    { label: "City",           value: profile.city },
    { label: "State",          value: profile.state },
    { label: "Street Address", value: profile.streetAddress },
    { label: "Postal Code",    value: profile.postalCode },
  ];

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
            { label: "My Profile" },
          ]} />

          <h1 className="text-[26px] font-extrabold text-[#1a1a2e] m-0 mb-6">
            My Profile
          </h1>

          <ProfileHeader
            profile={profile}
            onEditProfile={() => alert("Edit Profile clicked")}
          />

          <ProfileInfoSection
            title="Personal Information"
            fields={personalFields}
          />

          <ProfileInfoSection
            title="Address Information"
            fields={addressFields}
          />

        </main>
      </div>
    </div>
  );
};

export default Profile;