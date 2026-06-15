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
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, activePercent: 0 });
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
      const list = Array.isArray(json.data?.clients) ? json.data.clients : [];
      const statsData = json.data?.stats ?? {};

      const mapped: ClientFamMember[] = list.map((c: any) => ({
        id: c.clientId,
        name: c.name ?? "Unknown",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name ?? "C")}&background=1a1a2e&color=fff&size=64`,
        totalProjects: c.totalProjectsTogether ?? 0,
        language: c.language ?? "English",
        preferredCommunication: c.preferredCommunication ?? "Chat",
        country: c.country ?? null,
        lastProjectDate: c.lastProjectDate ?? null,
      }));
      console.log("mapped clients:", mapped.map(c => ({ id: c.id, name: c.name })));

      setClients(mapped);
      setStats({
        total: statsData.totalClientFam ?? 0,
        thisMonth: statsData.thisMonthNew ?? 0,
        activePercent: statsData.activeClientFamPercent ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleChat = async (clientId: string) => {
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      const res = await fetch(`/api/v1/client-fam/${clientId}/chat`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to open chat");
      const json = await res.json();
      console.log("chat response:", json);
      const conversationId = json.data?.conversationId ?? json.data?.id ?? json.conversationId;

      if (conversationId) {
        router.push(`/creative/messages/${conversationId}`);
      }
    } catch (err) {
      console.error("Chat failed:", err);
    }
  };

  const filtered = clients.filter((c) =>
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
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-5">Client Fam</h1>

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
            total={stats.total}
            thisMonth={stats.thisMonth}
            activePercent={stats.activePercent}
          />

          <div className="flex flex-col gap-4 overflow-hidden mt-6">
            {paginated.map((client, i) => (
              <ClientFamRow
                key={client.id}
                client={client}
                isLast={i === paginated.length - 1}
                onChat={() => handleChat(client.id)}
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