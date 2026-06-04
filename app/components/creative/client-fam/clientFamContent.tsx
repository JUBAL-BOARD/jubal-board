"use client";
import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import ClientFamStats from "./clientFamStats";
import ClientFamRow from "./clientFamRow";
import GigsPagination from "@/app/components/creative/my-gigs/gigsPagination";
import { ClientFamMember } from "@/app/types";

const ClientFamContent: React.FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [clients, setClients] = useState<ClientFamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      if (!token) {
        router.push("/signin");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const res = await fetch("/api/v1/client-fam", {
        credentials: "include",
        headers,
      });

      if (!res.ok) throw new Error(`Failed to fetch clients (${res.status})`);

      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data : [];

      // Fetch detail for each client
      const mapped: ClientFamMember[] = await Promise.all(
        list.map(async (c: any) => {
          try {
            const detailRes = await fetch(`/api/v1/client-fam/${c.id}`, {
              credentials: "include",
              headers,
            });

            if (!detailRes.ok) throw new Error("Detail fetch failed");
            const detailJson = await detailRes.json();
            const detail = detailJson.data;

            return {
              id: c.id,
              name: detail.companyName ?? c.name,
              avatar: `https://i.pravatar.cc/150?u=${c.id}`,
              totalProjects: detail.totalProjects ?? 0,
              language: detail.language ?? "English",
              preferredCommunication: detail.preferredCommunication ?? "Chat",
            };
          } catch {
            return {
              id: c.id,
              name: c.name,
              avatar: `https://i.pravatar.cc/150?u=${c.id}`,
              totalProjects: 0,
              language: "English",
              preferredCommunication: "Chat",
            };
          }
        })
      );

      setClients(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Stats — computed from data since API doesn't return them
  const total = clients.length;
  const thisMonth = 0; // API doesn't return this yet
  const activePercent = 0; // API doesn't return this yet

  return (
    <div>
      <Breadcrumb crumbs={[
        { label: "Dashboard", path: "/creative/dashboard" },
        { label: "Client Fam" },
      ]} />
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-5">Client Fam</h1>

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

      {loading && <p className="text-sm text-gray-400 text-center py-12">Loading clients…</p>}
      {error && <p className="text-sm text-red-500 text-center py-12">{error}</p>}

      {!loading && !error && (
        <>
          <ClientFamStats
            total={total}
            thisMonth={thisMonth}
            activePercent={activePercent}
          />

          <div className="flex flex-col gap-4 overflow-hidden mt-6">
            {paginated.map((client, i) => (
              <ClientFamRow
                key={client.id}
                client={client}
                isLast={i === paginated.length - 1}
              />
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-12">No clients found.</p>
            )}
          </div>

          <GigsPagination
            currentPage={page}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={(val) => { setPerPage(val); setPage(1); }}
          />
        </>
      )}
    </div>
  );
};

export default ClientFamContent;