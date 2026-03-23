import { BadgeCheck } from "lucide-react";

const FeedbackProfile: React.FC = () => {
  return (
    <div className="flex flex-col items-center mb-6">
      <img
        src="https://i.pravatar.cc/150?img=47"
        alt="Natasha John"
        className="w-24 h-24 rounded-full object-cover mb-3"
      />
      <div className="flex items-center gap-1">
        <p className="font-semibold text-gray-900 text-sm">Natasha John</p>
        <BadgeCheck size={15} fill="blue" stroke="white" />
      </div>
      <p className="text-xs text-gray-500 mt-0.5">Graphic Designer</p>
    </div>
  );
};

export default FeedbackProfile;