import { useEffect, useState } from "react";

export type KycStatus = "UNVERIFIED" | "PENDING" | "PROVIDER_APPROVED" | "DECLINED" | null;

export const useKycStatus = () => {
  const [kycStatus, setKycStatus] = useState<KycStatus>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      const res = await fetch(
        '/api/v1/verification/status',
        { headers: { Authorization: `Bearer ${token}` }, credentials: "include" }
      );

      if (res.ok) {
        const json = await res.json();
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const contextType = `${userData.userType}_${userData.accountType}`;

        const dataArray = Array.isArray(json.data) ? json.data : [];
        console.log("dataArray:", dataArray);
        console.log("contextType:", contextType);
        console.log("matched entry:", dataArray.find((d: any) => d.contextType === contextType));
        const entry = dataArray.find((d: any) => d.contextType === contextType);

        const status = entry?.verificationStatus ?? "UNVERIFIED";
        setKycStatus(status);

        if (userData.kycStatus !== status) {
          userData.kycStatus = status;
          localStorage.setItem("userData", JSON.stringify(userData));
        }
      }
    } catch (e) {
      console.warn("Could not fetch KYC status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  return { kycStatus, loading, refetch: fetchStatus };
};