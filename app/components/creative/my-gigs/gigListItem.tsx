import { Clock, MessageCircle, Eye, Upload, Users } from "lucide-react";
import { MyGig } from "@/app/types";

interface Props {
  gig: MyGig;
}

const progressColor: Record<string, string> = {
  "In Progress": "bg-[#E2554F]",
  Completed: "bg-green-500",
  Revised: "bg-yellow-400",
  Collaborating: "bg-green-500",
  "Partially Completed": "bg-orange-400",
  Active: "bg-blue-500",
};

const GigListItem: React.FC<Props> = ({ gig }) => {
  const isCollab = gig.status === "Collaborating";

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 bg-[#fafafa] border border-gray-100 rounded-xl px-4 py-4 hover:shadow-sm transition-shadow">

      {/* Top row on mobile — thumbnail + info */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Thumbnail */}
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          <img src={gig.thumbnail} alt={gig.title} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm lg:text-md mb-1.5">{gig.title}</h4>

          <div className="flex items-center gap-2 mb-1.5">
            <img src={gig.client.avatar} alt={gig.client.name} className="w-5 h-5 lg:w-6 lg:h-6 rounded-full object-cover" />
            <span className="text-xs lg:text-sm text-black font-medium">{gig.client.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1 mb-1.5">
            <Clock size={12} className="text-black" />
            <span className="text-xs text-black">Due in {gig.dueIn}</span>

            {/* Collab mates */}
            {isCollab && gig.collabMates && (
              <div className="flex items-center gap-1.5 ml-1">
                <span className="text-xs text-black">Collab mate:</span>
                <div className="flex -space-x-1.5">
                  {gig.collabMates.avatars.map((av, i) => (
                    <img key={i} src={av} alt="" className="w-5 h-5 rounded-full border border-white object-cover" />
                  ))}
                </div>
                <span className="text-xs text-black">{gig.collabMates.label}</span>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-black">Status: {gig.status}</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[120px] lg:max-w-[160px]">
              <div
                className={`h-full rounded-full ${progressColor[gig.status] ?? "bg-gray-400"}`}
                style={{ width: `${gig.progress}%` }}
              />
            </div>
            <span className="text-xs text-black">{gig.progress}%</span>
          </div>
        </div>
      </div>

      {/* Actions — row on mobile, column on desktop */}
      <div className="flex flex-row lg:flex-col flex-wrap gap-2 flex-shrink-0">
        {isCollab ? (
          <>
            <button className="flex items-center justify-center gap-1.5 bg-[#E2554F] hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
              <Users size={12} /> Group Chat
            </button>
            <button className="flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
              <Eye size={12} /> View Progress
            </button>
          </>
        ) : (
          <>
            <button className="flex items-center justify-center gap-1.5 bg-[#E2554F] hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
              <MessageCircle size={12} /> Chat Client
            </button>
            <button className="flex items-center justify-center gap-1.5 bg-[#E2554F] hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
              <Eye size={12} /> View Pitch
            </button>
          </>
        )}
        <button className="flex items-center justify-center gap-1.5 bg-[#E2554F] hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
          <Upload size={12} /> Upload Deliverables
        </button>
      </div>

    </div>
  );
};

export default GigListItem;