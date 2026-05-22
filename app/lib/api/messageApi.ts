import { apiRequest } from "@/app/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatTopic {
  id: string;
  name: string;
  description: string;
  slaThresholdHours: number;
  isActive: boolean;
  createdAt: string;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface LastMessage {
  content: string;
  contentType: "TEXT" | "IMAGE" | "FILE";
  createdAt: string;
  senderId: string;
}

export interface Conversation {
  id: string;
  type: "DIRECT" | "GROUP";
  topic: { id: string; name: string };
  otherParticipant: ConversationParticipant;
  lastMessage: LastMessage | null;
  unreadCount: number;
  createdAt: string;
}

export interface ConversationsResponse {
  data: Conversation[];
  total: number;
  page: number;
  limit: number;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  contentType: "TEXT" | "IMAGE" | "FILE";
  fileUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationDetail {
  conversation: {
    id: string;
    type: "DIRECT" | "GROUP";
    topic: { id: string; name: string };
    participants: ConversationParticipant[];
    createdAt: string;
  };
  messages: {
    data: Message[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface SendMessagePayload {
  content: string;
  contentType: "TEXT" | "IMAGE" | "FILE";
  fileUrl?: string;
}

export interface CreateConversationPayload {
  recipientId: string;
  topicId: string;
  type: "DIRECT" | "GROUP";
}

// ─── Shared token helper ──────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const tokenRes = await fetch("/api/auth/session/token", {
    credentials: "include",
  });
  const { token } = await tokenRes.json();
  if (!token) throw new Error("No authorization token found.");
  return token;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchChatTopics(): Promise<ChatTopic[]> {
  const token = await getToken();
  const res = await apiRequest<any>("/api/v1/chat/topics", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.data || res.data;
}

export async function fetchConversations(params?: {
  type?: "DIRECT" | "GROUP";
  topicId?: string;
  page?: number;
  limit?: number;
}): Promise<ConversationsResponse> {
  const token = await getToken();
  const query = new URLSearchParams();
  if (params?.type) query.set("type", params.type);
  if (params?.topicId) query.set("topicId", params.topicId);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const res = await apiRequest<any>(
    `/api/v1/messages/conversations?${query.toString()}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data?.data || res.data;
}

export async function createConversation(
  payload: CreateConversationPayload
): Promise<{ id: string }> {
  const token = await getToken();
  const res = await apiRequest<any>("/api/v1/messages/conversations", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return res.data?.data || res.data;
}

export async function fetchConversationDetail(
  id: string,
  page = 1,
  limit = 30
): Promise<ConversationDetail> {
  const token = await getToken();
  const res = await apiRequest<any>(
    `/api/v1/messages/conversations/${id}?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data?.data || res.data;
}

export async function fetchGroupConversationDetail(
  id: string,
  page = 1,
  limit = 30
): Promise<ConversationDetail> {
  const token = await getToken();
  const res = await apiRequest<any>(
    `/api/v1/messages/conversations/${id}/group?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data?.data || res.data;
}

export async function sendMessage(
  conversationId: string,
  payload: SendMessagePayload
): Promise<Message> {
  const token = await getToken();
  const res = await apiRequest<any>(
    `/api/v1/messages/conversations/${conversationId}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }
  );
  return res.data?.data || res.data;
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  const token = await getToken();
  await apiRequest<any>(`/api/v1/messages/${messageId}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}