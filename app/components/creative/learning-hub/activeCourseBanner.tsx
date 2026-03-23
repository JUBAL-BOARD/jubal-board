const ActiveCourseBanner: React.FC = () => {
  return (
    <div className="border border-gray-200 rounded-xl p-6 mb-8">
      <div className="flex flex-col items-center text-center">
        <h3 className="font-bold text-gray-900 text-base mb-2">Value Based Pricing Mastery</h3>
        <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          In Progress
        </span>
        <div className="w-full max-w-md mb-1">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#E2554F] rounded-full" style={{ width: "60%" }} />
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-4">60%</p>
        <button className="bg-[#E2554F] hover:bg-red-600 text-white font-semibold px-10 py-2.5 rounded-lg transition-colors text-sm">
          Resume
        </button>
      </div>
    </div>
  );
};

export default ActiveCourseBanner;