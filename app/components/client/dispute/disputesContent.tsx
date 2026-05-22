"use client";
import { useState } from "react";
import { Search, Eye, Filter, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Breadcrumb from "../../creative/dashboard/breadcrumb";

type DisputeStatus = "Open" | "Under Review" | "Resolved" | "Closed";

interface Dispute {
  id: string;
  title: string;
  issue: string;
  description: string;
  date: string;
  status: DisputeStatus;
}

const disputes: Dispute[] = [
  { id: "#DSP-1023", title: "Logo Design for Luxury Boutique", issue: "Poor Quality", description: "Final delivery did not meet agreed specs...", date: "28th Dec 2026, 11:00am", status: "Open" },
  { id: "#DSP-1023", title: "Logo Design for Luxury Boutique", issue: "Poor Quality", description: "Final delivery did not meet agreed specs...", date: "28th Dec 2026, 11:00am", status: "Resolved" },
  { id: "#DSP-1023", title: "Logo Design for Luxury Boutique", issue: "Poor Quality", description: "Final delivery did not meet agreed specs...", date: "28th Dec 2026, 11:00am", status: "Resolved" },
  { id: "#DSP-1023", title: "Logo Design for Luxury Boutique", issue: "Poor Quality", description: "Final delivery did not meet agreed specs...", date: "28th Dec 2026, 11:00am", status: "Under Review" },
  { id: "#DSP-1023", title: "Logo Design for Luxury Boutique", issue: "Poor Quality", description: "Final delivery did not meet agreed specs...", date: "28th Dec 2026, 11:00am", status: "Closed" },
];

const statusStyles: Record<DisputeStatus, string> = {
  Open: "bg-yellow-100 text-yellow-700",
  "Under Review": "bg-orange-100 text-orange-500",
  Resolved: "text-green-500",
  Closed: "bg-gray-800 text-white",
};

const tabs: ("All Disputes" | DisputeStatus)[] = ["All Disputes", "Open", "Under Review", "Resolved", "Closed"];

const DisputesContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("All Disputes");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = disputes.filter((d) => {
    const matchTab = activeTab === "All Disputes" || d.status === activeTab;
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb crumbs={[
        { label: "Dashboard", path: "/creative/dashboard" },
        { label: "Disputes" },
      ]} />

      <h1 className="text-2xl font-bold font-heading text-black mb-5">Disputes History</h1>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-5">
        <div className="flex items-center flex-1 border border-gray-200 rounded-lg px-3 gap-2 bg-white">
          <Search size={16} className="text-gray-400" />
          <input
            className="flex-1 py-2 text-sm outline-none placeholder:text-gray-400"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600">
          <Filter size={15} className="text-[#E05C5C]" />
          Filter By
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-colors ${
              activeTab === tab
                ? "bg-[#E05C5C] text-white"
                : "bg-white border border-gray-200 text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dispute Cards */}
      <div className="flex flex-col gap-4">
        {filtered.map((dispute, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex items-start justify-between shadow-sm">
            <div className="flex-1">
              <span className="text-xs bg-gray-700 text-white rounded px-2 py-0.5 font-mono">{dispute.id}</span>
              <h3 className="font-semibold font-heading text-black mt-1">{dispute.title}</h3>
              <p className="text-sm text-black mt-0.5">
                Issue: &nbsp;<span className="text-black">{dispute.issue}</span>
              </p>
              <p className="text-sm text-black mt-0.5">Description: {dispute.description}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-black">
                <Calendar size={18} />
                {dispute.date}
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 ml-4">
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusStyles[dispute.status]}`}>
                {dispute.status}
              </span>
              <button
                onClick={() => router.push(`/client/dispute/${dispute.id.replace("#", "")}`)}
                className="flex items-center gap-1.5 bg-[#E05C5C] text-white text-sm px-4 py-2 rounded-lg"
              >
                <Eye size={14} />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-8 flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Showing per page
          <select className="border border-gray-200 rounded px-2 py-1 text-sm">
            <option>5</option>
            <option>10</option>
            <option>20</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          {[ChevronsLeft, ChevronLeft].map((Icon, i) => (
            <button key={i} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-gray-500">
              <Icon size={14} />
            </button>
          ))}
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium ${
                n === 1 ? "bg-[#1E2A3B] text-white" : "border border-gray-200 text-gray-600"
              }`}
            >
              {n}
            </button>
          ))}
          <span className="px-1 text-gray-400">...</span>
          <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-sm text-gray-600">25</button>
          {[ChevronRight, ChevronsRight].map((Icon, i) => (
            <button key={i} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-gray-500">
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisputesContent;