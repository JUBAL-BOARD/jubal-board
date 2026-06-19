export type CaseStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface SupportCaseDetail {
  id: string;
  caseNumber: string;
  caseType: string;
  status: CaseStatus;
  description: string;
  screenshotUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
}

const getHeaders = async () => {
  const tokenRes = await fetch("/api/auth/session/token");
  const { token } = await tokenRes.json();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// No dedicated GET /support/cases/:id endpoint exists yet (not in swagger).
// Stopgap: fetch the user's case list and find the matching id client-side.
export const fetchSupportCaseById = async (id: string): Promise<SupportCaseDetail> => {
  const headers = await getHeaders();
  const res = await fetch("/api/v1/support/cases/me", { credentials: "include", headers });

  if (!res.ok) {
    throw new Error(`Failed to load your reports (status ${res.status})`);
  }

  const json = await res.json();
  const cases: SupportCaseDetail[] = Array.isArray(json?.data) ? json.data : [];

  const match = cases.find((c) => c.id === id);
  if (!match) {
    throw new Error("Report not found");
  }

  return match;
};