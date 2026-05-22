import { useState, useEffect, useCallback } from "react";
import { FavoriteCreative } from "@/app/data/favoritesData";

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteCreative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Step 1: get list of favorited IDs
      const favRes = await fetch("/api/v1/favorites", {
        headers,
        credentials: "include",
      });
      if (!favRes.ok) throw new Error("Failed to fetch favorites");
      const favJson = await favRes.json();
      const favList: { id: string; targetId: string }[] =
        Array.isArray(favJson.data) ? favJson.data : [];

      if (favList.length === 0) {
        setFavorites([]);
        return;
      }

      // Step 2: fetch each creative's public profile using targetId
      const profiles = await Promise.all(
        favList.map(async (fav) => {
          try {
            const res = await fetch(
              `/api/v1/creatives/${fav.targetId}/public-profile`,
              { headers, credentials: "include" }
            );
            if (!res.ok) return null;
            const json = await res.json();
            const c = json.data ?? json;

            const name = c.name ?? "Creative";
            const avatar =
              c.avatarUrl ??
              `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a2e&color=fff&size=128`;

            // get rate from first service if available
            const rate = c.services?.[0]
              ? `$${c.services[0].priceFrom.toLocaleString()}`
              : "—";

            return {
              id: fav.targetId,         // keep as string — update your interface
              name,
              role: c.categoriesOfInterest?.[0]?.name ?? "Creative",
              avatar,
              rating: c.averageRating ?? 0,
              rate,
              completedProjects: c.completedProjects ?? 0,
              online: c.isOnline ?? false,
              verified: c.isPremium ?? false,
            } as unknown as FavoriteCreative;
          } catch {
            return null;
          }
        })
      );

      setFavorites(profiles.filter(Boolean) as FavoriteCreative[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return { favorites, loading, error, refetch: fetchFavorites };
}