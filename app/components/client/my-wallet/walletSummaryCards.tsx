interface Props {
  availableBalance: string;
  totalCredit: string;
  totalSpent: string;
  onAddFund: () => void;
}

const WalletSummaryCards: React.FC<Props> = ({
  availableBalance, totalCredit, totalSpent, onAddFund,
}) => {
  return (
    <div className="flex items-stretch gap-0 border border-gray-200 rounded-[10px] bg-[#fafafa] px-2.5 py-5 overflow-hidden mb-6">

      {/* Available Balance */}
      <div className="flex-1 px-6 py-5 bg-[#FFFBEB] border-r border-gray-200">
        <p className="m-0 mb-1.5 text-[13px] text-[#92400E] font-medium">
          Available Balance
        </p>
        <p className="m-0 text-[26px] font-extrabold text-[#1a1a2e]">
          {availableBalance}
        </p>
      </div>

      {/* Total Credit */}
      <div className="flex-1 px-6 py-5 bg-[#F0FDF4] border-r border-gray-200">
        <p className="m-0 mb-1.5 text-[13px] text-[#166534] font-medium">
          Total Credit
        </p>
        <p className="m-0 text-[26px] font-extrabold text-[#22C55E]">
          {totalCredit}
        </p>
      </div>

      {/* Total Spent */}
      <div className="flex-1 px-6 py-5 bg-[#EEF2FF] border-r border-gray-200">
        <p className="m-0 mb-1.5 text-[13px] text-[#3730A3] font-medium">
          Total Spent
        </p>
        <p className="m-0 text-[26px] font-extrabold text-[#1a1a2e]">
          {totalSpent}
        </p>
      </div>

      {/* Add Fund Button */}
      <div className="flex items-center justify-center px-7 py-5 bg-transparent">
        <button
          onClick={onAddFund}
          className="bg-[#E2554F] border-none rounded-lg px-6 py-3 cursor-pointer text-white font-bold text-[14px] whitespace-nowrap hover:bg-[#d44a44] transition-colors"
        >
          + Add Fund
        </button>
      </div>

    </div>
  );
};

export default WalletSummaryCards;