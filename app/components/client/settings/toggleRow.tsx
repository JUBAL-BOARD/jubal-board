interface Props {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

const ToggleRow: React.FC<Props> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-white">
    <div>
      <p className="m-0 text-[14px] font-medium text-[#1a1a2e]">{label}</p>
      {description && (
        <p className="m-0 mt-0.5 text-xs text-gray-500">{description}</p>
      )}
    </div>

    {/* Toggle */}
    <div
      onClick={() => onChange(!checked)}
      className="relative flex-shrink-0 w-11 h-6 rounded-full cursor-pointer transition-colors duration-200"
      style={{ background: checked ? "#E2554F" : "#D1D5DB" }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
        style={{ left: checked ? 22 : 2 }}
      />
    </div>
  </div>
);

export default ToggleRow;