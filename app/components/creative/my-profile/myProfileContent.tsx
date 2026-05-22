"use client";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import ProfileHeader from "./profileHeader";
import ProfileAbout from "./profileAbout";
import ProfileSkills from "./profileSkills";
import ProfileServices from "./profileServices";
import ProfileStats from "./profileStats";
import ProfilePortfolio from "./profilePortfolio";
import ProfileSocialLinks from "./profileSocialLinks";
import { CreativeProfileData } from "@/app/lib/hooks/useCreativeProfile";
import { creativeProfile } from "@/app/data";
import { useRouter } from "next/navigation";

interface MyProfileContentProps {
  profile: CreativeProfileData | null;
  loading: boolean;
  error: string | null;
}

const MyProfileContent: React.FC<MyProfileContentProps> = ({ profile, loading, error }) => {

  const router = useRouter();

  // 1. DATA MAPPING LOGIC
  // This maps the backend "ugly" names to your "pretty" UI components
  const displayProfile = profile ? {
    name: profile.fullName || "Creative Professional",
    avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || "C")}&background=1a1a2e&color=fff&size=128`,
    isOnline: true,
    isVerified: true,
    rating: 5.0,
    totalReviews: 0,
    completedProjects: 0,
    jobSuccess: 100,
    bio: (profile as any).describeYourselfInOneLine || "No bio available",
    skills: (profile as any).categoriesOfInterest?.map((cat: any) => {
      if (typeof cat === "string") return cat; // plain string ID — nothing to map
      return cat.name || cat.categoryName || cat.title || cat.label || "";
    }).filter(Boolean) || [],
    services: [
      (profile as any).professionalRole || "Creative Professional",
      (profile as any).rateType ? `${(profile as any).currency || '$'}${(profile as any).rateRangeMin}-${(profile as any).rateRangeMax} (${(profile as any).rateType})` : ""
    ].filter(Boolean),
    yearsOfExperience: 0,
    totalClients: 0,
    portfolioImages: [],
    socialLinks: (profile as any).preferredSocialLinks || [],
  } : creativeProfile;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E2554F] mb-4"></div>
        <p className="text-gray-500 font-medium">Syncing your profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 font-medium mb-4">Offline: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-gray-100 rounded-lg text-sm font-semibold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="font-sans">
      <Breadcrumb crumbs={[
        { label: "Dashboard", path: "/creative/dashboard" },
        { label: "My Profile", path: "/creative/my-profile" },
        { label: displayProfile.name },
      ]} />

      <h1 className="text-2xl font-extrabold text-[#1a1a2e] mb-6">Creative Profile</h1>

      <div className="flex flex-col gap-5">
        <ProfileHeader profile={displayProfile} />

        {/* Only show sections if data exists to keep it clean */}
        <ProfileAbout bio={displayProfile.bio} />

        {/* {displayProfile.skills.length > 0 && (
          <ProfileSkills skills={displayProfile.skills} />
        )} */}

        <ProfileServices services={displayProfile.services} />

        <ProfileStats
          yearsOfExperience={displayProfile.yearsOfExperience}
          totalClients={displayProfile.totalClients}
          totalReviews={displayProfile.totalReviews}
        />

        <ProfilePortfolio images={displayProfile.portfolioImages} />

        {displayProfile.socialLinks.length > 0 && (
          <ProfileSocialLinks links={displayProfile.socialLinks} />
        )}

        <div className="flex items-center justify-end gap-3 mt-6 mb-10">
          <button onClick={() => router.push("/creative/my-profile/edit")} className="flex items-center gap-2 bg-[#1a1a2e] text-white font-bold px-8 py-3 rounded-xl transition-all hover:opacity-90 text-sm">
            Edit Profile
          </button>
          <button className="bg-[#E2554F] text-white font-bold px-8 py-3 rounded-xl transition-all hover:bg-[#d44a44] text-sm shadow-md shadow-red-100">
            Share Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfileContent;