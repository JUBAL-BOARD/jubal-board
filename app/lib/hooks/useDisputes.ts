import { useEffect, useState } from "react";
import { fetchMyDisputes, Dispute } from "@/app/lib/api/disputeApi";

export function useDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchMyDisputes();
        setDisputes(data);
      } catch (err: any) {
        setError(err.message || "Failed to load disputes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { disputes, loading, error };
}