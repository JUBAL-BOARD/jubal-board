import Image from "next/image";
import type { UserProfile } from "../../../data/profileData";

interface Props {
  profile: UserProfile;
  onEditProfile: () => void;
}

const ProfileHeader: React.FC<Props> = ({ profile, onEditProfile }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#fafafa] border border-gray-200 rounded-[10px] px-4 lg:px-6 py-4 lg:py-5 mb-5">

      {/* Avatar + Info */}
      <div className="flex items-center gap-3 lg:gap-4">
        <Image
          src={profile.avatar}
          alt={profile.fullName}
          width={80}
          height={80}
          className="w-14 h-14 lg:w-20 lg:h-20 rounded-full object-cover border-[3px] border-gray-200 flex-shrink-0"
        />
        <div>
          <h2 className="m-0 mb-1 text-base lg:text-lg font-extrabold text-[#1a1a2e]">
            {profile.fullName}
          </h2>
          <p className="m-0 text-xs lg:text-[13px] text-gray-500">{profile.location}</p>
        </div>
      </div>

      {/* Edit Button — full width on mobile */}
      <button
        onClick={onEditProfile}
        className="w-full sm:w-auto bg-[#E2554F] border-none rounded-lg px-7 py-2.5 lg:py-3 cursor-pointer text-white font-bold text-sm lg:text-[14px] hover:bg-[#d44a44] transition-colors"
      >
        Edit Profile
      </button>

    </div>
  );
};

export default ProfileHeader;