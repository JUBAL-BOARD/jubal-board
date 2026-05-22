"use client";
import { useState, useEffect } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import type { SkillCategory } from "@/app/data/exploreSkillsData";
import Link from "next/link";

interface FetchedSkill {
    id: string;
    name: string;
    serviceId: string;
    isActive: boolean;
}

interface Props {
    category: SkillCategory & {
        services: { id: string; name: string }[];
    };
    selectedSkills: string[];
    onToggleSkill: (skill: string) => void;
    defaultOpen?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://16.171.168.144:3000";

const SkillCategoryAccordion: React.FC<Props> = ({
    category,
    selectedSkills,
    onToggleSkill,
    defaultOpen = false,
}) => {
    const [open, setOpen] = useState<boolean>(defaultOpen);
    const [skills, setSkills] = useState<FetchedSkill[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || skills.length > 0) return;

        const fetchSkills = async () => {
            setLoading(true);
            setError(null);
            try {
                const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://16.171.168.144:3000";

                const results = await Promise.all(
                    (category.services ?? []).map((service) =>
                        fetch(`${BASE_URL}/api/v1/platform-services/${service.id}/skills`).then((res) => {
                            if (!res.ok) throw new Error(`Failed for service ${service.id}`);
                            return res.json();
                        })
                    )
                );

                const allSkills: FetchedSkill[] = results.flatMap((r) =>
                    Array.isArray(r) ? r : Array.isArray(r.data) ? r.data : []
                );

                setSkills(allSkills.filter((sk) => sk.isActive));
            } catch {
                setError("Could not load skills.");
            } finally {
                setLoading(false);
            }
        };

        fetchSkills();
    }, [open]);

    return (
        <div className="border border-gray-200 rounded-[10px] overflow-hidden mb-3">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-white rounded-[20px] select-none">
                <Link href={"/onboarding"} className="flex-1">
                    <p className="m-0 font-bold text-xl text-[#1a1a2e] hover:text-[#e2554f] transition-colors">
                        {category.name}
                    </p>
                    <p className="m-0 mt-0.5 text-[14px] text-gray-500">
                        {loading ? "Loading..." : `${skills.length} Skills`}
                    </p>
                </Link>

                <button onClick={() => setOpen(!open)} className="p-1 cursor-pointer">
                    <ChevronDown
                        size={18}
                        stroke="#374151"
                        className="flex-shrink-0 transition-transform duration-200"
                        style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                </button>
            </div>

            {/* Skills */}
            {open && (
                <div className="px-5 pt-2.5 pb-[18px] w-[90%] mx-auto flex flex-wrap gap-2.5 bg-[#fafafa]">
                    {loading && (
                        <div className="flex w-full justify-center py-4">
                            <Loader2 className="animate-spin text-[#E2554F]" size={20} />
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {!loading &&
                        !error &&
                        skills.map((skill) => {
                            const isSelected = selectedSkills.includes(skill.name);
                            return (
                                <Link
                                    key={skill.id}
                                    href={"/onboarding"}
                                    onClick={() => onToggleSkill(skill.name)}
                                    className={`flex items-center gap-1.5 px-3.5 py-[7px] rounded-md text-[13px] cursor-pointer transition-all duration-150
          ${isSelected
                                            ? "bg-[#1a1a2e] text-white font-semibold border-none"
                                            : "bg-white text-gray-700 font-normal border border-gray-200"
                                        }`}
                                >
                                    {isSelected && <Check size={12} stroke="white" strokeWidth={3} />}
                                    {skill.name}
                                </Link>
                            );
                        })}
                </div>
            )}
        </div>
    );
};

export default SkillCategoryAccordion;