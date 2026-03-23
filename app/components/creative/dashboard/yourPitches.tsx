import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { CreativePitch } from "@/app/types";
import Image from "next/image";

const statusColors: Record<string, string> = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-orange-100 text-orange-700",
  rejected: "bg-red-100 text-red-700",
};

export default function YourPitches({ pitches }: { pitches: CreativePitch[] }) {
  return (
    <section className="mb-8 bg-[#fafafa] p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl lg:text-3xl font-bold text-gray-900">Your Pitches</h3>
        <Link href="/creative/my-pitches" className="text-sm text-[#E2554F] font-medium hover:text-red-600">
          View All
        </Link>
      </div>

      {/* Horizontal scroll on mobile, 4-col grid on desktop */}
      <div className="flex gap-4 overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-4 pb-2 lg:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
        {pitches.map((pitch) => (
          <div
            key={pitch.id}
            className="flex-shrink-0 w-[70vw] sm:w-[45vw] lg:w-auto snap-start bg-white border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
          >
            {/* Image */}
            <div className="h-32 bg-gray-100 overflow-hidden">
              {pitch.image && (
                <img
                  src={pitch.image}
                  alt={pitch.gigTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>

            {/* Content */}
            <div className="p-3">
              <span className="inline-block bg-gray-200 text-black text-[10px] rounded-full font-semibold px-2 py-0.5 mb-1.5">
                {pitch.category}
              </span>
              <h4 className="font-semibold text-black text-sm mb-1">{pitch.gigTitle}</h4>
              <p className="text-xs text-black mb-0.5">Budget: {pitch.budget}</p>
              <p className="text-xs text-black mb-0.5">Timeline: {pitch.timeline}</p>
              <p className="text-xs text-black mb-2 truncate">Desc: {pitch.description}</p>

              {/* Client */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs text-black">Client:</span>
                <Image
                  src={pitch.client.avatar}
                  alt={pitch.client.name}
                  width={22}
                  height={22}
                  className="rounded-full object-cover flex-shrink-0"
                />
                <span className="text-xs font-medium text-black truncate">{pitch.client.name}</span>
                {pitch.client.verified && (
                  <BadgeCheck fill="blue" stroke="white" size={12} className="text-blue-500 flex-shrink-0" />
                )}
              </div>

              <p className="text-xs text-black mb-1.5">Sent: {pitch.sentAt}</p>

              {/* Status */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-black">Status:</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[pitch.status]}`}>
                  {pitch.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}