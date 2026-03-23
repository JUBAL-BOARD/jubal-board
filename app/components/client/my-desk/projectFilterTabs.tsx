type FilterTab = "All Projects" | "Active Projects" | "Recent Projects" | "Completed Projects" | "Revised Projects";

const tabs: FilterTab[] = [
  "All Projects",
  "Active Projects",
  "Recent Projects",
  "Completed Projects",
  "Revised Projects",
];

interface Props {
  active: FilterTab;
  onChange: (tab: FilterTab) => void;
}

const ProjectFilterTabs: React.FC<Props> = ({ active, onChange }) => {
  return (
    <div className="flex gap-2 mb-5 flex-wrap">
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`px-[18px] py-2 rounded-full cursor-pointer text-[13px] transition-all duration-150
              ${isActive
                ? "bg-[#E2554F] text-white font-semibold border-none"
                : "bg-white text-gray-700 font-normal border border-gray-200 hover:border-gray-300"
              }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};

export default ProjectFilterTabs;