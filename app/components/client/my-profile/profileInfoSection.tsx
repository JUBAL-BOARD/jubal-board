interface InfoField {
  label: string;
  value: string;
}

interface Props {
  title: string;
  fields: InfoField[];
}

const ProfileInfoSection: React.FC<Props> = ({ title, fields }) => {
  return (
    <div className="bg-[#fafafa] border border-gray-200 rounded-[10px] p-4 lg:p-6 mb-5">
      <h3 className="m-0 mb-4 lg:mb-5 text-lg lg:text-xl font-extrabold text-[#1a1a2e]">
        {title}
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4 lg:gap-y-5">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="m-0 mb-1 text-sm lg:text-base font-semibold text-[#1a1a2e]">
              {field.label}
            </p>
            <p className="m-0 text-xs lg:text-[14px] text-gray-500">
              {field.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileInfoSection;