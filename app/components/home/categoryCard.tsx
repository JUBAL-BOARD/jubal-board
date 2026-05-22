"use client";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

interface CategoryCardProps {
  icon: ReactNode;
  label: string;
  categoryId?: string;
  path?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ icon, label, categoryId, path }) => {
  const [hovered, setHovered] = useState<boolean>(false);
  const router = useRouter();

  const handleClick = () => {
    if (categoryId) {
      router.push(`/client/explore-skills/${categoryId}`);
    } else if (path) {
      router.push(path);
    } else {
      router.push("/client/explore-skills");
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex flex-col items-center justify-center px-4 py-6 rounded-[10px] cursor-pointer text-center gap-3 transition-all duration-200
        ${hovered
          ? "border-[1.5px] border-[#E2554F] bg-[#fff5f2]"
          : "border-[1.5px] border-gray-200 bg-white"
        }`}
    >
      {icon}
      <span className="text-[13px] font-medium text-gray-700 leading-snug whitespace-pre-line">
        {label}
      </span>
    </div>
  );
};

export default CategoryCard;