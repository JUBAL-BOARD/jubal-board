import { Star, MessageCircle } from "lucide-react";
import { CollabCreative } from "@/app/types";

interface Props {
  creative: CollabCreative;
}

const CollabCard: React.FC<Props> = ({ creative }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
      {/* Portfolio image */}
      <div className="relative h-32 lg:h-36 bg-gray-100 overflow-hidden">
        <img
          src={creative.portfolioImg}
          alt={creative.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Info */}
      <div className="p-3 lg:p-4">
        <div className="flex items-start gap-2 lg:gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={creative.avatar}
              alt={creative.name}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-white shadow"
            />
            {creative.verified && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>

          {/* Name + role + rating */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-black text-sm truncate">{creative.name}</p>
            <p className="text-xs text-black mb-1">{creative.role}</p>
            <div className="flex items-center gap-1 mb-1">
              <Star size={11} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-medium text-gray-700">{creative.rating.toFixed(1)}</span>
            </div>
            <button className="text-xs text-[#E2554F] font-medium hover:underline">
              View Profile
            </button>
          </div>

          {/* Message icon */}
          <button className="w-7 h-7 lg:w-8 lg:h-8 bg-gray-900 hidden lg:block rounded-full flex items-center justify-center flex-shrink-0 hover:bg-gray-700 transition-colors">
            <MessageCircle size={13} className="text-white" />
          </button>
        </div>

        {/* Invite button */}
        <button className="w-full mt-3 bg-[#E2554F] hover:bg-red-600 text-white text-xs font-semibold py-2 lg:py-2.5 rounded-lg transition-colors">
          Invite
        </button>
      </div>
    </div>
  );
};

export default CollabCard;