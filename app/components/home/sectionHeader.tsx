import { useRouter } from "next/navigation";

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
  viewAllPath?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onViewAll, viewAllPath }) => {
  const router = useRouter();
  const handleViewAll = () => {
    if (onViewAll) onViewAll();
    if (viewAllPath) router.push(viewAllPath);
  };
  return (
    <div className="flex justify-between items-center mb-5">
      <h2 className="text-[27px] font-extrabold text-[#1a1a2e] m-0">
        {title}
      </h2>
      <button
        onClick={handleViewAll}
        className="bg-transparent border-none cursor-pointer text-[#E2554F] text-sm font-semibold hover:underline"
      >
        View all
      </button>
    </div>
  );
};

export default SectionHeader;