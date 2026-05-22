import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import ProfileHeader from "./profileHeader";
import ProfileAbout from "./profileAbout";
import ProfileSkills from "./profileSkills";
import ProfileServices from "./profileServices";
import ProfileStats from "./profileStats";
import ProfilePortfolio from "./profilePortfolio";
import ProfileSocialLinks from "./profileSocialLinks";
import { creativeProfile } from "@/app/data";
import Link from "next/link";

const MyProfileContent: React.FC = () => {
    return (
        <div>
            <Breadcrumb crumbs={[
                { label: "Dashboard", path: "/client/dashboard" },
                { label: "Hire A Pro", path: "/client/explore-skills" },
                { label: "Creative Profile", },
                { label: creativeProfile.name },
            ]} />

            <h1 className="text-2xl font-bold text-gray-900 mb-5">Creative Profile</h1>

            <div className="flex flex-col gap-4">
                <ProfileHeader profile={creativeProfile} />
                <ProfileAbout bio={creativeProfile.bio} />
                <ProfileSkills skills={creativeProfile.skills} />
                <ProfileServices services={creativeProfile.services} />
                <ProfileStats
                    yearsOfExperience={creativeProfile.yearsOfExperience}
                    totalClients={creativeProfile.totalClients}
                    totalReviews={creativeProfile.totalReviews}
                />
                <ProfilePortfolio images={creativeProfile.portfolioImages} />
                <ProfileSocialLinks links={creativeProfile.socialLinks} />

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 mt-2 mb-8">
                    <button className="flex items-center gap-2 bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
                        <span>⊗</span> Cancel
                    </button>
                    <Link href={`/client/explore-skills/creative-pitch/${encodeURIComponent(creativeProfile.name)}`}>
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