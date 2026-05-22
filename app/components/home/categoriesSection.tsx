"use client";
import { useEffect, useState } from "react";
import { ImageIcon, HeadphonesIcon, FashionIcon, WritingIcon, TechIcon,
  EventIcon, VideoIcon, CraftsIcon, EducationIcon, DressIcon } from "../../icons";
import CategoryCard from "./categoryCard";
import SectionHeader from "./sectionHeader";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface Category {
  id: string;
  name: string;
  imageUrl: string;
}

// Map category names (lowercase) to local icons — extend as needed
const categoryIconMap: Record<string, ReactNode> = {
  "design & creative": <ImageIcon />,
  "music & audio": <HeadphonesIcon />,
  "fashion": <FashionIcon />,
  "writing & translation": <WritingIcon />,
  "technology": <TechIcon />,
  "events": <EventIcon />,
  "video & animation": <VideoIcon />,
  "crafts": <CraftsIcon />,
  "education": <EducationIcon />,
  "lifestyle": <DressIcon />,
};

const getFallbackIcon = (name: string): ReactNode => {
  const key = name.toLowerCase();
  for (const [k, icon] of Object.entries(categoryIconMap)) {
    if (key.includes(k) || k.includes(key)) return icon;
  }
  return <ImageIcon />; // default fallback
};

const CategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/v1/categories");
        if (!res.ok) return;
        const json = await res.json();
        // handle both [{}] and { data: [{}] } shapes
        const list = Array.isArray(json) ? json : json.data ?? [];
        setCategories(list);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="px-4 sm:px-8 py-9 bg-[#fafafa] w-[95%] mx-auto mt-8 h-fit">
      <SectionHeader title="Browse Creatives by Categories" viewAllPath="/client/explore-skills" />

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-[#E2554F]" size={28} />
        </div>
      ) : categories.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-10">No categories found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              icon={getFallbackIcon(cat.name)}
              label={cat.name}
              categoryId={cat.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesSection;