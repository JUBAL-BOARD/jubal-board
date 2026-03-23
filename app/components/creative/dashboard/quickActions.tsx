import { CheckSquare, Send, DollarSign } from "lucide-react";

interface StatsBarProps {
  activeProjects?: number;
  pendingPitches?: number;
  weeklyEarnings?: number;
}

const QuickActions: React.FC<StatsBarProps> = ({
  activeProjects = 30,
  pendingPitches = 10,
  weeklyEarnings = 400,
}) => {
  return (
    <div className="mb-7">
      {/* Horizontal scroll on mobile, normal flex on desktop */}
      <div className="flex gap-4 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">

        {/* Active Projects */}
        <div className="flex items-center justify-center gap-3.5 flex-shrink-0 w-[75vw] lg:w-auto lg:flex-1 bg-green-100 h-[150px] lg:h-[200px] border-[1.5px] border-gray-200 rounded-[10px] px-5 py-4 cursor-pointer hover:border-gray-300 transition-colors snap-start">
          <CheckSquare size={40} className="lg:w-[60px] lg:h-[60px]" stroke="green" />
          <div>
            <p className="m-0 font-bold text-2xl lg:text-3xl text-black">{activeProjects}</p>
            <p className="m-0 mt-0.5 text-lg lg:text-2xl text-black">Active Projects</p>
          </div>
        </div>

        {/* Pending Pitches */}
        <div className="flex items-center justify-center gap-3.5 flex-shrink-0 w-[75vw] lg:w-auto lg:flex-1 bg-purple-100 h-[150px] lg:h-[200px] border-[1.5px] border-gray-200 rounded-[10px] px-5 py-4 cursor-pointer hover:border-gray-300 transition-colors snap-start">
          <Send size={40} className="lg:w-[60px] lg:h-[60px]" stroke="purple" />
          <div>
            <p className="m-0 font-bold text-2xl lg:text-3xl text-black">{pendingPitches}</p>
            <p className="m-0 mt-0.5 text-lg lg:text-2xl text-black">Pending Pitches</p>
          </div>
        </div>

        {/* Earnings this week */}
        <div className="flex items-center justify-center gap-3.5 flex-shrink-0 w-[75vw] lg:w-auto lg:min-w-[300px] bg-[#FEF9E7] h-[150px] lg:h-[200px] border-[1.5px] border-[#FDE68A] rounded-[10px] px-6 py-4 snap-start">
          <DollarSign size={40} className="lg:w-[60px] lg:h-[60px]" stroke="#d97706" />
          <div>
            <p className="m-0 text-lg lg:text-2xl text-black font-medium">Earnings this week:</p>
            <p className="m-0 mt-1 text-2xl lg:text-3xl font-extrabold text-black">${weeklyEarnings.toLocaleString()}.00</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuickActions;