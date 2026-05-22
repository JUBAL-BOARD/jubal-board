"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";
import { useBriefStore } from "../../../lib/stores/briefStore";
import { useState } from "react";

const CongratulationsModal: React.FC<{ onGoToDashboard: () => void }> = ({ onGoToDashboard }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-orange-400/80 rounded-2xl px-12 py-10 w-[80%] lg:w-[420px] flex flex-col items-center text-center shadow-2xl">

            {/* Icon */}
            <div className="w-[90px] h-[90px] rounded-full bg-white flex items-center justify-center mb-5">
                <Check size={52} fill="white" stroke="#fb923c" />
            </div>

            {/* Text */}
            <h2 className="text-[22px] font-bold text-white m-0 mb-1">
                Your Project is live!
            </h2>
            <p className="text-[14px] text-white m-0 mb-7 leading-relaxed max-w-[260px]">
                Your job is now visible to creatives. We'll notify you when pitch comes in
            </p>

            {/* Button */}
            <button
                onClick={onGoToDashboard}
                className="bg-white border-none rounded-lg px-8 py-2.5 cursor-pointer text-[#fb923c] font-semibold text-xs lg:text-[14px] hover:bg-orange-500 hover:text-black transition-colors"
            >
                Go to Dashboard
            </button>

        </div>
    </div>
);

const BriefPreviewContent: React.FC = () => {
    const router = useRouter();
    const { form, reset } = useBriefStore();
    const [showModal, setShowModal] = useState(false);

    const handlePostJob = async () => {
        // Replace with your actual API call e.g:
        // await fetch("/api/briefs", { method: "POST", body: JSON.stringify(form) });
        console.log("Posting job:", form);
        reset();
        router.push("/client/my-briefs");
    };

    return (
        <div className="max-w-2xl mx-auto">

            {showModal && (
                <CongratulationsModal onGoToDashboard={() => router.push("/client/dashboard")} />
            )}
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => router.back()} className="p-1 text-gray-600 hover:text-gray-900">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-2xl font-heading font-bold text-black">Brief Preview</h1>
                <button onClick={() => router.push("/client/my-briefs")} className="p-1 text-gray-600 hover:text-gray-900">
                    <X size={22} />
                </button>
            </div>

            {/* Preview Card */}
            <div className="bg-gray-50 rounded-2xl p-6 flex flex-col gap-5">
                <PreviewRow label="Job Title" value={form.jobTitle} />
                <PreviewRow label="Project Category" value={form.projectCategory} />
                {/* Skills */}
                <div>
                    <p className="text-md font-heading font-bold text-black">Specific Skill(s)</p>
                    {form.specificSkillNames.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {form.specificSkillNames.map((name) => (
                                <span
                                    key={name}
                                    className="px-3 py-1 rounded-full text-sm font-medium bg-[#E05C5C] text-white"
                                >
                                    {name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-black mt-1">—</p>
                    )}
                </div>
                <PreviewRow label="Job Description" value={form.jobDescription} />
                <PreviewRow label="Set your Budget" value={form.budgetRange} />
                <PreviewRow label="Timeline" value={form.timeline} />
                <PreviewRow label="Delivery Date" value={form.deliveryDate} />
                {form.referenceFileName && (
                    <div>
                        <p className="text-sm font-bold text-gray-900 mb-2">Attach Reference File</p>
                        <span className="inline-block border border-[#E05C5C] text-[#E05C5C] text-sm px-3 py-1 rounded-lg">
                            {form.referenceFileName}
                        </span>
                    </div>
                )}
            </div>

            {/* Post Job */}
            <div className="w-[30%] mx-auto">
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full mt-6 bg-[#E05C5C] text-white font-semibold py-4 rounded-xl text-base hover:bg-[#d04f4f] transition-colors"
                >
                    Post Job
                </button>
            </div>
        </div>
    );
};

const PreviewRow = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p className="text-md font-heading font-bold text-black">{label}</p>
        <p className="text-sm font-body text-black mt-1 leading-relaxed">{value || "—"}</p>
    </div>
);

export default BriefPreviewContent;