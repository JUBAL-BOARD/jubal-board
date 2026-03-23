export type SettingsTab =
  | "Profile Settings"
  | "Account Settings"
  | "Notification Settings"
  | "Privacy Settings"
  | "Language & Appearance"
  | "Payment Settings";

const tabs: SettingsTab[] = [
  "Profile Settings",
  "Account Settings",
  "Notification Settings",
  "Privacy Settings",
  "Language & Appearance",
  "Payment Settings",
];

interface Props {
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

const SettingsTabs: React.FC<Props> = ({ active, onChange }) => (
  <div className="px-3 lg:px-6 py-3 lg:py-4 bg-[#fafafa] border border-gray-200 rounded-[10px] mb-6">

    {/* Horizontal scroll on mobile, wrap on desktop */}
    <div className="flex gap-2 overflow-x-auto lg:overflow-x-visible lg:flex-wrap pb-1 lg:pb-0 scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`flex-shrink-0 px-3 lg:px-[18px] py-2 rounded-lg text-xs lg:text-[13px] cursor-pointer transition-all duration-150 whitespace-nowrap
              ${isActive
                ? "bg-[#E85D3A] text-white font-semibold border-none"
                : "bg-white text-gray-700 font-normal border border-gray-200 hover:border-gray-300"
              }`}
          >
            {tab}
          </button>
        );
      })}
    </div>

  </div>
);

export default SettingsTabs;