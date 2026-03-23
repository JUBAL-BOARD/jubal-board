import { features } from "../../data";
import FeatureCard from "./featureCard";

const WhyDifferentSection: React.FC = () => {
  return (
    <div className="px-8 py-9 bg-[#fafafa] w-[95%] mx-auto mt-8 h-fit">
      <h2 className="text-center text-2xl font-extrabold text-[#1a1a2e] mb-8">
        What makes Jubal Board different
      </h2>
      <div className="grid grid-cols-3 gap-[18px]">
        {features.map((feature, i) => (
          <FeatureCard key={i} title={feature.title} desc={feature.desc} />
        ))}
      </div>
    </div>
  );
};

export default WhyDifferentSection;