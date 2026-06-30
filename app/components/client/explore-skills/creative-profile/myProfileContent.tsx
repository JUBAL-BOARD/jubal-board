"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import ProfileHeader from "./profileHeader";
import ProfileAbout from "./profileAbout";
import ProfileSkills from "./profileSkills";
import ProfileServices from "./profileServices";
import ProfileStats from "./profileStats";
import ProfilePortfolio from "./profilePortfolio";
import ProfileSocialLinks from "./profileSocialLinks";
import { CreativeProfile } from "@/app/types";

type PublicCreativeProfile = {
  id: string;
  fullName: string;
  imageUrl: string;
  about: string;
  location: string;
  yearsOfExperience: number;
  isPremium: boolean;
  averageRating: number;
  reviewCount: number;
  completedProjects: number;
  totalClients: number;
  averageBudget: number;
  jobSuccessRate: number;
  isOnline: boolean;
  lastSeen: string;
  professionalTitle: string;
  profileUrl: string;
  categoriesOfInterest: { id: string; name: string }[];
  services: {
    id: string;
    title: string;
    priceFrom: number;
    priceTo: number;
    deliveryDays: number;
  }[];
  portfolio: { id: string; fileUrl: string; mimeType: string }[];
  preferredSocialLinks?: string[];
};

type Props = { creativeId: string };

const MyProfileContent: React.FC<Props> = ({ creativeId }) => {
  const [profile, setProfile] = useState<PublicCreativeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!creativeId) {
      setError("No creative ID provided.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const tokenRes = await fetch("/api/auth/session/token", {
          credentials: "include",
        });
        const { token } = await tokenRes.json();
        if (!token) throw new Error("No authorization token found.");

        const res = await fetch(
          `/api/v1/creatives/${creativeId}/public-profile`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);

        const json = await res.json();
        console.log("API response:", json);
        setProfile(json.data ?? json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [creativeId]);

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#E2554F]" size={36} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center text-red-500 text-sm">
        {error ?? "Profile not found."}
      </div>
    );
  }

  const headerProfile: CreativeProfile = {
    name: profile.fullName,
    avatar:
      profile.imageUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=1a1a2e&color=fff&size=128`,
    isOnline: profile.isOnline ?? false,
    isVerified: true,
    rating: profile.averageRating ?? 0,
    totalReviews: profile.reviewCount ?? 0,
    completedProjects: profile.completedProjects ?? 0,
    jobSuccess: profile.jobSuccessRate ?? 0,
    bio: profile.about ?? "",
    skills: profile.categoriesOfInterest?.map((c) => c.name) ?? [],
    services: profile.services?.map((s) => s.title) ?? [],
    yearsOfExperience: profile.yearsOfExperience ?? 0,
    totalClients: profile.totalClients ?? 0,
    portfolioImages:
      profile.portfolio
        ?.filter((p) => p.mimeType.startsWith("image/"))
        .map((p) => p.fileUrl) ?? [],
    socialLinks: profile.preferredSocialLinks ?? [],
  };

  return (
    <div>
      <Breadcrumb
        crumbs={[
          { label: "Dashboard", path: "/client/dashboard" },
          { label: "Hire A Pro", path: "/client/explore-skills" },
          { label: "Creative Profile" },
          { label: profile.fullName },
        ]}
      />
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Creative Profile</h1>
      <div className="flex flex-col gap-4">
        <ProfileHeader profile={headerProfile} />
        <ProfileAbout bio={headerProfile.bio} />
        <ProfileSkills skills={headerProfile.skills} />
        <ProfileServices services={headerProfile.services} />
        <ProfileStats
          yearsOfExperience={headerProfile.yearsOfExperience}
          totalClients={headerProfile.totalClients}
          totalReviews={headerProfile.totalReviews}
        />
        <ProfilePortfolio images={headerProfile.portfolioImages} />
        <ProfileSocialLinks links={headerProfile.socialLinks} />

        <div className="flex items-center justify-end gap-3 mt-2 mb-8">
          <button className="flex items-center gap-2 bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
            <span>⊗</span> Cancel
          </button>
          <Link
            href={`/client/explore-skills/creative-pitch/${encodeURIComponent(profile.fullName)}`}
          >
            <button className="bg-[#E2554F] hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
              See Pitch
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyProfileContent;