"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import { Search, SlidersHorizontal, ChevronDown, CheckCircle, BadgeCheck, X } from "lucide-react";
import { findGigsServices, allGigs } from "@/app/data";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";

const filterChips = ["All", "Recent", "$100-$200", "Graphic Designers", "Logo Design", "Posters", "Brand Identity", "Packaging"];

const CategoryGigsPage: React.FC = () => {
  const params = useParams();
  const category = decodeURIComponent(params.category as string);

  const [activeChip, setActiveChip] = useState("All");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredGigs = allGigs.filter((gig) => {
    const matchesSearch = gig.title.toLowerCase().includes(search.toLowerCase());
    const matchesChip = activeChip === "All" || gig.title.includes(activeChip);
    return matchesSearch && matchesChip;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <DashboardTopbar
        userName="Natasha John"
        userAvatar="https://i.pravatar.cc/150?img=47"
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1">
        {/* Dark overlay — mobile only, shows when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Sidebar — slides in on mobile, always visible on desktop */}
        <div
          className={`
            fixed top-0 left-0 h-full z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10
          `}
        >
          {/* Close button inside sidebar on mobile */}
          <button
            className="absolute top-4 right-4 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>

          <Sidebar activeItem="Find Gigs" />
        </div>
        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">

          {/* Breadcrumb */}
          <Breadcrumb crumbs={[
                      { label: "Dashboard", path: "/creative/dashboard" },
                      {label: "Find Gigs", path: "/creative/find-gigs"},
                      { label: category },
                    ]} />

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-5">Find Gigs</h1>

          {/* Search + Filter */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
              <SlidersHorizontal size={15} className="text-red-400" />
              Filter By
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 mb-7 flex-wrap">
            {filterChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setActiveChip(chip)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeChip === chip
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Services */}
          <div className="mb-8 bg-[#fafafa] p-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Services ({findGigsServices.length})
            </h2>
            <div className="flex gap-3.5 overflow-x-auto pb-1 scroll-smooth">
              {findGigsServices.map((service) => (
                <div key={service.label} className="relative rounded-lg overflow-hidden h-[300px] flex-shrink-0 cursor-pointer group">
                  <img src={service.bg} alt={service.label} className="w-[300px] h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute bottom-0 left-0 right-0 h-[20%] flex items-center justify-center px-3 bg-[#1c1c3a]">
                    <p className="text-white font-semibold text-sm">{service.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All gigs */}
          <div className="bg-[#fafafa] p-6">
            <h2 className="text-3xl font-bold text-black mb-4">
              All ({filteredGigs.length})
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGigs.map((gig) => (
                <div key={gig.id} className="bg-white border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="relative h-36 bg-gray-100 overflow-hidden">
                    <img src={gig.image} alt={gig.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {gig.isPremium && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Premium</span>
                    )}
                  </div>
                  <div className="p-3">
                    <span className="inline-block bg-gray-200 text-black text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5">{gig.category}</span>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{gig.title}</h4>
                    <p className="text-xs text-black mb-0.5">Budget: {gig.budget}</p>
                    <p className="text-xs text-black mb-0.5">Timeline: {gig.timeline}</p>
                    <p className="text-xs text-black mb-2 truncate">Desc: {gig.description}</p>
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="text-xs text-black">Posted by:</span>
                      <img src={gig.postedBy.avatar} alt={gig.postedBy.name} className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-xs font-medium text-black truncate">{gig.postedBy.name}</span>
                      {gig.postedBy.verified && <BadgeCheck fill="blue" stroke="white" size={12} className="text-blue-500 flex-shrink-0" />}
                    </div>
                    <button className="w-full bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                      Pitch Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default CategoryGigsPage;