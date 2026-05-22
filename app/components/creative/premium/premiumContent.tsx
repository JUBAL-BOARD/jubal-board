"use client";
import { useState } from "react";
import { ArrowLeft, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const criteria = [
    "Good ratings and positive feedback",
    "Reasonable number of completed projects",
    "Quick responses to client chats",
    "No multiple disputes",
];

const benefits = [
    "Get a premium badge",
    "Be featured in top searches",
    "Gain access to premium clients",
    "Access to free courses & certifications",
    "Enjoy priority support",
];

const plans = [
    {
        id: "monthly",
        tag: "Most Popular",
        tagColor: "bg-[#E05C5C]",
        title: "Premium Monthly",
        subtitle: "Perfect for active creatives",
        price: "$20",
        period: "per month",
    },
    {
        id: "yearly",
        tag: "Save 20%",
        tagColor: "bg-green-500",
        title: "Premium Yearly",
        subtitle: "Best value for professionals",
        price: "$192",
        period: "yearly",
    },
];

const PremiumContent: React.FC = () => {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState("monthly");

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <button onClick={() => router.back()} className="p-1 text-gray-600 hover:text-gray-900">
                    <ArrowLeft size={22} />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-heading font-bold text-black">Upgrade to Premium</h1>
                    <p className="text-sm text-black mt-1">
                        Access more opportunities and earn more with Premium.
                    </p>
                </div>
                <button onClick={() => router.back()} className="p-1 text-gray-600 hover:text-gray-900">
                    <X size={22} />
                </button>
            </div>

            <hr className="my-5 border-gray-600" />

            {/* Criteria + Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Criteria */}
                <div>
                    <h2 className="text-lg font-bold font-heading text-black mb-4">Criteria</h2>
                    <div className="flex flex-col gap-4">
                        {criteria.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#E05C5C] flex items-center justify-center shrink-0">
                                    <Check size={16} strokeWidth={3} className="text-white" />
                                </span>
                                <span className="text-sm text-black font-body">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Benefits */}
                <div>
                    <h2 className="text-lg font-bold font-heading text-black mb-4">Benefits</h2>
                    <div className="flex flex-col gap-4">
                        {benefits.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#E05C5C] flex items-center justify-center shrink-0">
                                    <Check size={16} strokeWidth={3} className="text-white" />
                                </span>
                                <span className="text-sm text-black">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Choose Your Plan */}
            <h2 className="text-xl font-bold text-black font-heading text-center mb-5">Choose Your Plan</h2>

            <div className="flex flex-col gap-4 mb-8">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`relative rounded-2xl p-5 cursor-pointer transition-all border-2 ${selectedPlan === plan.id
                                ? "border-[#E05C5C]"
                                : "border-transparent"
                            } bg-[#1E2A3B]`}
                    >
                        {/* Tag */}
                        <div className="absolute -top-3 left-5">
                            <span className={`${plan.tagColor} text-white text-xs font-body font-semibold px-3 py-1 rounded-md`}>
                                {plan.tag}
                            </span>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                            <div>
                                <h3 className="text-white font-heading font-bold text-lg">{plan.title}</h3>
                                <p className="text-gray-400 font-body text-sm mt-0.5">{plan.subtitle}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-heading font-bold text-3xl">{plan.price}</p>
                                <p className="text-gray-400 font-body text-sm">{plan.period}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Subscribe Button */}
            <div className="w-[50%] mx-auto">
                <button className="w-full bg-[#E05C5C] text-white font-semibold py-4 rounded-xl text-base hover:bg-[#d04f4f] transition-colors">
                    Subscribe Now
                </button>
            </div>
        </div>
    );
};

export default PremiumContent;