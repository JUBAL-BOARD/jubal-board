"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface Props {
  skills: string[];
}

const ProfileSkills: React.FC<Props> = ({ skills }) => {
  const [active, setActive] = useState(skills[0]);

  return (
    <div className="bg-[#fafafa] p-5">
      <h3 className="font-bold text-black text-2xl mb-3">Skills</h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <button
            key={skill}
            onClick={() => setActive(skill)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              active === skill
                ? "bg-[#1a1a2e] text-white"
                : "border border-gray-200 text-black hover:bg-gray-50"
            }`}
          >
            {active === skill && <Check size={12} strokeWidth={3} />}
            {skill}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileSkills;