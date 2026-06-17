import { apiRequest } from "./api";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SecuritySettings {
  loginAlertsEnabled: boolean;
  sessionTimeoutEnabled: boolean;
  sessionTimeoutDuration: number;
}

export interface SecuritySettingsResponse {
  success: boolean;
  message: string;
  data: SecuritySettings;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailPayload {
  newEmail: string;
}

export interface EmailChangeStatusResponse {
  success: boolean;
  data: {
    status: "PENDING" | "VERIFIED" | "NONE";
    newEmail?: string;
  };
}

export interface DeactivateResponse {
  success: boolean;
  message: string;
}

export interface UpdateSecurityPayload {
  loginAlertsEnabled?: boolean;
  sessionTimeoutEnabled?: boolean;
  sessionTimeoutDuration?: number;
}

// ── Password ───────────────────────────────────────────────────────────────

export async function changePassword(payload: ChangePasswordPayload) {
  return apiRequest("/api/v1/users/me/settings/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ── Email ──────────────────────────────────────────────────────────────────

export async function requestEmailChange(payload: ChangeEmailPayload) {
  return apiRequest("/api/v1/users/me/settings/email-change", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getEmailChangeStatus() {
  return apiRequest<EmailChangeStatusResponse>(
    "/api/v1/users/me/settings/email-change/status"
  );
}

// ── Security Settings ──────────────────────────────────────────────────────

export async function getSecuritySettings() {
  return apiRequest<SecuritySettingsResponse>(
    "/api/v1/account/security-settings"
  );
}

export async function updateSecuritySettings(payload: UpdateSecurityPayload) {
  return apiRequest("/api/v1/users/me/settings/notifications", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ── Account Actions ────────────────────────────────────────────────────────

export async function deactivateAccount() {
  return apiRequest<DeactivateResponse>(
    "/api/v1/users/me/settings/deactivate",
    { method: "POST" }
  );
}