import { MessageCircle, BadgeCheck } from "lucide-react";
import { CreativePitch } from "@/app/types";

interface Props {
  pitch: CreativePitch;
}

const statusStyles: Record<string, string> = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-orange-100 text-orange-700",
  ongoing: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
};

const PitchCard: React.FC<Props> = ({ pitch }) => {
  return (
    <div className="flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">

      {/* Image — full width on mobile, fixed width on desktop */}
      <div className="relative h-40 bg-gray-100 overflow-hidden flex-shrink-0">
        <img
          src={pitch.image}
          alt={pitch.gigTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <span className="inline-block bg-gray-100 text-black text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 w-fit">
          {pitch.category}
        </span>
        <h4 className="font-semibold text-black text-sm mb-1">{pitch.gigTitle}</h4>
        <p className="text-xs text-black mb-0.5">Budget: {pitch.budget}</p>
        <p className="text-xs text-black mb-0.5">Timeline: {pitch.timeline}</p>
        <p className="text-xs text-black mb-3 truncate">Desc: {pitch.description}</p>

        {/* Client + Status row */}
        <div className="flex flex-col gap-2 mb-3">
          {/* Client */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-black">Client:</span>
            <img
              src={pitch.client.avatar}
              alt={pitch.client.name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-xs font-medium text-black truncate">{pitch.client.name}</span>
            {pitch.client.verified && (
              <BadgeCheck size={13} fill="blue" stroke="white" className="flex-shrink-0" />
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-black">Status:</span>
            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${statusStyles[pitch.status]}`}>
              {pitch.status}
            </span>
          </div>
        </div>

        <p className="text-xs text-black mb-3">Sent: {pitch.sentAt}</p>

        {/* Chat button */}
        <div className="w-full lg:w-[60%] mx-auto">
          <button className="w-full flex items-center justify-center gap-2 bg-[#E2554F] hover:bg-red-600 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors">
            <MessageCircle size={13} />
            Chat Client
          </button>
        </div>
      </div>

    </div>
  );
};

export default PitchCard;