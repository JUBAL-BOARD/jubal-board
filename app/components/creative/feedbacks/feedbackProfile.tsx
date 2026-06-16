import { BadgeCheck } from "lucide-react";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";

const FeedbackProfile: React.FC = () => {
  const { profile, loading } = useCreativeProfile();

  if (loading) {
    return (
      <div className="flex flex-col items-center mb-6 animate-pulse">
        <div className="w-24 h-24 rounded-full bg-gray-200 mb-3" />
        <div className="h-3 w-28 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mb-6">
      <img
        src={profile?.avatar || "https://i.pravatar.cc/150?img=47"}
        alt={profile?.fullName || "Creative"}
        className="w-24 h-24 rounded-full object-cover mb-3"
      />
      <div className="flex items-center gap-1">
        <p className="font-semibold font-heading text-gray-900 text-sm">
          {profile?.fullName || "Creative"}
        </p>
        <BadgeCheck size={15} fill="blue" stroke="white" />
      </div>
      <p className="text-xs text-black font-body mt-0.5">
        {profile?.professionalRole || "Creative Professional"}
      </p>
    </div>
  );
};

export default FeedbackProfile;