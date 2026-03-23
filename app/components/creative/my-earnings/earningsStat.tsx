import { EarningsData } from "@/app/types";

interface Props {
  data: EarningsData;
}

const EarningsStats: React.FC<Props> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-7">
      {/* Total Earned */}
      <div className="bg-green-50 w-[80%] mx-auto lg:w-full flex flex-col items-center justify-center border border-green-100 rounded-xl px-6 py-5">
        <p className="text-xs font-medium text-green-600 mb-2">Total Earned</p>
        <p className="text-lg lg:text-3xl font-bold text-green-500">
          ${data.totalEarned.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Pending Earnings */}
      <div className="bg-purple-50 w-[80%] mx-auto lg:w-full border border-purple-100 rounded-xl px-6 py-5">
        <p className="text-xs font-medium text-center text-purple-500 mb-2">Pending Earnings</p>
        <p className="text-lg lg:text-3xl font-bold text-center text-gray-900">
          ${data.pendingEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Available Balance */}
      <div className="bg-yellow-50 w-[80%] mx-auto lg:w-full border border-yellow-100 rounded-xl px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-center font-medium text-yellow-600 mb-2">Available Balance</p>
          <p className="text-lg lg:text-3xl text-center font-bold text-gray-900">
            ${data.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <button className="bg-[#E2554F] hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex-shrink-0">
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default EarningsStats;