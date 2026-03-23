import { ImageIcon, HeadphonesIcon, FashionIcon, WritingIcon, TechIcon,
  EventIcon, VideoIcon, CraftsIcon, EducationIcon, DressIcon } from "../../icons";
import { categories } from "../../data";
import CategoryCard from "./categoryCard";
import SectionHeader from "./sectionHeader";
import type { ReactNode } from "react";

const categoryIconMap: Record<string, ReactNode> = {
  image: <ImageIcon />,
  headphones: <HeadphonesIcon />,
  fashion: <FashionIcon />,
  writing: <WritingIcon />,
  tech: <TechIcon />,
  event: <EventIcon />,
  video: <VideoIcon />,
  crafts: <CraftsIcon />,
  education: <EducationIcon />,
  dress: <DressIcon />,
};

const CategoriesSection: React.FC = () => {
  return (
    <div className="px-8 py-9 bg-[#fafafa] w-[95%] mx-auto mt-8 h-fit">
      <SectionHeader title="Browse Creatives by Categories" />
      <div className="grid grid-cols-5 gap-3.5">
        {categories.map((cat, i) => (
          <CategoryCard key={i} icon={categoryIconMap[cat.iconKey]} label={cat.label} />
        ))}
      </div>
    </div>
  );
};

export default CategoriesSection;