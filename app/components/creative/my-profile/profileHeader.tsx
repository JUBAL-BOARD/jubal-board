import { Star } from "lucide-react";
import { CreativeProfile } from "@/app/types";

interface Props {
  profile: CreativeProfile;
}

const ProfileHeader: React.FC<Props> = ({ profile }) => {
  return (
    <div className="bg-[#fafafa] p-4 lg:p-5 relative">

      {/* Premium badge — always top right */}
      <button className="absolute top-4 right-4 bg-orange-400 hover:bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors">
        Premium
      </button>

      {/* Top row — avatar + info */}
      <div className="flex items-start gap-4 mb-4 lg:mb-0">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover flex-shrink-0"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-black text-base lg:text-md mb-1 pr-16">{profile.name}</p>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm text-green-600 font-medium">Online</span>
          </div>
          <p className="text-sm text-black mb-1">Verification Status:</p>
          <span className="inline-block bg-green-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
            Verified
          </span>
        </div>
      </div>

      {/* Stats — row on mobile, inline on desktop */}
      <div className="flex flex-wrap items-center gap-3 lg:gap-6 lg:absolute lg:bottom-5 lg:right-4">
        <div className="flex items-center gap-1">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-semibold text-black">{profile.rating}</span>
          <span className="text-xs text-black">({profile.totalReviews} Reviews)</span>
        </div>

        <div className="text-sm text-black">
          <span className="font-semibold">{profile.completedProjects}</span>
          <span className="text-black ml-1">Completed Projects</span>
        </div>

        <div className="text-sm text-black">
          <span className="font-semibold">{profile.jobSuccess}%</span>
          <span className="text-black ml-1">Job Success</span>
        </div>
      </div>

    </div>
  );
};

export default ProfileHeader;