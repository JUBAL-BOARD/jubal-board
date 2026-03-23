import { NetworkIcon } from "../../icons";

interface FeatureCardProps {
  title: string;
  desc: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, desc }) => {
  return (
    <div className="bg-white border-[1.5px] border-gray-200 px-6 py-7 h-[250px] flex flex-col items-center justify-center gap-3.5">
      <NetworkIcon />
      <h3 className="m-0 text-xl font-bold text-[#1a1a2e] text-center">
        {title}
      </h3>
      <p className="m-0 text-base text-gray-500 text-center leading-relaxed">
        {desc}
      </p>
    </div>
  );
};

export default FeatureCard;