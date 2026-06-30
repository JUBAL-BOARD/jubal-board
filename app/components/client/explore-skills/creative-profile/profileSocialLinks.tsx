import { SocialLink } from "@/app/types";

interface Props {
  links: (SocialLink | string)[];
}

const platformPatterns: { platform: string; pattern: RegExp; icon: string }[] = [
  { platform: "instagram", pattern: /instagram\.com/i, icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" },
  { platform: "behance", pattern: /behance\.net/i, icon: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Behance_logo.svg" },
  { platform: "twitter", pattern: /twitter\.com|x\.com/i, icon: "https://upload.wikimedia.org/wikipedia/commons/5/53/X_logo_2023_original.svg" },
  { platform: "linkedin", pattern: /linkedin\.com/i, icon: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" },
  { platform: "youtube", pattern: /youtube\.com|youtu\.be/i, icon: "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" },
  { platform: "tiktok", pattern: /tiktok\.com/i, icon: "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg" },
  { platform: "facebook", pattern: /facebook\.com/i, icon: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" },
  { platform: "dribbble", pattern: /dribbble\.com/i, icon: "https://upload.wikimedia.org/wikipedia/commons/3/32/Dribbble_logo.svg" },
  { platform: "github", pattern: /github\.com/i, icon: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" },
  { platform: "pinterest", pattern: /pinterest\.com/i, icon: "https://upload.wikimedia.org/wikipedia/commons/3/35/Pinterest_Badge_Red.png" },
];

const detectPlatform = (url: string): { platform: string; icon: string } => {
  for (const { platform, pattern, icon } of platformPatterns) {
    if (pattern.test(url)) return { platform, icon };
  }
  return { platform: "website", icon: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Globe_icon.svg" };
};

const normalizeLink = (link: SocialLink | string): { url: string; platform: string; icon: string } => {
  if (typeof link === "string") {
    const { platform, icon } = detectPlatform(link);
    return { url: link, platform, icon };
  }
  const iconMap: Record<string, string> = {
    instagram: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
    behance: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Behance_logo.svg",
  };
  return { url: link.url, platform: link.platform, icon: iconMap[link.platform] || "https://upload.wikimedia.org/wikipedia/commons/c/c4/Globe_icon.svg" };
};

const ProfileSocialLinks: React.FC<Props> = ({ links }) => {
  if (!links || links.length === 0) return null;

  const normalized = links.map(normalizeLink);

  return (
    <div className="bg-[#fafafa] p-5">
      <h3 className="font-bold font-heading text-black text-2xl mb-4">Social Links</h3>
      <div className="flex items-center gap-3 flex-wrap">
        {normalized.map((link, index) => (
          <a
            key={index}
            href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
            target="_blank"
            rel="noopener noreferrer"
            title={link.platform}
            className="w-9 h-9 rounded-full overflow-hidden hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <img
              src={link.icon}
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