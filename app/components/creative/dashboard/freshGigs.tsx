import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { FreshGig } from "@/app/types";
import Image from "next/image";

export default function FreshGigs({ gigs }: { gigs: FreshGig[] }) {
  return (
    <section className="mb-8 bg-[#fafafa] p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl lg:text-3xl font-bold text-gray-900">Fresh Gigs for you</h3>
        <Link href="/creative/find-gigs" className="text-sm text-[#E2554F] font-medium hover:text-red-600">
          View All
        </Link>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-4 overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-4 pb-2 lg:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
        {gigs.map((gig) => (
          <div
            key={gig.id}
            className="flex-shrink-0 w-[70vw] sm:w-[45vw] lg:w-auto snap-start bg-white border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
          >
            {/* Image */}
            <div className="relative h-32 bg-gray-100 overflow-hidden">
              {gig.image && (
                <img
                  src={gig.image}
                  alt={gig.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              {gig.isPremium && (
                <span className="absolute top-2 right-2 bg-[#E2554F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Premium
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-3">
              <span className="inline-block bg-gray-200 text-black text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5">
                {gig.category}
              </span>
              <h4 className="font-semibold text-black text-sm mb-1">{gig.title}</h4>
              <p className="text-xs text-black mb-0.5">Budget: {gig.budget}</p>
              <p className="text-xs text-black mb-0.5">Timeline: {gig.timeline}</p>
              <p className="text-xs text-black mb-2 truncate">Desc: {gig.description}</p>

              {/* Posted by */}
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-xs text-black">Posted by:</span>
                <Image
                  src={gig.postedBy.avatar}
                  alt={gig.postedBy.name}
                  width={22}
                  height={22}
                  className="rounded-full object-cover flex-shrink-0"
                />
                <span className="text-sm font-medium text-black truncate">{gig.postedBy.name}</span>
                {gig.postedBy.verified && (
                  <BadgeCheck fill="blue" stroke="white" size={12} className="text-blue-500 flex-shrink-0" />
                )}
              </div>

              <div className="text-center">
                <button className="w-[60%] bg-[#E2554F] hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                  Pitch Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}