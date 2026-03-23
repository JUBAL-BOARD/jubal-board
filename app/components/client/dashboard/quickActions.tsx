import { Briefcase, ClipboardList } from "lucide-react";

const QuickActions: React.FC = () => {
  return (
    <div className="flex mb-7 gap-4 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">

      {/* Explore Skills */}
      <div className="flex items-center justify-center gap-3.5 flex-shrink-0 w-[75vw] lg:w-auto lg:flex-1 bg-[#fafafa] h-[150px] lg:h-[200px] border-[1.5px] border-gray-200 rounded-[10px] px-5 py-4 cursor-pointer hover:border-gray-300 transition-colors snap-start">
        <Briefcase size={48} stroke="#E2554F" />
        <div>
          <p className="m-0 font-bold text-2xl text-black">Explore Skills</p>
          <p className="m-0 mt-0.5 text-lg text-black">
            Find the exact skillset your project requires
          </p>
        </div>
      </div>

      {/* Post a Brief */}
      <div className="flex items-center justify-center gap-3.5 flex-shrink-0 w-[75vw] lg:w-auto lg:flex-1 bg-[#fafafa] h-[150px] lg:h-[200px] border-[1.5px] border-gray-200 rounded-[10px] px-5 py-4 cursor-pointer hover:border-gray-300 transition-colors snap-start">
        <ClipboardList size={48} stroke="#E2554F" />
        <div>
          <p className="m-0 font-bold text-2xl text-black">Post a Brief</p>
          <p className="m-0 mt-0.5 text-lg text-black">
            Describe what you need—let the right creatives come to you
          </p>
        </div>
      </div>

      {/* Available Balance */}
      <div className="flex items-center justify-center gap-3.5 flex-shrink-0 w-[75vw] lg:w-auto lg:flex-1 bg-[#FEF9E7] h-[150px] lg:h-[200px] border-[1.5px] border-gray-200 rounded-[10px] px-5 py-4 cursor-pointer hover:border-gray-300 transition-colors snap-start">
        <p className="m-0 text-lg text-black font-medium">Available Balance:</p>
        <p className="m-0 mt-1 text-2xl font-extrabold text-black">$5,000.00</p>
      </div>

    </div>
  );
};

export default QuickActions;
