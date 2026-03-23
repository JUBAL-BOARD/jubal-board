import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import EarningsStats from "./earningsStat";
import EarningsBreakdown from "./earningsBreakdown";
import RecentTransactions from "./recentTransactions";
import { earningsData, recentTransactions } from "@/app/data";

const MyEarningsContent: React.FC = () => {
  return (
    <div>
      <Breadcrumb crumbs={[
        { label: "Dashboard", path: "/creative/dashboard" },
        { label: "My Earnings" },
      ]} />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Earnings</h1>

      <EarningsStats data={earningsData} />
      <EarningsBreakdown />
      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
};

export default MyEarningsContent;