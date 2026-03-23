import { Eye, MessageCircle } from "lucide-react";
import { ClientFamMember } from "@/app/types";

interface Props {
  client: ClientFamMember;
  isLast: boolean;
}

const ClientFamRow: React.FC<Props> = ({ client, isLast }) => {
  return (
    <div className={`flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 px-4 lg:px-5 py-4 bg-[#fafafa] hover:bg-white transition-colors ${!isLast ? "border-b border-gray-100" : ""}`}>

      {/* Top row on mobile — avatar + info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <img
          src={client.avatar}
          alt={client.name}
          className="w-12 h-12 lg:w-16 lg:h-16 rounded-full object-cover flex-shrink-0"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-black text-lg mb-1">{client.name}</p>
          <p className="text-sm text-black">Total Projects: {client.totalProjects}</p>
          <p className="text-sm text-black">Language: {client.language}</p>
          <p className="text-sm text-black">
            Preferred Communication: {client.preferredCommunication}
          </p>
        </div>
      </div>

      {/* Actions — row on mobile, column on desktop */}
      <div className="flex flex-row lg:flex-col gap-2 flex-shrink-0">
        <button className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 bg-[#E2554F] hover:bg-red-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors">
          <Eye size={12} />
          View Profile
        </button>
        <button className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 bg-[#E2554F] hover:bg-red-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors">
          <MessageCircle size={12} />
          Chat Client
        </button>
      </div>

    </div>
  );
};

export default ClientFamRow;