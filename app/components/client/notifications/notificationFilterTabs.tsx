export type NotifTab = "All" | "Unread" | "Projects" | "Messages";

const tabs: NotifTab[] = ["All", "Unread", "Projects", "Messages"];

interface Props {
  active: NotifTab;
  onChange: (tab: NotifTab) => void;
}

const NotificationFilterTabs: React.FC<Props> = ({ active, onChange }) => {
  return (
    <div className="flex gap-2 mb-6">
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`px-5 py-[7px] rounded-full text-[13px] cursor-pointer transition-all duration-150
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

export default NotificationFilterTabs;