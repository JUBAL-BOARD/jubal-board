import { apiRequest } from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      userType: "CLIENT" | "CREATIVE";
      accountType: string;
      profileStatus: string;
      kycStatus: string;
      isEmailVerified: boolean;
      isActive: boolean;
    };
  };
}
export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export async function loginUser(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registerUser(payload: RegisterPayload) {
  return apiRequest("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyEmail(payload: VerifyEmailPayload) {
  return apiRequest<LoginResponse>("/api/v1/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resendVerification(email: string) {
  return apiRequest("/api/v1/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}