import Link from "next/link";
import { Clock, MessageCircle, Eye, Upload } from "lucide-react";
import { OngoingGig } from "@/app/types";
import Image from "next/image";

export default function OngoingGigs({ gigs }: { gigs: OngoingGig[] }) {
  return (
    <section className="mb-8 bg-[#fafafa] p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl lg:text-3xl font-bold text-gray-900">Ongoing Gigs</h3>
        <Link href="/creative/my-gigs" className="text-sm text-[#E2554F] font-medium hover:text-red-600">
          View All
        </Link>
      </div>

      {/* Horizontal scroll on mobile, 2-col grid on desktop */}
      <div className="flex gap-4 overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-2 pb-2 lg:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
        {gigs.map((gig) => (
          <div
            key={gig.id}
            className="flex-shrink-0 w-[80vw] sm:w-[60vw] lg:w-auto snap-start bg-white border border-gray-100 rounded-2xl p-4"
          >
            {/* Top — thumbnail + info */}
            <div className="flex items-center gap-4 mb-3">
              <Image
                src={gig.thumbnail}
                alt={gig.title}
                width={200}
                height={200}
                className="w-16 h-16 lg:w-[80px] lg:h-[80px] rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-3">
                  {gig.title}
                </h4>
                <div className="flex items-center gap-1.5">
                  <Image
                    src={gig.client.avatar}
                    alt={gig.client.name}
                    width={22}
                    height={22}
                    className="rounded-full object-cover flex-shrink-0"
                  />
                  <span className="text-sm text-black">{gig.client.name}</span>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <Clock size={11} className="text-black" />
                  <span className="text-xs text-black">Due in {gig.dueIn}</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-black">Status: {gig.status}</span>
                <span className="text-xs font-medium text-gray-700">{gig.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#E2554F] rounded-full" style={{ width: `${gig.progress}%` }} />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              <button className="flex items-center gap-1.5 bg-[#E2554F] border border-red-200 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-300 transition-colors">
                <MessageCircle size={12} /> Chat Client
              </button>
              <button className="flex items-center gap-1.5 bg-[#E2554F] border border-gray-200 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-300 transition-colors">
                <Eye size={12} /> View Pitch
              </button>
              <button className="flex items-center gap-1.5 bg-[#E2554F] border border-gray-200 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-300 transition-colors">
                <Upload size={12} /> Upload Deliverables
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}