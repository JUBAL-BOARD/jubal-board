import { Briefcase, ClipboardList } from "lucide-react";
import Link from "next/link";

interface Props {
  availableBalance: string | null;
}

const QuickActions: React.FC<Props> = ({ availableBalance }) => {
  return (
    <div className="flex mb-7 gap-4 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
      {/* Hire A Pro */}
      <Link href="/client/explore-skills" className="flex-shrink-0 w-[75vw] lg:w-auto lg:flex-1">
        <div className="flex items-center justify-center gap-3.5 w-full bg-[#E6E6E699] h-[150px] lg:h-[200px] border-[1.5px] border-gray-200 rounded-[10px] px-5 py-4 cursor-pointer hover:border-gray-300 transition-colors snap-start">
          <Briefcase size={48} stroke="#E2554F" />
          <div>
            <p className="m-0 font-bold font-heading text-2xl text-black">Hire A Pro</p>
            <p className="m-0 mt-0.5 font-body text-lg text-black">
              Find the exact skillset your project requires
            </p>
          </div>
        </div>
      </Link>

      {/* Post a Brief */}
      <Link href="/client/my-briefs/post" className="flex-shrink-0 w-[75vw] lg:w-auto lg:flex-1">
        <div className="flex items-center justify-center gap-3.5 w-full bg-[#E6E6E699] h-[150px] lg:h-[200px] border-[1.5px] border-gray-200 rounded-[10px] px-5 py-4 cursor-pointer hover:border-gray-300 transition-colors snap-start">
          <ClipboardList size={48} stroke="#E2554F" />
          <div>
            <p className="m-0 font-bold font-heading text-2xl text-black">Post a Brief</p>
            <p className="m-0 mt-0.5 text-lg font-body text-black">
              Describe what you need—let the right creatives come to you
            </p>
          </div>
        </div>
      </Link>

      {/* Available Balance */}
      <Link href="/client/my-wallet" className="flex-shrink-0 w-[75vw] lg:w-auto lg:flex-1">
        <div className="flex flex-col items-center justify-center gap-3.5 w-full bg-[#FFD70033] h-[150px] lg:h-[200px] border-[1.5px] border-gray-200 rounded-[10px] px-5 py-4 cursor-pointer hover:border-gray-300 transition-colors snap-start">
          <p className="m-0 text-lg text-black font-heading font-medium">Available Balance:</p>
          <p className="m-0 mt-1 text-4xl font-heading font-extrabold text-black">
            {availableBalance ?? "—"}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default QuickActions;