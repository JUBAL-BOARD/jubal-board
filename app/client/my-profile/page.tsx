"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "../../components/client/my-desk/breadcrumb";
import ProfileHeader from "../../components/client/my-profile/profileHeader";
import ProfileInfoSection from "../../components/client/my-profile/profileInfoSection";
import { X } from "lucide-react";

type ClientProfile = {
  name: string;
  email: string;
  clientProfile: {
    fullName: string;
    contactNumber: string;
    locationCity: string;
    country: string | null;
    state: string | null;
    streetAddress: string;
    postalCode: string;
    preferredCommunication: string;
    languagePreference: string;
    imageUrl: string | null;
  };
};

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        if (!tokenRes.ok) throw new Error("Authentication failed.");
        const { token } = await tokenRes.json();
        if (!token) throw new Error("No auth token found.");

        const res = await fetch("/api/v1/clients/me", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        if (!res.ok) throw new Error(`Failed to fetch profile. Status: ${res.status}`);

        const json = await res.json();
        setProfile(json.data); // ✅ data is nested under json.data
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const cp = profile?.clientProfile;

  const profileForDisplay = profile ? {
    fullName: cp?.fullName ?? "—",
    displayName: cp?.fullName ?? "—",
    email: profile.email ?? "—",
    contactNumber: cp?.contactNumber ?? "—",
    location: cp?.locationCity ?? "—",
    avatar: cp?.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(cp?.fullName ?? "U")}&background=1a1a2e&color=fff&size=128`,
    country: cp?.country ?? "—",
    city: cp?.locationCity ?? "—",
    state: cp?.state ?? "—",
    streetAddress: cp?.streetAddress ?? "—",
    postalCode: cp?.postalCode ?? "—",
  } : null;

  const personalFields = cp ? [
    { label: "Full Name",        value: cp.fullName ?? "—" },
    { label: "Email Address",    value: profile?.email ?? "—" },
    { label: "Contact Number",   value: cp.contactNumber ?? "—" },
    { label: "Location",         value: cp.locationCity ?? "—" },
    { label: "Communication",    value: cp.preferredCommunication ?? "—" },
    { label: "Language",         value: cp.languagePreference ?? "—" },
  ] : [];

  const addressFields = cp ? [
    { label: "Country",        value: cp.country ?? "—" },
    { label: "City",           value: cp.locationCity ?? "—" },
    { label: "State",          value: cp.state ?? "—" },
    { label: "Street Address", value: cp.streetAddress ?? "—" },
    { label: "Postal Code",    value: cp.postalCode ?? "—" },
  ] : [];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <DashboardTopbar
        userName={cp?.fullName ?? ""}
        userAvatar={cp?.imageUrl ?? ""}
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          className={`
            fixed top-0 left-0 h-full z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10
          `}
        >
          <button
            className="absolute top-4 right-4 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
          <Sidebar activeItem="My Profile" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb crumbs={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "My Profile" },
          ]} />

          <h1 className="text-[26px] font-extrabold text-[#1a1a2e] m-0 mb-6">
            My Profile
          </h1>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E2554F] mb-4" />
              <p className="text-gray-500 font-medium">Syncing your profile data...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-red-500 font-medium mb-4">Offline: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-gray-100 rounded-lg text-sm font-semibold"
              >
                Retry Connection
              </button>
            </div>
          )}

          {profileForDisplay && !loading && (
            <>
              <ProfileHeader
                profile={profileForDisplay}
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
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;