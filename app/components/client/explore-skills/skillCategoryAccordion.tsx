"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { SkillCategory } from "../../../data/exploreSkillsData";

interface Props {
  category: SkillCategory;
  selectedSkills: string[];
  onToggleSkill: (skill: string) => void;
  defaultOpen?: boolean;
}

const SkillCategoryAccordion: React.FC<Props> = ({
  category,
  selectedSkills,
  onToggleSkill,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-[10px] overflow-hidden mb-3">

      {/* Header */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between px-5 py-4 bg-white rounded-[20px] cursor-pointer select-none"
      >
        <div>
          <p className="m-0 font-bold text-xl text-[#1a1a2e]">{category.name}</p>
          <p className="m-0 mt-0.5 text-[14px] text-gray-500">{category.skills.length} Skills</p>
        </div>
        <ChevronDown
          size={18}
          stroke="#374151"
          className="flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </div>

      {/* Skills */}
      {open && (
        <div className="px-5 pt-2.5 pb-[18px] w-[90%] mx-auto flex flex-wrap gap-2.5 bg-[#fafafa]">
          {category.skills.map((skill) => {
            const isSelected = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => onToggleSkill(skill)}
                className={`flex items-center gap-1.5 px-3.5 py-[7px] rounded-md text-[13px] cursor-pointer transition-all duration-150
                  ${isSelected
                    ? "bg-[#1a1a2e] text-white font-semibold border-none"
                    : "bg-white text-gray-700 font-normal border border-gray-200"
                  }`}
              >
                {isSelected && <Check size={12} stroke="white" strokeWidth={3} />}
                {skill}
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default SkillCategoryAccordion;