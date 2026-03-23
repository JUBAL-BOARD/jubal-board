"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import ClientFamStats from "./clientFamStats";
import ClientFamRow from "./clientFamRow";
import GigsPagination from "@/app/components/creative/my-gigs/gigsPagination";
import { clientFamList } from "@/app/data";

const ClientFamContent: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const filtered = clientFamList.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <Breadcrumb crumbs={[
        { label: "Dashboard", path: "/creative/dashboard" },
        { label: "Client Fam" },
      ]} />

      <h1 className="text-2xl font-bold text-gray-900 mb-5">Client Fam</h1>

      {/* Search */}
      <div className="relative mb-6 max-w-full">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all"
        />
      </div>

      {/* Stats */}
      <ClientFamStats
        total={clientFamList.length}
        thisMonth={5}
        activePercent={75}
      />

      {/* List */}
      <div className="flex flex-col gap-4 overflow-hidden mt-6">
        {paginated.map((client, i) => (
          <ClientFamRow
            key={client.id}
            client={client}
            isLast={i === paginated.length - 1}
          />
        ))}
      </div>

      {/* Pagination */}
      <GigsPagination
        currentPage={page}
        totalPages={totalPages}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={(val) => { setPerPage(val); setPage(1); }}
      />
    </div>
  );
};

export default ClientFamContent;