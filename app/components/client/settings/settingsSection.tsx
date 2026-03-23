interface Props {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<Props> = ({ title, children }) => (
  <div className="mb-6">
    {title && (
      <h3 className="text-2xl font-extrabold text-[#1a1a2e] m-0 mb-3">{title}</h3>
    )}
    <div className="border border-gray-200 rounded-[10px] overflow-hidden bg-[#fafafa]">
      {children}
    </div>
  </div>
);

export default SettingsSection;