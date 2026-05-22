import { useState, useEffect } from "react";

export type ClientProfileData = {
  id: string;
  fullName: string;
  email: string;
  preferredCommunication: string;
  languagePreference: string;
  isHighValue: boolean;
  avatarUrl: string;
};

export const useClientProfile = () => {
  const [profile, setProfile] = useState<ClientProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        if (!tokenRes.ok) throw new Error("Authentication failed.");
        const { token } = await tokenRes.json();
        if (!token) throw new Error("No auth token found.");

        const res = await fetch("/api/v1/clients/me", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        if (!res.ok) throw new Error(`Failed to fetch profile. Status: ${res.status}`);

        const json = await res.json();
        const data = json.data ?? json;
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading, error };
};