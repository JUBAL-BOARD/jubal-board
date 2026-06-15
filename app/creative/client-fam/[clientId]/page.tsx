"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import ProfileHeader from "@/app/components/creative/client-fam/client-profile/profileHeader";
import ProfileInfoSection from "@/app/components/creative/client-fam/client-profile/profileInfoSection";
import { Loader2, X } from "lucide-react";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";

interface ClientDetail {
  clientId: string;
  name: string;
  photo: string | null;
  totalProjectsTogether: number;
  preferredCommunication: string;
  language: string;
  lastProjectDate: string | null;
}

const ClientProfilePage: React.FC = () => {
  const { clientId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clientDetail, setClientDetail] = useState<ClientDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState<string | null>(null);

  const { profile: creativeProfile, loading: profileLoading } = useCreativeProfile();

  useEffect(() => {
    if (!clientId) return;

    const fetchDetail = async () => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();

        const res = await fetch(`/api/v1/client-fam/${clientId}`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Failed to fetch client (${res.status})`);

        const json = await res.json();
        setClientDetail(json.data);
      } catch (err) {
        setDetailError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [clientId]);

  const loading = profileLoading || detailLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={48} className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (detailError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{detailError}</p>
      </div>
    );
  }

  const userName = creativeProfile?.fullName || "Creative";
  const userAvatar =
    creativeProfile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  const avatar = clientDetail?.photo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(clientDetail?.name ?? "C")}&background=1a1a2e&color=fff&size=128`;

  const profileForHeader = {
    fullName: clientDetail?.name ?? "—",
    displayName: "—",
    email: "—",
    contactNumber: "—",
    location: "—",
    avatar,
    country: "—",
    city: "—",
    state: "—",
    streetAddress: "—",
    postalCode: "—",
  };

  const infoFields = [
    { label: "Full Name", value: clientDetail?.name ?? "—" },
    { label: "Language", value: clientDetail?.language ?? "—" },
    { label: "Preferred Communication", value: clientDetail?.preferredCommunication ?? "—" },
    { label: "Total Projects Together", value: String(clientDetail?.totalProjectsTogether ?? 0) },
    {
      label: "Last Project Date",
      value: clientDetail?.lastProjectDate
        ? new Date(clientDetail.lastProjectDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <DashboardTopbar
        userName={userName}
        userAvatar={userAvatar}
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1">
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
          <Sidebar activeItem="Client Fam" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb crumbs={[
            { label: "Dashboard", path: "/creative/dashboard" },
            { label: "Client Fam", path: "/creative/client-fam" },
            { label: clientDetail?.name ?? "Client Profile" },
          ]} />

          <h1 className="text-[26px] font-extrabold text-[#1a1a2e] m-0 mb-6">
            Client Profile
          </h1>

          <ProfileHeader profile={profileForHeader} />

          <ProfileInfoSection
            title="Client Information"
            fields={infoFields}
          />
        </main>
      </div>
    </div>
  );
};

export default ClientProfilePage;