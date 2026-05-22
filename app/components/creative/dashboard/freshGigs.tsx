"use client";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGigStore } from "../../../lib/stores/gigStore";
import { useFreshGigs } from "../../../lib/hooks/useFreshGigs";
import { FreshGig } from "@/app/types";

export default function FreshGigs() {
  const router = useRouter();
  const setSelectedGig = useGigStore((s) => s.setSelectedGig);
  const { gigs, loading } = useFreshGigs({ limit: 4 });

  const handlePitchNow = (gig: FreshGig) => {
    setSelectedGig(gig);
    router.push(`/creative/find-gigs/${encodeURIComponent(gig.category)}/pitch`);
  };

  return (
    <section className="mb-8 bg-[#fafafa] p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl lg:text-3xl font-heading font-bold text-gray-900">Fresh Gigs for you</h3>
        <Link href="/creative/find-gigs" className="text-sm text-[#E2554F] font-body font-medium hover:text-red-600">
          View All
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[70vw] sm:w-[45vw] lg:w-full h-64 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : gigs.length === 0 ? (
        <p className="text-sm text-black text-center py-10">No gigs available right now.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-4 pb-2 lg:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
          {gigs.map((gig) => (
            <div
              key={gig.id}
              className="flex-shrink-0 w-[70vw] sm:w-[45vw] lg:w-auto snap-start bg-white border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="relative h-32 bg-gray-100 overflow-hidden">
                {gig.image ? (
                  <img
                    src={gig.image}
                    alt={gig.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">{gig.category}</span>
                  </div>
                )}
                {gig.isPremium && (
                  <span className="absolute top-2 right-2 bg-[#E2554F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Premium
                  </span>
                )}
              </div>
              <div className="p-3">
                <span className="inline-block bg-gray-200 text-black text-[10px] font-body font-semibold px-2 py-0.5 rounded-full mb-1.5">
                  {gig.category}
                </span>
                <h4 className="font-body font-semibold text-black text-sm mb-1">{gig.title}</h4>
                <p className="text-xs font-body text-black mb-0.5">Budget: {gig.budget}</p>
                <p className="text-xs font-body text-black mb-0.5">Timeline: {gig.timeline}</p>
                <p className="text-xs font-body text-black mb-2 truncate">Desc: {gig.description}</p>
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-xs font-body text-black">Posted by:</span>
                  <Image
                    src={gig.postedBy.avatar}
                    alt={gig.postedBy.name}
                    width={22}
                    height={22}
                    className="rounded-full object-cover flex-shrink-0"
                  />
                  <span className="text-xs font-body font-medium text-black truncate">{gig.postedBy.name}</span>
                  {gig.postedBy.verified && (
                    <BadgeCheck fill="blue" stroke="white" size={12} className="text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <div className="text-center">
                  <button
                    onClick={() => handlePitchNow(gig)}
                    className="w-[60%] bg-[#E2554F] hover:bg-red-600 text-white text-xs font-body font-semibold py-2 rounded-lg transition-colors"
                  >
                    Pitch Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}