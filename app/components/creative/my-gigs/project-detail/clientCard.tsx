import Image from "next/image";
import { Loader2 } from "lucide-react";
import StarIcon from "./icons/starIcon";
import type { CreativeProfile } from "./types";

interface ClientCardProps {
  clientProfile: CreativeProfile | null;
  loading: boolean;
  clientName: string;
  clientAvatar: string;
  clientRole: string;
  variant?: "full" | "compact";
}

export default function ClientCard({
  clientProfile,
  loading,
  clientName,
  clientAvatar,
  clientRole,
  variant = "full",
}: ClientCardProps) {
  if (variant === "compact") {
    return (
      <div className="bg-[#fafafa] p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Image
              src={clientAvatar}
              alt={clientName}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <p className="font-semibold text-black text-xl">{clientName}</p>
            <p className="text-xs text-black">{clientRole}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-black">
              <div className="flex items-center gap-0.5">
                <StarIcon />
                <span className="font-semibold">
                  {clientProfile?.overallRating?.toFixed(1) ?? "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <button className="w-8 h-8 rounded-full bg-[#1c1c3a] flex items-center justify-center">
          <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] p-6 mb-4">
      <div className="flex items-start justify-between">
        <h2 className="text-base font-bold text-black">Client</h2>
        {clientProfile?.isPremium && (
          <span className="px-4 py-1.5 bg-orange-400 text-white text-xs font-semibold rounded-md">
            Premium
          </span>
        )}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="animate-spin text-[#E2554F]" size={24} />
        </div>
      ) : (
        <div className="flex items-start gap-4 mt-4">
          <div className="relative shrink-0">
            <Image
              src={clientAvatar}
              alt={clientName}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
            <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <p className="font-semibold text-black text-xl">{clientName}</p>
            <p className="text-xs text-green-500 font-medium mt-0.5">● Online</p>
            <p className="text-sm text-black mt-2">Verification Status:</p>
            <span
              className={`inline-block mt-1 px-3 py-0.5 text-xs font-semibold rounded-full ${
                clientProfile?.isVerified
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {clientProfile?.isVerified ? "Verified" : "Unverified"}
            </span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-8 mt-4 pt-4 text-sm text-black">
        <div className="flex items-center gap-1">
          <StarIcon />
          <span className="font-medium text-black">
            {clientProfile?.overallRating?.toFixed(1) ?? "—"}
          </span>
        </div>
        <p className="text-xs text-gray-500">{clientRole}</p>
      </div>
    </div>
  );
}