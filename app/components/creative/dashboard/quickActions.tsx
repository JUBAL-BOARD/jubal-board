import { Money, PendingPitches } from "@/app/icons";
import { useQuickStats } from "@/app/lib/hooks/useQuickStats";
import { CheckSquare } from "lucide-react";
import Link from "next/link";

const QuickActions: React.FC = () => {
  const { activeProjects, pendingPitches, weeklyEarnings, loading } = useQuickStats();

  return (
      <div className="flex mb-7 gap-4 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
        {/* Active Projects */}
        <Link href="/creative/my-gigs" className="flex-shrink-0 w-[75vw] lg:w-auto lg:flex-1">
          <div className="flex items-center justify-center gap-3.5 w-full bg-[#E5FFEC] h-[150px] lg:h-[131px] border-[1.5px] border-gray-200 rounded-[10px] px-5 py-4 cursor-pointer hover:border-gray-300 transition-colors snap-start">
            <CheckSquare className="lg:w-[60px] lg:h-[60px] p-3 rounded-4xl bg-green-800" stroke="white" />
            <div>
              <p className="m-0 font-heading font-bold text-2xl lg:text-3xl text-black">
                {loading ? "—" : activeProjects}
              </p>
              <p className="m-0 font-bold font-heading text-2xl text-black">Active Projects</p>
            </div>
          </div>
        </Link>

        {/* Pending Pitches */}
        <Link href="/creative/my-pitches" className="flex-shrink-0 w-[75vw] lg:w-auto lg:flex-1">
          <div className="flex items-center justify-center gap-3.5 w-full  bg-[#FCE3FF] h-[150px] lg:h-[131px] border-[1.5px] border-gray-200 rounded-[10px] px-5 py-4 cursor-pointer hover:border-gray-300 transition-colors snap-start">
            <PendingPitches size={40} className="lg:w-[60px] lg:h-[60px] p-4 rounded-4xl bg-purple-800" stroke="white" />
            <div>
              <p className="m-0 font-heading font-bold text-2xl lg:text-3xl text-black">
                {loading ? "—" : pendingPitches}
              </p>
              <p className="m-0 font-bold font-heading text-2xl text-black">Pending Pitches</p>
            </div>
          </div>
        </Link>

        {/* Earnings */}
        <Link href="/creative/my-earnings" className="flex-shrink-0 w-[75vw] lg:w-auto lg:flex-1">
          <div className="flex items-center justify-center gap-3.5 w-full bg-[#FFEFE3] h-[150px] lg:h-[131px] border-[1.5px] border-gray-200 rounded-[10px] px-5 py-4 cursor-pointer hover:border-gray-300 transition-colors snap-start">
            <Money size={40} className="lg:w-[60px] lg:h-[60px] p-3 rounded-4xl bg-[#AC7F5E]" stroke="white" />
            <div>
              <p className="m-0 font-bold font-heading text-2xl text-black">Earnings this week:</p>
              <p className="m-0 font-body mt-1 text-2xl lg:text-3xl font-extrabold text-black">
                {loading ? "—" : `$${weeklyEarnings.toLocaleString()}`}
              </p>
            </div>
          </div>
        </Link>
      </div>
  );
};

export default QuickActions;