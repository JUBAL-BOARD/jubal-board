import { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, desc, icon }) => {
  return (
    <div className="group bg-white hover:bg-[#E2554F] text-black hover:text-white border-[1.5px] border-gray-200 px-6 py-7 h-auto sm:h-[250px] flex flex-col items-center justify-center gap-3.5">
      <div className="text-[#E2554F] group-hover:text-white [&_svg]:stroke-current [&_svg]:fill-none">
        {icon}
      </div>
      <h3 className="m-0 text-lg sm:text-xl font-bold text-center">
        {title}
      </h3>
      <p className="m-0 text-sm sm:text-base text-center leading-relaxed">
        {desc}
      </p>
    </div>
  );
};

export default FeatureCard;