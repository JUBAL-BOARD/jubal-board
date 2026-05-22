import { SocialLink } from "@/app/types";

interface Props {
  links: SocialLink[];
}

const iconMap = {
  instagram: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
  behance: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Behance_logo.svg",
} as const;

const ProfileSocialLinks: React.FC<Props> = ({ links }) => {
  return (
    <div className="bg-[#fafafa] p-5">
      <h3 className="font-bold text-black text-2xl mb-4">Social Links</h3>
      <div className="flex items-center gap-3">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full overflow-hidden hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <img
              src={iconMap[link.platform]}
              alt={link.platform}
              className="w-full h-full object-cover"
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export default ProfileSocialLinks;