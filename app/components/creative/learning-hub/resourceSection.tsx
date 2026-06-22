"use client";

import { Clock } from "lucide-react";
import { Resource } from "../../../lib/hooks/useLearningHub";
import Image from "next/image";
import logo from "../../../assets/icononly.png";

interface Props {
    resources: Resource[];
    search: string;
}

const typeColors: Record<string, string> = {
    YOUTUBE: "bg-red-700 text-white",
    BLOG: "bg-blue-900 text-white",
    QUICK_READ: "bg-teal-900 text-white",
    VIDEO: "bg-purple-900 text-white",
};

const ResourceSection: React.FC<Props> = ({ resources, search }) => {
    const filtered = resources.filter((r) =>
        r.title?.toLowerCase().includes(search.toLowerCase())
    );

    if (filtered.length === 0) return null;

    const handleOpenResource = (resource: Resource) => {
        if (resource.resourceUrl) {
            window.open(resource.resourceUrl, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <section className="mb-8">
            <h2 className="text-xl lg:text-2xl font-bold font-heading text-black mb-4">Resources</h2>

            <div className="flex gap-4 overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-3 pb-2 lg:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
                {filtered.map((resource) => {
                    console.log(
                        "resource thumbnailUrl:",
                        resource.id,
                        resource.thumbnailUrl,
                        typeof resource.thumbnailUrl
                    );

                    return (
                        <div
                            key={resource.id}
                            className="flex-shrink-0 w-[70vw] sm:w-[45vw] lg:w-auto snap-start bg-[#fafafa] overflow-hidden hover:shadow-md transition-shadow group"
                        >
                            {/* Thumbnail */}
                            <div className="relative h-32 lg:h-36 bg-gray-100 overflow-hidden">
                                {resource.thumbnailUrl ? (
                                    <img
                                        src={resource.thumbnailUrl}
                                        alt={resource.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                        <Image
                                            src={logo}
                                            alt="No preview available"
                                            width={40}
                                            height={40}
                                            className="opacity-40 object-contain"
                                        />
                                    </div>
                                )}
                                {resource.resourceType === "YOUTUBE" && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-3">
                                <h4 className="font-semibold font-heading text-black text-sm text-center mb-2">{resource.title}</h4>

                                <div className="flex justify-center mb-2">
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[resource.resourceType ?? ""] ?? "bg-gray-100 text-black"}`}>
                                        {resource.resourceType}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-black">{resource.sourceName}</span>
                                    {resource.duration && (
                                        <div className="flex items-center gap-1">
                                            <Clock size={11} className="text-gray-400" />
                                            <span className="text-xs font-medium text-black">{resource.duration}</span>
                                        </div>
                                    )}
                                </div>

                                {resource.descriptionPreview && (
                                    <p className="text-xs text-black font-body mb-3 line-clamp-2 mt-2">{resource.descriptionPreview}</p>
                                )}

                                <div className="text-center">
                                    <button
                                        onClick={() => handleOpenResource(resource)}
                                        className="w-[60%] mx-auto bg-[#E2554F] hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                                    >
                                        View Resource
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default ResourceSection;