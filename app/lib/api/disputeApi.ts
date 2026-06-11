import { apiRequest } from "@/app/lib/api";

export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED";

export interface Dispute {
  id: string;
  projectId: string;
  status: DisputeStatus;
  issueType: string;
  description: string;
  preferredOutcome?: string;
  reason?: string;
  details?: string;
  createdAt: string;
  updatedAt?: string;
  evidenceUrls?: string[];
}

export interface DisputeDetail extends Dispute {
  reason: string;
  details: string;
  evidenceUrls: string[];
}

export interface RaiseDisputePayload {
  projectId: string;
  issueType: string;
  description: string;
  preferredOutcome?: string;
  evidenceFiles?: File[];
}

export interface UpdateDisputePayload {
  additionalNotes?: string;
  evidenceFiles?: File[];
}

// ─── Token helper ─────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const res = await fetch("/api/auth/session/token", { credentials: "include" });
  const { token } = await res.json();
  if (!token) throw new Error("No authorization token found.");
  return token;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchMyDisputes(): Promise<Dispute[]> {
  const token = await getToken();
  const res = await apiRequest<any>("/api/v1/disputes/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const disputes = (res.data?.data ?? res.data ?? []).map((d: any) => ({
    ...d,
    evidenceUrls: d.evidenceFiles,
  }));
  return disputes;
}

export async function fetchDisputeById(id: string): Promise<DisputeDetail> {
  const token = await getToken();
  const res = await apiRequest<any>(`/api/v1/disputes/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = res.data?.data ?? res.data;
  return { ...data, evidenceUrls: data.evidenceFiles };
}

export async function raiseDispute(payload: RaiseDisputePayload): Promise<Dispute> {
  const token = await getToken();
  const form = new FormData();
  form.append("projectId", payload.projectId);
  form.append("issueType", payload.issueType);
  form.append("description", payload.description);
  if (payload.preferredOutcome) form.append("preferredOutcome", payload.preferredOutcome);
  payload.evidenceFiles?.forEach((file) => form.append("evidenceFiles", file));

  const res = await fetch("/api/v1/disputes", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to raise dispute");
  return data?.data ?? data;
}

export async function updateDispute(
  id: string,
  payload: UpdateDisputePayload
): Promise<void> {
  const token = await getToken();
  const form = new FormData();
  if (payload.additionalNotes) form.append("additionalNotes", payload.additionalNotes);
  payload.evidenceFiles?.forEach((file) => form.append("evidenceFiles", file));

  const res = await fetch(`/api/v1/disputes/${id}/update`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
    body: form,
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.message || "Failed to update dispute");
  }
}