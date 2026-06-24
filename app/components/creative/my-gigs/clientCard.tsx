"use client";
import Image from "next/image";

interface ClientCardProps {
  clientName: string;
  clientAvatar: string;
}

const ClientCard: React.FC<ClientCardProps> = ({ clientName, clientAvatar }) => (
  <div className="bg-[#fafafa] border border-gray-100 rounded-xl p-5 mb-4">
    <h2 className="text-base font-bold text-black text-xl mb-4">About the client</h2>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Image
          src={clientAvatar}
          alt={clientName}
          width={56}
          height={56}
          className="rounded-full object-cover"
        />
        <div className="text-sm text-black">
          <p className="font-semibold text-black text-lg mb-1">{clientName}</p>
        </div>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-[#e84545] text-white text-sm font-medium rounded-lg hover:bg-[#d03535] transition-colors">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd" />
        </svg>
        Chat Client
      </button>
    </div>
  </div>
);

export default ClientCard;