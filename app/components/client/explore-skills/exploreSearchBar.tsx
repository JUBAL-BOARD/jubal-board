import { Search, ListFilter, ChevronDown } from "lucide-react";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const ExploreSearchBar: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="flex gap-3 mb-6">

      {/* Search Input */}
      <div className="flex-1 flex items-center gap-2.5 border-[1.5px] border-gray-200 rounded-lg px-3.5 py-2.5 bg-white">
        <Search size={18} stroke="black" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search creative, categories or anything"
          className="border-none outline-none flex-1 text-[13px] bg-transparent text-black placeholder:text-gray-400"
        />
      </div>

      {/* Filter Button */}
      <button className="flex items-center gap-2 bg-transparent border-none rounded-lg px-[18px] py-2.5 cursor-pointer text-[#e2554f] font-semibold text-[13px] hover:bg-gray-50 transition-colors">
        <ListFilter size={16} stroke="#E85D3A" />
        Filter By
        <ChevronDown size={12} stroke="#e2554f" />
      </button>

    </div>
  );
};

export default ExploreSearchBar;